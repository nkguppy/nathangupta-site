import { Mail } from 'lucide-react'
import { contact, profile } from '@/data/site'
import { Reveal } from '@/components/primitives/Reveal'
import { MagneticButton } from '@/components/primitives/MagneticButton'
import { SocialRow } from '@/components/site/Socials'

/**
 * The one fully saturated moment on the page: a deep brand band that lets the
 * accent carry the surface, with a light button and social row on top.
 */
export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24">
      <div className="relative overflow-hidden bg-brand-strong text-on-brand">
        <svg
          viewBox="0 0 600 600"
          className="pointer-events-none absolute -right-24 -top-24 h-[34rem] w-[34rem] text-on-brand/10"
          aria-hidden
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            {[60, 120, 180, 240, 300].map((r) => (
              <circle key={r} cx="300" cy="300" r={r} />
            ))}
          </g>
        </svg>

        <div className="section relative py-24 sm:py-32">
          <Reveal>
            <h2 className="max-w-[18ch] font-display text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-on-brand">
              {contact.heading}
            </h2>
            <p className="mt-6 max-w-[54ch] text-[1.1rem] leading-relaxed text-on-brand/95">
              {contact.body}
            </p>

            <div className="mt-10 flex flex-col items-start gap-7 sm:flex-row sm:items-center">
              <MagneticButton
                href={contact.primaryCta.href}
                variant="paper"
                iconRight={<Mail className="size-4" />}
              >
                {contact.primaryCta.label}
              </MagneticButton>
              <SocialRow tone="paper" />
            </div>

            <p className="mt-10 font-mono text-sm text-on-brand/85">{profile.email}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
