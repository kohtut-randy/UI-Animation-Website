import { DATA_ATTRIBUTE_REVEALED } from 'constants/index'

/* One lock, two drivers: adopts index.html's pre-bundle `overflow: hidden`, then Lenis registers as an extra driver once it exists. Both are needed: overflow works before the bundle parses, `lenis.stop()` is the only thing that stops Lenis' virtual scroll. */

export type ScrollLockDriver = { stop: () => void; start: () => void }

let driver: ScrollLockDriver | null = null

// Adopts whatever the inline script already did, so this is one mechanism, not two.
let locked = document.documentElement.style.overflow === 'hidden'

export const isScrollLocked = (): boolean => locked

/**
 * Lenis registers here. A driver arriving mid-lock inherits the lock, so it starts stopped during the preloader with no extra call site.
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
