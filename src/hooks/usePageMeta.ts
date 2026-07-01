import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { seo } from '@/data/site'
import { ogAltForTitle, ogImageForPath } from '@/lib/og'

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
 * Per-route document title, description, social card and canonical URL for the
 * client-side head. Pass a page title and description; the document title
 * becomes "<title> · Nathan Gupta", or the full default on the home route.
 * og:url and the canonical link track the actual path, so a shared deep link
 * resolves to itself rather than the homepage. og:image/twitter:image default
 * to the route's generated share card (src/lib/og.ts → public/og/); pass
 * `image` to override.
 *
 * Crawlers and JS-less scrapers never run this hook — they read the per-route
 * static head baked into dist/<route>/index.html by scripts/prerender.ts at
 * build time, which shares seo/ogImageForPath so the two stay in lockstep.
 */
export function usePageMeta({
  title,
  description,
  image,
}: {
  title?: string
  description?: string
  image?: string
}) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = title ? `${title} · ${seo.titleSuffix}` : seo.defaultTitle
    const desc = description ?? seo.defaultDescription
    const url = pathname === '/' ? `${seo.origin}/` : `${seo.origin}${pathname}`
    const img = `${seo.origin}${image ?? ogImageForPath(pathname)}`

    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', document.title)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:image:alt', ogAltForTitle(title))
    setMeta('name', 'twitter:title', document.title)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', img)
    setCanonical(url)

    // Prerendered post HTML carries article:* metas + a BlogPosting JSON-LD
    // for scrapers. They describe only the URL that served the HTML, so drop
    // them once the SPA owns the head (crawlers fetch each URL fresh).
    document.head
      .querySelectorAll('meta[property^="article:"], script#post-jsonld')
      .forEach((el) => el.remove())
  }, [title, description, image, pathname])
}
