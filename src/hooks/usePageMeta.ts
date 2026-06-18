import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ORIGIN = 'https://nathangupta.com'
const SUFFIX = 'Nathan Gupta'
const DEFAULT_TITLE = 'Nathan Gupta · Cognitive Neuroscientist at AWA'
const DEFAULT_DESCRIPTION =
  'Nathan Gupta is a Cognitive Neuroscientist at AWA, bringing the science of the brain to how people and organisations perform — across the individual, the team, and the workplace.'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Per-route document title, description, social card and canonical URL for this
 * SPA (no SSR). Pass a page title and description; the document title becomes
 * "<title> · Nathan Gupta", or the full default on the home route. og:url and the
 * canonical link track the actual path, so a shared deep link resolves to itself
 * rather than the homepage.
 */
export function usePageMeta({ title, description }: { title?: string; description?: string }) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : DEFAULT_TITLE
    const desc = description ?? DEFAULT_DESCRIPTION
    const url = pathname === '/' ? `${ORIGIN}/` : `${ORIGIN}${pathname}`

    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', document.title)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', document.title)
    setMeta('name', 'twitter:description', desc)
    // og:image is intentionally NOT set per-route: the static branded card from
    // index.html (og.png) carries every route for v1. Per-post OG cards are a
    // deferred nice-to-have — worth generating once the essays are Nathan's final
    // pieces rather than placeholders (recipe: scripts/og-source.svg + rsvg).
    setCanonical(url)
  }, [title, description, pathname])
}
