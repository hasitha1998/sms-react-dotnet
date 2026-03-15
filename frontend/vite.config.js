import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173  // React runs on port 5173 by default
                // ASP.NET Core backend runs on port 5000
  }
})
