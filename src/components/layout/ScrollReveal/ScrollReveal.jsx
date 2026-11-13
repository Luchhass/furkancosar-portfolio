"use client";
import { createMotionMedia } from "@/lib/motionMedia";

import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { playRevealCounters } from "@/components/ui/RevealCounter/RevealCounter";
import { splitCharacters } from "@/lib/motionText";
import { MOTION, headingFrom, headingTo, detailFrom, detailTo } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

export default function ScrollReveal() {
  const pathname = usePathname();
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const splits = [];
      document.querySelectorAll("main section[data-scroll-reveal='sequence']").forEach((section) => {
        const title = section.querySelector("[data-reveal-part='title']");
        const kicker = section.querySelector("[data-reveal-part='kicker']");
        const timeline = gsap.timeline({
          defaults: { ease: MOTION.ease },
          onComplete: () => {
            section.dataset.scrollRevealState = "complete";
            section.dispatchEvent(new CustomEvent("scroll-reveal:complete"));
            playRevealCounters(section);
          },
          onReverseComplete: () => { section.dataset.scrollRevealState = "idle"; },
        });
        if (kicker) timeline.from(kicker, { ...detailFrom(), ...detailTo() }, 0);
        if (title) {
          const lines = title.children.length ? Array.from(title.children) : [title];
          lines.forEach((line, index) => {
            const split = splitCharacters(line);
            splits.push(split);
            timeline.from(split.chars, { ...headingFrom(), ...headingTo() }, 0.12 + index * MOTION.heading.lineGap);
          });
        }
        const contents = Array.from(section.querySelectorAll("[data-reveal-part='content']"))
          .filter((element) => !element.querySelector("[data-reveal-part='content']"));
        const lines = contents.map((element) => element.querySelector(":scope > [data-reveal-inner]")).filter(Boolean);
        const blocks = contents.filter((element) => !element.querySelector(":scope > [data-reveal-inner]"));
        if (lines.length) timeline.from(lines, { ...MOTION.line }, .35);
        if (blocks.length) timeline.from(blocks, { ...detailFrom(), ...detailTo() }, .35);
        repeatReveal(timeline, section);
      });
      return () => splits.forEach((split) => split.revert());
    });
    return () => media.revert();
  }, { dependencies: [pathname], revertOnUpdate: true });
  return null;
}
