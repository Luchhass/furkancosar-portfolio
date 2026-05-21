import AboutMeAccordion from "@/components/sections/Home/AboutMeAccordion/AboutMeAccordion";
import HomeHero from "@/components/sections/Home/HomeHero/HomeHero";
import ProjectsHighlights from "@/components/sections/Home/ProjectsHighlights/ProjectsHighlights";
import MarqueeText from "@/components/ui/MarqueeText/MarqueeText";
import ScrollMarqueeText from "@/components/ui/ScrollMarqueeText/ScrollMarqueeText";
import { createPageMetadata, siteConfig } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: siteConfig.title,
  description:
    "Explore Furkan Cosar's frontend developer portfolio, featuring responsive interfaces, animated web experiences, selected projects and modern React, Next.js and GSAP work.",
  path: "/",
  keywords: [
    "Furkan Cosar frontend developer",
    "animated frontend portfolio",
    "modern web interfaces",
    "selected frontend projects",
  ],
});

export default function Home() {
  return (
    <main>
      <HomeHero />
      <MarqueeText text="Welcome" duration="50s" />
      <ScrollMarqueeText text="to my page" />
      <AboutMeAccordion />
      <ProjectsHighlights />
    </main>
  );
}
