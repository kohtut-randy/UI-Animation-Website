import { EVENT_PHASE_PREFIX } from 'constants/index'
import type { AppPhase } from 'shared/types'

/* An external store rather than an event, for one specific reason: a `once: true`
   event listener is wrong here, because a component that mounts AFTER the event fires
   would never learn about it and its entrance timeline would never play. `onAppPhase`
   fires immediately when the phase has already been reached, which removes the
   mount-order race entirely instead of making it unlikely.

   Two phases, not one, is the other key decision:
     'ready'   layout is final, MEASURE now (ScrollTrigger.refresh)
     'entered' you are visible, ANIMATE now (play entrance timelines)
   Conflating them is what forces a magic setTimeout, because ScrollTrigger has to
   measure a laid-out, unlocked page BEFORE the entrance plays, and the entrance must
   not run behind an opaque curtain. */

const PHASE_ORDER: readonly AppPhase[] = ['loading', 'ready', 'entered']

let phase: AppPhase = 'loading'
const subscribers = new Set<() => void>()

const rank = (value: AppPhase): number => PHASE_ORDER.indexOf(value)

export const getAppPhase = (): AppPhase => phase

export const subscribeAppPhase = (listener: () => void): (() => void) => {
  subscribers.add(listener)
  return () => {
    subscribers.delete(listener)
  }
}

/** Monotonic: the phase can only move forward, so a stray call cannot rewind the boot. */
export const setAppPhase = (next: AppPhase): void => {
  if (rank(next) <= rank(phase)) return
  phase = next
  subscribers.forEach(listener => listener())
  window.dispatchEvent(new CustomEvent(`${EVENT_PHASE_PREFIX}${next}`)) // for non-React consumers
}

/**
 * Runs `callback` once the phase reaches `target`, immediately if it already has.
 * Returns an unsubscribe.
 */
export const onAppPhase = (target: AppPhase, callback: () => void): (() => void) => {
  if (rank(phase) >= rank(target)) {
    callback()
    return () => {}
  }

  const listener = (): void => {
    if (rank(phase) < rank(target)) return
    subscribers.delete(listener)
    callback()
  }

  subscribers.add(listener)
  return () => {
    subscribers.delete(listener)
  }
}
