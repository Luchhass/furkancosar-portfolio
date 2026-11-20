"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import Hero from "@/components/ui/Hero/Hero";
import { projectCount } from "@/data/projects";

export default function HomeHero() {
  const localize = useLocalizedContent();
  return (
    localize(<Hero
      titleLines={[
        { text: "CREATIVE" },
        { text: "FRONTEND" },
        { text: "DEVELOPER", gradient: true },
      ]}
      stat={{
        value: String(projectCount),
        labelLines: ["completed projects", "with modern interfaces"],
        ariaLabel: `${projectCount} completed projects with modern interfaces`,
      }}
      copyLines={[
        "I build web interfaces that feel clear and fast.",
        "I use motion to guide people through each screen.",
        "Every detail helps the site work on any device.",
      ]}
      action={{
        href: "/contact",
        id: "home-hero-contact",
        label: "CONTACT ME",
      }}
    />)
  );
}
