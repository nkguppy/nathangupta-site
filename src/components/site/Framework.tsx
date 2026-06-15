import { useState } from 'react'
import { framework, type Layer } from '@/data/site'
import { Reveal, RevealGroup } from '@/components/primitives/Reveal'
import { useTilt } from '@/hooks/useTilt'
import { cn } from '@/lib/utils'

/**
 * The AWA performance framework (Nathan's "dartboard" model) as an interactive
 * nested-scope element: the individual sits inside the team, inside the workplace.
 * Hovering / tapping a layer highlights both its card and the matching frame, and
 * vice versa. All content is visible by default — selection only emphasises, never
 * hides — so it stays sound under reduced motion, touch, and a sleeping ticker.
 */
export function Framework() {
  const [active, setActive] = useState(0)
  const { heading, intro, layers } = framework

  return (
    <section id="framework" className="section scroll-mt-24 py-24 sm:py-32">
      <Reveal className="mb-14 max-w-2xl">
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
          {heading}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-foreground/70">{intro}</p>
      </Reveal>

      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
        {/* Interactive layer cards */}
        <RevealGroup className="flex flex-col gap-3 lg:col-span-7">
          {layers.map((layer, i) => (
            <LayerCard key={layer.id} layer={layer} active={i === active} onActivate={() => setActive(i)} />
          ))}
        </RevealGroup>

        {/* Nested-scope visual */}
        <Reveal y={32} className="lg:col-span-5">
          <NestedScope active={active} setActive={setActive} labels={layers.map((l) => l.label)} />
        </Reveal>
      </div>
    </section>
  )
}

/* ── Layer card: 3D tilt, cursor spotlight, depth pop, dynamic shadow ── */
function LayerCard({ layer, active, onActivate }: { layer: Layer; active: boolean; onActivate: () => void }) {
  const ref = useTilt<HTMLButtonElement>(4)
  return (
    <button
      ref={ref}
      type="button"
      data-reveal-item
      data-cursor-hover
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      aria-pressed={active}
      className={cn(
        'group/lc relative overflow-hidden rounded-[16px] border p-6 text-left [transform-style:preserve-3d] transition-[border-color,background-color,box-shadow] duration-300 ease-[var(--ease-quart)] sm:p-7',
        active
          ? 'border-primary/40 bg-primary/[0.05] shadow-[var(--shadow-lift)]'
          : 'border-border bg-card/50 hover:border-primary/25 hover:shadow-[var(--shadow-soft)]',
      )}
    >
      {/* cursor-tracking spotlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/lc:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,50%), oklch(0.7 0.16 276 / 0.1), transparent 60%)' }}
      />
      {/* content floats above the card surface for a parallax depth pop */}
      <div className="relative z-10 [transform:translateZ(26px)] [transform-style:preserve-3d]">
        <div className="flex items-baseline gap-4">
          <span className={cn('font-mono text-xs tracking-[0.1em] transition-colors', active ? 'text-primary' : 'text-foreground/45')}>
            {layer.index}
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-foreground/55">{layer.label}</span>
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.01em]">{layer.title}</h3>
        <p className="mt-2.5 max-w-prose leading-relaxed text-foreground/70">{layer.body}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {layer.points.map((p) => (
            <li
              key={p}
              className={cn(
                'rounded-full border px-3 py-1 font-mono text-[0.72rem] tracking-tight transition-colors',
                active ? 'border-primary/30 bg-primary/[0.06] text-foreground/80' : 'border-border bg-secondary/50 text-foreground/60',
              )}
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </button>
  )
}

/* ── Dartboard: nested concentric frames (the AWA model) ── */
function NestedScope({ active, setActive, labels }: { active: number; setActive: (i: number) => void; labels: string[] }) {
  const ref = useTilt<HTMLDivElement>(5)
  const on = (i: number) => active === i
  const glow = (i: number) => (on(i) ? '0 0 40px oklch(0.7 0.146 276 / 0.16)' : 'none')

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[420px] [transform-style:preserve-3d]">
      <Frame i={2} on={on(2)} setActive={setActive} label={labels[2]} glow={glow(2)} className="inset-0 rounded-[28px]" labelClass="left-5 top-4 text-[0.62rem] tracking-[0.18em]" />
      <Frame i={1} on={on(1)} setActive={setActive} label={labels[1]} glow={glow(1)} className="inset-[15%] rounded-[22px]" labelClass="left-4 top-3 text-[0.6rem] tracking-[0.16em]" />
      <button
        type="button"
        onMouseEnter={() => setActive(0)}
        onFocus={() => setActive(0)}
        onClick={() => setActive(0)}
        aria-label={labels[0]}
        aria-pressed={on(0)}
        style={{ boxShadow: glow(0) }}
        className={cn(
          'absolute inset-[33%] grid place-items-center rounded-[16px] border transition-[border-color,background-color] duration-300',
          on(0) ? 'border-primary/70 bg-primary/[0.08]' : 'border-border',
        )}
      >
        <span className="relative flex size-3.5">
          {on(0) && <span className="absolute inline-flex h-full w-full rounded-full bg-primary/50 motion-safe:animate-ping" />}
          <span className={cn('relative inline-flex size-3.5 rounded-full transition-colors', on(0) ? 'bg-primary' : 'bg-foreground/40')} />
        </span>
      </button>
    </div>
  )
}

function Frame({
  i,
  on,
  setActive,
  label,
  glow,
  className,
  labelClass,
}: {
  i: number
  on: boolean
  setActive: (i: number) => void
  label: string
  glow: string
  className: string
  labelClass: string
}) {
  return (
    <button
      type="button"
      onMouseEnter={() => setActive(i)}
      onFocus={() => setActive(i)}
      onClick={() => setActive(i)}
      aria-label={label}
      aria-pressed={on}
      style={{ boxShadow: glow }}
      className={cn('absolute border transition-[border-color,background-color] duration-300', on ? 'border-primary/60 bg-primary/[0.04]' : 'border-border', className)}
    >
      <span className={cn('absolute font-mono uppercase transition-colors', on ? 'text-primary' : 'text-foreground/45', labelClass)}>{label}</span>
    </button>
  )
}
