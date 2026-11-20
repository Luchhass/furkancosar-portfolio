import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { navigationItems } from "@/data/site";
import { MOTION } from "@/lib/motionPresets";
import { localizedPath, routeLocale } from "@/lib/localizedRoutes";

gsap.registerPlugin(useGSAP);

export default function useSiteMenu(pathname) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);
  const menuTimelineRef = useRef(null);
  const pendingNavigationRef = useRef(null);
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
      const navItems = menu.querySelectorAll("[data-menu-nav-item]");
      const addressItems = menu.querySelectorAll("[data-menu-address-item]");
      const menuSocialItems = menu.querySelectorAll("[data-menu-social-item]");
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
        0.8,
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
        0.94,
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

  return { menuRef, isMenuOpen, toggleMenu, closeMenuImmediately, navigateFromMenu };
}
