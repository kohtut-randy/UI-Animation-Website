/* Boot sequence timing: MIN_DISPLAY is a floor so a fast connection still gets the brand moment, MAX_WAIT a ceiling so a hung asset can't trap the visitor. */
export const PRELOADER_MIN_DISPLAY_MS = 2200
export const PRELOADER_MAX_WAIT_MS = 6000 // hard ceiling: reveal regardless
export const PRELOADER_ASSET_TIMEOUT_MS = 4000 // per asset
export const PRELOADER_CURTAIN_MID_MS = 500
export const PRELOADER_CURTAIN_TOTAL_MS = 1100
export const PRELOADER_REMOVE_FALLBACK_MS = 1600
/* Mirrored in index.html's inline shell as FLOOR_CAP / FLOOR_MAX_WAIT_MS since the shell can't import a module; change both together. */
export const PRELOADER_TRICKLE_CAP = 0.9
export const PRELOADER_PAINT_FRAMES = 2

/* index.html's last-line-of-defence watchdog if the bundle 404s/throws; kept above MAX_WAIT so it only fires when genuinely broken. */
export const PRELOADER_WATCHDOG_MS = 9000

/* `document.fonts.ready` alone resolves early if the face was never laid out, so these are requested explicitly first. */
export const FONT_SPEC_DISPLAY = '800 1rem "Bricolage Grotesque Variable"'
export const FONT_SPEC_BODY = '400 1rem "Inter Variable"'

export const TEXTURE_CHALK_URL = '/wall-texture.webp'
export const HERO_IMAGE_URL = '/ronin-sword-hero.jpg'
