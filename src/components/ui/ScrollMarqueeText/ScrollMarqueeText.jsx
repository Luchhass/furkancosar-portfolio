"use client";
import { MOTION } from "@/lib/motionPresets";
import { createMotionMedia } from "@/lib/motionMedia";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ScrollMarqueeText({ text }) {
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = ref.current;
      gsap.fromTo(root.querySelector(".outline-track"), { xPercent: -15 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
      gsap.fromTo(root.querySelectorAll(".outline-word"), { "--word-fill": "0%" }, { "--word-fill": "100%", stagger: 0.15, ease: "none", scrollTrigger: { trigger: root, start: "top 85%", end: "bottom 25%", scrub: MOTION.scrub } });
      gsap.to(root.querySelectorAll(".outline-star"), { rotation: 180, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
    });
    return () => media.revert();
  }, { scope: ref });
  return <section ref={ref} className="ui-marquee outline-band" data-header-theme="light" aria-label={text}><div className="outline-track" aria-hidden="true">{[0, 1, 2, 3].map((i) => <div key={i}><span className="outline-word">{text}</span><span className="outline-star"><span>↗</span></span></div>)}</div></section>;
}
