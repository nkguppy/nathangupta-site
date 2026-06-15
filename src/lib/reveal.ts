/**
 * Shared scroll-reveal controller.
 *
 * Reveals enhance content that is visible by default. The mechanism is a
 * synchronous in-view check on register (so anything already on screen reveals
 * immediately, in every environment including headless renderers where
 * IntersectionObserver is inert) plus one shared, rAF-throttled scroll/resize
 * listener that reveals the rest as they enter. Content below the fold that is
 * never scrolled to simply stays in its visible-by-default markup for crawlers,
 * and reveals the moment it enters a real viewport. Nothing can ship blank
 * above the fold, and no animation gates content on a trigger that might never
 * fire.
 */

import { gsap } from '@/lib/gsap'

/**
 * Pairs an entrance tween with a safety timer. GSAP's ticker sleeps while the
 * document is hidden (background tabs, some headless renderers), which would
 * leave a from-state tween stuck at opacity 0. `gsap.set` is synchronous and
 * ticker-independent, so if the tween hasn't progressed by the deadline we
 * clear the inline props and let the element rest at its visible default.
 */
export function withRevealSafety<T extends gsap.core.Tween>(tween: T, targets: gsap.TweenTarget): T {
  window.setTimeout(() => {
    if (tween.progress() < 1) gsap.set(targets, { clearProps: 'all' })
  }, 1800)
  return tween
}

type Entry = { el: HTMLElement; play: () => void }

const pending = new Set<Entry>()
let listening = false
let raf = 0

function viewportH(): number {
  return window.innerHeight || document.documentElement.clientHeight || 0
}

function inView(el: HTMLElement, margin = 0.88): boolean {
  const r = el.getBoundingClientRect()
  const vh = viewportH()
  // Reveal once the element's top has risen into the upper `margin` of the
  // viewport. No lower bound, so scrolling fast past a section still reveals
  // it rather than stranding it above the fold.
  return r.top < vh * margin
}

function flush() {
  raf = 0
  for (const entry of pending) {
    if (inView(entry.el)) {
      pending.delete(entry)
      entry.play()
    }
  }
  if (pending.size === 0) stopListening()
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(flush)
}

function startListening() {
  if (listening) return
  listening = true
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
}

function stopListening() {
  if (!listening) return
  listening = false
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
}

/**
 * Register an element to reveal. `play` runs exactly once, immediately if the
 * element is already in view, otherwise the next time it scrolls into view.
 * Returns a cleanup that cancels a still-pending reveal.
 */
export function registerReveal(el: HTMLElement, play: () => void): () => void {
  if (inView(el)) {
    play()
    return () => {}
  }
  const entry: Entry = { el, play }
  pending.add(entry)
  startListening()
  return () => {
    pending.delete(entry)
    if (pending.size === 0) stopListening()
  }
}
