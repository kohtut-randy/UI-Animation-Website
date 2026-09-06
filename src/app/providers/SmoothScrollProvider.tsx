import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { onAppPhase } from 'features/preloader'
import { acquireSmoothScroll, releaseSmoothScroll } from 'motion/smoothScroll'

export type SmoothScrollProviderProps = { children: ReactNode }

/* SINGLE RESPONSIBILITY: the Lenis lifecycle. Nothing else lives here. No
   ScrollTrigger refresh, no phase-driven animation, no reveal setup: those are their
   own providers.

   Lenis is created after the 'ready' phase, not on mount, for two reasons: it keeps the
   chunk out of the critical path during the preloader, and the scroll lock is still on
   until 'ready', so an instance created earlier would spend its whole life stopped. */
export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  useEffect(() => {
    let release: (() => void) | null = null
    let cancelled = false
    let acquired = false

    const stopPhase = onAppPhase('ready', () => {
      acquired = true
      void acquireSmoothScroll().then(releaseFn => {
        // Cleanup can precede resolution: that is the leak StrictMode exposes.
        if (cancelled) {
          releaseFn()
          return
        }
        release = releaseFn
      })
    })

    return () => {
      cancelled = true
      stopPhase()
      if (release) release()
      // Balance the refcount that acquire() incremented synchronously, in the case
      // where cleanup ran before the dynamic import resolved.
      else if (acquired) releaseSmoothScroll()
    }
  }, [])

  return children
}
