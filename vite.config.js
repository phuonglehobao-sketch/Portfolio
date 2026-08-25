import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const pageEntry = (path) => fileURLToPath(
  new URL(path, import.meta.url)
)

export default defineConfig({
  assetsInclude: ['**/*.glb'],
  base: '/Portfolio/',
  build: {
    rollupOptions: {
      input: {
        home: pageEntry('./index.html'),
        about: pageEntry('./about/index.html'),
        work: pageEntry('./work/index.html'),
        yasmun: pageEntry('./work/yasmun/index.html'),
        handHeart: pageEntry('./work/hand-heart/index.html'),
        traDaMentor: pageEntry('./work/tra-da-mentor/index.html')
      }
    }
  }
})