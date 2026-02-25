import path from "path";
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    viteStaticCopy({
      targets: [
        {
          src: "src/assets",
          dest: ".",
        },
      ],
      structured: true,
    }),
    dts({
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.json",
    }) as PluginOption,
  ],
  resolve: {
    alias: {
      "@utils": path.resolve(__dirname, "src/utils"),
      "@primitives": path.resolve(__dirname, "src/primitives"),
    },
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "StrideUI",
      fileName: (format) => `index.${format === "es" ? "es" : "umd"}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
      ],
    },
    sourcemap: true,
    minify: "esbuild",
  },
});
