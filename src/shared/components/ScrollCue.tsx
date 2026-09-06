import { cn } from 'shared/lib'

export type ScrollCueProps = { className?: string; label?: string }

/* Decorative, so the animation is a CSS keyframe rather than a tween: it is one idle
   loop that no other system needs to coordinate with, and CSS keyframes keep it off
   the GSAP timeline entirely. The reduced-motion block in base.css stops it. */
export const ScrollCue = ({ className, label = 'Scroll' }: ScrollCueProps) => (
  <div className={cn('flex items-center gap-3 text-ink-subtle', className)}>
    <span className='eyebrow text-eyebrow'>{label}</span>
    <span aria-hidden='true' className='relative block h-10 w-px overflow-hidden bg-line-strong'>
      <span className='absolute inset-x-0 top-0 block h-4 animate-[crux-cue_2s_ease-in-out_infinite] bg-brand' />
    </span>
  </div>
)
