import { type MouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMagnetic } from '@/hooks/useMagnetic'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'paper'

type Props = {
  children: ReactNode
  className?: string
  variant?: Variant
  /** Internal route — renders a client-side <Link>. Takes precedence over href. */
  to?: string
  /** External/anchor href — renders an <a>. */
  href?: string
  onClick?: (e: MouseEvent) => void
  'aria-label'?: string
  iconRight?: ReactNode
  strength?: number
}

const base =
  'group/btn relative inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.95rem] font-medium tracking-[-0.01em] ' +
  'transition-[transform,background-color,box-shadow,color,border-color] duration-200 ' +
  'ease-[var(--ease-quart)] active:scale-[0.97]'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-brand)] hover:-translate-y-0.5',
  secondary:
    'bg-secondary text-foreground border border-border hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5',
  ghost: 'text-foreground hover:bg-muted',
  // For use on the saturated brand band: a calm light button that reads in both
  // themes (the band is deep in both). Two-tone focus ring stays visible on it.
  paper:
    'focus-onbrand bg-on-brand text-brand-strong shadow-[var(--shadow-lift)] hover:-translate-y-0.5 hover:bg-on-brand/90',
}

/**
 * A button (or link) that drifts toward the cursor. The magnetic translate
 * lives on the outer wrapper; the visual element keeps its own press-scale,
 * so the two transforms never fight. Degrades to a normal button on touch
 * devices and under reduced motion.
 */
export function MagneticButton({
  children,
  className,
  variant = 'primary',
  to,
  href,
  onClick,
  iconRight,
  strength = 0.4,
  ...rest
}: Props) {
  const wrapRef = useMagnetic<HTMLSpanElement>(strength)
  const cls = cn(base, variants[variant], className)
  const inner = (
    <>
      {variant === 'primary' ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-full opacity-0 transition-opacity duration-300 ease-[var(--ease-quart)] group-hover/btn:opacity-100"
          style={{ background: 'radial-gradient(120% 140% at 50% 130%, oklch(0.86 0.12 277 / 0.5), transparent 68%)' }}
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
      {iconRight ? (
        <span className="relative z-10 inline-flex transition-transform duration-300 ease-[var(--ease-quart)] group-hover/btn:translate-x-1">
          {iconRight}
        </span>
      ) : null}
    </>
  )

  return (
    <span ref={wrapRef} className="inline-block">
      {to ? (
        <Link to={to} onClick={onClick} className={cls} aria-label={rest['aria-label']}>
          {inner}
        </Link>
      ) : href ? (
        <a href={href} onClick={onClick} className={cls} aria-label={rest['aria-label']}>
          {inner}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={cls} aria-label={rest['aria-label']}>
          {inner}
        </button>
      )}
    </span>
  )
}
