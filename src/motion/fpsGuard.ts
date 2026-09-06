import { FPS_BUDGET, FPS_SAMPLE_WINDOW_MS, FPS_STRIKES, FPS_WARMUP_MS } from 'constants/index'
import { getDeviceTier } from 'shared/lib'
import { pauseIdleLoops, resumeIdleLoops } from './decor'
import { gsap } from './gsapClient'

/* Counts frames on gsap.ticker (the app's single rAF, so this adds no second loop) and
   switches off everything registered in motion/decor if the frame rate stays under
   budget.

   It only ever pauses DECORATIVE loops. The scrubbed scroll animations and the pin are
   never touched, because they are the content: pausing them would leave the wall
   frozen mid-scrub, which is worse than a few dropped frames.

   Warm-up matters. The entrance timeline plus the first paint of the whole page is the
   single heaviest moment in the page's life, and sampling through it would trip the
   guard on hardware that is actually fine. */

let stopTicker: (() => void) | null = null

export const startFpsGuard = (): (() => void) => {
  if (stopTicker) return stopTicker

  /* A device the pre-paint probe already called low never runs the loops at all, so
     there is nothing to measure and no reason to keep a sampler alive. */
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

    /* Recovering is allowed: a transient stall (another tab compositing, a GC pause)
       should not permanently strip the page. Strikes have to be consecutive. */
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
