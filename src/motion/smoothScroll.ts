import type Lenis from 'lenis'
import {
  GSAP_LAG_SMOOTHING_ADJUSTED_MS,
  GSAP_LAG_SMOOTHING_DISABLED,
  GSAP_LAG_SMOOTHING_THRESHOLD_MS,
  LENIS_ANCHORS,
  LENIS_AUTO_RAF,
  LENIS_GESTURE_ORIENTATION,
  LENIS_LERP,
  LENIS_MS_PER_SECOND,
  LENIS_ORIENTATION,
  LENIS_OVERSCROLL,
  LENIS_PREVENT_ATTRIBUTE,
  LENIS_SMOOTH_WHEEL,
  LENIS_SYNC_TOUCH,
  LENIS_WHEEL_MULTIPLIER,
  MEDIA_QUERY_CAN_PIN,
  SMOOTH_SCROLL_TEARDOWN_DELAY_MS,
} from 'constants/index'
import { getDeviceTier, prefersReducedMotion } from 'shared/lib'
import { gsap, ScrollTrigger } from './gsapClient'
import { registerScrollLockDriver } from './scrollLock'

/* Lenis, wired to gsap.ticker, StrictMode-safe.

   WHY NOT scrollerProxy. scrollerProxy exists for smooth scrollers that TRANSFORM A
   WRAPPER element (Locomotive's default), or for a Lenis instance given a custom
   wrapper/content. Default Lenis drives real window.scrollY, so ScrollTrigger's normal
   window scroller already reads correct values. Adding scrollerProxy would mean
   re-implementing scrollTop, getBoundingClientRect and pinType by hand for no benefit,
   and it risks forcing pinType: 'transform', which is materially worse for the pinned
   wall (a transformed pin container breaks position: fixed children).

   WHY NOT ScrollSmoother or Locomotive. Both transform a wrapper, which forces
   pinType: 'transform' and breaks fixed pinning for the same reason.

   WHY NOT ScrollTrigger.normalizeScroll(). It hijacks the same wheel and touch events
   Lenis owns. Enabling both is the single most common Lenis-plus-GSAP failure report.

   FOUR DEFENCES AGAINST STRICTMODE DOUBLE-INVOCATION, all needed together:
     the module singleton   two Lenis instances double-apply wheel deltas, so the page
                            scrolls at 2x, which is the classic symptom
     the refcount           mount/unmount/mount is 1 -> 0 -> 1, teardown only at 0
     the deferred teardown  the synchronous pair never actually destroys and rebuilds
     async cancellation     cleanup can run before import('lenis') resolves */

let instance: Lenis | null = null
let refCount = 0
let teardown: (() => void) | null = null
let scheduledTeardown = 0

export const getLenis = (): Lenis | null => instance

/**
 * Three conditions, and each one removes bytes as well as behaviour: reduced motion and
 * low-tier devices and phones never even download the Lenis chunk, because the dynamic
 * import sits after this guard.
 */
export const shouldUseSmoothScroll = (): boolean =>
  !prefersReducedMotion() && getDeviceTier() === 'high' && window.matchMedia(MEDIA_QUERY_CAN_PIN).matches

export const acquireSmoothScroll = async (): Promise<() => void> => {
  refCount += 1
  window.clearTimeout(scheduledTeardown) // a re-mount cancels a pending teardown

  if (!shouldUseSmoothScroll()) return releaseSmoothScroll
  if (instance) return releaseSmoothScroll

  // Lazy, and after the guard: never downloaded by reduced-motion, low-tier or mobile.
  const { default: LenisCtor } = await import('lenis')

  // The effect may have been cleaned up while that import was in flight.
  if (refCount === 0 || instance) return releaseSmoothScroll

  const lenis = new LenisCtor({
    lerp: LENIS_LERP,
    orientation: LENIS_ORIENTATION,
    gestureOrientation: LENIS_GESTURE_ORIENTATION,
    smoothWheel: LENIS_SMOOTH_WHEEL,
    syncTouch: LENIS_SYNC_TOUCH,
    wheelMultiplier: LENIS_WHEEL_MULTIPLIER,
    autoRaf: LENIS_AUTO_RAF,
    anchors: LENIS_ANCHORS,
    overscroll: LENIS_OVERSCROLL,
    prevent: node => node.hasAttribute(LENIS_PREVENT_ATTRIBUTE),
  })
  instance = lenis

  // 1 - ScrollTrigger reads Lenis' position on every Lenis frame.
  const onLenisScroll = (): void => {
    ScrollTrigger.update()
  }
  lenis.on('scroll', onLenisScroll)

  /* 2 - ONE rAF for the entire app: GSAP's ticker drives Lenis. This is what puts
     scroll and tweens on the same clock, and it is what stops the pinned scrub
     micro-jittering: two independent rAF loops sample at slightly different times, so
     the track's transform and the scroll position disagree by a fraction of a frame. */
  const onTick = (time: number): void => {
    lenis.raf(time * LENIS_MS_PER_SECOND)
  }
  gsap.ticker.add(onTick)

  /* 3 - Kill lag smoothing. After a long task GSAP would otherwise fabricate a
     catch-up delta, desyncing Lenis from ScrollTrigger, which is visible as the pinned
     track snapping. */
  gsap.ticker.lagSmoothing(GSAP_LAG_SMOOTHING_DISABLED)

  /* 4 - Lenis must be re-measured immediately BEFORE every refresh, never after: its
     scroll limit has to be correct before ScrollTrigger derives positions from it.
     Registered once, here, so no call site can get the order wrong and lenis.resize()
     is never called by hand anywhere else. */
  const onRefreshInit = (): void => {
    lenis.resize()
  }
  ScrollTrigger.addEventListener('refreshInit', onRefreshInit)

  /* 5 - Hand Lenis to the single-sourced scroll lock. It inherits the current lock
     state, so it starts stopped during the preloader with no extra call site. */
  registerScrollLockDriver({ stop: () => lenis.stop(), start: () => lenis.start() })
  ScrollTrigger.refresh()

  teardown = () => {
    registerScrollLockDriver(null)
    ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
    gsap.ticker.remove(onTick)
    gsap.ticker.lagSmoothing(GSAP_LAG_SMOOTHING_THRESHOLD_MS, GSAP_LAG_SMOOTHING_ADJUSTED_MS)
    lenis.off('scroll', onLenisScroll)
    lenis.destroy()
    instance = null
    teardown = null
  }

  return releaseSmoothScroll
}

export const releaseSmoothScroll = (): void => {
  refCount = Math.max(0, refCount - 1)
  if (refCount > 0) return

  scheduledTeardown = window.setTimeout(() => {
    if (refCount === 0) teardown?.()
  }, SMOOTH_SCROLL_TEARDOWN_DELAY_MS)
}
