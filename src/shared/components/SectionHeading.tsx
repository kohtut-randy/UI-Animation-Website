import type { ReactNode } from 'react'
import { cn } from 'shared/lib'

export type SectionHeadingProps = {
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  className?: string
  /** Heading level, so section order stays a real document outline. */
  as?: 'h1' | 'h2'
}

export const SectionHeading = ({ eyebrow, title, lede, className, as: Tag = 'h2' }: SectionHeadingProps) => (
  <header className={cn('flex flex-col gap-4', className)}>
    <p data-reveal className='eyebrow text-eyebrow text-brand'>
      {eyebrow}
    </p>
    <Tag data-reveal className='font-display text-display-lg text-balance'>
      {title}
    </Tag>
    {lede && (
      <p data-reveal className='max-w-[46ch] text-lede text-ink-muted'>
        {lede}
      </p>
    )}
  </header>
)
