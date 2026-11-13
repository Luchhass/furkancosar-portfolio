"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createMotionMedia } from "./motionMedia";
import { repeatReveal } from "./repeatReveal";

// Observe the stationary slot. All card content shares the original wipe.
export default function useShelfCardReveal(scope, renderKey) {
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const masks = [...scope.current.querySelectorAll("[data-project-card-reveal]")];
      masks.forEach(mask => {
        mask.dataset.revealMaskActive = "true";
        mask.dataset.revealReady = "true";
        repeatReveal(gsap.fromTo(mask,
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: .44, ease: "expo.out",
            onStart: () => { mask.dataset.revealMaskActive = "true"; },
            onComplete: () => { mask.dataset.revealMaskActive = "false"; },
            onReverseComplete: () => { mask.dataset.revealMaskActive = "true"; },
          }), mask.parentElement);
      });
      return () => masks.forEach(mask => {
        mask.dataset.revealMaskActive = "false";
        delete mask.dataset.revealReady;
      });
    });
    return () => media.revert();
  }, { scope, dependencies: [renderKey], revertOnUpdate: true });
}
