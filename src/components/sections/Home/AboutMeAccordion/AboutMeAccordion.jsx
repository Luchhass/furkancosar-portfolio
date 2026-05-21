"use client";

import { useRef, useState } from "react";
import { Code2, Sparkles, Workflow } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import OutlineCirclesBackground from "@/components/ui/Backgrounds/OutlineCirclesBackground";

gsap.registerPlugin(useGSAP);

const accordionItems = [
  {
    id: "build",
    title: "What I Build",
    descriptionLines: [
      "I create responsive web interfaces that look clean, feel modern and",
      "work smoothly across different screens. My focus is on building pages",
      "that are easy to understand, visually balanced and comfortable to use.",
    ],
    Icon: Code2,
  },
  {
    id: "details",
    title: "What I Care About",
    descriptionLines: [
      "I pay attention to layout, spacing, motion and small interface details",
      "that make a website feel more polished. I like when every section has",
      "a clear purpose, a strong visual rhythm and a smooth interaction flow.",
    ],
    Icon: Sparkles,
  },
  {
    id: "workflow",
    title: "How I Work",
    descriptionLines: [
      "I like building step by step, keeping components organized and making",
      "each section feel clear and intentional. I usually start from the structure,",
      "refine the visual details and improve the experience without making it complicated.",
    ],
    Icon: Workflow,
  },
];

function AccordionTextLine({ children }) {
  return (
    <span className="block overflow-hidden">
      <span data-accordion-line className="block">
        {children}
      </span>
    </span>
  );
}

export default function AboutMeAccordion() {
  const [openId, setOpenId] = useState(accordionItems[0].id);
  const accordionRef = useRef(null);
  const animationFrameRef = useRef(null);

  useGSAP(
    () => {
      const accordion = accordionRef.current;

      if (!accordion) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      const allLines = gsap.utils.toArray(
        accordion.querySelectorAll("[data-accordion-line]"),
      );

      const activeLines = gsap.utils.toArray(
        accordion.querySelectorAll(
          `#about-panel-${openId} [data-accordion-line]`,
        ),
      );

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      gsap.killTweensOf(allLines);

      gsap.set(allLines, {
        yPercent: 112,
        autoAlpha: 1,
        willChange: "transform",
      });

      if (prefersReducedMotion.matches) {
        gsap.set(activeLines, {
          yPercent: 0,
          clearProps: "willChange",
        });

        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = window.requestAnimationFrame(() => {
          gsap.to(activeLines, {
            yPercent: 0,
            duration: 0.78,
            ease: "power4.out",
            stagger: 0.075,
            overwrite: true,
            clearProps: "willChange",
          });

          animationFrameRef.current = null;
        });
      });

      return () => {
        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        gsap.killTweensOf(allLines);
      };
    },
    { scope: accordionRef, dependencies: [openId] },
  );

  function updateTitleFillOrigin(event) {
    const button = event.currentTarget;
    const text = button.firstElementChild;
    const rect = text.getBoundingClientRect();

    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

    button.style.setProperty("--gradient-title-fill-x", `${x}px`);
    button.style.setProperty("--gradient-title-fill-y", `${y}px`);
  }

  return (
    <section
      ref={accordionRef}
      data-header-theme="light"
      data-scroll-reveal="sequence"
      className="relative isolate min-h-dvh overflow-hidden bg-white px-8 py-20 text-black md:px-10 md:py-24 lg:px-16 lg:py-32"
    >
      <OutlineCirclesBackground />
      
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <linearGradient
            id="accordion-icon-gradient"
            x1="-1"
            y1="0"
            x2="2"
            y2="1"
          >
            <stop stopColor="#6768ff" />
            <stop offset=".35" stopColor="#884cff" />
            <stop offset=".6" stopColor="#cf3d9f" />
            <stop offset="1" stopColor="#ee4b67" />

            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-1 0; 1 0; -1 0"
              dur="8s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 grid w-full max-w-205 grid-cols-[40px_minmax(0,1fr)] gap-x-4 md:grid-cols-[120px_minmax(0,1fr)] md:gap-x-5 lg:grid-cols-[160px_minmax(0,1fr)]">
        <h2
          data-reveal-part="title"
          className="col-start-2 m-0 flex flex-col text-[44px] leading-[0.9] font-black tracking-[-0.04em] uppercase md:text-[80px] lg:text-[120px]"
        >
          <span>ABOUT</span>
          <span className="gradient-text-flow">ME</span>
        </h2>

        <div
          data-reveal-part="content"
          className="col-span-2 mt-8 border-t border-black/10 md:mt-10"
        >
          {accordionItems.map((item) => {
            const isOpen = openId === item.id;
            const Icon = item.Icon;

            return (
              <div
                key={item.id}
                className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 border-b border-black/10 py-5 md:grid-cols-[120px_minmax(0,1fr)] md:gap-x-5 md:py-6 lg:grid-cols-[160px_minmax(0,1fr)]"
              >
                <Icon
                  color="url(#accordion-icon-gradient)"
                  strokeWidth={2.3}
                  className="gradient-icon-flow mt-1 h-5 w-5 md:h-6 md:w-6"
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <button
                    type="button"
                    className="gradient-title-button w-full cursor-pointer border-0 bg-transparent p-0 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`about-panel-${item.id}`}
                    data-active={isOpen ? "true" : undefined}
                    onClick={() => setOpenId(item.id)}
                    onPointerEnter={updateTitleFillOrigin}
                    onPointerLeave={updateTitleFillOrigin}
                  >
                    <span className="gradient-title-text text-[28px] leading-[0.82] font-black tracking-[-0.03em] text-black/90 uppercase md:text-[30px] lg:text-[32px]">
                      <span>{item.title}</span>

                      <span
                        className="gradient-text-flow gradient-title-fill"
                        aria-hidden="true"
                      >
                        {item.title}
                      </span>
                    </span>
                  </button>

                  <div
                    id={`about-panel-${item.id}`}
                    aria-hidden={!isOpen}
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <p className="m-0 max-w-2xl pt-2 text-[13px] leading-tight font-medium text-black/75 md:text-sm">
                        {item.descriptionLines.map((line) => (
                          <AccordionTextLine key={line}>
                            {line}
                          </AccordionTextLine>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}