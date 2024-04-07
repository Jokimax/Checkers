import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "https://jokimax.github.io/Checkers/",
  plugins: [react()],
})
