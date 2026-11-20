"use client";
import { MOTION } from "@/lib/motionPresets";
import { createMotionMedia } from "@/lib/motionMedia";
import { createSectionScroll } from "@/lib/sectionScroll";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MotionExperience() {
  const pathname = usePathname();
  useEffect(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => createSectionScroll());
    return () => media.revert();
  }, [pathname]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("main section, footer"));
    const visibility = new Map();
    const sync = (section, visible) => {
      const value = visible && !document.hidden ? "true" : "false";
      if (section.dataset.motionActive === value) return;
      section.dataset.motionActive = value;
      section.querySelectorAll("svg").forEach((svg) => value === "true" ? svg.unpauseAnimations?.() : svg.pauseAnimations?.());
    };
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      visibility.set(entry.target, entry.isIntersecting);
      sync(entry.target, entry.isIntersecting);
    }), { rootMargin: "0px", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    const onVisibility = () => visibility.forEach((visible, section) => sync(section, visible));
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      sections.forEach((section) => { delete section.dataset.motionActive; section.querySelectorAll("svg").forEach((svg) => svg.unpauseAnimations?.()); });
    };
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.setProperty("--motion-orbit-duration", `${MOTION.orbitDuration}s`);
  }, []);

  return null;
}
