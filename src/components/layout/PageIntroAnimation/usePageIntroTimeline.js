import { useEffect, useRef } from "react";
import gsap from "gsap";
import { basePath } from "@/lib/localizedRoutes";

const HEADER_BRAND_SELECTOR = "[data-hero-intro='brand']";

export default function usePageIntroTimeline({ pathname, routeReady, origin, onFinished, overlayRef, whiteLeftRef, whiteRightRef, bgRef, stageRef, welcomeRef, brandRef, brandTextRef, regRef }) {
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
    const brand = brandRef.current;
    const reg = regRef.current;

    if (
      !overlay ||
      !whiteLeft ||
      !whiteRight ||
      !bg ||
      !stage ||
      !welcome ||
      !brand ||
      !reg
    ) {
      return;
    }

    tlRef.current?.kill();
    tlRef.current = null;

    const isHome = basePath(pathname) === "/";
    if (origin) gsap.set(overlay, { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` });
    const headerBrand = document.querySelector(HEADER_BRAND_SELECTOR);

    let finishFrame;
    const done = () => {
      window.__pageIntroActivePath = null;
      window.__pageIntroDoneForPath = pathname;

      if (isHome && headerBrand) {
        gsap.set(headerBrand, {
          autoAlpha: 1,
          clearProps: "opacity,visibility",
        });
      }

      window.dispatchEvent(
        new CustomEvent("page-intro:complete", { detail: { pathname } }),
      );
      finishFrame = requestAnimationFrame(onFinished);
    };

    window.__pageIntroActivePath = pathname;
    window.__pageIntroDoneForPath = null;

    window.dispatchEvent(
      new CustomEvent("page-intro:start", { detail: { pathname } }),
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(overlay, {
        display: "none",
        pointerEvents: "none",
      });

      done();
      return () => cancelAnimationFrame(finishFrame);
    }

    const wLetters = [...welcome.querySelectorAll("[data-wl]")];
    const bLetters = [...brand.querySelectorAll("[data-bl]")];
    let brandDockState = null;

    const getBrandDockState = () => {
      if (brandDockState) return brandDockState;

      const sourceRect = (brandTextRef.current || brand).getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const targetText = headerBrand?.querySelector(":scope > span");
      const targetRect = (targetText || headerBrand)?.getBoundingClientRect();

      if (!targetRect?.width || !targetRect.height || !sourceRect.width || !sourceRect.height) {
        brandDockState = {
          x: 0,
          y: -window.innerHeight * 0.42,
          scaleX: 0.28,
          scaleY: 0.28,
          originX: brandRect.width / 2,
          originY: brandRect.height / 2,
        };

        return brandDockState;
      }

      const sourceCenterX = sourceRect.left + sourceRect.width / 2;
      const sourceCenterY = sourceRect.top + sourceRect.height / 2;

      brandDockState = {
        x: targetRect.left + targetRect.width / 2 - sourceCenterX,
        y: targetRect.top + targetRect.height / 2 - sourceCenterY,
        scaleX: targetRect.width / sourceRect.width,
        scaleY: targetRect.height / sourceRect.height,
        originX: sourceCenterX - brandRect.left,
        originY: sourceCenterY - brandRect.top,
      };

      return brandDockState;
    };

    gsap.set(overlay, {
      display: "block",
      autoAlpha: 1,
      pointerEvents: "auto",
    });

    gsap.set([whiteLeft, whiteRight], {
      autoAlpha: 1,
      xPercent: 0,
      willChange: "transform",
    });

    gsap.set(bg, {
      yPercent: 0,
      willChange: "transform",
    });

    if (isHome && headerBrand) {
      gsap.set(headerBrand, { autoAlpha: 0 });
    }

    gsap.set(stage, { autoAlpha: isHome ? 1 : 0 });

    gsap.set(welcome, {
      autoAlpha: isHome ? 1 : 0,
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: "50% 50%",
    });

    gsap.set(brand, {
      autoAlpha: 0,
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: "50% 50%",
    });

    gsap.set(reg, {
      autoAlpha: 0,
      scale: 0.75,
      transformOrigin: "0% 0%",
    });

    gsap.set(wLetters, {
      willChange: "transform",
      yPercent: (i, el) => {
        const value = Number(el.dataset.fromY);
        return Number.isFinite(value) ? value : 130;
      },
    });

    gsap.set(bLetters, {
      willChange: "transform",
      yPercent: (i, el) => {
        const value = Number(el.dataset.fromY);
        return Number.isFinite(value) ? value : 130;
      },
    });

    const tl = gsap.timeline({
      onComplete: () => {
        if (isHome && headerBrand) {
          gsap.set(headerBrand, {
            autoAlpha: 1,
            clearProps: "opacity,visibility",
          });
        }

        gsap.set(overlay, {
          display: "none",
          pointerEvents: "none",
        });

        gsap.set([...wLetters, ...bLetters], {
          clearProps: "transform,willChange",
        });

        gsap.set([stage, welcome, brand, reg, whiteLeft, whiteRight], {
          clearProps:
            "color,opacity,visibility,transform,transformOrigin,willChange",
        });

        gsap.set(bg, { clearProps: "transform,willChange" });

        tlRef.current = null;
        done();
      },
    });

    if (origin) {
      const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y)) + 2;
      tl.to(overlay, {
        clipPath: `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
        duration: .75, ease: "power3.inOut",
      }).call(() => window.dispatchEvent(new CustomEvent("page-navigation:covered", { detail: { pathname } })));
    }

    if (isHome) {
      tl.to({}, { duration: 0.15 });

      tl.to(wLetters, {
        yPercent: 0,
        duration: 0.85,
        ease: "expo.inOut",
        stagger: { each: 0.04, from: "random" },
      });

      tl.to({}, { duration: 0.58 });

      tl.set(brand, { autoAlpha: 1 });

      tl.to(wLetters, {
        yPercent: (i, el) => {
          const value = Number(el.dataset.fromY);
          return -(Number.isFinite(value) ? value : 130);
        },
        duration: 0.75,
        ease: "expo.inOut",
        stagger: { each: 0.03, from: "random" },
      });

      tl.to(
        bLetters,
        {
          yPercent: 0,
          duration: 0.75,
          ease: "expo.inOut",
          stagger: { each: 0.04, from: "random" },
        },
        "<",
      );

      tl.to(
        reg,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        },
        "-=0.12",
      );

      tl.set(welcome, { autoAlpha: 0 });

      tl.to({}, { duration: 0.42 });

      tl.call(() => {
        brandDockState = null;
        const dockState = getBrandDockState();

        gsap.set(brand, {
          transformOrigin: `${dockState.originX}px ${dockState.originY}px`,
          willChange: "transform",
        });
      });

      tl.to(brand, {
        x: () => getBrandDockState().x,
        y: () => getBrandDockState().y,
        scaleX: () => getBrandDockState().scaleX,
        scaleY: () => getBrandDockState().scaleY,
        duration: 0.92,
        ease: "expo.inOut",
      });
    } else if (!origin) {
      tl.to({}, { duration: 0.25 });
    }

    tl.call(() => {
      if (!readyRef.current) {
        waitingRef.current = true;
        tl.pause();
      }
    });
    tl.add("whiteReveal");

    tl.to(
      bg,
      {
        yPercent: -104,
        duration: 0.85,
        ease: "power4.inOut",
      },
      "whiteReveal",
    );

    if (isHome) {
      tl.to(
        brand,
        {
          color: "#000",
          duration: 0.12,
          ease: "power2.out",
        },
        "whiteReveal+=0.64",
      );
    }

    tl.to({}, { duration: 0.32 });

    tl.to(
      whiteLeft,
      {
        xPercent: -104,
        duration: 0.92,
        ease: "power4.inOut",
      },
      "-=0.02",
    );

    tl.to(
      whiteRight,
      {
        xPercent: 104,
        duration: 0.92,
        ease: "power4.inOut",
      },
      "<",
    );

    if (isHome) {
      tl.to(
        brand,
        {
          color: "#fff",
          duration: 0.18,
          ease: "power2.out",
        },
        "-=0.18",
      );
    }

    tlRef.current = tl;

    return () => {
      cancelAnimationFrame(finishFrame);
      tl.kill();

      if (isHome && headerBrand) {
        gsap.set(headerBrand, {
          autoAlpha: 1,
          clearProps: "opacity,visibility",
        });
      }

      gsap.set([...wLetters, ...bLetters], {
        clearProps: "transform,willChange",
      });

      gsap.set([stage, welcome, brand, reg, whiteLeft, whiteRight], {
        clearProps:
          "color,opacity,visibility,transform,transformOrigin,willChange",
      });

      gsap.set(bg, { clearProps: "transform,willChange" });

      gsap.set(overlay, {
        display: "none",
        pointerEvents: "none",
      });

      tlRef.current = null;

      if (window.__pageIntroActivePath === pathname) {
        window.__pageIntroActivePath = null;
      }
    };
  }, [pathname, onFinished, origin, overlayRef, whiteLeftRef, whiteRightRef, bgRef, stageRef, welcomeRef, brandRef, brandTextRef, regRef]);
}
