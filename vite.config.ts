import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Plotly is lazy-loaded in its own ~4.6 MB chunk; that is expected.
  build: { chunkSizeWarningLimit: 5000 },
})
