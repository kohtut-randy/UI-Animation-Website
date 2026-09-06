import type { ElementType, ReactNode } from 'react'
import { cn } from 'shared/lib'

/* The reveal-on-scroll wrapper. It renders an element carrying `data-reveal` and
   nothing else: no hook, no ScrollTrigger, no effect.

   That is the point. ONE ScrollTrigger.batch in motion/reveal.ts picks up every
   [data-reveal] element on the page, so forty reveals cost one batch instead of forty
   triggers. A component that created its own trigger would look identical to use and
   would not scale.

   The hidden initial state lives in base.css (`[data-reveal] { opacity: 0 }`), not
   here and not in JS. Two things follow: nothing flashes before the bundle runs, and
   JS makes zero style writes before the first paint. */

export type RevealProps = {
  children: ReactNode
  className?: string
  as?: ElementType
  /** Larger travel for heavy blocks. Maps to a distance constant in motion/reveal.ts. */
  distance?: 'sm' | 'lg'
}

export const Reveal = ({ children, className, as: Tag = 'div', distance = 'sm' }: RevealProps) => (
  <Tag data-reveal data-reveal-distance={distance} className={cn(className)}>
    {children}
  </Tag>
)
