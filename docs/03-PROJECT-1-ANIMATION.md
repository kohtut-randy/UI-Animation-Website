# 03 · Project 1 — CRUX Landing (animation)

Read `00-ASSESSMENT-REQUIREMENTS.md` (Part 1 section) and `01-CONVENTIONS.md` first.
Brand tokens: `02-BRAND-TOKENS.md`. Versions: `05-DEPENDENCIES.md`.

Concept: a fictional bouldering gym, **CRUX**, sharing its brand and token layer with the Project 2
dashboard. The animated objects are climbing holds: colourful blobby SVG shapes, hand-authored, no
stock photography.


Repo: its own public repo. Deploy: Vercel (SPA rewrite).

Three sections, which is the brief's own recommended set and the only set that exercises all four
required moments (load, scroll, hover, resize): **preloader → hero → "The Wall" collection**.

## Folder structure

```
crux-landing/
├─ index.html                  inline preloader, pre-JS scroll lock, device-tier probe, watchdog
├─ README.md                   maps 1:1 to the brief's README list
├─ vite.config.ts              @tailwindcss/vite plugin
├─ vercel.json                 SPA rewrite + immutable cache on /assets/*
└─ src/
   ├─ main.tsx                 initMotion() -> createRoot().render() -> bootSequence(root)
   ├─ App.tsx                  composes sections; owns refresh policy + smooth scroll init
   ├─ styles/
   │  ├─ index.css             @import "tailwindcss"; then tokens/base/utilities
   │  ├─ tokens.css            THE PORTABLE @theme LAYER - copied byte-identical to Project 2
   │  ├─ base.css              reset, fluid root font-size, focus ring, reduced-motion block
   │  └─ utilities.css         @utility layer (replaces @apply)
   ├─ motion/
   │  ├─ gsap.ts               THE SINGLE gsap.registerPlugin(ScrollTrigger) call point
   │  ├─ tokens.ts             EASE / DUR / STAGGER / ST / DIST constants
   │  ├─ config.ts             LENIS_CONFIG, WALL_CONFIG, HERO_CONFIG
   │  ├─ media.ts              gsap.matchMedia() instance + breakpoint query strings
   │  ├─ refresh.ts            initRefreshPolicy(), observeTrackWidth()
   │  ├─ reveal.ts             initReveals() - one ScrollTrigger.batch for all [data-reveal]
   │  ├─ smoothScroll.ts       Lenis <-> gsap.ticker wiring
   │  └─ decor.ts              registry of idle/decorative loops, pausable by the FPS guard
   ├─ boot/
   │  ├─ phaseStore.ts         useSyncExternalStore-backed phase machine
   │  ├─ loaderBridge.ts       talks to window.__CRUX__ in index.html
   │  ├─ assetManifest.ts      the list of assets whose load drives real progress
   │  ├─ preloadAssets.ts      decode-aware preloading with per-asset settle
   │  ├─ trickle.ts            monotonic eased follower so the counter never stalls or jumps back
   │  └─ bootSequence.ts       the 5-phase reveal choreography, MIN_DISPLAY + MAX_WAIT gates
   ├─ hooks/
   │  ├─ useAppPhase.ts        subscribe to the phase store
   │  ├─ useHeroMotion.ts      hero entrance + parallax + pointer magnetism
   │  ├─ useWallMotion.ts      the pin, measure(), containerAnimation, mobile swipe fallback
   │  ├─ useReducedMotion.ts
   │  └─ useMediaQuery.ts
   ├─ sections/
   │  ├─ Hero.tsx
   │  └─ Wall.tsx
   ├─ components/
   │  ├─ Header.tsx  Button.tsx  SectionHeading.tsx  RevealText.tsx
   │  ├─ Reveal.tsx            the reusable reveal-on-scroll wrapper
   │  ├─ Hold.tsx              hand-authored blob SVG, 4-layer DOM
   │  ├─ HoldCard.tsx  StatBlock.tsx  ScrollCue.tsx  ChalkField.tsx
   │  └─ index.ts
   ├─ data/holds.ts            12 typed hold records (mock data)
   └─ lib/
      ├─ cn.ts  async.ts  deviceTier.ts  fpsGuard.ts
```

## What this fixes from `portfolio-v3` (each is a deliberate, README-worthy improvement)

| portfolio-v3 problem | Fix here |
|---|---|
| `gsap.registerPlugin(ScrollTrigger)` duplicated across 6 files in 2 inconsistent styles | One call in `motion/gsap.ts`; an ESLint rule bans importing `gsap` outside `src/motion/` |
| 6 eases and 3 ScrollTrigger start offsets repeated inline across files | `motion/tokens.ts`; an ESLint rule bans inline ease/offset literals outside `src/motion/` |
| No reveal-on-scroll wrapper; every reveal hand-written | `<Reveal>` + one `ScrollTrigger.batch` |
| Preloader is a hardcoded 5500ms, unrelated to real loading | Driven by actual asset progress, with `MIN_DISPLAY` floor and `MAX_WAIT` ceiling |
| `prefers-reduced-motion` handled nowhere | Three layers: CSS block, `gsap.matchMedia` branch, and decorative modules never imported |
| No smooth scroll at all | Lenis, wired to `gsap.ticker` |
| Stale ScrollTrigger offsets patched with a `setTimeout(600)` | An explicit refresh policy keyed to the phase machine and a track-width `ResizeObserver` |

## Motion tokens (no magic numbers in any timeline)

```ts
// motion/tokens.ts
export const EASE = {
  out: 'power2.out',
  inOut: 'power3.inOut',
  emphatic: 'power3.out',
  pop: 'back.out(1.7)',
  linear: 'none',
} as const;

export const DUR = { xs: 0.24, sm: 0.4, md: 0.7, lg: 1.1, xl: 1.4 } as const;
export const STAGGER = { tight: 0.06, normal: 0.1, loose: 0.16 } as const;
export const ST = { start: 'top 88%', startLate: 'top 70%', scrub: { soft: 0.8, tight: 0.3 } } as const;
export const DIST = { rise: 44, riseSm: 20, drift: 120, parallax: 80 } as const;
```

## The boot pipeline (load animation + slow-asset edge case)

The preloader markup and CSS are **inline in `index.html`** so they paint before the JS bundle
loads — that is what makes the slow-asset case genuinely covered rather than claimed. An inline
`<head>` script locks scroll before any JS runs. `index.html` exposes a `window.__CRUX__` bridge
with an eased monotonic progress follower (so the counter never stalls or jumps backwards), a
`settled()` promise, a **9s hard-kill watchdog**, and a `<noscript>` escape hatch that unlocks scroll.

Phases: `loading → ready → entering → entered → idle`, held in a `useSyncExternalStore` store.

**Two events, not one** — this is the key correction to portfolio-v3's single `portfolio:ready`:

- `crux:ready` — the curtain is about to lift. **Measure now**: `ScrollTrigger.refresh()`.
- `crux:entered` — the curtain is up. **Play now**: the hero timeline starts.

