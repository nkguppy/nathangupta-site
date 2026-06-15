import { useEffect } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { SmoothScroll } from '@/components/site/SmoothScroll'
import { Background } from '@/components/site/Background'
import { Cursor } from '@/components/site/Cursor'
import { ScrollProgress } from '@/components/site/ScrollProgress'
import { Nav } from '@/components/site/Nav'
import { Hero } from '@/components/site/Hero'
import { Framework } from '@/components/site/Framework'
import { Essays } from '@/components/site/Essays'
import { About } from '@/components/site/About'
import { Contact } from '@/components/site/Contact'
import { Footer } from '@/components/site/Footer'
import { ErrorBoundary } from '@/components/site/ErrorBoundary'

export default function App() {
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
          <Hero />
          <Framework />
          <Essays />
          <About />
          <Contact />
        </main>

        <Footer />
      </SmoothScroll>
    </ErrorBoundary>
  )
}
