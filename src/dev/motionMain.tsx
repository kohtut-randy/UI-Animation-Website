import { createRoot } from 'react-dom/client'
import { MotionProbe } from 'dev/MotionProbe'
import { initMotion } from 'motion/initMotion'
import './devStyles.css'

const container = document.getElementById('motion-probe')
if (!container) throw new Error('#motion-probe is missing from motion.html')

initMotion()
createRoot(container).render(<MotionProbe />)
