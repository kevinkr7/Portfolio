import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "dist",
  build: {
    outDir: ".studio-dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "studio.html",
    },
  },
});