One event cannot do both, because ScrollTrigger must measure a laid-out, unlocked page *before* the
entrance plays, and the entrance must not run behind an opaque curtain. Sections build their
timelines paused and start them on `crux:entered`.

Real progress comes from `preloadAssets.ts` over `assetManifest.ts` (decode-aware, per-asset
settle), gated by `MIN_DISPLAY` (a floor, so a fast connection still sees the brand moment) and
`MAX_WAIT` (a ceiling, so one hanging asset cannot trap the user). Verify on Slow 3G, and with one
asset deliberately blocked.

## Section animations

**Hero** — the four-layer transform rule, because parallax, idle loops, and pointer magnetism all
want to write `transform` on the same element and would fight:

1. Layer 1: scroll parallax (`y`, scrubbed)
2. Layer 2: idle float loops (`yoyo`, registered in `motion/decor.ts` so the FPS guard can pause them)
3. Layer 3: pointer magnetism (`gsap.quickTo` on `x`/`y`, desktop only)
4. Layer 4: the hold's own SVG, static

Entrance: a paused timeline — kinetic headline lines rise from `translateY(110%)` inside
`overflow: hidden` clip spans (React-rendered spans, not SplitText, so a resize never re-splits),
then the holds pop in with `EASE.pop` and `STAGGER.normal`, then the CTAs and scroll cue.

**The Wall** — pinned horizontal scrub, the section that carries the brief's "pinned sections"
requirement:

- A `measure()` function computes the x distance from real track width, called from
  `onRefreshInit`, with `invalidateOnRefresh: true` so resize recalculates instead of drifting.
- `pin`, `anticipatePin: 1`, `fastScrollEnd: true`, `scrub: ST.scrub.soft`.
- `onToggle` sets and releases `will-change` on the track — never in CSS.
- `onUpdate` drives the progress bar and the `01 / 12` counter.
- The x driver stays a **standalone linear tween** (`gsap.to(track, { x, ease: 'none' })`) used as
  `containerAnimation` for the 12 per-card emphasis tweens. Folding it into a timeline is the
  tempting refactor that breaks the card triggers.
- **Mobile drops the pin entirely** (see below) rather than simplifying it.

**Reveals** — every `[data-reveal]` element is picked up by one `ScrollTrigger.batch` in
`motion/reveal.ts`, so 40 reveals cost one batch instead of 40 triggers. Initial state lives in
`base.css` so nothing flashes before JS.

**Hover** — CSS transitions on dedicated layers. GSAP never touches a CSS-transitioned property.
This is compositor-driven, needs no listeners, and works before hydration.

## Lenis wiring

