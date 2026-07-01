import { useEffect, useRef } from 'react'
import { decodePial, fibonacciSphere, buildFoldEdges, PIAL_N } from '@/components/site/brainCloud'

/**
 * Hero brain — a real FreeSurfer pial cortical surface rendered as a glowing
 * periwinkle particle field on a TRANSPARENT 2D <canvas> (NO WebGL — WebGL
 * dead-contexts in Nathan's browser). Genuine gyri / sulci / fissure / lobes.
 * The canvas is transparent (clearRect + additive blend) so it composites over
 * the site's animated Background. Depth-fade + front-face dimming give the
 * translucent volumetric read; surface-following "fold lines" trace the gyri
 * (not a nearest-neighbour web); a drifting ambient field adds depth. On mount
 * it assembles from a sphere into the brain (the page-load transition). Cursor
 * pulls + wires the surface. Reduced motion → one still frame, no spin/morph/loop.
 */

const COLOR = '210,214,255'
const HOT = '228,230,255'
const HALO = '124,132,242'

// Locked look (chosen in the lab): 1.5× spin, density 6000, glow 1.0×, back-fade 0.80, fold-lines on.
const GLOW = 1.0
const BACKFADE = 0.8
const SPINMUL = 1.5
const LINES = true

type Props = {
  reduced?: boolean
  quality?: 'high' | 'low'
  onReady?: () => void
  className?: string
  /** Point count override (≤ PIAL_N). Default: quality logic (low→3000, high→all). */
  density?: number
  /** Spin-rate multiplier on the locked 1.5× look. Default 1. */
  spin?: number
  /** Cap redraws to N fps (0 = uncapped native rAF). Default 0. */
  fpsCap?: number
  /** Ambient drifting motes count. Default 320; 0 disables the field. */
  ambient?: number
  /** Cursor pull + wiring. Default true; false also skips the pointer listeners
   *  (on touch devices pointermove fires during scroll-drags). */
  interactive?: boolean
}

function makeGlow(rgb: string, size: number, inner: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gr.addColorStop(0, `rgba(${rgb},${inner})`)
  gr.addColorStop(0.34, `rgba(${rgb},${inner * 0.5})`)
  gr.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = gr
  g.fillRect(0, 0, size, size)
  return c
}

