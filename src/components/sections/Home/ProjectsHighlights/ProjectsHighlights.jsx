"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { homeProjects } from "@/data/projects";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const AUTO_SCROLL_VIEWPORT_RATIO = 1.75;

function getMaxScrollLeft(viewport) {
  return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
}

function clampScrollLeft(value, maxScrollLeft) {
  return Math.min(Math.max(value, 0), maxScrollLeft);
}

export default function ProjectsHighlights() {
  const sectionRef = useRef(null);
  const sliderRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorPillRef = useRef(null);
  const cardTiltFrameRef = useRef(null);
  const pendingCardTiltRef = useRef(null);
  const programmaticScrollFrameRef = useRef(null);

  const scrollMotionRef = useRef({
    baseScrollLeft: 0,
    scrollProgress: 0,
    userOffset: 0,
    maxScrollLeft: 0,
    isProgrammaticScroll: false,
  });

  const dragRef = useRef({
    isDragging: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const projectCards = homeProjects;

  useGSAP(
    () => {
      const cursor = cursorRef.current;
      const pill = cursorPillRef.current;

      if (!cursor || !pill) return;

      gsap.set(cursor, {
        x: -140,
        y: -140,
      });

      gsap.set(pill, {
        autoAlpha: 0,
        scale: 0.84,
        transformOrigin: "50% 50%",
      });
    },
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = sliderRef.current;

      if (!section || !viewport) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (prefersReducedMotion.matches) return;

      const scrollMotion = scrollMotionRef.current;

      function measure() {
        scrollMotion.maxScrollLeft = getMaxScrollLeft(viewport);
      }

      function getBaseScrollLeft(progress) {
        const autoDistance = Math.min(
          scrollMotion.maxScrollLeft,
          viewport.clientWidth * AUTO_SCROLL_VIEWPORT_RATIO,
        );

        return autoDistance * progress;
      }

      function setViewportScrollLeft(nextScrollLeft) {
        scrollMotion.isProgrammaticScroll = true;
        viewport.scrollLeft = nextScrollLeft;

        if (programmaticScrollFrameRef.current !== null) {
          window.cancelAnimationFrame(programmaticScrollFrameRef.current);
        }

        programmaticScrollFrameRef.current = window.requestAnimationFrame(
          () => {
            scrollMotion.isProgrammaticScroll = false;
            programmaticScrollFrameRef.current = null;
          },
        );
      }

      function updateSliderScroll() {
        scrollMotion.baseScrollLeft = getBaseScrollLeft(
          scrollMotion.scrollProgress,
        );

        if (dragRef.current.isDragging) {
          scrollMotion.userOffset =
            viewport.scrollLeft - scrollMotion.baseScrollLeft;
          return;
        }

        const nextScrollLeft = clampScrollLeft(
          scrollMotion.baseScrollLeft + scrollMotion.userOffset,
          scrollMotion.maxScrollLeft,
        );

        setViewportScrollLeft(nextScrollLeft);
      }

      measure();

      const tween = gsap.to(scrollMotion, {
        scrollProgress: 1,
        ease: "none",
        onUpdate: updateSliderScroll,
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure();
            updateSliderScroll();
          },
        },
      });

      const resizeObserver = new ResizeObserver(() => {
        measure();
        tween.scrollTrigger?.refresh();
      });

      resizeObserver.observe(viewport);

      if (viewport.firstElementChild) {
        resizeObserver.observe(viewport.firstElementChild);
      }

      return () => {
        tween.kill();
        resizeObserver.disconnect();

        if (programmaticScrollFrameRef.current !== null) {
          window.cancelAnimationFrame(programmaticScrollFrameRef.current);
          programmaticScrollFrameRef.current = null;
        }

        scrollMotion.isProgrammaticScroll = false;
      };
    },
    { scope: sectionRef, dependencies: [projectCards.length] },
  );

  useEffect(() => {
    return () => {
      if (cardTiltFrameRef.current !== null) {
        window.cancelAnimationFrame(cardTiltFrameRef.current);
      }
    };
  }, []);

  function syncUserScrollOffset(viewport) {
    const scrollMotion = scrollMotionRef.current;

    scrollMotion.maxScrollLeft = getMaxScrollLeft(viewport);
    scrollMotion.userOffset =
      clampScrollLeft(viewport.scrollLeft, scrollMotion.maxScrollLeft) -
      scrollMotion.baseScrollLeft;
  }

  function resetCardTilt(card) {
    if (cardTiltFrameRef.current !== null) {
      window.cancelAnimationFrame(cardTiltFrameRef.current);
      cardTiltFrameRef.current = null;
    }

    pendingCardTiltRef.current = null;

    card.style.setProperty("--card-tilt-x", "0deg");
    card.style.setProperty("--card-tilt-y", "0deg");
    card.style.setProperty("--lift-x", "0px");
    card.style.setProperty("--lift-y", "0px");
  }

  function resetVisibleCards() {
    sliderRef.current
      ?.querySelectorAll(".project-card-motion")
      .forEach((card) => resetCardTilt(card));
  }

  function handleCardPointerMove(event) {
    if (event.pointerType === "touch") return;
    if (dragRef.current.isDragging) return;

    pendingCardTiltRef.current = {
      card: event.currentTarget,
      clientX: event.clientX,
      clientY: event.clientY,
    };

    if (cardTiltFrameRef.current !== null) return;

    cardTiltFrameRef.current = window.requestAnimationFrame(() => {
      const pendingCardTilt = pendingCardTiltRef.current;

      cardTiltFrameRef.current = null;
      pendingCardTiltRef.current = null;

      if (!pendingCardTilt) return;

      const { card, clientX, clientY } = pendingCardTilt;
      const rect = card.getBoundingClientRect();

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      card.style.setProperty("--card-tilt-x", `${(x - 50) * 0.108}deg`);
      card.style.setProperty("--card-tilt-y", `${(50 - y) * 0.122}deg`);
      card.style.setProperty("--lift-x", `${(x - 50) * 0.28}px`);
      card.style.setProperty("--lift-y", `${(y - 50) * 0.22}px`);
    });
  }

  function handlePointerDown(event) {
    if (event.pointerType === "touch") return;

    const viewport = sliderRef.current;

    if (!viewport) return;

    resetVisibleCards();
    syncUserScrollOffset(viewport);

    dragRef.current = {
      isDragging: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
    };

    setIsDragging(true);
    viewport.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (event.pointerType === "touch") return;

    const viewport = sliderRef.current;
    const dragState = dragRef.current;

    if (!viewport || !dragState.isDragging) return;

    viewport.scrollLeft =
      dragState.startScrollLeft - (event.clientX - dragState.startX);

    syncUserScrollOffset(viewport);
  }

  function finishDrag() {
    const viewport = sliderRef.current;
    const dragState = dragRef.current;

    if (viewport && dragState.pointerId !== null) {
      viewport.releasePointerCapture?.(dragState.pointerId);
    }

    dragRef.current = {
      isDragging: false,
      pointerId: null,
      startX: 0,
      startScrollLeft: viewport ? viewport.scrollLeft : 0,
    };

    if (viewport) {
      syncUserScrollOffset(viewport);
    }

    setIsDragging(false);
  }

  function handleSliderScroll() {
    const viewport = sliderRef.current;
    const scrollMotion = scrollMotionRef.current;

    if (!viewport || scrollMotion.isProgrammaticScroll) return;

    syncUserScrollOffset(viewport);
  }

  function moveProjectCursor(event) {
    const cursor = cursorRef.current;

    if (!cursor || event.pointerType === "touch") return;

    gsap.to(cursor, {
      x: event.clientX - 52,
      y: event.clientY - 52,
      duration: 0.46,
      ease: "power3.out",
      overwrite: "auto",
    });
  }

  function showProjectCursor(event) {
    const pill = cursorPillRef.current;

    if (!pill || event.pointerType === "touch") return;

    moveProjectCursor(event);

    gsap.to(pill, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.24,
      ease: "power3.out",
      overwrite: "auto",
    });
  }

  function hideProjectCursor() {
    const pill = cursorPillRef.current;

    if (!pill) return;

    gsap.to(pill, {
      autoAlpha: 0,
      scale: 0.84,
      duration: 0.18,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      data-scroll-reveal="sequence"
      className="min-h-dvh overflow-hidden bg-[#141414] px-8 py-20 text-white md:px-10 md:py-24 lg:px-16 lg:py-32"
    >
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-2147483647 will-change-transform"
        style={{ transform: "translate3d(-140px, -140px, 0)" }}
      >
        <div
          ref={cursorPillRef}
          className="gradient-bg-flow invisible relative flex h-26 w-26 scale-[0.84] items-center justify-center rounded-full text-center text-[13px] leading-[0.92] font-black tracking-[-0.02em] text-white opacity-0 shadow-[0_18px_48px_rgba(0,0,0,0.22)] will-change-transform md:h-28 md:w-28 md:text-sm"
        >
          <span className="relative z-10 block max-w-18">Drag</span>
        </div>
      </div>

      <div className="grid min-h-0 grid-rows-[auto_auto] gap-7 md:gap-8 lg:grid-cols-[160px_minmax(0,1fr)_160px] lg:gap-x-5">
        <p
          data-reveal-part="kicker"
          className="m-0 text-sm leading-none font-black tracking-[0.08em] uppercase"
        >
          <span data-reveal-inner className="block">
            PROJECTS
          </span>
        </p>

        <div className="min-h-0 min-w-0 lg:col-start-2 lg:row-span-2">
          <h2
            data-reveal-part="title"
            className="m-0 mt-[-0.08em] text-[44px] leading-[0.78] font-black tracking-[-0.04em] uppercase md:text-[80px] lg:text-[120px]"
          >
            <span data-reveal-inner className="block">
              Highlights
            </span>
          </h2>

          <div data-reveal-part="content" className="mt-6 md:mt-8">
            <div
              ref={sliderRef}
              data-dragging={isDragging ? "true" : undefined}
              className="-my-8 cursor-grab overflow-x-auto py-8 select-none touch-pan-x [overscroll-behavior-inline:contain] [-webkit-overflow-scrolling:touch] scrollbar-none [-ms-overflow-style:none] data-[dragging=true]:cursor-grabbing [&::-webkit-scrollbar]:hidden"
              onPointerEnter={showProjectCursor}
              onPointerMove={(event) => {
                moveProjectCursor(event);
                handlePointerMove(event);
              }}
              onPointerDown={handlePointerDown}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onPointerLeave={() => {
                if (dragRef.current.isDragging) finishDrag();
                hideProjectCursor();
              }}
              onScroll={handleSliderScroll}
            >
              <div className="flex w-max gap-4">
                {projectCards.map((project, index) => {
                  const itemNumber = String(index + 1).padStart(2, "0");
                  const hasProjectLink = Boolean(project.liveUrl);
                  const isExternalLink = project.liveUrl?.startsWith("http");
                  const hasImage = Boolean(project.screenshot);
                  const technologies = project.technologies?.slice(0, 3) || [];

                  return (
                    <article
                      key={project.id}
                      className="project-card-motion group/project relative isolate w-[min(72vw,300px)] shrink-0 overflow-visible md:w-[min(40vw,320px)] lg:w-[clamp(300px,23vw,340px)]"
                      onPointerMove={handleCardPointerMove}
                      onPointerLeave={(event) =>
                        resetCardTilt(event.currentTarget)
                      }
                    >
                      <div className="relative flex h-full flex-col overflow-hidden border border-white/10 bg-[#181818] transition-colors duration-300 group-hover/project:border-white/20 group-focus-within/project:border-white/20">
                        <span
                          className="gradient-action-border pointer-events-none z-30 opacity-0 transition-opacity duration-300 group-hover/project:opacity-100 group-focus-within/project:opacity-100"
                          aria-hidden="true"
                        />

                        <div className="relative overflow-hidden bg-black">
                          <div
                            className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.48))]"
                            aria-hidden="true"
                          />

                          {hasImage ? (
                            <Image
                              className="pointer-events-none block aspect-16/10 w-full object-cover object-center"
                              src={project.screenshot}
                              alt={`${project.name} preview.`}
                              width={900}
                              height={563}
                              loading="lazy"
                              sizes="(min-width:1024px) 340px, (min-width:768px) 320px, 300px"
                              draggable={false}
                            />
                          ) : (
                            <div
                              className="gradient-bg-flow aspect-16/10 w-full opacity-80"
                              aria-hidden="true"
                            />
                          )}

                          <span className="project-card-lift project-card-number gradient-text-flow absolute bottom-3 left-4 z-20 text-[64px] leading-[0.88] font-black md:text-[76px] lg:text-[88px]">
                            {itemNumber}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 bg-[#202020] px-5 py-5 md:px-6">
                          <div className="flex flex-col gap-3">
                            {project.category ? (
                              <p className="project-card-lift m-0 text-[10px] leading-none font-black tracking-[0.14em] text-white/35 uppercase">
                                {project.category}
                              </p>
                            ) : null}

                            <h3 className="project-card-lift m-0 max-w-[10ch] text-[28px] leading-[0.82] font-black tracking-[-0.03em] uppercase md:text-[30px] lg:text-[32px]">
                              {project.name}
                            </h3>

                            <p className="project-card-lift m-0 max-w-[28ch] text-[13px] leading-tight font-medium text-white/50 md:text-sm">
                              {project.description}
                            </p>

                            {technologies.length ? (
                              <div className="project-card-lift flex flex-wrap gap-1.5 pt-1">
                                {technologies.map((technology) => (
                                  <span
                                    key={technology}
                                    className="border border-white/10 px-2 py-1 text-[9px] leading-none font-black tracking-[0.08em] text-white/42 uppercase"
                                  >
                                    {technology}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          {hasProjectLink ? (
                            <Link
                              href={project.liveUrl}
                              target={isExternalLink ? "_blank" : undefined}
                              rel={isExternalLink ? "noreferrer" : undefined}
                              className="project-card-lift mt-auto inline-flex w-fit items-center gap-2 pt-1 text-sm leading-none font-black tracking-[0.02em] uppercase no-underline"
                            >
                              <span
                                className="gradient-action-dot h-2 w-2 rounded-full"
                                aria-hidden="true"
                              />
                              View Project
                            </Link>
                          ) : (
                            <span className="project-card-lift mt-auto inline-flex w-fit items-center gap-2 pt-1 text-sm leading-none font-black tracking-[0.02em] text-white/35 uppercase">
                              <span
                                className="h-2 w-2 rounded-full bg-white/20"
                                aria-hidden="true"
                              />
                              No Live Link
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
