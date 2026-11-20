import ProjectsHero from "@/components/sections/projects/ProjectsHero/ProjectsHero";
import MarqueeText from "@/components/ui/MarqueeText/MarqueeText";
import ProjectsIntro from "@/components/sections/projects/ProjectsIntro/ProjectsIntro";
import ProjectsList from "@/components/sections/projects/ProjectsList/ProjectsList";
import CollaborationCTA from "@/components/ui/CollaborationCTA/CollaborationCTA";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("projects");

export default function ProjectsPage() {
  return (
    <main>
      <ProjectsHero />
      <MarqueeText text="MY PROJECTS" duration="50s" />
      <ProjectsIntro />
      <ProjectsList />
      <CollaborationCTA />
    </main>
  );
}
