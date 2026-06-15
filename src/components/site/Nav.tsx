import { useEffect, useRef, useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { nav, profile } from '@/data/site'
import { useSmoothScroll } from '@/components/site/SmoothScroll'
import { ThemeToggle } from '@/components/site/ThemeToggle'
import { MagneticButton } from '@/components/primitives/MagneticButton'
import { cn } from '@/lib/utils'

// The mind as a neural constellation: nodes and connections in a rounded
// cluster. Modern, not a literal brain. The hub + crown node pulse like synapses
// (CSS in index.css); the mark grows a touch on hover. Single-colour.
function BrandMark() {
  return (
    <svg viewBox="0 0 48 48" className="brain-mark size-7" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
        <path d="M24 24 24 10M24 24 13 16M24 24 35 16M24 24 11 28M24 24 37 28M24 24 17 38M24 24 31 38" />
        <path d="M24 10 13 16 11 28 17 38 31 38 37 28 35 16Z" />
      </g>
      <g fill="currentColor">
        <circle cx="13" cy="16" r="2" />
        <circle cx="35" cy="16" r="2" />
        <circle cx="11" cy="28" r="2" />
        <circle cx="37" cy="28" r="2" />
        <circle cx="17" cy="38" r="2" />
        <circle cx="31" cy="38" r="2" />
        <circle className="syn" cx="24" cy="10" r="2.2" />
        <circle className="syn s2" cx="24" cy="24" r="2.6" />
      </g>
    </svg>
  )
}

export function Nav() {
  const { scrollTo } = useSmoothScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keep the closed menu out of the tab order, and let Escape close it.
  useEffect(() => {
    const el = menuRef.current
    if (el) el.inert = !open
    if (!open) return
    const firstLink = el?.querySelector<HTMLElement>('a')
    firstLink?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollTo(href)
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[70] transition-[background-color,border-color,backdrop-filter,box-shadow] duration-500 ease-[var(--ease-quart)]',
        scrolled
          ? 'border-b border-border bg-background/72 shadow-[var(--shadow-soft)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="section flex h-[var(--nav-h,4.5rem)] items-center justify-between" aria-label="Primary">
        <a
          href="#top"
          onClick={go('#top')}
          className="group flex items-center gap-2.5 text-primary"
          aria-label={`${profile.name}, home`}
        >
          <span className="transition-transform duration-500 ease-[var(--ease-quart)] group-hover:scale-105">
            <BrandMark />
          </span>
          <span className="font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
            {profile.name}
          </span>
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={go(item.href)} className="ulink text-[0.95rem] text-foreground/80">
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <div className="hidden md:block">
            <MagneticButton
              href="#contact"
              onClick={go('#contact')}
              variant="primary"
              strength={0.5}
              iconRight={<ArrowUpRight className="size-4" />}
              className="px-5 py-2.5 text-sm"
            >
              Get in touch
            </MagneticButton>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full border border-border bg-card/60 text-foreground backdrop-blur-sm transition-transform active:scale-95 md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — animates real height via grid-template-rows, no magic max-height */}
      <div
        ref={menuRef}
        className={cn(
          'grid border-t bg-background/95 backdrop-blur-xl transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-quart)] md:hidden',
          open ? 'grid-rows-[1fr] border-border opacity-100' : 'grid-rows-[0fr] border-transparent opacity-0',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="section flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={go(item.href)}
              className="rounded-xl px-3 py-3 font-display text-2xl text-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={go('#contact')}
            className="mt-2 flex items-center justify-between rounded-xl bg-primary px-4 py-3.5 font-medium text-primary-foreground"
          >
            Get in touch
            <ArrowUpRight className="size-5" />
          </a>
          </div>
        </div>
      </div>
    </header>
  )
}
