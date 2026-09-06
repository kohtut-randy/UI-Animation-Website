import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Tailwind v4 runs as a Vite plugin, not PostCSS. There is deliberately no
  // tailwind.config.js and no postcss.config.js: the whole theme lives in
  // src/styles/tokens.css behind `@theme`.
  plugins: [react(), tailwindcss()],

  // Vite 8 resolves `baseUrl`/`paths` from tsconfig natively, so absolute-from-src
  // imports ('app/App', 'motion/gsapClient') need no extra plugin.
  resolve: { tsconfigPaths: true },

  build: {
    // Slightly above the largest emitted chunk, so the warning stays meaningful
    // instead of firing on every build and being ignored.
    chunkSizeWarningLimit: 250,
    rollupOptions: {
      output: {
        /* Two vendor chunks, split by how often they change. React and GSAP are pinned
           and change only on a dependency bump, while the app code changes constantly,
           so splitting them means a content edit does not invalidate 250 kB of cached
           library code for returning visitors. Lenis is already its own chunk by virtue
           of being a dynamic import. */
        // Vite 8 is on rolldown, which takes manualChunks as a function only, not the
        // object form Vite 5 accepted.
        manualChunks: (id: string): string | undefined => {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          if (/[\\/]node_modules[\\/](gsap|@gsap)[\\/]/.test(id)) return 'gsap'
          return undefined
        },
      },
    },
  },
})
