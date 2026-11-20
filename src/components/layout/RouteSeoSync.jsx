"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { createJsonLd, metadataForPath, routeKey } from "@/lib/seo";
import { basePath } from "@/lib/localizedRoutes";

// History-based language switches preserve forms. Keep their head tags in sync too.
export default function RouteSeoSync() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const previousPath = useRef(pathname);
  useEffect(() => {
    const before = previousPath.current;
    previousPath.current = pathname;
    // Next owns head elements during route navigation. Only update attributes
    // for the shallow EN/TR URL change, which does not request new metadata.
    if (before === pathname || basePath(before) !== basePath(pathname)) return;
    const metadata = metadataForPath(pathname);
    document.title = metadata.title.absolute;
    const meta = (kind, name, content) => {
      const selector = `meta[${kind}="${name}"]`;
      if (content === undefined) return;
      document.head.querySelectorAll(selector).forEach(node => node.setAttribute("content", String(content)));
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
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = metadata.alternates.canonical;
    for (const [language, href] of Object.entries(metadata.alternates.languages)) {
      const link = document.head.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
      if (link) link.href = href;
    }
  }, [pathname]);
  return <script data-route-jsonld type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createJsonLd(routeKey(pathname), locale)).replace(/</g, "\\u003c") }} />;
}
