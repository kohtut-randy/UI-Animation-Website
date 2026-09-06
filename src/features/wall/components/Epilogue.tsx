import { useEffect, useRef } from 'react'
import { EASE_LINEAR, SCROLL_TRIGGER_START_PIN, SCROLL_TRIGGER_STICKY_END } from 'constants/index'
import { gsap } from 'motion/gsapClient'
import { prefersReducedMotion } from 'shared/lib'

type Ember = {
  x: number
  y: number
  size: number
  speed: number
  phase: number
}

const EMBER_COUNT = 190
const embers: Ember[] = Array.from({ length: EMBER_COUNT }, (_, index) => ({
  x: ((index * 47) % 101) / 100,
  y: ((index * 71) % 103) / 102,
  size: 0.7 + ((index * 13) % 18) / 10,
  speed: 0.35 + ((index * 19) % 70) / 100,
  phase: ((index * 29) % 63) / 10,
}))

export const Epilogue = () => {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = section.current
    const surface = canvas.current
    if (!host || !surface) return

    const context = surface.getContext('2d')
    if (!context) return

    const reduce = prefersReducedMotion()
    const state = { progress: reduce ? 1 : 0 }
    let width = 1
    let height = 1
    let frame = 0
    let active = false

    const paint = (now: number) => {
      const progress = state.progress
      const elapsed = now * 0.001
      context.clearRect(0, 0, width, height)
      context.fillStyle = '#07090c'
      context.fillRect(0, 0, width, height)

      const mist = context.createRadialGradient(width * 0.7, height * 0.42, 0, width * 0.7, height * 0.42, width * 0.7)
      mist.addColorStop(0, `rgba(77, 101, 116, ${0.22 + progress * 0.12})`)
      mist.addColorStop(0.52, 'rgba(24, 35, 43, 0.12)')
      mist.addColorStop(1, 'rgba(7, 9, 12, 0)')
      context.fillStyle = mist
      context.fillRect(0, 0, width, height)

      context.save()
      context.globalCompositeOperation = 'screen'
      embers.forEach(ember => {
        const life = (ember.y + elapsed * ember.speed * 0.085) % 1
        const y = height * (0.96 - life * 0.9)
        const x = width * (0.06 + ember.x * 0.88) + Math.sin(elapsed * 1.8 + ember.phase) * (12 + ember.size * 7)
        const alpha = Math.sin(life * Math.PI) * (0.06 + progress * (0.16 + ember.size * 0.13))
        context.beginPath()
        context.fillStyle = `rgba(240, ${92 + ember.size * 22}, 42, ${alpha})`
        context.arc(x, y, ember.size, 0, Math.PI * 2)
        context.fill()
      })

      const fireIntensity = Math.max(0, Math.min(1, (progress - 0.16) / 0.84))
      const fireX = width * 0.79
      const fireY = height * 0.83
      const fireGlow = context.createRadialGradient(fireX, fireY, 0, fireX, fireY, width * 0.22)
      fireGlow.addColorStop(0, `rgba(241, 110, 42, ${fireIntensity * 0.28})`)
      fireGlow.addColorStop(0.35, `rgba(198, 55, 28, ${fireIntensity * 0.1})`)
      fireGlow.addColorStop(1, 'rgba(198, 55, 28, 0)')
      context.fillStyle = fireGlow
      context.fillRect(fireX - width * 0.24, fireY - height * 0.34, width * 0.48, height * 0.42)

      context.save()
      context.globalCompositeOperation = 'source-over'
      for (let index = 0; index < 9; index += 1) {
        const rise = (elapsed * (0.026 + index * 0.0018) + index * 0.113) % 1
        const smokeX = fireX + (index - 4) * 11 + Math.sin(elapsed * 0.55 + index) * 34 * rise
        const smokeY = fireY - 30 - rise * height * 0.31
        context.beginPath()
        context.strokeStyle = `rgba(116, 126, 131, ${(1 - rise) * fireIntensity * 0.045})`
        context.lineWidth = 12 + rise * 30
        context.lineCap = 'round'
        context.moveTo(smokeX, smokeY + 48)
        context.bezierCurveTo(smokeX - 24, smokeY + 22, smokeX + 30, smokeY + 8, smokeX, smokeY)
        context.stroke()
      }
      context.restore()

      context.save()
      context.globalCompositeOperation = 'screen'
      for (let index = 0; index < 58; index += 1) {
        const speed = 0.05 + ((index * 13) % 42) / 500
        const life = (elapsed * speed + ((index * 31) % 101) / 100) % 1
        const spread = 20 + life * 90
        const x = fireX + (((index * 43) % 101) / 100 - 0.5) * spread + Math.sin(elapsed * 1.7 + index) * 9
        const y = fireY - 7 - life * (70 + ((index * 17) % 120))
        const alpha = Math.sin(life * Math.PI) * fireIntensity * (0.18 + ((index * 7) % 42) / 100)
        const size = 0.7 + ((index * 11) % 21) / 10
        context.beginPath()
        context.fillStyle = index % 5 === 0 ? `rgba(255, 225, 160, ${alpha})` : `rgba(239, 103, 38, ${alpha})`
        context.arc(x, y, size, 0, Math.PI * 2)
        context.fill()
      }
      context.restore()

      for (let index = 0; index < 30; index += 1) {
        const x = fireX + (((index * 19) % 100) / 100 - 0.5) * 150
        const pulse = 0.42 + Math.sin(elapsed * 4.2 + index) * 0.34
        context.beginPath()
        context.fillStyle =
          index % 4 === 0 ? `rgba(255, 220, 132, ${fireIntensity * pulse})` : `rgba(220, 64, 26, ${fireIntensity * pulse * 0.72})`
        context.arc(x, fireY + ((index * 13) % 22) - 8, 1.2 + ((index * 7) % 24) / 10, 0, Math.PI * 2)
        context.fill()
      }

      const startX = width * 0.08
      const startY = height * 0.8
      const controlX = width * 0.52
      const controlY = height * 0.5
      const endX = width * 0.92
      const endY = height * 0.16
      const points = Math.max(2, Math.floor(progress * 90))

      const drawSlash = (lineWidth: number, stroke: string) => {
        context.beginPath()
        context.moveTo(startX, startY)
        for (let index = 1; index <= points; index += 1) {
          const t = index / 90
          const inverse = 1 - t
          const x = inverse * inverse * startX + 2 * inverse * t * controlX + t * t * endX
          const y = inverse * inverse * startY + 2 * inverse * t * controlY + t * t * endY
          context.lineTo(x, y)
        }
        context.lineCap = 'round'
        context.lineWidth = lineWidth
        context.strokeStyle = stroke
        context.stroke()
      }

      drawSlash(22, 'rgba(220, 82, 42, 0.08)')
      drawSlash(7, 'rgba(235, 122, 54, 0.38)')
      drawSlash(2, 'rgba(255, 224, 173, 0.94)')
      context.restore()

      context.fillStyle = `rgba(3, 4, 6, ${0.48 + progress * 0.3})`
      context.beginPath()
      context.moveTo(0, height)
      context.bezierCurveTo(width * 0.24, height * (0.76 - progress * 0.04), width * 0.62, height * 0.96, width, height * 0.7)
      context.lineTo(width, height)
      context.closePath()
      context.fill()

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

    const observer = new ResizeObserver(resize)
    observer.observe(surface)
    const visibility = new IntersectionObserver(entries => {
      active = Boolean(entries[0]?.isIntersecting) && !reduce
      if (active) requestPaint()
    })
    visibility.observe(surface)
    resize()

    const tween = reduce
      ? undefined
      : gsap.to(state, {
          progress: 1,
          ease: EASE_LINEAR,
          scrollTrigger: {
            trigger: host,
            start: SCROLL_TRIGGER_START_PIN,
            end: SCROLL_TRIGGER_STICKY_END,
            scrub: 0.45,
          },
          onUpdate: requestPaint,
        })

    return () => {
      observer.disconnect()
      visibility.disconnect()
      tween?.kill()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section ref={section} data-epilogue className='relative h-[220svh] bg-[#07090c] text-chalk-100'>
      <div className='sticky top-0 h-svh overflow-hidden'>
        <canvas ref={canvas} data-epilogue-canvas aria-hidden='true' className='absolute inset-0 size-full' />
        <div data-epilogue-copy className='gutter absolute inset-x-0 bottom-[12%] z-10'>
          <p className='eyebrow mb-6 text-eyebrow text-jug-400'>The last light</p>
          <h2 className='max-w-[9ch] font-display text-display-lg'>What survives becomes the way forward.</h2>
          <p className='mt-7 max-w-[28ch] text-lede text-chalk-100/62'>
            The ember is no longer his to carry. Somewhere beyond the dark, a new morning is already beginning.
          </p>
        </div>
      </div>
    </section>
  )
}
