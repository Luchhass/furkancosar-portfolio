"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import MiniTitleText from "@/components/ui/MiniTitleText";
import ProjectShelfCard from "@/components/ui/ProjectShelfCard";
import ProjectDetailsModal from "@/components/ui/ProjectDetailsModal/ProjectDetailsModal";
import { latestProjects } from "@/data/projects";
import useShelfCardReveal from "@/lib/useShelfCardReveal";
import { bindProjectCardHover } from "@/lib/pointerMotion";
import { createMotionMedia } from "@/lib/motionMedia";

gsap.registerPlugin(useGSAP);

export default function ProjectsList({ projects = latestProjects }) {
  const localize = useLocalizedContent();
  const sectionRef = useRef(null);
  const [selected, setSelected] = useState(null);
  useShelfCardReveal(sectionRef, projects.map(project => project.id).join("|"));

  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const cleanups = [...sectionRef.current.querySelectorAll(".shelf-card")].map(bindProjectCardHover);
      return () => cleanups.forEach(cleanup => cleanup());
    });
    return () => media.revert();
  }, { scope: sectionRef, dependencies: [projects], revertOnUpdate: true });

  return localize(<section id="project-archive" ref={sectionRef} data-header-theme="dark"
    className="projects-archive ui-section bg-[#141414] text-white" aria-labelledby="projects-list-title">
    <div className="ui-section-grid">
      <h2 id="projects-list-title" className="ui-section-label"><MiniTitleText>Selected work</MiniTitleText></h2>
      <div className="ui-section-body">
        <div className="projects-archive-grid">
          {projects.map((project, index) => <ProjectShelfCard key={project.id} project={project}
            number={String(projects.length - index).padStart(2, "0")} onOpen={setSelected} />)}
        </div>
        {!projects.length && <p className="ui-section-copy">New work is on its way.</p>}
      </div>
    </div>
    <ProjectDetailsModal project={selected?.project} projectNumber={selected?.number} origin={selected?.origin} onClose={() => setSelected(null)} />
  </section>);
}
