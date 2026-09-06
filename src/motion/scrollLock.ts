import { DATA_ATTRIBUTE_REVEALED } from 'constants/index'

/* One lock, two drivers.

   There are NOT two competing lock mechanisms here. This module owns the lock, adopts
   the pre-bundle `overflow: hidden` that index.html already set rather than
   duplicating it, and lets Lenis register as an extra driver once it exists.

   Both drivers are needed and neither alone is enough. `overflow: hidden` is the only
   thing that works before the bundle parses, when Lenis does not exist. `lenis.stop()`
   is the only thing that stops Lenis' VIRTUAL scroll: with Lenis running, overflow
   alone does not stop it accumulating wheel deltas, which then jump on unlock. */

export type ScrollLockDriver = { stop: () => void; start: () => void }

let driver: ScrollLockDriver | null = null

// Adopt whatever the inline script already did. This is the line that makes it one
// mechanism instead of two: the module reads the existing state rather than assuming.
let locked = document.documentElement.style.overflow === 'hidden'

export const isScrollLocked = (): boolean => locked

/**
 * Lenis registers here. A driver arriving mid-lock inherits the lock, so Lenis starts
 * stopped during the preloader with no extra call site.
 */
export const registerScrollLockDriver = (next: ScrollLockDriver | null): void => {
  driver = next
  if (!driver) return
  if (locked) driver.stop()
  else driver.start()
}

export const lockScroll = (): void => {
  locked = true
  document.documentElement.style.overflow = 'hidden'
  driver?.stop()
}

/** The single call site that reverses both mechanisms, in the right order. */
export const unlockScroll = (): void => {
  locked = false
  document.documentElement.style.overflow = ''
  driver?.start()
}

/** Reveals #root. Paired with the lock because both are undone in the same phase. */
export const revealRoot = (root: HTMLElement): void => {
  root.dataset[DATA_ATTRIBUTE_REVEALED] = 'true'
}
