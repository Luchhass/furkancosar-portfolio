"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import GradientActionButton from "@/components/ui/GradientActionButton/GradientActionButton";
import RevealCounter, { playRevealCounters } from "@/components/ui/RevealCounter/RevealCounter";
import { GeometricPentagonBackground } from "../Backgrounds/GeometricPentagonBackground";

gsap.registerPlugin(useGSAP);

function normalizeCopyLines(copyLines) {
  if (Array.isArray(copyLines)) {
    return copyLines.filter(Boolean);
  }

  return String(copyLines || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function Hero({ titleLines, copyLines, stat, action, copyClassName = "" }) {
  const heroRef = useRef(null);
  const pathname = usePathname();
  const heroCopyLines = normalizeCopyLines(copyLines);
  const heroCopyText = heroCopyLines.join(" ");

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (prefersReducedMotion.matches) return;

      const q = gsap.utils.selector(heroRef);
      const isHome = pathname === "/";

      const isVisibleElement = (element) => {
        if (!(element instanceof HTMLElement)) return false;

        const rect = element.getBoundingClientRect();

        return rect.width > 0 && rect.height > 0;
      };

      const headerProjectsLink = document.querySelector(
        "[data-hero-intro='projects-link']",
      );
      const headerFullscreenButton = document.querySelector(
        "[data-hero-intro='fullscreen-button']",
      );
      const headerBrand = document.querySelector("[data-hero-intro='brand']");
      const headerMenuButton = document.querySelector(
        "[data-hero-intro='menu-button']",
      );

      const headerBrandIntroTarget = isHome ? null : headerBrand;

      const headerLeftItems = [
        headerProjectsLink,
        headerFullscreenButton,
      ].filter(isVisibleElement);
      const headerCenterItems = [headerBrandIntroTarget].filter(
        isVisibleElement,
      );
      const headerRightItems = [headerMenuButton].filter(isVisibleElement);

      const headerItems = [
        ...headerLeftItems,
        ...headerCenterItems,
        ...headerRightItems,
      ];

      const titleItems = [...q("[data-hero-title]")].filter(isVisibleElement);
      const statItems = [...q("[data-hero-stat]")].filter(isVisibleElement);
      const copyItems = [...q("[data-hero-copy-line]")].filter(
        isVisibleElement,
      );
      const buttonItems = [...q("[data-hero-button]")].filter(isVisibleElement);
      const buttonFillItems = [
        ...q("[data-hero-button] .gradient-action-fill"),
      ].filter(isVisibleElement);

      const brandOnlyHold = isHome ? 0.26 : 0.14;
      const chainGap = 0.14;
      const detailDuration = 0.82;
      const titleDuration = 1.04;
      const titleLineGap = 0.12;

      let cursor = brandOnlyHold;

      const nextStart = () => {
        const start = cursor;
        cursor += chainGap;
        return start;
      };

      const headerLeftStart = headerLeftItems.length ? nextStart() : null;
      const headerCenterStart = headerCenterItems.length ? nextStart() : null;
      const headerRightStart = headerRightItems.length ? nextStart() : null;
      const statStart = statItems.length ? nextStart() : null;
      const buttonStart = buttonItems.length ? nextStart() : null;
      const copyStart = copyItems.length ? nextStart() : null;
      const titleStart = cursor;

      const lastTitleStart =
        titleStart + Math.max(titleItems.length - 1, 0) * titleLineGap;

      const buttonReleaseStart = lastTitleStart + 0.9;

      gsap.set(headerItems, {
        autoAlpha: 1,
        y: -34,
        scale: 0.985,
        willChange: "transform",
      });

      gsap.set([...statItems, ...buttonItems], {
        autoAlpha: 1,
        yPercent: 118,
        rotateX: -7,
        scaleY: 1.025,
        transformOrigin: "50% 100%",
        willChange: "transform",
      });

      gsap.set(copyItems, {
        autoAlpha: 1,
        yPercent: 118,
        rotateX: -7,
        scaleY: 1.025,
        transformOrigin: "50% 100%",
        willChange: "transform",
      });

      titleItems.forEach((item, index) => {
        const comesFromLeft = index % 2 === 0;

        gsap.set(item, {
          autoAlpha: 1,
          xPercent: comesFromLeft ? -114 : 114,
          scaleX: 1.045,
          transformOrigin: comesFromLeft ? "0% 50%" : "100% 50%",
          willChange: "transform",
        });
      });

      gsap.set(buttonFillItems, {
        opacity: 1,
        clipPath: "circle(145% at 50% 50%)",
        willChange: "clip-path, opacity",
      });

      const timeline = gsap.timeline({
        paused: true,
      });

      timeline.to({}, { duration: brandOnlyHold });

      if (headerLeftItems.length) {
        timeline.to(
          headerLeftItems,
          {
            y: 0,
            scale: 1,
            duration: detailDuration,
            ease: "power4.out",
            clearProps: "transform,willChange",
          },
          headerLeftStart,
        );
      }

      if (headerCenterItems.length) {
        timeline.to(
          headerCenterItems,
          {
            y: 0,
            scale: 1,
            duration: detailDuration,
            ease: "power4.out",
            clearProps: "transform,willChange",
          },
          headerCenterStart,
        );
      }

      if (headerRightItems.length) {
        timeline.to(
          headerRightItems,
          {
            y: 0,
            scale: 1,
            duration: detailDuration,
            ease: "power4.out",
            clearProps: "transform,willChange",
          },
          headerRightStart,
        );
      }

      if (statItems.length) {
        timeline.call(
          () => {
            playRevealCounters(heroRef.current);
          },
          [],
          statStart + 0.06,
        );

        timeline.to(
          statItems,
          {
            yPercent: 0,
            rotateX: 0,
            scaleY: 1,
            duration: detailDuration,
            ease: "power4.out",
            clearProps: "transform,transformOrigin,willChange",
          },
          statStart,
        );
      }

      if (buttonItems.length) {
        timeline.to(
          buttonItems,
          {
            yPercent: 0,
            rotateX: 0,
            scaleY: 1,
            duration: detailDuration,
            ease: "power4.out",
            clearProps: "transform,transformOrigin,willChange",
          },
          buttonStart,
        );
      }

      if (copyItems.length) {
        timeline.to(
          copyItems,
          {
            yPercent: 0,
            rotateX: 0,
            scaleY: 1,
            duration: detailDuration,
            ease: "power4.out",
            stagger: copyItems.length > 1 ? 0.035 : 0,
            clearProps: "transform,transformOrigin,willChange",
          },
          copyStart,
        );
      }

      titleItems.forEach((item, index) => {
        timeline.to(
          item,
          {
            xPercent: 0,
            scaleX: 1,
            duration: titleDuration,
            ease: "power4.out",
            clearProps: "transform,transformOrigin,willChange",
          },
          titleStart + index * titleLineGap,
        );
      });

      if (buttonFillItems.length) {
        timeline.to(
          buttonFillItems,
          {
            opacity: 0,
            clipPath: "circle(0% at 50% 50%)",
            duration: 0.46,
            ease: "power3.out",
            clearProps: "opacity,clipPath,willChange",
          },
          buttonReleaseStart,
        );
      }

      const playHeroIntro = () => {
        if (timeline.progress() === 0 && !timeline.isActive()) {
          timeline.play();
        }
      };

      const handlePageIntroComplete = (event) => {
        if (!event.detail?.pathname || event.detail.pathname === pathname) {
          playHeroIntro();
        }
      };

      if (window.__pageIntroDoneForPath === pathname) {
        playHeroIntro();
      } else {
        window.addEventListener("page-intro:complete", handlePageIntroComplete);
      }

      return () => {
        window.removeEventListener(
          "page-intro:complete",
          handlePageIntroComplete,
        );
        timeline.kill();
      };
    },
    { dependencies: [pathname], scope: heroRef, revertOnUpdate: true },
  );

  return (
    <section
      ref={heroRef}
      data-hero-fullscreen-surface
      data-header-theme="dark"
      data-scroll-reveal="off"
      className="relative isolate grid h-dvh grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] overflow-x-clip bg-black px-8 py-6 md:px-10 md:py-8 lg:px-16 lg:py-12"
    >
      <GeometricPentagonBackground />

      <div className="relative z-10 row-start-2 flex items-center justify-center">
        <h1 className="m-0 flex flex-col items-center text-center text-[44px] leading-[0.9] font-black tracking-[-0.04em] text-white uppercase md:text-[80px] lg:text-[120px]">
          {titleLines.map((line) => (
            <span key={line.text} className="block overflow-hidden">
              <span
                data-hero-title
                className={`${line.gradient ? "gradient-text-flow " : ""}block`}
              >
                {line.text}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div className="relative z-10 row-start-3 grid w-full grid-cols-2 items-end gap-x-4 gap-y-5 self-end md:flex md:items-end md:justify-between md:gap-6">
        {stat ? (
          <div
            className="pointer-events-auto col-start-1 row-start-2 min-w-0 overflow-hidden pr-3 md:pr-0"
            aria-label={stat.ariaLabel}
          >
            <div data-hero-stat className="flex items-center gap-3">
              <span className="text-[28px] leading-[0.82] font-black md:text-[30px] lg:text-[32px]">
                <RevealCounter
                  value={stat.value}
                  textClassName="gradient-text-flow"
                />
              </span>

              <p className="m-0 text-[13px] leading-tight font-medium text-white/90 md:text-sm lg:text-sm">
                {stat.labelLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>
        ) : (
          <span className="col-start-1 row-start-2" aria-hidden="true" />
        )}

        <p
          className={`col-span-2 row-start-1 m-0 w-full max-w-[46ch] justify-self-center text-center text-[13px] leading-tight font-medium text-white/90 md:max-w-md md:text-sm lg:text-sm ${copyClassName}`}
        >
          <span className="block overflow-hidden md:hidden">
            <span data-hero-copy-line className="block text-wrap">
              {heroCopyText}
            </span>
          </span>

          {heroCopyLines.map((line) => (
            <span key={line} className="hidden overflow-hidden md:block">
              <span data-hero-copy-line className="block text-wrap">
                {line}
              </span>
            </span>
          ))}
        </p>

        {action ? (
          <div className="col-start-2 row-start-2 flex justify-end overflow-hidden">
            <div data-hero-button>
              <GradientActionButton
                href={action.href}
                id={action.id}
                label={action.label}
                rel={action.rel}
                target={action.target}
              />
            </div>
          </div>
        ) : (
          <span className="col-start-2 row-start-2" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
