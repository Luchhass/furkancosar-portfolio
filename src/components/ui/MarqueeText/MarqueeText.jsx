"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function getDurationSeconds(duration) {
  if (typeof duration === "number") {
    return duration;
  }

  const normalizedDuration = String(duration).trim();
  const value = Number.parseFloat(normalizedDuration);

  if (!Number.isFinite(value) || value <= 0) {
    return 36;
  }

  return normalizedDuration.endsWith("ms") ? value / 1000 : value;
}

export default function MarqueeText({
  text,
  className = "",
  duration = "44s",
  repeat = 12,
}) {
  const sectionRef = useRef(null);
  const revealMaskRef = useRef(null);
  const revealInnerRef = useRef(null);
  const trackRef = useRef(null);
  const groupRef = useRef(null);

  const label = String(text || "").trim();
  const durationSeconds = getDurationSeconds(duration);

  const items = useMemo(
    () => Array.from({ length: repeat }, (_, index) => index),
    [repeat],
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

  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;

    if (!track || !group) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (prefersReducedMotion.matches) {
      track.style.transform = "translate3d(0, 0, 0)";
      return undefined;
    }

    let frame = null;
    let groupWidth = 0;
    let offset = 0;
    let lastTime = 0;

    function measureGroup() {
      groupWidth = group.getBoundingClientRect().width;
      offset = groupWidth > 0 ? offset % groupWidth : 0;
    }

    function animate(time) {
      if (lastTime === 0) {
        lastTime = time;
      }

      if (groupWidth > 0) {
        const delta = time - lastTime;
        const speed = groupWidth / (durationSeconds * 1000);

        offset = (offset + delta * speed) % groupWidth;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      lastTime = time;
      frame = window.requestAnimationFrame(animate);
    }

    function start() {
      if (frame !== null) return;

      lastTime = 0;
      frame = window.requestAnimationFrame(animate);
    }

    function stop() {
      if (frame === null) return;

      window.cancelAnimationFrame(frame);
      frame = null;
      lastTime = 0;
    }

    measureGroup();

    const resizeObserver = new ResizeObserver(measureGroup);
    resizeObserver.observe(group);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          start();
        } else {
          stop();
        }
      },
      { rootMargin: "120px" },
    );

    intersectionObserver.observe(track);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      track.style.transform = "";
    };
  }, [durationSeconds, items, label]);

  if (!label) return null;

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      className={`gradient-bg-flow overflow-hidden px-8 py-6 text-white md:px-10 md:py-8 lg:px-16 lg:py-12 ${className}`}
      aria-label={label}
    >
      <div ref={revealMaskRef}>
        <div ref={revealInnerRef}>
          <div
            ref={trackRef}
            className="flex w-max will-change-transform"
            aria-hidden="true"
          >
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                ref={groupIndex === 0 ? groupRef : undefined}
                className="flex shrink-0 items-center gap-8 pr-8 md:gap-10 md:pr-10 lg:gap-16 lg:pr-16"
              >
                {items.map((index) => (
                  <span
                    key={`${groupIndex}-${index}`}
                    className="shrink-0 text-[44px] leading-[0.9] font-black tracking-[-0.04em] whitespace-nowrap text-white uppercase md:text-[80px] lg:text-[120px]"
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
