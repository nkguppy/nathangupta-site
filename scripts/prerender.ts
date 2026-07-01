/**
 * Build-time prerender — per-route static HTML meta for crawlers and JS-less
 * scrapers (LinkedIn/Slack/WhatsApp/X unfurlers, most AI scrapers read only
 * the head; Google runs JS and sees the full app either way).
 *
 * Runs after `vite build` (see package.json "build"). For each of the 10
 * routes it clones dist/index.html, rewrites the title, description,
 * canonical and og/twitter tags from src/data/site.ts, adds article tags +
 * BlogPosting
 * JSON-LD + a full-text <noscript> body on posts, writes
 * dist/<route>/index.html (Netlify serves real files before the /* SPA
 * fallback), and emits dist/sitemap.xml from the same route table.
 *
 * Design contracts:
 * - FAIL-LOUD: every rewrite must match EXACTLY once or the build throws.
 *   If you edit index.html's head and this breaks, update the patterns here —
 *   that is by design (no silent wrong meta).
 * - site.ts and src/lib/og.ts must stay loadable under plain Node type
 *   stripping (no '@/' aliases, no runtime deps) — they are imported directly.
 * - The temporary noindex meta rides along into every prerendered file; the
 *   launch-day flip (remove the meta + the /* stanza in public/_headers) needs
 *   only a rebuild + push to propagate everywhere.
 * - #root stays EMPTY: the SPA hydrates exactly as before (zero visual risk).
 * - og:image cards must exist in dist/og/ — hard assert ("run npm run og").
 *
 * Node ≥22.18 (type stripping on by default) — local Node 26 and Netlify's
 * NODE_VERSION=22 both qualify.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { about, posts, seo, workMeta, writingMeta, caseStudies } from '../src/data/site.ts'
import type { Post } from '../src/data/site.ts'
import { ogAltForTitle, ogImageForPath } from '../src/lib/og.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

const esc = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Replace exactly one match or throw — the guard against silent wrong meta.
 *  Replacement runs through a function so `$` in content is never treated as
 *  a substitution pattern. */
