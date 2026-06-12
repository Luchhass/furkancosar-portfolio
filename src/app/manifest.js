import { siteConfig } from "@/lib/seo";

export default function manifest() {
  return {
    name: `${siteConfig.name} - Frontend Developer Portfolio`,
    short_name: siteConfig.brand,
    description: siteConfig.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait-primary",
    lang: "en",
    categories: ["portfolio", "business", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    screenshots: [
      {
        src: siteConfig.ogImage,
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: `${siteConfig.name} frontend developer portfolio preview`,
      },
    ],
  };
}
