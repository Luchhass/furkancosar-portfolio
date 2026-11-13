"use client";
import { MOTION } from "@/lib/motionPresets";
import { useCallback, useRef, useState } from "react";
import { Code2, Sparkles, Workflow } from "lucide-react";
import OutlineCirclesBackground from "@/components/ui/Backgrounds/OutlineCirclesBackground";
import ResponsiveTextLines from "@/components/ui/ResponsiveTextLines/ResponsiveTextLines";
import styles from "./AboutPanelDeck.module.css";
import useSectionScene from "@/lib/useSectionScene";
import useAccordionMotion from "@/lib/useAccordionMotion";


const accordionItems = [
  {
    id: "build",
    title: "What I Build",
    description:
      "I create responsive web interfaces that look clean, feel modern and work smoothly across different screens. My focus is on building pages that are easy to understand, visually balanced and comfortable to use.",
    Icon: Code2,
  },
  {
    id: "details",
    title: "What I Care About",
    description:
      "I pay attention to layout, spacing, motion and small interface details that make a website feel more polished. I like when every section has a clear purpose, a strong visual rhythm and a smooth interaction flow.",
    Icon: Sparkles,
  },
  {
    id: "workflow",
    title: "How I Work",
    description:
      "I like building step by step, keeping components organized and making each section feel clear and intentional. I usually start from the structure, refine the visual details and improve the experience without making it complicated.",
    Icon: Workflow,
  },
];

export default function AboutMeAccordion() {
  const [openId, setOpenId] = useState(accordionItems[0].id);
  const [lineLayoutKey, setLineLayoutKey] = useState(0);
  const accordionRef = useRef(null);
  useSectionScene(accordionRef, "accordion");

  const handleLinesChange = useCallback(() => {
    setLineLayoutKey((currentKey) => currentKey + 1);
  }, []);

  useAccordionMotion(accordionRef, `about-panel-${openId}`, "[data-accordion-line]", "", lineLayoutKey);

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
      className={`ui-screen ui-fit-panel ui-screen-about relative isolate overflow-hidden bg-white ui-section text-black ${styles.section}`}
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
              dur={`${MOTION.gradientSeconds}s`}
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="ui-section-grid relative z-10">
        <p data-reveal-part="kicker" className="ui-section-label text-black/55"><span data-reveal-inner>About</span></p>
        <div className={`ui-section-body ui-section-split about-scene-layout ${styles.layout}`}>
      <div className="min-w-0">
        <h2
          data-reveal-part="title"
          className="ui-section-title flex flex-col"
        >
          <span>ABOUT</span>
          <span>ME</span>
        </h2>

        <div
          data-reveal-part="content"
          className="ui-accordion"
        >
          {accordionItems.map((item) => {
            const isOpen = openId === item.id;
            const Icon = item.Icon;

            return (
              <div
                key={item.id}
                data-scene-row
                className={`ui-accordion-row ${styles.row}`}
              >
                <Icon
                  data-scene-icon
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
                    <span className="gradient-title-text ui-accordion-title text-black/90">
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
                      <p className="ui-section-copy relative text-black/75">
                        <ResponsiveTextLines
                          text={item.description}
                          lineAttribute="data-accordion-line"
                          onLinesChange={handleLinesChange}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
      </div>
    </section>
  );
}
