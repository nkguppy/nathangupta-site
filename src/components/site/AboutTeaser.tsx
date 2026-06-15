import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { about } from '@/data/site'
import { Reveal } from '@/components/primitives/Reveal'
import { PortraitTile } from '@/components/site/PortraitTile'

/** Homepage band: a condensed bio that links through to the full /about page. */
export function AboutTeaser() {
  return (
    <section id="about" className="section scroll-mt-24 py-24 sm:py-32" aria-label="About Nathan Gupta">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow mb-5">About</p>
            <p className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.02em] text-foreground">
              {about.lead}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-7 max-w-xl text-[1.05rem] leading-[1.7] text-foreground/75">
              {about.paragraphs[2]}
            </p>
            <Link
              to="/about"
              data-cursor-hover
              className="group mt-8 inline-flex items-center gap-2 font-medium text-primary"
            >
              More about me
              <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-quart)] group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal y={32}>
            <PortraitTile />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
