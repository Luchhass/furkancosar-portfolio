"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { pageSeoForPath } from "@/lib/seo";
import { basePath } from "@/lib/localizedRoutes";

// History-based language switches preserve forms. Keep their head tags in sync too.
export default function RouteSeoSync() {
  const pathname = usePathname();
  const seo = pageSeoForPath(pathname);
  const previousPath = useRef(pathname);
  useEffect(() => {
    const before = previousPath.current;
    previousPath.current = pathname;
    // Next owns head elements during route navigation. Only update attributes
    // for the shallow EN/TR URL change, which does not request new metadata.
    if (!seo || before === pathname || basePath(before) !== basePath(pathname)) return;
    const { metadata } = seo;
    document.title = metadata.title;
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
    meta("name", "twitter:image:alt", image?.alt);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = metadata.alternates.canonical;
    for (const [language, href] of Object.entries(metadata.alternates.languages)) {
      const link = document.head.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
      if (link) link.href = href;
    }
  }, [pathname, seo]);
  return seo && <script data-route-jsonld type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd).replace(/</g, "\\u003c") }} />;
}
