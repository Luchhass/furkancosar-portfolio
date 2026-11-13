"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { createMotionMedia } from "./motionMedia";
import { MOTION } from "./motionPresets";
import { observeReveal, reverseReveal } from "./repeatReveal";

export default function useAccordionMotion(scope, panelId, lineSelector, logoSelector, layoutKey) {
  useGSAP(() => {
    const media = createMotionMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
      const root = scope.current;
      const panel = root?.querySelector(`#${panelId}`);
      if (!panel) return;
      const lines = panel.querySelectorAll(lineSelector);
      const logos = logoSelector ? panel.querySelectorAll(logoSelector) : [];
      // Closed panels already hide their content. Never leave hidden transforms
      // on their lines: React can reuse those nodes on the next selection.
      gsap.set(root.querySelectorAll(lineSelector), { clearProps: "transform" });
      if (logoSelector) gsap.set(root.querySelectorAll(logoSelector), { clearProps: "opacity,visibility,transform" });
      if (!conditions.motion) return;
      const timeline = gsap.timeline({ paused: true });
      if (lines.length) timeline.fromTo(lines, { yPercent: MOTION.line.yPercent }, { ...MOTION.line, yPercent: 0 }, 0);
      if (logos.length) timeline.fromTo(logos,
        { autoAlpha: 0, scale: MOTION.pop.scale, rotation: MOTION.pop.rotation },
        { autoAlpha: 1, scale: 1, rotation: 0, duration: MOTION.pop.duration, stagger: MOTION.pop.stagger, ease: MOTION.pop.ease }, .35);
      const release = observeReveal(panel, () => timeline.timeScale(1).restart(true), () => reverseReveal(timeline));
      return () => {
        release();
        timeline.kill();
        gsap.set(lines, { clearProps: "transform" });
        if (logos.length) gsap.set(logos, { clearProps: "opacity,visibility,transform" });
      };
    });
    return () => media.revert();
  }, { scope, dependencies: [panelId, lineSelector, logoSelector, layoutKey], revertOnUpdate: true });
}
