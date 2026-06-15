import { type ReactNode } from 'react'
import { useTilt } from '@/hooks/useTilt'
import { cn } from '@/lib/utils'

type TiltCardProps = {
  children: ReactNode
  className?: string
  max?: number
  spotlight?: boolean
}

/**
 * Wraps content in a card that tilts toward the cursor in 3D and carries a
 * soft spotlight that follows the pointer. Both effects are pointer/motion
 * gated inside useTilt, so it sits flat and calm on touch or reduced motion.
 */
export function TiltCard({ children, className, max = 6, spotlight = true }: TiltCardProps) {
  const ref = useTilt<HTMLDivElement>(max)
  return (
    <div
      ref={ref}
      className={cn('group/tilt relative [transform-style:preserve-3d]', className)}
    >
      {children}
      {spotlight && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-out group-hover/tilt:opacity-100"
          style={{
            background:
              'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), oklch(0.7 0.16 276 / 0.18), transparent 62%)',
          }}
        />
      )}
    </div>
  )
}
