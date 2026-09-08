import { onAppPhase } from 'features/preloader'
import { ScrollTrigger } from './gsapClient'

/* THE REFRESH POLICY: one chain, registered once (phase 'ready' -> lenis.resize() -> ScrollTrigger.refresh()), and no window resize listener anywhere. gsap.matchMedia already owns the resize contract, ScrollTrigger's own ignoreMobileResize handles the URL-bar case, and what actually goes stale is the track width, which observeTrackWidth watches directly. */

/** Defers to ScrollTrigger's own `scrollEnd`: refreshing mid-momentum makes the pin visibly jump. */
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

/** Registers the refresh triggers, called once from the app shell; 'ready' means layout is final but still behind the curtain. */
export const initRefreshPolicy = (): (() => void) => {
  const stopPhase = onAppPhase('ready', () => ScrollTrigger.refresh())

  // Second, cheap safety net: a font face can resolve later than document.fonts.ready implies.
  let cancelled = false
  void document.fonts.ready.then(() => {
    if (!cancelled) refreshWhenIdle()
  })

  return () => {
    cancelled = true
    stopPhase()
  }
}

/** Watches the horizontal track's width, which the pinned wall's scroll distance derives from; a reflow can change this without a viewport resize. */
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
