import ContactHero from "@/components/sections/contact/ContactHero/ContactHero";
import MarqueeText from "@/components/ui/MarqueeText/MarqueeText";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Furkan Cosar | Contact",
  description:
    "Contact Furkan Cosar for frontend development, responsive websites, animated interfaces, React, Next.js, GSAP projects and polished web experiences.",
  path: "/contact",
  keywords: [
    "contact Furkan Cosar",
    "hire frontend developer",
    "frontend project inquiry",
    "React developer contact",
    "Next.js developer contact",
  ],
});

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <MarqueeText text="LET'S TALK" duration="50s" />
    </main>
  );
}