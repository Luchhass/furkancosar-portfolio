"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { MOTION } from "@/lib/motionPresets";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
gsap.registerPlugin(useGSAP, ScrollToPlugin, ScrollTrigger);

export default function BackToTop() {
  const localize = useLocalizedContent();
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);
  const ringRef = useRef(null);
  const capsuleRef = useRef(null);
  const pathname = usePathname();
  useGSAP(() => {
    gsap.fromTo([ringRef.current, capsuleRef.current], { strokeDashoffset: (index) => index === 0 ? 151 : 337 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: MOTION.progressScrub } });
  }, { dependencies: [pathname], revertOnUpdate: true });

  useEffect(() => {
    function isAtPageBottom() {
      const scrollingElement = document.scrollingElement || document.documentElement;
      const maxScrollY = Math.max(
        0,
        scrollingElement.scrollHeight - window.innerHeight,
      );

      return window.scrollY >= maxScrollY - 2;
    }

    function updateVisibility() {
      const nextIsVisible = window.scrollY > 240 && !isAtPageBottom();

      if (isVisibleRef.current === nextIsVisible) return;

      isVisibleRef.current = nextIsVisible;
      setIsVisible(nextIsVisible);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  function scrollToTop() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { window.scrollTo(0, 0); return; }
    gsap.to(window, { scrollTo: { y: 0, autoKill: true }, ...MOTION.scrollTo, overwrite: "auto" });
  }

  return (
    localize(<button
      type="button"
      data-back-to-top
      aria-label="Back to top"
      onClick={scrollToTop}
      className={`gradient-bg-flow group fixed right-5 bottom-5 z-70 flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full text-white shadow-[0_18px_45px_rgba(0,0,0,.24)] hover:w-34 focus-visible:w-34 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:right-auto md:bottom-8 md:left-8 md:h-13 md:w-13 md:hover:w-36 md:focus-visible:w-36 ${
        isVisible
          ? "pointer-events-auto backtop-visible"
          : "pointer-events-none backtop-hidden"
      }`}
    >
      <svg className="backtop-progress" viewBox="0 0 56 56" aria-hidden="true"><circle ref={ringRef} cx="28" cy="28" r="24" fill="none" stroke="white" strokeOpacity=".6" strokeWidth="1" strokeDasharray="151" strokeDashoffset="151" /></svg>
      <svg className="backtop-progress-capsule" viewBox="0 0 144 48" preserveAspectRatio="none" aria-hidden="true"><rect ref={capsuleRef} x="1" y="1" width="142" height="46" rx="23" fill="none" stroke="white" strokeOpacity=".6" strokeWidth="1" strokeDasharray="337" strokeDashoffset="337" /></svg>
      <ArrowUp
        className="absolute h-4.5 w-4.5 stroke-3 transition-transform duration-300 group-hover:translate-y-[-220%] group-focus-visible:translate-y-[-220%]"
        aria-hidden="true"
      />

      <span className="absolute -bottom-5 text-[10px] leading-none font-black tracking-[0.08em] whitespace-nowrap uppercase opacity-0 transition-[bottom,opacity] duration-300 group-hover:bottom-5 group-hover:opacity-100 group-focus-visible:bottom-5 group-focus-visible:opacity-100">
        BACK TO TOP
      </span>
    </button>)
  );
}
