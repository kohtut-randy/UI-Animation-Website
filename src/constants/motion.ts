/* Motion tokens. No ease, duration, stagger, ScrollTrigger offset or travel distance
   may appear inline anywhere else in the codebase: an ESLint `no-restricted-syntax`
   rule fails the build if one does. */

/* EASINGS. Each has a cubic-bezier twin in tokens.css, so a CSS hover and a GSAP
   tween of the same gesture feel identical. */
export const EASE_OUT = 'power2.out' as const // default UI settle
export const EASE_OUT_STRONG = 'power3.out' as const // cards, larger travel
export const EASE_OUT_QUINT = 'power4.out' as const // display type, long travel
export const EASE_OUT_EXPO = 'expo.out' as const // curtain, kinetic reveals
export const EASE_IN_OUT = 'power3.inOut' as const // rules, wipes, symmetric
export const EASE_IN_OUT_SOFT = 'power2.inOut' as const // idle yoyo loops
export const EASE_BACK = 'back.out(1.7)' as const // buttons, small pops
export const EASE_BACK_POP = 'back.out(3)' as const // holds landing on the wall
export const EASE_LINEAR = 'none' as const // MANDATORY for every scrubbed tween

/* DURATIONS (seconds). Mirror --duration-* / 1000. */
export const DURATION_XS = 0.18
export const DURATION_SM = 0.32
export const DURATION_MD = 0.55
export const DURATION_LG = 0.8
export const DURATION_XL = 1.2
export const DURATION_XXL = 1.6
export const DURATION_CURTAIN = 0.9
export const HERO_STORY_SCROLL_DURATION = 10
export const DURATION_CLOUD_DRIFT = 18
export const DURATION_STAR_TWINKLE = 2.8

/* STAGGERS (seconds) */
export const STAGGER_TIGHT = 0.04
export const STAGGER_CHARS = 0.045
export const STAGGER_WORDS = 0.07
export const STAGGER_CARDS = 0.09
export const STAGGER_BASE = 0.12
export const STAGGER_LOOSE = 0.18

/* SCROLLTRIGGER OFFSETS. Two named intents instead of three drifting literals
   ('top 95%' / 'top 92%' / 'top 90%') scattered across files. */
export const SCROLL_TRIGGER_START_EARLY = 'top 95%' as const // decorative rules
export const SCROLL_TRIGGER_START_REVEAL = 'top 88%' as const // THE default for content
export const SCROLL_TRIGGER_START_LATE = 'top 75%' as const // heavy blocks
export const SCROLL_TRIGGER_START_PIN = 'top top' as const
export const SCROLL_TRIGGER_END_EXIT = 'bottom top' as const
export const SCROLL_TRIGGER_STORY_HUD_START = 'top 15%' as const
export const SCROLL_TRIGGER_STORY_HUD_END = 'bottom 85%' as const
export const SCROLL_TRIGGER_STORY_ENTER = 'top bottom' as const
export const SCROLL_TRIGGER_STORY_REVEAL_START = 'top 92%' as const
export const SCROLL_TRIGGER_STORY_REVEAL_END = 'top 28%' as const
export const SCROLL_TRIGGER_STORY_COPY_START = 'top 72%' as const
export const SCROLL_TRIGGER_STORY_COPY_END = 'top 30%' as const
export const SCROLL_TRIGGER_STORY_ACTIVE_START = 'top center' as const
export const SCROLL_TRIGGER_STORY_ACTIVE_END = 'bottom center' as const
export const SCROLL_TRIGGER_STICKY_END = 'bottom bottom' as const
export const SCROLL_TRIGGER_MOON_COMPLETE = 'bottom 20%' as const
export const SCROLL_TRIGGER_CARD_IN_START = 'left 92%' as const // containerAnimation
export const SCROLL_TRIGGER_CARD_IN_END = 'left 42%' as const
export const SCROLL_TRIGGER_CARD_OUT_START = 'right 40%' as const
export const SCROLL_TRIGGER_CARD_OUT_END = 'right 2%' as const

/* SCRUB. Use a number, not `true`, wherever a gesture drives motion: it low-passes
   wheel deltas so trackpad and notched wheel feel the same, AND it composes correctly
   with Lenis. `true` is only for linear indicators. Never go above ~1: Lenis lerp and
   scrub smoothing COMPOSE, and 2 feels rubbery. Tuning range 0.8 to 1. */
export const SCRUB_TIGHT = 0.4
export const SCRUB_SOFT = 0.9
export const SCRUB_LOOSE = 1.6
export const SCRUB_EPILOGUE_THREE = 2.2
export const SCRUB_LINEAR = true

export const ANTICIPATE_PIN = 1

/* TRAVEL (px). Small on purpose: long translate distances read as jank on 60Hz
   mid-tier phones. */
export const DISTANCE_REVEAL_Y = 28
export const DISTANCE_REVEAL_Y_LG = 44
export const DISTANCE_PARALLAX_Y = 18
export const DISTANCE_MAGNET = 26
export const DISTANCE_HERO_SCENE_Y = 120
export const DISTANCE_HERO_MIST_X = 180
export const DISTANCE_HERO_FOREGROUND_Y = 150
export const HERO_SCENE_START_SCALE = 1.12
export const HERO_SCENE_END_SCALE = 1.02

/* THE REDUCED-MOTION BUDGET: opacity only, one fifth the time. */
export const REDUCED_MOTION_DURATION = 0.2
export const REDUCED_MOTION_EASE = EASE_OUT_EXPO
export const REDUCED_MOTION_STAGGER = 0.02

/* REVEAL BATCH */
export const REVEAL_BATCH_INTERVAL = 0.12
export const REVEAL_BATCH_MAX = 5

/* GSAP ticker. lagSmoothing(0) disables it; these two are GSAP's own defaults, used
   to restore it on teardown. */
export const GSAP_LAG_SMOOTHING_DISABLED = 0
export const GSAP_LAG_SMOOTHING_THRESHOLD_MS = 500
export const GSAP_LAG_SMOOTHING_ADJUSTED_MS = 33

/* THE FPS GUARD. Second stage of the two-stage degradation strategy: the pre-paint tier
   probe in index.html catches devices that are predictably slow, and this catches the
   ones that turn out to be slow in practice (a hot phone, a busy tab, a cheap GPU).

   Sampling is deliberately coarse. The guard is a heuristic that switches decorative
   loops off, so a false positive costs a little polish and a false negative costs
   frames. It is biased toward switching things off. */
export const FPS_BUDGET = 50 // below this for FPS_STRIKES windows and decoration stops
export const FPS_SAMPLE_WINDOW_MS = 1000
export const FPS_STRIKES = 2
/** Frames to ignore at startup: the entrance timeline is the heaviest moment in the page. */
export const FPS_WARMUP_MS = 2500
