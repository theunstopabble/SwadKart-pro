import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      devOptions: {
        enabled: true,
      },
      // ✅ Fix: Workbox settings to ignore API and Socket calls
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        navigateFallbackDenylist: [/^\/api/, /^\/socket.io/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkOnly", // API caching block
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/socket.io"),
            handler: "NetworkOnly", // Socket caching block
          },
        ],
      },
      manifest: {
        name: "SwadKart - Food Delivery",
        short_name: "SwadKart",
        description: "Order delicious food online with SwadKart",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000", // 👈 Make sure port matches your backend (8000)
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:8000",
        ws: true, // Enable WebSocket proxy
      },
    },
  },
});
