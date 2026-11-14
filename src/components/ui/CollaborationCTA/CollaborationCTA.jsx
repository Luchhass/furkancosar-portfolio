"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { createMotionMedia } from "@/lib/motionMedia";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GradientActionButton from "../GradientActionButton/GradientActionButton";
import { MOTION, titleSlideFrom, titleSlideTo } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";
import LetterReel from "@/components/ui/LetterReel";
import CTALighting from "./CTALighting";
import { bindMagnet } from "@/lib/pointerMotion";
import ReadingText from "@/components/ui/ReadingText";
gsap.registerPlugin(useGSAP, ScrollTrigger);
const rotatingWords = ["TOGETHER", "SOMETHING", "YOUR IDEA"];

export default function CollaborationCTA() {
  const localize = useLocalizedContent();
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
        repeatReveal(gsap.fromTo(detail.querySelector("[data-cta-reveal]"),
          { scale: 0, transformOrigin: "50% 50%" },
          { scale: 1, duration: .65, ease: "back.out(1.25)", force3D: false }), detail);
      });
      gsap.fromTo(root.querySelector(".cta-title-first"), { xPercent: -7 }, { xPercent: 7, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
      gsap.fromTo(root.querySelector(".cta-title-second"), { xPercent: 7 }, { xPercent: -7, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: MOTION.scrub } });
      const followers = Array.from(root.querySelectorAll("[data-cta-follow]"));
      const cleanups = followers.map((element) => bindMagnet(element.parentElement, element, 0.3));
      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    });
    return () => media.revert();
  }, { scope: ref });
  return localize(<section ref={ref} className="ui-screen ui-section ui-cta collaboration-scene" data-header-theme="dark" aria-labelledby="collaboration-title">
    <CTALighting />
    <div className="cta-center">
      <h2 id="collaboration-title" aria-label="Let’s build together"><span className="cta-title-first"><span className="title-reveal-mask"><span data-cta-title data-title-reveal>LET&apos;S BUILD</span></span></span><span className="cta-title-second" aria-hidden="true"><span className="title-reveal-mask"><span data-cta-title data-title-reveal><span className="relative block overflow-hidden"><span className="invisible whitespace-nowrap">SOMETHING</span><LetterReel words={rotatingWords} /></span></span></span></span></h2>
      <p className="cta-description"><ReadingText as="span" className="block">Have an idea, project or interface that needs a clean frontend touch? Let&apos;s turn it into a polished web experience.</ReadingText></p>
      <div data-cta-detail><div data-cta-follow><div data-cta-reveal><GradientActionButton showDot={false} className="w-fit! px-8" href="/contact" id="collaboration-contact" label="LET’S MAKE IT HAPPEN" /></div></div></div>
    </div>
  </section>);
}
