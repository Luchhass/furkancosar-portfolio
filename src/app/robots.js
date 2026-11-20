import { absoluteUrl, isIndexable } from "@/lib/seo";

export default function robots() {
  return {
    rules: {
      userAgent: ["*", "Googlebot", "Bingbot", "OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"],
      allow: "/",
      disallow: "/api/",
    },
    sitemap: isIndexable ? absoluteUrl("/sitemap.xml") : undefined,
  };
}
