"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contactItems, navigationItems, socialItems } from "@/data/site";
import SocialMediaButtons from "@/components/SocialMediaButtons/SocialMediaButtons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Footer() {
  const pathname = usePathname();
  const footerRef = useRef(null);
  const footerTimelineRef = useRef(null);

  useGSAP(
    () => {
      const footer = footerRef.current;

      if (!footer) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      const primaryItems = gsap.utils.toArray(
        footer.querySelectorAll("[data-footer-primary]"),
      );
      const addressItems = gsap.utils.toArray(
        footer.querySelectorAll("[data-footer-address-item]"),
      );
      const footerSocialItems = gsap.utils.toArray(
        footer.querySelectorAll("[data-footer-social-item]"),
      );

      if (prefersReducedMotion.matches) {
        gsap.set([...primaryItems, ...addressItems, ...footerSocialItems], {
          autoAlpha: 1,
          yPercent: 0,
          scale: 1,
        });

        return;
      }

      function killCurrent() {
        footerTimelineRef.current?.kill();
        footerTimelineRef.current = null;
        gsap.killTweensOf([
          ...primaryItems,
          ...addressItems,
          ...footerSocialItems,
        ]);
      }

      function resetFooter() {
        killCurrent();

        gsap.set(primaryItems, {
          autoAlpha: 1,
          yPercent: 115,
          rotateX: -8,
          transformOrigin: "50% 100%",
          willChange: "transform",
        });

        gsap.set(addressItems, {
          autoAlpha: 1,
          yPercent: 120,
          rotateX: -6,
          transformOrigin: "50% 100%",
          willChange: "transform",
        });

        gsap.set(footerSocialItems, {
          autoAlpha: 1,
          yPercent: 120,
          scale: 0.94,
          transformOrigin: "50% 100%",
          willChange: "transform",
        });
      }

      function playFooter() {
        resetFooter();

        const timeline = gsap.timeline({
          defaults: {
            ease: "power4.out",
          },
        });

        timeline.to(primaryItems, {
          yPercent: 0,
          rotateX: 0,
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
          footerSocialItems,
          {
            yPercent: 0,
            scale: 1,
            duration: 0.68,
            stagger: 0.06,
            clearProps: "transform,willChange",
          },
          "-=0.52",
        );

        footerTimelineRef.current = timeline;
      }

      function hideFooter() {
        killCurrent();

        const timeline = gsap.timeline({
          defaults: {
            ease: "power2.inOut",
            overwrite: true,
          },
        });

        timeline.to(
          footerSocialItems,
          {
            yPercent: 120,
            scale: 0.94,
            duration: 0.36,
            stagger: {
              each: 0.035,
              from: "end",
            },
          },
          0,
        );

        timeline.to(
          addressItems,
          {
            yPercent: 120,
            rotateX: -6,
            transformOrigin: "50% 100%",
            duration: 0.36,
            stagger: {
              each: 0.035,
              from: "end",
            },
          },
          0,
        );

        timeline.to(
          primaryItems,
          {
            yPercent: 115,
            rotateX: -8,
            transformOrigin: "50% 100%",
            duration: 0.42,
            stagger: {
              each: 0.035,
              from: "end",
            },
          },
          0,
        );

        footerTimelineRef.current = timeline;
      }

      resetFooter();

      const trigger = ScrollTrigger.create({
        trigger: footer,
        start: "top 78%",
        end: "bottom 10%",
        onEnter: playFooter,
        onEnterBack: playFooter,
        onLeave: hideFooter,
        onLeaveBack: hideFooter,
      });

      return () => {
        trigger.kill();
        killCurrent();
        gsap.set([...primaryItems, ...addressItems, ...footerSocialItems], {
          clearProps: "transform,opacity,visibility,willChange,transformOrigin",
        });
      };
    },
    { scope: footerRef, dependencies: [pathname] },
  );

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
      className="grid h-screen grid-rows-[auto_minmax(0,1fr)_auto] bg-black px-8 py-6 text-white md:px-10 md:py-8 lg:px-16 lg:py-12"
    >
      <span />

      <div className="grid min-h-0 items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] lg:gap-16">
        <h2 className="m-0 max-w-4xl text-[44px] leading-[0.9] font-black tracking-[-0.04em] uppercase md:text-[80px] lg:text-[120px]">
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

        <nav aria-label="Footer navigation" className="lg:justify-self-end">
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
                    className="gradient-title-button inline-flex w-fit max-w-full text-[28px] leading-[0.82] font-black tracking-[-0.03em] text-white uppercase no-underline md:text-[30px] lg:text-[32px]"
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
        <address className="m-0 flex flex-wrap items-center gap-x-2 gap-y-3 text-[13px] leading-tight font-medium tracking-[0.08em] text-white not-italic md:flex-col md:items-start md:gap-3 md:text-sm lg:flex-row lg:items-center lg:gap-4">
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
                  className="text-white/60 md:hidden lg:inline"
                  aria-hidden="true"
                >
                  |
                </span>
              )}
            </span>
          ))}
        </address>

        <ul
          className="m-0 flex list-none items-center gap-3 p-0 md:gap-5"
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
