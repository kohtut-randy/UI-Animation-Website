import {
  ELEMENT_ID_LOADER,
  PRELOADER_CURTAIN_MID_MS,
  PRELOADER_MAX_WAIT_MS,
  PRELOADER_MIN_DISPLAY_MS,
  PRELOADER_PAINT_FRAMES,
  PRELOADER_REMOVE_FALLBACK_MS,
  DATA_ATTRIBUTE_OUT,
} from 'constants/index'
import { revealRoot, unlockScroll } from 'motion/scrollLock'
import { delay, nextFrames, onTransitionEnd } from 'shared/lib'
import { setAppPhase } from './appPhaseStore'
import { loaderBridge } from './loaderBridge'
import { preloadAssets } from './preloadAssets'

/**
 * The five-phase reveal. Ordering here is the whole design: each phase exists because
 * doing its work in any other phase produces a specific visible artefact.
 */
export const startBoot = async (root: HTMLElement): Promise<void> => {
  const startedAt = performance.now()

  // MAX_WAIT is a race, not a timeout on the work: the assets keep loading, they just
  // stop being something the visitor waits behind.
  await Promise.race([preloadAssets(loaderBridge.setProgress), delay(PRELOADER_MAX_WAIT_MS)])
  loaderBridge.stopFloor()
  loaderBridge.setProgress(1)

  // MIN_DISPLAY is a floor on total elapsed time, not an added sleep, so a fast
  // connection pays nothing extra beyond reaching the floor.
  await delay(Math.max(0, PRELOADER_MIN_DISPLAY_MS - (performance.now() - startedAt)))
  await loaderBridge.settled() // the user must actually SEE 100

  /* PHASE 1: reveal #root while still fully covered. The first paint of a whole page
     is expensive; painting it behind an opaque curtain hides that cost entirely.
     Revealing at the curtain's midpoint, as a naive implementation does, makes exactly
     half of that cost visible. */
  window.scrollTo(0, 0)
  unlockScroll() // the ONE unlock call site
  revealRoot(root)

  /* PHASE 2: 'ready' means layout is final, so measure now, while still covered.
     Subscribers run lenis.resize() then ScrollTrigger.refresh(). */
  setAppPhase('ready')
  await nextFrames(PRELOADER_PAINT_FRAMES)

  // PHASE 3: lift the curtain. Transform only, 900ms, one compositor layer.
  const loader = document.getElementById(ELEMENT_ID_LOADER)
  if (loader) loader.dataset[DATA_ATTRIBUTE_OUT] = 'true'

  /* PHASE 4: 'entered' means you are visible, so play now. Fired at the curtain's
     midpoint so the entrance is already in motion as the page is uncovered, rather
     than starting on a page that has been sitting still in full view. */
  await delay(PRELOADER_CURTAIN_MID_MS)
  setAppPhase('entered')

  // PHASE 5: remove the loader once it has left the screen. transitionend with a
  // timeout fallback, because an interrupted transition fires no event at all.
  if (loader) onTransitionEnd(loader, PRELOADER_REMOVE_FALLBACK_MS, () => loader.remove())
}
