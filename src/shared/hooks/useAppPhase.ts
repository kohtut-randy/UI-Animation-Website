import { useSyncExternalStore } from 'react'
import { getAppPhase, subscribeAppPhase } from 'features/preloader'
import type { AppPhase } from 'shared/types'

/* useSyncExternalStore rather than useState plus an effect: the phase is read during
   render by whoever needs it, and React handles the tearing and the subscription. The
   store fires at most twice in the page's life, so this costs nothing. */
export const useAppPhase = (): AppPhase => useSyncExternalStore(subscribeAppPhase, getAppPhase, () => 'loading')
