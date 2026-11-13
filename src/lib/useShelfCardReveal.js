"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createMotionMedia } from "./motionMedia";
import { reverseReveal } from "./repeatReveal";

// Start once enough of the stationary slot is visible to see the whole-card slide.
export default function useShelfCardReveal(scope, renderKey) {
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const masks = [...scope.current.querySelectorAll("[data-project-card-reveal]")];
      const entries = new Map();
      const observer = new IntersectionObserver(changes => {
        changes.forEach(change => {
          const entry = entries.get(change.target);
          if (!entry) return;
          if (!change.isIntersecting) {
            entry.entered = false;
            reverseReveal(entry.animation);
          } else if (change.intersectionRatio >= 0.15 && !entry.entered) {
            entry.entered = true;
            entry.animation.timeScale(1).restart(true);
          }
        });
      }, { threshold: [0, 0.15] });
      masks.forEach(mask => {
        mask.dataset.revealMaskActive = "true";
        mask.dataset.revealReady = "true";
        const animation = gsap.fromTo(mask.querySelector("[data-project-card-reveal-inner]"),
          { xPercent: -105 },
          { xPercent: 0, duration: .7, ease: "power3.out", force3D: false, paused: true,
            onStart: () => { mask.dataset.revealMaskActive = "true"; },
            onUpdate: function () {
              mask.dataset.revealMaskActive = this.progress() === 1 ? "false" : "true";
            },
            onReverseComplete: () => { mask.dataset.revealMaskActive = "true"; },
          });
        entries.set(mask.parentElement, { animation, entered: false });
        observer.observe(mask.parentElement);
      });
      return () => {
        observer.disconnect();
        entries.forEach(entry => entry.animation.kill());
        masks.forEach(mask => {
        mask.dataset.revealMaskActive = "false";
        delete mask.dataset.revealReady;
        });
      };
    });
    return () => media.revert();
  }, { scope, dependencies: [renderKey], revertOnUpdate: true });
}
