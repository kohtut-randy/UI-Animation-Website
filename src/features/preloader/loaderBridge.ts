/* Typed edge of the `window.CRUX_LOADER` global index.html defines; every method no-ops rather than throws since the shell can legitimately be absent (post-watchdog, dev harness pages). */

type LoaderShell = {
  setProgress: (value: number) => void
  stopFloor: () => void
  settled: () => Promise<void>
}

// A local cast, not a global `Window` augmentation: `interface` (needed for declaration merging) is banned in this codebase.
type WindowWithLoader = { CRUX_LOADER?: LoaderShell }

const shell = (): LoaderShell | undefined => (window as unknown as WindowWithLoader).CRUX_LOADER

export const loaderBridge = {
  /** Monotonic by contract on the shell side, so callers may report freely. */
  setProgress: (value: number): void => shell()?.setProgress(value),

  // The floor lives in index.html's inline shell, not here, because the bundle is itself one of the assets a slow connection waits on.
  stopFloor: (): void => shell()?.stopFloor(),

  /** Resolves once the counter has visibly reached 100, or immediately if no shell. */
  settled: (): Promise<void> => shell()?.settled() ?? Promise.resolve(),
}
