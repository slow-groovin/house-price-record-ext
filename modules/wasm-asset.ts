// modules/oxc-parser-wasm.ts
import { resolve } from "node:path";
import { defineWxtModule } from "wxt/modules";
export default defineWxtModule((wxt) => {
  wxt.hook("build:publicAssets", (_, assets) => {
    assets.push({
      absoluteSrc: resolve(
        "node_modules/@subframe7536/sqlite-wasm/dist/wa-sqlite-async.wasm"
      ),
      relativeDest: "wa-sqlite-async.wasm",
    });
  });
});
