"use client";
import { createMotionMedia } from "@/lib/motionMedia";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GradientActionButton from "../GradientActionButton/GradientActionButton";
import { MOTION, titleSlideFrom, titleSlideTo, detailFrom, detailTo } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";
import { bindMagnet } from "@/lib/pointerMotion";
import ReadingText from "@/components/ui/ReadingText";
gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CollaborationCTA() {
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = ref.current;
      root.querySelectorAll("[data-cta-title]").forEach((line, index) => {
        repeatReveal(gsap.fromTo(line, titleSlideFrom(index % 2 === 1), titleSlideTo()), line.parentElement);
      });
      root.querySelectorAll("[data-cta-detail]").forEach(detail => {
        if (detail.tagName === "P") return;
        repeatReveal(gsap.from(detail.querySelector("[data-cta-reveal]"), { ...detailFrom(), ...detailTo() }), detail);
      });
      gsap.fromTo(root.querySelector(".cta-title-first"), { xPercent: -7 }, { xPercent: 7, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
      gsap.fromTo(root.querySelector(".cta-title-second"), { xPercent: 7 }, { xPercent: -7, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
      const followers = Array.from(root.querySelectorAll("[data-cta-follow]"));
      const cleanups = followers.map((element) => bindMagnet(element.parentElement, element));
      return () => cleanups.forEach((cleanup) => cleanup());
    });
    return () => media.revert();
  }, { scope: ref });
  return <section ref={ref} className="ui-screen ui-section ui-cta collaboration-scene" data-header-theme="dark" aria-labelledby="collaboration-title">
    <div className="cta-liquid-backdrop" style={{ backgroundImage: "url('/images/cta-liquid-sculpture.png')" }} aria-hidden="true" />
    <div className="cta-center">
      <h2 id="collaboration-title"><span className="cta-title-first" data-cta-follow><span className="title-reveal-mask"><span data-cta-title data-title-reveal>LET&apos;S BUILD</span></span></span><span className="cta-title-second" data-cta-follow><span className="title-reveal-mask"><span data-cta-title data-title-reveal className="gradient-text-flow">TOGETHER</span></span></span></h2>
      <p data-cta-detail className="cta-description"><span data-cta-reveal className="inline-block"><span data-cta-follow className="inline-block"><ReadingText as="span" className="block">Have an idea, project or interface that needs a clean frontend touch? Let&apos;s turn it into a polished web experience.</ReadingText></span></span></p>
      <div data-cta-detail><div data-cta-reveal><div data-cta-follow><GradientActionButton className="w-fit! px-8" href="/contact" id="collaboration-contact" label="LET’S MAKE IT HAPPEN" /></div></div></div>
    </div>
  </section>;
}
