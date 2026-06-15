import { useCallback, useState } from 'react'

type Theme = 'light' | 'dark'

const META: Record<Theme, string> = { light: '#FAFAFB', dark: '#16171A' }

function current(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/** Reads/sets the theme, keeping the `dark` class, `data-theme`,
 *  localStorage and the address-bar theme-color all in sync. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current)

  const apply = useCallback((next: Theme) => {
    const el = document.documentElement
    el.setAttribute('data-theme', next)
    el.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem('ng-theme', next)
    } catch {
      // storage may be unavailable (private mode); theme still applies for the session
    }
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute('content', META[next])
    })
    setTheme(next)
  }, [])

  const toggle = useCallback(() => {
    apply(current() === 'dark' ? 'light' : 'dark')
  }, [apply])

  // `current()` in useState's initializer already reads the theme the pre-paint
  // script set, so no post-mount sync effect is needed.
  return { theme, toggle }
}
