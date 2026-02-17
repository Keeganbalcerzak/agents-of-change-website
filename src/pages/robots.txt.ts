import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const fallbackSite = "https://www.agentsofchangeprep.com";
  const resolvedSite = site?.toString() || fallbackSite;

  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${new URL("sitemap-index.xml", resolvedSite).toString()}`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
