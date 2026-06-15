import { createBrowserRouter } from 'react-router-dom'
import { Shell } from '@/components/site/Shell'
import { Home } from '@/pages/Home'

// Home is eager — it's the landing and owns first paint (hero, background, the
// neural sphere). The secondary pages use react-router's route-level `lazy`, so
// each is its own chunk loaded on navigation; the router holds the transition
// until the chunk resolves rather than flashing a fallback.
export const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'work', lazy: async () => ({ Component: (await import('@/pages/WorkPage')).WorkPage }) },
      { path: 'writing', lazy: async () => ({ Component: (await import('@/pages/WritingPage')).WritingPage }) },
      {
        path: 'writing/:slug',
        lazy: async () => ({ Component: (await import('@/pages/WritingPostPage')).WritingPostPage }),
      },
      { path: 'about', lazy: async () => ({ Component: (await import('@/pages/AboutPage')).AboutPage }) },
      {
        path: '*',
        handle: { hideContact: true },
        lazy: async () => ({ Component: (await import('@/pages/NotFound')).NotFound }),
      },
    ],
  },
])
