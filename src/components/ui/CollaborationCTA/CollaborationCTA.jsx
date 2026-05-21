"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GradientActionButton from "../GradientActionButton/GradientActionButton";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CollaborationCTA() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (prefersReducedMotion.matches) return;

      const q = gsap.utils.selector(section);
      const titleItems = q("[data-cta-title]");
      const detailItems = q("[data-cta-detail]");
      const buttonFillItems = q("[data-cta-button] .gradient-action-fill");

      function killCurrent() {
        timelineRef.current?.kill();
        timelineRef.current = null;
        gsap.killTweensOf([...titleItems, ...detailItems, ...buttonFillItems]);
      }

      function resetIntro() {
        killCurrent();

        titleItems.forEach((item, index) => {
          gsap.set(item, {
            autoAlpha: 1,
            xPercent: index % 2 === 0 ? -112 : 112,
            willChange: "transform",
          });
        });

        gsap.set(detailItems, {
          autoAlpha: 1,
          yPercent: 115,
          rotateX: -8,
          transformOrigin: "50% 100%",
          willChange: "transform",
        });

        gsap.set(buttonFillItems, {
          opacity: 1,
          clipPath: "circle(145% at 50% 50%)",
          willChange: "clip-path, opacity",
        });
      }

      function playIntro() {
        resetIntro();

        const timeline = gsap.timeline({
          defaults: {
            ease: "power4.out",
          },
        });

        timeline.to(titleItems, {
          xPercent: 0,
          duration: 1.12,
          stagger: 0.16,
          clearProps: "transform,willChange",
        });

        timeline.to(
          detailItems,
          {
            yPercent: 0,
            rotateX: 0,
            duration: 0.78,
            stagger: 0.08,
            clearProps: "transform,willChange",
          },
          "-=0.5",
        );

        timeline.to(buttonFillItems, {
          opacity: 0,
          clipPath: "circle(0% at 50% 50%)",
          duration: 0.34,
          ease: "power2.out",
          clearProps: "opacity,clipPath,willChange",
        });

        timelineRef.current = timeline;
      }

      function playOut() {
        killCurrent();

        const timeline = gsap.timeline({
          defaults: {
            ease: "power2.inOut",
            overwrite: true,
          },
        });

        timeline.to(
          detailItems,
          {
            yPercent: 115,
            rotateX: -8,
            transformOrigin: "50% 100%",
            duration: 0.36,
            stagger: {
              each: 0.035,
              from: "end",
            },
          },
          0,
        );

        titleItems.forEach((item, index) => {
          timeline.to(
            item,
            {
              xPercent: index % 2 === 0 ? -112 : 112,
              duration: 0.38,
            },
            0,
          );
        });

        timelineRef.current = timeline;
      }

      resetIntro();

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 72%",
        end: "bottom 22%",
        onEnter: playIntro,
        onEnterBack: playIntro,
        onLeave: playOut,
        onLeaveBack: playOut,
      });

      return () => {
        trigger.kill();
        killCurrent();
        gsap.set([...titleItems, ...detailItems, ...buttonFillItems], {
          clearProps:
            "transform,opacity,visibility,clipPath,willChange,transformOrigin",
        });
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      data-scroll-reveal="off"
      className="grid h-dvh grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] bg-black px-8 py-6 text-white md:px-10 md:py-8 lg:px-16 lg:py-12"
      aria-labelledby="collaboration-title"
    >
      <div className="row-start-2 flex flex-col items-center justify-center text-center">
        <h2
          id="collaboration-title"
          className="m-0 flex flex-col items-center text-center text-[44px] leading-[0.9] font-black tracking-[-0.04em] uppercase md:text-[80px] lg:text-[120px]"
        >
          <span className="block overflow-hidden">
            <span data-cta-title className="block">
              LET&apos;S BUILD
            </span>
          </span>

          <span className="block overflow-hidden">
            <span data-cta-title className="gradient-text-flow block">
              TOGETHER
            </span>
          </span>
        </h2>

        <p className="m-0 mt-6 max-w-md text-[13px] leading-tight font-medium text-white/90 md:mt-8 md:text-sm">
          <span className="block overflow-hidden">
            <span data-cta-detail className="block">
              Have an idea, project or interface that needs a clean frontend
              touch?
            </span>
          </span>

          <span className="block overflow-hidden">
            <span data-cta-detail className="block">
              Let&apos;s turn it into a polished web experience.
            </span>
          </span>
        </p>

        <div className="mt-8 w-fit overflow-hidden md:mt-10">
          <div data-cta-detail>
            <div data-cta-button>
              <GradientActionButton
                className="w-fit! px-8"
                href="/contact"
                id="collaboration-contact"
                label="CONTACT ME"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row-start-3 flex flex-col gap-4 self-end md:flex-row md:items-end md:justify-between">
        <p className="m-0 overflow-hidden text-[13px] leading-none font-black tracking-[0.08em] text-white/90 uppercase md:text-sm">
          <span data-cta-detail className="block">
            FURKANCOSAR
            <span className="relative -top-1 ml-1 text-[9px]">&reg;</span>
          </span>
        </p>

        <p className="m-0 max-w-45 overflow-hidden text-left text-[10px] leading-[1.12] font-bold tracking-[0.18em] text-white/60 uppercase md:text-right">
          <span data-cta-detail className="block">
            Open For New Projects
          </span>
        </p>
      </div>
    </section>
  );
}
