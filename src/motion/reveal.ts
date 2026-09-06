import {
  DISTANCE_REVEAL_Y,
  DISTANCE_REVEAL_Y_LG,
  DURATION_LG,
  EASE_OUT_QUINT,
  REDUCED_MOTION_DURATION,
  REDUCED_MOTION_EASE,
  REVEAL_BATCH_INTERVAL,
  REVEAL_BATCH_MAX,
  SCROLL_TRIGGER_START_REVEAL,
  STAGGER_CARDS,
} from 'constants/index'
import { gsap, ScrollTrigger } from './gsapClient'
import { addMotionMedia, motionMedia } from './motionMedia'

/* ONE batch for every [data-reveal] element on the page.

   ScrollTrigger.batch collects elements whose triggers fire within `interval` seconds
   of each other and animates them as a group, so a page with forty reveals creates one
   batch rather than forty independent triggers, and neighbouring elements stagger
   together instead of each popping on its own schedule.

   `once: true` is deliberate: a reveal that replays on every scroll-back is a
   distraction, and killing the trigger after it fires leaves the page with no live
   scroll listeners for content that has already been read. */

const REVEAL_SELECTOR = '[data-reveal]'
const DISTANCE_ATTRIBUTE = 'revealDistance'

const distanceFor = (element: HTMLElement): number =>
  element.dataset[DISTANCE_ATTRIBUTE] === 'lg' ? DISTANCE_REVEAL_Y_LG : DISTANCE_REVEAL_Y

/**
 * Registers the reveal system. Returns a teardown.
 *
 * Reduced motion is handled inside the same gsap.matchMedia contract every section hook
 * uses, so it cannot be forgotten here either: the reduce branch fades opacity only,
 * with no travel and a fifth of the duration.
 */
export const initReveals = (scope: Element): (() => void) => {
  const media = motionMedia()

  addMotionMedia(media, scope, flags => {
    const elements = gsap.utils.toArray<HTMLElement>(REVEAL_SELECTOR)
    if (elements.length === 0) return

    if (flags.reduce) {
      /* No triggers at all in this branch. Content is simply present, faded in once,
         which is both the accessible answer and strictly less work. */
      gsap.to(elements, { autoAlpha: 1, duration: REDUCED_MOTION_DURATION, ease: REDUCED_MOTION_EASE })
      return
    }

    // Set the travel start here rather than in CSS: only the opacity needs to be correct
    // before the first paint, and CSS cannot express the per-element distance.
    elements.forEach(element => gsap.set(element, { y: distanceFor(element) }))

    /* Correctness does not depend on a callback being throttled: initMotion leaves
       ScrollTrigger's `limitCallbacks` off precisely so this onEnter still fires when
       the scroll position jumps past the whole trigger in one tick (a deep link, a
       find-in-page jump). See the note in motion/initMotion.ts. */
    ScrollTrigger.batch(elements, {
      interval: REVEAL_BATCH_INTERVAL,
      batchMax: REVEAL_BATCH_MAX,
      start: SCROLL_TRIGGER_START_REVEAL,
      once: true,
      onEnter: batch =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: DURATION_LG,
          ease: EASE_OUT_QUINT,
          stagger: STAGGER_CARDS,
          overwrite: true,
          // perf: release the promoted layer as soon as the tween is done. A permanently
          // promoted layer is a memory cost, not an optimisation.
          onComplete: () => gsap.set(batch, { willChange: 'auto' }),
        }),
    })
  })

  return () => media.revert()
}
