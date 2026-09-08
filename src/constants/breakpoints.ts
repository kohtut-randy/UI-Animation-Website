/* Mirrors Tailwind v4's md/lg breakpoints; px stays fixed because rem in a media query ignores the fluid html font-size. */
export const BREAKPOINT_TABLET_PX = 768 // === --breakpoint-md: 48rem
export const BREAKPOINT_DESKTOP_PX = 1024 // === --breakpoint-lg: 64rem

export const MEDIA_QUERY_MOBILE = `(max-width: ${BREAKPOINT_TABLET_PX - 0.02}px)` as const
export const MEDIA_QUERY_TABLET = `(min-width: ${BREAKPOINT_TABLET_PX}px) and (max-width: ${BREAKPOINT_DESKTOP_PX - 0.02}px)` as const
export const MEDIA_QUERY_DESKTOP = `(min-width: ${BREAKPOINT_DESKTOP_PX}px)` as const
export const MEDIA_QUERY_CAN_PIN = `(min-width: ${BREAKPOINT_TABLET_PX}px)` as const
export const MEDIA_QUERY_MOTION = '(prefers-reduced-motion: no-preference)' as const
export const MEDIA_QUERY_REDUCE = '(prefers-reduced-motion: reduce)' as const
export const MEDIA_QUERY_CAN_HOVER = '(hover: hover) and (pointer: fine)' as const
