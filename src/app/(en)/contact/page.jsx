import ContactHero from "@/components/sections/contact/ContactHero/ContactHero";
import MarqueeText from "@/components/ui/MarqueeText/MarqueeText";
import ContactForm from "@/components/sections/contact/ContactForm/ContactForm";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("contact");

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <MarqueeText text="LET'S TALK" duration="50s" />
      <ContactForm />
    </main>
  );
}
