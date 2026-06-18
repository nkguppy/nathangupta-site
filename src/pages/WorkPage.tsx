import { ArrowUpRight } from 'lucide-react'
import { caseStudies, links, workMeta, type CaseStudy } from '@/data/site'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Reveal } from '@/components/primitives/Reveal'
import { TiltCard } from '@/components/primitives/TiltCard'
import { PageHeader } from '@/components/primitives/PageHeader'
import { CaseCover } from '@/components/site/CaseCard'
import { cn } from '@/lib/utils'

function CasePanel({ study, reverse }: { study: CaseStudy; reverse: boolean }) {
  return (
    <Reveal y={32}>
      <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <TiltCard
          max={4}
          className={cn(
            'group/case relative overflow-hidden rounded-[16px] border border-border shadow-[var(--shadow-lift)]',
            reverse && 'lg:order-2',
          )}
        >
          <CaseCover study={study} className="aspect-[4/3]" />
        </TiltCard>

        <div className={cn(reverse && 'lg:order-1')}>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-foreground/70">
            <span className="text-primary">{study.kind}</span>
            <span aria-hidden>·</span>
            <span>{study.period}</span>
            {study.confidential ? (
              <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-foreground/70">
                Under NDA
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
            {study.name}
          </h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-foreground/75">{study.detail}</p>

          <p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-foreground/70">
            Role — <span className="text-foreground/80">{study.role}</span>
          </p>
          <ul className="mt-4 space-y-2.5">
            {study.contributions.map((c) => (
              <li key={c} className="flex gap-3 text-[0.98rem] leading-relaxed text-foreground/75">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {c}
              </li>
            ))}
          </ul>

          <ul className="mt-6 flex flex-wrap gap-2">
            {study.tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-border bg-secondary/50 px-3 py-1 font-mono text-[0.72rem] tracking-tight text-foreground/65"
              >
                {t}
              </li>
            ))}
          </ul>

          {study.href ? (
            <a
              href={study.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-brand-bright"
            >
              View project
              <ArrowUpRight className="size-4" />
            </a>
          ) : null}
        </div>
      </article>
    </Reveal>
  )
}

export function WorkPage() {
  usePageMeta({ title: 'Work', description: workMeta.intro })
  return (
    <>
      <PageHeader eyebrow={workMeta.eyebrow} title={workMeta.heading} intro={workMeta.intro} />
      <div className="section py-16 sm:py-20">
        <div className="space-y-20 sm:space-y-28">
          {caseStudies.map((study, i) => (
            <CasePanel key={study.slug} study={study} reverse={i % 2 === 1} />
          ))}
        </div>

        <Reveal className="mt-20 border-t border-border pt-10 sm:mt-28">
          <p className="text-[0.98rem] leading-relaxed text-foreground/70">
            This is what I can share publicly.{' '}
            <a
              href={links.awa}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="ulink font-medium text-primary"
            >
              See my full profile on AWA
            </a>
            , or get in touch to talk through the rest.
          </p>
        </Reveal>
      </div>
    </>
  )
}
