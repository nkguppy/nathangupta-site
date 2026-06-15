import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { nav, profile } from '@/data/site'
import { useSmoothScroll } from '@/components/site/SmoothScroll'
import { ThemeToggle } from '@/components/site/ThemeToggle'
import { MagneticButton } from '@/components/primitives/MagneticButton'
import { cn } from '@/lib/utils'

export function Nav() {
  const { scrollTo } = useSmoothScroll()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keep the closed menu out of the tab order, focus the first link on open, and
  // — crucially — return focus to the toggle on close BEFORE the menu is inert'd,
  // so a keyboard user (Escape, or a nav selection) is never dropped to <body>.
  useEffect(() => {
    const el = menuRef.current
    if (open) {
      if (el) el.inert = false
      el?.querySelector<HTMLElement>('a')?.focus()
      wasOpen.current = true
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false)
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
    // Closing: restore focus to the trigger before the menu becomes inert.
    if (wasOpen.current) toggleRef.current?.focus()
    if (el) el.inert = true
    wasOpen.current = false
  }, [open])

  // Logo: navigate home, or if already home, glide back to the top.
  const onLogo = (e: React.MouseEvent) => {
    setOpen(false)
    if (pathname === '/') {
      e.preventDefault()
      scrollTo(0)
    }
  }

  // Contact lives globally in the shell, so on most pages this just scrolls down.
  // On routes that opt out of the contact band (the 404), send the user home to
  // the contact band instead of firing a dead scroll.
  const onContact = (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    if (document.getElementById('contact')) scrollTo('#contact')
    else navigate('/#contact')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn('ulink text-[0.95rem] transition-colors', isActive ? 'text-primary' : 'text-foreground/80')

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
        <Link
          to="/"
          onClick={onLogo}
          className="group flex items-center"
          aria-label={`${profile.name}, home`}
        >
          <span className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground transition-colors duration-300 ease-[var(--ease-quart)] group-hover:text-primary">
            {profile.name}
          </span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <div className="hidden md:block">
            <MagneticButton
              href="#contact"
              onClick={onContact}
              variant="primary"
              strength={0.5}
              iconRight={<ArrowUpRight className="size-4" />}
              className="px-5 py-2.5 text-sm"
            >
              Get in touch
            </MagneticButton>
          </div>
          <button
            ref={toggleRef}
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
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-3 py-3 font-display text-2xl transition-colors hover:bg-muted hover:text-primary',
                    isActive ? 'text-primary' : 'text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href="#contact"
              onClick={onContact}
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
