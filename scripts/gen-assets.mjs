/**
 * Generates cool, abstract essay covers + favicon. Each cover shares a system
 * (gradient ground, soft blurred forms, a faint neural "signal" trace and a
 * dot field) but gets its own palette so the grid reads as a set, not clones.
 *
 *   node scripts/gen-assets.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const coversDir = resolve(root, 'public/covers')
mkdirSync(coversDir, { recursive: true })

const W = 880
const H = 560

// Deterministic PRNG so re-runs are stable.
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Smooth EEG-like trace across the canvas.
function signalPath(rand, y, amp) {
  const steps = 26
  const dx = W / steps
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

function cover({ name, seed, c1, c2, blob, trace }) {
  const rand = rng(seed)
  const blobs = Array.from({ length: 4 }, (_, i) => {
    const cx = 120 + rand() * (W - 240)
    const cy = 80 + rand() * (H - 160)
    const r = 130 + rand() * 190
    const op = (0.32 + rand() * 0.3).toFixed(2)
    const fill = i % 2 === 0 ? blob : '#ffffff'
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${op}" />`
  }).join('\n      ')

  const traces = [0.32, 0.52, 0.72]
    .map((f, i) => {
      const d = signalPath(rand, H * f, 26 + i * 10)
      const op = (0.16 + i * 0.06).toFixed(2)
      return `<path d="${d}" fill="none" stroke="${trace}" stroke-width="${1.4 + i * 0.4}" opacity="${op}" stroke-linecap="round" />`
    })
    .join('\n      ')

  const dots = []
  for (let gx = 0; gx < 9; gx++) {
    for (let gy = 0; gy < 6; gy++) {
      if (rand() > 0.55) continue
      const x = 70 + gx * 95
      const y = 70 + gy * 78
      dots.push(`<circle cx="${x}" cy="${y}" r="2.2" fill="${trace}" opacity="${(0.1 + rand() * 0.22).toFixed(2)}" />`)
    }
  }

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="46" />
    </filter>
    <radialGradient id="vig" cx="50%" cy="42%" r="75%">
      <stop offset="0" stop-color="#000000" stop-opacity="0" />
      <stop offset="1" stop-color="#000000" stop-opacity="0.22" />
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <g filter="url(#soft)">
      ${blobs}
  </g>
  <g>
      ${dots.join('\n      ')}
  </g>
  <g>
      ${traces}
  </g>
  <rect width="${W}" height="${H}" fill="url(#vig)" />
</svg>
`
  writeFileSync(resolve(coversDir, `${name}.svg`), svg, 'utf8')
  return `${name}.svg`
}

// Cool Graphite covers — periwinkle / indigo / violet / blue / teal, one per
// essay so the grid reads as a set. No warm hues.
const set = [
  { name: 'essay-silence', seed: 7, c1: '#9aa6f2', c2: '#3a3f9e', blob: '#c8cef8', trace: '#1b1f5e' },
  { name: 'essay-memory', seed: 21, c1: '#c3aae6', c2: '#5a3f9e', blob: '#e2d4f5', trace: '#2a1a5a' },
  { name: 'essay-multitask', seed: 42, c1: '#9ec2f0', c2: '#3a5fa6', blob: '#cfe1f7', trace: '#13284a' },
  { name: 'essay-certainty', seed: 88, c1: '#b0b6ee', c2: '#474aa6', blob: '#d8dbf6', trace: '#222a6a' },
  { name: 'essay-scan', seed: 130, c1: '#9ccdd9', c2: '#2f6f88', blob: '#d4ecf2', trace: '#0f3a46' },
  { name: 'essay-economy', seed: 205, c1: '#a6c8cc', c2: '#3f7a82', blob: '#d2eaee', trace: '#103438' },
]

const made = set.map(cover)

// Favicon — a periwinkle neural glyph with an offset node, on graphite.
const favicon = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="12" fill="#16171A" />
  <circle cx="24" cy="24" r="13" fill="none" stroke="#7C84F2" stroke-width="3" />
  <circle cx="24" cy="24" r="4.2" fill="#7C84F2" />
  <circle cx="36" cy="13" r="3.1" fill="#7C84F2" />
  <line x1="27.4" y1="20.8" x2="33.6" y2="15.2" stroke="#7C84F2" stroke-width="2.4" stroke-linecap="round" />
</svg>
`
writeFileSync(resolve(root, 'public/favicon.svg'), favicon, 'utf8')

console.log('Generated covers:', made.join(', '))
console.log('Generated favicon.svg')
