import { profile } from '@/data/site'
import { TiltCard } from '@/components/primitives/TiltCard'

/**
 * The brand-mark "field" rendered as a portrait-shaped tile: a periwinkle
 * gradient with concentric rings and a linked node, echoing the neural glyph.
 * Stands in for a photographic portrait and carries the same tilt + spotlight as
 * the rest of the card system. `compact` trims the chrome for teaser contexts.
 */
export function PortraitTile({ compact = false }: { compact?: boolean }) {
  return (
    <TiltCard
      max={5}
      className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-border shadow-[var(--shadow-lift)]"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 100% at 28% 18%, oklch(0.72 0.13 280), oklch(0.5 0.16 275) 60%, oklch(0.31 0.1 274))',
        }}
      />
      {/* concentric "field" rings + a node, echoing the brand mark */}
      <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" aria-hidden>
        <g fill="none" stroke="oklch(0.98 0.012 274 / 0.5)" strokeWidth="1.4">
          {[60, 110, 160, 210, 260].map((r) => (
            <circle key={r} cx="280" cy="190" r={r} />
          ))}
        </g>
        <circle cx="280" cy="190" r="9" fill="oklch(0.98 0.012 274)" />
        <circle cx="120" cy="70" r="5" fill="oklch(0.98 0.012 274 / 0.85)" />
        <line x1="125" y1="74" x2="272" y2="184" stroke="oklch(0.98 0.012 274 / 0.45)" strokeWidth="1.4" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6">
        <div>
          <p className="font-display text-2xl font-semibold leading-none text-[oklch(0.99_0.006_274)]">
            {profile.name}
          </p>
          {!compact ? (
            <p className="mt-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[oklch(0.99_0.006_274_/_0.8)]">
              {profile.role}
            </p>
          ) : null}
        </div>
        <span className="font-display text-5xl font-semibold leading-none text-[oklch(0.99_0.006_274_/_0.55)]">
          {profile.initials}
        </span>
      </div>
    </TiltCard>
  )
}
