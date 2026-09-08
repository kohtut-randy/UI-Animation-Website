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

/* Lenis, wired to gsap.ticker, StrictMode-safe. No scrollerProxy/ScrollSmoother/Locomotive (all force pinType: 'transform', which breaks fixed-position pin children) and no ScrollTrigger.normalizeScroll() (fights Lenis for the same wheel/touch events).

   Double-invocation defences: module singleton (two instances would double-apply wheel deltas), a refcount (mount/unmount/mount is 1->0->1, teardown only at 0), a deferred teardown, and async cancellation for a cleanup that runs before import('lenis') resolves. */

let instance: Lenis | null = null
let refCount = 0
let teardown: (() => void) | null = null
let scheduledTeardown = 0

export const getLenis = (): Lenis | null => instance

/** Reduced motion, low-tier devices and phones never even download the Lenis chunk: the dynamic import sits after this guard. */
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

  // 2 - One rAF for the app: GSAP's ticker drives Lenis, keeping scroll and tweens on the same clock (avoids pinned-scrub micro-jitter from two independent rAF loops).
  const onTick = (time: number): void => {
    lenis.raf(time * LENIS_MS_PER_SECOND)
  }
  gsap.ticker.add(onTick)

  // 3 - Kill lag smoothing: otherwise GSAP fabricates a catch-up delta after a long task, desyncing Lenis from ScrollTrigger.
  gsap.ticker.lagSmoothing(GSAP_LAG_SMOOTHING_DISABLED)

  // 4 - Re-measure Lenis immediately before every refresh (never after); registered once so no call site can get the order wrong.
  const onRefreshInit = (): void => {
    lenis.resize()
  }
  ScrollTrigger.addEventListener('refreshInit', onRefreshInit)

  // 5 - Hand Lenis to the single-sourced scroll lock; it inherits the current lock state.
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
