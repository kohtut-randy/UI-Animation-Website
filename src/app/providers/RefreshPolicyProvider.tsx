import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { initRefreshPolicy } from 'motion/refresh'

export type RefreshPolicyProviderProps = { children: ReactNode }

/* SINGLE RESPONSIBILITY: register the ScrollTrigger refresh triggers, once. Nothing
   else lives here, and in particular no Lenis lifecycle and no reveal setup: those are
   their own providers, so a change to one cannot disturb the other. */
export const RefreshPolicyProvider = ({ children }: RefreshPolicyProviderProps) => {
  useEffect(() => initRefreshPolicy(), [])

  return children
}
