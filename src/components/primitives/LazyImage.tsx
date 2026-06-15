import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type LazyImageProps = {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  /** Color/gradient shown (blurred) until the image decodes. */
  lqip?: string
  /** Reserved aspect ratio to prevent layout shift, e.g. '16 / 10'. */
  aspect?: string
  eager?: boolean
}

/**
 * Lazy image with a blur-up placeholder. Space is reserved via aspect-ratio
 * (no CLS); the source only attaches once within 200px of the viewport, then
 * crossfades from a blurred tint to the decoded image.
 */
export function LazyImage({
  src,
  alt,
  className,
  imgClassName,
  lqip,
  aspect = '16 / 10',
  eager = false,
}: LazyImageProps) {
  const ref = useRef<HTMLImageElement>(null)
  const [inView, setInView] = useState(eager)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (eager || inView) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true)
            obs.disconnect()
          }
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [eager, inView])

  useEffect(() => {
    if (inView && ref.current?.complete) setLoaded(true)
  }, [inView])

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ aspectRatio: aspect }}>
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 transition-opacity duration-700 ease-out',
          loaded ? 'opacity-0' : 'opacity-100',
        )}
        style={{ background: lqip ?? 'var(--brand-soft)', filter: 'blur(3px)', transform: 'scale(1.1)' }}
      />
      <img
        ref={ref}
        src={inView ? src : undefined}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          'relative h-full w-full object-cover transition-[opacity,transform,filter] duration-[900ms] ease-out',
          loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-[1.04]',
          imgClassName,
        )}
      />
    </div>
  )
}