function replaceOne(
  html: string,
  pattern: RegExp,
  replacement: string | ((...groups: string[]) => string),
  label: string,
): string {
  const matches = html.match(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'))
  if (!matches || matches.length !== 1)
    throw new Error(
      `prerender: expected exactly 1 match for ${label}, found ${matches?.length ?? 0}. ` +
        `index.html's head changed — update scripts/prerender.ts to match (fail-loud by design).`,
    )
  return html.replace(pattern, typeof replacement === 'string' ? () => replacement : replacement)
}

/* ───────────────────────── route table ───────────────────────── */

type Route = {
  path: string
  title: string
  description: string
  post?: Post
  noscript?: string
}

// Static-route lastmod: bump when a push changes page copy/structure.
const STATIC_LASTMOD = '2026-07-01'

const p = (text: string) => `<p style="margin:0 0 1rem">${esc(text)}</p>`
const h1 = (text: string) =>
  `<h1 style="font-size:1.7rem;margin:0 0 .25rem;font-weight:600">${esc(text)}</h1>`
const sub = (text: string) => `<p style="color:#9A9CA3;margin:0 0 1.25rem">${esc(text)}</p>`

function postNoscript(post: Post): string {
  const blocks = post.body
    .map((b) => {
      if (b.kind === 'h2') return `<h2 style="font-size:1.25rem;margin:1.5rem 0 .5rem;font-weight:600">${esc(b.text)}</h2>`
      if (b.kind === 'quote')
        return `<blockquote style="margin:1.25rem 0;padding-left:1rem;border-left:3px solid #7C84F2;color:#C9CAD1">${esc(b.text)}</blockquote>`
      return p(b.text)
    })
    .join('\n        ')
  return `${h1(post.title)}
        ${sub(`${post.kind === 'essay' ? 'Essay' : 'Note'} · ${post.topic} · ${post.date} · by Nathan Gupta, Cognitive Neuroscientist at AWA`)}
        ${p(post.dek)}
        ${blocks}`
}

const routes: Route[] = [
  { path: '/', title: seo.defaultTitle, description: seo.defaultDescription },
  {
    path: '/work',
    title: `Work · ${seo.titleSuffix}`,
    description: workMeta.intro,
    noscript: `${h1('Selected work — Nathan Gupta')}
        ${sub('Cognitive Neuroscientist at AWA · London')}
        ${p(workMeta.intro)}
        <ul style="margin:0 0 1rem;padding-left:1.25rem">
          ${caseStudies.map((c) => `<li style="margin:0 0 .5rem"><strong>${esc(c.name)}</strong> — ${esc(c.summary)}</li>`).join('\n          ')}
        </ul>`,
  },
  {
    path: '/writing',
    title: `Writing · ${seo.titleSuffix}`,
    description: writingMeta.intro,
    noscript: `${h1('Writing — Nathan Gupta')}
        ${sub('Notes and essays on the working mind')}
        ${p(writingMeta.intro)}
        <ul style="margin:0 0 1rem;padding-left:1.25rem">
          ${posts.map((post) => `<li style="margin:0 0 .5rem"><a style="color:#7C84F2" href="/writing/${post.slug}">${esc(post.title)}</a> — ${esc(post.dek)}</li>`).join('\n          ')}
        </ul>`,
  },
  {
    path: '/about',
    title: `About · ${seo.titleSuffix}`,
    description: about.lead,
    noscript: `${h1('About — Nathan Gupta')}
        ${sub('Cognitive Neuroscientist at AWA · London')}
        ${p(about.lead)}
        ${about.paragraphs.map(p).join('\n        ')}`,
  },
  ...posts.map((post) => ({
    path: `/writing/${post.slug}`,
    title: `${post.title} · ${seo.titleSuffix}`,
    description: post.dek,
    post,
    noscript: postNoscript(post),
  })),
]

/* ───────────────────────── transforms ───────────────────────── */

const template = readFileSync(join(dist, 'index.html'), 'utf8')

function renderRoute(route: Route): string {
  let html = template
  const url = route.path === '/' ? `${seo.origin}/` : `${seo.origin}${route.path}`
  const imagePath = ogImageForPath(route.path)
  const image = `${seo.origin}${imagePath}`
  const alt = ogAltForTitle(route.path === '/' ? undefined : route.post?.title ?? route.title.replace(` · ${seo.titleSuffix}`, ''))

  // og:image must exist in the built output — fail the build, don't ship a 404 card.
  if (!existsSync(join(dist, imagePath.slice(1))))
    throw new Error(`prerender: missing OG card ${imagePath} — run \`npm run og\` and commit public/og/.`)

  html = replaceOne(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`, '<title>')
  html = replaceOne(
    html,
    /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/,
    `<meta name="description" content="${esc(route.description)}" />\n    <link rel="canonical" href="${url}" />`,
    'meta description (+canonical insert)',
  )
  html = replaceOne(html, /<meta property="og:title" content="[\s\S]*?" \/>/, `<meta property="og:title" content="${esc(route.title)}" />`, 'og:title')
  html = replaceOne(
    html,
    /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/>/,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    'og:description',
  )
  html = replaceOne(html, /<meta property="og:url" content="[\s\S]*?" \/>/, `<meta property="og:url" content="${url}" />`, 'og:url')
  html = replaceOne(html, /<meta property="og:image" content="[\s\S]*?" \/>/, `<meta property="og:image" content="${image}" />`, 'og:image')
  html = replaceOne(html, /<meta property="og:image:alt" content="[\s\S]*?" \/>/, `<meta property="og:image:alt" content="${esc(alt)}" />`, 'og:image:alt')
  html = replaceOne(html, /<meta name="twitter:title" content="[\s\S]*?" \/>/, `<meta name="twitter:title" content="${esc(route.title)}" />`, 'twitter:title')
  html = replaceOne(
    html,
    /<meta\s+name="twitter:description"\s+content="[\s\S]*?"\s*\/>/,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    'twitter:description',
  )
  html = replaceOne(html, /<meta name="twitter:image" content="[\s\S]*?" \/>/, `<meta name="twitter:image" content="${image}" />`, 'twitter:image')

  if (route.post) {
    const post = route.post
    html = replaceOne(html, /<meta property="og:type" content="website" \/>/, `<meta property="og:type" content="article" />\n    <meta property="article:published_time" content="${post.date}" />\n    <meta property="article:author" content="Nathan Gupta" />`, 'og:type')
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.dek,
      datePublished: post.date,
      author: { '@type': 'Person', name: 'Nathan Gupta', url: seo.origin },
      image,
      mainEntityOfPage: url,
    }
    html = replaceOne(
      html,
      /<\/head>/,
      `  <script type="application/ld+json" id="post-jsonld">\n      ${JSON.stringify(jsonLd, null, 2).split('\n').join('\n      ')}\n    </script>\n  </head>`,
      '</head> (BlogPosting insert)',
    )
  }

  if (route.noscript) {
    const content = route.noscript
    html = replaceOne(
      html,
      /(<noscript>\s*<div[^>]*>)[\s\S]*?(<p style="margin:0">[\s\S]*?<\/p>\s*<\/div>\s*<\/noscript>)/,
      (_m, open, close) => `${open}\n        ${content}\n        ${close}`,
      '<noscript> body',
    )
  }

  return html
}

/* ───────────────────────── write output ───────────────────────── */

const written: { route: string; file: string; ogImage: string }[] = []
for (const route of routes) {
  const html = renderRoute(route)
  const rel = route.path === '/' ? 'index.html' : `${route.path.slice(1)}/index.html`
  const file = join(dist, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  written.push({ route: route.path, file: rel, ogImage: ogImageForPath(route.path) })
}

/* sitemap — same route table, no more hand-maintained drift */
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/prerender.ts at build time from src/data/site.ts. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((r) => {
    const loc = r.path === '/' ? `${seo.origin}/` : `${seo.origin}${r.path}`
    const lastmod = r.post ? r.post.date : STATIC_LASTMOD
    const changefreq = r.path === '/' || r.path === '/writing' ? 'weekly' : 'monthly'
    const priority = r.path === '/' ? '1.0' : r.post ? '0.6' : r.path === '/about' ? '0.7' : '0.8'
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  })
  .join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)

console.table(written)
console.log(`prerender: ${written.length} routes + sitemap.xml → dist/`)
