# The Last Ember

An original cinematic samurai tale built for Part 1 of the Rezerv frontend assessment.
It borrows the reference site's emphasis on full-screen art, sparse text, and continuous
motion, but uses original artwork, story, layout, and interaction design.

**Live URL:** pending deployment

## Setup

```bash
nvm use
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Implemented experience

1. **Preloader:** Canvas forge sparks, an SVG blade progress path, real weighted asset
   progress, and a curtain transition.
2. **Hero:** the ronin enters a storm through staged title motion, live rain, water
   ripples, drifting embers, mist, and layered image parallax.
3. **Story:** four long, pinned chapters use distinct original artwork, weather layers,
   depth parallax, painted wipes, and scene-specific pacing.
4. **Interludes:** kinetic typography, a scroll-drawn SVG map, and a full-screen
   scroll-controlled Lottie torii gate change the visual rhythm between chapters.
5. **Finale:** a Canvas sword trail reveals a live field of smoke and embers that keeps
   burning after scrolling stops.

## Libraries

- React and TypeScript for structure and strict component contracts.
- GSAP and ScrollTrigger for entrance timelines, pinning, scrub, and parallax.
- Lenis for smooth desktop wheel scrolling on capable devices.
- Lottie Web light player for the original animated oath gate.
- Tailwind CSS v4 for the token-driven visual system.

The artwork is original and generated for this project. It does not use characters,
assets, logos, or compositions from Ghost of Tsushima or the assessment reference.

## Motion approach

The main effects are intentionally visible:

- The hero image zooms into place as the title rises.
- The scene, mist, foreground, copy, rain, ripples, and embers move at different rates.
- Each full-screen chapter stays pinned while its image, foreground, weather, number,
  copy, and ink wash move at separate rates.
- Oversized text rows travel in opposing directions through the kinetic bridge.
- A native SVG route draws itself as the user crosses the map.
- The Lottie oath advances frame by frame from scroll progress.
- The final sword trail draws with scroll while the ember field continues in real time.

All scroll-linked motion uses transforms and opacity. GSAP media contexts rebuild motion
at breakpoints. The assessment runs full motion by default. `?motion=reduce` provides
an explicit static mode.

## Loading and performance

- The preloader exists before the JavaScript bundle and waits for decoded story art and
  the Lottie data.
- A watchdog reveals the page if JavaScript or an asset fails.
- Lottie and Lenis are dynamic imports.
- The light Lottie player is used instead of the full expression player.
- GSAP and React are separate cached chunks.
- Scroll handlers do not read layout. SVG path length is measured once during setup.
- Explicit reduced mode creates no pin or scrub effects.

Current production build passes lint and TypeScript. Browser checks from 320 x 700 to
1920 x 1080 report no overflow or console errors.

## Responsive behavior

- Mobile: native vertical scrolling, sticky scenes, and lighter motion.
- Tablet: sticky chapters and scroll-linked depth.
- Desktop: Lenis smoothing and the full motion system.

## Assumptions

- The brief allows original subject matter and artwork.
- “Match the feel” means matching motion ambition and pacing, not copying the reference.
- Buttons do not navigate, as required.
- Lottie supports the scene, while GSAP owns scroll position and choreography.

## Known limits

- Deployment and the final live URL are still pending.
- Mobile keeps native touch momentum instead of forcing desktop-style smooth scrolling.
