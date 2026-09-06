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
  <span className={cn('flex flex-col', className)}>
    {lines.map(line => (
      // The clip box. overflow-hidden is what makes translateY(110%) read as "below
      // the line" rather than "shifted down the page".
      <span key={line} className='block overflow-hidden pb-[0.08em]'>
        {/* The translateY offset lives in base.css behind html[data-motion='on'], not
            here, so the line is visible if the bundle never runs. */}
        {/* No will-change class here on purpose. The entrance timeline promotes these
            lines for the duration of the rise and releases them onComplete, so a
            permanent class would leave the biggest painted element on the page holding
            a GPU layer for the whole session. */}
        <span data-reveal-line className={cn('block', lineClassName)}>
          {line}
        </span>
      </span>
    ))}
  </span>
)
