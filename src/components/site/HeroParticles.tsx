import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Hero-wide drifting particle field — a calm field of glowing periwinkle motes
 * across the ENTIRE hero (behind the headline and the brain), so the whole
 * section feels alive. Pure 2D canvas (no WebGL, no 3D camera) so it can never
 * flash or glitch. Additive on dark, gentle source-over on light. Composites
 * over the global Background and under the hero content + brain.
 *
 * Slow drift + pointer parallax + twinkle. Pauses off-screen and when hidden.
 * Reduced motion → one calm static frame, no loop.
 */

// periwinkle motes — brand-aligned, restrained [r,g,b]
const DARK = [
  [188, 196, 255],
  [158, 168, 250],
  [206, 210, 255],
  [150, 175, 245],
]
const LIGHT = [
  [120, 130, 220],
  [104, 116, 210],
  [140, 130, 225],
]

type P = { x: number; y: number; z: number; r: number; vx: number; vy: number; ph: number; sp: number; c: number }

function makeSprite(rgb: number[]): HTMLCanvasElement {
  const s = 64, c = document.createElement('canvas'); c.width = c.height = s
  const g = c.getContext('2d')!
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  gr.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`)
  gr.addColorStop(0.32, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`)
  gr.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
  g.fillStyle = gr; g.fillRect(0, 0, s, s)
  return c
}

export function HeroParticles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const darkSprites = DARK.map(makeSprite)
    const lightSprites = LIGHT.map(makeSprite)

    // watch data-theme (set pre-paint + by useTheme) not class — Lenis churns classes on every scroll
    let isDark = document.documentElement.getAttribute('data-theme') !== 'light'
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.getAttribute('data-theme') !== 'light'
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    let W = 1, H = 1, dpr = 1
    const layout = () => {
      const rect = parent.getBoundingClientRect()
      W = Math.max(1, rect.width); H = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
    }
    layout()

    const COUNT = Math.round(Math.min(150, Math.max(40, (W * H) / 12000)))
    const ps: P[] = []
    for (let i = 0; i < COUNT; i++) {
      const z = 0.25 + Math.random() * 0.75 // depth → size / speed / parallax
      ps.push({
        x: Math.random(), y: Math.random(), z,
        r: (1.4 + Math.random() * 3.4) * z,
        // slow, ambient drift (~40% of the first pass — Nathan: "moving too fast")
        vx: (Math.random() * 2 - 1) * 0.0016 * z,
        vy: (-0.0012 - Math.random() * 0.0036) * z, // gentle upward drift
        ph: Math.random() * 6.283, sp: 0.22 + Math.random() * 0.55, c: (Math.random() * DARK.length) | 0,
      })
    }

    let px = 0.5, py = 0.5, tx = 0.5, ty = 0.5
    const onPointer = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect()
      tx = (e.clientX - rect.left) / Math.max(1, rect.width)
      ty = (e.clientY - rect.top) / Math.max(1, rect.height)
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over'
      px += (tx - px) * 0.04; py += (ty - py) * 0.04
      const sprites = isDark ? darkSprites : lightSprites
      const baseA = isDark ? 0.6 : 0.34
      for (const p of ps) {
        const sx = (p.x + (px - 0.5) * 0.05 * p.z) * W
        const sy = (p.y + (py - 0.5) * 0.05 * p.z) * H
        const tw = 0.55 + 0.45 * Math.sin(now * 0.001 * p.sp + p.ph)
        ctx.globalAlpha = baseA * tw * (0.45 + 0.55 * p.z)
        const sp = sprites[p.c % sprites.length]
        const rad = p.r * 3
        ctx.drawImage(sp, sx - rad, sy - rad, rad * 2, rad * 2)
      }
      ctx.globalAlpha = 1
    }

    const step = (dtN: number) => {
      for (const p of ps) {
        p.x += p.vx * dtN; p.y += p.vy * dtN
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random() }
        if (p.x < -0.05) p.x = 1.05
        else if (p.x > 1.05) p.x = -0.05
      }
    }

    if (reduced) {
      draw(0)
      const ro0 = new ResizeObserver(() => { layout(); draw(0) })
      ro0.observe(parent)
      return () => { ro0.disconnect(); themeObserver.disconnect(); window.removeEventListener('pointermove', onPointer) }
    }

    let raf = 0, last = performance.now()
    const frame = (now: number) => {
      const dtN = Math.min(3, (now - last) / 16.667); last = now // frames-elapsed, clamped
      step(dtN)
      draw(now)
      raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(() => layout())
    ro.observe(parent)
    let inView = true
    const setRunning = () => {
      const should = inView && !document.hidden
      if (should && !raf) { last = performance.now(); raf = requestAnimationFrame(frame) }
      else if (!should && raf) { cancelAnimationFrame(raf); raf = 0 }
    }
    const io = new IntersectionObserver((ents) => { inView = ents[0].isIntersecting; setRunning() })
    io.observe(parent)
    const onVis = () => setRunning()
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect(); io.disconnect(); themeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
