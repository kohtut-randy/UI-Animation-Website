import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { initRefreshPolicy } from 'motion/refresh'

export type RefreshPolicyProviderProps = { children: ReactNode }

/* SINGLE RESPONSIBILITY: registers the ScrollTrigger refresh triggers, once; no Lenis lifecycle, no reveal setup here. */
export const RefreshPolicyProvider = ({ children }: RefreshPolicyProviderProps) => {
  useEffect(() => initRefreshPolicy(), [])

  return children
}
