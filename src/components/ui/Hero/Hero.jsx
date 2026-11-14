"use client";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION } from "@/lib/motionPresets";
import { bindTilt } from "@/lib/pointerMotion";
import { observeReveal, reverseReveal } from "@/lib/repeatReveal";
import { sequenceReveal } from "@/lib/revealSequence";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GradientActionButton from "@/components/ui/GradientActionButton/GradientActionButton";
import RevealCounter, { playRevealCounters } from "@/components/ui/RevealCounter/RevealCounter";
import { GeometricPentagonBackground } from "../Backgrounds/GeometricPentagonBackground";
import ReadingText from "@/components/ui/ReadingText";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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


      const headerLeftItems = [
        headerProjectsLink,
        headerFullscreenButton,
      ].filter(isVisibleElement);
      const headerCenterItems = (pathname === "/" ? [] : [headerBrand]).filter(
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
      const buttonItems = [...q("[data-hero-button]")].filter(isVisibleElement);
      const cueItems = [...q("[data-hero-cue]")].filter(isVisibleElement);
      const auxiliaryItems = [...statItems, ...buttonItems, ...cueItems];
      const buttonFillItems = [
        ...q("[data-hero-button] .gradient-action-fill"),
      ].filter(isVisibleElement);

      const detailDuration = MOTION.line.duration;
      const titleDuration = MOTION.titleSlide.duration;
      const titleLineGap = MOTION.heading.lineGap;

      const statStart = 0;
      const titleStart = 0;

      const lastTitleStart =
        titleStart + Math.max(titleItems.length - 1, 0) * titleLineGap;

      const buttonReleaseStart = lastTitleStart + 0.9;

      gsap.set(headerItems, {
        autoAlpha: 1,
        y: -34,
        force3D: false,
        willChange: "transform",
      });

      if (auxiliaryItems.length) {
        gsap.set(auxiliaryItems, {
          yPercent: 118,
          force3D: false,
          willChange: "transform",
        });
      }


      titleItems.forEach((item, index) => {
        const comesFromLeft = index % 2 === 0;

        gsap.set(item, {
          xPercent: comesFromLeft ? -MOTION.maskedSlidePercent : MOTION.maskedSlidePercent,
          force3D: false,
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
      const contentTimeline = gsap.timeline({ paused: true });
      const auxiliaryTimeline = gsap.timeline({ paused: true });

      if (headerItems.length) {
        timeline.to(
          headerItems,
          {
            y: 0,
            force3D: false,
            duration: detailDuration,
            ease: "power4.out",
            clearProps: "transform,willChange",
          },
          0,
        );
      }

      if (statItems.length) {
        auxiliaryTimeline.call(
          () => {
            if (!auxiliaryTimeline.reversed()) playRevealCounters(heroRef.current);
          },
          [],
          statStart + 0.06,
        );
      }

      if (auxiliaryItems.length) {
        auxiliaryTimeline.to(
          auxiliaryItems,
          {
            yPercent: 0,
            force3D: false,
            duration: detailDuration,
            ease: "power4.out",
            clearProps: "transform,transformOrigin,willChange",
          },
          0,
        );
      }


      titleItems.forEach((item, index) => {
        contentTimeline.to(
          item,
          {
            xPercent: 0,
            duration: titleDuration,
            ease: MOTION.titleSlide.ease,
            force3D: false,
            clearProps: "transform,transformOrigin,willChange",
          },
          titleStart + index * titleLineGap,
        );
      });

      if (buttonFillItems.length) {
        auxiliaryTimeline.to(
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

      let heroVisible = false;
      const canPlay = () => window.__pageIntroDoneForPath === pathname;
      const titleSequence = sequenceReveal(contentTimeline, heroRef.current, { stage: 2, canPlay });
      const auxiliarySequence = sequenceReveal(auxiliaryTimeline, heroRef.current, { stage: 4, canPlay });
      const playContent = () => {
        if (heroVisible) { titleSequence.refresh(); auxiliarySequence.refresh(); }
      };
      const stopObserving = observeReveal(heroRef.current,
        () => { heroVisible = true; titleSequence.enter(); auxiliarySequence.enter(); },
        () => {
          heroVisible = false;
          titleSequence.exit(); auxiliarySequence.exit();
          reverseReveal(contentTimeline);
          reverseReveal(auxiliaryTimeline);
          heroRef.current.querySelectorAll("[data-reveal-counter]").forEach(counter => counter.dispatchEvent(new CustomEvent("reveal-counter:reverse")));
        });
      const playHeroIntro = () => {
        if (timeline.progress() === 0 && !timeline.isActive()) {
          timeline.play();
        }
        playContent();
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
        stopObserving();
        titleSequence.dispose(); auxiliarySequence.dispose();
        contentTimeline.kill();
        auxiliaryTimeline.kill();
      };
    },
    { dependencies: [pathname], scope: heroRef, revertOnUpdate: true },
  );

  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = heroRef.current;
      const heading = hero.querySelector("h1");
      const lines = hero.querySelectorAll("[data-hero-line-mask]");
      const exit = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: MOTION.scrub } });
      exit.to(lines, { xPercent: (i) => i % 2 ? 18 : -18, y: -70, opacity: 0, stagger: 0.06, ease: "none" }, 0)
        .to(hero.querySelector("[data-hero-background]"), { scale: 1.12, opacity: 0.2, ease: "none" }, 0)
        .to(hero.querySelectorAll("[data-hero-exit]"), {
          autoAlpha: 0,
          y: -32,
          x: (_index, target) => target.dataset.heroExit === "stat" ? -18 : target.dataset.heroExit === "action" ? 18 : 0,
          scale: 0.98,
          ease: "none",
        }, 0);
      const cue = hero.querySelector(".hero-scroll-arrow");
      if (cue) gsap.to(cue, { "--arrow-length": "180px", ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "top -50%", scrub: MOTION.progressScrub } });
      gsap.set(heading, { transformPerspective: 1000 });
      return bindTilt(hero, heading);
    });
    return () => media.revert();
  }, { scope: heroRef, dependencies: [pathname], revertOnUpdate: true });

  useGSAP(
    () => {
      const hero = heroRef.current;

      if (!hero) return undefined;

      const hideTargets = gsap.utils.toArray(
        hero.querySelectorAll("[data-hero-fullscreen-hide]"),
      );

      if (!hideTargets.length) return undefined;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      let hasSyncedFullscreenState = false;

      function syncFullscreenState() {
        const isFullscreen = document.body.dataset.heroFullscreen === "true";

        if (!hasSyncedFullscreenState && !isFullscreen) {
          hasSyncedFullscreenState = true;
          return;
        }

        hasSyncedFullscreenState = true;
        gsap.killTweensOf(hideTargets);

        if (prefersReducedMotion) {
          gsap.set(hideTargets, {
            autoAlpha: isFullscreen ? 0 : 1,
            pointerEvents: isFullscreen ? "none" : "auto",
          });

          return;
        }

        gsap.to(hideTargets, {
          autoAlpha: isFullscreen ? 0 : 1,
          duration: isFullscreen ? 0.36 : 0.44,
          ease: isFullscreen ? "power2.out" : "power3.out",
          overwrite: true,
          pointerEvents: isFullscreen ? "none" : "auto",
        });
      }

      syncFullscreenState();

      const observer = new MutationObserver(syncFullscreenState);

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-hero-fullscreen"],
      });

      return () => {
        observer.disconnect();
        gsap.killTweensOf(hideTargets);
        gsap.set(hideTargets, {
          clearProps: "opacity,visibility,transform,pointerEvents",
        });
      };
    },
    { dependencies: [pathname], scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      data-hero-fullscreen-surface
      data-header-theme="dark"
      data-scroll-reveal="off"
      className="ui-hero portfolio-hero relative isolate grid h-dvh grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] overflow-x-clip bg-black"
    >
      <div data-hero-background className="absolute inset-0 -z-10"><GeometricPentagonBackground /></div>
      <div className="hero-scroll-cue overflow-hidden" data-hero-exit="cue" aria-hidden="true">
        <div data-hero-cue className="flex items-center gap-3">
          <span>SCROLL TO EXPLORE</span>
          <span className="hero-scroll-arrow">
            <span className="hero-scroll-arrow-shaft" />
            <svg className="hero-scroll-arrow-head" width="18" height="10" viewBox="0 0 18 10" fill="none"><path d="m3 2 6 6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>
      </div>

      <div className="relative z-10 row-start-2 flex items-center justify-center">
        <h1 className="ui-hero-title m-0 flex flex-col items-center text-center text-white">
          {titleLines.map((line) => (
            <span key={line.text} data-hero-line-mask className="block overflow-hidden">
              <span
                data-hero-title
                data-title-reveal
                className={`${line.gradient ? "gradient-text-flow " : ""}block`}
              >
                {line.text}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div
        data-hero-fullscreen-hide
        className="relative z-10 row-start-3 grid w-full grid-cols-2 items-end gap-x-4 gap-y-5 self-end md:flex md:items-end md:justify-between md:gap-6"
      >
        {stat ? (
          <div
            data-hero-exit="stat"
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
                  <span key={line} className={line === "with modern interfaces" ? "hidden md:block" : "block"}>
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
          data-hero-exit="copy"
          className={`ui-hero-copy col-span-2 row-start-1 m-0 w-full max-w-[46ch] justify-self-center text-center text-[13px] leading-tight font-medium text-white/90 md:max-w-md md:text-sm lg:text-sm ${copyClassName}`}
        >
          <ReadingText as="span" waitForIntro className="block text-wrap md:hidden">{heroCopyText}</ReadingText>
          <ReadingText as="span" waitForIntro className="hidden md:block">
            {heroCopyLines.map(line => <span key={line} className="block text-wrap">{line}</span>)}
          </ReadingText>
        </p>

        {action ? (
          <div data-hero-exit="action" className="col-start-2 row-start-2 flex justify-end overflow-hidden">
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
