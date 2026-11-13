"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createMotionMedia } from "./motionMedia";
import { MOTION } from "./motionPresets";

// Original ProjectsList wipe: .44s expo.out, .2s card stagger;
// exits use .26s power2.inOut with reversed .13s stagger.
export default function useShelfCardReveal(scope, renderKey, { viewportInset = .18, entryRatio = .35 } = {}) {
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const masks = [...scope.current.querySelectorAll("[data-project-card-reveal]")];
      const indices = new Map(masks.map((mask, index) => [mask, index]));
      const pending = new Map();
      const visibility = new Map(masks.map(mask => [mask, false]));
      const directions = new Map();
      const viewport = scope.current.querySelector(".shelf-viewport");
      let previousY = window.scrollY;
      let previousX = viewport.scrollLeft;
      let backwards = false;
      function updateDirection() {
        const dy = window.scrollY - previousY;
        const dx = viewport.scrollLeft - previousX;
        if (Math.abs(dx) > .5) backwards = dx < 0;
        else if (Math.abs(dy) > .5) backwards = dy < 0;
        previousY = window.scrollY;
        previousX = viewport.scrollLeft;
      }
      const timelines = new Map();
      const copyByMask = new Map(masks.map(mask => [mask, [...mask.querySelectorAll(".shelf-card-reveal")]]));
      let timer = 0;
      let observer;
      const hidden = "inset(0% 100% 0% 0%)";
      masks.forEach(mask => {
        mask.dataset.revealMaskActive = "true";
        // The shared prepaint guard hides the inner card until this flag is set.
        // Keep content visible throughout the wipe, not only after it completes.
        mask.dataset.revealReady = "true";
        gsap.set(mask, { clipPath: hidden, transformOrigin: "0% 50%" });
        gsap.set(copyByMask.get(mask), { autoAlpha: 0, y: MOTION.card.copyY });
      });
      function flush() {
        timer = 0;
        for (const visible of [true, false]) {
          const batch = [...pending].filter(([, state]) => state === visible).map(([mask]) => mask)
            .sort((a, b) => visible ? indices.get(a) - indices.get(b) : indices.get(b) - indices.get(a));
          batch.forEach((mask, index) => {
            timelines.get(mask)?.kill();
            gsap.killTweensOf(mask);
            const copy = copyByMask.get(mask);
            gsap.killTweensOf(copy);
            mask.dataset.revealMaskActive = "true";
            const timeline = gsap.timeline({ delay: (index % 3) * (visible ? .2 : .13) });
            timelines.set(mask, timeline);
            if (visible) {
              const fromRight = directions.get(mask);
              const entrance = fromRight ? "inset(0% 0% 0% 100%)" : hidden;
              gsap.set(copy, { autoAlpha: 0, y: MOTION.card.copyY });
              timeline.fromTo(mask,
                { clipPath: entrance, transformOrigin: fromRight ? "100% 50%" : "0% 50%", willChange: "clip-path" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: .44, ease: "expo.out", force3D: true,
                  clearProps: "clipPath,willChange,transformOrigin",
                  onComplete: () => { mask.dataset.revealMaskActive = "false"; } })
                .to(copy, { autoAlpha: 1, y: 0, duration: MOTION.card.copyDuration,
                  stagger: MOTION.card.copyStagger, ease: MOTION.ease });
            } else {
              timeline.to([...copy].reverse(), { autoAlpha: 0, y: MOTION.card.copyY,
                duration: .26, stagger: MOTION.card.copyStagger / 2, ease: "power2.inOut" })
                .to(mask, { clipPath: hidden, duration: .26, ease: "power2.inOut",
                  transformOrigin: "0% 50%", willChange: "clip-path", force3D: true });
            }
          });
        }
        pending.clear();
      }
      function observe() {
        observer?.disconnect();
        const inset = Math.round(innerHeight * viewportInset);
        observer = new IntersectionObserver(entries => {
          updateDirection();
          for (const entry of entries) {
            const mask = entry.target.querySelector("[data-project-card-reveal]");
            if (!mask) continue;
            // A horizontal slide used to start the wipe at its first visible pixel.
            // It was already finished by the time the user could see the card.
            const wasVisible = visibility.get(mask);
            const visible = entry.isIntersecting && (wasVisible || entry.intersectionRatio >= entryRatio);
            if (visible !== wasVisible) {
              if (visible) directions.set(mask, backwards);
              visibility.set(mask, visible);
              pending.set(mask, visible);
            }
          }
          if (pending.size && !timer) timer = window.setTimeout(flush, 20);
        }, { rootMargin: `-${inset}px 0px -${inset}px 0px`, threshold: [0, entryRatio] });
        // Observe the stationary slot, not the mask that is clipped to zero width.
        masks.forEach(mask => observer.observe(mask.parentElement));
      }
      observe();
      window.addEventListener("scroll", updateDirection, { passive: true });
      viewport.addEventListener("scroll", updateDirection, { passive: true });
      window.addEventListener("resize", observe);
      return () => {
        clearTimeout(timer);
        observer.disconnect();
        window.removeEventListener("resize", observe);
        window.removeEventListener("scroll", updateDirection);
        viewport.removeEventListener("scroll", updateDirection);
        gsap.killTweensOf(masks);
        timelines.forEach(timeline => timeline.kill());
        gsap.set([...copyByMask.values()].flat(), { clearProps: "transform,opacity,visibility" });
        gsap.set(masks, { clearProps: "clipPath,willChange,transformOrigin" });
        masks.forEach(mask => {
          mask.dataset.revealMaskActive = "false";
          delete mask.dataset.revealReady;
        });
      };
    });
    return () => media.revert();
  }, { scope, dependencies: [renderKey, viewportInset, entryRatio], revertOnUpdate: true });
}
