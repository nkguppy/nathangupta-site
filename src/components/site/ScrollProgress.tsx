import { useEffect, useRef } from 'react'

/** A thin periwinkle reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    let raf = 0
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const frac = max > 0 ? Math.min(1, window.scrollY / max) : 0
      bar.style.transform = `scaleX(${frac.toFixed(4)})`
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[80] h-[3px]">
      <div
        ref={barRef}
        className="h-full origin-left scale-x-0 bg-gradient-to-r from-primary/70 via-primary to-primary/70"
        style={{ willChange: 'transform' }}
      />
    </div>
  )
}
