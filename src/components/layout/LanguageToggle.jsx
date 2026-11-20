"use client";
import { useRef } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { rememberLanguage, useLanguage } from "@/hooks/useLanguage";
import { usePathname } from "next/navigation";
import { localizedPath } from "@/lib/localizedRoutes";

export default function LanguageToggle() {
  const { locale, nextLocale, t } = useLanguage();
  const pathname = usePathname();
  const nextPath = localizedPath(pathname, nextLocale);
  const switching = useRef(false);
  async function change(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (switching.current || window.__pageIntroActivePath || document.body.dataset.languageSwitching === "true") return;
    switching.current = true;
    document.body.dataset.languageSwitching = "true";
    const entryPath = window.location.pathname;
    const scopes = [...document.querySelectorAll("main, footer")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      if (!reduced) await gsap.to(scopes, { autoAlpha: 0, duration: .18, ease: "power2.in" });
      // A route transition can start while the fade is playing. Never apply
      // the old button's pathname over that navigation.
      if (window.location.pathname !== entryPath || window.__pageIntroActivePath) return;
      flushSync(() => {
        window.__pageIntroDoneForPath = nextPath;
        window.__pageIntroActivePath = null;
        window.history.pushState(null, "", `${nextPath}${window.location.search}${window.location.hash}`);
        rememberLanguage(nextLocale);
      });
      window.dispatchEvent(new CustomEvent("page-intro:complete", { detail: { pathname: nextPath } }));
      window.dispatchEvent(new Event("language:reveal"));
      if (!reduced) await gsap.to(scopes, { autoAlpha: 1, duration: .28, ease: "power2.out", clearProps: "opacity,visibility" });
    } finally {
      gsap.set(scopes.filter(node => node.isConnected), { clearProps: "opacity,visibility" });
      switching.current = false;
      delete document.body.dataset.languageSwitching;
    }
  }
  return (
    <a href={nextPath} hrefLang={nextLocale} onClick={change} data-language-link data-active-language={locale}
      className="pointer-events-auto inline-flex h-11 min-w-11 items-start justify-start text-[32px] leading-none font-bold tracking-normal text-current no-underline transition-colors duration-200 hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      aria-label={t("toggles.languageTo", { language: nextLocale === "tr" ? "Türkçe" : "English" })}>
      <span aria-hidden="true" data-language-label className="ui-header-language-label">{nextLocale.toUpperCase()}</span>
    </a>
  );
}
