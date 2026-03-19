import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://www.agentsofchangeprep.com",
  integrations: [react(), sitemap()],
  adapter: vercel({
    imageService: true,
  }),
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
    },
  },
});
