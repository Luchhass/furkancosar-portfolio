import Hero from "@/components/ui/Hero/Hero";
import { projectCount } from "@/data/projects";

export default function HomeHero() {
  return (
    <Hero
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
        "I build responsive, animated and user-focused web interfaces with",
        "React, Next.js, GSAP and Tailwind CSS. I turn ideas into clean, modern",
        "digital experiences across every screen.",
      ]}
      action={{
        href: "/contact",
        id: "home-hero-contact",
        label: "CONTACT ME",
      }}
    />
  );
}