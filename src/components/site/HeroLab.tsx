/**
 * DEV-only hero variation switcher — a small on-screen panel to click between the
 * exploration variants (background particles on/off, neuron fx) without editing the
 * URL by hand. Sets the query param + reloads (fx/particles are read at mount).
 * Gated to import.meta.env.DEV, so it never ships.
 */
import { cn } from '@/lib/utils'
import { BRAIN_PALETTES, DEFAULT_BRAIN_PALETTE, type BrainPalette } from '@/components/site/brainPalettes'

const FX = ['none', 'cursor', 'ambient', 'entrance'] as const
const PALETTES = Object.keys(BRAIN_PALETTES) as BrainPalette[]
const LAYOUTS = ['wide', 'even'] as const

function Btn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-2.5 py-1 text-[0.72rem] capitalize transition-colors',
        active ? 'bg-brand/20 text-foreground ring-1 ring-brand/50' : 'text-foreground/55 hover:bg-muted hover:text-foreground/80',
      )}
    >
      {children}
    </button>
  )
}

export function HeroLab() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const particlesOn = params.get('particles') === 'on'
  const fx = (FX as readonly string[]).includes(params.get('fx') || '') ? (params.get('fx') as string) : 'none'
  const palette = (PALETTES as string[]).includes(params.get('palette') || '') ? (params.get('palette') as BrainPalette) : DEFAULT_BRAIN_PALETTE
  const layout = params.get('layout') === 'even' ? 'even' : 'wide'

  const go = (mut: (u: URL) => void) => {
    const u = new URL(window.location.href)
    mut(u)
    window.location.assign(u.toString())
  }
  const setParticles = (on: boolean) => go((u) => (on ? u.searchParams.set('particles', 'on') : u.searchParams.delete('particles')))
  const setFx = (v: string) => go((u) => (v === 'none' ? u.searchParams.delete('fx') : u.searchParams.set('fx', v)))
  const setPalette = (v: BrainPalette) => go((u) => (v === DEFAULT_BRAIN_PALETTE ? u.searchParams.delete('palette') : u.searchParams.set('palette', v)))
  const setLayout = (v: string) => go((u) => (v === 'wide' ? u.searchParams.delete('layout') : u.searchParams.set('layout', v)))

  return (
    <details
      open
      className="fixed bottom-4 right-4 z-[200] w-[300px] rounded-xl border border-border bg-card/95 shadow-[var(--shadow-lift)] backdrop-blur-xl [&::-webkit-details-marker]:hidden"
    >
      <summary className="cursor-pointer list-none px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-foreground/65">
        ▸ Hero lab · dev — variations
      </summary>
      <div className="flex flex-col gap-2.5 px-3 pb-3 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-[0.58rem] uppercase tracking-[0.14em] text-foreground/40">Particles</span>
          <div className="flex gap-1">
            <Btn active={particlesOn} onClick={() => setParticles(true)}>on</Btn>
            <Btn active={!particlesOn} onClick={() => setParticles(false)}>off</Btn>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1 w-16 shrink-0 text-[0.58rem] uppercase tracking-[0.14em] text-foreground/40">Effect</span>
          <div className="flex flex-wrap gap-1">
            {FX.map((v) => (
              <Btn key={v} active={fx === v} onClick={() => setFx(v)}>{v}</Btn>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1 w-16 shrink-0 text-[0.58rem] uppercase tracking-[0.14em] text-foreground/40">Colour</span>
          <div className="flex flex-wrap gap-1">
            {PALETTES.map((v) => (
              <Btn key={v} active={palette === v} onClick={() => setPalette(v)}>{v}</Btn>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1 w-16 shrink-0 text-[0.58rem] uppercase tracking-[0.14em] text-foreground/40">Layout</span>
          <div className="flex flex-wrap gap-1">
            {LAYOUTS.map((v) => (
              <Btn key={v} active={layout === v} onClick={() => setLayout(v)}>{v}</Btn>
            ))}
          </div>
        </div>
        <p className="text-[0.56rem] leading-snug text-foreground/35">
          cursor = move mouse over brain · entrance = reloads to assemble · layout = wide spreads + bleeds the brain · combinable
        </p>
      </div>
    </details>
  )
}
