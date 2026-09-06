import { cn } from 'shared/lib'

export type StatBlockProps = {
  value: string
  label: string
  className?: string
}

/* Renders dt/dd so a group of these is a real description list, not a grid of divs
   with a list role bolted on. `dt` has to precede `dd` in the markup, and the value
   reads better above the label, so the visual order is flipped with
   flex-col-reverse rather than by breaking the semantics. */
export const StatBlock = ({ value, label, className }: StatBlockProps) => (
  <div className={cn('flex flex-col-reverse gap-1', className)}>
    <dt className='eyebrow text-eyebrow text-ink-subtle'>{label}</dt>
    {/* nums keeps the figures tabular, so a value swap cannot reflow the row. */}
    <dd className='nums m-0 font-display text-display-md text-ink'>{value}</dd>
  </div>
)
