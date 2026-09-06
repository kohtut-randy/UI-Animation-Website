import { useEffect, useRef } from 'react'
import { EASE_LINEAR, SCROLL_TRIGGER_START_PIN, SCROLL_TRIGGER_STICKY_END } from 'constants/index'
import { gsap } from 'motion/gsapClient'
import { prefersReducedMotion } from 'shared/lib'

const OATH_GATE_PATH = '/oath-gate.json'

export const Oath = () => {
  const section = useRef<HTMLElement>(null)
  const player = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let disposed = false
    let destroy: (() => void) | undefined

    void import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (disposed || !player.current || !section.current) return

      const animation = lottie.loadAnimation({
        container: player.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: OATH_GATE_PATH,
        rendererSettings: { progressiveLoad: true },
      })

      const ready = () => {
        if (prefersReducedMotion()) {
          animation.goToAndStop(animation.totalFrames - 1, true)
          return
        }

        const frame = { value: 0 }
        const tween = gsap.to(frame, {
          value: animation.totalFrames - 1,
          ease: EASE_LINEAR,
          scrollTrigger: {
            trigger: section.current,
            start: SCROLL_TRIGGER_START_PIN,
            end: SCROLL_TRIGGER_STICKY_END,
            scrub: 0.35,
          },
          onUpdate: () => animation.goToAndStop(frame.value, true),
        })
        destroy = () => {
          tween.kill()
          animation.destroy()
        }
      }

      animation.addEventListener('DOMLoaded', ready)
      destroy = () => animation.destroy()
    })

    return () => {
      disposed = true
      destroy?.()
    }
  }, [])

  return (
    <section ref={section} data-oath className='relative h-[240svh] bg-[#08090c] text-chalk-100'>
      <div className='sticky top-0 flex h-svh items-center justify-center overflow-hidden'>
        <div
          data-oath-glow
          aria-hidden='true'
          className='absolute inset-0 bg-[radial-gradient(ellipse_at_50%_68%,rgba(241,139,38,0.17),transparent_48%)]'
        />
        <div
          ref={player}
          data-oath-lottie
          className='absolute left-1/2 top-1/2 size-[min(70vw,24rem)] -translate-x-1/2 -translate-y-1/2 opacity-90 md:size-[min(56vw,30rem)] lg:size-[min(90vw,52rem)]'
        />
        <div data-oath-copy className='gutter relative z-10 w-full text-center'>
          <p className='eyebrow mb-6 text-eyebrow text-jug-400'>The climb</p>
          <h2 className='mx-auto max-w-[10ch] font-display text-display-lg'>The storm tests what the firebrand can carry.</h2>
          <p className='mx-auto mt-7 max-w-[32ch] text-lede text-chalk-100/62'>
            He keeps the oil and wick beneath his coat. Every step takes him higher, while the storm closes the trail behind him.
          </p>
        </div>
      </div>
    </section>
  )
}
