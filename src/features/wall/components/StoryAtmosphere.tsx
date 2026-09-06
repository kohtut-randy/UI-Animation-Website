import { useEffect, useRef } from 'react'
import { EASE_LINEAR, SCROLL_TRIGGER_END_EXIT, SCROLL_TRIGGER_STORY_ENTER } from 'constants/index'
import { gsap } from 'motion/gsapClient'
import { prefersReducedMotion } from 'shared/lib'

type StoryAtmosphereProps = {
  effect: 'embers' | 'rain' | 'snow' | 'paper' | 'shuriken' | 'battle'
}

const PARTICLE_COUNT = 96
const SHURIKEN_RADIUS = 34
const SHURIKEN_INNER_RADIUS = 10
const SHURIKEN_EFFECT_START = 0.08
const SHURIKEN_EFFECT_END = 0.96
const SHURIKEN_PROJECTILES = [
  { startX: -0.2, startY: 0.08, endX: 1.2, endY: 0.72, scale: 0.78, offset: -0.24 },
  { startX: 1.2, startY: 0.12, endX: -0.2, endY: 0.76, scale: 0.72, offset: 0.18 },
  { startX: 0.18, startY: -0.22, endX: 0.82, endY: 1.2, scale: 0.86, offset: -0.1 },
  { startX: 0.82, startY: -0.18, endX: 0.12, endY: 1.2, scale: 0.64, offset: 0.26 },
  { startX: 0.12, startY: 1.2, endX: 0.88, endY: -0.2, scale: 0.7, offset: -0.3 },
  { startX: 0.88, startY: 1.18, endX: 0.16, endY: -0.2, scale: 0.8, offset: 0.08 },
  { startX: -0.18, startY: 0.82, endX: 1.18, endY: 0.18, scale: 0.58, offset: 0.34 },
  { startX: 1.18, startY: 0.74, endX: -0.18, endY: 0.28, scale: 0.9, offset: -0.04 },
  { startX: 0.48, startY: -0.24, endX: 0.52, endY: 1.22, scale: 0.52, offset: 0.22 },
  { startX: 0.5, startY: 1.22, endX: 0.48, endY: -0.24, scale: 0.56, offset: -0.18 },
  { startX: -0.24, startY: 0.42, endX: 1.24, endY: 0.46, scale: 0.64, offset: 0.02 },
  { startX: 1.24, startY: 0.46, endX: -0.24, endY: 0.42, scale: 0.68, offset: -0.34 },
] as const
const BLOOD_DROP_START = 0
const BLOOD_INTENSITY_RATE = 1.45
const BLOOD_STREAM_COUNT = 34
const BLOOD_WASH_ALPHA = 0.2
const BLOOD_STREAM_MIN_WIDTH = 4
const BLOOD_STREAM_MAX_WIDTH = 26
const BATTLE_DUST_COUNT = 48
const BATTLE_FIRE_COUNT = 5
const BATTLE_ARROW_COUNT = 7
const BATTLE_BANNER_COUNT = 3

