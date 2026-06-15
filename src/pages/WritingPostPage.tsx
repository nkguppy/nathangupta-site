import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { posts, profile, type Block } from '@/data/site'
import { formatDate } from '@/lib/format'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Reveal } from '@/components/primitives/Reveal'
import { LazyImage } from '@/components/primitives/LazyImage'
import { Badge } from '@/components/ui/badge'

function BlockView({ block, first }: { block: Block; first: boolean }) {
  if (block.kind === 'h2') {
    return (
      <h2 className="mt-12 font-display text-[1.7rem] font-semibold leading-snug tracking-[-0.01em]">
        {block.text}
      </h2>
    )
  }
  if (block.kind === 'quote') {
    return (
      <blockquote className="my-10 border-l-2 border-primary/50 pl-6 font-display text-[1.45rem] font-medium leading-snug tracking-[-0.01em] text-foreground/90">
        {block.text}
      </blockquote>
    )
  }
  return (
    <p
      className={
        first
          ? 'mt-8 text-[1.13rem] leading-[1.78] text-foreground/85 [&::first-letter]:float-left [&::first-letter]:mr-3 [&::first-letter]:mt-1 [&::first-letter]:font-display [&::first-letter]:text-[3.4rem] [&::first-letter]:font-semibold [&::first-letter]:leading-[0.78] [&::first-letter]:text-primary'
          : 'mt-6 text-[1.13rem] leading-[1.78] text-foreground/85'
      }
    >
      {block.text}
    </p>
  )
}

export function WritingPostPage() {
  const { slug } = useParams()
  const index = posts.findIndex((p) => p.slug === slug)
  const post = index >= 0 ? posts[index] : undefined

  // Hooks must run unconditionally; pass safe values when the post is missing.
  usePageMeta({ title: post?.title, description: post?.dek })

  // Unknown slug → the canonical 404 (which also hides the contact band), so
  // every not-found experience on the site is identical.
  if (!post) return <Navigate to="/404" replace />

  const prev = posts[index - 1]
  const next = posts[index + 1]

  return (
    <article className="section pt-32 pb-16 sm:pt-40">
      <div className="mx-auto max-w-[44rem]">
        <Link
          to="/writing"
          data-cursor-hover
          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-foreground/60 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5 transition-transform duration-300 ease-[var(--ease-quart)] group-hover:-translate-x-1" />
          All writing
        </Link>

        <Reveal className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-primary/12 text-primary">{post.topic}</Badge>
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-foreground/55">
              {post.kind} · {formatDate(post.date)} · {post.readingTime}
            </span>
          </div>
          <h1 className="mt-5 font-display text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
            {post.title}
          </h1>
          <p className="mt-5 text-[1.2rem] leading-relaxed text-foreground/70">{post.dek}</p>
        </Reveal>
      </div>

      <Reveal y={28} className="mx-auto mt-10 max-w-[52rem]">
        <LazyImage
          src={post.cover}
          alt=""
          lqip={post.lqip}
          aspect="16 / 8"
          eager
          className="rounded-[16px] border border-border shadow-[var(--shadow-lift)]"
        />
      </Reveal>

      <div className="mx-auto mt-4 max-w-[44rem]">
        {post.body.map((block, i) => (
          <BlockView key={i} block={block} first={i === 0} />
        ))}

        <div className="rule mt-14" />

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="font-mono text-xs text-foreground/60">
            Written by {profile.name}
          </p>
          <Link
            to="/writing"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-foreground/60 transition-colors hover:text-primary"
          >
            All writing
            <ArrowRight className="size-3.5 transition-transform duration-300 ease-[var(--ease-quart)] group-hover:translate-x-1" />
          </Link>
        </div>

        {(prev || next) && (
          <nav
            aria-label="More writing"
            className="mt-10 grid gap-3 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                to={`/writing/${prev.slug}`}
                data-cursor-hover
                className="group rounded-[16px] border border-border bg-card/50 p-5 transition-[transform,border-color,box-shadow] duration-300 ease-[var(--ease-quart)] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-soft)]"
              >
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-foreground/50">
                  ← Previous
                </span>
                <span className="mt-2 block font-display text-lg font-semibold leading-snug tracking-[-0.01em] group-hover:text-primary">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <Link
                to={`/writing/${next.slug}`}
                data-cursor-hover
                className="group rounded-[16px] border border-border bg-card/50 p-5 text-right transition-[transform,border-color,box-shadow] duration-300 ease-[var(--ease-quart)] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-soft)]"
              >
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-foreground/50">
                  Next →
                </span>
                <span className="mt-2 block font-display text-lg font-semibold leading-snug tracking-[-0.01em] group-hover:text-primary">
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        )}
      </div>
    </article>
  )
}
