import { FONT_SPEC_BODY, FONT_SPEC_DISPLAY, HERO_IMAGE_URL, PRELOADER_PAINT_FRAMES, TEXTURE_CHALK_URL } from 'constants/index'
import { nextFrames, waitForWindowLoad } from 'shared/lib'

/* What the progress bar is actually measuring. Weights reflect real wall-clock cost
   rather than task count, so the bar moves at a believable rate instead of jumping in
   six equal steps. */

export type AssetTask = {
  id: string
  weight: number
  run: () => Promise<unknown>
}

/** Resolves when the image is DECODED, not merely fetched. */
const loadImage = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      /* decode() can reject on some browsers for a perfectly good image, and a
         decorative backdrop is never worth failing the boot over, so both paths
         resolve. The await still does its job: it moves the decode cost to here,
         before the reveal, instead of onto the first scroll frame. */
      void (image.decode?.() ?? Promise.resolve()).then(
        () => resolve(),
        () => resolve(),
      )
    }
    image.onerror = () => reject(new Error(`failed to load ${src}`))
    image.src = src
  })

const loadData = async (src: string): Promise<void> => {
  const response = await fetch(src)
  if (!response.ok) throw new Error(`failed to load ${src}`)
  await response.json()
}

export const buildAssetManifest = (): readonly AssetTask[] => [
  /* document.fonts.ready ALONE is a trap: it resolves immediately when no text using
     the face has been laid out yet. Request the exact faces first, THEN await ready. */
  { id: 'font:display', weight: 4, run: () => document.fonts.load(FONT_SPEC_DISPLAY) },
  { id: 'font:body', weight: 2, run: () => document.fonts.load(FONT_SPEC_BODY) },
  { id: 'fonts:ready', weight: 1, run: () => document.fonts.ready },

  /* The single raster in the build, decoded so the wall backdrop can never pop in
     after the curtain has lifted. */
  { id: 'texture:chalk', weight: 3, run: () => loadImage(TEXTURE_CHALK_URL) },
  { id: 'hero:ronin', weight: 5, run: () => loadImage(HERO_IMAGE_URL) },
  { id: 'story:village', weight: 3, run: () => loadImage('/ember-village.jpg') },
  { id: 'story:storm', weight: 3, run: () => loadImage('/ember-storm.jpg') },
  { id: 'story:river', weight: 3, run: () => loadImage('/ember-river.jpg') },
  { id: 'story:dawn', weight: 3, run: () => loadImage('/ember-dawn.jpg') },
  { id: 'lottie:oath-gate', weight: 2, run: () => loadData('/oath-gate.json') },

  /* Everything the document itself declares: the stylesheet and the module graph. */
  { id: 'window:load', weight: 4, run: () => waitForWindowLoad() },

  /* React has committed and the browser has painted twice, so reaching 100% genuinely
     means "the page behind this curtain is ready", not "the fetches finished". */
  { id: 'app:painted', weight: 2, run: () => nextFrames(PRELOADER_PAINT_FRAMES) },
]
