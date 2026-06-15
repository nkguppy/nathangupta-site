import { useEffect, useRef } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { hero, headlineCandidates } from '@/data/site'
import { gsap } from '@/lib/gsap'
import { withRevealSafety } from '@/lib/reveal'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSmoothScroll } from '@/components/site/SmoothScroll'
import { useSplitReveal } from '@/hooks/useSplitReveal'
import { MagneticButton } from '@/components/primitives/MagneticButton'
import { HeroSocials } from '@/components/site/HeroSocials'
import { HeroGraphic } from '@/components/site/HeroGraphic'
import { cn } from '@/lib/utils'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const brainRef = useRef<HTMLDivElement>(null)
  const headlineRef = useSplitReveal<HTMLHeadingElement>({ delay: 0.15, stagger: 0.12, duration: 1 })
  const reduced = useReducedMotion()
  const { scrollTo } = useSmoothScroll()

  // DEV-only "headline lab": pick a candidate via ?h=N and reload, so each option
  // is seen with its real reveal + glow. Always defaults to index 0 in production.
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  // DEV-only override; production always ships the locked headline (index 0) so a
  // public ?h=N URL can't change the live H1 or get indexed.
  const hIdx = import.meta.env.DEV
    ? Math.min(headlineCandidates.length - 1, Math.max(0, Number(params?.get('h')) || 0))
    : 0
  const headline = headlineCandidates[hIdx]
  const heroKicker = headline.kicker ?? hero.kicker
  const heroSubhead = headline.subhead ?? hero.subhead

  // Staggered fade-in for the hero content, plus a scrubbed parallax exit. The
  // brain drifts at a different rate so the hero separates in depth as the
  // Framework section is pulled in beneath it.
  useEffect(() => {
    const section = sectionRef.current
    const content = contentRef.current
    if (!section || !content || reduced) return

    const ctx = gsap.context(() => {
      withRevealSafety(
        gsap.from('[data-hero-fade]', {
          opacity: 0,
          y: 22,
          filter: 'blur(6px)',
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.1,
          delay: 0.2,
        }),
        content.querySelectorAll('[data-hero-fade]'),
      )
      gsap.to(content, {
        yPercent: -14,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
      })
      if (brainRef.current) {
        gsap.to(brainRef.current, {
          yPercent: -8,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
        })
      }
    }, section)
    return () => ctx.revert()
  }, [reduced])

  const onCta = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    scrollTo(href)
  }

  const pickHeadline = (i: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('h', String(i))
    window.location.assign(url.toString())
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="top"
        className="relative flex min-h-[86svh] flex-col justify-center overflow-hidden pb-20 pt-28 lg:min-h-[100svh] lg:pb-0 lg:pt-0"
      >
        {/* Content (left) sits above the brain field */}
        <div ref={contentRef} className="section relative z-10 w-full">
          <div className="mx-auto max-w-[640px] text-center lg:mx-0 lg:text-left">
            {/* Identity row: small circular headshot + role. Centred on mobile,
                left-aligned beside the sphere on desktop. */}
            <div data-hero-fade className="mb-8 flex items-center justify-center gap-3.5 lg:justify-start">
              <span className="relative block size-14 shrink-0 overflow-hidden rounded-full border border-brand/40 shadow-[var(--shadow-soft)]">
                <img
                  src={hero.portrait.src}
                  alt={hero.portrait.alt}
                  width={56}
                  height={56}
                  decoding="async"
                  fetchPriority="high"
                  className="size-full object-cover object-top grayscale contrast-[1.08]"
                />
              </span>
              <p className="eyebrow text-foreground/65">{heroKicker}</p>
            </div>

            <h1
              ref={headlineRef}
              className="mx-auto max-w-[15ch] font-display text-[clamp(2.6rem,6vw,5.4rem)] font-bold leading-[1.0] tracking-[-0.028em] lg:mx-0"
            >
              {headline.lead}{' '}
              <span className="hero-accent text-brand-bright">{headline.accent}</span>
            </h1>

            <p
              data-hero-fade
              className="mx-auto mt-9 max-w-[46ch] text-[clamp(1.08rem,1.5vw,1.3rem)] leading-[1.65] text-foreground/80 lg:mx-0"
            >
              {heroSubhead}
            </p>

            <div data-hero-fade className="mt-11 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:items-start lg:justify-start">
              <MagneticButton
                href={hero.primaryCta.href}
                onClick={onCta(hero.primaryCta.href)}
                variant="primary"
                iconRight={<ArrowRight className="size-4" />}
              >
                {hero.primaryCta.label}
              </MagneticButton>
              <MagneticButton
                href={hero.secondaryCta.href}
                onClick={onCta(hero.secondaryCta.href)}
                variant="secondary"
                strength={0.3}
                iconRight={<ArrowUpRight className="size-4" />}
              >
                {hero.secondaryCta.label}
              </MagneticButton>
            </div>

            <div data-hero-fade className="mt-11 flex items-center justify-center gap-4 lg:justify-start">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-foreground/65">
                Find me on
              </span>
              <HeroSocials />
            </div>
          </div>
        </div>

        {/* Neural sphere — DESKTOP ONLY (hidden below lg, per Nathan's brief: no
            interactive graphic on mobile). Bleeds off the right, vertically centred
            behind the content; left-edge mask so it never crowds the headline.
            pointer-events-none so it never blocks. */}
        <div
          ref={brainRef}
          aria-hidden
          className="pointer-events-none hidden lg:absolute lg:inset-y-0 lg:right-[-4%] lg:block lg:h-auto lg:w-[52%] lg:[-webkit-mask-image:linear-gradient(to_right,transparent,#000_26%)] lg:[mask-image:linear-gradient(to_right,transparent,#000_26%)]"
        >
          <HeroGraphic />
        </div>

        {/* Scroll cue */}
        <button
          type="button"
          onClick={() => scrollTo('#work')}
          aria-label="Scroll to the work"
          className="group absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-foreground/60 transition-colors hover:text-primary lg:flex"
        >
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em]">Scroll</span>
          <span className="relative h-9 w-px overflow-hidden bg-border">
            <span className="absolute inset-x-0 top-0 h-3 animate-[scrollcue_2s_linear_infinite] bg-primary" />
          </span>
        </button>
      </section>

      {/* DEV-only headline lab — never ships (gated to import.meta.env.DEV).
          Collapsed by default so it never obstructs the hero; expand to pick. */}
      {import.meta.env.DEV && (
        <details className="fixed bottom-4 left-4 z-[200] w-[248px] rounded-xl border border-border bg-card/95 shadow-[var(--shadow-lift)] backdrop-blur-xl [&::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer list-none px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-foreground/65">
            ▸ Headline lab · dev · #{hIdx}
          </summary>
          <div className="flex max-h-[70vh] flex-col gap-0.5 overflow-y-auto px-2 pb-2">
            {headlineCandidates.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pickHeadline(i)}
                className={cn(
                  'rounded-md px-2 py-1.5 text-left text-[0.82rem] leading-snug transition-colors',
                  i === hIdx ? 'bg-brand/15 ring-1 ring-brand/40' : 'hover:bg-muted',
                )}
              >
                <span className="text-foreground/85">{c.lead} </span>
                <span className="text-brand-bright">{c.accent}</span>
                <span className="mt-0.5 block font-mono text-[0.58rem] uppercase tracking-[0.12em] text-foreground/40">
                  {c.note}
                </span>
              </button>
            ))}
          </div>
        </details>
      )}
    </>
  )
}
