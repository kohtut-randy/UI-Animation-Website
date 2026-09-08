import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { onAppPhase } from 'features/preloader'
import { acquireSmoothScroll, releaseSmoothScroll } from 'motion/smoothScroll'

export type SmoothScrollProviderProps = { children: ReactNode }

/* SINGLE RESPONSIBILITY: the Lenis lifecycle. Created after 'ready', not on mount, to keep the chunk out of the critical path and because the scroll lock is on until then. */
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
