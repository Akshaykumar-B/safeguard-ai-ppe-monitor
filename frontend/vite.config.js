import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    // Disable PostCSS config file lookup (Tailwind is loaded via CDN)
    postcss: {
      plugins: [],
    },
  },
})
