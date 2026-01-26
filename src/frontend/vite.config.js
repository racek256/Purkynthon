
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: [
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/language',
      '@codemirror/commands',
      '@codemirror/autocomplete',
      '@codemirror/search',
      '@codemirror/lint',
      'codemirror',
    ],
  },
  server:{
	  allowedHosts:['dev.racek.qzz.io', 'localhost', 'dev.racek.qzz.io/login'],
    hmr: {
      host: 'dev.racek.qzz.io',
      protocol: 'wss',
      clientPort: 443,
    },
  }
})
