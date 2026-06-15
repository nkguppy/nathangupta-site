import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/lib/gsap'
import { registerReveal, withRevealSafety } from '@/lib/reveal'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Reveals are driven by the shared, health-checked controller in lib/reveal:
 * real browsers play them on scroll-in; environments where IntersectionObserver
 * is inert reveal everything after a 1s fallback. The from-state is set in JS,
 * so without JS — or under reduced motion — content is simply visible.
 */

type RevealProps = {
  children: ReactNode
  className?: string
  y?: number
  delay?: number
  duration?: number
  /**
   * Add a blur-up to the fade. Off by default: animating `filter: blur()` on
   * large cards/images creates GPU layers that some browsers (notably Safari)
   * composite incorrectly, leaving text faintly ghosted/hidden mid-scroll. The
   * opacity + slide carries the reveal cleanly on its own.
   */
  blur?: boolean
}

export function Reveal({ children, className, y = 24, delay = 0, duration = 0.9, blur = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    gsap.set(el, blur ? { opacity: 0, y, filter: 'blur(8px)' } : { opacity: 0, y })
    return registerReveal(el, () => {
      withRevealSafety(
        gsap.to(el, {
          opacity: 1,
          y: 0,
          ...(blur ? { filter: 'blur(0px)' } : {}),
          duration,
          delay,
          ease: 'power3.out',
          overwrite: 'auto',
        }),
        el,
      )
    })
  }, [reduced, y, delay, duration, blur])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

type RevealGroupProps = {
  children: ReactNode
  className?: string
  y?: number
  stagger?: number
}

/** Staggers any `[data-reveal-item]` descendants in when the group enters. */
export function RevealGroup({ children, className, y = 28, stagger = 0.09 }: RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const items = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-reveal-item]'))
    if (!items.length) return
    // Opacity + slide only — no filter:blur (see the Reveal note): blurred large
    // cards ghost/strand on some browsers. Clean fade-up carries it.
    gsap.set(items, { opacity: 0, y })
    return registerReveal(el, () => {
      withRevealSafety(
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: 'power3.out',
          stagger,
          overwrite: 'auto',
        }),
        items,
      )
    })
  }, [reduced, y, stagger])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
