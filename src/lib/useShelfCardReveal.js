"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createMotionMedia } from "./motionMedia";
import { bindProjectCardHover } from "./pointerMotion";
import { reverseReveal } from "./repeatReveal";
import { sequenceReveal } from "./revealSequence";

export default function useShelfCardReveal(scope, renderKey, groupRef) {
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
            entry.sequence.exit();
            reverseReveal(entry.animation);
          } else if (change.intersectionRatio >= 0.15 && !entry.entered) {
            entry.entered = true;
            entry.sequence.enter();
          }
        });
      }, { threshold: [0, 0.15] });
      function observeCards(anchor, cardMasks) {
        const setMaskActive = active => {
          const value = String(active);
          if (cardMasks[0].dataset.revealMaskActive === value) return;
          cardMasks.forEach(mask => { mask.dataset.revealMaskActive = value; });
        };
        setMaskActive(true);
        cardMasks.forEach(mask => { mask.dataset.revealReady = "true"; });
        const targets = cardMasks.map(mask => mask.querySelector("[data-project-card-reveal-inner]"));
        const animation = gsap.fromTo(targets,
          { yPercent: -105 },
          { yPercent: 0, duration: .7, ease: "power3.out", force3D: false, paused: true,
            onUpdate: function () {
              setMaskActive(this.progress() !== 1);
            },
          });
        entries.set(anchor, { animation, sequence: sequenceReveal(animation, anchor), entered: false });
        observer.observe(anchor);
      }
      // The carousel moves horizontally inside this fixed viewport. Its cards
      // share one reveal and only reset when the viewport leaves the screen.
      const group = groupRef?.current;
      if (group && masks.length) observeCards(group, masks);
      else masks.forEach(mask => observeCards(mask, [mask]));
      return () => {
        observer.disconnect();
        entries.forEach(entry => { entry.sequence.dispose(); entry.animation.kill(); });
        masks.forEach(mask => {
          mask.dataset.revealMaskActive = "false";
          delete mask.dataset.revealReady;
        });
      };
    });
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const cleanups = [...scope.current.querySelectorAll(".shelf-card")].map(bindProjectCardHover);
      return () => cleanups.forEach(cleanup => cleanup());
    });
    return () => media.revert();
  }, { scope, dependencies: [renderKey, groupRef], revertOnUpdate: true });
}
