import HomeHero from "@/components/sections/Home/HomeHero/HomeHero";
import MarqueeText from "@/components/ui/MarqueeText/MarqueeText";
import ScrollMarqueeText from "@/components/ui/ScrollMarqueeText/ScrollMarqueeText";
import AboutMeAccordion from "@/components/sections/Home/AboutMeAccordion/AboutMeAccordion";
import ProjectsHighlights from "@/components/sections/Home/ProjectsHighlights/ProjectsHighlights";
import CollaborationCTA from "@/components/ui/CollaborationCTA/CollaborationCTA";
import IdentityBand from "@/components/ui/IdentityBand/IdentityBand";
import { createPageMetadata, siteConfig } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: siteConfig.title,
  description:
    "Explore Furkan Cosar's official FURKANCOSAR frontend developer portfolio, also searchable as Furkan Coşar, featuring responsive interfaces, selected projects, React, Next.js and GSAP work.",
  path: "/",
  keywords: [
    "Furkan",
    "Furkan Coşar",
    "Furkan Cosar",
    "furkancosar",
    "furkancoşar",
    "Furkan Cosar frontend developer",
    "Furkan Coşar frontend developer",
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
      <CollaborationCTA />
      <IdentityBand />
    </main>
  );
}
