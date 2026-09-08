/** Resolves after `ms`. */
export const delay = (ms: number): Promise<void> => new Promise(resolve => window.setTimeout(resolve, ms))

/** Resolves after `count` painted animation frames (two = committed and actually painted). */
export const nextFrames = (count: number): Promise<void> =>
  new Promise(resolve => {
    let remaining = Math.max(1, count)
    const step = (): void => {
      remaining -= 1
      if (remaining <= 0) {
        resolve()
        return
      }
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })

/** Rejects if `promise` hasn't settled within `ms`; used per asset so one hanging request can't hold the manifest open. */
export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)
    promise.then(
      value => {
        window.clearTimeout(timer)
        resolve(value)
      },
      error => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })

/** Resolves on `window.load`, or immediately if it has already fired. */
export const waitForWindowLoad = (): Promise<void> =>
  document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener('load', () => resolve(), { once: true }))

/** Runs `callback` on the element's next transitionend, or after `fallbackMs` if an interrupted/never-animated transition fires nothing. Exactly one path ever runs. */
export const onTransitionEnd = (element: HTMLElement, fallbackMs: number, callback: () => void): void => {
  let done = false

  const run = (): void => {
    if (done) return
    done = true
    window.clearTimeout(timer)
    element.removeEventListener('transitionend', onEnd)
    callback()
  }

  const onEnd = (event: TransitionEvent): void => {
    if (event.target === element) run()
  }

  const timer = window.setTimeout(run, fallbackMs)
  element.addEventListener('transitionend', onEnd)
}
