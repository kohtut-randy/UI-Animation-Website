import { createRoot } from 'react-dom/client'
import { TokenPreview } from 'dev/TokenPreview'
import './devStyles.css'

const container = document.getElementById('token-preview')
if (!container) throw new Error('#token-preview is missing from tokens.html')

createRoot(container).render(<TokenPreview />)
