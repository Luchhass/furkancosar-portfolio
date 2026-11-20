import { PRIMARY_COLOR } from "@/data/brand";
import { ROUTE_SEO, siteConfig } from "@/lib/seo";

export default function manifest() {
  return {
    name: `${siteConfig.name} - Frontend Developer Portfolio`,
    short_name: siteConfig.brand,
    description: ROUTE_SEO.home.en.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#141414",
    theme_color: PRIMARY_COLOR,
    lang: "en",
    categories: ["portfolio", "business"],
    icons: ["any", "maskable"].flatMap(purpose => [192, 512].map(size => ({
      src: `/brand/pwa/icon-${purpose}-${size}.png`, sizes: `${size}x${size}`, type: "image/png", purpose,
    }))),
    screenshots: [
      {
        src: "/brand/pwa/screenshot-wide.jpg",
        sizes: "1440x900",
        type: "image/jpeg",
        form_factor: "wide",
        label: "Portfolio homepage on desktop",
      },
      {
        src: "/brand/pwa/screenshot-narrow.jpg",
        sizes: "402x874",
        type: "image/jpeg",
        form_factor: "narrow",
        label: "Portfolio homepage on mobile",
      },
    ],
    shortcuts: [
      { name: "Projects", url: "/projects", description: "Explore frontend projects and the portfolio case study" },
      { name: "About", url: "/about", description: "Learn about Furkan Coşar’s experience and toolkit" },
      { name: "Contact", url: "/contact", description: "Get in touch about a frontend project" },
    ],
  };
}
