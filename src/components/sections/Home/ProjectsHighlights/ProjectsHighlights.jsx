"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { latestProjects } from "@/data/projects";
import ProjectShelfCard from "@/components/ui/ProjectShelfCard";
import MiniTitleText from "@/components/ui/MiniTitleText";
import TitleLine from "@/components/ui/TitleLine";
import ProjectDetailsModal from "@/components/ui/ProjectDetailsModal/ProjectDetailsModal";
import useShelfCardReveal from "@/lib/useShelfCardReveal";
import { bindProjectCardHover } from "@/lib/pointerMotion";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION } from "@/lib/motionPresets";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const projects = latestProjects.slice(0, 6);

export default function ProjectsHighlights() {
  const localize = useLocalizedContent();
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const scrollMotion = useRef({ base: 0, offset: 0, left: 0 });
  const [selected, setSelected] = useState(null);
  useShelfCardReveal(sectionRef, projects.length);

  function transformScroll() { return matchMedia("(hover: hover) and (pointer: fine)").matches; }
  function maxScroll() {
    const viewport = viewportRef.current;
    const last = viewport.querySelector(".highlights-track").lastElementChild;
    return Math.max(0, last.offsetLeft + last.offsetWidth - viewport.clientWidth);
  }
  function readScroll() { return transformScroll() ? scrollMotion.current.left : viewportRef.current.scrollLeft; }
  function writeScroll(left) {
    const viewport = viewportRef.current;
    scrollMotion.current.left = gsap.utils.clamp(0, maxScroll(), left);
    if (transformScroll()) gsap.set(viewport.querySelector(".highlights-track"), { x: -scrollMotion.current.left });
    else viewport.scrollLeft = scrollMotion.current.left;
  }

  useGSAP(() => {
    const root = sectionRef.current;
    const viewport = viewportRef.current;
    const media = createMotionMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const cleanups = [...root.querySelectorAll(".shelf-card")].map(bindProjectCardHover);
      return () => {
        cleanups.forEach(cleanup => cleanup());
        gsap.set(viewport.querySelector(".highlights-track"), { clearProps: "transform" });
      };
    });
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const motion = { progress: 0 };
      gsap.to(motion, { progress: 1, ease: "none", scrollTrigger: {
        trigger: root.querySelector(".shelf-card-slot"), start: "33% bottom",
        endTrigger: root, end: "bottom top", scrub: MOTION.scrub, invalidateOnRefresh: true,
      }, onUpdate: () => {
        const state = scrollMotion.current;
        const max = maxScroll();
        // Reveal starts at 15% visibility; travel follows once a third is visible.
        state.base = max * motion.progress;
        if (drag.current?.moved) return;
        writeScroll(state.base + state.offset);
      } });
    });
    return () => media.revert();
  }, { scope: sectionRef });

  function startDrag(event) {
    suppressClick.current = false;
    scrollMotion.current.offset = readScroll() - scrollMotion.current.base;
    if (event.pointerType !== "mouse") { drag.current = { id: event.pointerId, native: true, moved: true }; return; }
    if (event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, left: readScroll(), moved: false };
  }
  function moveDrag(event) {
    const state = drag.current;
    if (!state || state.native || state.id !== event.pointerId) return;
    const dx = event.clientX - state.x;
    if (!state.moved && Math.abs(dx) > 7) {
      state.moved = true; suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
    }
    if (state.moved) {
      event.preventDefault();
      writeScroll(state.left - dx);
      scrollMotion.current.offset = readScroll() - scrollMotion.current.base;
    }
  }
  function endDrag(event) {
    scrollMotion.current.offset = readScroll() - scrollMotion.current.base;
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return localize(<section ref={sectionRef} data-header-theme="dark" data-scroll-reveal="sequence"
    className="ui-screen ui-fit-panel highlights-scene ui-section bg-[#141414] text-white" aria-labelledby="highlights-title">
    <div className="ui-section-grid">
      <p data-reveal-part="kicker" className="ui-section-label"><MiniTitleText>Projects</MiniTitleText></p>
      <div className="ui-section-body">
        <h2 id="highlights-title" data-reveal-part="title" className="ui-section-title"><TitleLine>Highlights</TitleLine></h2>
        <div className="ui-section-content">
          <div ref={viewportRef} className="shelf-viewport highlights-viewport" role="region" aria-roledescription="carousel" aria-label="Latest six projects" tabIndex={0}
            onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { drag.current = null; }}
            onTouchMove={() => { scrollMotion.current.offset = readScroll() - scrollMotion.current.base; }}
            onClickCapture={event => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } }}
            onKeyDown={event => { if (event.target !== event.currentTarget) return; const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0; if (direction) { event.preventDefault(); writeScroll(readScroll() + direction * event.currentTarget.clientWidth); scrollMotion.current.offset = readScroll() - scrollMotion.current.base; } }}>
            <div className="highlights-track">{projects.map((project, index) => <ProjectShelfCard key={project.id} project={project}
              number={String(latestProjects.length - index).padStart(2, "0")} onOpen={setSelected} />)}</div>
          </div>
        </div>
      </div>
    </div>
    <ProjectDetailsModal project={selected?.project} projectNumber={selected?.number} origin={selected?.origin} onClose={() => setSelected(null)} />
  </section>);
}
