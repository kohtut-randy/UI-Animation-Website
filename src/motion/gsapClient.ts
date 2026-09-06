/* The ONLY file in the repo that imports from 'gsap'. Enforced by an ESLint
   no-restricted-imports rule scoped to everything outside src/motion.

   Import 'gsap/ScrollTrigger' specifically, never 'gsap/all': the GSAP 3.15 tarball
   ships SplitText, ScrollSmoother and DrawSVGPlugin too, so 'gsap/all' would pull in
   roughly 40 kB of plugins this build never uses. */
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* Module scope plus ES module caching guarantees exactly one registration. No
   `typeof window !== 'undefined'` guard is needed: this is a client-only SPA with no
   SSR, which is itself a deliberate choice (ScrollTrigger has to measure real layout,
   and an opacity-0 hydration pass is exactly what produces stale offsets). */
gsap.registerPlugin(useGSAP, ScrollTrigger)

export { gsap, ScrollTrigger, useGSAP }
