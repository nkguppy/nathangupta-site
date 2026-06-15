import { useEffect, useRef, useState } from 'react'
import { posts, writingMeta, writingTopics, type Post, type WritingTopic } from '@/data/site'
import { usePageMeta } from '@/hooks/usePageMeta'
import { gsap } from '@/lib/gsap'
import { withRevealSafety } from '@/lib/reveal'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PageHeader } from '@/components/primitives/PageHeader'
import { PostCard } from '@/components/site/PostCard'
import { cn } from '@/lib/utils'

type KindFilter = 'All' | Post['kind']
type TopicFilter = 'All' | WritingTopic

const kindFilters: { label: string; value: KindFilter }[] = [
  { label: 'All', value: 'All' },
  { label: 'Notes', value: 'note' },
  { label: 'Essays', value: 'essay' },
]

function Pills<T extends string>({
  label,
  options,
  active,
  onPick,
  ariaLabel,
}: {
  label: string
  options: { label: string; value: T }[]
  active: T
  onPick: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="mr-1 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-foreground/45">
        {label}
      </span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
        {options.map((o) => {
          const isActive = o.value === active
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onPick(o.value)}
              aria-pressed={isActive}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-[transform,background-color,color,border-color] duration-200 ease-[var(--ease-quart)] active:scale-95',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]'
                  : 'border-border bg-card text-foreground/75 hover:border-primary/40 hover:text-foreground',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function WritingPage() {
  usePageMeta({ title: 'Writing', description: writingMeta.intro })
  const [kind, setKind] = useState<KindFilter>('All')
  const [topic, setTopic] = useState<TopicFilter>('All')
  const gridRef = useRef<HTMLDivElement>(null)
  const firstRun = useRef(true)
  const reduced = useReducedMotion()

  const topicOptions: { label: string; value: TopicFilter }[] = [
    { label: 'All', value: 'All' },
    ...writingTopics.map((t) => ({ label: t, value: t as TopicFilter })),
  ]

  const matches = (p: Post) =>
    (kind === 'All' || p.kind === kind) && (topic === 'All' || p.topic === topic)

  // Fade + stagger the matching cards in whenever a filter changes. React owns
  // each card's display, so filtered-out cards never linger; GSAP only touches
  // the cards that remain visible. Safe under reduced motion.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    if (reduced) return
    const grid = gridRef.current
    if (!grid) return
    const visible = Array.from(grid.querySelectorAll<HTMLElement>('[data-post]')).filter(
      (el) => el.style.display !== 'none',
    )
    if (!visible.length) return
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
  }, [kind, topic, reduced])

  const visibleCount = posts.filter(matches).length
  const anyVisible = visibleCount > 0

  return (
    <>
      <PageHeader eyebrow={writingMeta.eyebrow} title={writingMeta.heading} intro={writingMeta.intro} />

      <div className="section py-12 sm:py-16">
        <div className="mb-10 flex flex-col gap-4">
          <Pills
            label="Type"
            options={kindFilters}
            active={kind}
            onPick={setKind}
            ariaLabel="Filter writing by type"
          />
          <Pills
            label="Topic"
            options={topicOptions}
            active={topic}
            onPick={setTopic}
            ariaLabel="Filter writing by topic"
          />
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {visibleCount} {visibleCount === 1 ? 'piece' : 'pieces'} shown
        </p>

        <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const visible = matches(post)
            const featured = Boolean(post.featured)
            return (
              <div
                key={post.slug}
                data-post
                style={{ display: visible ? '' : 'none' }}
                className={cn('h-full', featured && visible && 'sm:col-span-2')}
              >
                <PostCard post={post} featured={featured} />
              </div>
            )
          })}
        </div>

        {!anyVisible ? (
          <p className="py-16 text-center text-foreground/60">
            Nothing here yet under that filter. More writing is on the way.
          </p>
        ) : null}
      </div>
    </>
  )
}
