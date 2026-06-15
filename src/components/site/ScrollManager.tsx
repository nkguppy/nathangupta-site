import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { ScrollTrigger } from '@/lib/gsap'
import { useSmoothScroll } from '@/components/site/SmoothScroll'

// Per-history-entry scroll positions, keyed by react-router's location.key, so
// Back/Forward can land where the user left off rather than at the top.
const positions = new Map<string, number>()

/**
 * Owns scroll position, focus and route announcement across client-side
 * navigations. Lenis and the page chrome live above the router Outlet, so they
 * persist between routes; only the routed content swaps.
 *
 * - PUSH / REPLACE (a forward navigation): jump to the top, or to the URL hash.
 * - POP (Back / Forward): restore the saved scroll position for that entry
 *   (native restoration is disabled in index.html because Lenis owns scrolling).
 * - After the swap: move focus to <main> so keyboard users don't resume from the
 *   top of the DOM, announce the new page title to assistive tech, and recompute
 *   ScrollTrigger + progress against the new height.
 */
export function ScrollManager() {
  const location = useLocation()
  const navType = useNavigationType()
  const { scrollTo } = useSmoothScroll()
  const firstRun = useRef(true)

  useEffect(() => {
    const { hash, key } = location
    const isFirst = firstRun.current
    firstRun.current = false

    if (hash) {
      // Let the freshly rendered (possibly much taller) route lay out, then make
      // Lenis remeasure its scroll limit via a resize before scrolling — otherwise
      // a cross-route hash jump (e.g. /#contact) scrolls against a stale, short
      // limit and lands far above the anchor.
      const t = window.setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
        ScrollTrigger.refresh()
        scrollTo(hash)
      }, 120)
      return () => {
        window.clearTimeout(t)
        positions.set(key, window.scrollY)
      }
    }

    if (navType === 'POP' && positions.has(key)) {
      scrollTo(positions.get(key)!, { immediate: true })
    } else if (!isFirst) {
      scrollTo(0, { immediate: true })
    }

    // Move focus to the main landmark on a real navigation (not first paint, so
    // the landing hero isn't stolen). preventScroll keeps the reset intact.
    if (!isFirst) {
      document.getElementById('main')?.focus({ preventScroll: true })
    }

    const t = window.setTimeout(() => {
      ScrollTrigger.refresh()
      // ScrollProgress + the reveal controller listen on resize; the document
      // height just changed, so prompt them to remeasure.
      window.dispatchEvent(new Event('resize'))
      // Announce the now-current page title (set by the route's usePageMeta).
      const announcer = document.getElementById('route-announcer')
      if (announcer) announcer.textContent = document.title
    }, 60)

    return () => {
      window.clearTimeout(t)
      // Remember where we are as we leave this entry, for a future Back/Forward.
      positions.set(key, window.scrollY)
    }
  }, [location, navType, scrollTo])

  return null
}
