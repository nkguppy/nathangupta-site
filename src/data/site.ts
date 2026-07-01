/**
 * All site content lives here so copy can be edited without touching markup.
 * The persona is real (Nathan Gupta, Cognitive Neuroscientist at AWA).
 * The writing pieces and some Work specifics are credible placeholders, written
 * in Nathan's voice and meant to be replaced with his final copy. Nothing here
 * states a metric or client as fact; the confidential engagement is teased only.
 */

export const profile = {
  name: 'Nathan Gupta',
  role: 'Cognitive Neuroscientist',
  // The truer framing he leads with; the official AWA title is noted once in /about.
  titleOfficial: 'Neuroscience Associate',
  org: 'AWA',
  location: 'London',
  email: 'hello@nathangupta.com',
  initials: 'NG',
} as const

export const links = {
  email: `mailto:${profile.email}`,
  linkedin: 'https://www.linkedin.com/in/nathan-gupta-9136b5169/',
  awa: 'https://www.advanced-workplace.com/team-member/nathan-gupta/',
} as const

// Shared SEO defaults — the single source of truth for the runtime head
// (hooks/usePageMeta.ts) and the build-time prerender (scripts/prerender.ts).
// This file must stay dependency-free: the prerender imports it under plain Node.
export const seo = {
  origin: 'https://nathangupta.com',
  titleSuffix: 'Nathan Gupta',
  defaultTitle: 'Nathan Gupta · Cognitive Neuroscientist at AWA',
  defaultDescription:
    'Nathan Gupta is a Cognitive Neuroscientist at AWA, bringing the science of the brain to how people and organisations perform — across the individual, the team, and the workplace.',
} as const

// Primary nav now routes to real pages (hybrid model: a rich scrolling home plus
// dedicated, linkable pages). `to` values are router paths.
export const nav = [
  { label: 'Work', to: '/work' },
  { label: 'Writing', to: '/writing' },
  { label: 'About', to: '/about' },
] as const

export const hero = {
  kicker: `${profile.role} @ ${profile.org}`,
  subhead:
    'I bring the science of the brain to how people and organisations perform at work — across the individual, the team, and the workplace itself.',
  primaryCta: { label: 'Explore my work', to: '/work' },
  secondaryCta: { label: 'Read my writing', to: '/writing' },
  // Small optimised webp (176px) for the identity chip in the hero.
  portrait: { src: '/headshot-sm.webp', alt: 'Nathan Gupta, Cognitive Neuroscientist' },
} as const

// The larger portrait (800px webp) used on the /about page. Greyscale-treated in
// the component so the warm parkland background sits inside the cool palette.
export const aboutPortrait = {
  src: '/headshot.webp',
  alt: 'Nathan Gupta, Cognitive Neuroscientist at AWA',
} as const

// Two-tone H1 candidates for the headline lab (DEV picker via ?h=N). Index 0 is
// the live default. Each option can carry its OWN subhead + kicker so the lab
// previews the whole hero composition (eyebrow → H1 → subhead), not just the line.
// All vetted through /ai-tells.
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
  { lead: 'The science of performance', accent: 'and what threatens it.', note: "Keeps 'performance' + names the threats", subhead: broadSub },
  { lead: 'How the mind performs', accent: 'in a distracting world.', note: '★ Broad through-line · performance + threats', subhead: broadSub },
  { lead: 'The science of a mind', accent: 'under modern pressure.', note: 'Broad · the modern-pressure through-line', subhead: broadSub },
  { lead: 'Doing your best thinking', accent: 'in a world built to distract you.', note: 'Ness-Labs tension move (reader-facing)', subhead: broadSub },
  { lead: 'How the brain holds up', accent: 'in a distracted world.', note: 'Broad · attention / wellbeing forward', subhead: broadSub },
  { lead: 'How the mind performs', accent: 'in a distracting world.', note: "★ Recommended broad H1 + warm 'Hey, I'm Nathan' subhead", subhead: greetSub },
  { lead: 'Good work', accent: 'is a science.', note: 'Tightest work-anchored alternative' },
]