```ts
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

Driving `lenis.raf` from `gsap.ticker` puts scroll and tweens on **one** clock, which is what keeps
the pinned scrub from micro-jittering. `lagSmoothing(0)` stops GSAP from time-warping after a long
task, which would otherwise desync the scrub from the scrollbar.

Decisions the README states plainly:

- **No `scrollerProxy`.** Lenis drives native scroll position, so ScrollTrigger's default scroller
  is already correct. `scrollerProxy` is only needed for transform-based scrollers.
- **No ScrollSmoother / Locomotive.** Both transform a wrapper, which forces
  `pinType: 'transform'` and breaks `position: fixed` children.
- Lenis is created **after** `crux:ready` and **lazily imported**, so it is not in the critical path.
- Scroll locking is single-sourced: `lenis.stop()` / `lenis.start()` once Lenis exists, with the
  pre-JS `overflow: hidden` lock released at the same moment, so the two mechanisms never fight.
- **Reduced motion: Lenis is never imported at all.** Native scrolling is the correct answer, and
  ScrollTrigger keeps working unchanged.
- `syncTouch` is **off**. It is a well-known jank source on mobile, and native touch scrolling is
  already good.
- Resize order is `lenis.resize()` then `ScrollTrigger.refresh()`, never the reverse.
- `data-lenis-prevent` on the mobile swipe rail so it scrolls natively inside a smooth-scrolled page.

## Responsive strategy

Breakpoints on Tailwind v4 defaults, no overrides: **mobile < 768 · tablet 768-1023 · desktop ≥ 1024**.
Note the media-query rem gotcha: MQ `rem` is always 16px, so breakpoints stay stable even though the
type scale is fluid.

Fluid root: `html { font-size: clamp(16px, 0.625vw + 8px, 20px) }` (16px at ≤1280, 20px at 1920), with
the type scale in `--text-*` plus `--text-*--line-height` sub-vars.

`gsap.matchMedia()` **is the resize contract.** One `add()` per breakpoint; crossing 768 or 1024
fully reverts the old context and builds the new one. That is what makes a live drag-resize clean
instead of leaving orphaned pins.

| Behaviour | Mobile | Tablet | Desktop |
|---|---|---|---|
| Preloader | yes | yes | yes |
| Hero entrance | yes | yes | yes |
| Hero parallax | reduced distance | yes | yes |
| Hero idle loops | off | yes | yes |
| Pointer magnetism | off (no pointer) | off | yes |
| Chalk field canvas | off | off | high-tier only |
| Wall | **native scroll-snap swipe rail** | pinned, shorter `end` | pinned + per-card emphasis |
| Reveals | yes | yes | yes |

**Why mobile drops the pin rather than simplifying it:** a pinned horizontal scrub on a phone fights
the browser's own scroll and address-bar resize, and it takes over a gesture users expect to move the
page. A native `scroll-snap` rail is what the platform already does well. This is a product decision,
not a shortcut, and it is stated as such in the README.

**Low-power degradation** is two-stage: a pre-paint device-tier probe in `index.html`
(`deviceMemory`, `hardwareConcurrency`, pointer type) gates the expensive decorative work before
anything renders, and a runtime FPS sampler pauses everything registered in `motion/decor.ts` if the
frame rate stays under budget.

## Performance policy

- Only `transform` and `opacity` are animated. Nothing that triggers layout, ever.
- **`will-change` never appears in CSS.** Timelines set it and release it on complete; the wall track
  is toggled by the pin's `onToggle`. A permanently promoted layer is a memory cost, not an optimisation.
- `force3D: 'auto'` globally, `true` on exactly the two tweens that measurably need it.
- Layout reads are confined to two functions (`measure()` and the probe) and never happen in a
  handler, so there is no read/write thrash.
- **No React state in the animation path.** `useGSAP` with scoped refs; the phase store is the only
  subscription, and it fires at most five times in the page's life.
- Lazy loading: hold art is inline SVG (no request), the one raster texture is WebP with explicit
  dimensions + `loading="lazy"` + `decoding="async"`, Lenis is a dynamic import, and the display font
  is preloaded with `font-display: block` while body text is `swap`.
- Verify in DevTools: Layers panel shows only the intended promoted elements; Performance panel shows
  no layout during the pinned scrub; 4× CPU throttle still holds the frame budget; Lighthouse mobile
  and desktop numbers go in the README verbatim.

## Build sequence (commit-sized, ~6h with a stated cut list)

**A — foundation (~1h15)**
1. `chore: scaffold vite react 19 typescript` — strict tsconfig, flat ESLint, Prettier, init the repo
2. `chore: add tailwind v4 via @tailwindcss/vite` — delete any generated `tailwind.config.js` / `postcss.config.js`
3. `feat(tokens): portable crux design token layer` — `tokens.css` + `base.css` + `utilities.css`, self-hosted variable fonts. **Demo: a swatch and type-scale page proving every token resolves and scales.** This is the artifact Project 2 copies, so it lands third, not last.
4. `feat(motion): single gsap registration point and motion tokens` — plus the two ESLint rules that enforce them

**B — boot pipeline (~45m)**
5. `feat(boot): inline preloader shell scroll lock and device tier probe` — verify it paints with the JS bundle blocked
6. `feat(boot): asset progress driven boot sequence` — verify on Slow 3G and with one asset blocked
7. `feat(motion): scrolltrigger refresh policy` — explicitly *no* resize listener; the commit message says why

**C — brand primitives (~45m)**
8. `feat(ui): hold svg button headings and reveal wrapper`
9. `feat(motion): reveal on scroll via scrolltrigger batch` — verified with reduced motion on and off

**D — Hero (~1h15)**
10. `feat(hero): layout kinetic type markup and header` — **zero animation**; verify all three breakpoints and a live drag-resize first, because layout bugs are far cheaper to find without timelines on top
11. `feat(hero): entrance timeline scroll parallax and pointer magnetism`
12. `feat(hero): chalk field desktop and high tier only` — first cut candidate

**E — The Wall (~1h15)**
13. `feat(wall): layout twelve hold cards and swipe mode css` — static, no pin
14. `feat(wall): pinned horizontal scrub with responsive distance` — **verify by resizing across 768 and 1024 ten times; a dev-only assertion checks `ScrollTrigger.getAll().length` returns to baseline and no orphaned `pin-spacer` remains**
15. `feat(wall): per card container animation emphasis desktop only` — split from 14 so a regression is bisectable

**F — polish (~45m)**
16. `feat(motion): lenis smooth scroll wired to gsap ticker` — re-tune `ST.scrub.soft` by feel here, noting before/after in the message
17. `a11y: reduced motion pass focus states and semantics`
18. `perf: will-change policy fps guard and tier degradation`
19. `perf: asset and build tuning`

**G — ship (~30m)**
20. `docs: readme` — the brief's required sections with real measured numbers and screenshots
21. `chore: vercel deployment` — deploy, paste the live URL into the README

**Cut list, in order, if running over:** Playwright smoke tests → the chalk field (step 12; the
preloader's CSS dust already sells the texture) → the runtime FPS sampler (keep the pre-paint tier
probe) → per-card emphasis (step 15). Cutting all four lands at ~4h30 with **every brief requirement
still met**, because the required animation moments all live in steps 5-6, 11, and 14.

## Two things to validate early, not at step 14

- **`useGSAP` returning a cleanup function.** The plan relies on
  `useGSAP(() => { ...; return () => mm.revert(); })` firing, since `useGSAP` wraps `gsap.context()`.
  Validate with a 5-line throwaway at step 4 (mount/unmount, assert
  `ScrollTrigger.getAll().length === 0`). Fallback is a sibling
  `useEffect(() => () => mmRef.current?.revert(), [])` — a two-line change, but far better found at
  step 4 than step 14.
- **`containerAnimation` accepts a timeline** per the typedefs, but the well-trodden shape is a plain
  linear `x` tween. Keep the x driver standalone and drive the progress bar and counter from its
  ScrollTrigger's `onUpdate`. The "one timeline, three tweens" refactor is the tempting change that
  breaks the card triggers.

## README outline (1:1 with the brief's required list)

1. **CRUX** — what it is, live URL, screenshots/GIFs
2. **Setup instructions** — Node version, install, dev, build, preview, lint
3. **Which 3 slides were implemented** — preloader, hero, The Wall; plus an explicit list of the ~4 reference slides deliberately *not* built and why (the brief's cap of 3, and this is the only set exercising load + scroll + hover + resize)
4. **Libraries chosen and why** — a table of each dependency with its justification, plus a **rejected** list with reasons: Framer Motion (no scrub/pin primitive, would need GSAP anyway), ScrollSmoother and Locomotive (transform-based wrapper breaks `position: fixed` children and forces `scrollerProxy`), SCSS (Tailwind v4 `@theme` + `@utility` covers it), GSAP SplitText (React-rendered spans avoid resize re-splits), any UI kit (nothing here needs one)
5. **Approach to animation** — the single registration point, motion tokens, the four-layer transform rule, the two-event preloader handoff, annotated hero and wall timelines, the batched reveal system, the three reduced-motion layers, and why hover is CSS rather than GSAP
6. **Approach to smooth scroll** — the exact Lenis + `gsap.ticker` wiring, `lagSmoothing(0)`, why not `scrollerProxy` / `normalizeScroll` / ScrollSmoother, how it composes with the pin, and when it is not loaded at all
7. **Approach to responsiveness** — the three breakpoints, the fluid root and type scale with the maths, the media-query rem gotcha, the per-breakpoint animation matrix, `gsap.matchMedia` as the resize contract, and why mobile drops the pin instead of simplifying it
8. **Performance notes** — what is animated and what is banned, the `will-change` policy, `force3D`, the layout-read policy, the React re-render policy, lazy loading, **measured numbers** (Lighthouse mobile/desktop, gzipped bundle size, average fps during the pinned scrub at 4× CPU throttle, CLS), the low-power tier, and the DevTools checklist actually walked
9. **CSS architecture and design tokens** — why `tokens.css` is a standalone portable file, `@theme` vs `@theme inline` and the concrete bug the latter prevents, semantic vs primitive naming, the `@utility` layer replacing `@apply`, `data-*` animation hooks vs class hooks, and the note that this exact file is reused by the companion dashboard
10. **Accessibility** — reduced motion, focus-visible rings, keyboard reachability of the CTAs and the card rail, `aria-hidden` on decorative SVG, the `<noscript>` escape hatch
11. **Assumptions made** — brand invented (the brief permits swapping assets); 3 of ~7 slides per the brief's cap; all CTAs inert by design but with hover states; client-only SPA with no SSR, because ScrollTrigger must measure real layout and an opacity-0 hydration pass is exactly what produces stale offsets; the 12 holds are mock data; mobile drops the pin deliberately; "fidelity to the reference" read as fidelity of motion *feel and type*, not pixel-copying its artwork
12. **Known limitations / next steps** — no visual-regression tests; the FPS guard is a heuristic; the pinned rail's tab order is simplified; three sections means no cross-section choreography

---

---

# Reference implementations

These are the load-bearing files. An implementing agent should treat them as the spec, not as
suggestions — each encodes a decision explained in the sections above.

## `src/constants/motion.ts` — the motion tokens

No ease, duration, stagger, ScrollTrigger offset or travel distance may appear inline anywhere else.
An ESLint `no-restricted-syntax` rule enforces it (see below).

```ts
/* ── EASINGS. Each has a cubic-bezier twin in tokens.css. ─────────── */
export const EASE_OUT         = 'power2.out'    as const // default UI settle
export const EASE_OUT_STRONG  = 'power3.out'    as const // cards, larger travel
export const EASE_OUT_QUINT   = 'power4.out'    as const // display type, long travel
export const EASE_OUT_EXPO    = 'expo.out'      as const // curtain, kinetic reveals
export const EASE_IN_OUT      = 'power3.inOut'  as const // rules, wipes, symmetric
export const EASE_IN_OUT_SOFT = 'power2.inOut'  as const // idle yoyo loops
export const EASE_BACK        = 'back.out(1.7)' as const // buttons, small pops
export const EASE_BACK_POP    = 'back.out(3)'   as const // holds landing on the wall
export const EASE_LINEAR      = 'none'          as const // MANDATORY for every scrubbed tween

