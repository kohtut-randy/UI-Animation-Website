import {
  MEDIA_QUERY_CAN_HOVER,
  MEDIA_QUERY_CAN_PIN,
  MEDIA_QUERY_DESKTOP,
  MEDIA_QUERY_MOBILE,
  MEDIA_QUERY_MOTION,
  MEDIA_QUERY_REDUCE,
  MEDIA_QUERY_TABLET,
} from 'constants/index'
import type { MediaFlags } from 'shared/types'
import { prefersReducedMotion } from 'shared/lib/reducedMotion'
import { gsap } from './gsapClient'

/* gsap.matchMedia() is both the reduced-motion and resize strategy (no resize listener exists anywhere): it runs one callback per matching condition set and reverts cleanly on change. */

const CONDITIONS = {
  isMobile: MEDIA_QUERY_MOBILE,
  isTablet: MEDIA_QUERY_TABLET,
  isDesktop: MEDIA_QUERY_DESKTOP,
  canPin: MEDIA_QUERY_CAN_PIN,
  motion: MEDIA_QUERY_MOTION,
  reduce: MEDIA_QUERY_REDUCE,
  canHover: MEDIA_QUERY_CAN_HOVER,
} as const

export type MotionMediaHandler = (flags: MediaFlags, context: gsap.Context) => void | (() => void)

export const motionMedia = (): gsap.MatchMedia => gsap.matchMedia()

/**
 * One add() with all seven conditions, so every section hook has the identical shape
 * and reduced motion cannot be forgotten. The handler branches on the flags and may
 * return a cleanup for raw DOM listeners; GSAP reverts its own tweens.
 */
export const addMotionMedia = (media: gsap.MatchMedia, scope: Element, handler: MotionMediaHandler): void => {
  media.add(
    CONDITIONS,
    context => {
      const flags = context.conditions as MediaFlags
      const reduce = prefersReducedMotion()
      return handler({ ...flags, motion: !reduce, reduce }, context)
    },
    scope,
  )
}