export type HeroSocialIcon = 'linkedin' | 'x' | 'substack' | 'youtube' | 'instagram'

// All real (confirmed by Nathan 2026-06-15). HeroSocials still hides any '#'
// placeholder, so adding/removing a handle is just an edit here.
export const heroSocials: readonly { label: string; href: string; icon: HeroSocialIcon }[] = [
  { label: 'LinkedIn', href: links.linkedin, icon: 'linkedin' },
  { label: 'X', href: 'https://x.com/nathangupta', icon: 'x' },
  { label: 'Substack', href: 'https://substack.com/@nathankrishgupta', icon: 'substack' },
  { label: 'YouTube', href: 'https://www.youtube.com/@NathanGupta', icon: 'youtube' },
  { label: 'Instagram', href: 'https://www.instagram.com/nathangupta_/', icon: 'instagram' },
] as const

/* ───────────────────────────── Framework ───────────────────────────── */

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
    'No single thing makes work better. I work across three layers, from the one brain doing the thinking to the building it sits in, and one aim ties them together: a better experience of work.',
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

/* ─────────────────────────────── Work ─────────────────────────────── */

export type CaseKind = 'Product' | 'Programme' | 'Research' | 'Talk'

export type CaseStudy = {
  slug: string
  name: string
  kind: CaseKind
  period: string
  /** One-line summary for cards. */
  summary: string
  /** Longer description for the detail panel. */
  detail: string
  role: string
  contributions: readonly string[]
  tags: readonly string[]
  /** Two oklch stops for the card's cover gradient. */
  accent: readonly [string, string]
  /** Client-confidential engagement — teased only, never detailed. */
  confidential?: boolean
  href?: string
}

