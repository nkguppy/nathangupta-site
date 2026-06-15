import { usePageMeta } from '@/hooks/usePageMeta'
import { Hero } from '@/components/site/Hero'
import { Framework } from '@/components/site/Framework'
import { WorkTeaser } from '@/components/site/WorkTeaser'
import { WritingTeaser } from '@/components/site/WritingTeaser'
import { AboutTeaser } from '@/components/site/AboutTeaser'

/**
 * The home route: a single cinematic scroll — hero, the framework that anchors
 * the thinking, then teasers for Work, Writing and About that link into the
 * dedicated pages. The global contact band + footer close it from the shell.
 */
export function Home() {
  usePageMeta({})
  return (
    <>
      <Hero />
      <Framework />
      <WorkTeaser />
      <WritingTeaser />
      <AboutTeaser />
    </>
  )
}
