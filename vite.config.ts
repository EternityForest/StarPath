import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base:"/StarPath/",
  resolve: {
    alias: [
      {
        find: /circular-natal-horoscope-js/,
        replacement: './node_modules/circular-natal-horoscope-js/dist/index.js',
      },
    ],
  },
})
