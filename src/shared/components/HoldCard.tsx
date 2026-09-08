import { Hold } from './Hold'
import { cn } from 'shared/lib'
import type { HoldColor, HoldShape } from 'shared/types'

export type HoldCardProps = {
  index: number
  name: string
  grade: string
  color: HoldColor
  shape: HoldShape
  setter: string
  zone: string
  note: string
  className?: string
}

/* One problem on the wall: presentation only, no state. Every hover here is a CSS transition on its own element (compositor-driven, works pre-hydration). The scrubbed emphasis tween in useWallMotion targets [data-card-emphasis], a different element. */

export const HoldCard = ({ index, name, grade, color, shape, setter, zone, note, className }: HoldCardProps) => (
  <article
    className={cn(
      'group relative flex shrink-0 snap-center flex-col justify-between overflow-hidden rounded-card',
      'border border-line bg-surface-raised p-6 md:p-7',
      'transition-[transform,border-color,background-color] duration-(--duration-base) ease-(--ease-power3-out)',
      'hover:-translate-y-1.5 hover:border-line-strong hover:bg-surface-hover',
      className,
    )}
  >
    {/* Brand wash on hover: opacity on its own absolute layer so nothing repaints the card's background. */}
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_0%,var(--color-jug-500)_0%,transparent_60%)] opacity-0 transition-opacity duration-(--duration-base) group-hover:opacity-[0.09]'
    />

    <header className='relative flex items-start justify-between gap-4'>
      <div className='flex flex-col gap-1'>
        <span className='nums eyebrow text-eyebrow text-ink-subtle'>{String(index + 1).padStart(2, '0')}</span>
        <h3 className='font-display text-display-md leading-none text-ink'>{name}</h3>
      </div>
      {/* The hold art scales up slightly on hover: transform only, own element. */}
      <div className='size-16 shrink-0 transition-transform duration-(--duration-base) ease-(--ease-back-out) group-hover:scale-110 md:size-20'>
        <Hold color={color} shape={shape} spin={index * 29} className='size-full' />
      </div>
    </header>

    <p className='relative mt-6 text-sm leading-relaxed text-ink-muted'>{note}</p>

    <footer className='relative mt-6 flex items-end justify-between gap-4 border-t border-line pt-5'>
      <dl className='flex flex-col gap-1'>
        <dt className='eyebrow text-eyebrow text-ink-subtle'>Zone</dt>
        <dd className='m-0 text-sm text-ink'>{zone}</dd>
      </dl>
      <dl className='flex flex-col gap-1'>
        <dt className='eyebrow text-eyebrow text-ink-subtle'>Set by</dt>
        <dd className='m-0 text-sm text-ink'>{setter}</dd>
      </dl>
      <span className='nums rounded-pill bg-brand px-3 py-1.5 font-display text-lg leading-none text-brand-ink'>{grade}</span>
    </footer>
  </article>
)
