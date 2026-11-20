import { useEffect, useRef } from "react";
import gsap from "gsap";
import { basePath } from "@/lib/localizedRoutes";
import { circleCover, circleMask } from "@/lib/circleReveal";

const brandSelector = "[data-hero-intro='brand']";

function animateHeaderBrand(timeline, brand, welcome, welcomeLetters) {
  const header = brand.closest("header");
  const letters = [...brand.querySelectorAll("[data-intro-brand-letter]")];
  const registered = brand.querySelector("[data-intro-brand-reg]");
  const wasInert = header.inert;

  timeline.call(() => {
    const introSize = gsap.utils.clamp(44, 120, innerWidth * .085);
    const headerSize = parseFloat(getComputedStyle(brand).fontSize);
    gsap.set(brand, {
      "--intro-brand-lift": 1,
      "--intro-brand-scale": introSize / headerSize,
      color: "#fff",
    });
    gsap.set(letters, { yPercent: index => index % 2 === 0 ? 130 : -130 });
    gsap.set(registered, { opacity: 0, scale: .75 });
    header.dataset.introBrandActive = "";
    header.inert = true;
  });
  timeline.to(welcomeLetters, {
    yPercent: (_, letter) => -Number(letter.dataset.fromY),
    duration: .75,
    ease: "expo.inOut",
    stagger: { each: .03, from: "random" },
  });
  timeline.to(letters,
    { yPercent: 0, duration: .75, ease: "expo.inOut", stagger: { each: .04, from: "random" } },
    "<");
  timeline.to(registered,
    { opacity: 1, scale: 1, duration: .2, ease: "power2.out" },
    "-=.12");
  timeline.set(welcome, { autoAlpha: 0 });
  timeline.to({}, { duration: .42 });
  timeline.to(brand, {
    "--intro-brand-lift": 0,
    "--intro-brand-scale": 1,
    duration: .92,
    ease: "expo.inOut",
  });

  return () => {
    if (!header.hasAttribute("data-intro-brand-active")) return;
    delete header.dataset.introBrandActive;
    header.inert = wasInert;
    brand.style.removeProperty("--intro-brand-lift");
    brand.style.removeProperty("--intro-brand-scale");
    gsap.set(brand, { clearProps: "color" });
    gsap.set(letters, { clearProps: "transform" });
    gsap.set(registered, { clearProps: "opacity,transform" });
  };
}

export default function usePageIntroTimeline({ pathname, routeReady, origin, onFinished, overlayRef, whiteLeftRef, whiteRightRef, bgRef, stageRef, welcomeRef }) {
  const tlRef = useRef(null);
  const readyRef = useRef(routeReady);
  const waitingRef = useRef(false);

  useEffect(() => {
    readyRef.current = routeReady;
    if (routeReady && waitingRef.current) {
      waitingRef.current = false;
      tlRef.current?.play();
    }
  }, [routeReady]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const whiteLeft = whiteLeftRef.current;
    const whiteRight = whiteRightRef.current;
    const bg = bgRef.current;
    const stage = stageRef.current;
    const welcome = welcomeRef.current;
    const brand = basePath(pathname) === "/" ? document.querySelector(brandSelector) : null;
    const welcomeLetters = [...welcome.querySelectorAll("[data-wl]")];
    let finishFrame;
    let restoreBrand;

    function done() {
      window.__pageIntroActivePath = null;
      window.__pageIntroDoneForPath = pathname;
      window.dispatchEvent(new CustomEvent("page-intro:complete", { detail: { pathname } }));
      finishFrame = requestAnimationFrame(onFinished);
    }

    window.__pageIntroActivePath = pathname;
    window.__pageIntroDoneForPath = null;
    window.dispatchEvent(new CustomEvent("page-intro:start", { detail: { pathname } }));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done();
      return () => cancelAnimationFrame(finishFrame);
    }

    gsap.set(overlay, { display: "block" });
    if (origin) gsap.set(overlay, { clipPath: circleMask(origin) });
    gsap.set([whiteLeft, whiteRight, bg], { willChange: "transform" });
    gsap.set(stage, { autoAlpha: brand ? 1 : 0 });
    gsap.set(welcomeLetters, { yPercent: (_, letter) => Number(letter.dataset.fromY), willChange: "transform" });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { display: "none" });
        restoreBrand?.();
        tlRef.current = null;
        done();
      },
    });
    tlRef.current = tl;

    if (origin) {
      tl.to(overlay, circleCover(origin))
        .call(() => window.dispatchEvent(new CustomEvent("page-navigation:covered", { detail: { pathname } })));
    }

    if (brand) {
      tl.to({}, { duration: .15 });
      tl.to(welcomeLetters, {
        yPercent: 0,
        duration: .85,
        ease: "expo.inOut",
        stagger: { each: .04, from: "random" },
      });
      tl.to({}, { duration: .58 });
      restoreBrand = animateHeaderBrand(tl, brand, welcome, welcomeLetters);
    } else if (!origin) {
      tl.to({}, { duration: .25 });
    }

    tl.call(() => {
      if (!readyRef.current) {
        waitingRef.current = true;
        tl.pause();
      }
    });
    tl.add("whiteReveal");
    tl.to(bg, { yPercent: -104, duration: .85, ease: "power4.inOut" }, "whiteReveal");

    if (brand) tl.to(brand, { color: "#000", duration: .12, ease: "power2.out" }, "whiteReveal+=.64");

    tl.to({}, { duration: .32 });
    tl.to(whiteLeft, { xPercent: -104, duration: .92, ease: "power4.inOut" }, "-=.02");
    tl.to(whiteRight, { xPercent: 104, duration: .92, ease: "power4.inOut" }, "<");

    if (brand) tl.to(brand, { color: "#fff", duration: .18, ease: "power2.out" }, "-=.18");

    return () => {
      cancelAnimationFrame(finishFrame);
      tl.kill();
      restoreBrand?.();
      gsap.set(overlay, { display: "none", clearProps: "clipPath" });
      gsap.set([whiteLeft, whiteRight, bg, welcomeLetters], { clearProps: "transform,willChange" });
      gsap.set([stage, welcome], { clearProps: "opacity,visibility" });
      tlRef.current = null;
      waitingRef.current = false;

      if (window.__pageIntroActivePath === pathname) window.__pageIntroActivePath = null;
    };
  }, [pathname, onFinished, origin, overlayRef, whiteLeftRef, whiteRightRef, bgRef, stageRef, welcomeRef]);
}
