import { FPS_BUDGET, FPS_SAMPLE_WINDOW_MS, FPS_STRIKES, FPS_WARMUP_MS } from 'constants/index'
import { getDeviceTier } from 'shared/lib'
import { pauseIdleLoops, resumeIdleLoops } from './decor'
import { gsap } from './gsapClient'

/* Counts frames on gsap.ticker (no second rAF loop) and pauses everything in motion/decor if frame rate stays under budget. Only ever pauses DECORATIVE loops, never the scrubbed scroll/pin animations.

   Warm-up matters: the entrance timeline plus first paint is the heaviest moment in the page's life, and sampling through it would trip the guard on fine hardware. */

let stopTicker: (() => void) | null = null

export const startFpsGuard = (): (() => void) => {
  if (stopTicker) return stopTicker

  /* A device the pre-paint probe already called low never runs the loops, so there is nothing to measure. */
  if (getDeviceTier() === 'low') {
    pauseIdleLoops()
    stopTicker = () => {
      stopTicker = null
    }
    return stopTicker
  }

  const startedAt = performance.now()
  let windowStartedAt = startedAt
  let frames = 0
  let strikes = 0

  const onTick = (): void => {
    frames += 1
    const now = performance.now()
    const elapsed = now - windowStartedAt
    if (elapsed < FPS_SAMPLE_WINDOW_MS) return

    const fps = (frames * FPS_SAMPLE_WINDOW_MS) / elapsed
    frames = 0
    windowStartedAt = now

    if (now - startedAt < FPS_WARMUP_MS) return

    if (fps < FPS_BUDGET) {
      strikes += 1
      if (strikes >= FPS_STRIKES) pauseIdleLoops()
      return
    }

    /* Recovering is allowed (a transient stall shouldn't permanently strip the page), but strikes must be consecutive. */
    strikes = 0
    resumeIdleLoops()
  }

  gsap.ticker.add(onTick)

  stopTicker = () => {
    gsap.ticker.remove(onTick)
    stopTicker = null
  }

  return stopTicker
}
