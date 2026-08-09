import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
export default defineConfig({
  // Your custom configuration
  plugins: [
    viteSingleFile()
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      input: 'index.html',
    },
  },
})