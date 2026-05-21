import ProjectsHero from "@/components/sections/projects/ProjectsHero/ProjectsHero";
import ProjectsIntro from "@/components/sections/projects/ProjectsIntro/ProjectsIntro";
import ProjectsList from "@/components/sections/projects/ProjectsList/ProjectsList";
import MarqueeText from "@/components/ui/MarqueeText/MarqueeText";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Furkan Cosar | Projects",
  description:
    "Browse Furkan Cosar's frontend projects, including responsive websites, dashboards, ecommerce interfaces, landing pages and polished UI builds.",
  path: "/projects",
  keywords: [
    "Furkan Cosar projects",
    "frontend projects",
    "React projects",
    "Next.js projects",
    "web design projects",
    "UI portfolio projects",
  ],
});

export default function ProjectsPage() {
  return (
    <main>
      <ProjectsHero />
      <MarqueeText text="MY PROJECTS" duration="50s" />
      <ProjectsIntro />
      <ProjectsList />
    </main>
  );
}