export const workMeta = {
  eyebrow: 'Selected work',
  heading: 'Turning brain science into work that performs',
  intro:
    'A decade in psychology and neuroscience, the last few spent at AWA building the tools, programmes and research that bring that science into the working day. A selection of what I can show publicly.',
} as const

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: 'cognitive-performance-index',
    name: 'Cognitive Performance Index',
    kind: 'Product',
    period: '2023 — present',
    summary:
      'AWA’s measure of how well a workplace supports the thinking it asks people to do.',
    detail:
      'A research-backed index that turns a fuzzy question — is this a place people can think well? — into something an organisation can actually see and act on. I led the science behind it: the literature it stands on, the model that decides what to measure, and the way the results are read back to a business so they point at a decision rather than a dashboard.',
    role: 'Research & design lead',
    contributions: [
      'Built the research foundation and measurement model',
      'Shaped the index architecture end to end',
      'Translated findings into decisions clients could act on',
    ],
    tags: ['Measurement', 'Research', 'Product'],
    accent: ['oklch(0.72 0.13 280)', 'oklch(0.42 0.15 275)'],
  },
  {
    slug: 'cognitive-wellbeing-performance-programme',
    name: 'Cognitive Wellbeing & Performance Programme',
    kind: 'Programme',
    period: '2022 — present',
    summary:
      'A certified AWA Institute training programme, run yearly to organisations worldwide.',
    detail:
      'A training programme that teaches people the science of their own cognition — attention, load, recovery — and what to do with it. I researched, designed and delivered it alongside colleagues and AWA’s founder, Andrew Mawson. It has run each year for three years, to dozens of organisations around the world.',
    role: 'Researched · designed · delivered',
    contributions: [
      'Researched and wrote the curriculum',
      'Co-designed the programme with Andrew Mawson',
      'Delivered it to cohorts internationally',
    ],
    tags: ['Training', 'Wellbeing', 'AWA Institute'],
    accent: ['oklch(0.7 0.1 305)', 'oklch(0.42 0.14 298)'],
  },
  {
    slug: 'cognitive-enhancement-trial',
    name: 'Cognitive Enhancement Trial',
    kind: 'Research',
    period: '2024 — present',
    summary:
      'An applied study testing what actually lifts cognitive performance at work.',
    detail:
      'A programme of applied research separating the interventions that measurably help people think better from the long list that only sound like they should. The interesting part is the discipline: deciding what counts as evidence before you go looking for it, so the conclusions survive someone trying to break them.',
    role: 'Research lead',
    contributions: [
      'Designed the trial and its measures',
      'Set the bar for evidence up front',
      'Turned results into practice that holds up',
    ],
    tags: ['Applied research', 'Performance', 'Method'],
    accent: ['oklch(0.74 0.09 215)', 'oklch(0.44 0.11 228)'],
  },
  {
    slug: 'awa-performance-framework',
    name: 'The AWA Performance Framework',
    kind: 'Research',
    period: '2023 — present',
    summary:
      'One lens on workplace performance, from the individual brain to the building.',
    detail:
      'The model that ties my work together: performance lives across three nested layers — the individual, the team and culture, and the workplace itself — and you cannot move one far without the others. It came out of consolidating a scattered literature into something a leader can hold in their head and a team can act on.',
    role: 'Research & authorship',
    contributions: [
      'Consolidated the research into a single framework',
      'Defined the three nested layers and how they interact',
      'Made it usable by non-specialists',
    ],
    tags: ['Framework', 'Synthesis', 'Strategy'],
    accent: ['oklch(0.7 0.12 250)', 'oklch(0.43 0.14 255)'],
  },
  {
    slug: 'brains-at-work-summit',
    name: 'Brains at Work Summit',
    kind: 'Talk',
    period: 'London',
    summary:
      'A summit on the science of working minds, designed and delivered largely by me.',
    detail:
      'A day bringing the science of cognition to the people who shape how others work. I designed and delivered most of it — the through-line, the talks, the way the research was made to land for a room of practitioners rather than peers. The kind of work I most enjoy: taking something true and making it useful out loud.',
    role: 'Design & delivery',
    contributions: [
      'Shaped the programme and narrative',
      'Wrote and delivered the core sessions',
      'Made research land for a practitioner audience',
    ],
    tags: ['Speaking', 'Events', 'Communication'],
    accent: ['oklch(0.72 0.1 300)', 'oklch(0.44 0.13 290)'],
  },
  {
    slug: 'confidential-engagement',
    name: 'Confidential client engagement',
    kind: 'Programme',
    period: 'Under NDA',
    summary:
      'A client-exclusive engagement applying the full framework inside one organisation.',
    detail:
      'A live, client-exclusive programme that takes the framework end to end inside a single organisation. I can talk about the shape of it — how the layers are sequenced, where measurement sits, what changes first — but the specifics belong to the client. Happy to walk through the architecture in a conversation.',
    role: 'Engagement design & research',
    contributions: [
      'Sequenced the framework into a delivered engagement',
      'Placed measurement at the right moments',
      'Specifics held under NDA',
    ],
    tags: ['Engagement', 'Applied', 'Confidential'],
    accent: ['oklch(0.5 0.05 280)', 'oklch(0.3 0.04 278)'],
    confidential: true,
  },
]

/* ────────────────────────────── Writing ───────────────────────────── */

export type WritingTopic =
  | 'Attention'
  | 'Flow'
  | 'Decision-making'
  | 'AI & the mind'
  | 'The workplace'

export const writingTopics: readonly WritingTopic[] = [
  'Attention',
  'Flow',
  'Decision-making',
  'AI & the mind',
  'The workplace',
]

export type PostKind = 'note' | 'essay'

export type Block = { kind: 'p' | 'h2' | 'quote'; text: string }

export type Post = {
  slug: string
  title: string
  dek: string
  kind: PostKind
  topic: WritingTopic
  date: string
  readingTime: string
  cover: string
  lqip: string
  featured?: boolean
  body: readonly Block[]
}

export const writingMeta = {
  eyebrow: 'Writing',
  heading: 'Notes and essays on the working mind',
  intro:
    'Short field notes and longer essays on how attention, focus and judgement hold up under modern conditions — written for a curious reader, not a methods section.',
} as const

