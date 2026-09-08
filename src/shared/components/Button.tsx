import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from 'shared/lib'

/* cva: two real variant axes (tone, size) that combine. Hover is CSS, not GSAP, everywhere in this build — compositor-driven, works pre-hydration, and avoids a tween fighting a CSS transition on the same property. */

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap ' +
    // transform and opacity only, and a duration token so the feel matches the GSAP eases
    'transition-[transform,background-color,border-color,color,opacity] duration-(--duration-fast) ' +
    'ease-(--ease-power2-out) hover:-translate-y-0.5 active:translate-y-0 ' +
    'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus',
  {
    variants: {
      tone: {
        brand: 'bg-brand text-brand-ink hover:bg-brand-hover',
        outline: 'border border-line-strong text-ink hover:border-ink-muted hover:bg-surface-hover',
        ghost: 'text-ink-muted hover:text-ink',
      },
      size: {
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3.5 text-base',
      },
    },
    defaultVariants: { tone: 'brand', size: 'md' },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>

// A real <button>, keyboard reachable, with no onClick: inertness is the spec, this build's CTAs navigate nowhere.
export const Button = ({ tone, size, className, type = 'button', ...rest }: ButtonProps) => (
  <button type={type} className={cn(button({ tone, size }), className)} {...rest} />
)
