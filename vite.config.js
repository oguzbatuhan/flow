import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// On GitHub Pages the site is served under "https://user.github.io/repo-name/".
// The workflow (deploy.yml) passes the base path via VITE_BASE; locally "/" is used.
const base = process.env.VITE_BASE || "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    // Generates the manifest + service worker that enable Chrome's "Install app" option.
    VitePWA({
      registerType: "autoUpdate",
      workbox: { globPatterns: ["**/*.{js,css,html,woff2,png,svg}"] },
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        id: base,
        name: "Akış",
        short_name: "Akış",
        description: "Ders çalışma süreni ölç, günlere göre kaydet, Google Drive ile eşitle.",
        lang: "tr",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#f6f7f8",
        theme_color: "#0e7c86",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
