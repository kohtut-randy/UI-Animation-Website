import { cn } from 'shared/lib'

export type StatBlockProps = {
  value: string
  label: string
  className?: string
}

// dt/dd for a real description list; visual order flipped with flex-col-reverse rather than by breaking dt-before-dd semantics.
export const StatBlock = ({ value, label, className }: StatBlockProps) => (
  <div className={cn('flex flex-col-reverse gap-1', className)}>
    <dt className='eyebrow text-eyebrow text-ink-subtle'>{label}</dt>
    {/* nums keeps the figures tabular, so a value swap cannot reflow the row. */}
    <dd className='nums m-0 font-display text-display-md text-ink'>{value}</dd>
  </div>
)
