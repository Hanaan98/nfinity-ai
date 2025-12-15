import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Build optimization
  build: {
    target: "es2015",
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react", "@heroicons/react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // Development server config
  server: {
    port: 5174,
    strictPort: false,
    host: true,
    open: false,
  },

  // Preview server config
  preview: {
    port: 4174,
    strictPort: false,
    host: true,
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@services": "/src/services",
      "@auth": "/src/auth",
      "@hooks": "/src/hooks",
    },
  },
});
