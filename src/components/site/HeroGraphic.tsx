import { useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ErrorBoundary } from '@/components/site/ErrorBoundary'
import PialBrain from '@/components/site/PialBrain'
import { cn } from '@/lib/utils'

/**
 * Hero graphic — a real cortical-surface particle brain (PialBrain) over a
 * static SVG base/fallback. The SVG shows under no-JS / before the first canvas
 * frame and fades out once the canvas confirms a frame (never a white box). On
 * load the canvas assembles from a sphere into the brain (the page-load
 * transition). Reduced motion → PialBrain holds a still brain (no spin, no morph).
 */

// Static fallback: a small linked-node ring (shown only pre-frame / no-JS).
const FB = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2
  const r = i % 2 === 0 ? 80 : 52
  return [100 + Math.cos(a) * r, 100 + Math.sin(a) * r] as const
})

export function HeroGraphic({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [quality] = useState<'high' | 'low'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 'low' : 'high',
  )

  return (
    <div className={cn('relative size-full', className)}>
      {/* slow periwinkle glow behind the brain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-safe:animate-[brainglow_7s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(46% 44% at 50% 50%, oklch(0.7 0.146 276 / 0.20), transparent 70%)' }}
      />

      {/* static fallback — base layer; fades when the canvas confirms a frame */}
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          'absolute inset-0 size-full text-brand transition-opacity duration-700 ease-[var(--ease-quart)]',
          ready ? 'opacity-0' : 'opacity-100',
        )}
        role="img"
        aria-label="An interactive particle brain"
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

      {/* interactive cortical-surface brain — invisible until it confirms a frame */}
      <ErrorBoundary fallback={null}>
        <PialBrain
          reduced={reduced}
          quality={quality}
          onReady={() => setReady(true)}
          className={cn(
            'absolute inset-0 size-full transition-opacity duration-700 ease-[var(--ease-quart)]',
            ready ? 'opacity-100' : 'opacity-0',
          )}
        />
      </ErrorBoundary>
    </div>
  )
}
