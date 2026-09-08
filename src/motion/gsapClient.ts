/* The ONLY file in the repo that imports from 'gsap' (enforced by ESLint outside src/motion).
   Import 'gsap/ScrollTrigger' specifically, never 'gsap/all': it ships ~40kB of plugins this build never uses. */
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* Module scope plus ES module caching guarantees exactly one registration; no SSR guard needed since this is a client-only SPA. */
gsap.registerPlugin(useGSAP, ScrollTrigger)

export { gsap, ScrollTrigger, useGSAP }