const drawArrow = (context: CanvasRenderingContext2D, x: number, y: number, angle: number, length: number, alpha: number) => {
  context.save()
  context.translate(x, y)
  context.rotate(angle)

  const headLength = length * 0.22
  const headWidth = length * 0.09
  const shaftWidth = Math.max(1.4, length * 0.035)

  // shaft
  const shaftGradient = context.createLinearGradient(-length / 2, 0, length / 2, 0)
  shaftGradient.addColorStop(0, `rgba(120, 88, 54, ${alpha * 0.85})`)
  shaftGradient.addColorStop(0.5, `rgba(196, 158, 110, ${alpha})`)
  shaftGradient.addColorStop(1, `rgba(120, 88, 54, ${alpha * 0.85})`)
  context.strokeStyle = shaftGradient
  context.lineWidth = shaftWidth
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(-length / 2, 0)
  context.lineTo(length / 2 - headLength, 0)
  context.stroke()

  // arrowhead
  const headX = length / 2
  context.beginPath()
  context.moveTo(headX, 0)
  context.lineTo(headX - headLength, -headWidth)
  context.lineTo(headX - headLength * 0.55, 0)
  context.lineTo(headX - headLength, headWidth)
  context.closePath()
  context.fillStyle = `rgba(198, 202, 200, ${alpha})`
  context.fill()
  context.strokeStyle = `rgba(40, 40, 42, ${alpha * 0.8})`
  context.lineWidth = 1
  context.stroke()

  // fletching (3 vanes)
  const fletchX = -length / 2
  const fletchLength = length * 0.16
  const fletchWidth = length * 0.07
  ;[-1, 0, 1].forEach(dir => {
    context.beginPath()
    context.moveTo(fletchX, 0)
    context.lineTo(fletchX + fletchLength, dir === 0 ? 0 : dir * fletchWidth * 1.4)
    context.lineTo(fletchX + fletchLength * 0.55, dir === 0 ? -fletchWidth * 0.4 : dir * fletchWidth * 0.6)
    context.closePath()
    context.fillStyle = `rgba(212, 40, 40, ${alpha * 0.75})`
    context.fill()
  })

  context.restore()
}

const drawShuriken = (context: CanvasRenderingContext2D, x: number, y: number, rotation: number, scale: number) => {
  context.save()
  context.translate(x, y)
  context.rotate(rotation)
  context.scale(scale, scale)
  context.beginPath()

  for (let point = 0; point < 8; point += 1) {
    const angle = (point * Math.PI) / 4
    const radius = point % 2 === 0 ? SHURIKEN_RADIUS : SHURIKEN_INNER_RADIUS
    const pointX = Math.cos(angle) * radius
    const pointY = Math.sin(angle) * radius
    if (point === 0) context.moveTo(pointX, pointY)
    else context.lineTo(pointX, pointY)
  }

  context.closePath()
  const metal = context.createLinearGradient(-SHURIKEN_RADIUS, -SHURIKEN_RADIUS, SHURIKEN_RADIUS, SHURIKEN_RADIUS)
  metal.addColorStop(0, '#565b5d')
  metal.addColorStop(0.24, '#0b0c0d')
  metal.addColorStop(0.64, '#1b1d1f')
  metal.addColorStop(1, '#000000')
  context.fillStyle = metal
  context.fill()
  context.strokeStyle = 'rgba(180, 184, 182, 0.72)'
  context.lineWidth = 2
  context.stroke()

  context.beginPath()
  context.arc(0, 0, 6, 0, Math.PI * 2)
  context.fillStyle = '#050607'
  context.fill()
  context.strokeStyle = 'rgba(210, 211, 204, 0.8)'
  context.lineWidth = 2
  context.stroke()
  context.restore()
}

