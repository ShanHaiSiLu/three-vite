import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: "/src/index.html",
  },
  build: {
    rollupOptions: {
      input: "/src/index.html",
    },
  },
});
