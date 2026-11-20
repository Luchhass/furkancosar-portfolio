"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";
import { useLocalizedContent } from "@/lib/localizeContent";
import { basePath } from "@/lib/localizedRoutes";
import HeroFullscreenButton from "./HeroFullscreenButton";
import SiteMenu from "./SiteMenu";
import LanguageToggle from "../LanguageToggle";
import useHeaderTheme from "./useHeaderTheme";
import useHeroFullscreen from "./useHeroFullscreen";
import useSiteMenu from "./useSiteMenu";

export default function Header() {
  const localize = useLocalizedContent();
  const pathname = usePathname();
  const fullscreen = useHeroFullscreen(pathname);
  const headerTheme = useHeaderTheme(pathname);
  const { menuRef, isMenuOpen, toggleMenu, closeMenuImmediately, navigateFromMenu } = useSiteMenu(pathname);
  const activeHeaderTheme = isMenuOpen ? "light" : headerTheme;
  const headerColorClass = activeHeaderTheme === "light" ? "text-black" : "text-white";

  return localize(<>
      <header
        className={`ui-header pointer-events-none fixed inset-x-0 top-0 z-50 transition-[color,opacity] duration-300 ${headerColorClass}`}
        aria-label="Primary navigation"
      >
        <div className="ui-header-slot ui-header-left">
          {!isMenuOpen && <HeroFullscreenButton {...fullscreen} />}
          {isMenuOpen ? (
            <LanguageToggle />
          ) : (
            <div className="hidden md:flex">
              {basePath(pathname) !== "/projects" && (
                <Link
                  href="/projects"
                  onClick={closeMenuImmediately}
                  data-hero-intro="projects-link"
                  className="ui-header-projects group pointer-events-auto inline-flex items-center text-xs leading-none font-black whitespace-nowrap text-current no-underline"
                >
                  <span data-header-intro-content className="ui-header-projects-text relative after:absolute after:bottom-[-0.45rem] after:left-0 after:h-0.5 after:w-full after:bg-current after:[clip-path:inset(0_100%_0_0)] after:opacity-90 after:transition-[clip-path] after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:after:[clip-path:inset(0_0_0_0)] group-focus-visible:after:[clip-path:inset(0_0_0_0)]">
                    SEE MY PROJECTS
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>

        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          onClick={closeMenuImmediately}
          data-hero-intro="brand"
          className="ui-header-brand pointer-events-auto inline-flex items-center leading-none font-bold text-current no-underline"
        >
          <span data-header-intro-content="brand" className="relative inline-flex h-full items-center">
            <span className="ui-header-brand-dock">
              <span className="ui-header-brand-text">{Array.from(siteConfig.brand, (letter, index) => (
                <span key={index} className="ui-header-brand-letter-mask"><span data-intro-brand-letter>{letter}</span></span>
              ))}</span>
            </span>
            <span className="ui-header-brand-reg" data-intro-brand-reg aria-hidden="true">&reg;</span>
          </span>
        </Link>

        <button
          type="button"
          data-hero-intro="menu-button"
          className="group pointer-events-auto ui-header-control ui-header-right ui-header-menu-button relative h-11 w-11 cursor-pointer border-0 bg-transparent p-0"
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMenuOpen}
          aria-controls="site-menu"
          onClick={toggleMenu}
        >
          <span data-header-intro-content className="ui-header-menu-icon absolute inset-0" aria-hidden="true">
            <span className={`menu-center-line ${isMenuOpen ? "scale-x-0 opacity-0" : ""}`} />
          </span>
        </button>
      </header>

      {isMenuOpen && <SiteMenu menuRef={menuRef} pathname={pathname} onNavigate={navigateFromMenu} />}
    </>);
}
