import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import sassDts from "vite-plugin-sass-dts";

// For process.env.BROWSER
dotenv.config();

export default defineConfig({
  root: "src",
  server: {
    open: true,
    port: 7891,
    strictPort: true,
    proxy: {
      "/api/v1": {
        target: "http://localhost:7890",
        changeOrigin: true,
      },
    },
  },
  assetsInclude: ["**/*.obj"],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  plugins: [
    react(),
    sassDts(),
    compression({
      include: /\.(js|css|html|obj)$/i,
      algorithm: "gzip",
    }),
    compression({
      include: /\.(js|css|html|obj)$/i,
      algorithm: "brotliCompress",
    }),
  ],
});
