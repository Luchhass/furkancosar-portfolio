"use client";
import { createMotionMedia } from "@/lib/motionMedia";

import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
        if (kicker) {
          const inner = kicker.querySelector(":scope > [data-reveal-inner]");
          repeatReveal(gsap.from(inner || kicker, { ...detailFrom(), ...detailTo() }), inner ? kicker : kicker.parentElement);
        }
        if (title) {
          const lines = title.children.length ? Array.from(title.children) : [title];
          lines.forEach((line) => {
            const split = splitCharacters(line);
            splits.push(split);
            repeatReveal(gsap.from(split.chars, { ...headingFrom(), ...headingTo() }), line);
          });
        }
        const contents = Array.from(section.querySelectorAll("[data-reveal-part='content']"))
          .filter((element) => !element.querySelector("[data-reveal-part='content']"));
        contents.forEach(element => {
          const inner = element.querySelector(":scope > [data-reveal-inner]");
          // Scene rows already own their entrances. Never stack a second reveal
          // on the entire accordion or let a moving block observe itself.
          if (element.querySelector("[data-scene-row]")) return;
          const targets = inner || [...element.children];
          if (!inner && !targets.length) return;
          repeatReveal(gsap.from(targets, inner ? { ...MOTION.line } : { ...detailFrom(), ...detailTo() }), element);
        });
      });
      return () => splits.forEach((split) => split.revert());
    });
    return () => media.revert();
  }, { dependencies: [pathname], revertOnUpdate: true });
  return null;
}
