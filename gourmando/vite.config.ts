import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: '../assets/',
    rollupOptions: {
      output: {
        entryFileNames: `gourmando-[name].js`,
        chunkFileNames: `gourmando-[name].js`,
        assetFileNames: `gourmando-[name].[ext]`
      }
    }
  }
})
