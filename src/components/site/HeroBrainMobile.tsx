import { Suspense, lazy, useEffect, useState } from 'react'
import { ErrorBoundary } from '@/components/site/ErrorBoundary'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Mobile hero brain — the proven 2D PialBrain as a MASKED BACKDROP behind the
 * headline zone on <lg viewports (where the WebGL hero never mounts). Costs
 * zero layout height (absolute), zero CLS, and defers its lazy chunk to
 * post-idle so the text entrance always wins the main thread. A crash or a
 * Save-Data connection simply means no graphic — never a broken hero.
 *
 * This revisits the original "no graphic on mobile" brief deliberately, and
 * ships DIALABLE so Nathan can judge live on his phone:
 *   ?mbrain=off   kill it            ?mop=0.35   opacity
 *   ?mdens=1800   point density
 * These three URL reads work in PRODUCTION (read-once, presentational — the
 * only environment that matters for the verdict is his phone on the live
 * site). The on-screen switcher row lives in HeroLab (DEV-only).
 */

// Locked-look defaults (dial here). Desktop's PialBrain runs 6000 pts,
// uncapped, with motes + cursor wiring; mobile runs calmer and cheaper.
const M = {
  density: 2400, // points (desktop 6000)
  opacity: 0.55, // wrapper opacity over the graphite background
  spin: 0.65, // × the locked desktop spin (slower reads calmer at this size)
  fps: 30, // redraw cap — phones don't need 120Hz particles
  mountDelayMs: 900, // idle-defer budget before the chunk is fetched
}

const PialBrain = lazy(() => import('@/components/site/PialBrain'))

function readParams() {
  if (typeof window === 'undefined') return { off: false, opacity: M.opacity, density: M.density }
  const q = new URLSearchParams(window.location.search)
  const mop = Number(q.get('mop'))
  const mdens = Number(q.get('mdens'))
  return {
    off: q.get('mbrain') === 'off',
    opacity: mop > 0 && mop <= 1 ? mop : M.opacity,
    density: mdens >= 200 && mdens <= 6000 ? Math.round(mdens) : M.density,
  }
}

export function HeroBrainMobile() {
  const reduced = useReducedMotion()
  // Mount gate (load-bearing): on ≥lg the wrapper's lg:hidden alone would still
  // fetch the lazy chunk — returning null here is what keeps desktop clean.
  const [eligible] = useState(() => {
    if (typeof window === 'undefined') return false
    if (!window.matchMedia('(max-width: 1023.98px)').matches) return false
    type ConnNav = Navigator & { connection?: { saveData?: boolean } }
    if ((navigator as ConnNav).connection?.saveData) return false
    return !readParams().off
  })
  const [params] = useState(readParams)
  const [mount, setMount] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!eligible) return
    const go = () => setMount(true)
    // Safari still lacks requestIdleCallback — fall back to a plain timeout.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(go, { timeout: M.mountDelayMs })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(go, M.mountDelayMs)
    return () => window.clearTimeout(id)
  }, [eligible])

  if (!eligible) return null

  return (
    <div
      data-hero-brain
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[10svh] h-[min(48svh,430px)] w-[min(94vw,460px)] -translate-x-1/2 lg:hidden [-webkit-mask-image:radial-gradient(75%_70%_at_50%_45%,#000_55%,transparent_98%)] [mask-image:radial-gradient(75%_70%_at_50%_45%,#000_55%,transparent_98%)]"
    >
      {/* inner layer owns the fade-in so the scrubbed exit tween on the root
          never fights the CSS transition */}
      <div
        className="relative size-full transition-opacity duration-700 ease-[var(--ease-quart)]"
        style={{ opacity: ready ? params.opacity : 0 }}
      >
        {/* faint periwinkle glow, dialled down from the desktop treatment */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 motion-safe:animate-[brainglow_7s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(46% 44% at 50% 50%, oklch(0.7 0.146 276 / 0.08), transparent 70%)' }}
        />
        {mount && (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <PialBrain
                reduced={reduced}
                density={params.density}
                spin={M.spin}
                fpsCap={M.fps}
                ambient={0}
                interactive={false}
                onReady={() => setReady(true)}
                className="absolute inset-0 size-full"
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </div>
  )
}
