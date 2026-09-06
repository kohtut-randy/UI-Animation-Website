import { useRef } from 'react'
import type { RefObject } from 'react'
import {
  DURATION_CLOUD_DRIFT,
  DURATION_STAR_TWINKLE,
  EASE_IN_OUT,
  EASE_IN_OUT_SOFT,
  EASE_LINEAR,
  SCROLL_TRIGGER_END_EXIT,
  SCROLL_TRIGGER_MOON_COMPLETE,
  SCROLL_TRIGGER_START_PIN,
  SCROLL_TRIGGER_STICKY_END,
  SCROLL_TRIGGER_STORY_ACTIVE_END,
  SCROLL_TRIGGER_STORY_ACTIVE_START,
  SCROLL_TRIGGER_STORY_COPY_END,
  SCROLL_TRIGGER_STORY_COPY_START,
  SCROLL_TRIGGER_STORY_ENTER,
  SCROLL_TRIGGER_STORY_HUD_END,
  SCROLL_TRIGGER_STORY_HUD_START,
  SCROLL_TRIGGER_STORY_REVEAL_END,
  SCROLL_TRIGGER_STORY_REVEAL_START,
  SCRUB_LOOSE,
  SCRUB_EPILOGUE_THREE,
  SCRUB_SOFT,
  DISTANCE_MAP_CAMERA_Y,
  MAP_CAMERA_END_SCALE,
  MAP_CAMERA_START_SCALE,
  STORY_CHAPTER_COUNT,
} from 'constants/index'
import { gsap, useGSAP } from 'motion/gsapClient'
import { addMotionMedia, motionMedia } from 'motion/motionMedia'

const SELECTOR = {
  panels: '[data-story-panel]',
  image: '[data-story-image]',
  meta: '[data-story-meta]',
  title: '[data-story-title]',
  body: '[data-story-body]',
  wash: '[data-story-wash]',
  foreground: '[data-story-foreground]',
  mark: '[data-story-mark]',
  progress: '[data-wall-progress]',
  counter: '[data-wall-counter]',
  hud: '[data-story-hud]',
  epilogue: '[data-epilogue]',
  epilogueCopy: '[data-epilogue-copy]',
  epilogueTwo: '[data-epilogue-two]',
  epilogueTwoCopy: '[data-epilogue-two-copy]',
  epilogueTwoEmber: '[data-epilogue-two-ember]',
  epilogueTwoSun: '[data-epilogue-two-sun]',
  epilogueTwoSmoke: '[data-epilogue-two-smoke]',
  epilogueThree: '[data-epilogue-three]',
  epilogueThreeCopy: '[data-epilogue-three-copy]',
  epilogueThreeMoon: '[data-epilogue-three-moon]',
  epilogueThreeIce: '[data-epilogue-three-ice]',
  epilogueThreeEmber: '[data-epilogue-three-ember]',
  epilogueThreeRipple: '[data-epilogue-three-ripple]',
  epilogueThreeStar: '[data-epilogue-three-star]',
  epilogueThreeCloud: '[data-epilogue-three-cloud]',
  epilogueThreeSignal: '[data-epilogue-three-signal]',
  epilogueThreeSignalCore: '[data-epilogue-three-signal-core]',
  epilogueThreeFracture: '[data-epilogue-three-fracture]',
  kinetic: '[data-kinetic]',
  kineticRows: '[data-kinetic-row]',
  kineticBlade: '[data-kinetic-blade]',
  map: '[data-map]',
  mapArt: '[data-map-art]',
  mapRoute: '[data-map-route]',
  mapContours: '[data-map-contour]',
  mapBeacon: '[data-map-beacon]',
  mapBeaconRing: '[data-map-beacon-ring]',
  oath: '[data-oath]',
  oathCopy: '[data-oath-copy]',
  oathGlow: '[data-oath-glow]',
} as const

