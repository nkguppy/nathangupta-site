import { GraduationCap, Mail } from 'lucide-react'
import type { ComponentType } from 'react'
import { socials, type SocialLink } from '@/data/site'
import { cn } from '@/lib/utils'

type IconProps = { className?: string }

// Brand glyphs are inlined: lucide-react no longer ships brand logos.
function Bluesky({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 10.8c-1.1-2.1-4-6.1-6.8-8C2.6.9 1.6 1.4 1 2 .3 2.7 0 4 0 4.8c0 .9.5 7.3.8 8.4.9 3.6 4.6 4.5 7.9 3.9-5.7 1-7.1 4-4 7 .8.6 1.7.2 2.3-.4.7-.8 2.3-3.3 3-4.7.7 1.4 2.3 3.9 3 4.7.6.6 1.5 1 2.3.4 3.1-3 1.7-6-4-7 3.3.6 7-.3 7.9-3.9.3-1.1.8-7.5.8-8.4 0-.8-.3-2.1-1-2.8-.6-.6-1.6-1.1-4.2.8C16 4.7 13.1 8.7 12 10.8Z" />
    </svg>
  )
}

function LinkedIn({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

const icons: Record<SocialLink['icon'], ComponentType<IconProps>> = {
  mail: Mail,
  scholar: GraduationCap,
  linkedin: LinkedIn,
  bluesky: Bluesky,
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
