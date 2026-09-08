import { EVENT_PHASE_PREFIX } from 'constants/index'
import type { AppPhase } from 'shared/types'

/* External store, not an event: `onAppPhase` fires immediately if the phase was already reached, so a late-mounting component's entrance timeline is never missed.
   Two phases, not one: 'ready' (layout final, MEASURE) and 'entered' (visible, ANIMATE) — conflating them would force a magic setTimeout between measuring and animating. */

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
