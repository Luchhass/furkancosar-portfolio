"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { contactItems, navigationItems, siteConfig, socialItems } from "@/data/site";
import gsap from "gsap";
import Link from "next/link";
import SocialMediaButtons from "../SocialMediaButtons/SocialMediaButtons";

gsap.registerPlugin(useGSAP);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerTheme, setHeaderTheme] = useState("dark");
  const pathname = usePathname();

  const menuRef = useRef(null);
  const menuNavRef = useRef(null);
  const menuAddressRef = useRef(null);
  const menuSocialsRef = useRef(null);
  const menuTimelineRef = useRef(null);

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

        setHeaderTheme(nextTheme);
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

  const activeHeaderTheme = isMenuOpen ? "dark" : headerTheme;
  const headerColorClass = activeHeaderTheme === "light" ? "text-black" : "text-white";

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
        xPercent: -115,
        transformOrigin: "0% 50%",
        willChange: "transform",
      });

      gsap.set(addressItems, {
        autoAlpha: 1,
        yPercent: 120,
        rotateX: -6,
        transformOrigin: "50% 100%",
        willChange: "transform",
      });

      gsap.set(menuSocialItems, {
        autoAlpha: 1,
        yPercent: 120,
        scale: 0.94,
        transformOrigin: "50% 100%",
        willChange: "transform",
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
        onComplete: () => {
          menuTimelineRef.current = timeline;
        },
        onReverseComplete: () => {
          menuTimelineRef.current = null;
          setIsMenuOpen(false);
        },
      });

      menuTimelineRef.current = timeline;

      timeline.to(menu, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.86,
        ease: "power3.inOut",
        clearProps: "clipPath,willChange",
      });

      timeline.to(navItems, {
        xPercent: 0,
        duration: 0.86,
        stagger: {
          each: 0.12,
          from: "start",
        },
        clearProps: "transform,willChange",
      });

      timeline.to(
        addressItems,
        {
          yPercent: 0,
          rotateX: 0,
          duration: 0.68,
          stagger: 0.07,
          clearProps: "transform,willChange",
        },
        "-=0.58",
      );

      timeline.to(
        menuSocialItems,
        {
          yPercent: 0,
          scale: 1,
          duration: 0.68,
          stagger: 0.06,
          clearProps: "transform,willChange",
        },
        "-=0.52",
      );
    },
    { dependencies: [isMenuOpen], scope: menuRef, revertOnUpdate: true },
  );

  function openMenu() {
    setIsMenuOpen(true);
  }

  function closeMenu() {
    const timeline = menuTimelineRef.current;

    if (!timeline) {
      setIsMenuOpen(false);
      return;
    }

    if (timeline.reversed()) return;

    timeline.reverse();
  }

  function toggleMenu() {
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

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 grid w-full grid-cols-3 items-center px-8 py-6 transition-colors duration-300 md:px-10 md:py-8 lg:px-16 lg:py-12 ${headerColorClass}`}
        aria-label="Primary navigation"
      >
        <div className="hidden overflow-hidden justify-self-start md:block">
          {pathname !== "/projects" && (
            <Link
              href="/projects"
              onClick={closeMenu}
              data-hero-intro="projects-link"
              className="group inline-flex items-center gap-2 text-xs leading-none font-black whitespace-nowrap text-current no-underline"
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

        <div className="col-start-2 overflow-hidden justify-self-center">
          <Link
            href="/"
            aria-label={`${siteConfig.name} home`}
            onClick={closeMenu}
            data-hero-intro="brand"
            className="inline-flex items-center text-lg leading-none font-black text-current no-underline md:text-2xl lg:text-3xl"
          >
            <span>{siteConfig.brand}</span>

            <span className="relative -top-2 ml-1 text-xs" aria-hidden="true">
              &reg;
            </span>
          </Link>
        </div>

        <div className="col-start-3 overflow-hidden justify-self-end">
          <button
            type="button"
            data-hero-intro="menu-button"
            className="group relative h-8 w-12 cursor-pointer border-0 bg-transparent p-0"
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            onClick={toggleMenu}
          >
            <span
              className={`absolute top-1/2 right-0 h-0.75 w-7 rounded-full bg-current transition-[transform,opacity,background,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[linear-gradient(90deg,#6768ff,#a53cdd,#ee4b67)] ${
                isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-2"
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
                isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-2"
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
          className="fixed inset-0 z-40 flex h-dvh flex-col justify-between overflow-hidden bg-black px-8 py-6 text-white md:px-10 md:py-8 lg:px-16 lg:py-12"
          style={{ clipPath: "inset(0% 0% 100% 0%)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div aria-hidden="true" />

          <nav ref={menuNavRef} aria-label="Main menu">
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;

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
                      onClick={closeMenu}
                      onPointerEnter={updateTitleFillOrigin}
                      onPointerLeave={updateTitleFillOrigin}
                      className="gradient-title-button inline-flex w-fit max-w-full text-[44px] leading-[0.9] font-black tracking-[-0.04em] text-white uppercase no-underline md:text-[80px] lg:text-[120px]"
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
              className="m-0 flex flex-wrap items-center gap-x-2 gap-y-3 text-[13px] leading-tight font-medium tracking-[0.08em] text-white not-italic md:flex-col md:items-start md:gap-3 md:text-sm"
            >
              {contactItems.map((item, index) => (
                <span key={item.href} className="inline-block overflow-hidden">
                  <a
                    href={item.href}
                    data-menu-address-item
                    className="group relative inline-block w-fit text-white no-underline"
                  >
                    <span className="relative after:absolute after:bottom-[-0.35rem] after:left-0 after:h-0.5 after:w-full after:bg-current after:[clip-path:inset(0_100%_0_0)] after:opacity-90 after:transition-[clip-path] after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:after:[clip-path:inset(0_0_0_0)] group-focus-visible:after:[clip-path:inset(0_0_0_0)]">
                      {item.label}
                    </span>
                  </a>

                  {index === 0 && (
                    <span
                      className="text-white/60 md:hidden"
                      aria-hidden="true"
                    >
                      |
                    </span>
                  )}
                </span>
              ))}
            </address>

            <ul
              ref={menuSocialsRef}
              className="m-0 flex list-none items-center gap-3 p-0 md:gap-5"
              aria-label="Social links"
            >
              {socialItems.map((item) => (
                <li key={item.name} className="overflow-hidden rounded-full">
                  <SocialMediaButtons
                    item={item}
                    animationAttribute="data-menu-social-item"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}