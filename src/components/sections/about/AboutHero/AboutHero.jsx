"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import Hero from "@/components/ui/Hero/Hero";
import { projectCount } from "@/data/projects";

export default function AboutHero() {
  const localize = useLocalizedContent();
  return (
    localize(<Hero
      titleLines={[
        { text: "THE MIND" },
        { text: "BEHIND" },
        { text: "THE INTERFACE", gradient: true },
      ]}
      stat={{
        value: String(projectCount),
        labelLines: ["completed projects", "with modern interfaces"],
        ariaLabel: `${projectCount} completed projects with modern interfaces`,
      }}
      copyLines={[
        "I'm a frontend developer focused on clear interfaces and thoughtful interaction.",
        "I combine design, code and motion to make digital experiences feel natural.",
      ]}
      action={{
        href: "/cv/furkan-cosar-cv.pdf",
        id: "about-hero-cv",
        label: "CHECK MY CV",
        rel: "noreferrer",
        target: "_blank",
      }}
    />)
  );
}
