"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RevealTextLine from "@/components/layout/ScrollReveal/RevealTextLine";
import OutlineCirclesBackground from "@/components/ui/Backgrounds/OutlineCirclesBackground";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function Highlight({ children }) {
  return (
    <span data-about-highlight className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <span
        data-about-highlight-fill
        className="gradient-text-flow pointer-events-none absolute inset-0 z-20 opacity-0"
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}

function TextLine({ children }) {
  return (
    <RevealTextLine innerAttributes={{ "data-about-line": true }}>
      {children}
    </RevealTextLine>
  );
}

export default function AboutMeIntro() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(
    () => {
      const content = contentRef.current;
      if (!content) return undefined;

      const highlightFills = gsap.utils.toArray(
        content.querySelectorAll("[data-about-highlight-fill]"),
      );

      gsap.set(highlightFills, { autoAlpha: 0, yPercent: 12 });

      const playHighlights = () => {
        gsap.to(highlightFills, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.58,
          ease: "power3.out",
          stagger: 0.18,
          delay: 0.42,
          overwrite: true,
        });
      };

      const resetHighlights = () => {
        gsap.set(highlightFills, { autoAlpha: 0, yPercent: 12 });
      };

      const trigger = ScrollTrigger.create({
        trigger: content,
        start: "top 70%",
        onEnter: playHighlights,
        onEnterBack: playHighlights,
        onLeaveBack: resetHighlights,
      });

      return () => {
        trigger.kill();
        gsap.killTweensOf(highlightFills);
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      data-scroll-reveal="sequence"
      className="relative isolate min-h-dvh overflow-hidden bg-white px-8 py-20 text-black md:px-10 md:py-24 lg:px-16 lg:py-32"
      aria-labelledby="about-intro-title"
    >
      <OutlineCirclesBackground />

      <div className="relative z-10 grid w-full max-w-205 grid-cols-1 gap-y-5 md:grid-cols-[120px_minmax(0,1fr)] md:gap-x-5 md:gap-y-0 lg:grid-cols-[160px_minmax(0,1fr)]">
        {" "}
        <p
          data-reveal-part="kicker"
          className="m-0 inline-flex items-center gap-2 self-start text-[13px] leading-none font-black tracking-[0.08em] text-black/55 uppercase md:pt-3 md:text-sm"
        >
          <span data-reveal-inner className="inline-flex items-center gap-2">
            <span
              className="gradient-action-dot h-2 w-2 rounded-full"
              aria-hidden="true"
            />
            NOW
          </span>
        </p>
        <div className="grid min-w-0 gap-5 md:col-start-2 md:gap-7">
          <h2
            id="about-intro-title"
            data-reveal-part="title"
            className="m-0 flex flex-col text-[44px] leading-[0.9] font-black tracking-[-0.04em] uppercase md:text-[80px] lg:text-[120px]"
          >
            <span>What I&apos;m</span>
            <span className="gradient-text-flow">Doing</span>
          </h2>

          <div ref={contentRef} className="grid max-w-2xl gap-3">
            <p className="m-0 text-[13px] leading-tight font-medium text-black/65 md:text-sm">
              <TextLine>
                I&apos;m a <Highlight>Frontend Developer</Highlight> and a
                final-year Web Design student
              </TextLine>
              <TextLine>
                at Istanbul University. Throughout my journey, I&apos;ve had the
              </TextLine>
              <TextLine>
                opportunity to intern at several companies, gaining hands-on
              </TextLine>
              <TextLine>
                experience in building modern, responsive and user-focused web
              </TextLine>
              <TextLine>
                interfaces. Alongside my studies, I also work on{" "}
                <Highlight>freelance</Highlight>
              </TextLine>
              <TextLine>
                projects, helping turn ideas into clean and polished digital
              </TextLine>
              <TextLine>
                experiences. I&apos;m currently also actively involved in a
              </TextLine>
              <TextLine>
                <Highlight>startup</Highlight>, where I contribute to real-world
                product development and
              </TextLine>
              <TextLine>
                continue to grow through practical experience.
              </TextLine>
            </p>

            <p className="m-0 text-[13px] leading-tight font-medium text-black/65 md:text-sm">
              <TextLine>
                To further enhance my skills, I completed a Software
              </TextLine>
              <TextLine>
                Specialization course at Ni&#351;anta&#351;&#305; University,
              </TextLine>
              <TextLine>
                where I deepened my knowledge of development practices and
              </TextLine>
              <TextLine>
                technologies. Today, I combine creativity, technical expertise
                and
              </TextLine>
              <TextLine>
                <Highlight>real project</Highlight> experience to craft seamless
                digital experiences.
              </TextLine>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
