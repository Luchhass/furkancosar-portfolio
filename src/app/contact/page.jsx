import ContactHero from "@/components/sections/contact/ContactHero/ContactHero";
import MarqueeText from "@/components/ui/MarqueeText/MarqueeText";
import ContactForm from "@/components/sections/contact/ContactForm/ContactForm";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Furkan Cosar | Contact",
  description:
    "Contact Furkan Cosar, also searchable as Furkan Coşar and FURKANCOSAR, for frontend development, responsive websites, React, Next.js and GSAP projects.",
  path: "/contact",
  keywords: [
    "contact Furkan Cosar",
    "contact Furkan Coşar",
    "contact FURKANCOSAR",
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
      <ContactForm />
    </main>
  );
}
