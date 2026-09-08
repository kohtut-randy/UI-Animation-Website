import { FpsGuardProvider } from 'app/providers/FpsGuardProvider'
import { RefreshPolicyProvider } from 'app/providers/RefreshPolicyProvider'
import { RevealProvider } from 'app/providers/RevealProvider'
import { SmoothScrollProvider } from 'app/providers/SmoothScrollProvider'
import { Hero } from 'features/hero'
import { Wall } from 'features/wall'

/* One provider per responsibility, deliberately not merged. No wrapper here sets
    transform/filter/backdrop-filter/will-change/contain: that would create a
    containing block above the pinned section and break its fixed pin (asserted in dev
    by motion/checkPinParents.ts). */
export const App = () => (
  <SmoothScrollProvider>
    <FpsGuardProvider>
      <RefreshPolicyProvider>
        <RevealProvider>
          {/* <a
              href='#main'
              className='sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded-pill focus-visible:bg-brand focus-visible:px-5 focus-visible:py-2.5 focus-visible:text-brand-ink'
            >
              Skip to content
            </a> */}
          <main id='main'>
            <Hero />
            <Wall />
          </main>
        </RevealProvider>
      </RefreshPolicyProvider>
    </FpsGuardProvider>
  </SmoothScrollProvider>
)
