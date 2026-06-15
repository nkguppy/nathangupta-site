import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { essays, essayTopics, type Essay } from '@/data/site'
import { gsap } from '@/lib/gsap'
import { withRevealSafety } from '@/lib/reveal'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Reveal } from '@/components/primitives/Reveal'
import { LazyImage } from '@/components/primitives/LazyImage'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Filter = 'All' | Essay['topic']

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const formatDate = (iso: string) => dateFmt.format(new Date(iso))

function EssayCard({ essay, featured }: { essay: Essay; featured: boolean }) {
  return (
    <a
      href={`#${essay.slug}`}
      onClick={(e) => e.preventDefault()}
      data-cursor-hover
      className={cn(
        'group/card flex h-full overflow-hidden rounded-[16px] border border-border bg-card',
        'transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-quart)]',
        'hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-lift)] focus-visible:-translate-y-1',
        featured ? 'flex-col md:flex-row' : 'flex-col',
      )}
    >
      <div className={cn('relative shrink-0', featured ? 'md:w-1/2' : '')}>
        <LazyImage
          src={essay.cover}
          alt=""
          lqip={essay.lqip}
          aspect={featured ? '16 / 11' : '16 / 10'}
          className="h-full"
          imgClassName="transition-transform duration-700 ease-[var(--ease-quart)] group-hover/card:scale-[1.05]"
        />
        <span className="absolute left-4 top-4">
          <Badge className="border-transparent bg-background/85 text-foreground backdrop-blur-sm">
            {essay.topic}
          </Badge>
        </span>
      </div>

      <div className={cn('flex flex-1 flex-col p-6 sm:p-7', featured && 'md:justify-center md:p-9')}>
        <h3
          className={cn(
            'font-display font-semibold leading-snug tracking-[-0.02em] transition-colors duration-300 group-hover/card:text-primary',
            featured ? 'text-2xl sm:text-[1.9rem]' : 'text-xl',
          )}
        >
          {essay.title}
        </h3>
        <p
          className={cn(
            'mt-3 leading-relaxed text-foreground/70',
            featured ? 'text-[1.02rem]' : 'line-clamp-3 text-[0.95rem]',
          )}
        >
          {essay.dek}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4 pt-1">
          <span className="font-mono text-[0.78rem] tracking-tight text-foreground/65">
            {formatDate(essay.date)} · {essay.readingTime}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Read
            <ArrowUpRight className="size-4 transition-transform duration-300 ease-[var(--ease-quart)] group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </a>
  )
}

export function Essays() {
  const [filter, setFilter] = useState<Filter>('All')
  const gridRef = useRef<HTMLDivElement>(null)
  const firstRun = useRef(true)
  const reduced = useReducedMotion()

  const filters: Filter[] = ['All', ...essayTopics]
  const matches = (e: Essay) => filter === 'All' || e.topic === filter

  const onFilter = (next: Filter) => setFilter(next)

  // Fade + stagger the matching cards in whenever the filter changes. React owns
  // each card's display, so filtered-out cards never linger occupying space;
  // GSAP only touches the cards that remain visible.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    if (reduced) return
    const grid = gridRef.current
    if (!grid) return
    const visible = Array.from(grid.querySelectorAll<HTMLElement>('[data-essay]')).filter(
      (el) => el.style.display !== 'none',
    )
    withRevealSafety(
      gsap.fromTo(
        visible,
        { opacity: 0, y: 14, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.05,
          clearProps: 'transform',
        },
      ),
      visible,
    )
  }, [filter, reduced])

  return (
    <section id="essays" className="section scroll-mt-24 py-24 sm:py-32">
      <Reveal className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
            Field notes from the study of the mind
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-foreground/70">
            Longer pieces that take a single finding and follow it somewhere useful, written for a
            curious reader who has no intention of opening a methods section.
          </p>
        </div>
      </Reveal>

      {/* Filter pills */}
      <div className="mb-9 flex flex-wrap gap-2" role="group" aria-label="Filter essays by topic">
        {filters.map((f) => {
          const active = f === filter
          return (
            <button
              key={f}
              type="button"
              onClick={() => onFilter(f)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-[transform,background-color,color,border-color] duration-200 ease-[var(--ease-quart)] active:scale-95',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]'
                  : 'border-border bg-card text-foreground/75 hover:border-primary/40 hover:text-foreground',
              )}
            >
              {f}
            </button>
          )
        })}
      </div>

      <div ref={gridRef} className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {essays.map((essay) => {
          const visible = matches(essay)
          const featured = Boolean(essay.featured)
          return (
            <div
              key={essay.slug}
              data-essay
              data-topic={essay.topic}
              style={{ display: visible ? '' : 'none' }}
              className={cn(featured && visible && 'sm:col-span-2')}
            >
              <EssayCard essay={essay} featured={featured} />
            </div>
          )
        })}
      </div>
    </section>
  )
}
