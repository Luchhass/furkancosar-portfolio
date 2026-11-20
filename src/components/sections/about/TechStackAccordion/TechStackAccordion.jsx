"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef } from "react";
import Image from "next/image";
import { techGroups } from "@/data/toolkit";
import { useLanguage } from "@/hooks/useLanguage";
import useToolkitMotion from "./useToolkitMotion";
import TitleLine from "@/components/ui/TitleLine";
import ReadingText from "@/components/ui/ReadingText";
import styles from "./Toolkit.module.css";

export default function TechStackAccordion() {
  const localize = useLocalizedContent();
  const root = useRef(null);

  const { locale } = useLanguage();
  useToolkitMotion(root, locale);

  return localize(<section ref={root} className={styles.section} data-header-theme="light" data-skip-section-snap aria-labelledby="toolkit-heading">
    <div data-toolkit-frame className={styles.frame}>
      <div data-toolkit-intro className={`ui-section ${styles.intro}`}>
        <div className={styles.center}>
          <h2 id="toolkit-heading" className="ui-section-title">
            <TitleLine data-toolkit-title>TOOLS</TitleLine>
            <TitleLine data-toolkit-title fromRight className="gradient-text-flow">I USE</TitleLine>
          </h2>
          <ReadingText data-toolkit-copy className="ui-section-copy">The technologies behind the interfaces I build. From the first line of code to the final interaction, these are the tools I use to turn ideas into thoughtful digital experiences.</ReadingText>
        </div>
      </div>
      <div data-toolkit-bands className={styles.bands} aria-hidden="true">
        {techGroups.map(group => <div key={group.label} className={styles.band}>
          <span data-toolkit-label className={styles.label}>{group.label}</span>
          <div data-toolkit-track className={styles.track}>
            {group.items.map(tool => <span className={styles.tool} key={tool.name}>
              <Image src={tool.logo} alt="" width={100} height={100} draggable={false} />
              <span>{tool.name}</span>
            </span>)}
          </div>
        </div>)}
      </div>
      <ul className="sr-only" aria-label="Technologies I use">
        {techGroups.flatMap(group => group.items).map(tool => <li key={tool.name}>{tool.name}</li>)}
      </ul>
    </div>
  </section>);
}
