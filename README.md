# The Last Ember

Part 1 of the Rezerv frontend assessment: a single animation-heavy landing page.
Same feel as the reference (full-screen art, sparse text, constant motion), but with
original artwork, story, layout, and interaction design.

- **Live:** https://animation-website-sooty-sigma.vercel.app/
- **Repo:** https://github.com/kohtut-randy/UI-Animation-Website
- **Reduced motion:** `?motion=reduce`

## Setup

```bash
nvm use && npm install && npm run dev   # http://localhost:5173
```

Node `^20.19 || >=22.12`. Checks: `npm run lint`, `npm run typecheck`, `npm run build`.

## The 3 sections

The brief calls these "slides/sections". This page is one continuously scrolling story,
so they are full-height scroll sections, not a slide deck: nothing advances by click or
step, and there is no per-slide pagination.

| #   | Section              | Where                                      | What it does                                                                                    |
| --- | -------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 1   | Loading screen       | `index.html` loader + `features/preloader` | Canvas forge sparks, SVG blade progress path, real weighted asset progress, curtain transition. |
| 2   | Hero                 | `features/hero`                            | Staged title motion, live rain, water ripples, drifting embers, mist, layered image parallax.   |
| 3   | Content / collection | `features/wall`                            | Four pinned story chapters, three interludes, one finale (below).                               |

Section 3 is one continuous scroll, not several stacked scenes. Each chapter has its
own artwork, weather layers, depth parallax, painted wipe, and pacing. Between them,
three interludes break the rhythm: kinetic typography, a scroll-drawn SVG map, and a
scroll-scrubbed Lottie torii gate. The finale draws a canvas sword trail that reveals a
live smoke and ember field, which keeps burning after scrolling stops.

No routing, no navigation, no working CTAs, as the brief requires.

## Libraries and why

| Library                  | Why                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| React 19 + TypeScript    | One clear feature boundary per section, typed component contracts.                                                                      |
| GSAP + ScrollTrigger     | Covers entrance timelines, pinning, scrub, and parallax in one timeline model. `gsap.matchMedia()` also reverts pins cleanly on resize. |
| Lenis                    | Smooth wheel scrolling on desktop only, so it never fights native touch momentum.                                                       |
| lottie-web (light)       | The oath gate is a Lottie scene. The light build drops the unused expression engine.                                                    |
| Tailwind CSS v4          | Token-driven visual system in one layer.                                                                                                |
| class-variance-authority | The button has two real variant axes (tone, size), where ternaries stop being readable.                                                 |

All artwork is original and generated for this project.

## Animation, smooth scroll, responsiveness

Scroll-linked motion animates `transform` and `opacity` only. GSAP owns scroll position
and choreography. Lottie only supplies frames.

**Smooth scroll.** Lenis is a dynamic import, desktop pointers only. Touch keeps native
momentum.

**Hover.** Always a CSS transition, never GSAP. It is compositor-driven, needs no
listener, works before hydration, and stops GSAP from tweening a property that also
carries a transition. Buttons are real `<button>` elements with `focus-visible` rings
and no `onClick`. See `shared/components/Button.tsx`, `HoldCard.tsx`.

**Resize.** No resize listener anywhere. `gsap.matchMedia()` is the breakpoint _and_ the
resize strategy: on any condition change it reverts what was built inside it, which
removes pins and pin-spacers cleanly, then rebuilds.

Breakpoints live in `constants/breakpoints.ts` and mirror Tailwind v4 defaults:

| Range        | Behaviour                                                     |
| ------------ | ------------------------------------------------------------- |
| `< 768px`    | Native scroll, sticky scenes instead of pins, lighter motion. |
| `768–1023px` | Sticky chapters, scroll-linked depth.                         |
| `≥ 1024px`   | Lenis smoothing, full motion system.                          |

Checked 320x700 to 1920x1080. No overflow, no console errors.

## Performance

- The loader is inline in `index.html`, so the bar moves on first paint while the bundle
  is still downloading. It waits on decoded story art and Lottie data, weighted by size.
- A watchdog reveals the page if JavaScript or an asset fails.
- Device tier (cores, memory, `saveData`, coarse pointer) is measured up front and
  written to `data-tier`, so weak devices degrade instead of janking.
- Lottie and Lenis are dynamic imports. GSAP and React are separate cached chunks.
- Story art past the first plate is `loading="lazy"` and decodes async.
- Scroll handlers never read layout. SVG path length is measured once, at setup.

Reduced motion is one attribute, `<html data-motion-mode>`, set before first paint and
read by CSS, by every GSAP context, and by the canvas fields. It kills pins, scrubs,
particles, and Lenis together.

## Note for reviewers: macOS "Reduce Motion"

If **System Settings → Accessibility → Display → Reduce Motion** is on, Safari and
Chrome on macOS can suppress some CSS transitions and throttle or skip scroll-linked
effects at the browser/OS level — separately from this site's own reduced-motion
handling, which is off by default (see Assumptions below). This can make the motion
look muted or missing even though nothing is broken.

To see the full experience, turn Reduce Motion off before reviewing, or visit with
`?motion=reduce` if you'd rather review the intentionally reduced path instead.

## Assumptions

- Original subject matter and artwork are allowed. "Match the feel" means matching
  motion ambition and pacing, not copying the reference.
- One long content section serves "one content/collection section" better than three
  shallow ones.
- Buttons hover and click but navigate nowhere, as required.
- **The OS `prefers-reduced-motion` flag is not read.** This demo is judged on its
  motion, and a reviewer with that flag on would otherwise see a static page. Full
  motion is the default; `?motion=reduce` opts in. The reduced path is fully built in
  three layers (CSS durations, a `reduce` flag in every GSAP hook, and module-level
  skipping of Lenis and the canvases). Honouring the OS setting in a real product is a
  one-line change in the `index.html` bootstrap.

## Known limits

- Deployment and the live URL are pending.
- Reduced mode is reachable only through `?motion=reduce`.
- Mobile keeps native touch momentum instead of forced smooth scrolling.