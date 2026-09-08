// Motion showcase: full motion is the default even under OS reduced-motion; the explicit URL mode is for accessibility QA.
export const prefersReducedMotion = (): boolean => document.documentElement.dataset.motionMode === 'reduce'
