"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { createJsonLd, metadataForPath, routeKey } from "@/lib/seo";

// History-based language switches preserve forms. Keep their head tags in sync too.
export default function RouteSeoSync() {
  const pathname = usePathname();
  const { locale, setLanguage } = useLanguage();
  useEffect(() => {
    setLanguage(locale);
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    const metadata = metadataForPath(pathname);
    document.title = metadata.title.absolute;
    const meta = (kind, name, content) => {
      const selector = `meta[${kind}="${name}"]`;
      const existing = document.head.querySelectorAll(selector);
      if (content === undefined) { existing.forEach(node => node.remove()); return; }
      const node = existing[0] || document.head.appendChild(document.createElement("meta"));
      node.setAttribute(kind, name); node.setAttribute("content", String(content));
      [...existing].slice(1).forEach(duplicate => duplicate.remove());
    };
    meta("name", "description", metadata.description);
    for (const key of ["title", "description", "url", "locale", "siteName", "type"]) {
      meta("property", key === "siteName" ? "og:site_name" : `og:${key}`, metadata.openGraph[key]);
    }
    meta("property", "og:locale:alternate", metadata.openGraph.alternateLocale[0]);
    for (const key of ["card", "title", "description"]) meta("name", `twitter:${key}`, metadata.twitter[key]);
    const image = metadata.openGraph.images[0];
    for (const [suffix, field] of [["", "url"], [":width", "width"], [":height", "height"], [":alt", "alt"], [":type", "type"]]) meta("property", `og:image${suffix}`, image?.[field]);
    meta("name", "twitter:image", image?.url);
    const canonical = document.head.querySelector('link[rel="canonical"]') || document.head.appendChild(document.createElement("link"));
    canonical.rel = "canonical"; canonical.href = metadata.alternates.canonical;
    for (const [language, href] of Object.entries(metadata.alternates.languages)) {
      const link = document.head.querySelector(`link[rel="alternate"][hreflang="${language}"]`) || document.head.appendChild(document.createElement("link"));
      link.rel = "alternate"; link.hreflang = language; link.href = href;
    }
  }, [pathname, locale, setLanguage]);
  return <script data-route-jsonld type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createJsonLd(routeKey(pathname), locale)).replace(/</g, "\\u003c") }} />;
}
