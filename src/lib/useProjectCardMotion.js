"use client";
import { createMotionMedia } from "@/lib/motionMedia";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MOTION } from "./motionPresets";
import { repeatReveal } from "./repeatReveal";

export default function useProjectCardMotion(scope, renderKey, copySelector = ".project-card-lift") {
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      scope.current.querySelectorAll("[data-project-card-reveal]").forEach((mask, index) => {
        mask.dataset.revealMaskActive = "false";
        const inner = mask.querySelector("[data-project-card-reveal-inner]");
        const image = mask.querySelector("img");
        const copy = mask.querySelectorAll(copySelector);
        const timeline = gsap.timeline({ paused: true, delay: index % 3 * MOTION.pop.stagger, defaults: { ease: MOTION.ease } });
        // The complete card enters from the left first. Its inner content
        // then reveals top-to-bottom in a deliberate stagger.
        timeline.fromTo(inner, { x: MOTION.slide.x, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: MOTION.slide.duration, ease: MOTION.slide.ease }, 0);
        if (image) timeline.fromTo(image, { scale: MOTION.card.imageScale }, { scale: 1, duration: MOTION.card.imageDuration, ease: MOTION.ease }, 0.08);
        timeline.fromTo(copy, { opacity: 0, y: MOTION.card.copyY, clipPath: "inset(0 0 100% 0)" }, { opacity: 1, y: 0, clipPath: "inset(0 0 0 0)", stagger: MOTION.card.copyStagger, duration: MOTION.card.copyDuration, ease: MOTION.ease }, MOTION.card.copyStart);
        repeatReveal(timeline, mask);
      });
    });
    return () => media.revert();
  }, { scope, dependencies: [renderKey, copySelector], revertOnUpdate: true });
}
