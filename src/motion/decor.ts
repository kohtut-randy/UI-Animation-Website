import type { gsap } from './gsapClient'

/* The registry of DECORATIVE loops: idle floats, drifts, anything that runs forever
   and that nobody would miss if it stopped.

   It exists so the runtime FPS guard has something specific to switch off. Without a
   registry the only options are "pause the global timeline", which would also freeze
   the scrubbed scroll animations the page depends on, or "pause nothing". Registering
   the decorative work separately is what makes graceful degradation a real switch
   rather than a claim.

   The registry holds no DOM references and creates no tweens itself: callers register
   what they already built and unregister on cleanup, so a reverted gsap.matchMedia
   context cannot leave a dangling entry behind. */

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
