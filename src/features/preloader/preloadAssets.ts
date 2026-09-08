import { PRELOADER_ASSET_TIMEOUT_MS } from 'constants/index'
import { withTimeout } from 'shared/lib'
import { buildAssetManifest } from './assetManifest'

/**
 * Runs the manifest and reports weighted progress. Every task is individually timed out and swallowed so a dead/404'd asset never blocks the page (weight credited in `finally` regardless).
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
