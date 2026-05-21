"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { latestProjects } from "@/data/projects";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CARD_REVEAL_DURATION = 0.44;
const CARD_REVEAL_STEP = 0.2;
const CARD_HIDE_DURATION = 0.26;
const CARD_HIDE_STEP = 0.13;

function normalizeValue(value = "") {
  return String(value).trim().toLowerCase();
}

export default function ProjectsList({ projects = latestProjects }) {
  const sectionRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchLineRef = useRef(null);
  const cardTiltFrameRef = useRef(null);
  const pendingCardTiltRef = useRef(null);
  const hasResultMotionPlayedRef = useRef(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const projectCards = projects;

  const categoryOptions = useMemo(() => {
    const categories = new Map();

    projectCards.forEach((project) => {
      const rawCategory = project.category?.trim();

      if (!rawCategory) return;

      const key = normalizeValue(rawCategory);

      if (!categories.has(key)) {
        categories.set(key, rawCategory);
      }
    });

    return [
      { key: "all", label: "All" },
      ...Array.from(categories.entries()).map(([key, label]) => ({
        key,
        label,
      })),
    ];
  }, [projectCards]);

  const safeActiveCategory = useMemo(() => {
    const exists = categoryOptions.some((category) => {
      return category.key === activeCategory;
    });

    return exists ? activeCategory : "all";
  }, [activeCategory, categoryOptions]);

  const activeCategoryLabel = useMemo(() => {
    return (
      categoryOptions.find((category) => category.key === safeActiveCategory)
        ?.label || "All"
    );
  }, [categoryOptions, safeActiveCategory]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = normalizeValue(searchTerm);
    const total = projectCards.length;

    return projectCards
      .map((project, originalIndex) => ({
        ...project,
        __projectNumber: total - originalIndex,
      }))
      .filter((project) => {
        const projectCategory = normalizeValue(project.category);

        const matchesCategory =
          safeActiveCategory === "all" ||
          projectCategory === safeActiveCategory;

        const searchableContent = [
          project.name,
          project.tagline,
          project.description,
          project.category,
          project.type,
          project.status,
          ...(project.technologies || []),
          ...(project.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedSearch || searchableContent.includes(normalizedSearch);

        return matchesCategory && matchesSearch;
      });
  }, [safeActiveCategory, projectCards, searchTerm]);

  const displayProjects = useMemo(() => {
    return filteredProjects;
  }, [filteredProjects]);

  const cardRenderKey = displayProjects
    .map((project) => project.id || project.slug || project.name)
    .join("|");

  const resultCount = String(displayProjects.length).padStart(2, "0");

  const resultLabel =
    safeActiveCategory !== "all" || searchTerm.trim() ? "MATCHES" : "PROJECTS";

  const hasActiveFilters = Boolean(
    searchTerm.trim() || safeActiveCategory !== "all",
  );

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) return undefined;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      const masks = gsap.utils.toArray(
        section.querySelectorAll("[data-project-card-reveal]"),
      );

      if (prefersReducedMotion.matches) {
        masks.forEach((mask) => {
          mask.dataset.revealMaskActive = "false";
          mask.dataset.revealReady = "true";
        });

        return undefined;
      }

      const cardPairs = masks
        .map((mask, index) => ({
          index,
          mask,
          inner: mask.querySelector("[data-project-card-reveal-inner]"),
        }))
        .filter(({ inner }) => inner);

      const pairByMask = new Map(cardPairs.map((pair) => [pair.mask, pair]));
      const activeTimelines = new Set();

      if (!cardPairs.length) return undefined;

      function setHidden({ mask, inner }) {
        gsap.killTweensOf(inner);
        gsap.set(inner, {
          autoAlpha: 1,
          xPercent: -112,
          transformOrigin: "0% 50%",
        });
        mask.dataset.revealReady = "true";
      }

      function getBatchPairs(batch, shouldReverse = false) {
        const pairs = batch
          .map((mask) => pairByMask.get(mask))
          .filter(Boolean)
          .sort((a, b) => a.index - b.index);

        return shouldReverse ? pairs.reverse() : pairs;
      }

      function createTimeline() {
        const timeline = gsap.timeline({
          onComplete: () => activeTimelines.delete(timeline),
        });

        activeTimelines.add(timeline);
        return timeline;
      }

      function playReveal(batch) {
        const pairs = getBatchPairs(batch);
        const timeline = createTimeline();

        pairs.forEach(({ mask, inner }, index) => {
          gsap.killTweensOf(inner);
          mask.dataset.revealMaskActive = "true";

          timeline.fromTo(
            inner,
            {
              autoAlpha: 1,
              xPercent: -112,
              transformOrigin: "0% 50%",
              willChange: "transform",
            },
            {
              xPercent: 0,
              duration: CARD_REVEAL_DURATION,
              ease: "expo.out",
              force3D: true,
              overwrite: true,
              clearProps: "willChange,transformOrigin",
              onComplete: () => {
                mask.dataset.revealMaskActive = "false";
              },
            },
            index * CARD_REVEAL_STEP,
          );
        });
      }

      function playHide(batch) {
        const pairs = getBatchPairs(batch, true);
        const timeline = createTimeline();

        pairs.forEach(({ mask, inner }, index) => {
          gsap.killTweensOf(inner);
          mask.dataset.revealMaskActive = "true";

          timeline.to(
            inner,
            {
              xPercent: -112,
              duration: CARD_HIDE_DURATION,
              ease: "power2.inOut",
              force3D: true,
              overwrite: true,
              transformOrigin: "0% 50%",
              willChange: "transform",
              onComplete: () => {
                mask.dataset.revealMaskActive = "true";
              },
            },
            index * CARD_HIDE_STEP,
          );
        });
      }

      cardPairs.forEach(setHidden);

      const triggers = ScrollTrigger.batch(masks, {
        start: "top 82%",
        end: "bottom 18%",
        batchMax: 3,
        interval: 0.02,
        onEnter: playReveal,
        onEnterBack: playReveal,
        onLeave: playHide,
        onLeaveBack: playHide,
      });

      return () => {
        triggers.forEach((trigger) => trigger.kill());
        activeTimelines.forEach((timeline) => timeline.kill());

        const inners = cardPairs.map(({ inner }) => inner);

        gsap.killTweensOf(inners);

        masks.forEach((mask) => {
          mask.dataset.revealMaskActive = "false";
          delete mask.dataset.revealReady;
        });

        gsap.set(inners, {
          clearProps: "transform,opacity,visibility,willChange,transformOrigin",
        });
      };
    },
    { scope: sectionRef, dependencies: [cardRenderKey] },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) return undefined;

      const controlItems = gsap.utils.toArray(
        section.querySelectorAll("[data-project-control-item]"),
      );

      if (!controlItems.length) return undefined;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (prefersReducedMotion.matches) {
        gsap.set(controlItems, {
          clearProps: "opacity,visibility,transform",
        });

        return undefined;
      }

      gsap.set(controlItems, {
        autoAlpha: 0,
        y: 18,
      });

      const trigger = ScrollTrigger.create({
        trigger: controlItems[0],
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(controlItems, {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.08,
            ease: "expo.out",
            clearProps: "opacity,visibility,transform",
          });
        },
      });

      return () => {
        trigger.kill();
        gsap.killTweensOf(controlItems);
        gsap.set(controlItems, {
          clearProps: "opacity,visibility,transform",
        });
      };
    },
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) return undefined;

      if (!hasResultMotionPlayedRef.current) {
        hasResultMotionPlayedRef.current = true;
        return undefined;
      }

      const resultNodes = gsap.utils.toArray(
        section.querySelectorAll("[data-project-result-motion]"),
      );

      if (!resultNodes.length) return undefined;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      if (prefersReducedMotion.matches) return undefined;

      gsap.fromTo(
        resultNodes,
        {
          autoAlpha: 0,
          y: 18,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.44,
          stagger: 0.05,
          ease: "expo.out",
          clearProps: "opacity,visibility,transform",
        },
      );

      return () => {
        gsap.killTweensOf(resultNodes);
      };
    },
    { scope: sectionRef, dependencies: [cardRenderKey] },
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [cardRenderKey]);

  useEffect(() => {
    return () => {
      if (cardTiltFrameRef.current !== null) {
        window.cancelAnimationFrame(cardTiltFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!searchLineRef.current) return;

    const isFocused = document.activeElement === searchInputRef.current;
    const hasSearchValue = Boolean(searchTerm.trim());

    gsap.to(searchLineRef.current, {
      scaleX: isFocused || hasSearchValue ? 1 : 0,
      duration: 0.42,
      ease: "expo.out",
      overwrite: true,
    });
  }, [searchTerm]);

  function animateSearchLine(scaleX) {
    if (!searchLineRef.current) return;

    gsap.to(searchLineRef.current, {
      scaleX,
      duration: 0.42,
      ease: "expo.out",
      overwrite: true,
    });
  }

  function handleSearchFocus() {
    animateSearchLine(1);
  }

  function handleSearchBlur() {
    if (searchTerm.trim()) return;

    animateSearchLine(0);
  }

  function handleClearSearch() {
    setSearchTerm("");
    searchInputRef.current?.focus();
    animateSearchLine(1);
  }

  function handleResetFilters() {
    setSearchTerm("");
    setActiveCategory("all");
    searchInputRef.current?.focus();
    animateSearchLine(1);
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

  function handleCardPointerMove(event) {
    if (event.pointerType === "touch") return;

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

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      data-scroll-reveal="sequence"
      className="min-h-dvh bg-[#141414] px-8 py-20 text-white md:px-10 md:py-24 lg:px-16 lg:py-32"
      aria-labelledby="projects-list-title"
    >
      <div className="grid min-h-0 gap-7 md:gap-8 lg:grid-cols-[160px_minmax(0,1fr)_160px] lg:gap-x-5">
        <p
          data-reveal-part="kicker"
          className="m-0 text-sm leading-none font-black tracking-[0.08em] uppercase"
        >
          <span data-reveal-inner className="block">
            PROJECTS
          </span>
        </p>

        <div className="min-w-0 lg:col-start-2">
          <h2
            id="projects-list-title"
            data-reveal-part="title"
            className="m-0 mt-[-0.08em] text-[44px] leading-[0.78] font-black tracking-[-0.04em] uppercase md:text-[80px] lg:text-[120px]"
          >
            <span className="block">Selected</span>
            <span className="block">Work</span>
          </h2>

          <div data-project-controls className="mt-8 md:mt-10 lg:mt-12">
            <div className="grid gap-6 md:grid-cols-[minmax(0,620px)_auto] md:items-end md:justify-between md:gap-10">
              <label
                data-project-control-item
                className="relative block min-w-0"
              >
                <span className="mb-4 block text-[10px] leading-none font-black tracking-[0.16em] text-white/42 uppercase">
                  Search Projects
                </span>

                <span className="group/search relative flex h-12 items-center border-b border-white/14 transition-colors duration-300 focus-within:border-white/25 hover:border-white/20">
                  <Search
                    className="pointer-events-none absolute left-0 size-4 text-white/34 transition-colors duration-300 group-focus-within/search:text-white/60"
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    placeholder="Search by project, category or technology"
                    className="h-full w-full border-0 bg-transparent pr-11 pl-8 text-[15px] leading-none font-semibold text-white outline-none placeholder:text-white/24 md:text-base"
                    aria-label="Search projects"
                  />

                  {searchTerm ? (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-0 grid size-8 place-items-center text-white/42 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
                      aria-label="Clear project search"
                    >
                      <X className="size-4" strokeWidth={2.5} />
                    </button>
                  ) : null}

                  <span
                    ref={searchLineRef}
                    className="gradient-bg-flow pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0"
                    aria-hidden="true"
                  />
                </span>
              </label>

              <div
                data-project-control-item
                className="shrink-0 md:min-w-27.5 md:pb-0.5 md:text-right"
                aria-live="polite"
              >
                <p className="gradient-text-flow m-0 text-[40px] leading-[0.82] font-black tracking-[-0.04em] uppercase md:text-[48px]">
                  {resultCount}
                </p>

                <p className="m-0 mt-2 text-[10px] leading-none font-black tracking-[0.16em] text-white/42 uppercase">
                  {resultLabel}
                </p>
              </div>
            </div>

            {categoryOptions.length > 1 ? (
              <div
                data-project-control-item
                className="mt-7 flex gap-x-7 gap-y-4 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden md:mt-8 md:flex-wrap md:overflow-visible md:pb-0"
                role="tablist"
                aria-label="Filter projects by category"
              >
                {categoryOptions.map((category) => {
                  const isActive = safeActiveCategory === category.key;

                  return (
                    <button
                      key={category.key}
                      type="button"
                      data-active={isActive}
                      onClick={() => setActiveCategory(category.key)}
                      className="group/filter relative inline-flex shrink-0 items-center gap-2.5 pb-2 text-[12px] leading-none font-black tracking-[0.11em] text-white/38 uppercase transition-colors duration-300 hover:text-white/78 data-[active=true]:text-white"
                      role="tab"
                      aria-selected={isActive}
                    >
                      <span
                        className={
                          isActive
                            ? "gradient-action-dot h-2 w-2 rounded-full"
                            : "h-2 w-2 rounded-full bg-white/18 transition-colors duration-300 group-hover/filter:bg-white/42"
                        }
                        aria-hidden="true"
                      />

                      <span>{category.label}</span>

                      <span
                        className={
                          isActive
                            ? "gradient-bg-flow absolute right-0 bottom-0 left-4 h-px origin-left scale-x-100"
                            : "absolute right-0 bottom-0 left-4 h-px origin-left scale-x-0"
                        }
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {displayProjects.length ? (
            <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
              {displayProjects.map((project) => {
                const itemNumber = String(project.__projectNumber).padStart(
                  2,
                  "0",
                );
                const hasProjectLink = Boolean(project.liveUrl);
                const isExternalLink = project.liveUrl?.startsWith("http");
                const hasImage = Boolean(project.screenshot);
                const technologies = project.technologies?.slice(0, 4) || [];

                return (
                  <div
                    key={project.id || project.slug || project.name}
                    data-project-result-motion
                    data-project-card-reveal
                    data-reveal-mask-active="true"
                    className="min-w-0 overflow-visible data-[reveal-mask-active=true]:overflow-hidden data-[reveal-mask-active=true]:contain-[paint]"
                  >
                    <div data-project-card-reveal-inner className="h-full">
                      <article
                        className="project-card-motion group/project relative isolate h-full min-w-0 overflow-visible"
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
                                sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
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
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              data-project-result-motion
              className="mt-10 border border-white/10 bg-white/2.5 px-5 py-6 md:mt-12 md:px-6 md:py-7"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="m-0 inline-flex items-center gap-2 text-[10px] leading-none font-black tracking-[0.16em] text-white/35 uppercase">
                    <span
                      className="gradient-action-dot h-2 w-2 rounded-full"
                      aria-hidden="true"
                    />
                    No results
                  </p>

                  <p className="m-0 mt-3 max-w-[38ch] text-sm leading-tight font-medium text-white/48">
                    No projects match the current search or filter.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex w-fit items-center gap-2 border border-white/12 px-4 py-3 text-[11px] leading-none font-black tracking-widest text-white/80 uppercase transition-colors duration-300 hover:border-white/25 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
