/**
 * Per-route OG cards — 1200×630 branded share cards for every writing post
 * plus the /work, /writing and /about routes. The homepage keeps the original
 * hand-tuned public/og.png (scripts/og-source.svg) untouched.
 *
 *   npm run og        (or: node scripts/gen-og.mjs)
 *
 * LOCAL-ONLY: needs `brew install librsvg vips` (rsvg-convert renders, vips
 * palette-quantizes without the banding magick's PNG8 produces) and Node ≥23
 * (imports src/data/site.ts via native type stripping). Never runs on Netlify —
 * the PNGs in public/og/ are committed, exactly like public/og.png.
 *
 * Design language (matches scripts/og-source.svg): graphite canvas, mono
 * eyebrow + Fraunces 600 title + periwinkle accent rule on the left; on post
 * cards the right panel is a quiet motif built from THAT post's cover palette
 * and seed (art-lib.mjs), so card and cover read as one family. Route cards
 * reuse the generic card's neural constellation.
 *
 * Gotchas (learned previously, do not relearn): SVG masks are LUMINANCE-based —
 * fade gradients must be white-with-alpha; the Fraunces filename on google/fonts
 * has axis order SOFT,WONK,opsz,wght (opsz-first 404s); never quantize with
 * magick -colors (visible banding in the blur fields).
 *
 * Re-run + commit whenever a post's title/slug/kind/topic changes. The runtime
 * mapping lives in src/lib/og.ts; the prerender step asserts every mapped card
 * exists in dist/og/.
 */
import { existsSync, mkdirSync, writeFileSync, statSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { rng, coverPalettes } from './art-lib.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/og')
mkdirSync(outDir, { recursive: true })

let posts, workMeta, writingMeta
try {
  ;({ posts, workMeta, writingMeta } = await import('../src/data/site.ts'))
} catch (e) {
  console.error(
    'Could not import src/data/site.ts under plain Node. It must stay dependency-free\n' +
      '(no imports, only erasable TS) and Node must be ≥23 (native type stripping).',
  )
  throw e
}

/* ───────────────────────────── fonts ───────────────────────────── */

const fontsDir = resolve(root, 'scripts/fonts')
const FONTS = [
  {
    file: 'Fraunces.ttf',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf',
  },
  {
    file: 'JetBrainsMono.ttf',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf',
  },
]

async function ensureFonts() {
  mkdirSync(fontsDir, { recursive: true })
  for (const f of FONTS) {
    const dest = resolve(fontsDir, f.file)
    if (existsSync(dest)) continue
    console.log(`fetching ${f.file} …`)
    const res = await fetch(f.url)
    if (!res.ok) throw new Error(`font download failed (${res.status}): ${f.url}`)
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  }
  const conf = resolve(fontsDir, 'fonts.conf')
  writeFileSync(
    conf,
    `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontsDir}</dir>
  <cachedir>${fontsDir}/fc-cache</cachedir>
</fontconfig>
`,
  )
  return conf
}

/* ─────────────────────────── text engine ────────────────────────── */

const GRAPHITE = '#16171A'
const INK = '#F2F2F0'
const PERI = '#7C84F2'
const PERI_LT = '#A8AEF8'

const esc = (t) =>
  t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

