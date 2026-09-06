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

  // Dark base wash - more realistic blood stain
  context.fillStyle = `rgba(40, 0, 5, ${intensity * 0.15})`
  context.fillRect(0, 0, width, height)

  // Main blood streams with realistic flow
  for (let index = 0; index < BLOOD_STREAM_COUNT; index += 1) {
    const depth = 0.2 + ((index * 17) % 65) / 100
    const baseX = (((index * 47) % 103) / 102) * width
    const widthFactor = ((index * 29) % 100) / 100
    const streamWidth = BLOOD_STREAM_MIN_WIDTH + widthFactor * (BLOOD_STREAM_MAX_WIDTH - BLOOD_STREAM_MIN_WIDTH)

    // More complex wave motion for realistic flow
    const wave1 = Math.sin(time * (0.15 + depth * 0.25) + index * 1.7) * (6 + depth * 18)
    const wave2 = Math.cos(time * (0.2 + depth * 0.15) + index * 0.9) * (3 + depth * 10)
    const x = baseX + wave1 + wave2 * 0.3

    const alpha = intensity * (0.3 + depth * 0.55)

    // Rich blood color gradient - more realistic
    const streamGradient = context.createLinearGradient(x - streamWidth, 0, x + streamWidth, 0)
    streamGradient.addColorStop(0, `rgba(30, 0, 3, ${alpha * 0.4})`)
    streamGradient.addColorStop(0.2, `rgba(120, 5, 15, ${alpha * 0.7})`)
    streamGradient.addColorStop(0.4, `rgba(180, 12, 25, ${alpha * 0.9})`)
    streamGradient.addColorStop(0.6, `rgba(140, 8, 18, ${alpha * 0.85})`)
    streamGradient.addColorStop(0.8, `rgba(80, 3, 10, ${alpha * 0.6})`)
    streamGradient.addColorStop(1, `rgba(25, 0, 3, ${alpha * 0.35})`)

    context.save()
    context.fillStyle = streamGradient

    // Main stream body with organic shape
    context.beginPath()
    const segments = 16
    for (let step = 0; step <= segments; step += 1) {
      const y = (step / segments) * height
      const flowOffset = Math.sin(time * 0.2 + index + step * 0.6) * (4 + depth * 12)
      const widthAtY = streamWidth * (0.7 + Math.sin(time * 0.3 + index * 0.5 + step * 0.4) * 0.2)
      context.lineTo(x - widthAtY * 0.4 + flowOffset * 0.5, y)
    }
    for (let step = segments; step >= 0; step -= 1) {
      const y = (step / segments) * height
      const flowOffset = Math.sin(time * 0.2 + index + step * 0.6) * (4 + depth * 12)
      const widthAtY = streamWidth * (0.7 + Math.sin(time * 0.3 + index * 0.5 + step * 0.4) * 0.2)
      context.lineTo(x + widthAtY * 0.4 + flowOffset * 0.5, y)
    }
    context.closePath()
    context.fill()

    // Blood drops and splatters along the stream
    for (let drop = 0; drop < 6; drop += 1) {
      const dropOffset = (drop / 6) * height + ((time * (0.3 + depth * 0.2) * 50) % height)
      const dropX = x + Math.sin(time * 0.5 + index * 1.3 + drop * 2.1) * (streamWidth * 0.6)
      const dropSize = (1 + Math.sin(time * 0.4 + index * 0.7 + drop * 1.8) * 0.5) * (2 + depth * 4)

      // Tear-drop shape for falling drops
      context.beginPath()
      context.ellipse(dropX, dropOffset, dropSize * 0.8, dropSize * 1.3, Math.sin(time + index + drop) * 0.3, 0, Math.PI * 2)
      context.fillStyle = `rgba(160, 10, 25, ${alpha * (0.4 + depth * 0.3)})`
      context.fill()

      // Small splatter trails
      if (drop % 2 === 0) {
        for (let splatter = 0; splatter < 3; splatter += 1) {
          const angle = Math.PI * 2 * (splatter / 3) + time * 0.5 + index
          const dist = dropSize * (1 + Math.sin(time + index + splatter) * 0.5)
          context.beginPath()
          context.arc(dropX + Math.cos(angle) * dist, dropOffset + Math.sin(angle) * dist * 0.5, dropSize * 0.2, 0, Math.PI * 2)
          context.fillStyle = `rgba(120, 5, 15, ${alpha * 0.2})`
          context.fill()
        }
      }
    }

    // Blood pooling at bottom - more realistic accumulation
    const poolY = height * (0.85 + depth * 0.1)
    const poolWidth = streamWidth * (0.8 + Math.sin(time * 0.2 + index) * 0.2)
    const poolGradient = context.createRadialGradient(x, poolY, 0, x, poolY, poolWidth * 0.8)
    poolGradient.addColorStop(0, `rgba(130, 8, 20, ${alpha * 0.6})`)
    poolGradient.addColorStop(0.5, `rgba(80, 3, 12, ${alpha * 0.4})`)
    poolGradient.addColorStop(1, `rgba(40, 0, 5, ${alpha * 0.15})`)
    context.fillStyle = poolGradient
    context.beginPath()
    context.ellipse(x, poolY, poolWidth * 0.8, poolWidth * 0.3, 0, 0, Math.PI * 2)
    context.fill()

    // Highlight on wet blood surface
    context.fillStyle = `rgba(200, 60, 80, ${alpha * 0.08})`
    context.beginPath()
    context.ellipse(x - poolWidth * 0.2, poolY - poolWidth * 0.05, poolWidth * 0.2, poolWidth * 0.06, -0.3, 0, Math.PI * 2)
    context.fill()

    context.restore()
  }

  // Large splatter effects - random blood drops
  if (intensity > 0.3) {
    const splatterCount = Math.floor(8 + intensity * 16)
    for (let i = 0; i < splatterCount; i += 1) {
      const x = (Math.sin(i * 127.1 + 311.7) * 0.5 + 0.5) * width
      const y = (Math.sin(i * 269.5 + 183.3) * 0.5 + 0.5) * height * 0.7
      const size = 2 + Math.sin(i * 419.2 + 131.7) * 4 + 4
      const alpha = intensity * (0.1 + Math.sin(i * 631.7 + 53.1) * 0.1 + 0.1)

      // Irregular splatter shapes
      context.save()
      context.fillStyle = `rgba(120, 5, 15, ${alpha})`
      context.beginPath()
      const points = 5 + Math.floor(Math.sin(i * 73.7 + 211.9) * 2 + 3)
      for (let p = 0; p < points; p += 1) {
        const angle = (p / points) * Math.PI * 2 + Math.sin(i * 97.3 + p) * 0.5
        const radius = size * (0.5 + Math.sin(i * 113.7 + p * 1.5) * 0.4 + 0.5)
        const px = x + Math.cos(angle) * radius
        const py = y + Math.sin(angle) * radius * 0.7
        if (p === 0) context.moveTo(px, py)
        else context.lineTo(px, py)
      }
      context.closePath()
      context.fill()
      context.restore()
    }
  }

  // Dripping effect from top
  if (intensity > 0.2) {
    const dripCount = Math.floor(6 + intensity * 12)
    for (let i = 0; i < dripCount; i += 1) {
      const x = (Math.sin(i * 317.1 + 197.3) * 0.5 + 0.5) * width
      const dripProgress = (time * (0.1 + Math.sin(i * 53.7) * 0.05) + i * 0.3) % 1
      const y = -10 + dripProgress * height * 0.3
      const size = 1 + Math.sin(i * 231.7) * 1 + 2

      context.save()
      const alpha = intensity * (0.2 + (1 - dripProgress) * 0.3)

      // Drip drop
      context.beginPath()
      context.ellipse(x, y, size * 0.6, size * 1.2, 0, 0, Math.PI * 2)
      context.fillStyle = `rgba(140, 8, 20, ${alpha})`
      context.fill()

      // Drip trail
      context.beginPath()
      context.moveTo(x - size * 0.2, y - size * 0.5)
      context.quadraticCurveTo(x - size * 0.1, y - size * 3, x + size * 0.1, y - size * 3.5)
      context.quadraticCurveTo(x + size * 0.2, y - size * 3, x + size * 0.2, y - size * 0.5)
      context.fillStyle = `rgba(100, 5, 12, ${alpha * 0.3})`
      context.fill()
      context.restore()
    }
  }

  // Vein-like blood vessel details for realism
  if (intensity > 0.4) {
    context.save()
    for (let i = 0; i < 8; i += 1) {
      const x = (Math.sin(i * 137.1 + 251.3) * 0.5 + 0.5) * width
      const y = (Math.sin(i * 283.5 + 167.9) * 0.5 + 0.5) * height * 0.5
      const length = 20 + Math.sin(i * 411.7) * 15 + 20
      const angle = Math.sin(i * 313.1 + time * 0.1) * 0.8

      context.beginPath()
      context.moveTo(x, y)
      for (let j = 0; j < 10; j += 1) {
        const t = j / 10
        const px = x + Math.cos(angle + t * 0.5) * t * length
        const py = y + Math.sin(angle + t * 0.3 + Math.sin(t * 3 + time * 0.1) * 0.2) * t * length * 0.3
        context.lineTo(px, py)
      }
      context.strokeStyle = `rgba(80, 0, 10, ${intensity * 0.08})`
      context.lineWidth = 1.5
      context.stroke()
    }
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

        // Narrow rock walls closing in on the pass, darkening as the fight builds
        const rockAlpha = 0.5 + progress * 0.35
        context.fillStyle = `rgba(18, 16, 15, ${rockAlpha})`
        context.beginPath()
        context.moveTo(0, height)
        context.lineTo(0, height * 0.18)
        context.lineTo(width * 0.05, height * 0.3)
        context.lineTo(width * 0.09, height * 0.12)
        context.lineTo(width * 0.14, height * 0.34)
        context.lineTo(width * 0.1, height)
        context.closePath()
        context.fill()

        context.beginPath()
        context.moveTo(width, height)
        context.lineTo(width, height * 0.22)
        context.lineTo(width * 0.94, height * 0.08)
        context.lineTo(width * 0.9, height * 0.28)
        context.lineTo(width * 0.86, height * 0.1)
        context.lineTo(width * 0.88, height)
        context.closePath()
        context.fill()

        context.globalCompositeOperation = 'screen'

        for (let index = 0; index < BATTLE_FIRE_COUNT; index += 1) {
          const fireX = width * (0.16 + index * 0.19)
          const fireY = height * (0.74 + (index % 2) * 0.08)
          const radius = width * (0.08 + (index % 3) * 0.025) * (0.7 + progress * 0.55)
          const glow = context.createRadialGradient(fireX, fireY, 0, fireX, fireY, radius)
          glow.addColorStop(0, `rgba(255, 164, 65, ${firePulse * (0.12 + progress * 0.2)})`)
          glow.addColorStop(0.35, `rgba(174, 38, 20, ${firePulse * (0.06 + progress * 0.12)})`)
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

        // WAVING BANNERS - ranks break formation as the fight wears on
        for (let index = 0; index < BATTLE_BANNER_COUNT; index += 1) {
          const bannerX = width * (0.42 + index * 0.15)
          const bannerTop = height * (0.1 + (index % 2) * 0.08)
          const bannerHeight = height * (0.3 + (index % 2) * 0.08)
          const bannerWidth = width * 0.14
          const groundY = height * 0.86

          // Waving flag with sine wave
          const waveSpeed = 1.2 + index * 0.3
          const waveAmplitude = width * (0.025 + index * 0.008)
          const waveOffset = index * 0.8 + progress * 0.5

          // Each pole leans further off true as the banners break rank, pivoting from where it's planted
          const leanDirection = index % 2 === 0 ? -1 : 1
          const leanAngle = leanDirection * (0.05 + progress * 0.24) + Math.sin(time * 0.4 + index) * 0.015
          context.save()
          context.translate(bannerX, groundY)
          context.rotate(leanAngle)
          context.translate(-bannerX, -groundY)

          // Draw pole, driven down to the ground
          context.strokeStyle = 'rgba(120, 80, 42, 0.92)'
          context.lineWidth = 4
          context.lineCap = 'round'
          context.beginPath()
          context.moveTo(bannerX, bannerTop - height * 0.08)
          context.lineTo(bannerX + Math.sin(time * 0.3 + index) * 2, groundY)
          context.stroke()

          // Planted base - pole driven into the rocky ground
          context.beginPath()
          context.ellipse(bannerX, groundY, 7, 2.5, 0, 0, Math.PI * 2)
          context.fillStyle = 'rgba(38, 30, 21, 0.85)'
          context.fill()

          // Draw flag with wave
          context.beginPath()
          context.moveTo(bannerX + 2, bannerTop)

          // Top edge - waving
          const steps = 20
          for (let step = 0; step <= steps; step += 1) {
            const t = step / steps
            const x = bannerX + 2 + t * bannerWidth
            const wave = Math.sin(time * waveSpeed + t * 8 + waveOffset) * waveAmplitude * (1 - t * 0.3)
            const y = bannerTop + t * bannerHeight * 0.25 + wave * 0.2
            context.lineTo(x, y)
          }

          // Right edge
          const rightWave = Math.sin(time * waveSpeed + 1 + waveOffset) * waveAmplitude * 0.7
          context.lineTo(
            bannerX + bannerWidth + rightWave,
            bannerTop + bannerHeight * 0.4 + Math.sin(time * waveSpeed * 0.8 + 2 + waveOffset) * waveAmplitude * 0.3,
          )

          // Bottom edge - waving
          for (let step = steps; step >= 0; step -= 1) {
            const t = step / steps
            const x = bannerX + 2 + t * bannerWidth
            const wave = Math.sin(time * waveSpeed + t * 8 + waveOffset + 1.2) * waveAmplitude * (1 - t * 0.3) * 0.9
            const y = bannerTop + bannerHeight * 0.72 + t * bannerHeight * 0.28 + wave * 0.15
            context.lineTo(x, y)
          }

          context.closePath()

          // Flag fill with gradient
          const flagGradient = context.createLinearGradient(bannerX, bannerTop, bannerX + bannerWidth, bannerTop + bannerHeight)
          const baseAlpha = 0.48 + Math.sin(time * 0.5 + index) * 0.08
          flagGradient.addColorStop(0, `rgba(132, 24, 32, ${baseAlpha})`)
          flagGradient.addColorStop(0.5, `rgba(180, 40, 50, ${baseAlpha * 1.1})`)
          flagGradient.addColorStop(1, `rgba(80, 12, 18, ${baseAlpha * 0.8})`)
          context.fillStyle = flagGradient
          context.fill()

          // Flag border - follow wave
          context.strokeStyle = `rgba(218, 79, 64, ${0.62 + Math.sin(time * 0.7 + index) * 0.08})`
          context.lineWidth = 1.5
          context.beginPath()
          context.moveTo(bannerX + 2, bannerTop)
          for (let step = 0; step <= steps; step += 1) {
            const t = step / steps
            const x = bannerX + 2 + t * bannerWidth
            const wave = Math.sin(time * waveSpeed + t * 8 + waveOffset) * waveAmplitude * (1 - t * 0.3)
            const y = bannerTop + t * bannerHeight * 0.25 + wave * 0.2
            context.lineTo(x, y)
          }
          context.stroke()

          // Add a decorative emblem or pattern instead of kenji
          // Simple circle emblem
          context.save()
          context.beginPath()
          const emblemX = bannerX + bannerWidth * 0.5 + Math.sin(time * waveSpeed + 0.5 + waveOffset) * waveAmplitude * 0.3
          const emblemY = bannerTop + bannerHeight * 0.42 + Math.sin(time * waveSpeed * 0.9 + 0.3 + waveOffset) * waveAmplitude * 0.15
          const emblemRadius = Math.min(bannerWidth, bannerHeight) * 0.12

          // Outer ring
          context.arc(emblemX, emblemY, emblemRadius, 0, Math.PI * 2)
          context.fillStyle = `rgba(255, 215, 140, ${0.5 + Math.sin(time * 0.5 + index) * 0.1})`
          context.fill()
          context.strokeStyle = `rgba(200, 180, 120, ${0.4 + Math.sin(time * 0.6 + index * 0.5) * 0.08})`
          context.lineWidth = 1.5
          context.stroke()

          // Inner dot
          context.beginPath()
          context.arc(emblemX, emblemY, emblemRadius * 0.35, 0, Math.PI * 2)
          context.fillStyle = `rgba(200, 180, 120, ${0.6 + Math.sin(time * 0.7 + index * 0.3) * 0.1})`
          context.fill()
          context.restore()

          // Flag edge detail - flowing fabric look
          context.save()
          context.globalAlpha = 0.15
          for (let fringe = 0; fringe < 5; fringe += 1) {
            const t = (fringe + 1) / 6
            const x = bannerX + bannerWidth * t + Math.sin(time * waveSpeed + t * 8 + waveOffset + 0.5) * waveAmplitude * 0.6
            const y = bannerTop + bannerHeight * 0.75 + Math.sin(time * waveSpeed * 0.8 + t * 6 + waveOffset + 0.8) * waveAmplitude * 0.15
            context.beginPath()
            context.moveTo(x, y)
            context.lineTo(x + 4 + Math.sin(time * 1.2 + fringe) * 3, y + 8 + Math.sin(time * 0.9 + fringe * 0.5) * 4)
            context.strokeStyle = 'rgba(200, 180, 160, 0.3)'
            context.lineWidth = 1
            context.stroke()
          }
          context.restore()
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
          context.strokeStyle = `rgba(210, 190, 164, ${(0.05 + depth * 0.14) * (0.55 + progress * 0.85)})`
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
