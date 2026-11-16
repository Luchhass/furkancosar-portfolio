"use client";
import { useLocalizedContent } from "@/lib/localizeContent";

import { MOTION } from "@/lib/motionPresets";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useGSAP } from "@gsap/react";
import { contactItems, navigationItems, siteConfig, socialItems } from "@/data/site";
import gsap from "gsap";
import { Lock, LockOpen } from "lucide-react";
import Link from "next/link";
import { basePath, localizedPath, routeLocale } from "@/lib/localizedRoutes";
import SocialMediaButtons from "../../ui/SocialMediaButtons/SocialMediaButtons";

gsap.registerPlugin(useGSAP);

export default function Header() {
  const localize = useLocalizedContent();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerTheme, setHeaderTheme] = useState("dark");
  const [isHeroFullscreen, setIsHeroFullscreen] = useState(false);
  const [showHeroFullscreenControl, setShowHeroFullscreenControl] =
    useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuRef = useRef(null);
  const menuNavRef = useRef(null);
  const menuAddressRef = useRef(null);
  const menuSocialsRef = useRef(null);
  const menuTimelineRef = useRef(null);
  const pendingNavigationRef = useRef(null);
  const headerThemeRef = useRef("dark");
  const heroFullscreenRef = useRef(false);
  const heroFullscreenHeaderSyncStartedRef = useRef(false);
  const heroFullscreenScrollFrameRef = useRef(null);
  const showHeroFullscreenControlRef = useRef(false);
  const heroFullscreenLockYRef = useRef(0);
  const heroFullscreenBodyStylesRef = useRef(null);
  const heroFullscreenHtmlOverflowRef = useRef("");
  const fullscreenIconGradientId = `header-hero-fullscreen-icon-gradient-${useId().replaceAll(":", "")}`;

  function finishMenuClose() {
    menuTimelineRef.current = null;
    pendingNavigationRef.current = null;
    setIsMenuOpen(false);
  }

  useEffect(() => {
    const covered = event => {
      const href = pendingNavigationRef.current;
      if (!href || event.detail.pathname !== href) return;
      pendingNavigationRef.current = null;
      menuTimelineRef.current?.kill();
      menuTimelineRef.current = null;
      setIsMenuOpen(false);
      router.push(href);
    };
    window.addEventListener("page-navigation:covered", covered);
    return () => window.removeEventListener("page-navigation:covered", covered);
  }, [router]);

  useEffect(() => {
    let frame = null;

    const updateHeaderTheme = () => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        const sampleX = window.innerWidth / 2;
        const sampleY = 92;

        const section = document
          .elementsFromPoint(sampleX, sampleY)
          .map((element) => element.closest("[data-header-theme]"))
          .find(Boolean);

        const nextTheme = section?.getAttribute("data-header-theme") || "dark";

        if (headerThemeRef.current !== nextTheme) {
          headerThemeRef.current = nextTheme;
          setHeaderTheme(nextTheme);
        }

        frame = null;
      });
    };

    updateHeaderTheme();

    window.addEventListener("scroll", updateHeaderTheme, { passive: true });
    window.addEventListener("resize", updateHeaderTheme);

    return () => {
      window.removeEventListener("scroll", updateHeaderTheme);
      window.removeEventListener("resize", updateHeaderTheme);

      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

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

    heroFullscreenLockYRef.current = scrollY;
    heroFullscreenBodyStylesRef.current = {
      position: bodyStyle.position,
      top: bodyStyle.top,
      left: bodyStyle.left,
      right: bodyStyle.right,
      width: bodyStyle.width,
      overflow: bodyStyle.overflow,
    };
    heroFullscreenHtmlOverflowRef.current = htmlStyle.overflow;

    document.body.dataset.heroFullscreen = "true";
    htmlStyle.overflow = "hidden";
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.left = "0";
    bodyStyle.right = "0";
    bodyStyle.width = "100%";
    bodyStyle.overflow = "hidden";

    return () => {
      const previousBodyStyles = heroFullscreenBodyStylesRef.current;

      delete document.body.dataset.heroFullscreen;
      htmlStyle.overflow = heroFullscreenHtmlOverflowRef.current;

      if (previousBodyStyles) {
        bodyStyle.position = previousBodyStyles.position;
        bodyStyle.top = previousBodyStyles.top;
        bodyStyle.left = previousBodyStyles.left;
        bodyStyle.right = previousBodyStyles.right;
        bodyStyle.width = previousBodyStyles.width;
        bodyStyle.overflow = previousBodyStyles.overflow;
      }

      window.scrollTo(0, heroFullscreenLockYRef.current);
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

  const activeHeaderTheme = isMenuOpen ? "light" : headerTheme;
  const headerColorClass = activeHeaderTheme === "light" ? "text-black" : "text-white";

  useEffect(() => {
    if (isMenuOpen) {
      document.body.dataset.siteMenuOpen = "true";
    } else {
      delete document.body.dataset.siteMenuOpen;
    }

    return () => {
      delete document.body.dataset.siteMenuOpen;
    };
  }, [isMenuOpen]);

  useGSAP(
    () => {
      if (!isMenuOpen || !menuRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      const menu = menuRef.current;
      const navItems = gsap.utils.toArray(
        menuNavRef.current?.querySelectorAll("[data-menu-nav-item]") || [],
      );
      const addressItems = gsap.utils.toArray(
        menuAddressRef.current?.querySelectorAll("[data-menu-address-item]") ||
          [],
      );
      const menuSocialItems = gsap.utils.toArray(
        menuSocialsRef.current?.querySelectorAll("[data-menu-social-item]") ||
          [],
      );
      const menuRings = gsap.utils.toArray(menu.querySelectorAll(".menu-ring"));

      if (prefersReducedMotion.matches) {
        gsap.set(menu, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(navItems, {
          autoAlpha: 1,
          xPercent: 0,
        });
        gsap.set([...addressItems, ...menuSocialItems], {
          autoAlpha: 1,
          yPercent: 0,
        });

        return;
      }

      gsap.set(menu, {
        clipPath: "inset(0% 0% 100% 0%)",
        willChange: "clip-path",
      });

      gsap.set(navItems, {
        autoAlpha: 1,
        xPercent: -MOTION.maskedSlidePercent,
        transformOrigin: "0% 50%",
        willChange: "transform",
      });

      gsap.set(addressItems, {
        autoAlpha: 1,
        yPercent: MOTION.line.yPercent,
        rotateX: -6,
        transformOrigin: "50% 100%",
        willChange: "transform",
      });

      gsap.set(menuSocialItems, {
        autoAlpha: 1,
        yPercent: MOTION.line.yPercent,
        scale: 0.94,
        transformOrigin: "50% 100%",
        willChange: "transform",
      });
      const travel = () => Math.min(menu.clientHeight * MOTION.rings.travelRatio, MOTION.rings.travelMax);
      const sideways = () => Math.min(menu.clientWidth * MOTION.rings.sidewaysRatio, MOTION.rings.sidewaysMax);
      const ringPaths = MOTION.ringPaths;
      gsap.set(menuRings, { autoAlpha: 0, scale: 1.08, transformOrigin: "50% 50%" });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
        onComplete: () => {
          menuTimelineRef.current = timeline;
        },
        onReverseComplete: () => {
          finishMenuClose();
        },
      });

      menuTimelineRef.current = timeline;

      timeline.to(menu, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.86,
        ease: "power3.inOut",
        clearProps: "clipPath,willChange",
      });
      menuRings.forEach((ring, index) => {
        const [fromX, fromY, toX, toY] = ringPaths[index];
        timeline.fromTo(ring,
          { x: () => sideways() * fromX, y: () => travel() * fromY, scale: 1.08, autoAlpha: 0 },
          { x: () => sideways() * toX, y: () => travel() * toY, scale: 1, autoAlpha: 0.66, duration: MOTION.rings.duration, ease: MOTION.rings.ease },
          0.12,
        );
      });

      timeline.to(navItems, {
        xPercent: 0,
        duration: MOTION.slide.duration,
        ease: MOTION.slide.ease,
        stagger: {
          each: 0.12,
          from: "start",
        },
        clearProps: "transform,willChange",
      }, 0.28);

      timeline.to(
        addressItems,
        {
          yPercent: 0,
          rotateX: 0,
          duration: MOTION.line.duration,
          stagger: MOTION.line.stagger,
          clearProps: "transform,willChange",
        },
        0.62,
      );

      timeline.to(
        menuSocialItems,
        {
          yPercent: 0,
          scale: 1,
          duration: MOTION.line.duration,
          stagger: MOTION.line.stagger,
          clearProps: "transform,willChange",
        },
        0.82,
      );
    },
    { dependencies: [isMenuOpen], scope: menuRef, revertOnUpdate: true },
  );

  function openMenu() {
    navigationItems.forEach(item => { const href = localizedPath(item.href, routeLocale(pathname)); if (href !== pathname) router.prefetch(href); });
    setIsMenuOpen(true);
  }

  function closeMenu() {
    const timeline = menuTimelineRef.current;

    if (!timeline || timeline.time() === 0) {
      finishMenuClose();
      return;
    }

    if (timeline.reversed()) return;

    timeline.reverse();
  }

  function closeMenuImmediately() {
    pendingNavigationRef.current = null;
    menuTimelineRef.current?.kill();
    menuTimelineRef.current = null;
    setIsMenuOpen(false);
  }

  function navigateFromMenu(event, href) {
    href = localizedPath(href, routeLocale(pathname));
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (document.body.dataset.languageSwitching === "true") return;
    if (pendingNavigationRef.current) return;
    if (href === pathname) { closeMenu(); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      closeMenuImmediately(); router.push(href); return;
    }
    pendingNavigationRef.current = href;
    router.prefetch(href);
    const text = event.currentTarget.querySelector(".gradient-title-text");
    const rect = text.getBoundingClientRect();
    flushSync(() => window.dispatchEvent(new CustomEvent("page-navigation:start", {
      detail: { pathname: href, origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } },
    })));
  }

  function toggleMenu() {
    if (pendingNavigationRef.current) return;
    if (isMenuOpen) {
      closeMenu();
      return;
    }

    openMenu();
  }

  function updateTitleFillOrigin(event) {
    const link = event.currentTarget;
    const text = link.firstElementChild;
    const rect = (text || link).getBoundingClientRect();

    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

    link.style.setProperty("--gradient-title-fill-x", `${x}px`);
    link.style.setProperty("--gradient-title-fill-y", `${y}px`);
  }

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

  const FullscreenIcon = isHeroFullscreen ? Lock : LockOpen;

  return (
    localize(<>
      <header
        className={`ui-header pointer-events-none fixed inset-x-0 top-0 z-50 transition-[color,opacity] duration-300 ${headerColorClass}`}
        aria-label="Primary navigation"
      >
        <div className="ui-header-slot ui-header-left">
          <button
            type="button"
            data-hero-fullscreen-toggle
            aria-label={
              isHeroFullscreen
                ? "Exit hero full screen"
                : "Open hero full screen"
            }
            aria-pressed={isHeroFullscreen}
            title={isHeroFullscreen ? "Exit full screen" : "Full screen"}
            onClick={toggleHeroFullscreen}
            className={`group ui-header-control ui-header-fullscreen-control relative h-11 w-12 cursor-pointer border-0 bg-transparent p-0 text-current transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current md:hidden ${
              showHeroFullscreenControl || isHeroFullscreen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            <span
              data-hero-intro="fullscreen-button"
              className="absolute inset-0"
            >
              <FullscreenIcon
                className="hero-fullscreen-icon absolute top-1/2 left-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2"
                style={{
                  "--hero-fullscreen-icon-gradient": `url(#${fullscreenIconGradientId})`,
                }}
                strokeWidth={2.25}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id={fullscreenIconGradientId}
                    x1="0"
                    x2="24"
                    y1="12"
                    y2="12"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#6768ff" />
                    <stop offset="0.5" stopColor="#a53cdd" />
                    <stop offset="1" stopColor="#ee4b67" />
                  </linearGradient>
                </defs>
              </FullscreenIcon>
            </span>
          </button>

          <div className="hidden md:block">
            {basePath(pathname) !== "/projects" && (
              <Link
                href="/projects"
                onClick={closeMenuImmediately}
                data-hero-intro="projects-link"
                className="group pointer-events-auto inline-flex items-center gap-2 text-xs leading-none font-black whitespace-nowrap text-current no-underline"
              >
                <span
                  className="gradient-action-dot h-2 w-2 rounded-full"
                  aria-hidden="true"
                />

                <span className="relative after:absolute after:bottom-[-0.45rem] after:left-0 after:h-0.5 after:w-full after:bg-current after:[clip-path:inset(0_100%_0_0)] after:opacity-90 after:transition-[clip-path] after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:after:[clip-path:inset(0_0_0_0)] group-focus-visible:after:[clip-path:inset(0_0_0_0)]">
                  SEE MY PROJECTS
                </span>
              </Link>
            )}
          </div>
        </div>

        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          onClick={closeMenuImmediately}
          data-hero-intro="brand"
          className="ui-header-brand pointer-events-auto inline-flex items-center leading-none font-bold text-current no-underline"
        >
          <span>{siteConfig.brand}</span>
          <span className="ui-header-brand-reg" aria-hidden="true">&reg;</span>
        </Link>

        <div className="ui-header-slot ui-header-right">
          <button
            type="button"
            data-hero-intro="menu-button"
            className="group pointer-events-auto ui-header-control ui-header-menu-button relative h-11 w-12 cursor-pointer border-0 bg-transparent p-0"
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            onClick={toggleMenu}
          >
            <span
              className={`absolute top-1/2 right-0 h-0.75 w-7 rounded-full bg-current transition-[transform,opacity,background,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[linear-gradient(90deg,#6768ff,#a53cdd,#ee4b67)] ${
                isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-[var(--ui-menu-line-offset)]"
              }`}
              aria-hidden="true"
            />

            <span
              className={`absolute top-1/2 right-0 h-0.75 w-7 rounded-full bg-current transition-[transform,opacity,background,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[linear-gradient(90deg,#6768ff,#a53cdd,#ee4b67)] ${
                isMenuOpen
                  ? "translate-y-0 scale-x-0 opacity-0"
                  : "translate-y-0"
              }`}
              aria-hidden="true"
            />

            <span
              className={`absolute top-1/2 right-0 h-0.75 w-7 rounded-full bg-current transition-[transform,opacity,background,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[linear-gradient(90deg,#6768ff,#a53cdd,#ee4b67)] ${
                isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-[var(--ui-menu-line-offset)]"
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div
          ref={menuRef}
          id="site-menu"
          className="ui-chrome fixed inset-0 z-40 isolate flex h-dvh flex-col justify-between overflow-hidden bg-[#f8f8f5] text-[#111]"
          style={{ clipPath: "inset(0% 0% 100% 0%)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div aria-hidden="true" />
          <div className="menu-footer-backdrop" aria-hidden="true">
            <span className="footer-ring footer-ring-one menu-ring" />
            <span className="footer-ring footer-ring-two menu-ring" />
            <span className="footer-ring footer-ring-three menu-ring" />
            <span className="footer-ring footer-ring-four menu-ring" />
            <span className="footer-ring footer-ring-five menu-ring" />
            <span className="footer-ring footer-ring-six menu-ring" />
            <span className="footer-ring footer-ring-seven menu-ring" />
            <span className="footer-ring footer-ring-eight menu-ring" />
            <span className="footer-ring footer-ring-nine menu-ring" />
          </div>

          <nav ref={menuNavRef} aria-label="Main menu">
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {navigationItems.map((item) => {
                const isActive = basePath(pathname) === item.href;

                return (
                  <li
                    key={item.href}
                    className="w-fit max-w-full overflow-hidden"
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      data-active={isActive ? "true" : undefined}
                      data-menu-nav-item
                      onClick={event => navigateFromMenu(event, item.href)}
                      onPointerEnter={updateTitleFillOrigin}
                      onPointerLeave={updateTitleFillOrigin}
                      className="ui-navigation-link gradient-title-button inline-flex w-fit max-w-full text-[44px] leading-[0.9] font-black tracking-[-0.04em] text-black uppercase no-underline md:text-[80px] lg:text-[120px]"
                    >
                      <span className="gradient-title-text">
                        <span>{item.label}</span>

                        <span
                          className="gradient-text-flow gradient-title-fill"
                          aria-hidden="true"
                        >
                          {item.label}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div aria-hidden="true" />

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <address
              ref={menuAddressRef}
              className="ui-chrome-contact m-0 flex flex-col items-start gap-3 text-black not-italic"
            >
              {contactItems.map((item) => (
                <span key={item.href} className="inline-block overflow-hidden">
                  <a
                    href={item.href}
                    data-menu-address-item
                    className="group relative inline-block w-fit text-black no-underline"
                  >
                    <span className="relative after:absolute after:bottom-[-0.35rem] after:left-0 after:h-0.5 after:w-full after:bg-current after:[clip-path:inset(0_100%_0_0)] after:opacity-90 after:transition-[clip-path] after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:after:[clip-path:inset(0_0_0_0)] group-focus-visible:after:[clip-path:inset(0_0_0_0)]">
                      {item.label}
                    </span>
                  </a>

                </span>
              ))}
            </address>

            <ul
              ref={menuSocialsRef}
              className="ui-chrome-socials m-0 flex list-none items-center p-0"
              aria-label="Social links"
            >
              {socialItems.map((item) => (
                <li key={item.name} className="overflow-hidden rounded-full">
                  <SocialMediaButtons
                    item={item}
                    animationAttribute="data-menu-social-item"
                className="text-black"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>)
  );
}
