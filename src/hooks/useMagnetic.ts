import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Pulls an element gently toward the cursor while it's hovered, easing back
 * on leave. Only on fine pointers, and never under reduced motion.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.4) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })

    // Cache the resting rect on enter so the pull is measured from the element's
    // true centre (not its translated position) and we avoid a layout read per move.
    let rect: DOMRect | null = null
    const onEnter = () => {
      rect = el.getBoundingClientRect()
    }
    const onMove = (e: PointerEvent) => {
      if (!rect) rect = el.getBoundingClientRect()
      xTo((e.clientX - (rect.left + rect.width / 2)) * strength)
      yTo((e.clientY - (rect.top + rect.height / 2)) * strength)
    }
    const reset = () => {
      rect = null
      xTo(0)
      yTo(0)
    }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', reset)
    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', reset)
    }
  }, [reduced, strength])

  return ref
}
