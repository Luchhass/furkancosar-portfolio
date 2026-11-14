"use client";

import Image from "next/image";
import { ArrowUpRight, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { MOTION, detailFrom, detailTo } from "@/lib/motionPresets";
import TitleLine from "@/components/ui/TitleLine";
import ReadingText from "@/components/ui/ReadingText";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useLanguage } from "@/hooks/useLanguage";

function formatDate(value, locale) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recent" : new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

export default function ProjectDetailsModal({ project, projectNumber, origin, onClose }) {
  const localize = useLocalizedContent();
  const { locale } = useLanguage();
  const titleId = useId();
  const ref = useRef(null);
  const closeButtonRef = useRef(null);
  const closeRef = useRef(onClose);
  const closingRef = useRef(false);
  const exitRef = useRef(null);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { closeRef.current(); return; }
    exitRef.current = gsap.timeline({ onComplete: () => closeRef.current() })
      .to(ref.current.querySelector(".project-modal-layout"), { opacity: 0, y: 24, duration: 0.22, ease: "power2.in" })
      .to(ref.current, { clipPath: "inset(0 0 100% 0)", duration: 0.4, ease: "power3.inOut" }, 0.12);
  }, []);

  useEffect(() => {
    if (!project) return;
    const root = ref.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    closingRef.current = false;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const preview = root.querySelector(".project-modal-preview");
      const rect = preview.getBoundingClientRect();
      const from = origin ? { x: origin.left + origin.width / 2 - rect.left - rect.width / 2, y: origin.top + origin.height / 2 - rect.top - rect.height / 2, scale: Math.max(0.25, Math.min(origin.width / rect.width, 0.8)) } : { y: 45, scale: 0.95 };
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(preview, { ...from, opacity: 0, duration: MOTION.slide.duration, ease: MOTION.slide.ease }, 0)
        .from(root.querySelectorAll("[data-project-detail]"), { ...detailFrom(), ...detailTo() }, 0.16)
        .from(root.querySelector(".project-modal-topbar"), { y: -20, opacity: 0, duration: 0.5 }, 0.1);
    }, ref);

    const keydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "Tab") {
        const buttons = root.querySelectorAll("button, a[href]");
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      exitRef.current?.kill();
      context.revert();
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", keydown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [project, origin, close]);

  if (!project || typeof document === "undefined") return null;
  const number = projectNumber || String(project.id || "").match(/\d+/)?.[0]?.padStart(2, "0") || "01";
  return createPortal(localize(<div ref={ref} className="project-modal-fullscreen" role="dialog" aria-modal="true" aria-labelledby={titleId}>
    <div className="project-modal-panel">
      <header className="project-modal-topbar"><span>SELECTED WORK <i>/</i> {number}</span><span className="project-modal-category">{project.category}</span><button ref={closeButtonRef} type="button" onClick={close} aria-label="Close project details"><span>BACK TO PROJECTS</span><X size={22} strokeWidth={1.7} /></button></header>
      <div className="project-modal-layout">
        <div className="project-modal-preview">
          <div className="project-preview-placeholder" aria-hidden="true"><span>PROJECT / {number}</span><strong>{project.name}</strong></div>
          {project.screenshot && <Image src={project.screenshot} alt={`${project.name} preview`} fill sizes="(min-width: 900px) 55vw, 100vw" priority className="project-preview-image" onError={(event) => { event.currentTarget.style.opacity = "0"; }} />}
          <span className="project-preview-index" aria-hidden="true">{number}</span>
        </div>
        <div className="project-modal-copy">
          <p className="project-detail-eyebrow" data-project-detail>{project.category} / {project.type}</p>
          <h2 id={titleId}><TitleLine>{project.name}</TitleLine></h2>
          <ReadingText className="project-detail-description">{project.description}</ReadingText>
          <dl className="project-detail-facts" data-project-detail>{[["Type", project.type], ["Released", formatDate(project.date, locale)], ["Category", project.category], ["Status", project.status]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <div className="project-detail-stack" data-project-detail><p>BUILT WITH</p><div>{project.technologies?.map((technology) => <span key={technology}>{technology}</span>)}</div></div>
          <div className="project-detail-actions" data-project-detail>
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="ui-button ui-button--compact project-detail-primary">Visit live site <ArrowUpRight size={21} /></a>}
            {project.sourceUrl && <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="ui-button ui-button--compact project-detail-source">Source code <ArrowUpRight size={17} /></a>}
          </div>
        </div>
      </div>
    </div>
  </div>), document.body);
}
