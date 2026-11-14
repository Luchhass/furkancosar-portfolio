"use client";
import { useRef } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { useLanguage } from "@/hooks/useLanguage";
import { usePathname } from "next/navigation";
import { localizedPath } from "@/lib/localizedRoutes";

export default function LanguageToggle() {
  const { locale, nextLocale, toggleLanguage, t } = useLanguage();
  const pathname = usePathname();
  const switching = useRef(false);
  async function change() {
    if (switching.current) return;
    switching.current = true;
    const scopes = [...document.querySelectorAll("main, footer")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      if (!reduced) await gsap.to(scopes, { autoAlpha: 0, duration: .18, ease: "power2.in" });
      flushSync(() => {
        const nextPath = localizedPath(pathname, nextLocale);
        window.__pageIntroDoneForPath = nextPath;
        window.__pageIntroActivePath = null;
        window.history.pushState(null, "", `${nextPath}${window.location.search}${window.location.hash}`);
        toggleLanguage();
      });
      window.dispatchEvent(new CustomEvent("page-intro:complete", { detail: { pathname: localizedPath(pathname, nextLocale) } }));
      window.dispatchEvent(new Event("language:reveal"));
      if (!reduced) await gsap.to(scopes, { autoAlpha: 1, duration: .28, ease: "power2.out", clearProps: "opacity,visibility" });
    } finally {
      gsap.set(scopes.filter(node => node.isConnected), { clearProps: "opacity,visibility" });
      switching.current = false;
    }
  }
  return <button type="button" className="ui-language-toggle" onClick={change}
    aria-label={t("toggles.languageTo", { language: nextLocale.toUpperCase() })} title={t("toggles.languageTo", { language: nextLocale.toUpperCase() })}>
    <span aria-hidden="true">{locale.toUpperCase()}</span>
  </button>;
}
