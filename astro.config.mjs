import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://www.agentsofchangeprep.com",
  integrations: [react(), sitemap()],
  adapter: vercel({
    imageService: true,
  }),
  vite: {
    server: {
      host: true,
    },
  },
});
