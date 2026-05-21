import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

const enableVisualizer = process.env.ANALYZE === "true";

export default defineConfig({
  plugins: [
    react(),
    enableVisualizer &&
      visualizer({
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
  ].filter(Boolean),
  server: {
    port: 5173,
  },
});
