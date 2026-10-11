import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the build works from any URL, e.g. a GitHub Pages
  // project site at /workout-tracker/.
  base: './',
  plugins: [react()],
})
