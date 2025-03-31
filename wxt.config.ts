import { defineConfig, defineWebExtConfig } from "wxt";
import vueJsx from "@vitejs/plugin-vue-jsx";
import customStrToUtf8 from "./src/scripts/vite-plugin-to-utf8";
import { visualizer } from "rollup-plugin-visualizer";
// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  imports: false, // disable auto-import
  srcDir: "src",
  zip: {
    name: "house-price-ext",
  },
  manifest: {
    name: "真实房价助手",
    description:
      "帮助您方便地收集关注范围内的小区/房源状态(链家平台), 记录价格/状态变动数据, 并分析和展示历史数据",
    icons: {
      16: "/icon/16.png",
      24: "/icon/24.png",
      48: "/icon/48.png",
      96: "/icon/96.png",
      128: "/icon/128.png",
    },
    // "web_accessible_resources": [
    // 	"/*.html"
    // ],
    permissions: [
      "storage",
      "declarativeNetRequestWithHostAccess",
      "declarativeNetRequest", //申请这个权限才能在dynamic rule中block发送到不同网站的资源, 否则只能block domain自身的
      // 'activeTab',
      // "webRequest",
      // "webNavigation",
    ],
    // action:{},
  },

  // @ts-ignore
  vite: (configEnv) => ({
    plugins: [
      // customStrToUtf8(),
      // vueJsx(),
      // visualizer({
      //   open: true, // 构建完成后自动打开浏览器显示分析图表
      //   filename: "stats.html", // 生成的分析文件名称
      //   gzipSize: true, // 显示 gzip 压缩后的大小
      //   brotliSize: true, // 显示 brotli 压缩后的大小
      // }),
    ],
    // assetsInclude: ["**/node_modules/@subframe7536/sqlite-wasm/dist/*.wasm"],
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },
    build: {
      rollupOptions: {
        external: (id) => {
          return (
            configEnv.mode === "production" &&
            (id.includes("components/debug/data") || id.includes("overlay"))
          );
        },
      },
    },
  }),
});
