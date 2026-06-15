/**
 * Neural-sphere look presets — shared by NeuralSphere (the engine) and HeroGraphic
 * (the DEV variant lab). Kept in their own module so the component files only export
 * components (react-refresh) and there is a single source of truth for the knobs.
 */
export type SphereVariant = {
  key: string
  label: string
  count: { high: number; low: number }
  dot: [number, number] // node core radius range (px)
  glow: number // soft-glow multiple of the core radius
  linkDist: number // max projected px distance to draw a link
  linkAlpha: number // link opacity ceiling
  maxLinks: number // cap links per node (perf + legibility)
  persp: number // 0 = orthographic, 1 = strong perspective (near nodes larger)
  tilt: number // fixed axis tilt (radians)
  spin: number // auto-rotation speed (rad/s)
  depthDim: number // how much the back hemisphere dims (0..1, lower = dimmer back)
  baseAlpha: number
}

export const SPHERE_VARIANTS: SphereVariant[] = [
  { key: 'nebula', label: 'Nebula · dense + atmospheric', count: { high: 2600, low: 1100 }, dot: [0.5, 1.7], glow: 3.0, linkDist: 42, linkAlpha: 0.42, maxLinks: 3, persp: 0.45, tilt: 0.42, spin: 0.05, depthDim: 0.3, baseAlpha: 0.6 },
  { key: 'network', label: 'Network · structural web', count: { high: 1500, low: 800 }, dot: [0.9, 2.4], glow: 3.4, linkDist: 66, linkAlpha: 0.7, maxLinks: 5, persp: 0.5, tilt: 0.38, spin: 0.06, depthDim: 0.28, baseAlpha: 0.66 },
  { key: 'deep', label: 'Deep · dramatic perspective', count: { high: 2600, low: 1300 }, dot: [0.6, 2.8], glow: 3.8, linkDist: 54, linkAlpha: 0.58, maxLinks: 4, persp: 0.95, tilt: 0.5, spin: 0.045, depthDim: 0.5, baseAlpha: 0.55 },
  { key: 'dual', label: 'Dual · web + inner haze', count: { high: 2200, low: 1050 }, dot: [0.6, 2.0], glow: 3.3, linkDist: 50, linkAlpha: 0.55, maxLinks: 4, persp: 0.5, tilt: 0.42, spin: 0.05, depthDim: 0.36, baseAlpha: 0.6 },
]
