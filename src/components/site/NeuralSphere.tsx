import { useEffect, useRef } from 'react'
import { SPHERE_VARIANTS } from '@/components/site/sphereVariants'

/**
 * Neural sphere — a slowly rotating 3D globe of glowing nodes with dynamic
 * proximity links, drawn on a 2D <canvas>. NO WebGL (WebGL dead-contexts in
 * Nathan's browser → white box; see handoff). Points sit on a Fibonacci sphere,
 * rotate in 3D every frame and project to 2D with adjustable perspective; links
 * form/break between nodes that are near IN PROJECTION (so the rotation makes the
 * web breathe), and the cursor becomes a node that nearby nodes wire to. Additive
 * "lighter" compositing blooms overlaps. Every feel-knob lives in sphereVariants.ts.
 */

const COLOR = '128,136,242' // periwinkle (brand)
const HOT = '206,210,255' // bright periwinkle (cursor)

type Props = { variant?: number; quality?: 'high' | 'low'; onReady?: () => void; className?: string }

function makeGlow(rgb: string, size: number): HTMLCanvasElement {
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

export default function NeuralSphere({ variant = 0, quality = 'high', onReady, className }: Props) {
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

    const V = SPHERE_VARIANTS[variant] ?? SPHERE_VARIANTS[0]
    const N = quality === 'low' ? V.count.low : V.count.high

    // Fibonacci sphere → even, organic point distribution on a unit sphere.
    const bx = new Float32Array(N)
    const by = new Float32Array(N)
    const bz = new Float32Array(N)
    const rad = new Float32Array(N)
    const GA = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - ((i + 0.5) / N) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const th = GA * i
      bx[i] = Math.cos(th) * r
      by[i] = y
      bz[i] = Math.sin(th) * r
      rad[i] = V.dot[0] + Math.random() * (V.dot[1] - V.dot[0])
    }

    const sx = new Float32Array(N) // projected screen x
    const sy = new Float32Array(N)
    const sz = new Float32Array(N) // rotated depth (-1 back .. 1 front)
    const hotArr = new Float32Array(N)

    const sprite = makeGlow(COLOR, 24)
    const spriteHot = makeGlow(HOT, 24)

    let W = 1
    let H = 1
    let dpr = 1
    let R = 1
    let cx = 0
    let cy = 0
    const layout = () => {
      const rect = parent.getBoundingClientRect()
      W = Math.max(1, rect.width)
      H = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      R = Math.min(W, H) * 0.46
      cx = W / 2
      cy = H / 2
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(parent)

    let mx = -9999
    let my = -9999
    let inside = false
    const onMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect()
      mx = e.clientX - rect.left
      my = e.clientY - rect.top
      inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const sinT = Math.sin(V.tilt)
    const cosT = Math.cos(V.tilt)
    const CURSOR_R = 150
    const NB = 5 // link alpha buckets (batch strokes by depth/distance)

    let raf = 0
    let last = performance.now()
    let ang = 0
    let first = true

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ang += V.spin * dt
      const sinA = Math.sin(ang)
      const cosA = Math.cos(ang)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      // rotate (Y then fixed X tilt) + project
      for (let i = 0; i < N; i++) {
        const x0 = bx[i]
        const z0 = bz[i]
        const xz = x0 * cosA + z0 * sinA
        const zz = -x0 * sinA + z0 * cosA
        const yy = by[i] * cosT - zz * sinT
        const zt = by[i] * sinT + zz * cosT
        const proj = 1 + zt * 0.16 * V.persp
        sx[i] = cx + xz * R * proj
        sy[i] = cy + yy * R * proj
        sz[i] = zt
        hotArr[i] = 0
      }

      // cursor wiring — the pointer becomes a node nearby nodes link to
      if (inside) {
        ctx.lineWidth = 1
        for (let i = 0; i < N; i++) {
          const dx = sx[i] - mx
          const dy = sy[i] - my
          const d2 = dx * dx + dy * dy
          if (d2 < CURSOR_R * CURSOR_R) {
            const d = Math.sqrt(d2) || 0.001
            const f = 1 - d / CURSOR_R
            hotArr[i] = f
            ctx.strokeStyle = `rgba(${HOT},${(f * 0.5).toFixed(3)})`
            ctx.beginPath()
            ctx.moveTo(mx, my)
            ctx.lineTo(sx[i], sy[i])
            ctx.stroke()
          }
        }
      }

      // dynamic proximity links — spatial grid, batched into depth/alpha buckets
      const cell = V.linkDist
      const cols = Math.max(1, Math.ceil(W / cell) + 1)
      const rows = Math.max(1, Math.ceil(H / cell) + 1)
      const grid: (number[] | undefined)[] = new Array(cols * rows)
      for (let i = 0; i < N; i++) {
        const gx = sx[i] < 0 ? 0 : sx[i] >= W ? cols - 1 : (sx[i] / cell) | 0
        const gy = sy[i] < 0 ? 0 : sy[i] >= H ? rows - 1 : (sy[i] / cell) | 0
        const k = gx + gy * cols
        let bucket = grid[k]
        if (!bucket) {
          bucket = []
          grid[k] = bucket
        }
        bucket.push(i)
      }
      const seg: number[][] = []
      for (let b = 0; b < NB; b++) seg.push([])
      const linkCount = new Uint8Array(N)
      const maxD2 = cell * cell
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const cellArr = grid[gx + gy * cols]
          if (!cellArr) continue
          for (let a = 0; a < cellArr.length; a++) {
            const i = cellArr[a]
            if (linkCount[i] >= V.maxLinks) continue
            for (let ny = gy; ny <= gy + 1; ny++) {
              for (let nx = gx - 1; nx <= gx + 1; nx++) {
                if (ny >= rows || nx < 0 || nx >= cols) continue
                if (ny === gy && nx < gx) continue
                const other = grid[nx + ny * cols]
                if (!other) continue
                for (let b = 0; b < other.length; b++) {
                  const j = other[b]
                  if (j <= i) continue
                  if (linkCount[i] >= V.maxLinks || linkCount[j] >= V.maxLinks) continue
                  const dx = sx[i] - sx[j]
                  const dy = sy[i] - sy[j]
                  const d2 = dx * dx + dy * dy
                  if (d2 >= maxD2) continue
                  const depth = ((sz[i] + sz[j]) * 0.5 + 1) * 0.5
                  const a01 = (1 - Math.sqrt(d2) / cell) * (V.depthDim + (1 - V.depthDim) * depth)
                  const bi = Math.min(NB - 1, (a01 * NB) | 0)
                  const arr = seg[bi]
                  arr.push(sx[i], sy[i], sx[j], sy[j])
                  linkCount[i]++
                  linkCount[j]++
                }
              }
            }
          }
        }
      }
      ctx.lineWidth = 1
      for (let b = 0; b < NB; b++) {
        const arr = seg[b]
        if (arr.length === 0) continue
        ctx.strokeStyle = `rgba(${COLOR},${(((b + 0.5) / NB) * V.linkAlpha).toFixed(3)})`
        ctx.beginPath()
        for (let s = 0; s < arr.length; s += 4) {
          ctx.moveTo(arr[s], arr[s + 1])
          ctx.lineTo(arr[s + 2], arr[s + 3])
        }
        ctx.stroke()
      }

      // nodes — additive glow sprites, size + alpha by depth, brighter under cursor
      for (let i = 0; i < N; i++) {
        const depth = (sz[i] + 1) * 0.5
        const dA = V.depthDim + (1 - V.depthDim) * depth
        const hot = hotArr[i]
        const s = rad[i] * V.glow * (0.55 + 0.45 * depth) * (1 + hot * 0.9)
        ctx.globalAlpha = Math.min(1, V.baseAlpha * dA * (1 + hot))
        ctx.drawImage(hot > 0.4 ? spriteHot : sprite, sx[i] - s, sy[i] - s, s * 2, s * 2)
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
  }, [variant, quality])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
