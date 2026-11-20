import { useLanguage } from "@/hooks/useLanguage";

export default function HeroScrollCue() {
  const { t } = useLanguage();
  return (
    <div className="hero-scroll-cue overflow-hidden" data-hero-exit="cue" aria-hidden="true">
      <div data-hero-cue className="flex items-center gap-3">
        <span>{t("SCROLL TO EXPLORE")}</span>
        <span className="hero-scroll-arrow">
          <svg className="hero-scroll-arrow-head" width="18" height="10" viewBox="0 0 18 10" fill="none"><path d="m3 2 6 6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
    </div>
  );
}
