import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: new RegExp("node_modules/(react|react-dom|react-router|react-router-dom|scheduler)/"), priority: 40 },
            { name: 'vendor-motion', test: new RegExp("node_modules/(motion|motion-dom|motion-utils|framer-motion)/"), priority: 30 },
            { name: 'vendor-query', test: new RegExp("node_modules/@tanstack/"), priority: 20 },
            { name: 'vendor-stripe', test: new RegExp("node_modules/@stripe/"), priority: 20 },
            { name: 'vendor-icons', test: new RegExp("node_modules/react-icons/"), priority: 20 },
          ],
        },
      },
    },
  },
  css: {
    postcss: false
  }
})
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
