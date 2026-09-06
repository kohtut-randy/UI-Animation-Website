/* The only place breakpoint numbers exist in TypeScript. They mirror Tailwind v4's own
   `md` and `lg` defaults, which already are the boundaries the brief asks for.

   Note the media-query rem gotcha both projects rely on: `rem` inside a media query
   always resolves against the browser's initial 16px root size, never the fluid
   `html { font-size }`. So --breakpoint-md: 48rem is 768px at every root size, and
   these px values stay in step with the CSS while the type scale is fluid. */
export const BREAKPOINT_TABLET_PX = 768 // === --breakpoint-md: 48rem
export const BREAKPOINT_DESKTOP_PX = 1024 // === --breakpoint-lg: 64rem

export const MEDIA_QUERY_MOBILE = `(max-width: ${BREAKPOINT_TABLET_PX - 0.02}px)` as const
export const MEDIA_QUERY_TABLET = `(min-width: ${BREAKPOINT_TABLET_PX}px) and (max-width: ${BREAKPOINT_DESKTOP_PX - 0.02}px)` as const
export const MEDIA_QUERY_DESKTOP = `(min-width: ${BREAKPOINT_DESKTOP_PX}px)` as const
export const MEDIA_QUERY_CAN_PIN = `(min-width: ${BREAKPOINT_TABLET_PX}px)` as const
export const MEDIA_QUERY_MOTION = '(prefers-reduced-motion: no-preference)' as const
export const MEDIA_QUERY_REDUCE = '(prefers-reduced-motion: reduce)' as const
export const MEDIA_QUERY_CAN_HOVER = '(hover: hover) and (pointer: fine)' as const
