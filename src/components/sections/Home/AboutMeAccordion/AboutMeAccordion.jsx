"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { updateTitleFillOrigin } from "@/lib/pointerOrigin";
import { useRef, useState } from "react";
import { Code2, Sparkles, Workflow } from "lucide-react";
import OutlineCirclesBackground from "@/components/ui/Backgrounds/OutlineCirclesBackground";
import ReadingText from "@/components/ui/ReadingText";
import styles from "./AboutPanelDeck.module.css";
import useSectionScene from "@/lib/useSectionScene";
import MiniTitleText from "@/components/ui/MiniTitleText";
import TitleLine from "@/components/ui/TitleLine";


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
  const localize = useLocalizedContent();
  const [openId, setOpenId] = useState(accordionItems[0].id);
  const accordionRef = useRef(null);
  useSectionScene(accordionRef);



  return (
    localize(<section
      ref={accordionRef}
      data-header-theme="light"
      data-scroll-reveal="sequence"
      className={`ui-screen ui-fit-panel ui-screen-about relative isolate overflow-hidden bg-white ui-section text-black ${styles.section}`}
    >
      <OutlineCirclesBackground />

      <div className="ui-section-grid relative z-10">
        <p data-reveal-part="kicker" className="ui-section-label text-black/55"><MiniTitleText>About</MiniTitleText></p>
        <div className={`ui-section-body ui-section-split about-scene-layout ${styles.layout}`}>
      <div className="min-w-0">
        <h2
          data-reveal-part="title"
          className="ui-section-title flex flex-col"
        >
          <TitleLine>ABOUT ME</TitleLine>
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
                data-scene-content-owned
                data-reveal-order="4"
                className={`ui-accordion-row ${styles.row}`}
              >
                <Icon
                  data-scene-icon
                  color="var(--color-primary)"
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
                    <TitleLine><span className="gradient-title-text ui-accordion-title text-black/90">
                      <span>{item.title}</span>

                      <span
                        className="gradient-text-flow gradient-title-fill"
                        aria-hidden="true"
                      >
                        {item.title}
                      </span>
                    </span></TitleLine>
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
                      <ReadingText active={isOpen} data-reveal-order="5" className="ui-section-copy relative text-black/75">{item.description}</ReadingText>
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
    </section>)
  );
}
