/* One named constant per Lenis option; `duration`/`easing` are deliberately unset since both are mutually exclusive with `lerp`. */

/** Framerate-independent catch-up ratio. Composes predictably with ScrollTrigger scrub. */
export const LENIS_LERP = 0.08

export const LENIS_ORIENTATION = 'vertical' as const
/** Guarantees Lenis ignores horizontal swipes, so the mobile card rail keeps its gesture. */
export const LENIS_GESTURE_ORIENTATION = 'vertical' as const

/** The entire reason Lenis is here: reconciling trackpad and notched-wheel granularity. */
export const LENIS_SMOOTH_WHEEL = true

/** OFF: syncTouch loses OS momentum on Android and fights iOS rubber-banding. Native touch scrolling is already good. */
export const LENIS_SYNC_TOUCH = false

/** Higher overshoots the pinned rail per notch; lower feels sticky. */
export const LENIS_WHEEL_MULTIPLIER = 1

/** GSAP's ticker owns the single rAF for the whole app. */
export const LENIS_AUTO_RAF = false

/** No in-page navigation in this build: the brief forbids working nav. */
export const LENIS_ANCHORS = false

/** Stops nested-instance overscroll leaking to the page. */
export const LENIS_OVERSCROLL = false

/** Excludes the mobile swipe rail so it scrolls natively inside a smooth-scrolled page. */
export const LENIS_PREVENT_ATTRIBUTE = 'data-lenis-prevent'

/** gsap.ticker reports SECONDS; lenis.raf expects MILLISECONDS. */
export const LENIS_MS_PER_SECOND = 1000

/** Deferred by one macrotask so StrictMode's mount/unmount/mount does not thrash. */
export const SMOOTH_SCROLL_TEARDOWN_DELAY_MS = 0
