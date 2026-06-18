import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ErrorBoundary } from '@/components/site/ErrorBoundary'
import type { NeuronFx } from '@/components/site/brainNeurons'
import { DEFAULT_BRAIN_PALETTE, isBrainPalette, type BrainPalette } from '@/components/site/brainPalettes'
import { cn } from '@/lib/utils'

/**
 * Hero graphic — a glowing cortical-surface brain over a static SVG base/fallback.
 *
 * DESKTOP ONLY: the parent Hero mounts this wrapper at ≥lg (hidden lg:block), per
 * Nathan's brief of no hero graphic on mobile — so on phones/tablets nothing here
 * renders and the hero is the fully-centred content layout (see README).
 *
 * When mounted, a WebGL-capable dark desktop renders the real 3D surface brain
 * (SurfaceBrain, lazy-loaded so three.js is a separate chunk). The remaining
 * desktop cases — light theme, no WebGL2, a lost GL context, reduced motion, or any
 * render error — fall back to the lightweight 2D-canvas PialBrain (also lazy). So a
 * mounted graphic is always a visible brain, never a white box or an error card.
 * The SVG shows before the first canvas frame (and under no-JS) and fades once a
 * frame is confirmed.
 */

function hasWebGL2(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

const SurfaceBrain = lazy(() => import('@/components/site/SurfaceBrain'))
// Lazy too: the 2D fallback pulls in brainCloud.ts (~51 KB base64). Desktop WebGL
// visitors never mount it, so keeping it out of the eager index chunk is a clean win.
// It loads only on the fallback paths (mobile / light / no-WebGL / reduced / crash).
const PialBrain = lazy(() => import('@/components/site/PialBrain'))

// Static fallback: a small linked-node ring (shown only pre-frame / no-JS).
const FB = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2
  const r = i % 2 === 0 ? 80 : 52
  return [100 + Math.cos(a) * r, 100 + Math.sin(a) * r] as const
})

export function HeroGraphic({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [webglFailed, setWebglFailed] = useState(false)
  const [quality] = useState<'high' | 'low'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 'low' : 'high',
  )
  // Only spin up WebGL on a capable desktop (≥lg, where the wrapper is visible) and
  // when motion is allowed — otherwise the 2D PialBrain (no 9.4 MB mesh) is used.
  const desktop = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
    [],
  )
  const canWebGL = useMemo(() => hasWebGL2(), [])
  // DEV-only exploration: ?fx=cursor|ambient|entrance adds a neuron/synapse overlay
  // to the 3D brain so the effect can be compared live. Production = 'none'.
  const fx = useMemo<NeuronFx>(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return 'none'
    const v = new URLSearchParams(window.location.search).get('fx')
    return v === 'cursor' || v === 'ambient' || v === 'entrance' ? v : 'none'
  }, [])
  // DEV-only exploration: ?palette=iris|amethyst|abyss|cyan recolours the brain so the
  // harsh-white-vs-integrated trade-off can be compared live. Production = default.
  const palette = useMemo<BrainPalette>(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return DEFAULT_BRAIN_PALETTE
    const v = new URLSearchParams(window.location.search).get('palette')
    return isBrainPalette(v) ? v : DEFAULT_BRAIN_PALETTE
  }, [])
  // The additive glow brain is a DARK-theme feature: over a light background it can
  // only darken (no headroom to add light), leaving a dark halo. So in light theme
  // fall back to the 2D PialBrain (the existing baseline there). Observe the `dark`
  // class so a runtime theme toggle swaps cleanly (useTheme state is per-instance).
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') !== 'light',
  )
  useEffect(() => {
    const el = document.documentElement
    // watch data-theme (set by useTheme), not class — Lenis churns classes on every scroll
    const obs = new MutationObserver(() => setIsDark(el.getAttribute('data-theme') !== 'light'))
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  const useSurface = !reduced && desktop && canWebGL && isDark && !webglFailed

  const brainClass = cn(
    'absolute inset-0 size-full transition-opacity duration-700 ease-[var(--ease-quart)]',
    ready ? 'opacity-100' : 'opacity-0',
  )

  return (
    <div className={cn('relative size-full', className)}>
      {/* slow periwinkle glow behind the brain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-safe:animate-[brainglow_7s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(46% 44% at 50% 50%, oklch(0.7 0.146 276 / 0.13), transparent 70%)' }}
      />

      {/* static fallback — base layer; fades when a canvas confirms a frame */}
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          'absolute inset-0 size-full text-brand transition-opacity duration-700 ease-[var(--ease-quart)]',
          ready ? 'opacity-0' : 'opacity-100',
        )}
        role="img"
        aria-label="An interactive brain"
      >
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.18" />
        <g stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" fill="none" strokeLinecap="round">
          {FB.map((p, i) => {
            const q = FB[(i + 1) % FB.length]
            return <line key={`e${i}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} />
          })}
          {FB.filter((_, i) => i % 2 === 0).map((p, i) => (
            <line key={`s${i}`} x1="100" y1="100" x2={p[0]} y2={p[1]} strokeOpacity="0.22" />
          ))}
        </g>
        <g fill="currentColor">
          {FB.map((p, i) => (
            <circle key={`n${i}`} cx={p[0]} cy={p[1]} r={i % 2 === 0 ? 2 : 1.4} fillOpacity="0.85" />
          ))}
          <circle cx="100" cy="100" r="2.6" />
        </g>
      </svg>

      {/* interactive brain — invisible until it confirms a frame. WebGL surface on
          capable desktop, else the 2D PialBrain. Any crash → PialBrain via the boundary. */}
      <ErrorBoundary
        fallback={
          <Suspense fallback={null}>
            <PialBrain reduced={reduced} quality={quality} onReady={() => setReady(true)} className={brainClass} />
          </Suspense>
        }
      >
        {useSurface ? (
          <Suspense fallback={null}>
            <SurfaceBrain
              reduced={false}
              fx={fx}
              palette={palette}
              onReady={() => setReady(true)}
              onContextLost={() => setWebglFailed(true)}
              className={brainClass}
            />
          </Suspense>
        ) : (
          <Suspense fallback={null}>
            <PialBrain reduced={reduced} quality={quality} onReady={() => setReady(true)} className={brainClass} />
          </Suspense>
        )}
      </ErrorBoundary>
    </div>
  )
}
