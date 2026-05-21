"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

const WELCOME = "WELCOME!";
const BRAND = "FURKANCOSAR";
const HEADER_BRAND_SELECTOR = "[data-hero-intro='brand']";

function getFromY(index) {
  return index % 2 === 0 ? 130 : -130;
}

function Letter({ char, index, dataKey }) {
  const fromY = getFromY(index);
  const attr = { [dataKey]: "" };

  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        height: "0.92em",
        verticalAlign: "top",
      }}
    >
      <span
        {...attr}
        data-from-y={fromY}
        style={{
          display: "block",
          height: "0.92em",
          lineHeight: 0.92,
        }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    </span>
  );
}

function Word({
  text,
  wordRef,
  lettersRef,
  dataKey,
  letterSpacing = "-0.04em",
  children,
}) {
  return (
    <span
      ref={wordRef}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "inline-flex",
        alignItems: "flex-start",
        fontSize: "clamp(44px, 8.5vw, 120px)",
        fontWeight: 900,
        letterSpacing,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        color: "#fff",
        lineHeight: 1,
      }}
    >
      <span
        ref={lettersRef}
        style={{ display: "inline-flex", alignItems: "flex-start" }}
      >
        {text.split("").map((char, i) => (
          <Letter key={i} char={char} index={i} dataKey={dataKey} />
        ))}
      </span>

      {children}
    </span>
  );
}

export default function PageIntroAnimation() {
  const pathname = usePathname();

  const overlayRef = useRef(null);
  const whiteLeftRef = useRef(null);
  const whiteRightRef = useRef(null);
  const bgRef = useRef(null);
  const stageRef = useRef(null);
  const welcomeRef = useRef(null);
  const brandRef = useRef(null);
  const brandTextRef = useRef(null);
  const regRef = useRef(null);
  const tlRef = useRef(null);

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

    const isHome = pathname === "/";
    const headerBrand = document.querySelector(HEADER_BRAND_SELECTOR);

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
      return;
    }

    const wLetters = [...welcome.querySelectorAll("[data-wl]")];
    const bLetters = [...brand.querySelectorAll("[data-bl]")];
    let brandDockState = null;

    const getBrandDockState = () => {
      if (brandDockState) return brandDockState;

      const sourceRect = (
        brandTextRef.current || brand
      ).getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const targetText = headerBrand?.querySelector("span");
      const targetRect = (targetText || headerBrand)?.getBoundingClientRect();

      if (!targetRect?.width || !sourceRect.width) {
        brandDockState = {
          x: 0,
          y: -window.innerHeight * 0.42,
          scale: 0.28,
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
        scale: targetRect.width / sourceRect.width,
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
        scale: () => getBrandDockState().scale,
        duration: 0.92,
        ease: "expo.inOut",
      });
    } else {
      tl.to({}, { duration: 0.25 });
    }

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
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      data-page-intro
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483646,
        overflow: "hidden",
        display: "none",
      }}
    >
      <div
        ref={whiteLeftRef}
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: "50%",
          background: "#fff",
        }}
      />

      <div
        ref={whiteRightRef}
        style={{
          position: "absolute",
          inset: "0 0 0 auto",
          width: "50%",
          background: "#fff",
        }}
      />

      <div
        ref={bgRef}
        className="gradient-bg-flow"
        style={{ position: "absolute", inset: 0 }}
      />

      <div
        ref={stageRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <Word text={WELCOME} wordRef={welcomeRef} dataKey="data-wl" />

        <Word
          text={BRAND}
          wordRef={brandRef}
          lettersRef={brandTextRef}
          dataKey="data-bl"
          letterSpacing="0"
        >
          <span
            ref={regRef}
            aria-hidden="true"
            style={{
              position: "relative",
              top: "0.22em",
              alignSelf: "flex-start",
              marginLeft: "0.05em",
              fontSize: "0.28em",
              fontWeight: 700,
              letterSpacing: "normal",
              lineHeight: 1,
            }}
          >
            ®
          </span>
        </Word>
      </div>
    </div>
  );
}