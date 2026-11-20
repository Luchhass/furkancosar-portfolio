"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import useHeroMotion from "./useHeroMotion";
import HeroFooter from "./HeroFooter";
import HeroScrollCue from "./HeroScrollCue";
import { GeometricPentagonBackground } from "../Backgrounds/GeometricPentagonBackground";
import HeroDetails from "./HeroDetails";
import { useLanguage } from "@/hooks/useLanguage";

function normalizeCopyLines(copyLines) {
  if (Array.isArray(copyLines)) {
    return copyLines.filter(Boolean);
  }

  return String(copyLines || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function Hero(props) {
  const { locale } = useLanguage();
  return <HeroContent key={locale} {...props} />;
}

function HeroContent({ titleLines, copyLines, stat, action, copyClassName = "", detailVariant }) {
  const localize = useLocalizedContent();
  const heroRef = useRef(null);
  const pathname = usePathname();
  const heroCopyLines = normalizeCopyLines(copyLines);
  useHeroMotion(heroRef, pathname);

  return (
    localize(<section
      ref={heroRef}
      data-hero-fullscreen-surface
      data-header-theme="dark"
      data-scroll-reveal="off"
      className="ui-hero portfolio-hero relative isolate grid h-dvh grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] overflow-x-clip bg-black"
    >
      <div data-hero-background className="absolute inset-0 -z-10"><GeometricPentagonBackground /></div>
      {detailVariant && <HeroDetails variant={detailVariant} />}
      <HeroScrollCue />

      <h1 className="ui-hero-title relative z-10 row-start-2 m-0 flex flex-col items-center justify-self-center text-center text-white">
        {titleLines.map((line) => (
          <span key={line.text} data-hero-line-mask className="block overflow-hidden">
            <span
              data-hero-title
              data-title-reveal
              className={`${line.gradient ? "gradient-text-flow " : ""}block`}
            >
              {line.text}
            </span>
          </span>
        ))}
      </h1>

      <HeroFooter stat={stat} action={action} copyLines={heroCopyLines} copyClassName={copyClassName} />
    </section>)
  );
}
