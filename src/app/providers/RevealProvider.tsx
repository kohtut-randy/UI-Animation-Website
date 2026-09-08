import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { onAppPhase } from 'features/preloader'
import { initReveals } from 'motion/reveal'

export type RevealProviderProps = { children: ReactNode }

/* Waits for 'ready' before initialising: ScrollTrigger.batch measures every [data-reveal] element on creation, and 'ready' is the first moment layout is final and unlocked (still behind the curtain). */
export const RevealProvider = ({ children }: RevealProviderProps) => {
  const scope = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let teardown: (() => void) | undefined

    const stopPhase = onAppPhase('ready', () => {
      if (scope.current) teardown = initReveals(scope.current)
    })

    return () => {
      stopPhase()
      teardown?.()
    }
  }, [])

  /* display: contents keeps this wrapper invisible to layout so it cannot become a containing block above the pinned section. */
  return (
    <div ref={scope} className='contents'>
      {children}
    </div>
  )
}
