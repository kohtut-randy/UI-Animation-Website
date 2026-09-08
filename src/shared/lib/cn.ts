import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** `twMerge(clsx(...))`: clsx alone leaves real Tailwind conflicts, twMerge resolves by call order instead of stylesheet order. */
export const cn = (...classes: ClassValue[]): string => twMerge(clsx(classes))
