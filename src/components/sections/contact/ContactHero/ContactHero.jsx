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
        "Tell me what you want to build and how far you are.",
        "We can talk through each screen and how it moves.",
        "Together we can turn your idea into a clear site.",
      ]}
      copyClassName="justify-self-center"
    />)
  );
}
