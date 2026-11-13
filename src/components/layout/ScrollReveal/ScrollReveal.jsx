"use client";
import { createMotionMedia } from "@/lib/motionMedia";

import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION, detailFrom, detailTo } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ScrollReveal() {
  const pathname = usePathname();
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("main .ui-section-label").forEach(label => {
        const inner = label.querySelector("[data-mini-title-inner]");
        if (!inner) return;
        repeatReveal(gsap.fromTo(inner,
          { yPercent: MOTION.miniTitle.yPercent },
          { ...MOTION.miniTitle, yPercent: 0 }), inner.parentElement);
      });
      document.querySelectorAll("main section[data-scroll-reveal='sequence']").forEach((section) => {
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
    });
    return () => media.revert();
  }, { dependencies: [pathname], revertOnUpdate: true });
  return null;
}
