import { useRef } from 'react'
import type { RefObject } from 'react'
import {
  DISTANCE_HERO_FOREGROUND_Y,
  DISTANCE_HERO_MIST_X,
  DISTANCE_HERO_SCENE_Y,
  DISTANCE_PARALLAX_Y,
  DURATION_LG,
  DURATION_MD,
  DURATION_SM,
  DURATION_XL,
  HERO_STORY_SCROLL_DURATION,
  EASE_LINEAR,
  EASE_OUT_QUINT,
  EASE_OUT_STRONG,
  HERO_SCENE_END_SCALE,
  HERO_SCENE_START_SCALE,
  REDUCED_MOTION_DURATION,
  REDUCED_MOTION_EASE,
  REDUCED_MOTION_STAGGER,
  SCROLL_TRIGGER_END_EXIT,
  SCROLL_TRIGGER_START_PIN,
  SCRUB_SOFT,
  STAGGER_BASE,
  STAGGER_WORDS,
} from 'constants/index'
import { onAppPhase } from 'features/preloader'
import { gsap, useGSAP } from 'motion/gsapClient'
import { addMotionMedia, motionMedia } from 'motion/motionMedia'
import { getLenis } from 'motion/smoothScroll'

const SELECTOR = {
  eyebrow: '[data-hero-eyebrow]',
  line: '[data-reveal-line]',
  lede: '[data-hero-lede]',
  cta: '[data-hero-cta]',
  scene: '[data-hero-scene]',
  image: '[data-hero-image]',
  content: '[data-hero-content]',
  mist: '[data-hero-mist]',
  foreground: '[data-hero-foreground]',
} as const

const advanceToStory = (): void => {
  const story = document.querySelector<HTMLElement>('#story')
  if (!story) return

  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(story, { duration: HERO_STORY_SCROLL_DURATION })
    return
  }

  story.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export const useHeroMotion = (): RefObject<HTMLElement | null> => {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const media = motionMedia()

      addMotionMedia(media, scope.current!, (flags, context) => {
        const pick = <T extends Element>(selector: string): T[] => (context.selector?.(selector) ?? []) as T[]
        const one = <T extends Element>(selector: string): T | undefined => pick<T>(selector)[0]
        const lines = pick<HTMLElement>(SELECTOR.line)
        const copy = [...pick(SELECTOR.eyebrow), ...pick(SELECTOR.lede), ...pick(SELECTOR.cta)]
        const scene = one<HTMLElement>(SELECTOR.scene)
        const image = one<HTMLElement>(SELECTOR.image)
        const content = one<HTMLElement>(SELECTOR.content)
        const mist = one<HTMLElement>(SELECTOR.mist)
        const foreground = one<HTMLElement>(SELECTOR.foreground)

        if (flags.reduce) {
          gsap.set([...lines, ...copy], { autoAlpha: 1, y: 0, clearProps: 'transform' })
          gsap.from([...lines, ...copy], {
            autoAlpha: 0,
            duration: REDUCED_MOTION_DURATION,
            ease: REDUCED_MOTION_EASE,
            stagger: REDUCED_MOTION_STAGGER,
            onComplete: advanceToStory,
          })
          return
        }

        const entrance = gsap.timeline({ paused: true, onComplete: advanceToStory })
        if (image)
          entrance.fromTo(
            image,
            { scale: HERO_SCENE_START_SCALE },
            { scale: HERO_SCENE_END_SCALE, duration: DURATION_XL, ease: EASE_OUT_QUINT },
            0,
          )
        entrance
          .to(lines, { y: 0, duration: DURATION_XL, ease: EASE_OUT_QUINT, stagger: STAGGER_WORDS }, DURATION_SM)
          .from(pick(SELECTOR.eyebrow), { autoAlpha: 0, y: DISTANCE_PARALLAX_Y, duration: DURATION_MD, ease: EASE_OUT_STRONG }, DURATION_SM)
          .from(
            copy.slice(1),
            { autoAlpha: 0, y: DISTANCE_PARALLAX_Y, duration: DURATION_LG, ease: EASE_OUT_STRONG, stagger: STAGGER_BASE },
            DURATION_MD,
          )

        const stopPhase = onAppPhase('entered', () => entrance.play())
        const scroll = { trigger: scope.current, start: SCROLL_TRIGGER_START_PIN, end: SCROLL_TRIGGER_END_EXIT, scrub: SCRUB_SOFT }

        if (scene) gsap.to(scene, { y: DISTANCE_HERO_SCENE_Y, scale: HERO_SCENE_START_SCALE, ease: EASE_LINEAR, scrollTrigger: scroll })
        if (mist) gsap.to(mist, { x: DISTANCE_HERO_MIST_X, ease: EASE_LINEAR, scrollTrigger: scroll })
        if (foreground) gsap.to(foreground, { y: -DISTANCE_HERO_FOREGROUND_Y, ease: EASE_LINEAR, scrollTrigger: scroll })
        if (content)
          gsap.to(content, {
            y: -DISTANCE_HERO_FOREGROUND_Y,
            autoAlpha: 0,
            ease: EASE_LINEAR,
            scrollTrigger: scroll,
          })

        return stopPhase
      })

      return () => media.revert()
    },
    { scope },
  )

  return scope
}
