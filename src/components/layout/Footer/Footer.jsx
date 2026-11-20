"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION, titleSlideFrom, titleSlideTo } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChromeContact, ChromeNavigation, ChromeRings, ChromeSocials } from "../SiteChrome";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Footer() {
  const localize = useLocalizedContent();
  const pathname = usePathname();
  const footerRef = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const footer = footerRef.current;
      const travel = () => Math.min(footer.clientHeight * MOTION.rings.travelRatio, MOTION.rings.travelMax);
      const sideways = () => Math.min(footer.clientWidth * MOTION.rings.sidewaysRatio, MOTION.rings.sidewaysMax);
      const timeline = gsap.timeline({ defaults: { ease: MOTION.rings.ease }, scrollTrigger: { trigger: footer, start: "top bottom", end: "+=180%", scrub: MOTION.scrub, invalidateOnRefresh: true } });
      MOTION.ringPaths.forEach(([fromX, fromY, toX, toY], index) => {
        const name = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][index];
        timeline.fromTo(`.footer-ring-${name}`, { x: () => sideways() * fromX, y: () => travel() * fromY, scale: 1.08 }, { x: () => sideways() * toX, y: () => travel() * toY, scale: 1 }, 0);
      });
    });
    return () => media.revert();
  }, { scope: footerRef, dependencies: [pathname], revertOnUpdate: true });

  useGSAP(() => {
    const media = createMotionMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)" }, ({ conditions }) => {
      if (!conditions.motion) return;
      const footer = footerRef.current;
      const primary = footer.querySelectorAll("h2 [data-footer-primary]");
      const navigation = footer.querySelectorAll("nav [data-footer-primary]");
      const address = footer.querySelectorAll("[data-footer-address-item]");
      const socials = footer.querySelectorAll("[data-footer-social-item]");
      primary.forEach(item => {
        repeatReveal(gsap.fromTo(item, titleSlideFrom(), titleSlideTo()), item.parentElement);
      });
      repeatReveal(gsap.fromTo(navigation, {
        autoAlpha: 1,
        xPercent: conditions.desktop ? MOTION.maskedSlidePercent : -MOTION.maskedSlidePercent,
        transformOrigin: conditions.desktop ? "100% 50%" : "0% 50%",
      }, {
        xPercent: 0,
        duration: MOTION.slide.duration,
        ease: MOTION.slide.ease,
        stagger: { each: 0.12, from: "start" },
      }), footer.querySelector("nav"));
      repeatReveal(gsap.fromTo(address, {
        autoAlpha: 1,
        yPercent: MOTION.line.yPercent,
        rotateX: -6,
        transformOrigin: "50% 100%",
      }, {
        yPercent: 0,
        rotateX: 0,
        duration: MOTION.line.duration,
        ease: "power4.out",
        stagger: MOTION.line.stagger,
      }), footer.querySelector("address"));
      repeatReveal(gsap.fromTo(socials, {
        autoAlpha: 1,
        yPercent: MOTION.line.yPercent,
        scale: 0.94,
        transformOrigin: "50% 100%",
      }, {
        yPercent: 0,
        scale: 1,
        duration: MOTION.line.duration,
        ease: "power4.out",
        stagger: MOTION.line.stagger,
      }), footer.querySelector(".ui-chrome-socials"));
    });
    return () => media.revert();
  }, { scope: footerRef, dependencies: [pathname], revertOnUpdate: true });

  return (
    localize(<footer
      ref={footerRef}
      data-header-theme="dark"
      className="ui-chrome ui-screen portfolio-footer grid grid-rows-[minmax(min-content,1fr)_auto] text-white"
    >
      <ChromeRings />
      <div className="ui-footer-content grid items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] lg:gap-16">
        <h2 className="ui-footer-title m-0 max-w-4xl font-black uppercase">
          <span className="block overflow-hidden">
            <span data-footer-primary className="ui-footer-title-word">
              Designing
            </span>
          </span>

          <span className="block overflow-hidden">
            <span data-footer-primary className="ui-footer-title-word">
              with
            </span>
          </span>

          <span className="block overflow-hidden">
            <span data-footer-primary className="ui-footer-title-word gradient-text-flow">
              purpose
            </span>
          </span>
        </h2>

        <ChromeNavigation pathname={pathname} variant="footer" />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <ChromeContact />

        <ChromeSocials />
      </div>
    </footer>)
  );
}
