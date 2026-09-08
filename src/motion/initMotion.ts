import { DATA_ATTRIBUTE_MOTION, DURATION_MD, EASE_OUT } from 'constants/index'
import { gsap, ScrollTrigger } from './gsapClient'

let hasInit = false

/** Called once from main.tsx, before the first render. */
export const initMotion = (): void => {
  if (hasInit) return
  hasInit = true

  /* Arms every hidden-until-animated CSS state, before the first React render, so there is no visible-then-hidden flash. index.html's watchdog clears it if the bundle is broken. */
  document.documentElement.dataset[DATA_ATTRIBUTE_MOTION] = 'on'

  // force3D stays 'auto': promote during a tween, release after. A global true would burn GPU memory on mobile.
  gsap.config({ nullTargetWarn: false })
  gsap.defaults({ ease: EASE_OUT, duration: DURATION_MD, overwrite: 'auto' })

  ScrollTrigger.config({
    /* Mobile URL bar show/hide fires resize with a height-only delta; refreshing there jumps pins mid-scroll. Do not add a manual resize-to-refresh listener anywhere. */
    ignoreMobileResize: true,

    /* limitCallbacks stays OFF (its default): the reveal batch's onEnter must still fire
       when scroll jumps past a whole trigger in one tick (deep link, find-in-page), or
       content stays at opacity 0 permanently. Costs little: only the reveal batch and
       the wall pin's onUpdate/onToggle use callbacks here. */
  })

  /* ScrollTrigger.normalizeScroll() is deliberately NOT called: it hijacks the same
     wheel and touch events Lenis owns. Enabling both is the single most common
     Lenis-plus-GSAP failure report. */
}
