import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean }

/** Keeps a single render/effect throw (GSAP, SplitText, canvas) from blanking
 *  the whole client-rendered tree. Pass `fallback` to scope a boundary to one
 *  feature (e.g. the WebGL brain) so its failure degrades locally, not site-wide. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Site error boundary caught:', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback !== undefined) return this.props.fallback
    return (
      <div className="grid min-h-[70svh] place-items-center px-6 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em]">
            Something went sideways.
          </h1>
          <p className="mt-3 text-foreground/70">
            A small piece of this page failed to load. Refreshing usually sorts it out.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-7 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-transform duration-200 ease-[var(--ease-quart)] active:scale-[0.97]"
          >
            Reload the page
          </button>
        </div>
      </div>
    )
  }
}
