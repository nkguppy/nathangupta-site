/**
 * WCAG AA contrast audit for the Graphite palette, both themes.
 *
 * Converts OKLCH -> sRGB (clamped), composites alpha-opacity text variants over
 * their background exactly as a browser does (in gamma/sRGB space), then scores
 * contrast. AA: normal text >= 4.5, large/bold or UI components >= 3.0.
 *
 *   node scripts/contrast-audit.mjs
 */

function oklchToSrgb(L, C, H) {
  const h = (H * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  let bb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  const gamma = (v) => {
    v = Math.min(1, Math.max(0, v))
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
  }
  return [gamma(r), gamma(g), gamma(bb)] // sRGB 0..1
}

// Parse "L C H" (optionally "L C H / A")
function parse(str) {
  const m = str.match(/([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?/)
  if (!m) throw new Error('bad oklch: ' + str)
  return { L: +m[1], C: +m[2], H: +m[3], A: m[4] != null ? +m[4] : 1, srgb: oklchToSrgb(+m[1], +m[2], +m[3]) }
}

const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
// composite fg (with alpha) over bg, in sRGB space (how browsers blend)
const over = (fg, alpha, bg) => fg.map((c, i) => alpha * c + (1 - alpha) * bg[i])
const ratio = (a, b) => {
  const la = lum(a)
  const lb = lum(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// ---- Palette per theme (mirrors index.css) ----
const themes = {
  dark: {
    canvas: '0.175 0.006 274',
    card: '0.225 0.006 274',
    surface2: '0.255 0.007 274',
    muted: '0.25 0.006 274',
    accent: '0.3 0.014 276',
    ink: '0.955 0.003 270',
    inkSoft: '0.705 0.012 274',
    brand: '0.7 0.146 276',
    brandStrong: '0.5 0.16 275',
    onBrand: '0.985 0.012 274',
    primaryFg: '0.18 0.006 274',
    accentFg: '0.82 0.11 276',
  },
  light: {
    canvas: '0.985 0.002 270',
    card: '0.998 0.001 270',
    surface2: '0.955 0.004 274',
    muted: '0.95 0.004 274',
    accent: '0.945 0.014 278',
    ink: '0.205 0.01 274',
    inkSoft: '0.44 0.012 274',
    brand: '0.535 0.17 277',
    brandStrong: '0.46 0.16 276',
    onBrand: '0.985 0.012 274',
    primaryFg: '0.985 0.012 274',
    accentFg: '0.46 0.16 276',
  },
}

// pairs: [label, fgKey, alpha, bgKey, threshold, note]
const checks = [
  ['ink (body)           on canvas', 'ink', 1, 'canvas', 4.5],
  ['ink/80 (hero sub)    on canvas', 'ink', 0.8, 'canvas', 4.5],
  ['ink/75 (paras,nav)   on canvas', 'ink', 0.75, 'canvas', 4.5],
  ['ink/70 (card body)   on canvas', 'ink', 0.7, 'canvas', 4.5],
  ['ink/65 (small meta)  on canvas', 'ink', 0.65, 'canvas', 4.5],
  ['ink/70 (card body)   on card',   'ink', 0.7, 'card', 4.5],
  ['ink/65 (meta)        on card',   'ink', 0.65, 'card', 4.5],
  ['ink-soft (muted)     on canvas', 'inkSoft', 1, 'canvas', 4.5],
  ['brand (link/eyebrow) on canvas', 'brand', 1, 'canvas', 4.5],
  ['brand (link)         on card',   'brand', 1, 'card', 4.5],
  ['primary-fg (btn txt) on brand',  'primaryFg', 1, 'brand', 4.5],
  ['on-brand (heading)   on brandStrong', 'onBrand', 1, 'brandStrong', 4.5],
  ['on-brand/85 (body)   on brandStrong', 'onBrand', 0.85, 'brandStrong', 4.5],
  ['brandStrong (paper btn) on onBrand',  'brandStrong', 1, 'onBrand', 4.5],
  ['accent-fg            on accent', 'accentFg', 1, 'accent', 4.5],
  ['ink (2ndary btn)     on surface2', 'ink', 1, 'surface2', 4.5],
  ['ink/75 (pill)        on card',   'ink', 0.75, 'card', 4.5],
]

let fails = 0
for (const theme of ['dark', 'light']) {
  const P = themes[theme]
  const col = {}
  for (const k in P) col[k] = parse(P[k])
  console.log(`\n  ${theme.toUpperCase()}  (canvas ${P.canvas})`)
  console.log('  ' + '-'.repeat(64))
  for (const [label, fgK, alpha, bgK, thr] of checks) {
    const bg = col[bgK].srgb
    const fg = alpha < 1 ? over(col[fgK].srgb, alpha, bg) : col[fgK].srgb
    const r = ratio(fg, bg)
    const pass = r >= thr
    if (!pass) fails++
    console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)} : ${label}  (>=${thr})`)
  }
}
console.log(`\n  ${fails === 0 ? 'ALL PASS' : fails + ' FAILURE(S)'}\n`)
process.exit(fails === 0 ? 0 : 1)
