/* This is a motion showcase, so full motion is the default even when an embedded
   browser reports a reduced OS preference. The explicit URL mode remains available
   for accessibility checks and reviewer QA. */
export const prefersReducedMotion = (): boolean => document.documentElement.dataset.motionMode === 'reduce'
