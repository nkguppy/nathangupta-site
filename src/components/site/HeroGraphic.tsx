import { useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ErrorBoundary } from '@/components/site/ErrorBoundary'
import NeuralSphere from '@/components/site/NeuralSphere'
import { SPHERE_VARIANTS } from '@/components/site/sphereVariants'
import { cn } from '@/lib/utils'

/**
 * Hero graphic — the rotating neural sphere over a static SVG base/fallback.
 * The SVG (a simple linked-node sphere) is the permanent reduced-motion / no-JS /
 * failure fallback; the canvas sphere fades in only once it confirms a first
 * frame, so a stalled or failed canvas stays invisible (never a white box).
 *
 * DEV variant lab: `?n=N` + a collapsed picker cycles SPHERE_VARIANTS so Nathan
 * can judge each look live. Production always renders index 0 (never ships the lab).
 */

// Static fallback: a small linked-node sphere built from a Fibonacci ring.
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

  // Locked production graphic: "deep" (dense). DEV `?n=N` overrides for the lab.
  const DEFAULT = Math.max(0, SPHERE_VARIANTS.findIndex((v) => v.key === 'deep'))
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const raw = params?.get('n')
  const variant = import.meta.env.DEV
    ? Math.min(SPHERE_VARIANTS.length - 1, Math.max(0, raw == null ? DEFAULT : Number(raw) || 0))
    : DEFAULT

  const pick = (i: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('n', String(i))
    window.location.assign(url.toString())
  }

  return (
    <div className={cn('relative size-full', className)}>
      {/* slow periwinkle glow behind the sphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-safe:animate-[brainglow_7s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(46% 44% at 50% 50%, oklch(0.7 0.146 276 / 0.20), transparent 70%)' }}
      />

      {/* static linked-node sphere — base layer + fallback; fades when canvas confirms */}
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          'absolute inset-0 size-full text-brand transition-opacity duration-700 ease-[var(--ease-quart)]',
          ready ? 'opacity-0' : 'opacity-100',
        )}
        role="img"
        aria-label="A rotating sphere of linked neurons"
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

      {/* interactive neural sphere — invisible until it confirms a frame */}
      {!reduced && (
        <ErrorBoundary fallback={null}>
          <NeuralSphere
            variant={variant}
            quality={quality}
            onReady={() => setReady(true)}
            className={cn(
              'absolute inset-0 size-full transition-opacity duration-700 ease-[var(--ease-quart)]',
              ready ? 'opacity-100' : 'opacity-0',
            )}
          />
        </ErrorBoundary>
      )}

      {/* DEV-only variant lab — never ships (gated to import.meta.env.DEV) */}
      {import.meta.env.DEV && (
        <details className="pointer-events-auto fixed bottom-4 right-4 z-[200] w-[244px] rounded-xl border border-border bg-card/95 shadow-[var(--shadow-lift)] backdrop-blur-xl [&::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer list-none px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-foreground/55">
            ▸ Sphere lab · dev · #{variant}
          </summary>
          <div className="flex flex-col gap-0.5 px-2 pb-2">
            {SPHERE_VARIANTS.map((v, i) => (
              <button
                key={v.key}
                type="button"
                onClick={() => pick(i)}
                className={cn(
                  'rounded-md px-2 py-1.5 text-left text-[0.8rem] leading-snug transition-colors',
                  i === variant ? 'bg-brand/15 ring-1 ring-brand/40' : 'hover:bg-muted',
                )}
              >
                <span className="text-foreground/85">{v.label}</span>
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
