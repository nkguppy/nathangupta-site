import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Subtle 3D tilt toward the cursor, plus `--mx`/`--my` custom properties that
 * track the pointer for a spotlight sheen. Fine-pointer + motion only.
 */
export function useTilt<T extends HTMLElement = HTMLElement>(max = 7) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    gsap.set(el, { transformPerspective: 1000, transformStyle: 'preserve-3d' })
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' })

    let rect: DOMRect | null = null
    const onEnter = () => {
      rect = el.getBoundingClientRect()
    }
    const onMove = (e: PointerEvent) => {
      if (!rect) rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      ry((px - 0.5) * max * 2)
      rx(-(py - 0.5) * max * 2)
      el.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`)
      el.style.setProperty('--my', `${(py * 100).toFixed(2)}%`)
    }
    const reset = () => {
      rect = null
      rx(0)
      ry(0)
    }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', reset)
    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', reset)
    }
  }, [reduced, max])

  return ref
}
