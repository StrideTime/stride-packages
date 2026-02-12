import { defineConfig } from "vite";
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
          src: "src/assets/*",
          dest: "assets",
        },
        {
          src: "src/assets/branding/svg/*",
          dest: "assets/branding/svg",
        },
        {
          src: "src/assets/branding/png/*",
          dest: "assets/branding/png",
        },
      ],
    }),
    dts({
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.json",
    }),
  ],
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
        "@mui/material",
        "@mui/system",
        "@mui/styled-engine",
        "@emotion/react",
        "@emotion/cache",
        "@emotion/styled",
      ],
    },
    sourcemap: true,
    minify: "esbuild",
  },
});
