"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createMotionMedia } from "@/lib/motionMedia";
import { repeatReveal } from "@/lib/repeatReveal";
import { titleSlideFrom, titleSlideTo } from "@/lib/motionPresets";

gsap.registerPlugin(useGSAP);

export default function TitleLine({ children, className = "", fromRight = false, ...attributes }) {
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      repeatReveal(gsap.fromTo(ref.current.firstElementChild, titleSlideFrom(fromRight), titleSlideTo()), ref.current);
    });
    return () => media.revert();
  }, { scope: ref, dependencies: [fromRight], revertOnUpdate: true });
  return <span ref={ref} className="title-reveal-mask"><span data-title-reveal {...attributes} className={className}>{children}</span></span>;
}
