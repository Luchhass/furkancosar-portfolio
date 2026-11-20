import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION } from "@/lib/motionPresets";
import { heroTitleExit, heroDetailExit } from "@/lib/heroScrollExit";
import { bindTilt } from "@/lib/pointerMotion";
import { observeReveal, reverseReveal } from "@/lib/repeatReveal";
import { sequenceReveal } from "@/lib/revealSequence";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { playRevealCounters } from "@/components/ui/RevealCounter/RevealCounter";
import { basePath } from "@/lib/localizedRoutes";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function useHeroMotion(heroRef, pathname) {
  useHeroEntrance(heroRef, pathname);
  useHeroExit(heroRef, pathname);
  useHeroFullscreenMotion(heroRef, pathname);
}

function useHeroEntrance(heroRef, pathname) {
  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (prefersReducedMotion.matches) return;

      const root = heroRef.current;
      const q = gsap.utils.selector(root);

      const isVisibleElement = (element) => {
        if (!(element instanceof HTMLElement)) return false;

        const rect = element.getBoundingClientRect();

        return rect.width > 0 && rect.height > 0;
      };

      const headerControls = [...document.querySelectorAll("[data-header-intro-content]")].filter(isVisibleElement);
      const headerMasks = headerControls.map(control => control.parentElement);
      const headerBrand = document.querySelector("[data-hero-intro='brand']");
      const animateBrand = basePath(pathname) !== "/" && isVisibleElement(headerBrand);
      const headerItems = animateBrand ? [...headerControls, headerBrand] : headerControls;

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

      // The link and buttons stay in place while their contents enter the mask.
      gsap.set(headerMasks, { clipPath: "inset(0 -6px -6px)" });
      gsap.set(headerControls, {
        y: (_, control) => -control.parentElement.offsetHeight - 6,
        force3D: false,
        willChange: "transform",
      });
      if (animateBrand) {
        gsap.set(headerBrand, { autoAlpha: 1, y: -34, force3D: false, willChange: "transform" });
      }

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

      const projectPreviews = q("[data-preview-selected]");
      if (projectPreviews.length) {
        contentTimeline.fromTo(projectPreviews, { scale: 0 }, {
          scale: 1, duration: .85, stagger: .09, ease: "back.out(1.25)",
        }, titleStart);
      }

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
        if (headerMasks.length) timeline.set(headerMasks, { clearProps: "clipPath" });
      }

      if (statItems.length) {
        auxiliaryTimeline.call(
          () => {
            if (!auxiliaryTimeline.reversed()) playRevealCounters(root);
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
      const titleSequence = sequenceReveal(contentTimeline, root, { stage: 2, canPlay });
      const auxiliarySequence = sequenceReveal(auxiliaryTimeline, root, { stage: 4, canPlay });
      const playContent = () => {
        if (heroVisible) { titleSequence.refresh(); auxiliarySequence.refresh(); }
      };
      const stopObserving = observeReveal(root,
        () => { heroVisible = true; titleSequence.enter(); auxiliarySequence.enter(); },
        () => {
          heroVisible = false;
          titleSequence.exit(); auxiliarySequence.exit();
          reverseReveal(contentTimeline);
          reverseReveal(auxiliaryTimeline);
          root.querySelectorAll("[data-reveal-counter]").forEach(counter => counter.dispatchEvent(new CustomEvent("reveal-counter:reverse")));
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
}

function useHeroExit(heroRef, pathname) {
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = heroRef.current;
      const heading = hero.querySelector("h1");
      const lines = hero.querySelectorAll("[data-hero-line-mask]");
      const exit = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: MOTION.scrub } });
      exit.to(lines, heroTitleExit(), 0)
        .to(hero.querySelector("[data-hero-background]"), { scale: 1.12, opacity: 0.2, ease: "none" }, 0)
        .to(hero.querySelectorAll("[data-hero-exit]"), heroDetailExit(), 0);
      const cue = hero.querySelector(".hero-scroll-arrow");
      if (cue) gsap.to(cue, { "--arrow-length": "180px", ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "top -50%", scrub: MOTION.progressScrub } });
      gsap.set(heading, { transformPerspective: 1000 });
      return bindTilt(hero, heading);
    });
    return () => media.revert();
  }, { scope: heroRef, dependencies: [pathname], revertOnUpdate: true });

}

function useHeroFullscreenMotion(heroRef, pathname) {
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
}
