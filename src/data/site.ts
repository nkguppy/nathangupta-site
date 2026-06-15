/**
 * All site content lives here so copy can be edited without touching markup.
 * The persona is real (Nathan Gupta, cognitive neuroscientist); the essays and
 * a few specifics are placeholder and meant to be replaced.
 */

export const profile = {
  name: 'Nathan Gupta',
  role: 'Cognitive Performance Scientist',
  org: 'AWA',
  location: 'London',
  email: 'hello@nathangupta.com',
  initials: 'NG',
} as const

export const nav = [
  { label: 'Work', href: '#work' },
  { label: 'Thoughts', href: '#essays' },
  { label: 'About', href: '#about' },
] as const

export const hero = {
  kicker: `${profile.role} @ ${profile.org}`,
  subhead:
    'I bring the science of the brain to how organisations can perform at their best, across the individual, their teams, and the workplace they do it in.',
  primaryCta: { label: 'Explore my work', href: '#work' },
  secondaryCta: { label: 'Read my thoughts', href: '#essays' },
  // Small optimised webp (176px) for the identity chip — the 800px original is
  // kept in public/ for future OG/about use.
  portrait: { src: '/headshot-sm.webp', alt: 'Nathan Gupta, Cognitive Performance Scientist' },
} as const

// Two-tone H1 candidates for the headline lab (DEV picker via ?h=N). Index 0 is
// the live default. Each option can carry its OWN subhead + kicker so the lab
// previews the whole hero composition (eyebrow → H1 → subhead), not just the line.
// All vetted through /ai-tells. Built from the deep headline-strategy research:
// the broad options pitch the H1 at the real through-line (the brain/mind in the
// modern world — performance AND its threats) and broaden the subhead to match,
// since the current subhead is workplace-bound.
const broadSub =
  'I bring the science of the brain to how we perform and how modern life wears it down — at work, and well beyond it.'
const greetSub =
  "Hey, I'm Nathan. I bring the science of the brain to how we perform and how modern life wears it down — at work, and well beyond it."

export const headlineCandidates: readonly {
  lead: string
  accent: string
  note: string
  subhead?: string
  kicker?: string
}[] = [
  // — LIVE default: Nathan's chosen warm greeting —
  { lead: "Hey, I'm", accent: 'Nathan.', note: 'Live · warm greeting' },
  // — Prior directions, kept for reference in the lab —
  { lead: 'The science of', accent: 'how good work happens.', note: 'Original · work-anchored' },
  { lead: 'The science of', accent: 'human performance.', note: 'Performance, widened past the office', subhead: broadSub },
  // — Performance, reframed to cover the threats half —
  { lead: 'The science of performance', accent: 'and what threatens it.', note: "Keeps 'performance' + names the threats", subhead: broadSub },
  // — Broad through-line (the brain/mind in modern life) · RECOMMENDED —
  { lead: 'How the mind performs', accent: 'in a distracting world.', note: '★ Broad through-line · performance + threats', subhead: broadSub },
  { lead: 'The science of a mind', accent: 'under modern pressure.', note: 'Broad · the modern-pressure through-line', subhead: broadSub },
  { lead: 'Doing your best thinking', accent: 'in a world built to distract you.', note: 'Ness-Labs tension move (reader-facing)', subhead: broadSub },
  { lead: 'How the brain holds up', accent: 'in a distracted world.', note: 'Broad · attention / wellbeing forward', subhead: broadSub },
  // — The warm greeting done the evidence-based way: thesis H1, greeting in the subhead —
  { lead: 'How the mind performs', accent: 'in a distracting world.', note: "★ Recommended broad H1 + warm 'Hey, I'm Nathan' subhead", subhead: greetSub },
  // — Tightest work-anchored alternative —
  { lead: 'Good work', accent: 'is a science.', note: 'Tightest work-anchored alternative' },
]

export type HeroSocialIcon = 'linkedin' | 'x' | 'substack' | 'youtube' | 'instagram'

// LinkedIn is real; the rest are placeholders (icon: '#') until Nathan confirms handles.
export const heroSocials: readonly { label: string; href: string; icon: HeroSocialIcon }[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nathan-gupta-9136b5169/', icon: 'linkedin' },
  { label: 'X', href: '#', icon: 'x' },
  { label: 'Substack', href: '#', icon: 'substack' },
  { label: 'YouTube', href: '#', icon: 'youtube' },
  { label: 'Instagram', href: '#', icon: 'instagram' },
] as const

export type Layer = {
  id: string
  index: string
  label: string
  title: string
  body: string
  points: readonly string[]
}

// The AWA performance framework, in Nathan's words. Nested scope: the individual
// sits inside the team, which sits inside the workplace.
export const framework = {
  heading: 'Performance has three layers',
  intro:
    'Great work never comes from a single lever. I work across three layers, from the one brain doing the thinking to the building it sits in, with a through-line running through all of them: a genuinely better experience of work.',
  layers: [
    {
      id: 'individual',
      index: '01',
      label: 'The individual',
      title: 'A brain at its best',
      body: 'Optimising attention, energy and recovery so each person can do their sharpest, most sustainable thinking, and reach the conditions for flow.',
      points: ['Attention & focus', 'Cognitive load', 'Recovery & energy', 'Flow'],
    },
    {
      id: 'team',
      index: '02',
      label: 'The team & culture',
      title: 'How teams really perform',
      body: 'Building high-performing teams, and the culture that lets them. Culture permeates the whole performance equation, for better or worse.',
      points: ['Collaboration', 'Psychological safety', 'Norms & rituals', 'Shared focus'],
    },
    {
      id: 'workplace',
      index: '03',
      label: 'The workplace',
      title: 'The room work happens in',
      body: 'The physical, remote and hybrid container that shapes how work actually gets done, designed for focus, connection and wellbeing.',
      points: ['Space & environment', 'Remote & hybrid', 'Focus vs collaboration', 'Wellbeing'],
    },
  ] as readonly Layer[],
} as const

