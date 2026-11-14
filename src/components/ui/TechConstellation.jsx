"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION } from "@/lib/motionPresets";
import { repeatReveal, loopWhileVisible } from "@/lib/repeatReveal";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function TechConstellation({ items = [] }) {
  const localize = useLocalizedContent();
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = ref.current;
      const icons = root.querySelectorAll(".constellation-node");
      const timeline = gsap.timeline();
      timeline.from(root.querySelectorAll(".constellation-ring"), { scale: 0.25, opacity: 0, stagger: MOTION.pop.stagger, duration: MOTION.pop.duration, ease: MOTION.pop.ease }, 0)
        .from(icons, { scale: MOTION.pop.scale, rotation: MOTION.pop.rotation, opacity: 0, stagger: MOTION.pop.stagger, duration: MOTION.pop.duration, ease: MOTION.pop.ease }, 0.25);
      repeatReveal(timeline, root);
      const orbit = gsap.to(root.querySelector(".constellation-system"), { rotation: 360, duration: MOTION.orbitDuration, repeat: -1, ease: "none", paused: true });
      const counter = gsap.to(root.querySelectorAll(".constellation-node > *"), { rotation: -360, duration: MOTION.orbitDuration, repeat: -1, ease: "none", paused: true });
      loopWhileVisible(orbit, root);
      loopWhileVisible(counter, root);
    });
    return () => media.revert();
  }, { scope: ref, dependencies: [items], revertOnUpdate: true });
  return localize(<div ref={ref} className="tech-constellation" role="list" aria-label="Tools in this group"><span className="sculpture-caption">A TOOLKIT. NOT A LIMIT.</span><div className="constellation-system"><div className="constellation-ring" /><div className="constellation-ring inner" />{items.map((item, i, all) => <span className="constellation-node" role="listitem" key={item.name} title={item.name} style={{ left: `${(50 + Math.cos(i / all.length * Math.PI * 2) * 39).toFixed(3)}%`, top: `${(50 + Math.sin(i / all.length * Math.PI * 2) * 39).toFixed(3)}%` }}><Image src={item.logo} alt="" width={30} height={30} /><span className="constellation-name">{item.name}</span></span>)}</div><span className="constellation-core gradient-text-flow">&lt;/&gt;</span></div>);
}
