"use client";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION, titleSlideFrom, titleSlideTo } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contactItems, navigationItems, socialItems } from "@/data/site";
import SocialMediaButtons from "@/components/ui/SocialMediaButtons/SocialMediaButtons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Footer() {
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
    media.add("(prefers-reduced-motion: no-preference)", () => {
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
        xPercent: -MOTION.maskedSlidePercent,
        transformOrigin: "0% 50%",
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

  function updateTitleFillOrigin(event) {
    const link = event.currentTarget;
    const text = link.firstElementChild;
    const rect = (text || link).getBoundingClientRect();

    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

    link.style.setProperty("--gradient-title-fill-x", `${x}px`);
    link.style.setProperty("--gradient-title-fill-y", `${y}px`);
  }

  return (
    <footer
      ref={footerRef}
      data-header-theme="dark"
      className="ui-chrome portfolio-footer grid grid-rows-[minmax(0,1fr)_auto] text-white"
    >
      <div className="footer-backdrop" aria-hidden="true">
        <span className="footer-ring footer-ring-one" />
        <span className="footer-ring footer-ring-two" />
        <span className="footer-ring footer-ring-three" />
        <span className="footer-ring footer-ring-four" />
        <span className="footer-ring footer-ring-five" />
        <span className="footer-ring footer-ring-six" />
        <span className="footer-ring footer-ring-seven" />
        <span className="footer-ring footer-ring-eight" />
        <span className="footer-ring footer-ring-nine" />
      </div>
      <div className="grid min-h-0 items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] lg:gap-16">
        <h2 className="ui-footer-title m-0 max-w-4xl font-black uppercase">
          <span className="block overflow-hidden">
            <span data-footer-primary className="block">
              Designing
            </span>
          </span>

          <span className="block overflow-hidden">
            <span data-footer-primary className="block">
              with
            </span>
          </span>

          <span className="block overflow-hidden">
            <span data-footer-primary className="gradient-text-flow block">
              purpose
            </span>
          </span>
        </h2>

        <nav aria-label="Footer navigation" className="ui-footer-nav lg:justify-self-end">
          <ul className="m-0 flex list-none flex-col gap-1 p-0 lg:items-end">
            {navigationItems.map(({ href, label }) => {
              const isActive = pathname === href;

              return (
                <li key={href} className="w-fit max-w-full overflow-hidden">
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    data-active={isActive ? "true" : undefined}
                    data-footer-primary
                    onPointerEnter={updateTitleFillOrigin}
                    onPointerLeave={updateTitleFillOrigin}
                    className="ui-navigation-link gradient-title-button inline-flex w-fit max-w-full text-[28px] leading-[0.82] font-black tracking-[-0.03em] text-white uppercase no-underline md:text-[30px] lg:text-[32px]"
                  >
                    <span className="gradient-title-text">
                      <span>{label}</span>

                      <span
                        className="gradient-text-flow gradient-title-fill"
                        aria-hidden="true"
                      >
                        {label}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <address className="ui-chrome-contact m-0 flex flex-col items-start gap-3 text-white not-italic lg:flex-row lg:items-center lg:gap-4">
          {contactItems.map((item, index) => (
            <span key={item.href} className="contents">
              <span className="inline-block overflow-hidden">
                <a
                  href={item.href}
                  data-footer-address-item
                  className="group relative inline-block w-fit text-white no-underline"
                >
                  <span className="relative after:absolute after:bottom-[-0.35rem] after:left-0 after:h-0.5 after:w-full after:bg-current after:[clip-path:inset(0_100%_0_0)] after:opacity-90 after:transition-[clip-path] after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:after:[clip-path:inset(0_0_0_0)] group-focus-visible:after:[clip-path:inset(0_0_0_0)]">
                    {item.label}
                  </span>
                </a>
              </span>

              {index === 0 && (
                <span
                  className="hidden overflow-hidden lg:inline-block"
                  aria-hidden="true"
                >
                  <span
                    data-footer-address-item
                    className="inline-block text-white/60"
                  >
                    |
                  </span>
                </span>
              )}
            </span>
          ))}
        </address>

        <ul
          className="ui-chrome-socials m-0 flex list-none items-center p-0"
          aria-label="Social links"
        >
          {socialItems.map((item) => (
            <li key={item.name} className="overflow-hidden rounded-full">
              <SocialMediaButtons
                item={item}
                animationAttribute="data-footer-social-item"
              />
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
