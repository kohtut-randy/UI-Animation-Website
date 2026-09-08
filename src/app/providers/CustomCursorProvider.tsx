import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { onAppPhase } from 'features/preloader'
import { startCustomCursor } from 'motion/customCursor'
import { prefersReducedMotion } from 'shared/lib'

export type CustomCursorProviderProps = { children: ReactNode }

/* Skips reduced motion and coarse/touch pointers; starts at 'ready' like the smooth scroll. */
export const CustomCursorProvider = ({ children }: CustomCursorProviderProps) => {
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return

    let stop: (() => void) | undefined
    const stopPhase = onAppPhase('ready', () => {
      stop = startCustomCursor()
    })

    return () => {
      stopPhase()
      stop?.()
    }
  }, [])

  return children
}
