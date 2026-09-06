/* Every timing gate for the boot sequence. The two that matter most are a floor and a
   ceiling on the same wait: MIN_DISPLAY so a fast connection still gets the brand
   moment instead of a flash, MAX_WAIT so one hanging asset cannot trap the visitor. */
export const PRELOADER_MIN_DISPLAY_MS = 2200
export const PRELOADER_MAX_WAIT_MS = 6000 // hard ceiling: reveal regardless
export const PRELOADER_ASSET_TIMEOUT_MS = 4000 // per asset
export const PRELOADER_CURTAIN_MID_MS = 500
export const PRELOADER_CURTAIN_TOTAL_MS = 1100
export const PRELOADER_REMOVE_FALLBACK_MS = 1600
/* Mirrored in index.html's inline shell as FLOOR_CAP / FLOOR_MAX_WAIT_MS, where the
   synthetic progress floor actually runs. The shell cannot import a module, so this
   pair is a documented cross-boundary duplication: change both together. */
export const PRELOADER_TRICKLE_CAP = 0.9
export const PRELOADER_PAINT_FRAMES = 2

/* The watchdog in index.html is the last line of defence: if the bundle 404s or throws
   on parse, the pre-JS scroll lock would trap the visitor forever. Kept comfortably
   above MAX_WAIT so it only ever fires when the bundle is genuinely broken. */
export const PRELOADER_WATCHDOG_MS = 9000

/* Font faces the manifest awaits. `document.fonts.ready` alone is a trap: it resolves
   immediately when no text using the face has been laid out yet, so the exact faces
   have to be requested first. The size prefix is required by the CSS font shorthand
   these strings are parsed as. */
export const FONT_SPEC_DISPLAY = '800 1rem "Bricolage Grotesque Variable"'
export const FONT_SPEC_BODY = '400 1rem "Inter Variable"'

export const TEXTURE_CHALK_URL = '/wall-texture.webp'
export const HERO_IMAGE_URL = '/ronin-sword-hero.jpg'