/* ── DURATIONS (seconds). Mirror --duration-* / 1000. ─────────────── */
export const DURATION_XS = 0.18
export const DURATION_SM = 0.32
export const DURATION_MD = 0.55
export const DURATION_LG = 0.8
export const DURATION_XL = 1.2
export const DURATION_XXL = 1.6
export const DURATION_CURTAIN = 0.9

/* ── STAGGERS (seconds) ───────────────────────────────────────────── */
export const STAGGER_TIGHT = 0.04
export const STAGGER_CHARS = 0.045
export const STAGGER_WORDS = 0.07
export const STAGGER_CARDS = 0.09
export const STAGGER_BASE  = 0.12
export const STAGGER_LOOSE = 0.18

/* ── SCROLLTRIGGER OFFSETS. Replaces three drifting literals
   ('top 95%' / 'top 92%' / 'top 90%') with two named intents. ────── */
export const SCROLL_TRIGGER_START_EARLY  = 'top 95%'    as const // decorative rules
export const SCROLL_TRIGGER_START_REVEAL = 'top 88%'    as const // THE default for content
export const SCROLL_TRIGGER_START_LATE   = 'top 75%'    as const // heavy blocks
export const SCROLL_TRIGGER_START_PIN    = 'top top'    as const
export const SCROLL_TRIGGER_END_EXIT     = 'bottom top' as const
export const SCROLL_TRIGGER_CARD_IN_START  = 'left 92%'  as const // containerAnimation
export const SCROLL_TRIGGER_CARD_IN_END    = 'left 42%'  as const
export const SCROLL_TRIGGER_CARD_OUT_START = 'right 40%' as const
export const SCROLL_TRIGGER_CARD_OUT_END   = 'right 2%'  as const

/* ── SCRUB. Use `1`, not `true`, wherever a gesture drives motion: it
   low-passes wheel deltas so trackpad and notched wheel feel the same,
   AND it composes correctly with Lenis. `true` is only for linear
   indicators. Never go above ~1: Lenis lerp and scrub smoothing
   COMPOSE, and 2 feels rubbery. Tuning range 0.8–1. ─────────────── */
export const SCRUB_TIGHT  = 0.4
export const SCRUB_SOFT   = 1
export const SCRUB_LOOSE  = 1.6
export const SCRUB_LINEAR = true

export const ANTICIPATE_PIN = 1

/* ── TRAVEL (px). Small on purpose: long translate distances read as
   jank on 60Hz mid-tier phones. ──────────────────────────────────── */
export const DISTANCE_REVEAL_Y    = 28
export const DISTANCE_REVEAL_Y_LG = 44
export const DISTANCE_PARALLAX_Y  = 18
export const DISTANCE_MAGNET      = 26

/* ── THE REDUCED-MOTION BUDGET: opacity only, one fifth the time. ── */
export const REDUCED_MOTION_DURATION = 0.2
export const REDUCED_MOTION_EASE     = EASE_OUT_EXPO
export const REDUCED_MOTION_STAGGER  = 0.02

/* ── REVEAL BATCH ────────────────────────────────────────────────── */
export const REVEAL_BATCH_INTERVAL = 0.12
export const REVEAL_BATCH_MAX      = 5
```

## `src/constants/breakpoints.ts` — the only place breakpoint numbers exist in TS

```ts
export const BREAKPOINT_TABLET_PX  = 768  // === --breakpoint-md: 48rem
export const BREAKPOINT_DESKTOP_PX = 1024 // === --breakpoint-lg: 64rem

export const MEDIA_QUERY_MOBILE  = `(max-width: ${BREAKPOINT_TABLET_PX - 0.02}px)` as const
export const MEDIA_QUERY_TABLET  = `(min-width: ${BREAKPOINT_TABLET_PX}px) and (max-width: ${BREAKPOINT_DESKTOP_PX - 0.02}px)` as const
export const MEDIA_QUERY_DESKTOP = `(min-width: ${BREAKPOINT_DESKTOP_PX}px)` as const
export const MEDIA_QUERY_CAN_PIN = `(min-width: ${BREAKPOINT_TABLET_PX}px)` as const
export const MEDIA_QUERY_MOTION  = '(prefers-reduced-motion: no-preference)' as const
export const MEDIA_QUERY_REDUCE  = '(prefers-reduced-motion: reduce)' as const
export const MEDIA_QUERY_CAN_HOVER = '(hover: hover) and (pointer: fine)' as const
```

## `src/shared/types/motion.types.ts`

```ts
export type Breakpoint = 'mobile' | 'tablet' | 'desktop'
export type ScrollMode = 'pin' | 'swipe'
export type DeviceTier = 'low' | 'high'
export type AppPhase   = 'loading' | 'ready' | 'entered'
export type HoldColor  = 'crimp' | 'jug' | 'sloper' | 'pinch' | 'pocket' | 'volume'
export type HoldShape  = 'blob-a' | 'blob-b' | 'blob-c' | 'blob-d' | 'blob-e'

export type MediaFlags = {
  isMobile: boolean; isTablet: boolean; isDesktop: boolean
  canPin: boolean; motion: boolean; reduce: boolean; canHover: boolean
}
```

## `src/motion/gsapClient.ts` — the single registration point

```ts
// The ONLY file in the repo that imports from 'gsap'. Enforced by an
// ESLint no-restricted-imports rule scoped to everything outside src/motion.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

// Module scope + ES module caching guarantees exactly one registration.
// No `typeof window !== 'undefined'` guard is needed — this is a
// client-only SPA with no SSR.
gsap.registerPlugin(useGSAP, ScrollTrigger)

export { gsap, ScrollTrigger, useGSAP }
```

Import `gsap/ScrollTrigger` only — **never `gsap/all`**. GSAP 3.15's tarball now ships SplitText,
ScrollSmoother and DrawSVGPlugin, so `gsap/all` pulls ~40KB of unused bonus plugins.

## `src/motion/initMotion.ts`

```ts
import { gsap, ScrollTrigger } from './gsapClient'
import { DURATION_MD, EASE_OUT } from '../constants'

