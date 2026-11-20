import { useLocalizedContent } from "@/lib/localizeContent";
import { ChromeContact, ChromeNavigation, ChromeRings, ChromeSocials } from "../SiteChrome";

export default function SiteMenu({ menuRef, pathname, onNavigate }) {
  const localize = useLocalizedContent();
  return localize(
    <div
      ref={menuRef}
      id="site-menu"
      className="ui-chrome site-menu-frame fixed inset-0 z-40 isolate grid h-dvh overflow-x-hidden overflow-y-auto bg-[#f8f8f5] text-[#111]"
      data-lenis-prevent
      style={{ clipPath: "inset(0% 0% 100% 0%)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
    >
      <ChromeRings menu />

      <div className="site-menu-links">
        <ChromeNavigation pathname={pathname} variant="menu" onNavigate={onNavigate} />
      </div>

      <div className="site-menu-meta flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <ChromeContact menu />
        <ChromeSocials menu />
      </div>
    </div>
  );
}
