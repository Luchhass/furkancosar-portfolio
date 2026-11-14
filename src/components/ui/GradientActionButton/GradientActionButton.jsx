"use client";
import { useLocalizedContent } from "@/lib/localizeContent";

import { useRef } from "react";
import gsap from "gsap";
import { MOTION } from "@/lib/motionPresets";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);

export default function GradientActionButton({
  className = "",
  href = "",
  id = "",
  label = "",
  onClick,
  rel,
  target,
  showDot = true,
}) {
  const localize = useLocalizedContent();
  const ref = useRef(null);
  const { contextSafe } = useGSAP({ scope: ref });
  const updateFillOrigin = contextSafe((event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    button.style.setProperty(
      "--gradient-fill-x",
      `${event.clientX - rect.left}px`,
    );

    button.style.setProperty(
      "--gradient-fill-y",
      `${event.clientY - rect.top}px`,
    );
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(button.querySelector(".button-label-track"), { yPercent: event.type === "pointerenter" || event.type === "focus" ? -50 : 0, duration: MOTION.pointer.duration, ease: MOTION.pointer.ease, overwrite: true });
    }
  });

  return (
    localize(<a
      ref={ref}
      id={id}
      href={href}
      target={target}
      rel={rel}
      className={`ui-button gradient-action-button group pointer-events-auto relative isolate inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden bg-transparent px-5 text-xs leading-none font-black whitespace-nowrap text-white no-underline md:w-41.75 ${className}`}
      onClick={onClick}
      onPointerEnter={updateFillOrigin}
      onPointerLeave={updateFillOrigin}
      onFocus={updateFillOrigin}
      onBlur={updateFillOrigin}
    >
      <span
        className="gradient-action-fill pointer-events-none z-0"
        aria-hidden="true"
      />

      <span
        className="gradient-action-border pointer-events-none z-20"
        aria-hidden="true"
      />

      {showDot && <span
        className="gradient-action-dot relative z-10 h-2 w-2 rounded-full"
        aria-hidden="true"
      />}

      <span className="button-label-window relative z-10"><span className="button-label-track"><span>{label}</span><span aria-hidden="true">{label}</span></span></span>
    </a>)
  );
}
