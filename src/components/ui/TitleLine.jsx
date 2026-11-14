"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createMotionMedia } from "@/lib/motionMedia";
import { repeatReveal } from "@/lib/repeatReveal";
import { titleSlideFrom, titleSlideTo } from "@/lib/motionPresets";

gsap.registerPlugin(useGSAP);

export default function TitleLine({ children, className = "", fromRight = false, staggerChildren = 0, ...attributes }) {
  const localize = useLocalizedContent();
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const inner = ref.current.firstElementChild;
      const targets = staggerChildren ? [...inner.children] : inner;
      repeatReveal(gsap.fromTo(targets, titleSlideFrom(fromRight), { ...titleSlideTo(), stagger: staggerChildren }), ref.current);
    });
    return () => media.revert();
  }, { scope: ref, dependencies: [fromRight, staggerChildren, localize], revertOnUpdate: true });
  return localize(<span ref={ref} className="title-reveal-mask"><span data-title-reveal {...attributes} className={className}>{children}</span></span>);
}
