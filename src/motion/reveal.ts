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

/* One ScrollTrigger.batch for every [data-reveal] element: neighbours stagger together instead of firing on independent triggers. `once: true` since a reveal that replays on scroll-back is a distraction. */

const REVEAL_SELECTOR = '[data-reveal]'
const DISTANCE_ATTRIBUTE = 'revealDistance'

const distanceFor = (element: HTMLElement): number =>
  element.dataset[DISTANCE_ATTRIBUTE] === 'lg' ? DISTANCE_REVEAL_Y_LG : DISTANCE_REVEAL_Y

/** Registers the reveal system; reduced motion fades opacity only, no travel, via the shared gsap.matchMedia contract. */
export const initReveals = (scope: Element): (() => void) => {
  const media = motionMedia()

  addMotionMedia(media, scope, flags => {
    const elements = gsap.utils.toArray<HTMLElement>(REVEAL_SELECTOR)
    if (elements.length === 0) return

    if (flags.reduce) {
      // Accessible answer and strictly less work: content just fades in once, no triggers.
      gsap.to(elements, { autoAlpha: 1, duration: REDUCED_MOTION_DURATION, ease: REDUCED_MOTION_EASE })
      return
    }

    // Set the travel start here rather than in CSS: only the opacity needs to be correct
    // before the first paint, and CSS cannot express the per-element distance.
    elements.forEach(element => gsap.set(element, { y: distanceFor(element) }))

    /* limitCallbacks stays off (see motion/initMotion.ts) so onEnter still fires when scroll jumps past the whole trigger in one tick. */
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
