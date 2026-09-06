# Architecture

## Product shape

The page is an original long-form scroll tale. The recruiter references inform motion
density and pacing only.

## Layers

- `src/main.tsx`: boot order only.
- `src/app`: providers and page composition.
- `src/features/preloader`: real asset progress and reveal phases.
- `src/features/hero`: hero markup, live Canvas weather, and layered parallax.
- `src/features/wall`: sticky chapters, Canvas atmospheres, kinetic type, SVG map,
  Lottie oath, and Canvas finale.
- `src/motion`: shared GSAP, Lenis, refresh, and performance policy.
- `src/shared`: presentation components and small utilities.
- `src/constants`: all motion and breakpoint values.

## Motion ownership

- GSAP imports only through `motion/gsapClient.ts`.
- `useHeroMotion` owns hero entrance and scroll parallax.
- `useWallMotion` owns chapter depth, wipes, kinetic type, SVG drawing, and progress.
- Each Canvas component owns its viewport-aware drawing loop and resize lifecycle.
- `Oath` owns the scroll-controlled Lottie instance.
- CSS owns hover transitions and the pre-bundle loader.

No two systems write `transform` on the same element.

## Runtime phases

`loading` waits for fonts, hero art, document load, and React paint. `ready` unlocks the
page and refreshes measurements. `entered` starts the hero entrance while the curtain
lifts.

## Responsive policy

- Below 768px: native touch scrolling with sticky scenes.
- From 768px: Lenis smooths wheel input while ScrollTrigger controls sticky scenes.
- `?motion=reduce`: no pin, scrub, or travel. Content remains fully available.

## Performance rules

- Scroll motion uses transforms and opacity only.
- Layout is measured during refresh, never during scroll.
- Lenis and Lottie are loaded dynamically.
- Decorative motion can be disabled by the frame-rate guard.
- Generated art has explicit dimensions and is decoded before reveal.
