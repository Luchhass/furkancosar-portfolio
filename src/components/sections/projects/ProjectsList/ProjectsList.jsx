"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef, useState } from "react";
import MiniTitleText from "@/components/ui/MiniTitleText";
import ProjectShelfCards from "@/components/ui/ProjectShelfCards";
import ProjectDetailsModal from "@/components/ui/ProjectDetailsModal/ProjectDetailsModal";
import { latestProjects } from "@/data/projects";
import useShelfCardReveal from "@/lib/useShelfCardReveal";

export default function ProjectsList({ projects = latestProjects }) {
  const localize = useLocalizedContent();
  const sectionRef = useRef(null);
  const [selected, setSelected] = useState(null);
  useShelfCardReveal(sectionRef, projects.map(project => project.id).join("|"));

  return localize(<section id="project-archive" ref={sectionRef} data-header-theme="dark"
    className="projects-archive ui-section bg-[#141414] text-white" aria-labelledby="projects-list-title">
    <div className="ui-section-grid">
      <h2 id="projects-list-title" className="ui-section-label"><MiniTitleText>Selected work</MiniTitleText></h2>
      <div className="ui-section-body">
        <div className="projects-archive-grid">
          <ProjectShelfCards projects={projects} onOpen={setSelected} />
        </div>
        {!projects.length && <p className="ui-section-copy">New work is on its way.</p>}
      </div>
    </div>
    <ProjectDetailsModal project={selected?.project} projectNumber={selected?.number} origin={selected?.origin} onClose={() => setSelected(null)} />
  </section>);
}
