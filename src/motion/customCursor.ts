import { CURSOR_HOTSPOT_X, CURSOR_HOTSPOT_Y, CURSOR_LERP, CURSOR_SIZE } from 'constants/index'
import { gsap } from './gsapClient'

/* Replaces the static CSS `cursor: url(...)` with an <img> that eases toward the real
   pointer position on gsap.ticker, the app's single rAF loop. Swaps art on
   pointerdown/up for a pressed state. The CSS cursor in base.css is left in place as
   the fallback: it is what renders for touch input, reduced motion and the instant
   before this starts. */

let stopTicker: (() => void) | null = null

export const startCustomCursor = (): (() => void) => {
  if (stopTicker) return stopTicker

  const el = document.createElement('img')
  el.src = '/mouse_ac.svg'
  el.alt = ''
  el.width = CURSOR_SIZE
  el.height = CURSOR_SIZE
  el.setAttribute('aria-hidden', 'true')
  el.style.position = 'fixed'
  el.style.top = '0'
  el.style.left = '0'
  el.style.zIndex = '2147483647'
  el.style.pointerEvents = 'none'
  el.style.willChange = 'transform'
  el.style.transform = 'translate3d(-100px, -100px, 0)'
  document.body.appendChild(el)

  const previousCursor = document.body.style.cursor
  document.body.style.cursor = 'none'

  let targetX = -100
  let targetY = -100
  let currentX = -100
  let currentY = -100
  let primed = false

  const onMove = (event: PointerEvent): void => {
    targetX = event.clientX
    targetY = event.clientY
    if (primed) return
    primed = true
    currentX = targetX
    currentY = targetY
  }
  const onDown = (): void => {
    el.src = '/mouse_ac.svg'
  }
  const onUp = (): void => {
    el.src = '/mouse.svg'
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)

  const onTick = (): void => {
    currentX += (targetX - currentX) * CURSOR_LERP
    currentY += (targetY - currentY) * CURSOR_LERP
    el.style.transform = `translate3d(${currentX - CURSOR_HOTSPOT_X}px, ${currentY - CURSOR_HOTSPOT_Y}px, 0)`
  }
  gsap.ticker.add(onTick)

  stopTicker = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
    gsap.ticker.remove(onTick)
    document.body.style.cursor = previousCursor
    el.remove()
    stopTicker = null
  }
  return stopTicker
}
