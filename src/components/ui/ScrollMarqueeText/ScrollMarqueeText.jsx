"use client";

import { useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const REPEAT_COUNT = 12;
const SCROLL_DISTANCE_RATIO = 0.2;
const MAX_SCROLL_DISTANCE_VIEWPORT_RATIO = 1.15;

export default function ScrollMarqueeText({ text }) {
  const sectionRef = useRef(null);
  const revealMaskRef = useRef(null);
  const revealInnerRef = useRef(null);
  const trackRef = useRef(null);

  const label = String(text || "").trim();

  const items = useMemo(
    () => Array.from({ length: REPEAT_COUNT }, (_, index) => index),
    [],
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      const mask = revealMaskRef.current;
      const inner = revealInnerRef.current;

      if (!section || !mask || !inner) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (prefersReducedMotion.matches) return;

      let timeline = null;
      const sectionStepDelay = section.hasAttribute("data-home-section-step")
        ? 0.5
        : 0;

      function resetReveal() {
        timeline?.kill();
        gsap.killTweensOf([mask, inner]);
        gsap.set(mask, { clipPath: "inset(-18% -12% 0% -12%)" });
        gsap.set(inner, {
          autoAlpha: 1,
          yPercent: 115,
          rotateX: -8,
          transformOrigin: "50% 100%",
          willChange: "transform",
        });
      }

      function playReveal() {
        resetReveal();
        timeline = gsap.timeline({
          delay: sectionStepDelay,
          defaults: {
            ease: "power4.out",
            overwrite: true,
          },
          onComplete: () => {
            gsap.set(mask, { clearProps: "clipPath" });
          },
        });

        timeline.to(inner, {
          yPercent: 0,
          rotateX: 0,
          duration: 0.78,
          clearProps: "transform,willChange",
        });
      }

      function playHide() {
        timeline?.kill();
        gsap.killTweensOf([mask, inner]);
        gsap.set(mask, { clipPath: "inset(-18% -12% 0% -12%)" });
        timeline = gsap.to(inner, {
          yPercent: 115,
          rotateX: -8,
          transformOrigin: "50% 100%",
          duration: 0.36,
          ease: "power2.inOut",
          overwrite: true,
          clearProps: "willChange",
        });
      }

      resetReveal();

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 78%",
        end: "bottom 18%",
        onEnter: playReveal,
        onEnterBack: playReveal,
        onLeave: playHide,
        onLeaveBack: playHide,
      });

      return () => {
        trigger.kill();
        timeline?.kill();
        gsap.killTweensOf([mask, inner]);
        gsap.set([mask, inner], {
          clearProps:
            "transform,opacity,visibility,clipPath,willChange,transformOrigin",
        });
      };
    },
    { scope: sectionRef, dependencies: [label] },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;

      if (!section || !track) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (prefersReducedMotion.matches) {
        gsap.set(track, { x: 0 });
        return;
      }

      function getScrollDistance() {
        const trackWidth = track.getBoundingClientRect().width;
        const ratioDistance = trackWidth * SCROLL_DISTANCE_RATIO;
        const maxDistance =
          window.innerWidth * MAX_SCROLL_DISTANCE_VIEWPORT_RATIO;

        return -Math.min(ratioDistance, maxDistance);
      }

      const tween = gsap.to(track, {
        x: getScrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: track,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.kill();
        gsap.set(track, { clearProps: "transform,willChange" });
      };
    },
    { scope: sectionRef, dependencies: [label] },
  );

  if (!label) return null;

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      className="overflow-hidden bg-white px-8 py-6 text-neutral-200 md:px-10 md:py-8 lg:px-16 lg:py-12"
      aria-label={label}
    >
      <div ref={revealMaskRef}>
        <div ref={revealInnerRef}>
          <div
            ref={trackRef}
            className="welcome-band flex w-max will-change-transform"
            aria-hidden="true"
          >
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                className="flex shrink-0 items-center gap-8 pr-8 md:gap-10 md:pr-10 lg:gap-16 lg:pr-16"
              >
                {items.map((index) => (
                  <span
                    key={`${groupIndex}-${index}`}
                    className="shrink-0 text-[44px] leading-[0.9] font-black tracking-[-0.04em] whitespace-nowrap text-current uppercase md:text-[80px] lg:text-[120px]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
