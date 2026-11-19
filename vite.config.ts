import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["signs/*.svg", "icons/*.png"],
      manifest: {
        name: "Oregon Permit Study",
        short_name: "OR Permit",
        description: "Unofficial study aid for the Oregon instruction permit knowledge test.",
        theme_color: "#0f4c3a",
        background_color: "#f6f3ea",
        display: "standalone",
        start_url: "./",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,json,webmanifest}"]
      }
    })
  ]
});