// Deterministic weighted-char width estimate (em units) for Fraunces SemiBold.
const NARROW = /[iljft.,;:'’!|() ]/
const WIDE = /[mwMW@]/
const CAP = /[A-Z0-9]/
function estWidth(text, fs) {
  let em = 0
  for (const ch of text) em += NARROW.test(ch) ? 0.3 : WIDE.test(ch) ? 0.82 : CAP.test(ch) ? 0.68 : 0.52
  return em * fs
}

function wrap(title, fs, maxW) {
  const lines = []
  let cur = ''
  for (const w of title.split(/\s+/)) {
    const cand = cur ? `${cur} ${w}` : w
    if (estWidth(cand, fs) <= maxW) cur = cand
    else {
      if (cur) lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return lines
}

// Stepwise ladder: largest size that fits ≤3 lines with no overflow.
function layoutTitle(title, maxW = 660) {
  for (const fs of [84, 76, 68, 60, 54]) {
    const lines = wrap(title, fs, maxW)
    if (lines.length <= 3 && !lines.some((l) => estWidth(l, fs) > maxW)) return { fs, lines }
  }
  console.warn(`⚠ title needed truncation at 54px: "${title}"`)
  return { fs: 54, lines: wrap(title, 54, maxW).slice(0, 3) }
}

/* ──────────────────────────── motifs ────────────────────────────── */

// Post cards: a quiet abstract panel from the post's cover palette + seed.
function motifPanel(pal) {
  const rand = rng(pal.seed)
  const blobs = Array.from({ length: 4 }, (_, i) => {
    const cx = 820 + rand() * 340
    const cy = 40 + rand() * 550
    const r = 110 + rand() * 150
    const fill = i % 2 === 0 ? pal.blob : pal.c1
    const op = (0.2 + rand() * 0.18).toFixed(2)
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${op}"/>`
  }).join('')
  // one vertical-ish signal trace down the panel
  let d = 'M 900 -20'
  let px = 900
  let py = -20
  for (let i = 1; i <= 14; i++) {
    const y = -20 + i * 50
    const x = 900 + Math.sin(i * 0.9 + rand() * 6) * (46 + rand() * 30)
    d += ` Q ${px.toFixed(1)} ${((py + y) / 2).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`
    px = x
    py = y
  }
  const dots = []
  for (let gx = 0; gx < 5; gx++)
    for (let gy = 0; gy < 7; gy++) {
      if (rand() > 0.45) continue
      dots.push(
        `<circle cx="${790 + gx * 95}" cy="${55 + gy * 82}" r="2.4" fill="${pal.blob}" opacity="${(0.18 + rand() * 0.3).toFixed(2)}"/>`,
      )
    }
  return `
  <g mask="url(#pmask)">
    <g filter="url(#soft)">${blobs}</g>
    <path d="${d}" fill="none" stroke="${pal.blob}" stroke-width="1.6" opacity="0.4" stroke-linecap="round"/>
    ${dots.join('')}
    <rect width="1200" height="630" fill="${GRAPHITE}" opacity="0.30"/>
  </g>`
}

// Route cards: the generic card's neural constellation (og-source.svg family).
const constellation = `
  <g mask="url(#pmask)"><g transform="translate(1055,312)">
    <g fill="none" stroke="${PERI}" stroke-width="1.3" opacity="0.5">
      <circle r="258"/><circle r="184"/><circle r="110"/>
      <path d="M-204 -66 L0 0 L182 -116 M-112 146 L0 0 L154 106 M6 -232 L0 0 L-66 240"/>
    </g>
    <g fill="${PERI_LT}">
      <circle cx="-204" cy="-66" r="6"/><circle cx="182" cy="-116" r="6"/><circle cx="-112" cy="146" r="5"/>
      <circle cx="154" cy="106" r="5"/><circle cx="6" cy="-232" r="6"/><circle cx="-66" cy="240" r="5"/>
      <circle cx="0" cy="0" r="9.5"/>
    </g>
  </g></g>`

/* ──────────────────────────── template ──────────────────────────── */

function card({ eyebrow, title, motif, glowColor }) {
  const { fs, lines } = layoutTitle(title)
  const lh = Math.round(fs * 1.09)
  const eyebrowGap = 56
  const ruleGap = 46
  const blockH = eyebrowGap + lines.length * lh + ruleGap
  const top = Math.round((630 - blockH) / 2) + 14
  const titleY0 = top + eyebrowGap + Math.round(fs * 0.78)
  const titleLines = lines
    .map(
      (l, i) =>
        `<text x="94" y="${titleY0 + i * lh}" class="nm" font-size="${fs}" fill="${INK}" style="letter-spacing:-1.5px">${esc(l)}</text>`,
    )
    .join('\n  ')
  const ruleY = titleY0 + (lines.length - 1) * lh + ruleGap
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="82%" cy="14%" r="60%">
      <stop offset="0" stop-color="${glowColor}" stop-opacity="0.22"/>
      <stop offset="0.55" stop-color="${glowColor}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="118%" r="70%">
      <stop offset="0" stop-color="#000000" stop-opacity="0.5"/>
      <stop offset="0.6" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <!-- luminance mask: stops must be WHITE-with-alpha, never black -->
    <linearGradient id="pfade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.42" stop-color="#ffffff" stop-opacity="1"/>
    </linearGradient>
    <mask id="pmask"><rect x="640" y="0" width="560" height="630" fill="url(#pfade)"/></mask>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="52"/></filter>
    <style>
      .nm{font-family:'Fraunces',Georgia,serif;font-weight:600;}
      .eb{font-family:'JetBrains Mono',monospace;}
    </style>
  </defs>
  <rect width="1200" height="630" fill="${GRAPHITE}"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  ${motif}
  <rect width="1200" height="630" fill="url(#vig)"/>
  <text x="98" y="${top}" class="eb" font-size="19" fill="${PERI}" style="letter-spacing:4.5px">${esc(eyebrow)}</text>
  ${titleLines}
  <rect x="98" y="${ruleY}" width="146" height="4" rx="2" fill="${PERI}"/>
</svg>`
}

/* ────────────────────────────── jobs ────────────────────────────── */

const jobs = []

for (const post of posts) {
  const paletteKey = post.cover.replace(/^\/covers\//, '').replace(/\.svg$/, '')
  const pal = coverPalettes[paletteKey]
  if (!pal) throw new Error(`no cover palette "${paletteKey}" for post "${post.slug}" — add it to art-lib.mjs`)
  jobs.push({
    name: post.slug,
    svg: card({
      eyebrow: `${post.kind.toUpperCase()} · ${post.topic.toUpperCase()} · NATHAN GUPTA`,
      title: post.title,
      motif: motifPanel(pal),
      glowColor: pal.c1,
    }),
  })
}

jobs.push(
  { name: 'work', svg: card({ eyebrow: 'SELECTED WORK · NATHAN GUPTA', title: workMeta.heading, motif: constellation, glowColor: PERI }) },
  { name: 'writing', svg: card({ eyebrow: 'WRITING · NATHAN GUPTA', title: writingMeta.heading, motif: constellation, glowColor: PERI }) },
  // about.lead's second sentence — the working line, minus the self-introduction.
  { name: 'about', svg: card({ eyebrow: 'ABOUT · NATHAN GUPTA', title: 'I study how people think at their best, and what gets in the way.', motif: constellation, glowColor: PERI }) },
)

/* ─────────────────────────── render + quantize ──────────────────── */

const fontsConf = await ensureFonts()
const tmp = resolve(tmpdir(), `ngsite-og-${process.pid}`)
mkdirSync(tmp, { recursive: true })

let hasVips = true
try {
  execFileSync('vips', ['--version'], { stdio: 'ignore' })
} catch {
  hasVips = false
  console.warn('⚠ vips not found — shipping 24-bit PNGs (larger). `brew install vips` for palette quantization.')
}

const results = []
for (const j of jobs) {
  const svgPath = resolve(tmp, `${j.name}.svg`)
  const rawPng = resolve(tmp, `${j.name}.png`)
  const outPng = resolve(outDir, `${j.name}.png`)
  writeFileSync(svgPath, j.svg)
  execFileSync('rsvg-convert', ['-w', '1200', '-h', '630', svgPath, '-o', rawPng], {
    env: { ...process.env, FONTCONFIG_FILE: fontsConf },
  })
  if (hasVips) {
    execFileSync('vips', ['copy', rawPng, `${outPng}[palette,dither=1,Q=100,effort=10]`])
  } else {
    execFileSync('cp', [rawPng, outPng])
  }
  const kb = Math.round(statSync(outPng).size / 1024)
  if (kb > 150) console.warn(`⚠ ${j.name}.png is ${kb}KB (>150KB target)`)
  results.push({ card: `${j.name}.png`, KB: kb })
}
rmSync(tmp, { recursive: true, force: true })

console.table(results)
console.log(`${results.length} cards → public/og/ — eyeball every card before committing.`)
