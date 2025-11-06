import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ADD THIS 'define' SECTION
  define: {
    'global': {},
  },
  server: {
    host: '0.0.0.0',
    port: 8081,
  },
})