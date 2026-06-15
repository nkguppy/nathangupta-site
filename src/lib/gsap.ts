import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

// All GSAP plugins are free as of 3.13. Register once.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  if (import.meta.env.DEV) {
    Object.assign(window as unknown as Record<string, unknown>, { gsap, ScrollTrigger })
  }
}

export { gsap, ScrollTrigger, SplitText }
