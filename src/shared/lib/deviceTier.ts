import { DATA_ATTRIBUTE_TIER } from 'constants/index'
import type { DeviceTier } from 'shared/types'

/* The tier is decided by the inline probe in index.html, before the first paint, and
   only read here. Deciding it in the bundle instead would mean the expensive
   decorative work had already been laid out once before being removed. */
export const getDeviceTier = (): DeviceTier => (document.documentElement.dataset[DATA_ATTRIBUTE_TIER] === 'low' ? 'low' : 'high')
