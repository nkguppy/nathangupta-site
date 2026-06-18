import { aboutPortrait, profile } from '@/data/site'
import { TiltCard } from '@/components/primitives/TiltCard'

/**
 * Nathan's portrait as a tilt-reactive tile. The photo is rendered in greyscale
 * with a faint periwinkle wash so the warm parkland background sits inside the
 * Graphite palette rather than fighting it; a bottom scrim keeps the name legible.
 * The treatment is intentionally restrained and easy to dial (or drop for full
 * colour). `compact` trims the caption for tight contexts.
 */
export function PortraitTile({ compact = false }: { compact?: boolean }) {
  return (
    <TiltCard
      max={5}
      className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-border shadow-[var(--shadow-lift)]"
    >
      <img
        src={aboutPortrait.src}
        alt={aboutPortrait.alt}
        width={800}
        height={800}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover object-center grayscale contrast-[1.04]"
      />
      {/* faint periwinkle wash — cools the photo into the palette (multiply keeps detail) */}
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-multiply"
        style={{
          background:
            'linear-gradient(150deg, oklch(0.72 0.13 280 / 0.18), oklch(0.42 0.12 275 / 0.30))',
        }}
      />
      {/* a soft brand light up top so it never reads flat */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{ background: 'radial-gradient(80% 50% at 74% 0%, oklch(0.8 0.1 280 / 0.16), transparent 60%)' }}
      />
      {/* bottom scrim for caption legibility */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="font-display text-2xl font-semibold leading-none text-[oklch(0.99_0.006_274)]">
          {profile.name}
        </p>
        {!compact ? (
          <p className="mt-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[oklch(0.99_0.006_274_/_0.88)]">
            {profile.role}
          </p>
        ) : null}
      </div>
    </TiltCard>
  )
}
