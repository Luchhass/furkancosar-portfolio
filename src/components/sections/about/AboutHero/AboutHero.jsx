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
        "I turn ideas into clear and responsive interfaces.",
        "I bring design, code and motion together as I build.",
        "I refine each detail until the site feels natural.",
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
