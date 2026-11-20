import AboutHero from "@/components/sections/about/AboutHero/AboutHero";
import MarqueeText from "@/components/ui/MarqueeText/MarqueeText";
import ScrollMarqueeText from "@/components/ui/ScrollMarqueeText/ScrollMarqueeText";
import AboutMeIntro from "@/components/sections/about/AboutMeIntro/AboutMeIntro";
import GitHubStats from "@/components/sections/about/GitHubStats/GitHubStats";
import TechStackAccordion from "@/components/sections/about/TechStackAccordion/TechStackAccordion";
import CollaborationCTA from "@/components/ui/CollaborationCTA/CollaborationCTA";
import { createPageMetadata } from "@/lib/seo";
import Journey from "@/components/sections/about/Journey";

export const metadata = createPageMetadata("about");

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <MarqueeText text="FURKAN COSAR" duration="50s" />
      <ScrollMarqueeText text="FRONTEND DEV" />
      <AboutMeIntro />
      <Journey />
      <GitHubStats />
      <TechStackAccordion />
      <CollaborationCTA />
    </main>
  );
}
