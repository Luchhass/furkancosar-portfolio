import { siteConfig as identity } from "../data/site.js";
import { basePath, localizedPath, PAGE_PATHS, routeLocale } from "./localizedRoutes.js";

export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.furkancosar.com").origin;
export const isIndexable = process.env.VERCEL_ENV !== "preview" && process.env.SEO_NOINDEX !== "true";
export const SITE_REPOSITORY = "https://github.com/Luchhass/furkancosar-portfolio";
export const SOCIAL_SIZE = { width: 1200, height: 630 };
export const SEO_LOCALES = ["en", "tr"];
export const siteConfig = { ...identity, displayName: "Furkan Coşar", url: SITE_URL, githubProfile: "https://github.com/Luchhass" };

export const ROUTE_SEO = {
  home: {
    en: {
      title: "Furkan Cosar | Frontend Developer in Istanbul",
      description: "Furkan Coşar is a frontend developer in Istanbul building responsive React and Next.js interfaces with GSAP motion. Explore his portfolio and selected work.",
      label: "Home",
      imageHeading: ["Frontend", "Developer"],
      imageCaption: "React · Next.js · GSAP",
    },
    tr: {
      title: "Furkan Coşar | İstanbul'da Frontend Geliştirici",
      description: "Furkan Coşar, İstanbul'da React ve Next.js ile duyarlı arayüzler geliştiren ve GSAP ile animasyon tasarlayan bir frontend geliştirici. Portfolyosunu incele.",
      label: "Ana Sayfa",
      imageHeading: ["Frontend", "Geliştirici"],
      imageCaption: "React · Next.js · GSAP",
    },
  },
  about: {
    en: {
      title: "About Furkan Cosar | Frontend Experience & Toolkit",
      description: "Meet Furkan Coşar, a frontend developer based in Istanbul. Follow his path from Arduino to React and Next.js, see the tools he uses, and download his CV.",
      label: "About",
      imageHeading: ["About", "Furkan"],
      imageCaption: "Experience · Toolkit · CV",
    },
    tr: {
      title: "Furkan Coşar Hakkında | Frontend Deneyimi",
      description: "İstanbul'da yaşayan frontend geliştirici Furkan Coşar'ın Arduino'dan React ve Next.js'e uzanan yolculuğunu, kullandığı araçları ve özgeçmişini incele.",
      label: "Hakkımda",
      imageHeading: ["Furkan", "Hakkında"],
      imageCaption: "Deneyim · Araçlar · Özgeçmiş",
    },
  },
  projects: {
    en: {
      title: "Frontend Projects & Portfolio Case Study | Furkan Cosar",
      description: "Explore frontend interface concepts by Furkan Coşar and a source-backed case study on the Next.js, GSAP and canvas architecture behind this portfolio.",
      label: "Projects",
      imageHeading: ["Frontend", "Projects"],
      imageCaption: "Interface concepts · Portfolio case study",
    },
    tr: {
      title: "Frontend Projeleri ve Portfolyo İncelemesi | Furkan Coşar",
      description: "Furkan Coşar'ın arayüz konseptlerini ve bu portfolyonun Next.js, GSAP ve canvas mimarisine dair kaynak kodlu vaka çalışmasını incele.",
      label: "Projeler",
      imageHeading: ["Frontend", "Projeleri"],
      imageCaption: "Arayüz konseptleri · Portfolyo incelemesi",
    },
  },
  contact: {
    en: {
      title: "Contact Furkan Cosar | Frontend Development",
      description: "Contact Furkan Coşar about a React or Next.js website, a responsive interface or motion design for the web. Share your project brief using the contact form.",
      label: "Contact",
      imageHeading: ["Let's", "Talk"],
      imageCaption: "Frontend development · Web motion",
    },
    tr: {
      title: "Furkan Coşar ile İletişim | Frontend Geliştirme",
      description: "React veya Next.js web sitesi, duyarlı arayüz ve web animasyonu projelerin için Furkan Coşar ile iletişime geç. Projeni iletişim formuyla paylaş.",
      label: "İletişim",
      imageHeading: ["Birlikte", "Çalışalım"],
      imageCaption: "Frontend geliştirme · Web animasyonu",
    },
  },
};

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export const siteRoutes = PAGE_PATHS.map(path => ({ path, key: path === "/" ? "home" : path.slice(1) }));
const routesByKey = Object.fromEntries(siteRoutes.map(route => [route.key, route.path]));

