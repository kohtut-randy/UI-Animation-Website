import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * The team's helper, unchanged: `twMerge(clsx(...))`.
 *
 * clsx alone would leave real conflicts in the output. `cn('p-2', 'p-4')` has to be
 * `p-4`, and with plain string concatenation the winner depends on stylesheet order
 * rather than on call order, which is the bug class twMerge exists to remove. That is
 * why these two stay in a build that otherwise refuses dependencies.
 */
export const cn = (...classes: ClassValue[]): string => twMerge(clsx(classes))
