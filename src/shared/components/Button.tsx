import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from 'shared/lib'

/* cva because this primitive has two real variant axes (tone and size) that combine.
   Hand-rolled ternaries at two axes is where that stops being readable.

   HOVER IS CSS, NOT GSAP, everywhere in this build. Three reasons: a CSS transition on
   transform and opacity is compositor-driven and needs no listener; it works before the
   bundle has hydrated anything; and it means GSAP never animates a property that also
   has a CSS transition on it, which is the classic cause of a tween fighting a
   transition and landing on the wrong value. */

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

/* The brief asks for CTAs that are clickable and hover, and that navigate nowhere. So
   this is a real <button>, keyboard reachable with a visible focus ring, and it has no
   onClick of its own: inertness is the spec, not an oversight. */
export const Button = ({ tone, size, className, type = 'button', ...rest }: ButtonProps) => (
  <button type={type} className={cn(button({ tone, size }), className)} {...rest} />
)
