export const siteConfig = {
  name: "Furkan Cosar",
  displayName: "Furkan Coşar",
  brand: "FURKANCOSAR",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.furkancosar.com",
  title: "Furkan Cosar | FURKANCOSAR Frontend Developer",
  description:
    "Frontend developer portfolio of Furkan Cosar, also styled Furkan Coşar and FURKANCOSAR, focused on responsive websites, React, Next.js, GSAP motion and polished interfaces.",
  email: "furkancosar2005@gmail.com",
  creator: "Furkan Cosar",
  ogImage: "/og/furkancosar-portfolio-preview-2026-v4.png",
  githubProfile: "https://github.com/Luchhass",
};

export const nameVariants = [
  "Furkan",
  "Furkan Cosar",
  "Furkan Coşar",
  "Furkan cosar",
  "Furkan coşar",
  "furkancosar",
  "furkancoşar",
  "FURKANCOSAR",
  "FurkanCosar",
  "FurkanCoşar",
];

export const baseKeywords = [
  ...nameVariants,
  "Furkancosar",
  "Furkan Cosar official website",
  "Furkan Coşar official website",
  "Furkan Cosar portfolio",
  "Furkan Coşar portfolio",
  "frontend developer",
  "frontend portfolio",
  "React developer",
  "Next.js developer",
  "GSAP developer",
  "web developer",
  "responsive web design",
  "creative frontend developer",
  "JavaScript developer",
  "Tailwind CSS",
  "portfolio website",
  "Istanbul frontend developer",
];

export const siteRoutes = [
  {
    path: "/",
    priority: 1,
    changeFrequency: "monthly",
  },
  {
    path: "/about",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "/projects",
    priority: 0.9,
    changeFrequency: "weekly",
  },
  {
    path: "/contact",
    priority: 0.7,
    changeFrequency: "yearly",
  },
];

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
}) {
  const mergedKeywords = Array.from(new Set([...baseKeywords, ...keywords]));

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: `${siteConfig.name} frontend developer portfolio preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@luchhass",
      images: [siteConfig.ogImage],
    },
  };
}
