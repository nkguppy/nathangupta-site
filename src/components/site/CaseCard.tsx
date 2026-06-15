import { Link } from 'react-router-dom'
import { ArrowUpRight, Lock } from 'lucide-react'
import { type CaseStudy } from '@/data/site'
import { cn } from '@/lib/utils'

/**
 * The gradient "cover" tile for a case study: an accent-tinted field with the
 * brand's concentric-ring + linked-node motif. Confidential engagements get a
 * muted treatment and a lock. Reused by the Work teaser cards and the full
 * Work page panels so the visual language stays identical.
 */
export function CaseCover({
  study,
  className,
}: {
  study: CaseStudy
  className?: string
}) {
  const [a, b] = study.accent
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-quart)] group-hover/case:scale-[1.04]"
        style={{ background: `radial-gradient(125% 120% at 24% 18%, ${a}, ${b})` }}
      />
      <svg viewBox="0 0 400 260" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="oklch(0.98 0.012 274 / 0.42)" strokeWidth="1.2">
          {[44, 84, 124, 164].map((r) => (
            <circle key={r} cx="300" cy="120" r={r} />
          ))}
        </g>
        <line x1="96" y1="64" x2="292" y2="114" stroke="oklch(0.98 0.012 274 / 0.4)" strokeWidth="1.2" />
        <line x1="120" y1="196" x2="296" y2="128" stroke="oklch(0.98 0.012 274 / 0.32)" strokeWidth="1.2" />
        <circle cx="300" cy="120" r="6" fill="oklch(0.99 0.01 274)" />
        <circle cx="96" cy="64" r="3.4" fill="oklch(0.99 0.01 274 / 0.85)" />
        <circle cx="120" cy="196" r="3" fill="oklch(0.99 0.01 274 / 0.7)" />
      </svg>
      {study.confidential ? (
        <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-black/25 text-on-brand backdrop-blur-sm">
          <Lock className="size-4" />
        </span>
      ) : null}
    </div>
  )
}

/** Compact case-study card for the homepage Work teaser; links to /work. */
export function CaseCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      to="/work"
      data-cursor-hover
      className={cn(
        'group/case flex h-full flex-col overflow-hidden rounded-[16px] border border-border bg-card',
        'transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-quart)]',
        'hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-lift)] focus-visible:-translate-y-1',
      )}
    >
      <CaseCover study={study} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-foreground/55">
          <span className="text-primary">{study.kind}</span>
          <span aria-hidden>·</span>
          <span>{study.period}</span>
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-[-0.01em] transition-colors duration-300 group-hover/case:text-primary">
          {study.name}
        </h3>
        <p className="mt-2.5 flex-1 text-[0.95rem] leading-relaxed text-foreground/70">
          {study.summary}
        </p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {study.confidential ? 'Tease only' : 'See more'}
          <ArrowUpRight className="size-4 transition-transform duration-300 ease-[var(--ease-quart)] group-hover/case:translate-x-0.5 group-hover/case:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}
