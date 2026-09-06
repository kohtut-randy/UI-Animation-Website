import { useEffect, useRef } from 'react'
import { EASE_LINEAR, SCROLL_TRIGGER_END_EXIT, SCROLL_TRIGGER_START_PIN } from 'constants/index'
import { gsap } from 'motion/gsapClient'
import { prefersReducedMotion } from 'shared/lib'

const DROP_COUNT = 118
const RIPPLE_COUNT = 18

export const HeroWeather = () => {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const surface = canvas.current
    const hero = surface?.closest<HTMLElement>('#hero')
    const context = surface?.getContext('2d')
    if (!surface || !hero || !context) return

    const reduce = prefersReducedMotion()
    const state = { progress: reduce ? 0.35 : 0 }
    let width = 1
    let height = 1
    let frame = 0
    let active = false

    const paint = (now: number) => {
      const time = now * 0.001
      const progress = state.progress
      context.clearRect(0, 0, width, height)
      context.save()
      context.lineCap = 'round'

      for (let index = 0; index < DROP_COUNT; index += 1) {
        const depth = 0.22 + ((index * 29) % 78) / 100
        const travel = time * (0.19 + depth * 0.33) + progress * depth * 1.6
        const x = ((((index * 53) % 127) / 126 + travel * 0.08) % 1.12) * width - width * 0.06
        const y = ((((index * 79) % 131) / 130 + travel) % 1.15) * height - height * 0.08
        const length = 10 + depth * 42
        context.beginPath()
        context.strokeStyle = `rgba(208, 220, 228, ${0.025 + depth * 0.12})`
        context.lineWidth = 0.45 + depth * 0.8
        context.moveTo(x, y)
        context.lineTo(x - length * 0.14, y + length)
        context.stroke()
      }

      for (let index = 0; index < RIPPLE_COUNT; index += 1) {
        const phase = (time * 0.22 + progress * 0.75 + ((index * 37) % 100) / 100) % 1
        const x = (((index * 47) % 97) / 96) * width
        const y = height * (0.68 + (((index * 19) % 29) / 100))
        context.beginPath()
        context.strokeStyle = `rgba(210, 222, 228, ${(1 - phase) * 0.09})`
        context.lineWidth = 0.8
        context.ellipse(x, y, 8 + phase * 44, 2 + phase * 8, -0.04, 0, Math.PI * 2)
        context.stroke()
      }

      context.globalCompositeOperation = 'screen'
      for (let index = 0; index < 15; index += 1) {
        const life = (time * 0.035 + progress * 0.52 + ((index * 31) % 100) / 100) % 1
        const x = width * (0.54 + (((index * 23) % 38) / 100)) + Math.sin(time + index) * 12
        const y = height * (0.78 - life * 0.52)
        const alpha = Math.sin(life * Math.PI) * 0.42
        const radius = 1 + ((index * 7) % 12) / 10
        const glow = context.createRadialGradient(x, y, 0, x, y, radius * 6)
        glow.addColorStop(0, `rgba(255, 225, 164, ${alpha})`)
        glow.addColorStop(0.28, `rgba(244, 142, 49, ${alpha * 0.7})`)
        glow.addColorStop(1, 'rgba(221, 75, 24, 0)')
        context.fillStyle = glow
        context.beginPath()
        context.arc(x, y, radius * 6, 0, Math.PI * 2)
        context.fill()
      }

      context.restore()
      frame = active ? window.requestAnimationFrame(paint) : 0
    }

    const requestPaint = () => {
      if (!frame) frame = window.requestAnimationFrame(paint)
    }

    const resize = () => {
      const bounds = surface.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.round(bounds.width))
      height = Math.max(1, Math.round(bounds.height))
      surface.width = Math.round(width * ratio)
      surface.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      requestPaint()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(surface)
    const visibilityObserver = new IntersectionObserver(entries => {
      active = Boolean(entries[0]?.isIntersecting) && !reduce
      if (active) requestPaint()
    })
    visibilityObserver.observe(surface)
    resize()

    const tween = reduce
      ? undefined
      : gsap.to(state, {
          progress: 1,
          ease: EASE_LINEAR,
          scrollTrigger: { trigger: hero, start: SCROLL_TRIGGER_START_PIN, end: SCROLL_TRIGGER_END_EXIT, scrub: 0.45 },
          onUpdate: requestPaint,
        })

    return () => {
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      tween?.kill()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvas} data-hero-weather aria-hidden='true' className='pointer-events-none absolute inset-0 z-0 size-full' />
}
