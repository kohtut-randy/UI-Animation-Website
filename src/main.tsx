import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from 'app/App'
import { ELEMENT_ID_ROOT } from 'constants/index'
import { startBoot } from 'features/preloader'
import { initMotion } from 'motion/initMotion'
import 'styles/index.css'

const container = document.getElementById(ELEMENT_ID_ROOT)
if (!container) throw new Error(`#${ELEMENT_ID_ROOT} is missing from index.html`)

/* Order matters. initMotion sets GSAP defaults and ScrollTrigger config, so it has to
   run before any component builds a timeline. startBoot runs after render, because the
   manifest waits on React having committed and painted. */
initMotion()

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

void startBoot(container)
