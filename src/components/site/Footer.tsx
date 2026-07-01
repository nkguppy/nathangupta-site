import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { nav, profile } from '@/data/site'
import { useSmoothScroll } from '@/components/site/SmoothScroll'
import { SocialRow } from '@/components/site/Socials'

export function Footer() {
  const { scrollTo } = useSmoothScroll()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border">
      <div className="section py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-xl font-semibold tracking-[-0.01em]">{profile.name}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/65">
              Cognitive Neuroscientist at AWA, bringing the science of the brain to how
              people and organisations perform — and writing about the mind for people outside
              the lab.
            </p>
            <SocialRow className="mt-6" />
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} className="ulink w-fit text-foreground/75">
                {item.label}
              </Link>
            ))}
            <a href={`mailto:${profile.email}`} className="ulink w-fit text-foreground/75">
              Email
            </a>
          </nav>
        </div>

        <div className="rule mt-12" />

        <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-foreground/65">
            © {year} {profile.name}. Set in Fraunces &amp; Hanken Grotesk. Brain: FreeSurfer pial surface · brainder.org · CC-BY-SA.
          </p>
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-foreground/65 transition-colors hover:text-primary"
          >
            Back to top
            <span className="grid size-8 place-items-center rounded-full border border-border transition-transform duration-300 ease-[var(--ease-quart)] group-hover:-translate-y-0.5">
              <ArrowUp className="size-4" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
