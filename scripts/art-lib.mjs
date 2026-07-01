/**
 * Shared generative-art primitives for the asset scripts (covers + OG cards).
 * Extracted from gen-assets.mjs so gen-og.mjs can build each post's OG card
 * from the SAME palette + seed as its cover — true visual continuity.
 *
 * IMPORTANT: rng/signalPath are deterministic; the cover palettes and seeds are
 * locked (regenerating covers must stay byte-identical). Change nothing here
 * without re-running `node scripts/gen-assets.mjs` and checking `git diff`.
 */

// Deterministic PRNG so re-runs are stable.
export function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Smooth EEG-like trace across a canvas of width `w`.
export function signalPath(rand, y, amp, w = 880) {
  const steps = 26
  const dx = w / steps
  let d = `M 0 ${y.toFixed(1)}`
  let prevX = 0
  let prevY = y
  for (let i = 1; i <= steps; i++) {
    const x = i * dx
    const wobble = Math.sin(i * 0.9 + rand() * 6) * amp * (0.5 + rand())
    const ny = y + wobble
    const cx = (prevX + x) / 2
    d += ` Q ${cx.toFixed(1)} ${prevY.toFixed(1)} ${x.toFixed(1)} ${ny.toFixed(1)}`
    prevX = x
    prevY = ny
  }
  return d
}

// Cool Graphite cover palettes — periwinkle / indigo / violet / blue / teal,
// one per essay so the grid reads as a set. No warm hues. Keyed by the cover
// basename referenced in src/data/site.ts (`cover: '/covers/<key>.svg'`).
export const coverPalettes = {
  'essay-silence': { seed: 7, c1: '#9aa6f2', c2: '#3a3f9e', blob: '#c8cef8', trace: '#1b1f5e' },
  'essay-memory': { seed: 21, c1: '#c3aae6', c2: '#5a3f9e', blob: '#e2d4f5', trace: '#2a1a5a' },
  'essay-multitask': { seed: 42, c1: '#9ec2f0', c2: '#3a5fa6', blob: '#cfe1f7', trace: '#13284a' },
  'essay-certainty': { seed: 88, c1: '#b0b6ee', c2: '#474aa6', blob: '#d8dbf6', trace: '#222a6a' },
  'essay-scan': { seed: 130, c1: '#9ccdd9', c2: '#2f6f88', blob: '#d4ecf2', trace: '#0f3a46' },
  'essay-economy': { seed: 205, c1: '#a6c8cc', c2: '#3f7a82', blob: '#d2eaee', trace: '#103438' },
}
