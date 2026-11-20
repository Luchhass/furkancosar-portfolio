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
    <a href={nextPath} hrefLang={nextLocale} onClick={change} data-language-link data-menu-nav-item data-active-language={locale}
      className="relative grid h-11 grid-cols-[2.75rem_.75rem_2.75rem] items-center justify-items-center text-sm leading-none font-black tracking-wide text-current no-underline focus-visible:outline-2 focus-visible:-outline-offset-2"
      aria-label={t("toggles.languageTo", { language: nextLocale === "tr" ? "Türkçe" : "English" })}>
      <span aria-hidden="true" data-language-indicator
        className={`pointer-events-none absolute inset-y-0 left-0 w-11 rounded-full border border-[var(--color-primary)] transition-transform duration-350 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${locale === "tr" ? "translate-x-[3.5rem]" : "translate-x-0"}`} />
      <span aria-hidden="true">EN</span>
      <span aria-hidden="true" className="text-current/50">/</span>
      <span aria-hidden="true">TR</span>
    </a>
  );
}
