import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(
        path.dirname(new URL(import.meta.url).pathname),
        "./src",
      ),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/scheduler")
          )
            return "react-vendor";

          if (
            id.includes("node_modules/react-router-dom") ||
            id.includes("node_modules/react-router")
          )
            return "router-vendor";

          if (id.includes("node_modules/framer-motion"))
            return "animation-vendor";

          if (id.includes("node_modules/@radix-ui")) return "radix-vendor";

          if (id.includes("node_modules/html2canvas"))
            return "html2canvas-vendor";

          if (
            id.includes("node_modules/@contentful/rich-text-react-renderer") ||
            id.includes("node_modules/@contentful/rich-text-types") ||
            id.includes("node_modules/@contentful")
          )
            return "contentful-vendor";

          if (id.includes("node_modules")) return "other-vendor";
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
