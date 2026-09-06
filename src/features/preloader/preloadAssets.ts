import { PRELOADER_ASSET_TIMEOUT_MS } from 'constants/index'
import { withTimeout } from 'shared/lib'
import { buildAssetManifest } from './assetManifest'

/**
 * Runs the manifest and reports weighted progress. Every task is individually
 * timed out and individually swallowed, so a dead or 404'd asset can never block
 * the page: the weight is credited in `finally` either way.
 *
 * This is the narrow exception to the no-broad-catch rule, and it is deliberate. The
 * thing being caught is "one decorative asset did not arrive", which is not a bug to
 * propagate, and the alternative is a visitor stuck behind a curtain.
 */
export const preloadAssets = async (onProgress: (progress: number) => void): Promise<void> => {
  const tasks = buildAssetManifest()
  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0)
  let doneWeight = 0

  onProgress(0)

  await Promise.all(
    tasks.map(async task => {
      try {
        await withTimeout(task.run(), PRELOADER_ASSET_TIMEOUT_MS)
      } catch {
        if (import.meta.env.DEV) console.warn(`[boot] skipped ${task.id}`)
      } finally {
        doneWeight += task.weight
        onProgress(doneWeight / totalWeight)
      }
    }),
  )
}
