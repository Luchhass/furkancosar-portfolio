import { absoluteUrl, siteRoutes, SITE_LAST_MODIFIED, SITE_IMAGE_URL } from "@/lib/seo";
import { localizedPath } from "@/lib/localizedRoutes";

export default function sitemap() {
  return siteRoutes.flatMap(route => ["en", "tr"].map(locale => ({
    url: absoluteUrl(localizedPath(route.path, locale)),
    lastModified: new Date(SITE_LAST_MODIFIED),
    alternates: { languages: { en: absoluteUrl(route.path), tr: absoluteUrl(localizedPath(route.path, "tr")), "x-default": absoluteUrl(route.path) } },
    ...(route.key === "home" ? { images: [SITE_IMAGE_URL] } : {}),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  })));
}
