import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * A two-part periwinkle cursor: a dot that tracks tightly and a ring that lags
 * behind, swelling over interactive elements. Only mounts on fine pointers
 * and is fully skipped under reduced motion (native cursor stays).
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.body.setAttribute('data-cursor', 'on')

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let scale = 1
    let scaleTarget = 1
    let press = 1
    let visible = false
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      if (!visible) {
        visible = true
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
    }
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement | null
      scaleTarget = t?.closest('a, button, [data-cursor-hover]') ? 2.4 : 1
      // Over the saturated deep-indigo band the periwinkle cursor would vanish
      // (multiply collapses it against the band); force a fixed light treatment
      // there, mirroring the band's other on-brand elements.
      const onBand = !!t?.closest('.bg-brand-strong')
      ring.style.mixBlendMode = onBand ? 'normal' : ''
      ring.style.borderColor = onBand ? 'oklch(0.985 0.012 274 / 0.85)' : ''
      dot.style.background = onBand ? 'oklch(0.985 0.012 274)' : ''
    }
    const onLeave = () => {
      visible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }
    const onDown = () => {
      press = 0.7
    }
    const onUp = () => {
      press = 1
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    const render = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      scale += (scaleTarget * press - scale) * 0.18
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      document.body.removeAttribute('data-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] h-9 w-9 rounded-full border border-primary/70 opacity-0 transition-opacity duration-300 mix-blend-multiply dark:mix-blend-screen"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[91] h-1.5 w-1.5 rounded-full bg-primary opacity-0 transition-opacity duration-300"
        style={{ willChange: 'transform' }}
      />
    </>
  )
}
