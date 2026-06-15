import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type ScrollTarget = string | number | HTMLElement
type ScrollTo = (
  target: ScrollTarget,
  opts?: { offset?: number; duration?: number; immediate?: boolean },
) => void

const SmoothScrollCtx = createContext<{ scrollTo: ScrollTo }>({ scrollTo: () => {} })

// eslint-disable-next-line react-refresh/only-export-components
export const useSmoothScroll = () => useContext(SmoothScrollCtx)

/**
 * Lenis momentum scrolling, driven by GSAP's ticker so ScrollTrigger stays
 * in lockstep. Disabled entirely under prefers-reduced-motion, where anchor
 * navigation falls back to the platform's own scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.1,
      // expo-out: long, soft glide that matches the warm motion language
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })
    lenisRef.current = lenis
    if (import.meta.env.DEV) {
      ;(window as unknown as { lenis?: Lenis }).lenis = lenis
    }

    lenis.on('scroll', ScrollTrigger.update)
    const onRaf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onRaf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(onRaf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const scrollTo = useCallback<ScrollTo>(
    (target, opts) => {
      const offset = opts?.offset ?? -84
      const immediate = opts?.immediate ?? false
      const lenis = lenisRef.current
      if (lenis) {
        // Recompute dimensions first. Lenis debounces its own resize handling, so
        // straight after a route change its scroll limit can be stale (short) and
        // a scrollTo — especially to a hash anchor near the bottom — would clamp.
        lenis.resize()
        lenis.scrollTo(target, { offset, duration: opts?.duration ?? 1.25, immediate })
        return
      }
      // Reduced-motion / pre-init fallback
      const behavior: ScrollBehavior = immediate || reduced ? 'auto' : 'smooth'
      const el = typeof target === 'string' ? document.querySelector(target) : null
      if (el) el.scrollIntoView({ behavior, block: 'start' })
      else if (typeof target === 'number') window.scrollTo({ top: target, behavior })
    },
    [reduced],
  )

  const value = useMemo(() => ({ scrollTo }), [scrollTo])

  return <SmoothScrollCtx.Provider value={value}>{children}</SmoothScrollCtx.Provider>
}
