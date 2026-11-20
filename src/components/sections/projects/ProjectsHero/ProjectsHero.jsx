"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import Hero from "@/components/ui/Hero/Hero";
import { projectCount } from "@/data/projects";

export default function ProjectsHero() {
  const localize = useLocalizedContent();
  return (
    localize(<Hero
      detailVariant="projects"
      titleLines={[
        { text: "What I've" },
        { text: "Been" },
        { text: "Building", gradient: true },
      ]}
      stat={{
        value: String(projectCount),
        labelLines: ["completed projects", "with modern interfaces"],
        ariaLabel: `${projectCount} completed projects with modern interfaces`,
      }}
      copyLines={[
        "Browse a collection of interfaces built for real use.",
        "Each project explores a different layout or flow.",
        "See the ideas and choices that shaped the result.",
      ]}
      action={{
        href: "/contact",
        id: "projects-hero-contact",
        label: "CONTACT ME",
      }}
    />)
  );
}
