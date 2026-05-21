import AboutHero from "@/components/sections/about/AboutHero/AboutHero";
import AboutMeIntro from "@/components/sections/about/AboutMeIntro/AboutMeIntro";
import MarqueeText from "@/components/ui/MarqueeText/MarqueeText";
import ScrollMarqueeText from "@/components/ui/ScrollMarqueeText/ScrollMarqueeText";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Furkan Cosar | About",
  description:
    "Learn about Furkan Cosar, a frontend developer focused on clean UI, responsive websites, creative motion, React, Next.js, GSAP and real project experience.",
  path: "/about",
  keywords: [
    "about Furkan Cosar",
    "frontend developer about",
    "React Next.js GSAP developer",
    "frontend experience",
  ],
});

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <MarqueeText text="FURKAN COSAR" duration="50s" />
      <ScrollMarqueeText text="FRONTEND DEV" />
      <AboutMeIntro />
    </main>
  );
}
