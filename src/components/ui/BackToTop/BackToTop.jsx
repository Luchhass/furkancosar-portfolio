"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    function updateVisibility() {
      const nextIsVisible = window.scrollY > 240;

      if (isVisibleRef.current === nextIsVisible) return;

      isVisibleRef.current = nextIsVisible;
      setIsVisible(nextIsVisible);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={`gradient-bg-flow group fixed right-5 bottom-5 z-70 flex h-13 w-13 cursor-pointer items-center justify-center overflow-hidden rounded-full text-white shadow-[0_18px_45px_rgba(0,0,0,.24)] transition-[width,opacity,transform,filter,border-radius] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:w-36 hover:brightness-110 focus-visible:w-36 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cf3d9f] md:right-auto md:bottom-8 md:left-8 md:h-14 md:w-14 md:hover:w-38 md:focus-visible:w-38 ${
        isVisible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-16 scale-100 opacity-0"
      }`}
    >
      <ArrowUp
        className="absolute h-5 w-5 stroke-3 transition-transform duration-300 group-hover:translate-y-[-220%] group-focus-visible:translate-y-[-220%]"
        aria-hidden="true"
      />

      <span className="absolute -bottom-5 text-[11px] leading-none font-black tracking-[0.08em] whitespace-nowrap uppercase opacity-0 transition-[bottom,opacity] duration-300 group-hover:bottom-5 group-hover:opacity-100 group-focus-visible:bottom-5 group-focus-visible:opacity-100">
        BACK TO TOP
      </span>
    </button>
  );
}
