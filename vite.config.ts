import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
// import { CssSyntaxError } from 'postcss'
import { chromeExtension } from "vite-plugin-chrome-extension";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  console.log({ command, mode })
  if (command == "serve") {
      // development
  }

  return {
    resolve: {
      alias: {
        "@": resolve(__dirname, "src")
      }
    },
    server: {
      host: "127.0.0.1",
      port: 8080,
    },
    plugins: [vue(), chromeExtension()],
    build: {
      rollupOptions: {
        input: "src/manifest.json"
      },
    }
  }
})
