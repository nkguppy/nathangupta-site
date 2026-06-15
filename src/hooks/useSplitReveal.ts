import { useEffect, useRef } from 'react'
import { gsap, SplitText } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Opts = {
  delay?: number
  stagger?: number
  duration?: number
  /** Trigger on scroll-in instead of on mount. */
  scroll?: boolean
}

/**
 * Returns a ref to attach to a heading/paragraph. On mount (after fonts load,
 * so line breaks are correct) it line-splits the text and reveals each line
 * from behind a mask. Semantics stay with the caller's own element.
 */
export function useSplitReveal<T extends HTMLElement = HTMLHeadingElement>(opts: Opts = {}) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()
  const { delay = 0, stagger = 0.1, duration = 1, scroll = false } = opts

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    // Hide synchronously so there's no flash of un-split text; if JS never runs
    // (or motion is reduced) the element keeps its default visibility.
    gsap.set(el, { autoAlpha: 0 })

    let split: SplitText | null = null
    let ran = false
    const ctx = gsap.context(() => {
      const run = () => {
        if (ran || !ref.current) return
        ran = true
        split = new SplitText(el, { type: 'lines', linesClass: 'split-line', mask: 'lines' })
        gsap.set(el, { autoAlpha: 1 })
        gsap.set(split.lines, { yPercent: 115 })
        // The clip mask is only needed WHILE a line slides up. Once it's settled,
        // let the mask overflow be visible so glyph descenders (y, g, the comma /
        // period tail) aren't clipped by the tight line-box — leading is 1.0.
        const unmask = () =>
          el.querySelectorAll<HTMLElement>('.split-line-mask').forEach((m) => {
            m.style.overflow = 'visible'
          })
        const tween = gsap.to(split.lines, {
          yPercent: 0,
          duration,
          ease: 'power4.out',
          stagger,
          delay,
          onComplete: unmask,
          ...(scroll
            ? { scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
            : {}),
        })
        // Safety: if the ticker is asleep (hidden tab / headless) the lines
        // would stay masked. Force them visible once the budget elapses.
        if (!scroll) {
          window.setTimeout(() => {
            if (tween.progress() < 1) gsap.set(split!.lines, { yPercent: 0, clearProps: 'transform' })
            unmask()
          }, (delay + duration) * 1000 + 700)
        }
      }
      // Run once fonts settle so line breaks are correct, but never wait
      // forever — fall back after 700ms so the heading can't hang hidden.
      if (document.fonts?.ready) {
        document.fonts.ready.then(run)
        window.setTimeout(run, 700)
      } else {
        run()
      }
    }, el)

    return () => {
      ctx.revert()
      split?.revert()
    }
  }, [reduced, delay, stagger, duration, scroll])

  return ref
}
