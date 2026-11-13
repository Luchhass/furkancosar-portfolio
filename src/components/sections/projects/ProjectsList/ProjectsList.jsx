"use client";
import MiniTitleText from "@/components/ui/MiniTitleText";
import ProjectShelfCard from "@/components/ui/ProjectShelfCard";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { latestProjects } from "@/data/projects";
import ProjectDetailsModal from "@/components/ui/ProjectDetailsModal/ProjectDetailsModal";
import useShelfCardReveal from "@/lib/useShelfCardReveal";
import { bindProjectCardHover } from "@/lib/pointerMotion";
import { createMotionMedia } from "@/lib/motionMedia";
gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

function subscribeLayout(callback) {
  const queries = [matchMedia("(min-width: 768px)"), matchMedia("(min-width: 1024px)")];
  queries.forEach(query => query.addEventListener("change", callback));
  return () => queries.forEach(query => query.removeEventListener("change", callback));
}
const getColumns = () => matchMedia("(min-width: 1024px)").matches ? 3 : matchMedia("(min-width: 768px)").matches ? 2 : 1;
const serverColumns = () => 1;

export default function ProjectsList({ projects = latestProjects }) {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const activePageRef = useRef(0);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const triggerRef = useRef(null);
  const navigationRef = useRef(null);
  const columns = useSyncExternalStore(subscribeLayout, getColumns, serverColumns);
  const pageSize = columns * 2;
  const pages = useMemo(() => {
    const result = [];
    for (let index = 0; index < projects.length; index += pageSize) result.push(projects.slice(index, index + pageSize));
    return result;
  }, [projects, pageSize]);
  const [activePage, setActivePage] = useState(0);
  const [selected, setSelected] = useState(null);
  const page = Math.min(activePage, Math.max(0, pages.length - 1));
  useShelfCardReveal(sectionRef, columns + ":" + projects.map(project => project.id).join("|"));

  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const cleanups = [...sectionRef.current.querySelectorAll(".shelf-card")].map(bindProjectCardHover);
      return () => cleanups.forEach(cleanup => cleanup());
    });
    return () => media.revert();
  }, { scope: sectionRef, dependencies: [pageSize, projects], revertOnUpdate: true });

  useGSAP(() => {
    const viewport = viewportRef.current;
    viewport.scrollLeft = 0;
    if (pages.length < 2) return;
    let distance = 0;
    const measure = () => { distance = Math.max(0, viewport.scrollWidth - viewport.clientWidth); };
    measure();
    const motion = { progress: 0 };
    const timeline = gsap.timeline({
      scrollTrigger: {
        id: "project-shelf",
        trigger: sectionRef.current, start: "top top",
        end: () => "+=" + (Math.max(distance, innerHeight * (pages.length - 1) * .7) + innerHeight * .2),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onRefreshInit: measure,
      },
    });
    timeline.to(motion, {
      progress: 1, duration: 1, ease: "none",
      onUpdate: () => { viewport.scrollLeft = distance * motion.progress; },
    }).to({}, { duration: .08 });
    triggerRef.current = timeline.scrollTrigger;
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(frame);
      navigationRef.current?.kill();
      triggerRef.current = null;
    };
  }, { scope: sectionRef, dependencies: [pageSize, pages.length], revertOnUpdate: true });

  function scrollPosition(left) {
    const trigger = triggerRef.current;
    const viewport = viewportRef.current;
    const max = viewport.scrollWidth - viewport.clientWidth;
    return trigger && max > 0 ? trigger.start + (trigger.end - trigger.start) * Math.max(0, Math.min(1, left / max)) / 1.08 : null;
  }

  function goTo(index) {
    const target = viewportRef.current.querySelectorAll("[data-shelf-page]")[index];
    if (!target) return;
    const y = scrollPosition(target.offsetLeft);
    if (y === null) { viewportRef.current.scrollLeft = target.offsetLeft; return; }
    navigationRef.current?.kill();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) window.scrollTo(0, y);
    else navigationRef.current = gsap.to(window, { scrollTo: { y, autoKill: true }, duration: .5, ease: "power3.out", overwrite: "auto" });
  }
  function syncPage() {
    const viewport = viewportRef.current;
    const items = [...viewport.querySelectorAll("[data-shelf-page]")];
    if (!items.length) return;
    const nearest = items.reduce((best, item, index) => Math.abs(item.offsetLeft - viewport.scrollLeft) < Math.abs(items[best].offsetLeft - viewport.scrollLeft) ? index : best, 0);
    activePageRef.current = nearest;
    setActivePage(nearest);
  }
  function startDrag(event) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    suppressClick.current = false;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, moved: false };
  }
  function moveDrag(event) {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    const dx = event.clientX - state.x;
    if (!state.moved && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(event.clientY - state.y)) {
      state.moved = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
    }
    if (state.moved) {
      event.preventDefault();
      const y = scrollPosition(state.left - dx);
      if (y !== null) { window.scrollTo(0, y); ScrollTrigger.update(); }
    }
  }
  function endDrag(event) {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (state.moved) goTo(activePageRef.current);
  }

  return <section id="project-archive" ref={sectionRef} data-header-theme="dark"
    className="ui-screen ui-section projects-shelf bg-[#141414] text-white" aria-labelledby="projects-list-title">
    <div className="ui-section-grid">
      <h2 id="projects-list-title" className="ui-section-label"><MiniTitleText>Selected work</MiniTitleText></h2>
      <div className="ui-section-body shelf-body">
        <div ref={viewportRef} className="shelf-viewport" tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Project shelf"
          onScroll={syncPage} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
          onLostPointerCapture={() => { drag.current = null; }}
          onClickCapture={event => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } }}
          onKeyDown={event => {
            const next = event.key === "ArrowRight" ? Math.min(page + 1, pages.length - 1) : event.key === "ArrowLeft" ? Math.max(0, page - 1) : event.key === "Home" ? 0 : event.key === "End" ? pages.length - 1 : null;
            if (next !== null && !event.target.closest("button")) { event.preventDefault(); goTo(next); }
          }}>
          <div className="shelf-track">
            {pages.map((items, pageIndex) => <div key={pageIndex} data-shelf-page className="shelf-page" role="group"
              aria-label={`Projects ${pageIndex * pageSize + 1} to ${Math.min((pageIndex + 1) * pageSize, projects.length)}`} inert={pageIndex !== page}>
              {items.map((project, index) => {
                const number = String(projects.length - (pageIndex * pageSize + index)).padStart(2, "0");
                return <ProjectShelfCard key={project.id} project={project} number={number} onOpen={setSelected} />;
              })}
            </div>)}
          </div>
        </div>
        {!pages.length && <p className="ui-section-copy">New work is on its way.</p>}
      </div>
    </div>
    <ProjectDetailsModal project={selected?.project} projectNumber={selected?.number} origin={selected?.origin} onClose={() => setSelected(null)} />
  </section>;
}
