import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { onAppPhase } from 'features/preloader'
import { initReveals } from 'motion/reveal'

export type RevealProviderProps = { children: ReactNode }

/* SINGLE RESPONSIBILITY: stand up the one batched reveal system, over the whole tree.

   It waits for the 'ready' phase before initialising. That is not a delay for its own
   sake: ScrollTrigger.batch measures every [data-reveal] element when it is created, so
   creating it earlier would measure a page that is still locked and not laid out, and
   every trigger position would be wrong. 'ready' is precisely the moment layout is
   final and the page is unlocked but still hidden behind the curtain. */
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

  /* display: contents so this wrapper is invisible to layout. It exists only to give
     initReveals a scope element, and a real box here would sit between <body> and
     <main> and could become a containing block above the pinned section. */
  return (
    <div ref={scope} className='contents'>
      {children}
    </div>
  )
}
