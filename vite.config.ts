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
    return {
      // resolve: {
      //   alias: {
      //     "@": resolve(__dirname, "src")
      //   }
      // },
      server: {
        host: "127.0.0.1",
        port: 8080,
      },
      // plugins: [vue(), chromeExtension()],
      plugins: [vue()], // dev
      build: {
        rollupOptions: {
          // input: "src/manifest.json"
          // input: {
          //   index: "src/popup.html", //dev
          // }
        },
        cssCodeSplit: false,
        chunkSizeWarningLimit: 5000,
        // 暂时不扰乱调试
        minify: false,
      }
    }
  } else {
    // 正式环境 build到dist, html用 src/popup.html
    return {
      resolve: {
        alias: {
          "@": resolve(__dirname, "src")
        }
      },
      plugins: [vue(), chromeExtension()],
      // plugins: [vue()], // dev
      build: {
        rollupOptions: {
          input: "src/manifest.json"
        },
        cssCodeSplit: false,
        chunkSizeWarningLimit: 5000,
        minify: true,
      }
    }
  }
})
