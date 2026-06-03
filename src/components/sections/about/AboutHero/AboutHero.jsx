import Hero from "@/components/ui/Hero/Hero";
import { projectCount } from "@/data/projects";

export default function AboutHero() {
  return (
    <Hero
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
        "I'm Furkan Cosar, a frontend developer focused on creating responsive,",
        "animated and user-friendly web interfaces with React, Next.js, GSAP",
        "and Tailwind CSS. I build clean digital experiences where design,",
        "performance and interaction details work together.",
      ]}
      action={{
        href: "/cv/furkan-cosar-cv.pdf",
        id: "about-hero-cv",
        label: "CHECK MY CV",
        rel: "noreferrer",
        target: "_blank",
      }}
    />
  );
}