export type EssayTopic = 'Attention' | 'Memory' | 'Decision-making' | 'Methods' | 'Mind & culture'

export const essayTopics: readonly EssayTopic[] = [
  'Attention',
  'Memory',
  'Decision-making',
  'Methods',
  'Mind & culture',
]

export type Essay = {
  slug: string
  title: string
  dek: string
  topic: EssayTopic
  date: string
  readingTime: string
  cover: string
  lqip: string
  featured?: boolean
}

export const essays: readonly Essay[] = [
  {
    slug: 'what-the-brain-does-with-silence',
    title: 'What the brain does with silence',
    dek: 'Rest is not downtime. A look at what a quiet mind gets up to, and why your best ideas tend to arrive the moment you stop chasing them.',
    topic: 'Memory',
    date: '2026-05-12',
    readingTime: '9 min',
    cover: '/covers/essay-silence.svg',
    lqip: 'linear-gradient(135deg, oklch(0.7 0.1 277), oklch(0.42 0.13 275))',
    featured: true,
  },
  {
    slug: 'memory-is-a-story-you-keep-rewriting',
    title: 'Memory is a story you keep rewriting',
    dek: 'Each time you recall something you change it a little. The science of reconstruction, and why honest witnesses get the details wrong.',
    topic: 'Memory',
    date: '2026-03-28',
    readingTime: '11 min',
    cover: '/covers/essay-memory.svg',
    lqip: 'linear-gradient(135deg, oklch(0.68 0.1 305), oklch(0.42 0.14 298))',
  },
  {
    slug: 'the-myth-of-the-multitasking-mind',
    title: 'The myth of the multitasking mind',
    dek: 'The brain cannot really do two demanding things at once. What paying attention actually costs, and the small print on every interruption.',
    topic: 'Attention',
    date: '2026-02-09',
    readingTime: '7 min',
    cover: '/covers/essay-multitask.svg',
    lqip: 'linear-gradient(135deg, oklch(0.72 0.09 245), oklch(0.45 0.13 250))',
  },
  {
    slug: 'how-certainty-feels-from-the-inside',
    title: 'How certainty feels from the inside',
    dek: 'Confidence and accuracy are not the same signal. What metacognition research says about when to trust the feeling of being sure.',
    topic: 'Decision-making',
    date: '2026-01-15',
    readingTime: '10 min',
    cover: '/covers/essay-certainty.svg',
    lqip: 'linear-gradient(135deg, oklch(0.72 0.09 282), oklch(0.46 0.13 280))',
  },
  {
    slug: 'what-a-brain-scan-can-and-cannot-tell-you',
    title: 'What a brain scan can and cannot tell you',
    dek: 'fMRI is a remarkable instrument wrapped in a lot of bad headlines. A short field guide to reading neuroscience claims without being fooled.',
    topic: 'Methods',
    date: '2025-11-30',
    readingTime: '12 min',
    cover: '/covers/essay-scan.svg',
    lqip: 'linear-gradient(135deg, oklch(0.76 0.07 215), oklch(0.46 0.1 228))',
  },
  {
    slug: 'the-attention-economy-from-the-inside-out',
    title: 'The attention economy, from the inside out',
    dek: 'What decades of attention research suggest about the feeds engineered to capture it, and the small habits that win some of it back.',
    topic: 'Mind & culture',
    date: '2025-10-18',
    readingTime: '8 min',
    cover: '/covers/essay-economy.svg',
    lqip: 'linear-gradient(135deg, oklch(0.76 0.07 200), oklch(0.46 0.09 208))',
  },
]

export const about = {
  lead: 'I am a cognitive neuroscientist, which is a long way of saying I spend my time on one stubborn question.',
  paragraphs: [
    'For the last decade I have been trying to understand how the brain decides what is worth attending to, and what it can safely ignore. That single choice, made thousands of times a day, quietly shapes what you remember, what you decide, and who you become.',
    'My work pairs careful experiments with computational models that make their assumptions explicit. I care less about producing surprising headlines than about results that hold up when someone tries to break them.',
    'I also think the science is too good to leave sitting in journals. So I write essays and give talks for people who are curious about the mind but have no intention of reading a methods section.',
  ],
  facts: [
    { label: 'Focus', value: 'Attention, memory, decision-making' },
    { label: 'Methods', value: 'EEG · fMRI · computational modelling' },
    { label: 'Based in', value: 'London' },
    { label: 'Currently', value: 'Writing on memory and certainty' },
  ],
} as const

export const contact = {
  heading: 'Good questions about the mind are always welcome.',
  body: 'I am happy to hear from students, journalists, potential collaborators, and anyone with a question that has been nagging at them. I read everything, and I reply to most of it.',
  primaryCta: { label: 'Email me', href: `mailto:${profile.email}` },
} as const

export type SocialLink = {
  label: string
  href: string
  icon: 'mail' | 'scholar' | 'linkedin' | 'bluesky'
}

// Placeholder profile links point at each platform's home so nothing is a dead
// '#' link; replace the href values with Nathan's real profile URLs.
export const socials: readonly SocialLink[] = [
  { label: 'Email', href: `mailto:${profile.email}`, icon: 'mail' },
  { label: 'Google Scholar', href: 'https://scholar.google.com/', icon: 'scholar' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin' },
  { label: 'Bluesky', href: 'https://bsky.app/', icon: 'bluesky' },
]
