"use client";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION } from "@/lib/motionPresets";
import { repeatReveal, loopWhileVisible } from "@/lib/repeatReveal";
import { bindTilt } from "@/lib/pointerMotion";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

const labels = ["STRUCTURE", "DETAIL", "FLOW"];
export default function InterfaceSculpture({ active = 0 }) {
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = ref.current;
      const stack = root.querySelector(".interface-stack");
      const layers = root.querySelectorAll(".interface-layer");
      repeatReveal(gsap.from(layers, { y: MOTION.detail.y, rotationX: 65, rotationZ: -18, opacity: 0, stagger: MOTION.detail.stagger, duration: MOTION.detail.duration, ease: MOTION.ease }), root);
      gsap.to(stack, { y: -24, rotationZ: 4, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
      const float = gsap.to(root.querySelectorAll(".interface-spark"), { y: -18, rotation: 90, duration: MOTION.idle.duration, stagger: MOTION.idle.stagger, yoyo: true, repeat: -1, ease: MOTION.idle.ease, paused: true });
      loopWhileVisible(float, root);
      return bindTilt(root, stack);
    });
    return () => media.revert();
  }, { scope: ref });
  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(ref.current.querySelectorAll(".interface-layer"), { z: (i) => i === active ? 55 : 0, x: (i) => i === active ? 12 : 0, duration: reduce ? 0 : MOTION.detail.duration, ease: MOTION.ease, overwrite: "auto" });
  }, { scope: ref, dependencies: [active] });
  return <div ref={ref} className="interface-sculpture" aria-hidden="true">
    <span className="sculpture-caption">DESIGN WITH INTENTION. BUILD WITH FEELING.</span>
    <div className="interface-stack">{labels.map((label, i) => <div key={label} className={`interface-layer interface-layer-${i}`} data-active={i === active}>
      <div className="interface-toolbar"><span /><span /><span /><b>0{i + 1} / {label}</b></div>
      {i === 0 ? <div className="interface-wireframe"><span /><span /><span /><span /></div> : i === 1 ? <div className="interface-type">Aa<span className="gradient-text-flow">↗</span></div> : <svg viewBox="0 0 260 100"><path d="M0 80 C60 80 40 20 100 20 S180 95 260 5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="100" cy="20" r="6" fill="currentColor" /></svg>}
    </div>)}</div>
    <span className="interface-spark spark-one">✳</span><span className="interface-spark spark-two">+</span>
    <div className="sculpture-bottom"><span>IDEA</span><i /><span>INTERFACE</span></div>
  </div>;
}