export default function PialBrain({
  reduced = false,
  quality = 'high',
  onReady,
  className,
  density,
  spin: spinMul = 1,
  fpsCap = 0,
  ambient = 320,
  interactive = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const readyRef = useRef(onReady)
  useEffect(() => { readyRef.current = onReady }, [onReady])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const P = decodePial()
    const S = fibonacciSphere(PIAL_N)
    const E = LINES ? buildFoldEdges(P) : { a: new Int32Array(0), b: new Int32Array(0) }
    const EN = E.a.length
    const drawN = Math.min(density ?? (quality === 'low' ? 3000 : PIAL_N), PIAL_N)

    const rad = new Float32Array(PIAL_N)
    const halo = new Uint8Array(PIAL_N)
    for (let i = 0; i < PIAL_N; i++) { rad[i] = 0.6 + Math.random() * 0.8; halo[i] = Math.random() < 0.15 ? 1 : 0 }

    const AM = Math.max(0, ambient)
    const amx = new Float32Array(AM), amy = new Float32Array(AM), amz = new Float32Array(AM), amp = new Float32Array(AM), ams = new Float32Array(AM)
    for (let i = 0; i < AM; i++) { amx[i] = (Math.random() * 2 - 1) * 1.8; amy[i] = (Math.random() * 2 - 1) * 1.4; amz[i] = (Math.random() * 2 - 1) * 1.8; amp[i] = Math.random() * 6.283; ams[i] = 0.4 + Math.random() * 0.9 }

    const core = makeGlow(COLOR, 18, 1.0), haloS = makeGlow(HALO, 48, 0.45), coreHot = makeGlow(HOT, 18, 1.0)

    let W = 1, H = 1, dpr = 1, R = 1, cx = 0, cy = 0
    const layout = () => {
      const rect = parent.getBoundingClientRect()
      W = Math.max(1, rect.width); H = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
      R = Math.min(W, H) * 0.42; cx = W / 2; cy = H / 2
    }
    layout()

    let mx = -9999, my = -9999, inside = false
    const onMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect()
      mx = e.clientX - rect.left; my = e.clientY - rect.top
      inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    }
    const onLeave = () => { inside = false; mx = -9999; my = -9999 }

    const SXa = new Float32Array(PIAL_N), SYa = new Float32Array(PIAL_N), ZTa = new Float32Array(PIAL_N), FAa = new Float32Array(PIAL_N), HOTa = new Float32Array(PIAL_N)
    const smooth = (t: number) => t * t * (3 - 2 * t)

    let morphT = reduced ? 1 : 0
    const target = 1
    let last = performance.now(), ang = 0, first = true
    let raf = 0
    let lastDraw = 0

    const frame = (now: number) => {
      // fps cap: skip the redraw but keep the loop alive (dt accumulates and is
      // clamped at 0.05s, so motion stays correct at any cap). Never skip under
      // reduced motion — those single frames (mount/resize) must always draw.
      if (!reduced && fpsCap > 0 && now - lastDraw < 1000 / fpsCap - 2 && !first) {
        raf = requestAnimationFrame(frame)
        return
      }
      lastDraw = now
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      if (morphT < target) morphT = Math.min(target, morphT + dt / 1.7)
      const e = smooth(morphT)
      const persp = 0.45 + 0.18 * e, tilt = 0.5 - 0.22 * e
      const spin = reduced ? 0 : (0.05 - 0.006 * e) * SPINMUL * spinMul
      const depthDim = 0.42 - 0.12 * e, baseAlpha = 0.5
      ang += spin * dt
      const cosA = Math.cos(ang), sinA = Math.sin(ang), cosT = Math.cos(tilt), sinT = Math.sin(tilt)
      let i: number

      for (i = 0; i < PIAL_N; i++) {
        const axp = S.x[i] + (P.x[i] - S.x[i]) * e, ayp = S.y[i] + (P.y[i] - S.y[i]) * e, azp = S.z[i] + (P.z[i] - S.z[i]) * e
        const nx = S.x[i] + (P.nx[i] - S.x[i]) * e, ny = S.y[i] + (P.ny[i] - S.y[i]) * e, nz = S.z[i] + (P.nz[i] - S.z[i]) * e
        const xz = axp * cosA + azp * sinA, zz = -axp * sinA + azp * cosA
        const yy = ayp * cosT - zz * sinT, zt = ayp * sinT + zz * cosT
        const proj = 1 + zt * 0.16 * persp
        SXa[i] = cx + xz * R * proj; SYa[i] = cy - yy * R * proj; ZTa[i] = zt
        const nzz = -nx * sinA + nz * cosA; FAa[i] = ny * sinT + nzz * cosT; HOTa[i] = 0
      }

      // transparent canvas — composites over the site's animated background
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      // ambient motes (parallax)
      const ca2 = Math.cos(ang * 0.6), sa2 = Math.sin(ang * 0.6)
      for (i = 0; i < AM; i++) {
        const bx = amx[i] * ca2 + amz[i] * sa2, bz = -amx[i] * sa2 + amz[i] * ca2
        const ay2 = amy[i] + Math.sin(now * 0.0004 * ams[i] + amp[i]) * 0.04
        const px2 = cx + bx * R * 1.05, py2 = cy - ay2 * R * 1.05, dp2 = (bz + 1.8) / 3.6
        ctx.globalAlpha = 0.08 + 0.18 * dp2
        const s2 = ams[i] * 1.2 * (0.5 + 0.5 * dp2)
        ctx.drawImage(core, px2 - s2, py2 - s2, s2 * 2, s2 * 2)
      }

      // cursor pull + wiring
      if (inside) {
        ctx.lineWidth = 1
        for (i = 0; i < drawN; i++) {
          const dx = SXa[i] - mx, dy = SYa[i] - my, d2 = dx * dx + dy * dy
          if (d2 < 140 * 140) {
            const d = Math.sqrt(d2) || 0.001, f = 1 - d / 140
            HOTa[i] = f; SXa[i] -= dx * f * 0.18; SYa[i] -= dy * f * 0.18
            ctx.strokeStyle = `rgba(${HOT},${(f * 0.45).toFixed(3)})`
            ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(SXa[i], SYa[i]); ctx.stroke()
          }
        }
      }

      // surface-following fold lines (back-culled, under particles)
      if (LINES && e > 0.5) {
        const le = (e - 0.5) / 0.5, NB = 4
        const seg: number[][] = [[], [], [], []]
        for (let k = 0; k < EN; k++) {
          const ia = E.a[k], ib = E.b[k]
          if (ia >= drawN || ib >= drawN) continue
          const face = (FAa[ia] + FAa[ib]) * 0.5
          if (face < -0.12) continue
          const dpe = ((ZTa[ia] + ZTa[ib]) * 0.5 + 1) * 0.5
          const a01 = (0.3 + 0.7 * Math.max(0, Math.min(1, face * 1.4 + 0.32))) * (0.4 + 0.6 * dpe)
          seg[Math.min(NB - 1, (a01 * NB) | 0)].push(SXa[ia], SYa[ia], SXa[ib], SYa[ib])
        }
        ctx.lineWidth = 1
        for (let bb = 0; bb < NB; bb++) {
          const arr = seg[bb]; if (!arr.length) continue
          ctx.strokeStyle = `rgba(${HALO},${(((bb + 0.5) / NB) * 0.5 * le).toFixed(3)})`
          ctx.beginPath()
          for (let q = 0; q < arr.length; q += 4) { ctx.moveTo(arr[q], arr[q + 1]); ctx.lineTo(arr[q + 2], arr[q + 3]) }
          ctx.stroke()
        }
      }

      // surface particles
      for (i = 0; i < drawN; i++) {
        const dp = (ZTa[i] + 1) * 0.5
        const ff = BACKFADE + (1 - BACKFADE) * Math.max(0, Math.min(1, FAa[i] * 1.4 + 0.35))
        const ht = HOTa[i]
        const s = rad[i] * GLOW * 2.2 * (0.5 + 0.5 * dp) * (1 + ht * 0.6)
        ctx.globalAlpha = Math.min(1, baseAlpha * (depthDim + (1 - depthDim) * dp) * ff * (1 + ht * 1.1))
        ctx.drawImage(ht > 0.45 ? coreHot : core, SXa[i] - s, SYa[i] - s, s * 2, s * 2)
        if (halo[i]) { const hs = s * 3.2; ctx.globalAlpha *= 0.4; ctx.drawImage(haloS, SXa[i] - hs, SYa[i] - hs, hs * 2, hs * 2) }
      }
      ctx.globalAlpha = 1

      if (first) { first = false; readyRef.current?.() }
      if (!reduced) raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(() => { layout(); if (reduced) raf = requestAnimationFrame(frame) })
    ro.observe(parent)

    // reduced motion: draw one still frame, no loop, no pointer, no pausing
    if (reduced) {
      raf = requestAnimationFrame(frame)
      return () => { cancelAnimationFrame(raf); ro.disconnect() }
    }

    // animated: cursor interaction + pause off-screen / when hidden
    if (interactive) {
      window.addEventListener('pointermove', onMove, { passive: true })
      parent.addEventListener('pointerleave', onLeave)
    }
    let inView = true
    const setRunning = () => {
      const should = inView && !document.hidden
      if (should && !raf) { last = performance.now(); raf = requestAnimationFrame(frame) }
      else if (!should && raf) { cancelAnimationFrame(raf); raf = 0 }
    }
    const io = new IntersectionObserver((ents) => { inView = ents[0].isIntersecting; setRunning() })
    io.observe(parent)
    document.addEventListener('visibilitychange', setRunning)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', setRunning)
      if (interactive) {
        window.removeEventListener('pointermove', onMove)
        parent.removeEventListener('pointerleave', onLeave)
      }
      io.disconnect(); ro.disconnect()
    }
  }, [reduced, quality, density, spinMul, fpsCap, ambient, interactive])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
