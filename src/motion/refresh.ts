import { onAppPhase } from 'features/preloader'
import { ScrollTrigger } from './gsapClient'

/* THE REFRESH POLICY, and the deliberate absence of a resize listener.

   There is exactly one refresh chain, and it is registered once:

     refresh trigger (phase 'ready' / fonts / a track ResizeObserver)
       -> ScrollTrigger fires 'refreshInit'
            -> lenis.resize()     ALWAYS first, registered inside smoothScroll.ts.
                                  Lenis' scroll limit has to be correct before
                                  ScrollTrigger derives positions from it.
       -> ScrollTrigger recomputes starts and ends, re-evaluates function values,
          rebuilds pin-spacers
       -> ScrollTrigger fires 'refresh'

   NO `window.addEventListener('resize', ...)` ANYWHERE. Three reasons, each on its own
   sufficient:

   1. gsap.matchMedia() already IS the resize contract. Crossing 768 or 1024 reverts the
      old context and builds the new one, which is what makes a live drag-resize clean
      instead of leaving orphaned pins and pin-spacers behind.
   2. ScrollTrigger refreshes itself on resize already, and `ignoreMobileResize: true`
      (set in initMotion) deliberately suppresses the mobile URL-bar case, where resize
      fires with a height-only delta. A hand-rolled listener would undo that and make
      pins visibly jump mid-scroll.
   3. What actually goes stale is not the window size but the horizontal track's
      measured width, and a ResizeObserver on that element is both narrower and more
      accurate than inferring it from the viewport.

   This replaces the pattern it is a reaction to: a `setTimeout(600)` after load, which
   is a guess at when layout settles, and silently wrong on a slow font load. */

/**
 * Never refresh mid-momentum. A refresh while Lenis still has inertia in flight lands
 * the visitor inside the momentum curve and the pin visibly jumps, so this defers to
 * ScrollTrigger's own `scrollEnd`. Also never call refresh from inside a Lenis `scroll`
 * callback: that is a re-entrant refresh during scroll.
 */
export const refreshWhenIdle = (): void => {
  if (!ScrollTrigger.isScrolling()) {
    ScrollTrigger.refresh()
    return
  }
  ScrollTrigger.addEventListener('scrollEnd', function once() {
    ScrollTrigger.removeEventListener('scrollEnd', once)
    ScrollTrigger.refresh()
  })
}

/**
 * Registers the refresh triggers. Called once from the app shell.
 *
 * The 'ready' phase is the important one: it means layout is final and the page is
 * unlocked but still covered by the curtain, which is the only moment ScrollTrigger can
 * measure a settled page without the visitor seeing the measurement.
 */
export const initRefreshPolicy = (): (() => void) => {
  const stopPhase = onAppPhase('ready', () => ScrollTrigger.refresh())

  /* Fonts change text metrics, which changes every element's height, which changes
     every trigger position. `document.fonts.ready` is awaited in the asset manifest
     too, but a face can still resolve later (a lazy subset, a cached miss), so this
     stays as a second, cheap safety net. */
  let cancelled = false
  void document.fonts.ready.then(() => {
    if (!cancelled) refreshWhenIdle()
  })

  return () => {
    cancelled = true
    stopPhase()
  }
}

/**
 * Watches the horizontal track's width, which is what the pinned wall's scroll distance
 * is derived from. Card content reflowing (a font swap, a wrapped label) changes this
 * without changing the viewport at all, which is precisely the case a resize listener
 * would miss.
 */
export const observeTrackWidth = (track: Element, onChange: () => void): (() => void) => {
  let lastWidth = track.getBoundingClientRect().width

  const observer = new ResizeObserver(entries => {
    const entry = entries[0]
    if (!entry) return

    const width = entry.contentRect.width
    // Sub-pixel jitter fires this observer without anything meaningful changing.
    if (Math.abs(width - lastWidth) < 1) return

    lastWidth = width
    onChange()
  })

  observer.observe(track)
  return () => observer.disconnect()
}
