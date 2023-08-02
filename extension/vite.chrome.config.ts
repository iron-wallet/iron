import path from "node:path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const fetchVersion = () => {
  return {
    name: "html-transform",
    transformIndexHtml(html: string) {
      return html.replace(
        /__APP_VERSION__/,
        `v${process.env.npm_package_version}`
      );
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    fetchVersion(),
    nodePolyfills({
      exclude: ["fs"],
    }),
  ],
  build: {
    emptyOutDir: false,
    outDir: path.resolve(__dirname, "dist"),
    lib: {
      formats: ["iife"],
      entry: path.resolve(__dirname, "background", "index.ts"),
      name: "Cat Facts",
    },
    rollupOptions: {
      output: {
        entryFileNames: "background/background.js",
        extend: true,
      },
    },
  },
});
