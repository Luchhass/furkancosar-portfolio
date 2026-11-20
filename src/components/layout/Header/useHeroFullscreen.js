import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function useHeroFullscreen(pathname) {
  const [isHeroFullscreen, setIsHeroFullscreen] = useState(false);
  const [showHeroFullscreenControl, setShowHeroFullscreenControl] =
    useState(false);
  const heroFullscreenRef = useRef(false);
  const heroFullscreenHeaderSyncStartedRef = useRef(false);
  const heroFullscreenScrollFrameRef = useRef(null);
  const showHeroFullscreenControlRef = useRef(false);
  useEffect(() => {
    heroFullscreenRef.current = isHeroFullscreen;
  }, [isHeroFullscreen]);

  useEffect(() => {
    let frame = null;

    const updateHeroFullscreenControl = () => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        const hero = document.querySelector("[data-hero-fullscreen-surface]");
        let nextIsVisible = false;

        if (!hero && heroFullscreenRef.current) {
          setIsHeroFullscreen(false);
        }

        if (hero && window.innerWidth < 768) {
          if (heroFullscreenRef.current) {
            nextIsVisible = true;
          } else {
            const rect = hero.getBoundingClientRect();
            const headerExitLine = Math.min(132, window.innerHeight - 1);

            nextIsVisible =
              rect.top <= headerExitLine && rect.bottom > headerExitLine;
          }
        }

        if (showHeroFullscreenControlRef.current !== nextIsVisible) {
          showHeroFullscreenControlRef.current = nextIsVisible;
          setShowHeroFullscreenControl(nextIsVisible);
        }

        frame = null;
      });
    };

    updateHeroFullscreenControl();

    window.addEventListener("scroll", updateHeroFullscreenControl, {
      passive: true,
    });
    window.addEventListener("resize", updateHeroFullscreenControl);
    window.addEventListener("pageshow", updateHeroFullscreenControl);
    window.addEventListener(
      "page-intro:complete",
      updateHeroFullscreenControl,
    );

    return () => {
      window.removeEventListener("scroll", updateHeroFullscreenControl);
      window.removeEventListener("resize", updateHeroFullscreenControl);
      window.removeEventListener("pageshow", updateHeroFullscreenControl);
      window.removeEventListener(
        "page-intro:complete",
        updateHeroFullscreenControl,
      );

      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isHeroFullscreen) return undefined;

    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    const scrollY = window.scrollY;

    const previousBodyStyles = {
      position: bodyStyle.position,
      top: bodyStyle.top,
      left: bodyStyle.left,
      right: bodyStyle.right,
      width: bodyStyle.width,
      overflow: bodyStyle.overflow,
    };
    const previousOverflow = htmlStyle.overflow;

    document.body.dataset.heroFullscreen = "true";
    htmlStyle.overflow = "hidden";
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.left = "0";
    bodyStyle.right = "0";
    bodyStyle.width = "100%";
    bodyStyle.overflow = "hidden";

    return () => {
      delete document.body.dataset.heroFullscreen;
      htmlStyle.overflow = previousOverflow;
      Object.assign(bodyStyle, previousBodyStyles);
      window.scrollTo(0, scrollY);
    };
  }, [isHeroFullscreen]);

  useEffect(() => {
    if (!isHeroFullscreen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsHeroFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHeroFullscreen]);

  useEffect(() => {
    if (!heroFullscreenHeaderSyncStartedRef.current) {
      heroFullscreenHeaderSyncStartedRef.current = true;
      return undefined;
    }

    const targets = [
      document.querySelector("[data-hero-intro='brand']"),
      document.querySelector("[data-hero-intro='menu-button']"),
      document.querySelector("[data-hero-intro='projects-link']"),
    ].filter(Boolean);

    if (!targets.length) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    gsap.killTweensOf(targets);

    if (prefersReducedMotion) {
      gsap.set(targets, {
        autoAlpha: isHeroFullscreen ? 0 : 1,
        pointerEvents: isHeroFullscreen ? "none" : "auto",
      });

      return undefined;
    }

    gsap.to(targets, {
      autoAlpha: isHeroFullscreen ? 0 : 1,
      duration: isHeroFullscreen ? 0.34 : 0.42,
      ease: isHeroFullscreen ? "power2.out" : "power3.out",
      overwrite: true,
      pointerEvents: isHeroFullscreen ? "none" : "auto",
    });

    return () => {
      gsap.killTweensOf(targets);
    };
  }, [isHeroFullscreen]);

  useEffect(() => {
    return () => {
      if (heroFullscreenScrollFrameRef.current) {
        cancelAnimationFrame(heroFullscreenScrollFrameRef.current);
      }
    };
  }, []);

  function getCurrentHeroSurface() {
    return document.querySelector("[data-hero-fullscreen-surface]");
  }

  function enterHeroFullscreen() {
    const hero = getCurrentHeroSurface();

    if (!hero) return;

    if (heroFullscreenScrollFrameRef.current) {
      cancelAnimationFrame(heroFullscreenScrollFrameRef.current);
      heroFullscreenScrollFrameRef.current = null;
    }

    const targetY = Math.max(
      0,
      window.scrollY + hero.getBoundingClientRect().top,
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (
      prefersReducedMotion ||
      Math.abs(hero.getBoundingClientRect().top) <= 2
    ) {
      window.scrollTo({ top: targetY, behavior: "auto" });
      setIsHeroFullscreen(true);
      return;
    }

    window.scrollTo({ top: targetY, behavior: "smooth" });

    const startedAt = performance.now();

    const settleAfterScroll = () => {
      const distanceFromTop = Math.abs(hero.getBoundingClientRect().top);
      const timedOut = performance.now() - startedAt > 1100;

      if (distanceFromTop <= 2 || timedOut) {
        if (distanceFromTop > 2) {
          window.scrollTo({ top: targetY, behavior: "auto" });
        }

        heroFullscreenScrollFrameRef.current = null;
        setIsHeroFullscreen(true);
        return;
      }

      heroFullscreenScrollFrameRef.current =
        requestAnimationFrame(settleAfterScroll);
    };

    heroFullscreenScrollFrameRef.current =
      requestAnimationFrame(settleAfterScroll);
  }

  function toggleHeroFullscreen() {
    if (isHeroFullscreen) {
      setIsHeroFullscreen(false);
      return;
    }

    enterHeroFullscreen();
  }

  return { isHeroFullscreen, showHeroFullscreenControl, toggleHeroFullscreen };
}