let hasInit = false

export const initMotion = (): void => {
  if (hasInit) return
  hasInit = true

  // force3D left at its default 'auto' — promote during a tween, release
  // after. A global force3D:true would permanently promote every animated
  // node and burn GPU memory on mobile. Only two tweens opt into `true`.
  gsap.config({ nullTargetWarn: false })
  gsap.defaults({ ease: EASE_OUT, duration: DURATION_MD, overwrite: 'auto' })

  ScrollTrigger.config({
    // The mobile URL bar showing/hiding fires resize with a height-only
    // delta. Refreshing there makes pins visibly jump mid-scroll and costs
    // a full layout pass. This flag is the correct fix — and it is why a
    // manual resize→refresh listener must NOT be added.
    ignoreMobileResize: true,
    limitCallbacks: true,
  })

  // ScrollTrigger.normalizeScroll() is deliberately NOT called — it hijacks
  // the same wheel/touch events Lenis owns. Enabling both is the single most
  // common Lenis+GSAP failure report.
}
```

## Reduced motion + resize: one `gsap.matchMedia()` contract

`ScrollTrigger.matchMedia()` is deprecated in favour of `gsap.matchMedia()` (since 3.11).
`gsap.matchMedia()` is the right tool because it does three things nothing else does: it accepts an
**object of named conditions** and runs one callback per matching combination; it **reverts**
everything created inside on any condition change (killing pins and removing pin-spacers cleanly);
and it re-runs. That makes it simultaneously the reduced-motion strategy **and** the resize strategy.

```ts
// src/motion/motionMedia.ts
import { gsap } from './gsapClient'
import {
  MEDIA_QUERY_CAN_HOVER, MEDIA_QUERY_CAN_PIN, MEDIA_QUERY_DESKTOP,
  MEDIA_QUERY_MOBILE, MEDIA_QUERY_MOTION, MEDIA_QUERY_REDUCE, MEDIA_QUERY_TABLET,
} from '../constants'
import type { MediaFlags } from '../shared/types'

const CONDITIONS = {
  isMobile: MEDIA_QUERY_MOBILE,   isTablet: MEDIA_QUERY_TABLET,
  isDesktop: MEDIA_QUERY_DESKTOP, canPin: MEDIA_QUERY_CAN_PIN,
  motion: MEDIA_QUERY_MOTION,     reduce: MEDIA_QUERY_REDUCE,
  canHover: MEDIA_QUERY_CAN_HOVER,
} as const

export type MotionMediaHandler = (
  flags: MediaFlags,
  context: gsap.Context,
) => void | (() => void)

export const motionMedia = (): gsap.MatchMedia => gsap.matchMedia()

/** One add() with all seven conditions → one callback that branches on
 *  ctx.conditions, and a full revert on any condition flip. */
export const addMotionMedia = (
  media: gsap.MatchMedia,
  scope: Element,
  handler: MotionMediaHandler,
): void => {
  media.add(CONDITIONS, context => handler(context.conditions as MediaFlags, context), scope)
}
```

**Every section hook has the identical shape, so reduced motion cannot be forgotten:**

```ts
useGSAP(() => {
  const media = motionMedia()
  addMotionMedia(media, scopeRef.current!, (flags, context) => {
    if (flags.reduce) { /* gsap.set final state, one 0.2s fade, return */ }
    /* … full motion … */
    return () => { /* detach raw DOM listeners */ }
  })
  return () => media.revert()
}, { scope: scopeRef })      // ← note: NO `dependencies` array
```

Timelines are built **paused on mount**, so initial states land while `#root` is still
`opacity: 0` — no FOUC window — and are played by `onAppPhase('entered', …)`. This is why
`useGSAP` needs no `dependencies`: it builds once, and `gsap.matchMedia` owns rebuilds.

**Three layers of reduced-motion handling, all required scope:**

1. **CSS** (`base.css`) — kills preloader keyframes and hover transitions, forces `[data-reveal]`
   visible. Works even if the bundle never loads.
2. **GSAP** (the `reduce` branch) — no pin, no scrub, no parallax, no idle loops, no magnetism.
   Content is `gsap.set` to final state; one 0.2s `autoAlpha` fade per section is the whole budget.
3. **Module level** — Lenis is never dynamically imported and `ChalkField` is never mounted, so the
   bytes and the extra rAF never exist.

## `index.html` — the pre-bundle shell

Everything here paints on the **first** paint, before any JS parses. This is what makes the
slow-asset edge case genuinely covered rather than merely claimed. It also makes LCP the inline
wordmark, which is why a preloader does not hurt the Lighthouse score.

```html
<style>
  #loader { position: fixed; inset: 0; z-index: 99999; background: #1a1a20;
            display: grid; place-items: center;
            transform: translate3d(0,0,0);
            transition: transform 900ms cubic-bezier(0.76,0,0.24,1); }
  #loader[data-out='true'] { transform: translate3d(0,-101%,0); }   /* curtain lift, transform only */
  #loader-inner { transition: transform 380ms cubic-bezier(0.33,1,0.68,1), opacity 380ms linear; }
  #loader[data-out='true'] #loader-inner { transform: scale(1.06); opacity: 0; }
  #loader-bar { transform: scaleX(0); transform-origin: left center; }  /* scaleX, NOT width */
  #loader-count { font-variant-numeric: tabular-nums; }
  /* CSS-keyframe wordmark rise + 14 chalk-dust dots. Transform/opacity
     only; each dot's blur() is STATIC and never animated. */
  html[data-tier='low'] .crux-dust { display: none; }
  @media (prefers-reduced-motion: reduce) { .crux-dust { display: none; } }
</style>

<script>
  // 1 · Lock scroll before anything can paint or scroll.
  document.documentElement.style.overflow = 'hidden'

  // 2 · Device tier BEFORE first paint, so CSS degrades with no flash and
  //     React never re-renders for it.
  ;(function () {
    var n = navigator, cores = n.hardwareConcurrency || 8, mem = n.deviceMemory || 8
    var saveData = n.connection && n.connection.saveData
    var coarse = matchMedia('(pointer: coarse)').matches
    document.documentElement.dataset.tier =
      (saveData || cores <= 4 || mem <= 4 || (coarse && cores <= 6)) ? 'low' : 'high'
  })()

  // 3 · The loader bridge — the ONLY global this app creates.
  window.CRUX_LOADER = (function () {
    var bar, count, real = 0, shown = 0, raf = 0, waiters = []
    function paint() {
      shown += (real - shown) * 0.12              // eased follower: never
      if (real - shown < 0.002) shown = real      // regresses, never jumps
      bar.style.transform = 'scaleX(' + shown + ')'
      count.textContent = String(Math.round(shown * 100)).padStart(3, '0')
      if (shown >= 0.999) waiters.splice(0).forEach(function (f) { f() })
      raf = shown < real ? requestAnimationFrame(paint) : 0
    }
    return {
      setProgress: function (p) {
        real = Math.min(1, Math.max(real, p))     // monotonic by contract
        bar = bar || document.getElementById('loader-bar')
        count = count || document.getElementById('loader-count')
        if (!raf) raf = requestAnimationFrame(paint)
      },
      settled: function () {                      // resolves when the user
        return new Promise(function (res) {       // has actually SEEN 100
          shown >= 0.999 ? res() : waiters.push(res)
        })
      },
    }
  })()

  // 4 · Hard-kill watchdog. If the bundle 404s, throws on parse, or a CDN
  //     hangs, the scroll lock would trap the visitor forever.
  setTimeout(function () {
    var loader = document.getElementById('loader')
    if (!loader) return
    document.documentElement.style.overflow = ''
    document.getElementById('root').dataset.revealed = 'true'
    loader.remove()
  }, 9000)
</script>

<!-- 5 · No-JS escape hatch: undoes the scroll lock. -->
<noscript><style>
  html { overflow: auto !important; }
  #loader { display: none !important; }
  #root { opacity: 1 !important; }
</style></noscript>
```

