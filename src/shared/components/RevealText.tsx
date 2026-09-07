import { cn } from 'shared/lib'

/* Kinetic display type: each line rises out of its own clipped box.

   The lines are REACT-RENDERED SPANS, not GSAP SplitText. That is the load-bearing
   choice. SplitText measures the laid-out text and injects wrappers, so it has to
   re-split on every resize and on every font swap, and each re-split throws away the
   elements any live tween is holding a reference to. Passing the lines in as data
   means the DOM is stable for the life of the page: a resize changes where the lines
   wrap visually, never how many elements exist.

   The cost, stated honestly: line breaks are authored rather than measured, so they are
   chosen per breakpoint by the caller instead of being automatic. For three headlines
   that is a better trade than a resize-fragile split, and it also drops a plugin. */

export type RevealTextProps = {
  /** One entry per line. Authored, not measured. */
  lines: readonly string[]
  className?: string
  lineClassName?: string
}

export const RevealText = ({ lines, className, lineClassName }: RevealTextProps) => (
  <span className={cn('flex flex-col items-start', className)}>
    {lines.map(line => (
      <span key={line} className='inline-block overflow-hidden pb-[0.08em] w-auto  hover:text-[#880808] cursor-pointer'>
        <span data-reveal-line className={cn('block', lineClassName)}>
          {line}
        </span>
      </span>
    ))}
  </span>
)
