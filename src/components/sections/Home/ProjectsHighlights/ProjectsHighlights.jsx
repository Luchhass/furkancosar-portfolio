"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef, useState } from "react";
import { latestProjects } from "@/data/projects";
import ProjectShelfCards from "@/components/ui/ProjectShelfCards";
import MiniTitleText from "@/components/ui/MiniTitleText";
import TitleLine from "@/components/ui/TitleLine";
import ProjectDetailsModal from "@/components/ui/ProjectDetailsModal/ProjectDetailsModal";
import useShelfCardReveal from "@/lib/useShelfCardReveal";
import useHighlightsCarousel from "./useHighlightsCarousel";

const projects = latestProjects.slice(0, 6);

export default function ProjectsHighlights() {
  const localize = useLocalizedContent();
  const sectionRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const { trackRef, viewportProps } = useHighlightsCarousel(sectionRef);
  useShelfCardReveal(sectionRef, projects.length, { groupRef: viewportProps.ref });

  return localize(<section ref={sectionRef} data-header-theme="dark" data-scroll-reveal="sequence"
    className="ui-screen ui-fit-panel highlights-scene ui-section bg-[#141414] text-white" aria-labelledby="highlights-title">
    <div className="ui-section-grid">
      <p data-reveal-part="kicker" className="ui-section-label"><MiniTitleText>Projects</MiniTitleText></p>
      <div className="ui-section-body">
        <h2 id="highlights-title" data-reveal-part="title" className="ui-section-title"><TitleLine>Highlights</TitleLine></h2>
        <div className="ui-section-content">
          <div {...viewportProps} className="shelf-viewport highlights-viewport" role="region"
            aria-roledescription="carousel" aria-label="Latest six projects" tabIndex={0}>
            <div ref={trackRef} className="highlights-track">
              <ProjectShelfCards projects={projects} total={latestProjects.length} onOpen={setSelected} />
            </div>
          </div>
        </div>
      </div>
    </div>
    <ProjectDetailsModal project={selected?.project} projectNumber={selected?.number} origin={selected?.origin} onClose={() => setSelected(null)} />
  </section>);
}
