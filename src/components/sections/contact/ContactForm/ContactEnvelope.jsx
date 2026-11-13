"use client";
import GraphicMark from "@/components/ui/GraphicMark";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION } from "@/lib/motionPresets";
import { repeatReveal, loopWhileVisible } from "@/lib/repeatReveal";
import { bindTilt } from "@/lib/pointerMotion";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ContactEnvelope({ progress = 0, sending = false }) {
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = ref.current;
      repeatReveal(gsap.from(root.querySelector(".envelope-object"), { y: MOTION.detail.y, rotation: -12, scale: .7, duration: MOTION.detail.duration, ease: MOTION.ease }), root);
      gsap.to(root.querySelector(".envelope-orbit"), { rotation: 120, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
      return bindTilt(root, root.querySelector(".envelope-tilt"));
    });
    return () => media.revert();
  }, { scope: ref });
  useGSAP(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = ref.current;
    gsap.to(root.querySelector(".envelope-letter"), { y: -25 - progress * 45, rotation: -4 + progress * 7, duration: reduced ? 0 : 0.8, ease: "power3.out" });
    gsap.to(root.querySelector(".envelope-progress i"), { scaleX: progress, duration: reduced ? 0 : 0.6, ease: "power3.out" });
    if (sending && !reduced) {
      const loop = gsap.to(root.querySelector(".envelope-tilt"), { y: -12, rotationZ: 3, yoyo: true, repeat: -1, duration: MOTION.idle.duration, ease: MOTION.idle.ease });
      loopWhileVisible(loop, root);
      return () => loop.kill();
    }
  }, { scope: ref, dependencies: [progress, sending], revertOnUpdate: true });
  return <div className="contact-envelope" ref={ref} aria-hidden="true">
    <div className="envelope-orbit" />
    <div className="envelope-object"><div className="envelope-tilt"><div className="envelope-back" /><div className="envelope-letter"><span>YOUR NEXT BIG IDEA.</span><b>Let&apos;s make<br /><em>it happen.</em></b><i /><i /><span className="letter-star"><GraphicMark /></span></div><div className="envelope-front"><span>FURKANCOSAR®</span><b><GraphicMark variant="arrow" /></b></div></div></div>
    <div className="envelope-progress"><i /></div><p>{sending ? "YOUR IDEA IS TAKING FLIGHT" : progress === 1 ? "READY WHEN YOU ARE" : "A GOOD CONVERSATION STARTS HERE"}</p>
  </div>;
}
