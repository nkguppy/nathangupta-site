import { type ReactNode } from 'react'
import { Reveal } from '@/components/primitives/Reveal'

type PageHeaderProps = {
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  children?: ReactNode
}

/**
 * Shared masthead for the dedicated pages (Work, Writing, About). Clears the
 * fixed nav and gives every page the same opening rhythm: a mono eyebrow, a
 * Fraunces display title, and an optional intro — so the pages read as one site.
 */
export function PageHeader({ eyebrow, title, intro, children }: PageHeaderProps) {
  return (
    <header className="section pt-32 sm:pt-40">
      <Reveal>
        {eyebrow ? <p className="eyebrow mb-5">{eyebrow}</p> : null}
        <h1 className="max-w-[20ch] font-display text-[clamp(2.4rem,5.5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.025em]">
          {title}
        </h1>
        {intro ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/70">{intro}</p>
        ) : null}
        {children}
      </Reveal>
    </header>
  )
}
