import { useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ErrorBoundary } from '@/components/site/ErrorBoundary'
import { BRAIN_PATH, BRAIN_SULCI, BRAIN_VIEWBOX } from '@/components/site/brainPath'
import BrainParticles from '@/components/site/BrainParticles'
import { cn } from '@/lib/utils'

/**
 * Frameless hero brain. The static brain-silhouette SVG is the base layer and
 * the permanent fallback (reduced motion / no-JS / failure). The 2D-canvas
 * particle constellation paints over it and fades in only once it confirms a
 * first frame — so a stalled or failed canvas stays invisible (never a white
 * box) and the SVG shows instead. Scoped ErrorBoundary keeps any failure local.
 */
export function BrainGraphic({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [quality] = useState<'high' | 'low'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches ? 'low' : 'high',
  )

  return (
    <div className={cn('relative size-full', className)}>
      {/* slow periwinkle glow behind the cloud */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-safe:animate-[brainglow_7s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(50% 46% at 50% 48%, oklch(0.7 0.146 276 / 0.18), transparent 72%)' }}
      />

      {/* static brain SVG — base layer + fallback; fades when particles confirm */}
      <svg
        viewBox={`0 0 ${BRAIN_VIEWBOX.w} ${BRAIN_VIEWBOX.h}`}
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          'brain-mark absolute inset-0 size-full text-brand transition-opacity duration-700 ease-[var(--ease-quart)]',
          ready ? 'opacity-0' : 'opacity-100',
        )}
        role="img"
        aria-label="A brain rendered as a neural particle field — the science of the brain"
      >
        <path d={BRAIN_PATH} fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.5" strokeLinejoin="round" />
        <g fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.28" strokeLinecap="round">
          {BRAIN_SULCI.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>

      {/* interactive 2D particle brain — invisible until it confirms a frame */}
      {!reduced && (
        <ErrorBoundary fallback={null}>
          <BrainParticles
            quality={quality}
            onReady={() => setReady(true)}
            className={cn(
              'absolute inset-0 size-full transition-opacity duration-700 ease-[var(--ease-quart)]',
              ready ? 'opacity-100' : 'opacity-0',
            )}
          />
        </ErrorBoundary>
      )}
    </div>
  )
}
