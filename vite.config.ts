import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Name the vendor chunks honestly instead of letting Rollup attribute
        // GSAP/Lenis to whichever first-party module happened to pull them in
        // (they were riding a chunk named after usePageMeta). Stable names +
        // the immutable cache header on /assets/* mean returning visitors skip
        // re-downloading unchanged vendor code. `three` is deliberately left out
        // so it stays in the async chunk created by SurfaceBrain's dynamic import.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/three')) return // keep lazy (WebGL brain only)
          if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id))
            return 'react'
          if (id.includes('/gsap')) return 'gsap'
          return 'vendor'
        },
      },
    },
  },
})
