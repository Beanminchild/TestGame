import { defineConfig } from 'vite'

export default defineConfig({
  // Your custom configuration
  plugins: [
    /* your plugins */
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      input: 'src/main.ts',
    },
  },
})