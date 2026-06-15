import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Blob = {
  bx: number
  by: number
  ax: number
  ay: number
  speed: number
  phase: number
  r: number
  depth: number
  color: number // index into palette
}

// rgba palettes — a cool periwinkle/indigo field, the Graphite signature.
// Restraint over warmth: low alphas, surface stays near-black graphite.
const LIGHT = [
  [124, 132, 242], // periwinkle (brand)
  [99, 110, 230], // indigo
  [140, 120, 225], // violet
  [120, 158, 235], // soft blue
  [165, 165, 240], // lavender
]
const DARK = [
  [108, 116, 226], // periwinkle glow
  [86, 96, 200], // indigo
  [128, 108, 205], // violet
  [78, 120, 195], // deep blue
  [150, 150, 238], // soft periwinkle
]

const BLOBS: Blob[] = [
  { bx: 0.22, by: 0.28, ax: 0.08, ay: 0.06, speed: 0.05, phase: 0.0, r: 0.42, depth: 0.5, color: 0 },
  { bx: 0.78, by: 0.22, ax: 0.07, ay: 0.07, speed: 0.043, phase: 1.7, r: 0.36, depth: 0.85, color: 1 },
  { bx: 0.6, by: 0.62, ax: 0.09, ay: 0.05, speed: 0.057, phase: 3.1, r: 0.46, depth: 0.35, color: 2 },
  { bx: 0.32, by: 0.74, ax: 0.06, ay: 0.08, speed: 0.038, phase: 4.4, r: 0.34, depth: 0.65, color: 3 },
  { bx: 0.86, by: 0.7, ax: 0.05, ay: 0.06, speed: 0.062, phase: 5.5, r: 0.3, depth: 1.0, color: 4 },
]

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const SCALE = 0.34 // render small, CSS blurs it up — cheap and dreamy
    let w = 0
    let h = 0
    let raf = 0

    let isDark = document.documentElement.classList.contains('dark')
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark')
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const resize = () => {
      w = Math.max(1, Math.floor(window.innerWidth * SCALE))
      h = Math.max(1, Math.floor(window.innerHeight * SCALE))
      canvas.width = w
      canvas.height = h
    }
    resize()

    // Pointer + scroll state, all lerped for smoothness.
    let pointerX = 0.5
    let pointerY = 0.5
    let px = 0.5
    let py = 0.5
    let scrollFrac = 0
    let scrollLerp = 0
    let lastScroll = window.scrollY
    let velocity = 0
    let bloom = 0

    const onPointer = (e: PointerEvent) => {
      pointerX = e.clientX / window.innerWidth
      pointerY = e.clientY / window.innerHeight
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      scrollFrac = max > 0 ? window.scrollY / max : 0
      const delta = Math.abs(window.scrollY - lastScroll)
      velocity = Math.min(1, delta / 90)
      lastScroll = window.scrollY
    }

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    const paintStatic = () => {
      const pal = isDark ? DARK : LIGHT
      ctx.clearRect(0, 0, w, h)
      for (const b of BLOBS) {
        const cx = b.bx * w
        const cy = b.by * h
        const radius = b.r * Math.min(w, h) * 1.5
        const [r, g, bl] = pal[b.color]
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        const a = isDark ? 0.5 : 0.34
        grad.addColorStop(0, `rgba(${r},${g},${bl},${a})`)
        grad.addColorStop(1, `rgba(${r},${g},${bl},0)`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }
    }

    if (reduced) {
      paintStatic()
      return () => {
        window.removeEventListener('resize', resize)
        window.removeEventListener('pointermove', onPointer)
        window.removeEventListener('scroll', onScroll)
        themeObserver.disconnect()
      }
    }

    let t = 0
    let last = performance.now()
    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt

      px += (pointerX - px) * 0.04
      py += (pointerY - py) * 0.04
      scrollLerp += (scrollFrac - scrollLerp) * 0.1
      velocity *= 0.9
      bloom += (velocity - bloom) * 0.1

      const pal = isDark ? DARK : LIGHT
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over'

      // The living field concentrates in the hero and settles below the fold.
      const heroFactor = Math.max(0, 1 - scrollLerp * 1.4)
      for (const b of BLOBS) {
        const osc = t * b.speed * 6.283 + b.phase
        // Two layered sines per axis give a richer, less mechanical drift.
        const cx =
          (b.bx +
            (Math.sin(osc) * b.ax + Math.sin(osc * 0.5 + 1.3) * b.ax * 0.5) * 1.5 +
            (px - 0.5) * 0.08 * b.depth) *
          w
        const cy =
          (b.by +
            (Math.cos(osc) * b.ay + Math.cos(osc * 0.6 + 2.1) * b.ay * 0.5) * 1.5 +
            (py - 0.5) * 0.08 * b.depth -
            scrollLerp * 0.42 * b.depth) *
          h
        // A slow standing pulse keeps the field alive even before any scroll.
        const radius = b.r * Math.min(w, h) * (1.4 + bloom * 0.55 + Math.sin(t * 0.4 + b.phase) * 0.04)
        const [r, g, bl] = pal[b.color]
        // Concentrate the field in the hero (heroFactor→1) and calm it below the
        // fold (heroFactor→0) for restraint past the first screen.
        const a = ((isDark ? 0.5 : 0.34) + bloom * 0.14) * (0.4 + 0.62 * heroFactor)
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grad.addColorStop(0, `rgba(${r},${g},${bl},${a})`)
        grad.addColorStop(0.6, `rgba(${r},${g},${bl},${a * 0.35})`)
        grad.addColorStop(1, `rgba(${r},${g},${bl},0)`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    // Don't burn frames (or allocate gradients) while the tab is hidden.
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
      themeObserver.disconnect()
    }
  }, [reduced])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ filter: 'blur(64px) saturate(1.08)', transform: 'scale(1.25)' }}
      />
      {/* Deeper, textured veil: a faint periwinkle wash up top for richness, a
          vignette that darkens the edges/corners for depth, and a graduated darken
          toward the bottom (theme-aware base + a black kick) so the field reads
          deep and dimensional and text always keeps contrast. */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(120% 82% at 50% -10%, color-mix(in oklab, var(--brand) 8%, transparent), transparent 56%)',
            'radial-gradient(140% 120% at 50% 32%, transparent 44%, rgba(0,0,0,0.34) 100%)',
            'linear-gradient(180deg, color-mix(in oklab, var(--background) 20%, transparent) 0%, color-mix(in oklab, var(--background) 40%, transparent) 52%, color-mix(in oklab, var(--background) 72%, transparent) 86%, rgba(0,0,0,0.32) 100%)',
          ].join(', '),
        }}
      />
      {/* Film grain — now textured across all breakpoints (overlay blend reads as
          grain on the deepened darks, not flat noise). Subtler on mobile. */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay md:opacity-[0.09]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  )
}
