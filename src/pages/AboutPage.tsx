import { about, framework } from '@/data/site'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Reveal, RevealGroup } from '@/components/primitives/Reveal'
import { PortraitTile } from '@/components/site/PortraitTile'
import { SocialRow } from '@/components/site/Socials'

/** Compact rendering of the three-layer framework, as a visual on the bio. */
function FrameworkSummary() {
  return (
    <div>
      <Reveal className="mb-8">
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.02em]">
          {framework.heading}
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-foreground/70">{framework.intro}</p>
      </Reveal>
      <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {framework.layers.map((layer) => (
          <div
            key={layer.id}
            data-reveal-item
            className="rounded-[16px] border border-border bg-card/50 p-6"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-primary">{layer.index}</span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-foreground/55">
                {layer.label}
              </span>
            </div>
            <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.01em]">{layer.title}</h3>
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-foreground/70">{layer.body}</p>
          </div>
        ))}
      </RevealGroup>
    </div>
  )
}

export function AboutPage() {
  usePageMeta({ title: 'About', description: about.lead })
  return (
    <>
      <section className="section pt-32 sm:pt-40">
        <Reveal>
          <p className="eyebrow mb-5">{about.eyebrow}</p>
          <h1 className="max-w-[22ch] font-display text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
            {about.lead}
          </h1>
        </Reveal>
      </section>

      <section className="section py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="space-y-6 text-[1.08rem] leading-[1.75] text-foreground/80">
                {about.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-8 border-l-2 border-border pl-4 font-mono text-xs leading-relaxed tracking-[0.04em] text-foreground/55">
                {about.titleNote}
              </p>
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
                    <dt className="shrink-0 font-mono text-xs uppercase tracking-[0.16em] text-foreground/65">
                      {fact.label}
                    </dt>
                    <dd className="text-right text-[0.95rem] font-medium text-foreground/85">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={0.12}>
              <SocialRow className="mt-8" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section pb-12 sm:pb-16">
        <FrameworkSummary />
      </section>
    </>
  )
}
