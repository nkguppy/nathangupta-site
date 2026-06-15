import { Mail } from 'lucide-react'
import type { ComponentType } from 'react'
import { socials, type SocialLink } from '@/data/site'
import { cn } from '@/lib/utils'

type IconProps = { className?: string }

// Brand glyph inlined: lucide-react no longer ships brand logos.
function LinkedIn({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

const icons: Record<SocialLink['icon'], ComponentType<IconProps>> = {
  mail: Mail,
  linkedin: LinkedIn,
}

type Tone = 'default' | 'paper'

export function SocialRow({ tone = 'default', className }: { tone?: Tone; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {socials.map((s) => {
        const Icon = icons[s.icon]
        const external = s.href.startsWith('http') || s.href.startsWith('mailto')
        return (
          <li key={s.label}>
            <a
              href={s.href}
              aria-label={s.label}
              {...(external && !s.href.startsWith('mailto') ? { target: '_blank', rel: 'noreferrer' } : {})}
              className={cn(
                'grid size-11 place-items-center rounded-full border transition-[transform,background-color,color,border-color] duration-200 ease-[var(--ease-quart)] hover:-translate-y-0.5 active:scale-95',
                tone === 'paper'
                  ? 'focus-onbrand border-on-brand/30 text-on-brand hover:bg-on-brand/10'
                  : 'border-border bg-card/60 text-foreground/75 backdrop-blur-sm hover:border-primary/40 hover:text-primary',
              )}
            >
              <Icon className="size-[18px]" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
