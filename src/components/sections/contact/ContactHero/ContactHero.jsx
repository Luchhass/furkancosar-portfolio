"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import Hero from "@/components/ui/Hero/Hero";

export default function ContactHero() {
  const localize = useLocalizedContent();
  return (
    localize(<Hero
      titleLines={[
        { text: "Let's" },
        { text: "Shape Your" },
        { text: "Next Build", gradient: true },
      ]}
      copyLines={[
        "Have an idea or interface in mind? Let's shape it into a clear, polished experience.",
        "Tell me what you're building and let's find the right frontend path together.",
      ]}
      copyClassName="justify-self-center"
    />)
  );
}