## The asset manifest — how progress is actually measured

Weights reflect real wall-clock cost, not task count, so the bar moves at a believable rate.

```ts
// src/features/preloader/assetManifest.ts
export type AssetTask = { id: string; weight: number; run: () => Promise<unknown> }

const loadImage = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => { void (image.decode?.() ?? Promise.resolve()).then(() => resolve(), () => resolve()) }
    image.onerror = reject
    image.src = src
  })

export const buildAssetManifest = (): readonly AssetTask[] => [
  // document.fonts.ready ALONE is a trap: it resolves immediately if no text
  // using the face has been laid out yet. Request the exact faces, THEN await.
  { id: 'font:display', weight: 4, run: () => document.fonts.load(FONT_SPEC_DISPLAY) },
  { id: 'font:body',    weight: 2, run: () => document.fonts.load(FONT_SPEC_BODY) },
  { id: 'fonts:ready',  weight: 1, run: () => document.fonts.ready },
  // The single raster in the build. DECODED, not merely fetched, so the wall
  // backdrop can never pop in after reveal.
  { id: 'texture:chalk', weight: 3, run: () => loadImage(TEXTURE_CHALK_URL) },
  // Everything the document declares (CSS, the module graph).
  { id: 'window:load',  weight: 4, run: () => waitForWindowLoad() },
  // React has committed and the browser has painted twice — so "100%"
  // genuinely means "the page behind this curtain is ready".
  { id: 'app:painted',  weight: 2, run: () => nextFrames(PRELOADER_PAINT_FRAMES) },
]
```

```ts
// src/features/preloader/preloadAssets.ts
export const preloadAssets = async (onProgress: (progress: number) => void): Promise<void> => {
  const tasks = buildAssetManifest()
  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0)
  let doneWeight = 0
  onProgress(0)
  await Promise.all(
    tasks.map(async task => {
      try { await withTimeout(task.run(), PRELOADER_ASSET_TIMEOUT_MS) }
      catch { if (import.meta.env.DEV) console.warn(`[boot] skipped ${task.id}`) }
      finally { doneWeight += task.weight; onProgress(doneWeight / totalWeight) }
    }), // ← a dead or 404'd asset can NEVER block the page
  )
}
```

`progressFloor.ts` raises a **monotonic** synthetic floor from 0 to `PRELOADER_TRICKLE_CAP` (0.9)
over `PRELOADER_MAX_WAIT_MS`, reported as `max(real, floor)`. Because `setProgress` is monotonic by
contract, the bar can never regress when real progress overtakes the floor. This is what stops the
counter freezing at "31%" on a slow connection — the honest failure mode of naive count-based
progress.

## `src/constants/preloader.ts`

```ts
export const PRELOADER_MIN_DISPLAY_MS     = 1400 // long enough to read CRUX and see the chalk puff
export const PRELOADER_MAX_WAIT_MS        = 6000 // hard ceiling: reveal regardless
export const PRELOADER_ASSET_TIMEOUT_MS   = 4000 // per asset
export const PRELOADER_CURTAIN_MID_MS     = 380  // when the lift clears the fold
export const PRELOADER_CURTAIN_TOTAL_MS   = 900
export const PRELOADER_REMOVE_FALLBACK_MS = 1400 // if transitionend never fires
export const PRELOADER_TRICKLE_CAP        = 0.9
export const PRELOADER_PAINT_FRAMES       = 2
```

## `src/features/preloader/startBoot.ts` — the 5-phase reveal

```ts
export const startBoot = async (root: HTMLElement): Promise<void> => {
  const startedAt = performance.now()
  const stopFloor = startProgressFloor(loaderBridge.setProgress)

  await Promise.race([preloadAssets(loaderBridge.setProgress), delay(PRELOADER_MAX_WAIT_MS)])
  stopFloor()
  loaderBridge.setProgress(1)

  await delay(Math.max(0, PRELOADER_MIN_DISPLAY_MS - (performance.now() - startedAt)))
  await loaderBridge.settled()     // the user must actually SEE 100

  // ── PHASE 1 · reveal #root while still fully covered ──────────────
  // The first paint of a whole page is expensive; painting it behind an
  // opaque curtain hides that cost. (Revealing at the fade MIDPOINT, as a
  // naive implementation does, makes that cost half-visible.)
  window.scrollTo(0, 0)
  unlockScroll()                   // ← the ONE unlock call site
  root.dataset.revealed = 'true'

  // ── PHASE 2 · 'ready' → measure while still covered ───────────────
  setAppPhase('ready')             // → lenis.resize() then ScrollTrigger.refresh()
  await nextFrames(PRELOADER_PAINT_FRAMES)

  // ── PHASE 3 · lift the curtain (transform only, 900ms) ────────────
  const loader = document.getElementById(ELEMENT_ID_LOADER)
  if (loader) loader.dataset.out = 'true'

  // ── PHASE 4 · 'entered' → play entrance timelines as it lifts ─────
  await delay(PRELOADER_CURTAIN_MID_MS)
  setAppPhase('entered')

  // ── PHASE 5 · remove the loader; transitionend + timeout fallback ──
  if (loader) onTransitionEnd(loader, PRELOADER_REMOVE_FALLBACK_MS, () => loader.remove())
}
```

**Two events, not one, is the key structural decision.** `'ready'` means *layout is final — measure
now*; `'entered'` means *you are visible — animate now*. Conflating them is what forces a magic
`setTimeout` guess, because ScrollTrigger must measure a laid-out, unlocked page **before** the
entrance plays, and the entrance must not run behind an opaque curtain.

## `src/features/preloader/appPhaseStore.ts` — an external store, not an event

A `once: true` event listener is wrong here: a component mounting **after** the event fires would
never learn about it and its timeline would never play. `onAppPhase` fires immediately if the phase
has already been reached, which removes the mount-order race entirely.