export const useWallMotion = (): RefObject<HTMLElement | null> => {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const media = motionMedia()

      addMotionMedia(media, scope.current!, (flags, context) => {
        const panels = (context.selector?.(SELECTOR.panels) ?? []) as HTMLElement[]
        const progress = context.selector?.(SELECTOR.progress)?.[0] as HTMLElement | undefined
        const counter = context.selector?.(SELECTOR.counter)?.[0] as HTMLElement | undefined
        const hud = context.selector?.(SELECTOR.hud)?.[0] as HTMLElement | undefined
        const epilogue = context.selector?.(SELECTOR.epilogue)?.[0] as HTMLElement | undefined
        const epilogueCopy = context.selector?.(SELECTOR.epilogueCopy)?.[0] as HTMLElement | undefined
        const epilogueTwo = context.selector?.(SELECTOR.epilogueTwo)?.[0] as HTMLElement | undefined
        const epilogueTwoCopy = context.selector?.(SELECTOR.epilogueTwoCopy)?.[0] as HTMLElement | undefined
        const epilogueTwoEmber = context.selector?.(SELECTOR.epilogueTwoEmber)?.[0] as HTMLElement | undefined
        const epilogueTwoSun = context.selector?.(SELECTOR.epilogueTwoSun)?.[0] as HTMLElement | undefined
        const epilogueTwoSmoke = (context.selector?.(SELECTOR.epilogueTwoSmoke) ?? []) as HTMLElement[]
        const epilogueThree = context.selector?.(SELECTOR.epilogueThree)?.[0] as HTMLElement | undefined
        const epilogueThreeCopy = context.selector?.(SELECTOR.epilogueThreeCopy)?.[0] as HTMLElement | undefined
        const epilogueThreeMoon = context.selector?.(SELECTOR.epilogueThreeMoon)?.[0] as HTMLElement | undefined
        const epilogueThreeIce = context.selector?.(SELECTOR.epilogueThreeIce)?.[0] as HTMLElement | undefined
        const epilogueThreeEmber = context.selector?.(SELECTOR.epilogueThreeEmber)?.[0] as HTMLElement | undefined
        const epilogueThreeRipples = (context.selector?.(SELECTOR.epilogueThreeRipple) ?? []) as HTMLElement[]
        const epilogueThreeStars = (context.selector?.(SELECTOR.epilogueThreeStar) ?? []) as HTMLElement[]
        const epilogueThreeClouds = (context.selector?.(SELECTOR.epilogueThreeCloud) ?? []) as HTMLElement[]
        const epilogueThreeSignal = context.selector?.(SELECTOR.epilogueThreeSignal)?.[0] as HTMLElement | undefined
        const epilogueThreeSignalCore = context.selector?.(SELECTOR.epilogueThreeSignalCore)?.[0] as HTMLElement | undefined
        const epilogueThreeFractures = (context.selector?.(SELECTOR.epilogueThreeFracture) ?? []) as HTMLElement[]
        const kinetic = context.selector?.(SELECTOR.kinetic)?.[0] as HTMLElement | undefined
        const kineticRows = (context.selector?.(SELECTOR.kineticRows) ?? []) as HTMLElement[]
        const kineticBlade = context.selector?.(SELECTOR.kineticBlade)?.[0] as HTMLElement | undefined
        const map = context.selector?.(SELECTOR.map)?.[0] as HTMLElement | undefined
        const mapArt = context.selector?.(SELECTOR.mapArt)?.[0] as SVGSVGElement | undefined
        const mapRoute = context.selector?.(SELECTOR.mapRoute)?.[0] as SVGPathElement | undefined
        const mapContours = (context.selector?.(SELECTOR.mapContours) ?? []) as SVGPathElement[]
        const mapBeacon = context.selector?.(SELECTOR.mapBeacon)?.[0] as SVGCircleElement | undefined
        const mapBeaconRing = context.selector?.(SELECTOR.mapBeaconRing)?.[0] as SVGCircleElement | undefined
        const oath = context.selector?.(SELECTOR.oath)?.[0] as HTMLElement | undefined
        const oathCopy = context.selector?.(SELECTOR.oathCopy)?.[0] as HTMLElement | undefined
        const oathGlow = context.selector?.(SELECTOR.oathGlow)?.[0] as HTMLElement | undefined

        if (flags.reduce) {
          gsap.set(context.selector?.(SELECTOR.wash) ?? [], { autoAlpha: 0 })
          if (hud) gsap.set(hud, { autoAlpha: 1 })
          return
        }

        if (hud)
          gsap.to(hud, {
            autoAlpha: 1,
            scrollTrigger: {
              trigger: scope.current,
              start: SCROLL_TRIGGER_STORY_HUD_START,
              end: SCROLL_TRIGGER_STORY_HUD_END,
              toggleActions: 'play reverse play reverse',
            },
          })

        panels.forEach((panel, index) => {
          const image = panel.querySelector<HTMLElement>(SELECTOR.image)
          const meta = panel.querySelector<HTMLElement>(SELECTOR.meta)
          const title = panel.querySelector<HTMLElement>(SELECTOR.title)
          const body = panel.querySelector<HTMLElement>(SELECTOR.body)
          const wash = panel.querySelector<HTMLElement>(SELECTOR.wash)
          const foreground = panel.querySelector<HTMLElement>(SELECTOR.foreground)
          const mark = panel.querySelector<HTMLElement>(SELECTOR.mark)
          const trigger = { trigger: panel, start: SCROLL_TRIGGER_STORY_ENTER, end: SCROLL_TRIGGER_END_EXIT, scrub: SCRUB_SOFT }

          if (image) gsap.fromTo(image, { yPercent: -3, scale: 1.04 }, { yPercent: 3, scale: 1.11, ease: 'none', scrollTrigger: trigger })
          if (foreground)
            gsap.fromTo(foreground, { yPercent: 25, xPercent: -2 }, { yPercent: -15, xPercent: 2, ease: 'none', scrollTrigger: trigger })
          if (mark) gsap.fromTo(mark, { yPercent: -20, rotation: -3 }, { yPercent: 18, rotation: 3, ease: 'none', scrollTrigger: trigger })
          if (wash)
            gsap.fromTo(
              wash,
              { scaleX: 1 },
              {
                scaleX: 0,
                ease: EASE_IN_OUT,
                scrollTrigger: {
                  trigger: panel,
                  start: SCROLL_TRIGGER_STORY_REVEAL_START,
                  end: SCROLL_TRIGGER_STORY_REVEAL_END,
                  scrub: SCRUB_SOFT,
                },
              },
            )
          if (meta)
            gsap.fromTo(
              meta,
              { autoAlpha: 0, x: -34 },
              {
                autoAlpha: 1,
                x: 0,
                ease: EASE_LINEAR,
                scrollTrigger: {
                  trigger: panel,
                  start: SCROLL_TRIGGER_STORY_COPY_START,
                  end: SCROLL_TRIGGER_STORY_COPY_END,
                  scrub: SCRUB_SOFT,
                },
              },
            )
          if (title)
            gsap.fromTo(
              title,
              { clipPath: 'inset(0 100% 0 0)', x: -48 },
              {
                clipPath: 'inset(0 0% 0 0)',
                x: 0,
                ease: EASE_LINEAR,
                scrollTrigger: {
                  trigger: panel,
                  start: SCROLL_TRIGGER_STORY_COPY_START,
                  end: SCROLL_TRIGGER_STORY_COPY_END,
                  scrub: SCRUB_SOFT,
                },
              },
            )
          if (body)
            gsap.fromTo(
              body,
              { autoAlpha: 0, y: 46 },
              {
                autoAlpha: 1,
                y: 0,
                ease: EASE_LINEAR,
                scrollTrigger: {
                  trigger: panel,
                  start: SCROLL_TRIGGER_STORY_REVEAL_END,
                  end: SCROLL_TRIGGER_STORY_COPY_END,
                  scrub: SCRUB_SOFT,
                },
              },
            )

          gsap.timeline({
            scrollTrigger: {
              trigger: panel,
              start: SCROLL_TRIGGER_STORY_ACTIVE_START,
              end: SCROLL_TRIGGER_STORY_ACTIVE_END,
              onToggle: self => {
                if (self.isActive && counter) counter.textContent = `0${index + 1} / ${String(STORY_CHAPTER_COUNT).padStart(2, '0')}`
                gsap.set([image, foreground, mark, meta, title, body].filter(Boolean), { willChange: self.isActive ? 'transform' : 'auto' })
              },
            },
          })
        })

        if (progress)
          gsap.to(progress, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom bottom', scrub: 0.2 },
          })

        if (epilogue && epilogueCopy)
          gsap.fromTo(
            epilogueCopy,
            { autoAlpha: 0, scale: 0.86 },
            {
              autoAlpha: 1,
              scale: 1,
              ease: EASE_LINEAR,
              scrollTrigger: {
                trigger: epilogue,
                start: SCROLL_TRIGGER_STORY_REVEAL_START,
                end: SCROLL_TRIGGER_STORY_COPY_END,
                scrub: SCRUB_SOFT,
              },
            },
          )

        if (epilogueTwo && epilogueTwoCopy)
          gsap.fromTo(
            epilogueTwoCopy,
            { autoAlpha: 0, x: -36 },
            {
              autoAlpha: 1,
              x: 0,
              ease: EASE_LINEAR,
              scrollTrigger: {
                trigger: epilogueTwo,
                start: SCROLL_TRIGGER_STORY_REVEAL_START,
                end: SCROLL_TRIGGER_STORY_COPY_END,
                scrub: SCRUB_SOFT,
              },
            },
          )
        if (epilogueTwo && epilogueTwoEmber)
          gsap.fromTo(
            epilogueTwoEmber,
            { autoAlpha: 0, scale: 0.5, yPercent: 35, rotate: -18 },
            {
              autoAlpha: 1,
              scale: 1,
              yPercent: -35,
              rotate: 18,
              ease: EASE_LINEAR,
              scrollTrigger: {
                trigger: epilogueTwo,
                start: SCROLL_TRIGGER_START_PIN,
                end: SCROLL_TRIGGER_END_EXIT,
                scrub: SCRUB_SOFT,
              },
            },
          )
        if (epilogueTwo && epilogueTwoSun)
          gsap.fromTo(
            epilogueTwoSun,
            { xPercent: 24, yPercent: -120, scale: 0.72, autoAlpha: 0.45 },
            {
              xPercent: -24,
              yPercent: 120,
              scale: 1.16,
              autoAlpha: 1,
              ease: EASE_LINEAR,
              scrollTrigger: { trigger: epilogueTwo, start: SCROLL_TRIGGER_START_PIN, end: SCROLL_TRIGGER_STICKY_END, scrub: SCRUB_LOOSE },
            },
          )
        if (epilogueTwo) {
          epilogueTwoSmoke.forEach((smoke, index) => {
            gsap.fromTo(
              smoke,
              { xPercent: index * -12, yPercent: 35, scale: 0.72, autoAlpha: 0.08 },
              {
                xPercent: (index + 1) * 14,
                yPercent: -80 - index * 12,
                scale: 1.2 + index * 0.08,
                autoAlpha: 0.3,
                ease: EASE_LINEAR,
                scrollTrigger: { trigger: epilogueTwo, start: SCROLL_TRIGGER_START_PIN, end: SCROLL_TRIGGER_END_EXIT, scrub: SCRUB_SOFT },
              },
            )
          })
        }

        if (epilogueThree && epilogueThreeCopy)
          gsap.fromTo(
            epilogueThreeCopy,
            { autoAlpha: 0, y: 44 },
            {
              autoAlpha: 1,
              y: 0,
              ease: EASE_LINEAR,
              scrollTrigger: {
                trigger: epilogueThree,
                start: SCROLL_TRIGGER_STORY_REVEAL_START,
                end: SCROLL_TRIGGER_STORY_COPY_END,
                scrub: SCRUB_EPILOGUE_THREE,
              },
            },
          )
        if (epilogueThree && epilogueThreeMoon)
          gsap.fromTo(
            epilogueThreeMoon,
            { autoAlpha: 0.35, scale: 0.72, yPercent: 120 },
            {
              autoAlpha: 0.9,
              scale: 1,
              yPercent: -160,
              ease: EASE_LINEAR,
              scrollTrigger: {
                trigger: epilogueThree,
                start: SCROLL_TRIGGER_STORY_ENTER,
                end: SCROLL_TRIGGER_MOON_COMPLETE,
                scrub: SCRUB_EPILOGUE_THREE,
              },
            },
          )
        if (epilogueThree && epilogueThreeIce)
          gsap.fromTo(
            epilogueThreeIce,
            { scaleX: 0, xPercent: -18 },
            {
              scaleX: 1,
              xPercent: 18,
              ease: EASE_LINEAR,
              scrollTrigger: {
                trigger: epilogueThree,
                start: SCROLL_TRIGGER_STORY_ENTER,
                end: SCROLL_TRIGGER_MOON_COMPLETE,
                scrub: SCRUB_EPILOGUE_THREE,
              },
            },
          )
        if (epilogueThree && epilogueThreeEmber)
          gsap.fromTo(
            epilogueThreeEmber,
            { autoAlpha: 0, scale: 0.4, yPercent: 35 },
            {
              autoAlpha: 1,
              scale: 1,
              yPercent: -35,
              ease: EASE_LINEAR,
              scrollTrigger: {
                trigger: epilogueThree,
                start: SCROLL_TRIGGER_STORY_ENTER,
                end: SCROLL_TRIGGER_MOON_COMPLETE,
                scrub: SCRUB_EPILOGUE_THREE,
              },
            },
          )
        if (epilogueThree) {
          epilogueThreeRipples.forEach((ripple, index) => {
            gsap.fromTo(
              ripple,
              { xPercent: index % 2 === 0 ? -18 : 18, autoAlpha: 0.25 },
              {
                xPercent: index % 2 === 0 ? 18 : -18,
                autoAlpha: 0.6,
                ease: EASE_LINEAR,
                scrollTrigger: {
                  trigger: epilogueThree,
                  start: SCROLL_TRIGGER_STORY_ENTER,
                  end: SCROLL_TRIGGER_MOON_COMPLETE,
                  scrub: SCRUB_EPILOGUE_THREE,
                },
              },
            )
          })
          epilogueThreeStars.forEach((star, index) => {
            gsap.fromTo(
              star,
              { yPercent: index % 2 === 0 ? 18 : -12 },
              {
                yPercent: index % 2 === 0 ? -18 : 12,
                ease: EASE_LINEAR,
                scrollTrigger: {
                  trigger: epilogueThree,
                  start: SCROLL_TRIGGER_STORY_REVEAL_START,
                  end: SCROLL_TRIGGER_MOON_COMPLETE,
                  scrub: SCRUB_EPILOGUE_THREE,
                },
              },
            )
          })
          gsap.to(epilogueThreeClouds, {
            xPercent: 12,
            duration: DURATION_CLOUD_DRIFT,
            repeat: -1,
            yoyo: true,
            stagger: DURATION_CLOUD_DRIFT / 5,
            ease: EASE_IN_OUT_SOFT,
          })
          gsap.to(epilogueThreeStars, {
            autoAlpha: 0.3,
            duration: DURATION_STAR_TWINKLE,
            repeat: -1,
            yoyo: true,
            stagger: DURATION_STAR_TWINKLE / 3,
            ease: EASE_IN_OUT_SOFT,
          })
          if (epilogueThreeSignal)
            gsap.fromTo(
              epilogueThreeSignal,
              { xPercent: -76, scaleX: 0.35, autoAlpha: 0.1, transformOrigin: 'left center' },
              {
                xPercent: 116,
                scaleX: 1,
                autoAlpha: 1,
                ease: EASE_LINEAR,
                scrollTrigger: {
                  trigger: epilogueThree,
                  start: SCROLL_TRIGGER_STORY_ENTER,
                  end: SCROLL_TRIGGER_MOON_COMPLETE,
                  scrub: SCRUB_EPILOGUE_THREE,
                },
              },
            )
          if (epilogueThreeSignalCore)
            gsap.fromTo(
              epilogueThreeSignalCore,
              { scale: 0.2, autoAlpha: 0.2 },
              {
                scale: 1.8,
                autoAlpha: 1,
                ease: EASE_LINEAR,
                scrollTrigger: {
                  trigger: epilogueThree,
                  start: SCROLL_TRIGGER_STORY_REVEAL_END,
                  end: SCROLL_TRIGGER_MOON_COMPLETE,
                  scrub: SCRUB_SOFT,
                },
              },
            )
          epilogueThreeFractures.forEach(fracture => {
            gsap.fromTo(
              fracture,
              { scaleY: 0, autoAlpha: 0.1, transformOrigin: 'top center' },
              {
                scaleY: 1,
                autoAlpha: 0.95,
                ease: EASE_LINEAR,
                scrollTrigger: {
                  trigger: epilogueThree,
                  start: SCROLL_TRIGGER_STORY_REVEAL_END,
                  end: SCROLL_TRIGGER_MOON_COMPLETE,
                  scrub: SCRUB_SOFT,
                },
              },
            )
          })
        }
        if (kinetic) {
          kineticRows.forEach((row, index) => {
            const direction = index === 1 ? 1 : -1
            gsap.fromTo(
              row,
              { xPercent: direction * -18 },
              {
                xPercent: direction * 18,
                ease: EASE_LINEAR,
                scrollTrigger: { trigger: kinetic, start: SCROLL_TRIGGER_STORY_ENTER, end: SCROLL_TRIGGER_END_EXIT, scrub: SCRUB_SOFT },
              },
            )
          })
          if (kineticBlade)
            gsap.fromTo(
              kineticBlade,
              { scaleX: 0, xPercent: -35 },
              {
                scaleX: 1.45,
                xPercent: 35,
                ease: EASE_LINEAR,
                scrollTrigger: { trigger: kinetic, start: SCROLL_TRIGGER_STORY_ENTER, end: SCROLL_TRIGGER_END_EXIT, scrub: SCRUB_SOFT },
              },
            )
        }

        if (map && mapRoute) {
          const routeLength = mapRoute.getTotalLength()
          if (mapArt)
            gsap.fromTo(
              mapArt,
              { yPercent: DISTANCE_MAP_CAMERA_Y, scale: MAP_CAMERA_START_SCALE, transformOrigin: 'center center' },
              {
                yPercent: -DISTANCE_MAP_CAMERA_Y,
                scale: MAP_CAMERA_END_SCALE,
                ease: EASE_LINEAR,
                scrollTrigger: { trigger: map, start: SCROLL_TRIGGER_STORY_ENTER, end: SCROLL_TRIGGER_END_EXIT, scrub: SCRUB_SOFT },
              },
            )
          gsap.set(mapRoute, { strokeDasharray: routeLength, strokeDashoffset: routeLength })
          gsap.to(mapRoute, {
            strokeDashoffset: 0,
            ease: EASE_LINEAR,
            scrollTrigger: {
              trigger: map,
              start: SCROLL_TRIGGER_START_PIN,
              end: SCROLL_TRIGGER_STICKY_END,
              scrub: SCRUB_SOFT,
              // scrub smoothing lags behind fast scrolls, so force the line to its
              // drawn/undrawn end the instant the pin releases either direction.
              onLeave: () => gsap.set(mapRoute, { strokeDashoffset: 0 }),
              onLeaveBack: () => gsap.set(mapRoute, { strokeDashoffset: routeLength }),
            },
          })
          mapContours.forEach((contour, index) => {
            gsap.fromTo(
              contour,
              { x: index % 2 === 0 ? -70 : 70 },
              {
                x: index % 2 === 0 ? 70 : -70,
                ease: EASE_LINEAR,
                scrollTrigger: { trigger: map, start: SCROLL_TRIGGER_STORY_ENTER, end: SCROLL_TRIGGER_END_EXIT, scrub: SCRUB_SOFT },
              },
            )
          })
          if (mapBeacon)
            gsap.fromTo(
              mapBeacon,
              { scale: 0.25, transformOrigin: 'center' },
              {
                scale: 1.5,
                transformOrigin: 'center',
                ease: EASE_LINEAR,
                scrollTrigger: { trigger: map, start: SCROLL_TRIGGER_START_PIN, end: SCROLL_TRIGGER_STICKY_END, scrub: SCRUB_SOFT },
              },
            )
          if (mapBeaconRing)
            gsap.fromTo(
              mapBeaconRing,
              { scale: 0.35, autoAlpha: 0.15, transformOrigin: 'center' },
              {
                scale: 1.65,
                autoAlpha: 0.75,
                transformOrigin: 'center',
                ease: EASE_LINEAR,
                scrollTrigger: { trigger: map, start: SCROLL_TRIGGER_START_PIN, end: SCROLL_TRIGGER_STICKY_END, scrub: SCRUB_SOFT },
              },
            )
        }

        if (oath && oathCopy)
          gsap.fromTo(
            oathCopy,
            { autoAlpha: 0, y: 60, scale: 0.92 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              ease: EASE_LINEAR,
              scrollTrigger: {
                trigger: oath,
                start: SCROLL_TRIGGER_STORY_REVEAL_START,
                end: SCROLL_TRIGGER_STORY_COPY_END,
                scrub: SCRUB_SOFT,
              },
            },
          )
        if (oath && oathGlow)
          gsap.fromTo(
            oathGlow,
            { autoAlpha: 0.2, scale: 0.72 },
            {
              autoAlpha: 1,
              scale: 1.18,
              ease: EASE_LINEAR,
              scrollTrigger: { trigger: oath, start: SCROLL_TRIGGER_START_PIN, end: SCROLL_TRIGGER_STICKY_END, scrub: SCRUB_SOFT },
            },
          )
      })

      return () => media.revert()
    },
    { scope },
  )

  return scope
}
