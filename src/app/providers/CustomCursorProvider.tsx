import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { onAppPhase } from 'features/preloader'
import { startCustomCursor } from 'motion/customCursor'
import { prefersReducedMotion } from 'shared/lib'

export type CustomCursorProviderProps = { children: ReactNode }

/* SINGLE RESPONSIBILITY: the trailing custom cursor's lifecycle.

   Skipped entirely on reduced motion (the CSS cursor in base.css is already the
   right, static, fallback) and on coarse/no pointers (touch has no cursor to trail).
   Started at 'ready', same as the smooth scroll: before that the page is behind the
   curtain and the lock has pointer events suppressed anyway. */
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
