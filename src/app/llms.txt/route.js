import { absoluteUrl, isIndexable, ROUTE_SEO, SEO_LOCALES, SITE_REPOSITORY, siteRoutes } from "@/lib/seo";
import { localizedPath } from "@/lib/localizedRoutes";

export const dynamic = "force-static";

export function GET() {
  if (!isIndexable) return new Response(null, { status: 404 });

  const sections = SEO_LOCALES.map(locale => [
    locale === "en" ? "## English" : "## Türkçe",
    ...siteRoutes.map(({ key, path }) => {
      const { label, description } = ROUTE_SEO[key][locale];
      return `- [${label}](${absoluteUrl(localizedPath(path, locale))}): ${description}`;
    }),
  ].join("\n"));

  return new Response([
    "# Furkan Coşar",
    "> Frontend developer based in Istanbul, Türkiye. This bilingual portfolio covers responsive React and Next.js interfaces, GSAP motion and selected frontend concepts.",
    ...sections,
    `## Optional\n- [Portfolio source code](${SITE_REPOSITORY}): Next.js App Router, GSAP animation, canvas rendering and verification scripts.`,
    "",
  ].join("\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
