/* DOM ids and data attributes shared between index.html's inline shell and the bundle.
   These are a contract across a boundary the type system cannot see, so they live in
   one place and both sides import or mirror them. */
export const ELEMENT_ID_ROOT = 'root'
export const ELEMENT_ID_LOADER = 'loader'
export const ELEMENT_ID_LOADER_BAR = 'loader-bar'
export const ELEMENT_ID_LOADER_COUNT = 'loader-count'

export const DATA_ATTRIBUTE_REVEALED = 'revealed'
export const DATA_ATTRIBUTE_OUT = 'out'
export const DATA_ATTRIBUTE_TIER = 'tier'

/* Arms the hidden-until-animated CSS states in base.css. Set by motion/initMotion.ts,
   cleared by index.html's watchdog. */
export const DATA_ATTRIBUTE_MOTION = 'motion'

/* Non-React consumers listen for these; the phase store dispatches them. */
export const EVENT_PHASE_PREFIX = 'crux:'
