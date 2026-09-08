import type { gsap } from './gsapClient'

/* Registry of DECORATIVE loops (idle floats/drifts) the FPS guard can switch off without touching the scrubbed scroll animations the page depends on.

   Holds no DOM references and creates no tweens: callers register what they built and unregister on cleanup. */

type IdleLoop = gsap.core.Tween | gsap.core.Timeline

const loops = new Set<IdleLoop>()
let paused = false

/** Registers a loop and returns its unregister. A loop registered while paused starts paused. */
export const registerIdleLoop = (loop: IdleLoop): (() => void) => {
  loops.add(loop)
  if (paused) loop.pause()

  return () => {
    loops.delete(loop)
  }
}

export const pauseIdleLoops = (): void => {
  if (paused) return
  paused = true
  loops.forEach(loop => loop.pause())
}

export const resumeIdleLoops = (): void => {
  if (!paused) return
  paused = false
  loops.forEach(loop => loop.resume())
}

export const areIdleLoopsPaused = (): boolean => paused

/** Dev-only readout for the perf pass. */
export const getIdleLoopCount = (): number => loops.size
