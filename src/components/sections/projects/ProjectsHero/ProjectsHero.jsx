import Hero from "@/components/ui/Hero/Hero";
import { projectCount } from "@/data/projects";

export default function ProjectsHero() {
  return (
    <Hero
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
        "Each project here reflects my approach to design, code, and",
        "problem-solving. From concept to execution, every detail has been",
        "carefully considered and built with intent.",
      ]}
      action={{
        href: "/contact",
        id: "projects-hero-contact",
        label: "CONTACT ME",
      }}
    />
  );
}
