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
        "Responsive, animated interfaces built with care.",
        "Clear design, smooth motion and a frontend that works on every screen.",
      ]}
      action={{
        href: "/contact",
        id: "home-hero-contact",
        label: "CONTACT ME",
      }}
    />)
  );
}
