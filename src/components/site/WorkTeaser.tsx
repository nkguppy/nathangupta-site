import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { caseStudies } from '@/data/site'
import { Reveal, RevealGroup } from '@/components/primitives/Reveal'
import { CaseCard } from '@/components/site/CaseCard'

/** Homepage band previewing the AWA work; links through to the full /work page. */
export function WorkTeaser() {
  const featured = caseStudies.filter((c) => !c.confidential).slice(0, 3)

  return (
    <section id="work" className="section scroll-mt-24 py-24 sm:py-32">
      <Reveal className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow mb-5">Work</p>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
            Brain science, built into the working day
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-foreground/70">
            The tools, programmes and research I have built at AWA. A few highlights here; the
            full set lives on the work page.
          </p>
        </div>
        <Link
          to="/work"
          data-cursor-hover
          className="group inline-flex shrink-0 items-center gap-2 font-medium text-primary"
        >
          View all work
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-quart)] group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((study) => (
          <div data-reveal-item key={study.slug} className="h-full">
            <CaseCard study={study} />
          </div>
        ))}
      </RevealGroup>
    </section>
  )
}
