"use client";
import { createMotionMedia } from "@/lib/motionMedia";

import { useGSAP } from "@gsap/react";
import { useLanguage } from "@/hooks/useLanguage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION, detailFrom, detailTo, titleSlideFrom, titleSlideTo } from "./motionPresets";
import { repeatReveal } from "./repeatReveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function useSectionScene(scope) {
  const { locale } = useLanguage();
  useGSAP(() => {
    const media = createMotionMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px) and (pointer: fine)" }, ({ conditions }) => {
      if (!conditions.motion) return;
      const root = scope.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const cleanups = [];
      q("[data-scene-rule]").forEach((line) => repeatReveal(gsap.from(line, { scaleX: 0, transformOrigin: "0% 50%", duration: MOTION.detail.duration, ease: MOTION.ease }), line.parentElement));
      q("[data-scene-row]").forEach((row) => {
        const icon = row.querySelector("[data-scene-icon]");
        const contents = [...row.children].filter(child => child !== icon);
        if (row.hasAttribute("data-scene-horizontal")) {
          repeatReveal(gsap.fromTo(row.querySelectorAll("[data-scene-slide-inner]"),
            titleSlideFrom(), { ...titleSlideTo(), stagger: MOTION.line.stagger }), row);
        } else if (contents.length && !row.hasAttribute("data-scene-content-owned")) repeatReveal(gsap.from(contents, { ...detailFrom(), ...detailTo() }), row);
        if (icon) repeatReveal(gsap.from(icon, { rotation: MOTION.pop.rotation, scale: MOTION.pop.scale, duration: MOTION.pop.duration, ease: MOTION.pop.ease }), row);
        if (conditions.desktop) {
          const shift = gsap.quickTo(row, "x", MOTION.pointer);
          const enter = () => shift(8); const leave = () => shift(0);
          row.addEventListener("pointerenter", enter); row.addEventListener("pointerleave", leave);
          cleanups.push(() => { row.removeEventListener("pointerenter", enter); row.removeEventListener("pointerleave", leave); shift.tween.kill(); });
        }
      });
      q("[data-scene-reading]").forEach((text) => gsap.fromTo(text, { opacity: 0.32 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: text, start: "top 88%", end: "top 50%", scrub: MOTION.scrub } }));
      q("[data-scene-parallax]").forEach((target) => gsap.fromTo(target, { y: 35, rotation: -4 }, { y: -35, rotation: 4, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } }));
      return () => cleanups.forEach((fn) => fn());
    });
    return () => media.revert();
  }, { scope, dependencies: [locale], revertOnUpdate: true });
}