export const posts: readonly Post[] = [
  {
    slug: 'focus-is-not-a-character-trait',
    title: 'Focus is not a character trait',
    dek: 'We treat concentration as something you either have or lack. The science says it is a state you build the conditions for, and most workplaces quietly dismantle them.',
    kind: 'essay',
    topic: 'Flow',
    date: '2026-05-28',
    readingTime: '8 min',
    cover: '/covers/essay-silence.svg',
    lqip: 'linear-gradient(135deg, oklch(0.7 0.1 277), oklch(0.42 0.13 275))',
    featured: true,
    body: [
      { kind: 'p', text: 'When someone struggles to concentrate, we tend to reach for a verdict about the person. They lack discipline. They have a short attention span. They are not focused. It is a tidy story, and it is mostly wrong.' },
      { kind: 'p', text: 'Attention is something the brain does when a particular set of conditions line up: a clear goal, a task that meets you at the edge of your ability, and an environment that is not constantly asking for a piece of you. Take those away and even a disciplined mind scatters. Put them back and concentration tends to return on its own.' },
      { kind: 'h2', text: 'The environment does the deciding' },
      { kind: 'p', text: 'Most offices, and most calendars, are arranged in a way that makes deep concentration the exception. An interruption every few minutes does not cost you only the minutes. It costs the climb back to where you were, and that climb is far longer than the interruption that triggered it.' },
      { kind: 'quote', text: 'The question is rarely whether someone can focus. It is whether anything around them will let them.' },
      { kind: 'p', text: 'This is good news, oddly. If focus were a trait, there would be little to do but sort people into those who have it and those who do not. Because it is a state, it can be designed for. You can protect the conditions that produce it, and you can stop quietly removing them. That is most of the work.' },
    ],
  },
  {
    slug: 'the-real-cost-of-a-distracted-mind',
    title: 'The real cost of a distracted mind',
    dek: 'The brain cannot do two demanding things at once. What switching between them actually costs, and why the bill arrives somewhere you were not looking.',
    kind: 'essay',
    topic: 'Attention',
    date: '2026-04-15',
    readingTime: '7 min',
    cover: '/covers/essay-multitask.svg',
    lqip: 'linear-gradient(135deg, oklch(0.72 0.09 245), oklch(0.45 0.13 250))',
    body: [
      { kind: 'p', text: 'There is no such thing as paying attention to two demanding things at the same time. What feels like multitasking is the mind switching between them, quickly enough to blur the seam. Each switch is cheap on its own. The trouble is the volume.' },
      { kind: 'p', text: 'Every time you turn from one task to another, a little of the first one stays behind, still occupying space. Researchers call it attention residue: part of your mind is still finishing the last thing while you start the next. Do this a few hundred times a day, which is roughly what a normal working day now asks, and you spend most of it operating at a fraction of the capacity you actually have.' },
      { kind: 'h2', text: 'Where the bill lands' },
      { kind: 'p', text: 'The cost rarely shows up as a missed task. It shows up as work that is a little worse than it should have been, decisions made with half a mind, a day that felt busy and produced little. Because nothing dramatic failed, the cause is easy to miss.' },
      { kind: 'p', text: 'The fix is unglamorous and reliable: fewer switches. Batch the small things. Give the demanding things a clear run. The brain is extraordinary at sustained, single-track work, and ordinary at everything we have built our days around instead.' },
    ],
  },
  {
    slug: 'your-brain-on-infinite-scroll',
    title: 'Your brain on infinite scroll',
    dek: 'We blame the feed on weak willpower. Really it is a system built by people who understand your attention better than you do.',
    kind: 'note',
    topic: 'AI & the mind',
    date: '2026-03-22',
    readingTime: '4 min',
    cover: '/covers/essay-economy.svg',
    lqip: 'linear-gradient(135deg, oklch(0.76 0.07 200), oklch(0.46 0.09 208))',
    body: [
      { kind: 'p', text: 'It is tempting to frame compulsive scrolling as a personal failing: if you had more discipline, you would put the phone down. That framing is convenient for everyone except you, because it points the blame inward and leaves the machine untouched.' },
      { kind: 'p', text: 'The feed is engineered. Variable rewards, the small unpredictable hit that keeps a slot-machine player seated, are deliberate. They are the product, and your attention is what the teams behind them optimise for, measured in the seconds they can keep you.' },
      { kind: 'quote', text: 'You are not weak. You are outnumbered.' },
      { kind: 'p', text: 'Knowing this does not break the spell by itself, but it changes the task. Rather than trying to win a willpower contest against a system designed to beat it, you change the conditions: more friction between you and the feed, fewer reasons to open it, a few corners of the day it is not allowed into. You move the furniture rather than fighting the gravity.' },
    ],
  },
  {
    slug: 'a-workplace-the-brain-can-think-in',
    title: 'A workplace the brain can think in',
    dek: 'We design offices for many things — cost, density, the look of collaboration — and rarely for the one thing they are for: thinking.',
    kind: 'essay',
    topic: 'The workplace',
    date: '2026-02-10',
    readingTime: '9 min',
    cover: '/covers/essay-scan.svg',
    lqip: 'linear-gradient(135deg, oklch(0.76 0.07 215), oklch(0.46 0.1 228))',
    body: [
      { kind: 'p', text: 'Ask what an office is for and most answers are about people being together. Fair enough. But a great deal of what happens at work has nothing to do with collaboration. It is one person, thinking hard, trying to hold a problem in their head long enough to solve it. We design for the first thing and quietly punish the second.' },
      { kind: 'p', text: 'The open plan is the clearest example. It optimises for visible activity and easy interruption, both of which feel like productivity and neither of which is the same as thinking. A space that is good for a brain doing hard work looks different: it gives people somewhere to go quiet, somewhere to be loud, and the freedom to choose between them as the work demands.' },
      { kind: 'h2', text: 'Hybrid did not settle this' },
      { kind: 'p', text: 'Working from home solved the interruption problem for some people and created a connection problem for others. The lesson had nothing to do with which location wins. Focus and collaboration are different modes with different needs, and a workplace that pretends otherwise will serve neither well.' },
      { kind: 'quote', text: 'The best test of a workspace is simple: can someone do their hardest thinking here? Most fail it.' },
      { kind: 'p', text: 'None of this requires a grand redesign. It requires taking the thinking seriously as a thing that needs conditions, and then protecting those conditions with the same care we give to the parts of work that are easier to see.' },
    ],
  },
  {
    slug: 'what-flow-actually-asks-of-you',
    title: 'What flow actually asks of you',
    dek: 'Flow is sold as a productivity hack. It is closer to a negotiation, and it has terms.',
    kind: 'note',
    topic: 'Flow',
    date: '2026-01-18',
    readingTime: '5 min',
    cover: '/covers/essay-memory.svg',
    lqip: 'linear-gradient(135deg, oklch(0.68 0.1 305), oklch(0.42 0.14 298))',
    body: [
      { kind: 'p', text: 'Flow has been flattened into a productivity word, something you switch on with a playlist and a cleared morning. The real thing is more particular, and more demanding.' },
      { kind: 'p', text: 'It tends to arrive when three conditions hold at once: a goal clear enough that you always know the next move, feedback quick enough that you can adjust without waiting, and a challenge pitched just past your current skill. Too easy and you drift. Too hard and you stall. The window is narrow, which is why flow feels rare rather than routine.' },
      { kind: 'p', text: 'The part the hacks leave out is the cost of entry. Flow needs an uninterrupted run at the problem, and uninterrupted runs are exactly what modern work is worst at providing. You cannot buy your way in with a technique. You have to clear the conditions and then earn the state by staying with something long enough for it to take hold.' },
    ],
  },
  {
    slug: 'how-a-good-decision-feels',
    title: 'How a good decision feels',
    dek: 'Confidence and accuracy are not the same signal. Mistaking one for the other is how careful people get it wrong.',
    kind: 'essay',
    topic: 'Decision-making',
    date: '2025-12-05',
    readingTime: '6 min',
    cover: '/covers/essay-certainty.svg',
    lqip: 'linear-gradient(135deg, oklch(0.72 0.09 282), oklch(0.46 0.13 280))',
    body: [
      { kind: 'p', text: 'We treat the feeling of being sure as evidence that we are right. It is not. Confidence and accuracy are produced by different machinery in the brain, and they come apart more often than is comfortable to admit.' },
      { kind: 'p', text: 'The work on metacognition — the mind watching its own judgement — keeps finding the same gap. People can be entirely certain and entirely wrong, and the certainty offers no warning. Worse, the feeling of fluency, of a decision coming easily, reads to us as a sign of quality when it is often just a sign of familiarity.' },
      { kind: 'quote', text: 'The strongest feeling of certainty and the worst decision can sit side by side, and from the inside they feel identical.' },
      { kind: 'p', text: 'None of this calls for second-guessing everything. The useful habit is to treat the feeling of certainty as one input rather than the verdict: ask what would have to be true for you to be wrong, and notice whether you can answer. A good decision does not always feel certain. Often it just feels examined.' },
    ],
  },
]

