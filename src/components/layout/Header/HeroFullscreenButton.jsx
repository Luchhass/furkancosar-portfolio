import { Lock, LockOpen } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function HeroFullscreenButton({ isHeroFullscreen, showHeroFullscreenControl, toggleHeroFullscreen }) {
  const { t } = useLanguage();
  const FullscreenIcon = isHeroFullscreen ? Lock : LockOpen;

  return (
    <button
      type="button"
      data-hero-fullscreen-toggle
      aria-label={t(isHeroFullscreen ? "Exit hero full screen" : "Open hero full screen")}
      aria-pressed={isHeroFullscreen}
      title={t(isHeroFullscreen ? "Exit full screen" : "Full screen")}
      onClick={toggleHeroFullscreen}
      className={`group ui-header-control ui-header-fullscreen-control relative h-11 w-11 cursor-pointer border-0 bg-transparent p-0 text-current transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current md:hidden ${
        showHeroFullscreenControl || isHeroFullscreen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <span
        data-hero-intro="fullscreen-button"
        className="absolute inset-0"
      >
        <FullscreenIcon
          className="hero-fullscreen-icon absolute h-7 w-7"
          strokeWidth={2.25}
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
