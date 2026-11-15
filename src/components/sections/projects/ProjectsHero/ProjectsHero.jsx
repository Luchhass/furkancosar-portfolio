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
        "A collection of interfaces shaped with clear structure and thoughtful interaction.",
        "Explore the ideas, details and decisions behind each project.",
      ]}
      action={{
        href: "/contact",
        id: "projects-hero-contact",
        label: "CONTACT ME",
      }}
    />)
  );
}
