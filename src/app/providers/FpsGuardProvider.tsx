import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { onAppPhase } from 'features/preloader'
import { startFpsGuard } from 'motion/fpsGuard'

export type FpsGuardProviderProps = { children: ReactNode }

/* Started at 'entered', not on mount: before that the page is behind the curtain doing its heaviest work (first paint plus the entrance timeline), and sampling through it would trip the guard on fine hardware. */
export const FpsGuardProvider = ({ children }: FpsGuardProviderProps) => {
  useEffect(() => {
    let stop: (() => void) | undefined

    const stopPhase = onAppPhase('entered', () => {
      stop = startFpsGuard()
    })

    return () => {
      stopPhase()
      stop?.()
    }
  }, [])

  return children
}
