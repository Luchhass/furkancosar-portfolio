"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION, detailTo } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";
import { createMotionMedia } from "@/lib/motionMedia";
import RevealTextLine from "@/components/layout/ScrollReveal/RevealTextLine";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function Highlight({ children }) {
  return <span data-about-highlight className="relative inline-block"><span className="relative z-10">{children}</span><span data-about-highlight-fill className="gradient-text-flow pointer-events-none absolute inset-0 z-20 opacity-0" aria-hidden="true">{children}</span></span>;
}

function TextLine({ children }) {
  return <RevealTextLine innerAttributes={{ "data-about-line": true }}>{children}</RevealTextLine>;
}

export default function AboutMeIntro() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    const content = contentRef.current;
    if (!content) return undefined;
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const highlightFills = content.querySelectorAll("[data-about-highlight-fill]");
      repeatReveal(gsap.fromTo(highlightFills, { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, ...detailTo(), delay: MOTION.detail.stagger }), content);
    });
    return () => media.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} data-header-theme="light" data-scroll-reveal="sequence" className="ui-screen ui-screen-scroll about-now relative overflow-hidden bg-white ui-section text-black" aria-labelledby="about-intro-title">
      <div className="ui-section-grid">
        <p data-reveal-part="kicker" className="ui-section-label text-black/55"><span data-reveal-inner>NOW</span></p>
        <div className="ui-section-body ui-section-stack">
          <h2 id="about-intro-title" data-reveal-part="title" className="ui-section-title flex flex-col"><span>What I&apos;m</span><span className="gradient-text-flow">Doing</span></h2>
          <div ref={contentRef} className="grid max-w-2xl gap-3">
            <p className="ui-section-copy text-black/65"><TextLine>I&apos;m a <Highlight>Frontend Developer</Highlight> and final-year Web Design student at Istanbul University. Through internships, <Highlight>freelance projects</Highlight> and startup work, I&apos;ve gained hands-on experience turning ideas into responsive, user-focused interfaces. I combine design, code and thoughtful motion to create digital experiences that feel clear and polished across every screen. Alongside my studies, I continue to develop my skills through real projects, exploring new technologies and paying close attention to the details that make an interface enjoyable to use.</TextLine></p>
          </div>
        </div>
      </div>
      <span className="about-curious-badge" aria-hidden="true"><span>Stay</span><span>curious</span></span>
    </section>
  );
}