export function languageAlternates(path) {
  return { en: absoluteUrl(path), tr: absoluteUrl(localizedPath(path, "tr")), "x-default": absoluteUrl(path) };
}

export function socialImage(route, locale) {
  return {
    url: absoluteUrl(`/brand/social/${locale}/${route}.jpg`),
    ...SOCIAL_SIZE,
    alt: `Furkan Coşar — ${ROUTE_SEO[route][locale].imageHeading.join(" ")}`,
    type: "image/jpeg",
  };
}

export function createPageMetadata(route, { locale = "en" } = {}) {
  const seo = ROUTE_SEO[route][locale];
  const path = routesByKey[route];
  const url = absoluteUrl(localizedPath(path, locale));
  const image = socialImage(route, locale);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website", title: seo.title, description: seo.description, url, siteName: siteConfig.name,
      locale: locale === "tr" ? "tr_TR" : "en_US",
      alternateLocale: [locale === "tr" ? "en_US" : "tr_TR"],
      images: [image],
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: [{ url: image.url, alt: image.alt }] },
    robots: isIndexable ? { index: true, follow: true, "max-image-preview": "large" } : { index: false, follow: false },
  };
}

const homeUrl = absoluteUrl();
const websiteId = `${homeUrl}#website`;
const personId = `${homeUrl}#person`;
const person = { "@id": personId };
const pageTypes = { home: "WebPage", about: "ProfilePage", projects: "CollectionPage", contact: "ContactPage" };

export function createJsonLd(route, locale) {
  const path = routesByKey[route];
  const { title, description, label } = ROUTE_SEO[route][locale];
  const url = absoluteUrl(localizedPath(path, locale));
  const { url: imageUrl, width, height, alt } = socialImage(route, locale);
  const page = {
    "@type": pageTypes[route], "@id": `${url}#webpage`, url, name: title, description, inLanguage: locale,
    isPartOf: { "@id": websiteId }, about: person, author: person,
    primaryImageOfPage: { "@type": "ImageObject", url: imageUrl, width, height, caption: alt },
  };
  const graph = [
    { "@type": "WebSite", "@id": websiteId, name: siteConfig.name, alternateName: [siteConfig.displayName, siteConfig.brand],
      url: homeUrl, inLanguage: SEO_LOCALES, publisher: person },
    { "@type": "Person", ...person, name: siteConfig.displayName, alternateName: siteConfig.name,
      url: homeUrl, jobTitle: "Frontend Developer", mainEntityOfPage: { "@id": `${absoluteUrl("/about")}#webpage` },
      sameAs: [siteConfig.githubProfile], knowsAbout: ["Frontend development", "JavaScript", "React", "Next.js", "GSAP", "Responsive web design"] },
    page,
  ];
  if (route === "home" || route === "about") page.mainEntity = person;
  if (route !== "home") {
    const breadcrumbId = `${url}#breadcrumb`;
    page.breadcrumb = { "@id": breadcrumbId };
    graph.push({
      "@type": "BreadcrumbList", "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: ROUTE_SEO.home[locale].label, item: absoluteUrl(localizedPath("/", locale)) },
        { "@type": "ListItem", position: 2, name: label, item: url },
      ],
    });
  }
  if (route === "projects") {
    const caseStudyUrl = `${url}#portfolio-case-study`;
    page.hasPart = { "@id": caseStudyUrl };
    graph.push({
      "@type": "SoftwareSourceCode", "@id": caseStudyUrl, url: caseStudyUrl,
      name: locale === "tr" ? "Furkan Coşar portfolyosu" : "Furkan Coşar portfolio",
      author: person, codeRepository: SITE_REPOSITORY, programmingLanguage: "JavaScript", runtimePlatform: "Next.js", inLanguage: locale,
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function pageSeoForPath(pathname) {
  if (!pathname) return null;
  const route = siteRoutes.find(({ path }) => path === basePath(pathname));
  if (!route) return null;
  const locale = routeLocale(pathname);
  return { metadata: createPageMetadata(route.key, { locale }), jsonLd: createJsonLd(route.key, locale) };
}