```ts
import type { AppPhase } from '../../shared/types'

const PHASE_ORDER: readonly AppPhase[] = ['loading', 'ready', 'entered']
let phase: AppPhase = 'loading'
const subs = new Set<() => void>()

export const getAppPhase = (): AppPhase => phase
export const subscribeAppPhase = (listener: () => void): (() => void) => {
  subs.add(listener)
  return () => { subs.delete(listener) }
}

export const setAppPhase = (next: AppPhase): void => {
  if (PHASE_ORDER.indexOf(next) <= PHASE_ORDER.indexOf(phase)) return // monotonic
  phase = next
  subs.forEach(listener => listener())
  window.dispatchEvent(new CustomEvent(`crux:${next}`))   // non-React consumers
}

/** Fires immediately if the phase has already been reached. Returns an unsubscribe. */
export const onAppPhase = (target: AppPhase, callback: () => void): (() => void) => {
  if (PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf(target)) { callback(); return () => {} }
  const listener = (): void => {
    if (PHASE_ORDER.indexOf(phase) < PHASE_ORDER.indexOf(target)) return
    subs.delete(listener)
    callback()
  }
  subs.add(listener)
  return () => { subs.delete(listener) }
}
```

```ts
// src/shared/hooks/useAppPhase.ts
export const useAppPhase = (): AppPhase =>
  useSyncExternalStore(subscribeAppPhase, getAppPhase, () => 'loading')
```

## `src/motion/scrollLock.ts` — one lock, two drivers

There are **not** two competing lock mechanisms. This module owns the lock, *adopts* the pre-bundle
inline `overflow: hidden` rather than duplicating it, and Lenis registers as an extra driver when it
appears.

```ts
export type ScrollLockDriver = { stop: () => void; start: () => void }

let driver: ScrollLockDriver | null = null
// Adopt whatever the inline <script> already did. This is why there is one
// mechanism, not two: the module reads the existing state.
let locked = document.documentElement.style.overflow === 'hidden'

export const isScrollLocked = (): boolean => locked

/** Lenis registers here. A driver arriving mid-lock inherits the lock, so
 *  Lenis starts stopped during the preloader with no extra call site. */
export const registerScrollLockDriver = (next: ScrollLockDriver | null): void => {
  driver = next
  if (!driver) return
  if (locked) driver.stop()
  else driver.start()
}

export const lockScroll = (): void => {
  locked = true
  document.documentElement.style.overflow = 'hidden'
  driver?.stop()
}

export const unlockScroll = (): void => {
  locked = false
  document.documentElement.style.overflow = ''
  driver?.start()
}
```

Both mechanisms are needed and neither alone is sufficient: `overflow: hidden` is the only thing
that works **before the bundle parses** (Lenis does not exist yet), and `lenis.stop()` is the only
thing that stops Lenis' **virtual** scroll (with Lenis running, `overflow: hidden` alone does not
stop it accumulating wheel deltas, which then jump on unlock). `unlockScroll()` in phase 1 is the
single call site that reverses both, in the right order.

## `src/motion/smoothScroll.ts` — Lenis, StrictMode-safe

```ts
import type Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsapClient'
import { registerScrollLockDriver } from './scrollLock'
import { prefersReducedMotion, getDeviceTier } from '../shared/lib'
import { MEDIA_QUERY_CAN_PIN } from '../constants'
import * as C from '../constants'

/** Module singleton + refcount: the StrictMode answer. */
let instance: Lenis | null = null
let refCount = 0
let teardown: (() => void) | null = null
let scheduledTeardown = 0

export const getLenis = (): Lenis | null => instance

export const shouldUseSmoothScroll = (): boolean =>
  !prefersReducedMotion()
  && getDeviceTier() === 'high'
  && window.matchMedia(MEDIA_QUERY_CAN_PIN).matches

export const acquireSmoothScroll = async (): Promise<() => void> => {
  refCount += 1
  window.clearTimeout(scheduledTeardown)        // a re-mount cancels teardown

  if (!shouldUseSmoothScroll()) return releaseSmoothScroll
  if (instance) return releaseSmoothScroll

  // Lazy: never downloaded by reduced-motion, low-tier or mobile users.
  const { default: LenisCtor } = await import('lenis')

  // The effect may have been cleaned up while this import was in flight.
  if (refCount === 0 || instance) return releaseSmoothScroll

  const lenis = new LenisCtor({
    lerp: C.LENIS_LERP,
    orientation: C.LENIS_ORIENTATION,
    gestureOrientation: C.LENIS_GESTURE_ORIENTATION,
    smoothWheel: C.LENIS_SMOOTH_WHEEL,
    syncTouch: C.LENIS_SYNC_TOUCH,
    wheelMultiplier: C.LENIS_WHEEL_MULTIPLIER,
    autoRaf: C.LENIS_AUTO_RAF,
    anchors: C.LENIS_ANCHORS,
    overscroll: C.LENIS_OVERSCROLL,
    prevent: node => node.hasAttribute(C.LENIS_PREVENT_ATTRIBUTE),
  })
  instance = lenis

  // 1 · ScrollTrigger reads Lenis' position on every Lenis frame.
  const onLenisScroll = (): void => { ScrollTrigger.update() }
  lenis.on('scroll', onLenisScroll)

  // 2 · ONE rAF for the entire app: GSAP's ticker drives Lenis.
  //     gsap.ticker passes SECONDS; lenis.raf expects MILLISECONDS.
  const onTick = (time: number): void => { lenis.raf(time * C.LENIS_MS_PER_SECOND) }
  gsap.ticker.add(onTick)

  // 3 · Kill lag smoothing. After a long task GSAP would otherwise
  //     fabricate a catch-up delta, desyncing Lenis from ScrollTrigger —
  //     visible as the pinned track snapping.
  gsap.ticker.lagSmoothing(C.GSAP_LAG_SMOOTHING_DISABLED)

  // 4 · Lenis must be re-measured immediately BEFORE every refresh.
  const onRefreshInit = (): void => { lenis.resize() }
  ScrollTrigger.addEventListener('refreshInit', onRefreshInit)

  // 5 · Hand Lenis to the single-sourced scroll lock; it inherits the
  //     current lock state, so it starts stopped during the preloader.
  registerScrollLockDriver({ stop: () => lenis.stop(), start: () => lenis.start() })

  teardown = () => {
    registerScrollLockDriver(null)
    ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
    gsap.ticker.remove(onTick)
    gsap.ticker.lagSmoothing(C.GSAP_LAG_SMOOTHING_THRESHOLD_MS, C.GSAP_LAG_SMOOTHING_ADJUSTED_MS)
    lenis.off('scroll', onLenisScroll)
    lenis.destroy()
    instance = null
    teardown = null
  }

  return releaseSmoothScroll
}

export const releaseSmoothScroll = (): void => {
  refCount = Math.max(0, refCount - 1)
  if (refCount > 0) return
  // Deferred by a macrotask so StrictMode's synchronous
  // mount → unmount → mount does not thrash the instance.
  scheduledTeardown = window.setTimeout(() => { if (refCount === 0) teardown?.() }, 0)
}
```

