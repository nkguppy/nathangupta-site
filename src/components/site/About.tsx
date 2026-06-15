import { about, profile } from '@/data/site'
import { Reveal } from '@/components/primitives/Reveal'
import { TiltCard } from '@/components/primitives/TiltCard'

function PortraitTile() {
  return (
    <TiltCard max={5} className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-border shadow-[var(--shadow-lift)]">
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
          <p className="mt-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[oklch(0.99_0.006_274_/_0.8)]">
            {profile.role}
          </p>
        </div>
        <span className="font-display text-5xl font-semibold leading-none text-[oklch(0.99_0.006_274_/_0.55)]">
          {profile.initials}
        </span>
      </div>
    </TiltCard>
  )
}

export function About() {
  return (
    <section id="about" className="section scroll-mt-24 py-24 sm:py-32" aria-label="About Nathan Gupta">
      <h2 className="sr-only">About Nathan Gupta</h2>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.02em] text-foreground">
              {about.lead}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-8 space-y-5 text-[1.05rem] leading-[1.7] text-foreground/75">
              {about.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal y={32}>
            <PortraitTile />
          </Reveal>
          <Reveal delay={0.08}>
            <dl className="mt-8 divide-y divide-border border-y border-border">
              {about.facts.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between gap-6 py-3.5">
                  <dt className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/65">
                    {fact.label}
                  </dt>
                  <dd className="text-right text-[0.95rem] font-medium text-foreground/85">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
