import { Suspense, useEffect } from 'react'
import { Outlet, useMatches } from 'react-router-dom'
import { ScrollTrigger } from '@/lib/gsap'
import { SmoothScroll } from '@/components/site/SmoothScroll'
import { ScrollManager } from '@/components/site/ScrollManager'
import { Background } from '@/components/site/Background'
import { Cursor } from '@/components/site/Cursor'
import { ScrollProgress } from '@/components/site/ScrollProgress'
import { Nav } from '@/components/site/Nav'
import { Contact } from '@/components/site/Contact'
import { Footer } from '@/components/site/Footer'
import { ErrorBoundary } from '@/components/site/ErrorBoundary'

type RouteHandle = { hideContact?: boolean }

/**
 * The persistent app shell. Everything that should survive client-side
 * navigation — the scroll-reactive background, custom cursor, reading-progress
 * bar, nav, smooth scroll and the contact closer — lives here, around the routed
 * <Outlet />. The contact band is global so "Get in touch" always has a target,
 * except where a route opts out via handle.hideContact (e.g. the 404).
 */
export function Shell() {
  const matches = useMatches()
  const hideContact = matches.some((m) => (m.handle as RouteHandle | undefined)?.hideContact)

  // Recalculate trigger positions once fonts have settled, so reveals and the
  // hero parallax measure against the final layout.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts?.ready) document.fonts.ready.then(refresh)
    const id = window.setTimeout(refresh, 1200)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <ErrorBoundary>
      <SmoothScroll>
        <ScrollManager />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>

        <Background />
        <Cursor />
        <ScrollProgress />
        <Nav />

        <main id="main" tabIndex={-1} className="outline-none">
          <Suspense fallback={<div aria-hidden className="min-h-[80svh]" />}>
            <Outlet />
          </Suspense>
        </main>

        {/* Route-change announcement for assistive tech (text set by ScrollManager). */}
        <p id="route-announcer" aria-live="polite" role="status" className="sr-only" />

        {!hideContact && <Contact />}
        <Footer />
      </SmoothScroll>
    </ErrorBoundary>
  )
}