```tsx
// src/app/providers/SmoothScrollProvider.tsx
// SINGLE RESPONSIBILITY: the Lenis lifecycle. Nothing else lives here —
// no ScrollTrigger refresh, no phase subscription, no reveal init.
export type SmoothScrollProviderProps = { children: ReactNode }

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  useEffect(() => {
    let release: (() => void) | null = null
    let cancelled = false

    void acquireSmoothScroll().then(releaseFn => {
      // Cleanup can precede resolution — that is the leak StrictMode exposes.
      if (cancelled) { releaseFn(); return }
      release = releaseFn
    })

    return () => {
      cancelled = true
      release?.()
      if (!release) releaseSmoothScroll()  // balance the refcount acquire() took synchronously
    }
  }, [])

  return <>{children}</>
}
```

**Four defences against StrictMode double-invocation, all needed together:** the module singleton
(two Lenis instances would double-apply wheel deltas — the page scrolls at 2×, the classic
symptom); the refcount (mount → unmount → mount is 1 → 0 → 1, teardown only at 0); the deferred
teardown (the synchronous pair never actually destroys and rebuilds); and the async cancellation
(handles cleanup running before `import('lenis')` resolves).

### Why not `scrollerProxy`

`scrollerProxy` exists for smooth scrollers that **transform a wrapper element** (Locomotive's
default mode), or for a Lenis instance given a custom `wrapper`/`content`. Default Lenis drives
**real `window.scrollY`**, so ScrollTrigger's normal window scroller already reads correct values.
Adding `scrollerProxy` would mean re-implementing `scrollTop`/`getBoundingClientRect`/`pinType` by
hand for zero benefit, and risks forcing `pinType: 'transform'`, which is materially worse for the
pinned wall.

### Refresh ordering — there is exactly one chain

```
any refresh trigger (resize / fonts / ResizeObserver / phase 'ready')
  → ScrollTrigger fires 'refreshInit'
      → lenis.resize()          ← ALWAYS first. Lenis' limit must be correct
                                  before ScrollTrigger derives positions from it.
  → ScrollTrigger recomputes starts/ends, re-evaluates function values,
    rebuilds pin-spacers
  → ScrollTrigger fires 'refresh'
      → the swipe-mode maxScroll cache re-reads (mobile branch only)
```

Because that hook is registered **once**, inside `acquireSmoothScroll`, no call site can get it
wrong and `lenis.resize()` is never called by hand anywhere else.

Never refresh mid-momentum: a refresh while Lenis has inertia in flight lands the user inside the
momentum curve and the pin visibly jumps. All programmatic refreshes go through `refreshWhenIdle()`,
which defers to ScrollTrigger's `scrollEnd` when `ScrollTrigger.isScrolling()`. Also never call
refresh from inside a Lenis `scroll` callback — that is a re-entrant refresh during scroll.

### Lenis config, with a reason per value

| Option | Value | Reason |
|---|---|---|
| `lerp` | `0.1` | Framerate-independent catch-up ratio, composes predictably with ScrollTrigger `scrub`. |
| `duration` | **not set** | Mutually exclusive with `lerp`; couples settle time to delta size, making long flicks floaty on a pinned scrub. Setting both is a config bug. |
| `easing` | **not set** | Only meaningful with `duration`. |
| `smoothWheel` | `true` | The entire reason Lenis is here: reconciling trackpad vs notched-wheel granularity. |
| `syncTouch` | **`false`** | Clear position: off. It moves touch scrolling onto the main thread by `preventDefault`-ing `touchmove`, losing OS momentum — the biggest jank source on mid-tier Android — and fights iOS rubber-banding. |
| `wheelMultiplier` | `1` | Higher overshoots the pinned rail per notch; lower feels sticky. |
| `orientation` / `gestureOrientation` | `'vertical'` | Guarantees Lenis ignores horizontal swipes, so the mobile card rail keeps its own gesture. |
| `autoRaf` | `false` | GSAP's ticker owns the single rAF. |
| `anchors` | `false` | No in-page navigation in this build (the brief forbids working nav). |
| `overscroll` | `false` | Stops nested-instance overscroll leaking to the page. |
| `prevent` | `data-lenis-prevent` | Excludes the mobile swipe viewport. |
| `gsap.ticker.lagSmoothing` | `0` | A long task must not make GSAP fabricate a catch-up delta and desync Lenis. |

### Reduced motion: Lenis is never constructed or downloaded

`shouldUseSmoothScroll()` returns false, and the `import('lenis')` sits **after** that guard, so the
chunk is never requested. Lenis 1.3 does ship `respectReducedMotion` (forcing `lerp: 1`), but even
then it keeps a wheel listener attached and scroll on the main thread. Skipping removes the
listener, the tick and the bytes.

**ScrollTrigger still works completely in that branch, structurally, not by luck:** its default
window scroller is native scroll and needs no help; `lenis.on('scroll', ScrollTrigger.update)` and
the `refreshInit` hook are only wired inside the Lenis branch; `scrollLock` no-ops with
`driver === null`; `lagSmoothing(0)` is only applied inside the branch; and nothing else in the
codebase requires `getLenis()`.

## The ESLint rules that enforce the token discipline

```js
// eslint.config.js — flat config, NON-type-aware (see 05-DEPENDENCIES.md)
{
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/motion/**'],
  rules: {
    'no-restricted-imports': ['error', {
      paths: [{ name: 'gsap', message: 'Import from src/motion/gsapClient instead.' },
              { name: 'gsap/ScrollTrigger', message: 'Import from src/motion/gsapClient instead.' }],
    }],
  },
},
{
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/constants/**'],
  rules: {
    'no-restricted-syntax': ['error',
      { selector: "Literal[value=/^(power|expo|back|circ|sine|elastic)[0-4]?\\.(in|out|inOut)/]",
        message: 'Use an EASE_* constant from src/constants/motion.ts.' },
      { selector: "Literal[value=/^(top|bottom|left|right)\\s+-?[\\d.]+%?$/]",
        message: 'Use a SCROLL_TRIGGER_* constant from src/constants/motion.ts.' },
    ],
  },
}
```

## Two things to validate at step 4, not step 14

- **`useGSAP` returning a cleanup function.** The plan relies on
  `useGSAP(() => { ...; return () => media.revert() })` firing, since `useGSAP` wraps
  `gsap.context()`. Validate with a 5-line throwaway (mount/unmount, assert
  `ScrollTrigger.getAll().length === 0`). Fallback: a sibling
  `useEffect(() => () => mediaRef.current?.revert(), [])` — two lines, but far better discovered at
  step 4 than step 14.
- **`containerAnimation` accepts a timeline** per the typedefs, but the documented, well-trodden
  shape is a plain linear `x` tween. Keep the x driver standalone and drive the progress bar and
  counter from its ScrollTrigger's `onUpdate`. The "one timeline, three tweens" refactor is the
  tempting change that breaks the card triggers.
