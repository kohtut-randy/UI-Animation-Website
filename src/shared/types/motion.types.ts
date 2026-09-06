export type Breakpoint = 'mobile' | 'tablet' | 'desktop'
export type ScrollMode = 'pin' | 'swipe'
export type DeviceTier = 'low' | 'high'
export type AppPhase = 'loading' | 'ready' | 'entered'
export type HoldColor = 'crimp' | 'jug' | 'sloper' | 'pinch' | 'pocket' | 'volume'
export type HoldShape = 'blob-a' | 'blob-b' | 'blob-c' | 'blob-d' | 'blob-e'

/** The seven conditions gsap.matchMedia() resolves for every section hook. */
export type MediaFlags = {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  canPin: boolean
  motion: boolean
  reduce: boolean
  canHover: boolean
}