const drawBloodPour = (context: CanvasRenderingContext2D, width: number, height: number, progress: number, time: number) => {
  if (progress < BLOOD_DROP_START) return

  const intensity = Math.min(1, (progress - BLOOD_DROP_START) * BLOOD_INTENSITY_RATE)
  context.fillStyle = `rgba(58, 0, 7, ${intensity * BLOOD_WASH_ALPHA})`
  context.fillRect(0, 0, width, height)

  for (let index = 0; index < BLOOD_STREAM_COUNT; index += 1) {
    const depth = 0.35 + ((index * 17) % 65) / 100
    const baseX = (((index * 47) % 103) / 102) * width
    const widthFactor = ((index * 29) % 100) / 100
    const streamWidth = BLOOD_STREAM_MIN_WIDTH + widthFactor * (BLOOD_STREAM_MAX_WIDTH - BLOOD_STREAM_MIN_WIDTH)
    const wave = Math.sin(time * (0.25 + depth * 0.2) + index * 1.7) * (4 + depth * 14)
    const x = baseX + wave
    const alpha = intensity * (0.24 + depth * 0.5)
    const streamGradient = context.createLinearGradient(x - streamWidth, 0, x + streamWidth, 0)
    streamGradient.addColorStop(0, `rgba(55, 0, 7, ${alpha * 0.55})`)
    streamGradient.addColorStop(0.35, `rgba(139, 8, 20, ${alpha})`)
    streamGradient.addColorStop(0.62, `rgba(104, 3, 13, ${alpha * 0.92})`)
    streamGradient.addColorStop(1, `rgba(35, 0, 5, ${alpha * 0.5})`)

    context.save()
    context.fillStyle = streamGradient
    context.beginPath()
    context.moveTo(x - streamWidth * 0.55, -20)
    for (let step = 0; step <= 8; step += 1) {
      const y = (step / 8) * height
      const drift = Math.sin(time * 0.25 + index + step * 0.8) * (3 + depth * 9)
      context.lineTo(x - streamWidth * 0.55 + drift, y)
    }
    for (let step = 8; step >= 0; step -= 1) {
      const y = (step / 8) * height
      const drift = Math.sin(time * 0.25 + index + step * 0.8) * (3 + depth * 9)
      const widthAtY = streamWidth * (0.78 + Math.sin(time * 0.9 + index + step) * 0.16)
      context.lineTo(x + widthAtY + drift, y)
    }
    context.closePath()
    context.fill()

    const bulgeTravel = (time * (0.08 + depth * 0.1) + progress + index * 0.13) % 1.15
    const bulgeY = (bulgeTravel - 0.1) * height
    context.fillStyle = `rgba(178, 18, 31, ${Math.min(0.72, alpha + 0.12)})`
    context.beginPath()
    context.ellipse(x, bulgeY, streamWidth * 0.58, streamWidth * 0.85, 0, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = `rgba(232, 66, 70, ${alpha * 0.24})`
    context.lineWidth = Math.max(1, streamWidth * 0.12)
    context.beginPath()
    context.moveTo(x - streamWidth * 0.2, -10)
    context.lineTo(x - streamWidth * 0.2, height)
    context.stroke()
    context.restore()
  }
}

export const StoryAtmosphere = ({ effect }: StoryAtmosphereProps) => {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const surface = canvas.current
    const panel = surface?.closest<HTMLElement>('[data-story-panel]')
    const context = surface?.getContext('2d')
    if (!surface || !panel || !context) return

    const state = { progress: prefersReducedMotion() ? 0.55 : 0 }
    let width = 1
    let height = 1
    let frame = 0
    let active = false

    const paint = (now: number) => {
      const progress = state.progress
      const time = now * 0.001
      context.clearRect(0, 0, width, height)
      context.save()

      if (effect === 'rain') {
        const firstFlash = Math.max(0, 1 - Math.abs(progress - 0.43) * 34)
        const secondFlash = Math.max(0, 1 - Math.abs(progress - 0.71) * 52) * 0.62
        const flash = Math.max(firstFlash, secondFlash)
        if (flash > 0) {
          const glow = context.createRadialGradient(width * 0.78, height * 0.22, 0, width * 0.78, height * 0.22, width * 0.62)
          glow.addColorStop(0, `rgba(216, 232, 244, ${flash * 0.22})`)
          glow.addColorStop(1, 'rgba(216, 232, 244, 0)')
          context.fillStyle = glow
          context.fillRect(0, 0, width, height)

          const drawBolt = (lineWidth: number, color: string, blur: number) => {
            context.save()
            context.beginPath()
            context.moveTo(width * 0.79, -20)
            context.lineTo(width * 0.75, height * 0.12)
            context.lineTo(width * 0.78, height * 0.19)
            context.lineTo(width * 0.7, height * 0.31)
            context.lineTo(width * 0.72, height * 0.39)
            context.lineTo(width * 0.64, height * 0.53)
            context.strokeStyle = color
            context.lineWidth = lineWidth
            context.lineCap = 'round'
            context.lineJoin = 'round'
            context.shadowColor = 'rgba(208, 231, 255, 0.95)'
            context.shadowBlur = blur
            context.globalAlpha = flash
            context.stroke()

            context.beginPath()
            context.moveTo(width * 0.78, height * 0.19)
            context.lineTo(width * 0.83, height * 0.28)
            context.lineTo(width * 0.8, height * 0.38)
            context.globalAlpha = flash * 0.6
            context.stroke()
            context.restore()
          }

          drawBolt(11, 'rgba(153, 198, 235, 0.24)', 28)
          drawBolt(3.5, 'rgba(221, 239, 255, 0.88)', 14)
          drawBolt(1.1, 'rgba(255, 255, 255, 1)', 4)
        }

        context.lineCap = 'round'
        for (let index = 0; index < PARTICLE_COUNT; index += 1) {
          const depth = 0.35 + ((index * 17) % 65) / 100
          const travel = time * (0.16 + depth * 0.28) + progress * depth * 2.4
          const x = ((((index * 43) % 109) / 108 + travel * 0.22) % 1.16) * width - width * 0.08
          const y = ((((index * 71) % 113) / 112 + travel) % 1.18) * height - height * 0.09
          const length = 18 + depth * 62
          context.beginPath()
          context.strokeStyle = `rgba(205, 221, 232, ${0.08 + depth * 0.18})`
          context.lineWidth = 0.6 + depth * 1.2
          context.moveTo(x, y)
          context.lineTo(x - length * 0.38, y + length)
          context.stroke()
        }
      }

      if (effect === 'snow') {
        const iceGlow = context.createRadialGradient(width * 0.56, height * 0.88, 0, width * 0.56, height * 0.88, width * 0.55)
        iceGlow.addColorStop(0, `rgba(116, 177, 211, ${0.04 + progress * 0.13})`)
        iceGlow.addColorStop(1, 'rgba(116, 177, 211, 0)')
        context.fillStyle = iceGlow
        context.fillRect(0, 0, width, height)

        for (let index = 0; index < PARTICLE_COUNT; index += 1) {
          const depth = 0.2 + ((index * 23) % 80) / 100
          const travel = time * (0.025 + depth * 0.045) + progress * depth * 1.45
          const drift = Math.sin(time * 0.55 + progress * 7 + index * 1.7) * (12 + depth * 28)
          const x = (((index * 37) % 103) / 102) * width + drift
          const y = ((((index * 61) % 107) / 106 + travel) % 1.12) * height - height * 0.06
          context.beginPath()
          context.fillStyle = `rgba(239, 245, 248, ${0.18 + depth * 0.56})`
          context.arc(x, y, 0.7 + depth * 2.5, 0, Math.PI * 2)
          context.fill()
        }
      }

      if (effect === 'embers') {
        context.globalCompositeOperation = 'screen'
        for (let index = 0; index < 76; index += 1) {
          const depth = 0.25 + ((index * 31) % 70) / 100
          const travel = time * (0.018 + depth * 0.035) + progress * depth * 1.3
          const x = (((index * 41) % 101) / 100) * width + Math.sin(time * 0.72 + progress * 9 + index) * (18 + depth * 20)
          const y = ((((index * 67) % 103) / 102 - travel + 1.2) % 1.2) * height
          const alpha = (0.14 + depth * 0.6) * Math.sin((((index * 17) % 91) / 90) * Math.PI)
          const radius = 0.7 + depth * 2.2
          const glow = context.createRadialGradient(x, y, 0, x, y, radius * 4.5)
          glow.addColorStop(0, `rgba(255, 220, 136, ${alpha})`)
          glow.addColorStop(0.22, `rgba(246, 107, 45, ${alpha * 0.72})`)
          glow.addColorStop(1, 'rgba(210, 48, 20, 0)')
          context.beginPath()
          context.fillStyle = glow
          context.arc(x, y, radius * 4.5, 0, Math.PI * 2)
          context.fill()
        }
        context.globalCompositeOperation = 'source-over'
      }

      if (effect === 'paper') {
        for (let index = 0; index < 34; index += 1) {
          const depth = 0.35 + ((index * 19) % 60) / 100
          const travel = time * 0.02 + progress * depth
          const x = ((((index * 47) % 107) / 106 + travel * 0.32) % 1.15) * width - width * 0.07
          const y = ((((index * 59) % 109) / 108 - travel * 0.7 + 1.1) % 1.1) * height
          const size = 5 + depth * 12
          context.save()
          context.translate(x, y)
          context.rotate(time * 0.32 + progress * 2 + index * 0.73)
          context.fillStyle = `rgba(251, 244, 218, ${0.22 + depth * 0.48})`
          context.fillRect(-size, -size * 0.32, size * 2, size * 0.64)
          context.restore()
        }
      }

      if (effect === 'shuriken') {
        const shurikenProgress = Math.min(
          1,
          Math.max(0, (progress - SHURIKEN_EFFECT_START) / (SHURIKEN_EFFECT_END - SHURIKEN_EFFECT_START)),
        )
        drawBloodPour(context, width, height, shurikenProgress, time)
        SHURIKEN_PROJECTILES.forEach((projectile, index) => {
          const projectileProgress = Math.min(1, Math.max(0, shurikenProgress + projectile.offset))
          const easedProgress = Math.sin(projectileProgress * Math.PI - Math.PI / 2) * 0.5 + 0.5
          const x = (projectile.startX + (projectile.endX - projectile.startX) * easedProgress) * width
          const y = (projectile.startY + (projectile.endY - projectile.startY) * easedProgress) * height
          const rotation = time * (2.4 + index * 0.32) + easedProgress * Math.PI * 4
          drawShuriken(context, x, y, rotation, projectile.scale)
        })
      }

      if (effect === 'battle') {
        const firePulse = 0.5 + Math.sin(time * 1.4 + progress * 4) * 0.18
        context.globalCompositeOperation = 'screen'

        for (let index = 0; index < BATTLE_FIRE_COUNT; index += 1) {
          const fireX = width * (0.16 + index * 0.19)
          const fireY = height * (0.74 + (index % 2) * 0.08)
          const radius = width * (0.08 + (index % 3) * 0.025)
          const glow = context.createRadialGradient(fireX, fireY, 0, fireX, fireY, radius)
          glow.addColorStop(0, `rgba(255, 164, 65, ${firePulse * 0.16})`)
          glow.addColorStop(0.35, `rgba(174, 38, 20, ${firePulse * 0.1})`)
          glow.addColorStop(1, 'rgba(80, 12, 10, 0)')
          context.fillStyle = glow
          context.fillRect(fireX - radius, fireY - radius, radius * 2, radius * 2)
        }

        context.globalCompositeOperation = 'source-over'

        for (let index = 0; index < BATTLE_ARROW_COUNT; index += 1) {
          const speed = 0.05 + index * 0.006
          const travel = (time * speed + progress * 0.8 + index * 0.17) % 1.3
          const t = travel - 0.15
          if (t < -0.05 || t > 1.05) continue

          const startY = height * (0.16 + (index % 4) * 0.1)
          const arcHeight = height * (0.05 + (index % 3) * 0.03)
          const clampedT = Math.min(Math.max(t, 0), 1)
          const arc = Math.sin(Math.PI * clampedT) * arcHeight

          const x = t * width
          const y = startY - arc + Math.sin(time + index) * 4

          const dt = 0.01
          const clampedT2 = Math.min(Math.max(t + dt, 0), 1)
          const arc2 = Math.sin(Math.PI * clampedT2) * arcHeight
          const x2 = (t + dt) * width
          const y2 = startY - arc2
          const angle = Math.atan2(y2 - y, x2 - x)

          const alpha = 0.28 + (index % 3) * 0.08
          const arrowLength = width * (0.1 + (index % 3) * 0.02)
          drawArrow(context, x, y, angle, arrowLength, alpha)
        }

        for (let index = 0; index < BATTLE_BANNER_COUNT; index += 1) {
          const bannerX = width * (0.62 + index * 0.15)
          const bannerTop = height * (0.1 + (index % 2) * 0.08)
          const bannerHeight = height * (0.3 + (index % 2) * 0.08)
          const wind = Math.sin(time * 0.75 + index * 1.8) * width * 0.025
          context.strokeStyle = 'rgba(12, 9, 12, 0.78)'
          context.lineWidth = 3
          context.beginPath()
          context.moveTo(bannerX, bannerTop - height * 0.08)
          context.lineTo(bannerX + wind * 0.35, bannerTop + bannerHeight)
          context.stroke()
          context.fillStyle = 'rgba(132, 24, 32, 0.48)'
          context.beginPath()
          context.moveTo(bannerX + 2, bannerTop)
          context.lineTo(bannerX + width * 0.14 + wind, bannerTop + height * 0.025)
          context.lineTo(bannerX + width * 0.11 + wind * 0.8, bannerTop + bannerHeight * 0.72)
          context.lineTo(bannerX + width * 0.025, bannerTop + bannerHeight * 0.58)
          context.closePath()
          context.fill()
          context.strokeStyle = 'rgba(218, 79, 64, 0.62)'
          context.lineWidth = 1.5
          context.beginPath()
          context.moveTo(bannerX + 2, bannerTop)
          context.lineTo(bannerX + width * 0.14 + wind, bannerTop + height * 0.025)
          context.lineTo(bannerX + width * 0.11 + wind * 0.8, bannerTop + bannerHeight * 0.72)
          context.stroke()
          context.save()
          context.fillStyle = 'rgba(255, 223, 173, 0.88)'
          context.font = `${Math.round(bannerHeight * 0.3)}px "Noto Serif JP", serif`
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText('戦', bannerX + width * 0.07 + wind * 0.5, bannerTop + bannerHeight * 0.34)
          context.restore()
        }

        const mist = context.createLinearGradient(0, height * 0.62, 0, height)
        mist.addColorStop(0, 'rgba(31, 35, 39, 0)')
        mist.addColorStop(0.55, `rgba(50, 48, 45, ${0.08 + progress * 0.05})`)
        mist.addColorStop(1, 'rgba(18, 19, 21, 0.26)')
        context.fillStyle = mist
        context.fillRect(0, height * 0.58, width, height * 0.42)

        context.lineCap = 'round'
        for (let index = 0; index < BATTLE_DUST_COUNT; index += 1) {
          const depth = 0.25 + ((index * 37) % 75) / 100
          const travel = time * (0.025 + depth * 0.05) + progress * depth * 1.2
          const x = ((((index * 47) % 109) / 100 + travel * 0.3) % 1.2) * width - width * 0.1
          const y = height * (0.46 + (((index * 71) % 48) / 100) * 0.5) + Math.sin(time * 0.6 + index) * 12
          const length = 14 + depth * 48
          context.strokeStyle = `rgba(210, 190, 164, ${0.05 + depth * 0.14})`
          context.lineWidth = 0.7 + depth * 1.4
          context.beginPath()
          context.moveTo(x, y)
          context.lineTo(x + length, y - length * 0.12)
          context.stroke()
        }
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

    const observer = new ResizeObserver(resize)
    observer.observe(surface)
    const visibility = new IntersectionObserver(entries => {
      active = Boolean(entries[0]?.isIntersecting) && !prefersReducedMotion()
      if (active) requestPaint()
    })
    visibility.observe(surface)
    resize()

    const tween = prefersReducedMotion()
      ? undefined
      : gsap.to(state, {
          progress: 1,
          ease: EASE_LINEAR,
          scrollTrigger: {
            trigger: panel,
            start: SCROLL_TRIGGER_STORY_ENTER,
            end: SCROLL_TRIGGER_END_EXIT,
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
  }, [effect])

  return (
    <canvas ref={canvas} data-story-atmosphere={effect} aria-hidden='true' className='pointer-events-none absolute inset-0 size-full' />
  )
}
