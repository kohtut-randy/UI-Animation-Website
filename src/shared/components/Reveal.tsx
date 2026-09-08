import type { ElementType, ReactNode } from 'react'
import { cn } from 'shared/lib'

/* Renders `data-reveal` and nothing else: one ScrollTrigger.batch in motion/reveal.ts picks up every such element, so forty reveals cost one batch, not forty triggers. Hidden initial state lives in base.css, never in JS. */

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
