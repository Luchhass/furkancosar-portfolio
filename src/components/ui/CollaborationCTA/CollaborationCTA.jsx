"use client";
import { createMotionMedia } from "@/lib/motionMedia";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import GradientActionButton from "../GradientActionButton/GradientActionButton";
import { splitCharacters } from "@/lib/motionText";
import { MOTION, headingFrom, headingTo, detailFrom, detailTo } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";
import { bindMagnet } from "@/lib/pointerMotion";
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export default function CollaborationCTA() {
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = ref.current;
      const splits = Array.from(root.querySelectorAll("[data-cta-title]")).map((line) => splitCharacters(line));
      const entrance = gsap.timeline();
      splits.forEach((split, i) => entrance.from(split.chars, { ...headingFrom(), ...headingTo() }, .12 + i * MOTION.heading.lineGap));
      entrance.from(root.querySelectorAll("[data-cta-detail]"), { ...detailFrom(), ...detailTo() }, .35);
      repeatReveal(entrance, root);
      gsap.fromTo(root.querySelector(".cta-title-first"), { xPercent: -7 }, { xPercent: 7, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
      gsap.fromTo(root.querySelector(".cta-title-second"), { xPercent: 7 }, { xPercent: -7, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
      const followers = Array.from(root.querySelectorAll("[data-cta-follow]"));
      const cleanups = followers.map((element) => bindMagnet(element.parentElement, element));
      return () => { cleanups.forEach((cleanup) => cleanup()); splits.forEach((split) => split.revert()); };
    });
    return () => media.revert();
  }, { scope: ref });
  return <section ref={ref} className="ui-screen ui-section ui-cta collaboration-scene" data-header-theme="dark" aria-labelledby="collaboration-title">
    <div className="cta-liquid-backdrop" style={{ backgroundImage: "url('/images/cta-liquid-sculpture.png')" }} aria-hidden="true" />
    <div className="cta-center">
      <h2 id="collaboration-title"><span className="cta-title-first" data-cta-follow><span data-cta-title>LET&apos;S BUILD</span></span><span className="cta-title-second" data-cta-follow><span data-cta-title className="gradient-text-flow">TOGETHER</span></span></h2>
      <p data-cta-detail className="cta-description"><span data-cta-follow className="inline-block">Have an idea, project or interface that needs a clean frontend touch? Let&apos;s turn it into a polished web experience.</span></p>
      <div data-cta-detail><div data-cta-follow><GradientActionButton className="w-fit! px-8" href="/contact" id="collaboration-contact" label="LET’S MAKE IT HAPPEN" /></div></div>
    </div>
  </section>;
}
