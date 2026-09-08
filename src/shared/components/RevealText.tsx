import { cn } from 'shared/lib'

/* Kinetic display type: each line rises out of its own clipped box. Lines are React-rendered spans, not GSAP SplitText, so the DOM stays stable across resizes/font swaps instead of being re-split (and losing any live tween's reference). Trade-off: line breaks are authored per breakpoint, not measured. */

export type RevealTextProps = {
  /** One entry per line. Authored, not measured. */
  lines: readonly string[]
  className?: string
  lineClassName?: string
}

export const RevealText = ({ lines, className, lineClassName }: RevealTextProps) => (
  <span className={cn('flex flex-col items-start', className)}>
    {lines.map(line => (
      <span key={line} className='inline-block overflow-hidden pb-[0.08em] w-auto  hover:text-[#880808] '>
        <span data-reveal-line className={cn('block', lineClassName)}>
          {line}
        </span>
      </span>
    ))}
  </span>
)
