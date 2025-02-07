import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Export the configuration
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  resolve: {
    alias: {
      // Set up the @ alias to point to the src directory
      "@": path.resolve(path.dirname(new URL(import.meta.url).pathname), "./src"),
    },
  },
});
