import { absoluteUrl, isIndexable, languageAlternates, SEO_LOCALES, siteRoutes } from "@/lib/seo";
import { localizedPath } from "@/lib/localizedRoutes";

export default function sitemap() {
  if (!isIndexable) return [];
  return siteRoutes.flatMap(route => SEO_LOCALES.map(locale => ({
    url: absoluteUrl(localizedPath(route.path, locale)),
    alternates: { languages: languageAlternates(route.path) },
  })));
}
