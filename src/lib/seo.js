export const siteConfig = {
  name: "Furkan Cosar",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://furkancosar-portfolio.vercel.app",
  title: "Furkan Cosar | Frontend Developer",
  description:
    "Frontend developer portfolio of Furkan Cosar, focused on responsive websites, modern interfaces, GSAP motion, React, Next.js and polished digital experiences.",
  email: "furkancasar2005@gmail.com",
  creator: "Furkan Cosar",
  ogImage: "/project-screenshots/My-Portfolio-Next.png",
};

export const baseKeywords = [
  "Furkan Cosar",
  "Furkan Cosar portfolio",
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
