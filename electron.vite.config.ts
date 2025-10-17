import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        "@utils": resolve('src/renderer/src/utils')
      }
    },
    plugins: [vue()],
    server: {
      proxy: {
        "api": {
          target: "http://localhost:6060",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  }
})
