"use client";

import { useRef } from "react";
import MiniTitleText from "@/components/ui/MiniTitleText";
import ReadingText from "@/components/ui/ReadingText";
import { useLocalizedContent } from "@/lib/localizeContent";
import { chapters } from "@/data/journey";
import useJourneyMotion from "./useJourneyMotion";
import navigationStyles from "./JourneyNavigation.module.css";

function JourneyNavigation({ active, onSelect }) {
  const localize = useLocalizedContent();
  return localize(
    <nav className={`journey-controls ${navigationStyles.controls}`} aria-label="Journey chapters">
      <div className="journey-rail" aria-hidden="true"><span className="journey-rail-fill" /></div>
      <div className="journey-chapter-links">
        {chapters.map(({ short }, index) => {
          const isActive = active === index;
          const number = String(index + 1).padStart(2, "0");
          return (
            <button type="button" key={short} aria-label={`Go to chapter ${index + 1}: ${short}`}
              aria-current={isActive ? "step" : undefined} onClick={() => onSelect(index)}>
              <span className={navigationStyles.entry} data-journey-step-enter>
                <span className={`${navigationStyles.body} invisible`} aria-hidden="true">
                  <span className={navigationStyles.number}>{number}</span>
                  <span className={navigationStyles.label}>{short}</span>
                </span>
                <span className={navigationStyles.track} data-journey-step-track aria-hidden="true">
                  {[0, 1].map(copy => (
                    <span className={navigationStyles.body} key={copy}>
                      <span className={`${navigationStyles.number} ${isActive ? "gradient-text-flow" : ""}`} data-journey-step-number>{number}</span>
                      <span className={navigationStyles.label}>{short}</span>
                    </span>
                  ))}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function Journey() {
  const localize = useLocalizedContent();
  const ref = useRef(null);
  const { active, enhanced, selectChapter } = useJourneyMotion(ref, chapters.length);

  return localize(
    <section ref={ref} className="ui-journey journey-story" style={{ "--journey-chapters": chapters.length }}
      data-header-theme="dark" aria-labelledby="journey-title">
      <div className="journey-frame">
        <header className="journey-deck-heading">
          <h2 id="journey-title" className="ui-section-label"><MiniTitleText>My journey</MiniTitleText></h2>
        </header>
        <div className="journey-slides">
          {chapters.map(({ short, copy }, index) => (
            <article className="journey-slide" key={short} aria-hidden={enhanced ? active !== index : undefined}>
              <div className="journey-slide-words">
                <h3><span className="journey-line-mask"><span className="journey-line">{short}</span></span></h3>
                <ReadingText active={enhanced && active === index} className="journey-slide-copy">{copy}</ReadingText>
              </div>
            </article>
          ))}
        </div>
        <JourneyNavigation active={active} onSelect={selectChapter} />
      </div>
    </section>
  );
}
