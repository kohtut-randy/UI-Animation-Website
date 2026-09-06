import { FpsGuardProvider } from 'app/providers/FpsGuardProvider'
import { RefreshPolicyProvider } from 'app/providers/RefreshPolicyProvider'
import { RevealProvider } from 'app/providers/RevealProvider'
import { SmoothScrollProvider } from 'app/providers/SmoothScrollProvider'
import { Hero } from 'features/hero'
import { Wall } from 'features/wall'

/* One provider per responsibility, deliberately not merged. The Lenis lifecycle, the
   frame-rate guard, the refresh policy and the reveal system each mount and unmount
   independently, so a change to one cannot disturb the others.

   No wrapper here sets transform, filter, backdrop-filter, will-change or contain. That
   is a hard constraint, not a style choice: any of them on an ancestor of the pinned
   section would create a containing block and silently break the pin's position: fixed.
   motion/checkPinParents.ts asserts it in dev. */
export const App = () => (
  <SmoothScrollProvider>
    <FpsGuardProvider>
      <RefreshPolicyProvider>
        <RevealProvider>
          {/* Visible only on focus. The first section is animation-heavy and the header
              nav sits above it, so a keyboard visitor gets a way past both. */}
          <a
            href='#main'
            className='sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded-pill focus-visible:bg-brand focus-visible:px-5 focus-visible:py-2.5 focus-visible:text-brand-ink'
          >
            Skip to content
          </a>
          <main id='main'>
            <Hero />
            <Wall />
          </main>
        </RevealProvider>
      </RefreshPolicyProvider>
    </FpsGuardProvider>
  </SmoothScrollProvider>
)
