import { DATA_ATTRIBUTE_MOTION, DURATION_MD, EASE_OUT } from 'constants/index'
import { gsap, ScrollTrigger } from './gsapClient'

let hasInit = false

/** Called once from main.tsx, before the first render. */
export const initMotion = (): void => {
  if (hasInit) return
  hasInit = true

  /* Raise the flag that arms every hidden-until-animated CSS state. Set here, before
     the first React render, so there is no frame where content is visible and then
     hidden. index.html's watchdog clears it if the bundle turns out to be broken. */
  document.documentElement.dataset[DATA_ATTRIBUTE_MOTION] = 'on'

  /* force3D is left at its default 'auto': promote during a tween, release after. A
     global force3D: true would permanently promote every animated node and burn GPU
     memory on mobile. Exactly two tweens in this build opt into `true`. */
  gsap.config({ nullTargetWarn: false })
  gsap.defaults({ ease: EASE_OUT, duration: DURATION_MD, overwrite: 'auto' })

  ScrollTrigger.config({
    /* The mobile URL bar showing and hiding fires resize with a height-only delta.
       Refreshing there makes pins visibly jump mid-scroll and costs a full layout
       pass. This flag is the correct fix, and it is why a manual resize-to-refresh
       listener must NOT be added anywhere. */
    ignoreMobileResize: true,

    /* limitCallbacks is deliberately LEFT OFF (its default), against first instinct.

       With it on, ScrollTrigger skips onEnter when the scroll position jumps past a
       whole trigger inside a single tick. That is a sensible guard for decoration, and
       it is wrong for this build, because the reveal batch's onEnter is what makes
       content visible at all. Measured: with limitCallbacks: true, one
       window.scrollTo() down to the wall left every heading element at opacity 0
       permanently, which is also what a deep link and a find-in-page jump do.

       The guard costs little here regardless: the only callbacks in the build are the
       reveal batch (which fires once and then kills its trigger) and the wall pin's
       onUpdate and onToggle, both of which write a handful of properties. */
  })

  /* ScrollTrigger.normalizeScroll() is deliberately NOT called: it hijacks the same
     wheel and touch events Lenis owns. Enabling both is the single most common
     Lenis-plus-GSAP failure report. */
}
