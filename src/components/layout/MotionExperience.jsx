"use client";
import { MOTION } from "@/lib/motionPresets";
import { createMotionMedia } from "@/lib/motionMedia";
import { createSectionScroll } from "@/lib/sectionScroll";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function MotionExperience() {
  const pathname = usePathname();
  const progressRef = useRef(null);

  useEffect(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => createSectionScroll());
    return () => media.revert();
  }, [pathname]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("main section, footer"));
    const visibility = new Map();
    const sync = (section, visible) => {
      const value = visible && !document.hidden ? "true" : "false";
      if (section.dataset.motionActive === value) return;
      section.dataset.motionActive = value;
      section.querySelectorAll("svg").forEach((svg) => value === "true" ? svg.unpauseAnimations?.() : svg.pauseAnimations?.());
    };
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      visibility.set(entry.target, entry.isIntersecting);
      sync(entry.target, entry.isIntersecting);
    }), { rootMargin: "0px", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    const onVisibility = () => visibility.forEach((visible, section) => sync(section, visible));
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      sections.forEach((section) => { delete section.dataset.motionActive; section.querySelectorAll("svg").forEach((svg) => svg.unpauseAnimations?.()); });
    };
  }, [pathname]);

  useEffect(() => {
    const selector = ".gradient-focus-flow, .gradient-text-flow, .gradient-bg-flow, .gradient-action-fill, .gradient-action-border, .gradient-action-dot, .gradient-icon-flow, .motion-page-progress, .orbital-ring, .orbital-core, .journey-rail-fill, .sculpture-bottom i, .gallery-progress-fill, .envelope-front, .envelope-progress i, .contact-scene-grid form label";
    const tracked = new Set();
    const visible = new Map();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        visible.set(entry.target, entry.isIntersecting);
        entry.target.dataset.gradientVisible = entry.isIntersecting && !document.hidden ? "true" : "false";
      }
    }, { threshold: 0 });
    const register = (root) => {
      const elements = root.matches?.(selector) ? [root, ...root.querySelectorAll(selector)] : root.querySelectorAll(selector);
      for (const element of elements) {
        if (tracked.has(element)) continue;
        tracked.add(element);
        element.dataset.gradientVisible = "false";
        observer.observe(element);
      }
    };
    document.documentElement.style.setProperty("--gradient-flow-duration", `${MOTION.gradientSeconds}s`);
    document.documentElement.style.setProperty("--motion-orbit-duration", `${MOTION.orbitDuration}s`);
    register(document.body);
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (node.nodeType !== 1) continue;
          const elements = node.matches?.(selector) ? [node, ...node.querySelectorAll(selector)] : node.querySelectorAll(selector);
          for (const element of elements) {
            observer.unobserve(element);
            tracked.delete(element);
            visible.delete(element);
          }
        }
        for (const node of record.addedNodes) if (node.nodeType === 1) register(node);
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    const onVisibility = () => {
      for (const element of tracked) element.dataset.gradientVisible = visible.get(element) && !document.hidden ? "true" : "false";
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mutations.disconnect(); observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      for (const element of tracked) delete element.dataset.gradientVisible;
    };
  }, [pathname]);

  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(progressRef.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: MOTION.progressScrub } });
    });
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("page-intro:complete", refresh);
    return () => { media.revert(); window.removeEventListener("page-intro:complete", refresh); };
  }, { dependencies: [pathname], revertOnUpdate: true });

  return <div ref={progressRef} aria-hidden="true" className="motion-page-progress" />;
}
