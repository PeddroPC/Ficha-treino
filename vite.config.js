import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Rolldown (Vite 8) exige manualChunks como função
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'vendor-recharts'
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router')
          ) {
            return 'vendor-react'
          }
        },
      },
    },
  },
})


