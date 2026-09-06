/* The typed edge of the `window.CRUX_LOADER` global that index.html defines. Nothing
   in the bundle touches those DOM nodes directly, so if the inline shell ever changes
   shape, exactly one file has to change with it.

   Every method degrades to a no-op rather than throwing, because the shell can
   legitimately be absent: the 9s watchdog removes the loader, and the dev harness
   pages have no loader at all. */

type LoaderShell = {
  setProgress: (value: number) => void
  stopFloor: () => void
  settled: () => Promise<void>
}

/* Augmenting the global `Window` would need `interface` for declaration merging, and
   `interface` is banned outright in this codebase. A local cast is the `type`-only
   answer: narrower than a global declaration (only this file can reach the global) and
   still fully typed, with no `any`. */
type WindowWithLoader = { CRUX_LOADER?: LoaderShell }

const shell = (): LoaderShell | undefined => (window as unknown as WindowWithLoader).CRUX_LOADER

export const loaderBridge = {
  /** Monotonic by contract on the shell side, so callers may report freely. */
  setProgress: (value: number): void => shell()?.setProgress(value),

  /* Stops the shell's synthetic floor. The floor lives in the inline shell rather than
     here because the bundle is itself one of the assets a slow connection is waiting
     on, so a floor inside it cannot report its own arrival. See index.html. */
  stopFloor: (): void => shell()?.stopFloor(),

  /** Resolves once the counter has visibly reached 100, or immediately if no shell. */
  settled: (): Promise<void> => shell()?.settled() ?? Promise.resolve(),
}
