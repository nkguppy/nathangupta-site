import { useEffect, useRef } from 'react'
import { BRAIN_PATH, BRAIN_VIEWBOX } from '@/components/site/brainPath'

/**
 * Interactive particle brain — a dense, glowing constellation sampled from the
 * brain silhouette (brainPath.ts), rendered on a 2D <canvas> with additive
 * ("lighter") compositing so overlapping particles bloom (the bioluminescent
 * look in the Refero references). No WebGL — same reliable tech as Background.tsx.
 * It breathes + periodically dissolves/reforms, drifts toward the cursor, and
 * brightens where the pointer hovers. Every feel-knob lives in CONFIG.
 */

// ── Tweakables ──────────────────────────────────────────────────────────────
const CONFIG = {
  count: { high: 5200, low: 2600 }, // particles desktop / mobile
  dot: [1.0, 2.6], // particle core radius range (px)
  glow: 3.6, // soft-glow multiple of the core radius
  color: '128,136,242', // periwinkle (brand)
  hot: '206,210,255', // hover/bright periwinkle
  baseAlpha: 0.62,
  fit: 0.9, // brain height as fraction of canvas height
  shimmer: 1.4, // idle per-particle jitter (px)
  drift: 0.05, // parallax toward the cursor
  dissolveDepth: 0.42, // how far the periodic dissolve scatters
  dissolveRate: 0.4, // dissolve/reform cycle speed
  scatter: 0.45, // dissolve spread (fraction of brain size)
  repelRadius: 80, // cursor influence radius (px)
  repelStrength: 26, // cursor push (px)
}

type Props = { quality?: 'high' | 'low'; onReady?: () => void; className?: string }

function makeGlowSprite(rgb: string, size: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, `rgba(${rgb},1)`)
  grad.addColorStop(0.4, `rgba(${rgb},0.5)`)
  grad.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

export default function BrainParticles({ quality = 'high', onReady, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const readyRef = useRef(onReady)
  useEffect(() => {
    readyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const N = quality === 'low' ? CONFIG.count.low : CONFIG.count.high

    // Sample the brain silhouette → normalised home positions (0..1).
    const { w: vbw, h: vbh } = BRAIN_VIEWBOX
    const off = document.createElement('canvas')
    off.width = vbw
    off.height = vbh
    const og = off.getContext('2d')
    if (!og) return
    og.fillStyle = '#fff'
    og.fill(new Path2D(BRAIN_PATH))
    const pix = og.getImageData(0, 0, vbw, vbh).data
    const filled: number[] = []
    for (let y = 0; y < vbh; y++) {
      for (let x = 0; x < vbw; x++) {
        if (pix[(y * vbw + x) * 4 + 3] > 128) filled.push(x / vbw, y / vbh)
      }
    }
    if (filled.length === 0) return
    const fcount = filled.length / 2

    const hx = new Float32Array(N) // home, normalised 0..1
    const hy = new Float32Array(N)
    const ox = new Float32Array(N) // dissolve offset, normalised
    const oy = new Float32Array(N)
    const ph = new Float32Array(N)
    const rad = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const p = ((Math.random() * fcount) | 0) * 2
      hx[i] = filled[p]
      hy[i] = filled[p + 1]
      const a = Math.random() * Math.PI * 2
      const r = 0.25 + Math.random() * 0.6
      ox[i] = Math.cos(a) * r
      oy[i] = Math.sin(a) * r
      ph[i] = Math.random()
      rad[i] = CONFIG.dot[0] + Math.random() * (CONFIG.dot[1] - CONFIG.dot[0])
    }

    const sprite = makeGlowSprite(CONFIG.color, 24)
    const spriteHot = makeGlowSprite(CONFIG.hot, 24)

    // Layout: contain the brain by height, centred; allow horizontal bleed.
    let W = 1
    let H = 1
    let dpr = 1
    let drawW = 1
    let drawH = 1
    let bx = 0
    let by = 0
    const layout = () => {
      const r = parent.getBoundingClientRect()
      W = Math.max(1, r.width)
      H = Math.max(1, r.height)
      dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      drawH = H * CONFIG.fit
      drawW = drawH * (vbw / vbh)
      bx = (W - drawW) / 2
      by = (H - drawH) / 2
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(parent)

    let mx = -9999
    let my = -9999
    let inside = false
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect()
      mx = e.clientX - r.left
      my = e.clientY - r.top
      inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let raf = 0
    let last = performance.now()
    let t = 0
    let first = true
    let driftX = 0
    let driftY = 0

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      const cx = bx + drawW / 2
      const cy = by + drawH / 2
      const tdx = inside ? (mx - cx) * CONFIG.drift : 0
      const tdy = inside ? (my - cy) * CONFIG.drift : 0
      driftX += (tdx - driftX) * 0.05
      driftY += (tdy - driftY) * 0.05

      const formBase = 1 - CONFIG.dissolveDepth * Math.pow(Math.max(0, Math.sin(t * CONFIG.dissolveRate)), 6)

      for (let i = 0; i < N; i++) {
        const a = ph[i] * 6.283
        let f = formBase - 0.16 * Math.sin(t * 0.9 + a)
        f = f < 0 ? 0 : f > 1 ? 1 : f
        const nx = hx[i] + ox[i] * CONFIG.scatter * (1 - f)
        const ny = hy[i] + oy[i] * CONFIG.scatter * (1 - f)
        let x = bx + nx * drawW + Math.sin(t * 1.3 + a) * CONFIG.shimmer + driftX
        let y = by + ny * drawH + Math.cos(t * 1.1 + a) * CONFIG.shimmer + driftY

        let hot = 0
        if (inside) {
          const dx = x - mx
          const dy = y - my
          const d2 = dx * dx + dy * dy
          const rr = CONFIG.repelRadius
          if (d2 < rr * rr) {
            const d = Math.sqrt(d2) || 0.001
            const fall = 1 - d / rr
            x += (dx / d) * fall * CONFIG.repelStrength
            y += (dy / d) * fall * CONFIG.repelStrength
            hot = fall
          }
        }

        const s = rad[i] * CONFIG.glow * (1 + hot * 0.8)
        ctx.globalAlpha = (CONFIG.baseAlpha * (0.4 + 0.6 * f)) * (1 + hot)
        ctx.drawImage(hot > 0.35 ? spriteHot : sprite, x - s, y - s, s * 2, s * 2)
      }
      ctx.globalAlpha = 1

      if (first) {
        first = false
        readyRef.current?.()
      }
      raf = requestAnimationFrame(frame)
    }

    let inView = true
    const setRunning = () => {
      const should = inView && !document.hidden
      if (should && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      } else if (!should && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }
    const io = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting
      setRunning()
    })
    io.observe(parent)
    document.addEventListener('visibilitychange', setRunning)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', setRunning)
      window.removeEventListener('pointermove', onMove)
      io.disconnect()
      ro.disconnect()
    }
  }, [quality])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
