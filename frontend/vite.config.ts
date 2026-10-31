import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite proxies /api to the local FastAPI server so the frontend never calls
// a third-party service and no backend URL is baked into the code.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
  },
});