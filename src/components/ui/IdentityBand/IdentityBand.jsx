"use client";
import { createMotionMedia } from "@/lib/motionMedia";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitCharacters } from "@/lib/motionText";
import { MOTION, headingFrom, headingTo } from "@/lib/motionPresets";
import { observeReveal, repeatReveal } from "@/lib/repeatReveal";
gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

export default function IdentityBand() {
  const titleRef = useRef(null);
  const textRef = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const text = textRef.current;
      const split = splitCharacters(text, "identity-letter");
      const entrance = repeatReveal(gsap.from(split.chars, { ...headingFrom(), ...headingTo() }), titleRef.current);
      const bounces = new Map();
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      const resetBounces = () => {
        bounces.forEach((animation) => animation.kill());
        bounces.clear();
        gsap.set(split.chars, { y: 0 });
      };
      const stopObserving = observeReveal(titleRef.current, () => {}, resetBounces);
      const onVisibility = () => { if (document.hidden) resetBounces(); };
      const hover = (event) => {
        const letter = event.target.closest?.(".identity-letter");
        if (!letter || event.pointerType === "touch" || !finePointer.matches || document.hidden || entrance.isActive() || entrance.progress() < 1 || bounces.has(letter)) return;
        const motion = MOTION.letterBounce;
        const height = gsap.utils.clamp(motion.minHeight, motion.maxHeight, parseFloat(getComputedStyle(letter).fontSize) * motion.heightRatio);
        // Animate from the current resting position, without rotation or skew.
        // Ignore re-entry while airborne so the moving glyph cannot retrigger itself.
        const bounce = gsap.timeline({ onComplete: () => bounces.delete(letter) })
          .to(letter, { y: -height, duration: motion.rise, ease: MOTION.ease })
          .to(letter, { y: height * motion.reboundRatio, duration: motion.fall, ease: "power2.inOut" })
          .to(letter, { y: 0, duration: motion.settle, ease: MOTION.ease });
        bounces.set(letter, bounce);
      };
      text.addEventListener("pointerover", hover);
      document.addEventListener("visibilitychange", onVisibility);
      return () => { text.removeEventListener("pointerover", hover); document.removeEventListener("visibilitychange", onVisibility); stopObserving(); resetBounces(); gsap.killTweensOf(split.chars); split.revert(); };
    });
    return () => media.revert();
  }, { scope: titleRef });

  useLayoutEffect(() => {
    const title = titleRef.current;
    const text = textRef.current;

    if (!title || !text) {
      return undefined;
    }

    let frame = null;
    let lastWidth = 0;

    function fitTitle(force = false) {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }

      frame = window.requestAnimationFrame(() => {
        const availableWidth = title.getBoundingClientRect().width;

        if (!force && Math.abs(availableWidth - lastWidth) < 0.5) {
          return;
        }

        title.style.fontSize = "";

        const currentSize = Number.parseFloat(
          window.getComputedStyle(title).fontSize,
        );
        const textWidth = text.getBoundingClientRect().width;

        if (availableWidth > 0 && textWidth > 0 && currentSize > 0) {
          title.style.fontSize = `${
            currentSize * (availableWidth / textWidth) * 0.995
          }px`;
          lastWidth = availableWidth;
        }
      });
    }

    const resizeObserver = new ResizeObserver(() => fitTitle());
    resizeObserver.observe(title);
    fitTitle(true);

    document.fonts?.ready.then(() => fitTitle(true));

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }

      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section
      data-header-theme="light"
      className="ui-identity relative overflow-hidden border-y border-black/10 bg-white py-6 text-black md:py-8 lg:py-12"
      style={{ containerType: "inline-size" }}
      aria-labelledby="identity-band-title"
    >
      <div className="relative z-10 grid gap-4 md:gap-5">
        <p className="m-0 flex flex-col text-[10px] leading-tight font-extrabold text-black/80 lowercase md:text-[11px]">
          <span>frontend detail.</span>
          <span>visual motion.</span>
        </p>

        <h2
          id="identity-band-title"
          ref={titleRef}
          className="gradient-text-flow m-0 block w-full overflow-visible whitespace-nowrap text-[clamp(28px,11cqw,220px)] leading-[0.84] font-black tracking-[-0.04em] uppercase"
        >
          <span ref={textRef} className="inline-block whitespace-nowrap">
            Furkancosar
          </span>
        </h2>
      </div>
    </section>
  );
}