/* ─────────────────────────────── About ────────────────────────────── */

export const about = {
  eyebrow: 'About',
  lead: 'I am a Cognitive Neuroscientist. I study how people think at their best, and what gets in the way.',
  paragraphs: [
    'I spent the first part of my career in psychology and neuroscience — a first-class degree in cognitive psychology, then a master’s in cognition and neuroscience, then research posts spanning health and wellbeing, digital addiction, the overlap between AI and the way real neural networks learn, and the conditions for flow and individual performance. About a decade in the science of the mind, all told.',
    'Then a question started to nag. We spend a third of our lives, often more, at work, and most of that work is now done inside cognitively demanding environments that nobody designed with a brain in mind. The science I cared about was sitting in journals while the place it could help most was running on guesswork. So I moved it.',
    'For the last few years I have been at AWA doing exactly that: building the tools, programmes and research that bring brain science into the working day. My work runs across three layers — the individual, the team and its culture, and the workplace itself — and one interest sits underneath all of it. I care about performance, but even more about the experience of work: people who are motivated, well, and able to do their sharpest thinking.',
    'I also write and speak, because I think the science is too useful to leave where only specialists can reach it. Most of what I publish is an attempt to take something true about the mind and make it useful out loud.',
  ],
  facts: [
    { label: 'Role', value: 'Cognitive Neuroscientist, AWA' },
    { label: 'Background', value: 'BSc Cognitive Psychology · MSc Cognition & Neuroscience' },
    { label: 'Focus', value: 'Attention, flow, cognitive wellbeing, performance' },
    { label: 'Based in', value: 'London' },
  ],
  // A quiet footnote acknowledging the official title.
  titleNote:
    'My official title at AWA is Neuroscience Associate; Cognitive Neuroscientist is the truer description of the work.',
} as const

/* ────────────────────────────── Contact ───────────────────────────── */

export const contact = {
  heading: 'Good questions about the mind are always welcome.',
  body: 'I am happy to hear from organisations curious about how their people think, collaborators, journalists, and anyone with a question that has been nagging at them. I read everything, and I reply to most of it.',
  primaryCta: { label: 'Email me', href: `mailto:${profile.email}` },
} as const

// Only real, live links — Email and LinkedIn here (footer/contact/about).
// The hero row carries the full live set (LinkedIn/X/Substack/YouTube/Instagram,
// wired 2026-06-15 via heroSocials above). Scholar/Bluesky dropped per the brief.
export type SocialLink = {
  label: string
  href: string
  icon: 'mail' | 'linkedin'
}

export const socials: readonly SocialLink[] = [
  { label: 'Email', href: links.email, icon: 'mail' },
  { label: 'LinkedIn', href: links.linkedin, icon: 'linkedin' },
]
