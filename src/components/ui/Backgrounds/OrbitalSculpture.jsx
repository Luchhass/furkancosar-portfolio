"use client";
import { loopWhileVisible } from "@/lib/repeatReveal";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION } from "@/lib/motionPresets";
import { bindTilt } from "@/lib/pointerMotion";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function OrbitalSculpture() {
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = ref.current; const section = root.parentElement;
      const rings = root.querySelectorAll(".orbital-ring");
      const loop = gsap.to(rings, { rotationZ: "+=360", duration: MOTION.orbitDuration, stagger: 2, repeat: -1, ease: "none", paused: true });
      loopWhileVisible(loop, section);
      gsap.fromTo(root, { scale: 0.7, rotation: -25 }, { scale: 1.15, rotation: 25, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
      const releaseTilt = bindTilt(section, root.firstElementChild);
      return releaseTilt;
    });
    return () => media.revert();
  }, { scope: ref });
  return <div ref={ref} className="orbital-sculpture" aria-hidden="true"><div className="orbital-space">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="orbital-ring" style={{ "--ring-index": i }} />)}<div className="orbital-core" /></div></div>;
}
