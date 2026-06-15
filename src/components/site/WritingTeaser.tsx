import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { posts } from '@/data/site'
import { Reveal, RevealGroup } from '@/components/primitives/Reveal'
import { PostCard } from '@/components/site/PostCard'

/** Homepage band previewing recent writing; links through to the full index. */
export function WritingTeaser() {
  const [lead, second, third] = posts

  return (
    <section id="writing" className="section scroll-mt-24 py-24 sm:py-32">
      <Reveal className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow mb-5">Writing</p>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
            Notes and essays on the working mind
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-foreground/70">
            Short field notes and longer essays on attention, focus and judgement under modern
            conditions. Written for a curious reader, not a methods section.
          </p>
        </div>
        <Link
          to="/writing"
          data-cursor-hover
          className="group inline-flex shrink-0 items-center gap-2 font-medium text-primary"
        >
          Read the writing
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-quart)] group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <RevealGroup className="flex flex-col gap-4">
        <div data-reveal-item>
          <PostCard post={lead} featured />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-reveal-item className="h-full">
            <PostCard post={second} />
          </div>
          <div data-reveal-item className="h-full">
            <PostCard post={third} />
          </div>
        </div>
      </RevealGroup>
    </section>
  )
}
