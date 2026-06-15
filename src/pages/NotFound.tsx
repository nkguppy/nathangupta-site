import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'
import { MagneticButton } from '@/components/primitives/MagneticButton'

export function NotFound() {
  usePageMeta({ title: 'Page not found' })
  return (
    <section className="section flex min-h-[78svh] flex-col items-center justify-center py-32 text-center">
      <p className="eyebrow mb-5">404</p>
      <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.04] tracking-[-0.025em]">
        This page wandered off.
      </h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-foreground/70">
        The link may be broken, or the page may have moved. Let me point you back to something
        that exists.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <MagneticButton to="/" variant="primary" iconRight={<ArrowRight className="size-4" />}>
          Back home
        </MagneticButton>
        <MagneticButton
          to="/writing"
          variant="secondary"
          strength={0.3}
          iconRight={<ArrowUpRight className="size-4" />}
        >
          Read the writing
        </MagneticButton>
      </div>
    </section>
  )
}
