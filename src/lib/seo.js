import { basePath, localizedPath, routeLocale } from "./localizedRoutes";

export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.furkancosar.com").origin;
export const SITE_IMAGE_PATH = "/social/og-home.png";
export const SITE_IMAGE_WIDTH = 1732;
export const SITE_IMAGE_HEIGHT = 908;
export const SITE_LAST_MODIFIED = "2026-11-14";
export const siteConfig = {
  name: "Furkan Cosar", displayName: "Furkan Coşar", brand: "FURKANCOSAR", url: SITE_URL,
  title: "Furkan Cosar | Frontend Developer",
  description: "Furkan Cosar's frontend portfolio: responsive websites, React and Next.js interfaces, GSAP animation and selected projects.",
  email: "furkancosar2005@gmail.com", creator: "Furkan Cosar",
  ogImage: SITE_IMAGE_PATH, githubProfile: "https://github.com/Luchhass",
};
export const nameVariants = ["Furkan Cosar", "Furkan Coşar", "FURKANCOSAR", "furkancosar"];
export const baseKeywords = [...nameVariants, "frontend developer", "frontend portfolio", "React developer", "Next.js developer", "GSAP", "responsive web design", "Istanbul frontend developer"];
export const SEO_KEYWORDS = baseKeywords;
export const siteRoutes = [
  { key: "home", path: "/", priority: 1, changeFrequency: "monthly" },
  { key: "about", path: "/about", priority: .9, changeFrequency: "monthly" },
  { key: "projects", path: "/projects", priority: .9, changeFrequency: "weekly" },
  { key: "contact", path: "/contact", priority: .7, changeFrequency: "yearly" },
];
export const ROUTE_SEO = {
  home: {
    en: { title: "Furkan Cosar | Frontend Developer", description: siteConfig.description },
    tr: { title: "Furkan Coşar | Frontend Geliştirici", description: "Furkan Coşar'ın frontend portfolyosu: duyarlı web siteleri, React ve Next.js arayüzleri, GSAP animasyonları ve seçili projeler." },
  },
  about: {
    en: { title: "About Furkan Cosar | Frontend Developer", description: "Meet Furkan Cosar, a frontend developer in Istanbul. Explore his journey from Arduino to React and Next.js, practical experience and development toolkit." },
    tr: { title: "Furkan Coşar Hakkında | Frontend Geliştirici", description: "İstanbul'da frontend geliştiren Furkan Coşar'ı tanı. Arduino'dan React ve Next.js'e uzanan yolculuğunu, deneyimlerini ve kullandığı araçları keşfet." },
  },
  projects: {
    en: { title: "Frontend Projects | Furkan Cosar", description: "Explore Furkan Cosar's frontend projects: responsive websites, dashboards, e-commerce interfaces, web games and React and Next.js applications." },
    tr: { title: "Frontend Projeleri | Furkan Coşar", description: "Furkan Coşar'ın duyarlı web sitelerini, kontrol panellerini, e-ticaret arayüzlerini, web oyunlarını, React ve Next.js projelerini incele." },
  },
  contact: {
    en: { title: "Contact Furkan Cosar | Frontend Projects", description: "Get in touch with Furkan Cosar about a website, React or Next.js interface, responsive frontend development or a GSAP animation project." },
    tr: { title: "Furkan Coşar ile İletişim | Frontend Projeleri", description: "Web sitesi, React veya Next.js arayüzü, duyarlı frontend geliştirme ya da GSAP animasyon projen için Furkan Coşar ile iletişime geç." },
  },
};
export function absoluteUrl(path = "/") { return new URL(path, SITE_URL).toString(); }
export const SITE_IMAGE_URL = absoluteUrl(SITE_IMAGE_PATH);
export function routeKey(pathname) { return siteRoutes.find(route => route.path === basePath(pathname))?.key || "home"; }
export function createPageMetadata(route = "home", options = {}) {
  const locale = options.locale === "tr" ? "tr" : "en";
  const definition = siteRoutes.find(item => item.key === route);
  if (!definition) throw new Error(`Unknown SEO route: ${route}`);
  const seo = ROUTE_SEO[route][locale];
  const url = absoluteUrl(localizedPath(definition.path, locale));
  const images = route === "home" ? [{
    url: SITE_IMAGE_URL, width: SITE_IMAGE_WIDTH, height: SITE_IMAGE_HEIGHT,
    alt: "Furkan Frontend Developer", type: "image/png",
  }] : [];
  return {
    title: { absolute: seo.title }, description: seo.description,
    keywords: [...baseKeywords, ...(locale === "tr" ? ["frontend geliştirici", "web tasarım", "İstanbul", "arayüz geliştirme"] : [])],
    alternates: { canonical: url, languages: {
      en: absoluteUrl(definition.path), tr: absoluteUrl(localizedPath(definition.path, "tr")), "x-default": absoluteUrl(definition.path),
    } },
    openGraph: { title: seo.title, description: seo.description, url, siteName: siteConfig.brand,
      locale: locale === "tr" ? "tr_TR" : "en_US", alternateLocale: [locale === "tr" ? "en_US" : "tr_TR"], type: "website", images },
    twitter: { card: images.length ? "summary_large_image" : "summary", title: seo.title,
      description: seo.description, creator: "@luchhass", images: images.map(image => image.url) },
    robots: options.robots || { index: true, follow: true, "max-image-preview": "large",
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}
export function createJsonLd(route, locale = "en") {
  if (!route) return {
    "@context": "https://schema.org", "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: siteConfig.brand,
        alternateName: nameVariants, url: absoluteUrl(), description: siteConfig.description,
        inLanguage: ["en", "tr"], publisher: { "@id": `${SITE_URL}/#person` } },
      { "@type": "Person", "@id": `${SITE_URL}/#person`, name: siteConfig.displayName,
        alternateName: nameVariants, givenName: "Furkan", familyName: "Coşar", url: absoluteUrl(),
        email: `mailto:${siteConfig.email}`, jobTitle: "Frontend Developer",
        sameAs: [siteConfig.githubProfile],
        knowsAbout: ["Frontend Development", "React", "Next.js", "JavaScript", "GSAP", "Responsive Web Design"] },
    ],
  };
  const definition = siteRoutes.find(item => item.key === route);
  const seo = ROUTE_SEO[route][locale];
  const url = absoluteUrl(localizedPath(definition.path, locale));
  const type = { home: "WebPage", about: "AboutPage", projects: "CollectionPage", contact: "ContactPage" }[route];
  const page = { "@type": type, "@id": `${url}#webpage`, url, name: seo.title, description: seo.description,
    inLanguage: locale, dateModified: SITE_LAST_MODIFIED, isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` }, mainEntity: { "@id": `${SITE_URL}/#person` } };
  if (route === "home") page.primaryImageOfPage = { "@type": "ImageObject", url: SITE_IMAGE_URL, width: SITE_IMAGE_WIDTH, height: SITE_IMAGE_HEIGHT };
  else page.breadcrumb = { "@id": `${url}#breadcrumb` };
  const graph = [page];
  if (route !== "home") graph.push({
    "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "tr" ? "Ana Sayfa" : "Home", item: absoluteUrl(localizedPath("/", locale)) },
      { "@type": "ListItem", position: 2, name: seo.title.split(" | ")[0], item: url },
    ],
  });
  return { "@context": "https://schema.org", "@graph": graph };
}
export function metadataForPath(pathname) { return createPageMetadata(routeKey(pathname), { locale: routeLocale(pathname) }); }
