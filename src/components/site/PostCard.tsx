import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { type Post } from '@/data/site'
import { formatDate } from '@/lib/format'
import { LazyImage } from '@/components/primitives/LazyImage'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * A writing card linking to /writing/:slug. The `featured` variant goes wide
 * (image beside the text); the default is a vertical card. Shared by the writing
 * index and the homepage teaser so both read identically.
 */
export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link
      to={`/writing/${post.slug}`}
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
          src={post.cover}
          alt=""
          lqip={post.lqip}
          aspect={featured ? '16 / 11' : '16 / 10'}
          className="h-full"
          imgClassName="transition-transform duration-700 ease-[var(--ease-quart)] group-hover/card:scale-[1.05]"
        />
        <span className="absolute left-4 top-4 flex items-center gap-2">
          <Badge className="border-transparent bg-background/85 text-foreground backdrop-blur-sm">
            {post.topic}
          </Badge>
          <span className="rounded-full bg-background/85 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-foreground/70 backdrop-blur-sm">
            {post.kind}
          </span>
        </span>
      </div>

      <div className={cn('flex flex-1 flex-col p-6 sm:p-7', featured && 'md:justify-center md:p-9')}>
        <h3
          className={cn(
            'font-display font-semibold leading-snug tracking-[-0.02em] transition-colors duration-300 group-hover/card:text-primary',
            featured ? 'text-2xl sm:text-[1.9rem]' : 'text-xl',
          )}
        >
          {post.title}
        </h3>
        <p
          className={cn(
            'mt-3 leading-relaxed text-foreground/70',
            featured ? 'text-[1.02rem]' : 'line-clamp-3 text-[0.95rem]',
          )}
        >
          {post.dek}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4 pt-1">
          <span className="font-mono text-[0.78rem] tracking-tight text-foreground/65">
            {formatDate(post.date)} · {post.readingTime}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Read
            <ArrowUpRight className="size-4 transition-transform duration-300 ease-[var(--ease-quart)] group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
