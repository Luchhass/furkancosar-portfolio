"use client";
import GraphicMark from "@/components/ui/GraphicMark";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION, headingFrom, headingTo } from "@/lib/motionPresets";
import { repeatReveal, loopWhileVisible } from "@/lib/repeatReveal";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function MarqueeText({ text, className = "", duration = "44s", repeat = 4 }) {
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = ref.current; const track = root.querySelector(".kinetic-track");
      const seconds = MOTION.marqueeDuration;
      const loop = gsap.to(track, { xPercent: -50, duration: seconds, repeat: -1, ease: "none", paused: true });
      const settle = gsap.quickTo(loop, "timeScale", { ...MOTION.pointer });
      ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onUpdate: (self) => settle(1 + Math.min(Math.abs(self.getVelocity()) / MOTION.marqueeVelocityDivisor, MOTION.marqueeMaxBoost)) });
      loopWhileVisible(loop, root);
      repeatReveal(gsap.from(root.querySelectorAll(".kinetic-word"), { ...headingFrom(), ...headingTo() }), root);
      return () => settle.tween.kill();
    });
    return () => media.revert();
  }, { scope: ref, dependencies: [text, duration], revertOnUpdate: true });
  return <section ref={ref} className={`ui-marquee kinetic-band gradient-bg-flow ${className}`} data-header-theme="dark" aria-label={text}>
    <div className="kinetic-track" aria-hidden="true">{[0, 1].map((group) => <div className="kinetic-group" key={group}>{Array.from({ length: repeat }, (_, i) => <div className="kinetic-item" key={i}><span className="kinetic-word">{text}</span><span className="kinetic-star"><GraphicMark /></span></div>)}</div>)}</div>
  </section>;
}
