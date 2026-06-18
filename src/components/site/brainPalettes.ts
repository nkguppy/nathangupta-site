/**
 * Brain colour presets for the WebGL SurfaceBrain (DEV exploration — `?palette=`,
 * switchable live via HeroLab). The default `periwinkle` is the current locked look;
 * the others lower HOT toward periwinkle (not white) + drop hotMix/exposure so the
 * fresnel rims stop blowing to harsh white and the cortex sits INTO the graphite/
 * indigo background instead of punching out of it.
 *
 *   color    — base / dim-face tint
 *   hot      — bright rim + gyral-crown peak (near-white in `periwinkle` = the harshness)
 *   hotMix   — how hard rims pull toward `hot` (lower = less white blowout)
 *   exposure — overall intensity over the live Background
 */
export type BrainPalette = 'periwinkle' | 'iris' | 'amethyst' | 'abyss' | 'cyan'

export const BRAIN_PALETTES: Record<
  BrainPalette,
  { label: string; color: string; hot: string; hotMix: number; exposure: number }
> = {
  periwinkle: { label: 'Periwinkle (current)', color: '#aeb6ff', hot: '#e6e9ff', hotMix: 0.7, exposure: 3.0 },
  iris: { label: 'Iris', color: '#7b82ee', hot: '#b9c0ff', hotMix: 0.55, exposure: 2.6 },
  amethyst: { label: 'Amethyst', color: '#8e74f0', hot: '#cdb8ff', hotMix: 0.6, exposure: 2.7 },
  abyss: { label: 'Abyss (muted)', color: '#5560c8', hot: '#8e9bf2', hotMix: 0.45, exposure: 2.3 },
  cyan: { label: 'Electric cyan', color: '#56b8f5', hot: '#bce8ff', hotMix: 0.55, exposure: 2.6 },
}

// Nathan's pick (2026-06-18): `iris` — deeper periwinkle, hot pulled off white, so
// the brain glows on-brand and integrates with the graphite/indigo bg instead of
// blowing to harsh white. `periwinkle` kept as the original/brighter option.
export const DEFAULT_BRAIN_PALETTE: BrainPalette = 'iris'

export const isBrainPalette = (v: string | null): v is BrainPalette =>
  v != null && Object.prototype.hasOwnProperty.call(BRAIN_PALETTES, v)
