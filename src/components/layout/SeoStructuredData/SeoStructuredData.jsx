import { absoluteUrl, nameVariants, siteConfig } from "@/lib/seo";

function sanitizeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function SeoStructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteConfig.url}/#person`,
        name: siteConfig.name,
        alternateName: nameVariants,
        givenName: "Furkan",
        familyName: "Cosar",
        url: siteConfig.url,
        email: `mailto:${siteConfig.email}`,
        jobTitle: "Frontend Developer",
        image: absoluteUrl(siteConfig.ogImage),
        sameAs: [siteConfig.githubProfile],
        knowsAbout: [
          "Frontend Development",
          "React",
          "Next.js",
          "JavaScript",
          "GSAP",
          "Responsive Web Design",
          "User Interface Development",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        alternateName: [siteConfig.brand, ...nameVariants],
        description: siteConfig.description,
        inLanguage: "en",
        publisher: {
          "@id": `${siteConfig.url}/#person`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(graph) }}
    />
  );
}
