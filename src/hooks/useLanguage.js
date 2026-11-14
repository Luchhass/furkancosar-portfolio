"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, normalizeLocale, translate } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import { routeLocale, localizedPath } from "@/lib/localizedRoutes";

export const LANGUAGE_STORAGE_KEY = "furkancosar-language";
export const LANGUAGE_CHANGE_EVENT = "furkancosar-language-change";
let memoryLocale = DEFAULT_LOCALE;
function applyLanguage(value) {
  memoryLocale = normalizeLocale(value);
  document.documentElement.lang = memoryLocale;
  document.documentElement.dataset.locale = memoryLocale;
}
function snapshot() { return typeof document === "undefined" ? DEFAULT_LOCALE : normalizeLocale(document.documentElement.dataset.locale); }
function subscribe(callback) {
  const storage = event => {
    if (event.key !== LANGUAGE_STORAGE_KEY && event.key !== null) return;
    const nextPath = localizedPath(window.location.pathname, normalizeLocale(event.newValue));
    if (nextPath !== window.location.pathname) {
      window.__pageIntroDoneForPath = nextPath;
      window.__pageIntroActivePath = null;
      window.history.replaceState(null, "", `${nextPath}${window.location.search}${window.location.hash}`);
    }
    applyLanguage(event.newValue); callback();
  };
  const change = () => callback();
  window.addEventListener("storage", storage);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, change);
  try { applyLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) || memoryLocale); }
  catch { applyLanguage(memoryLocale); }
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, change);
  };
}
export function useLanguage() {
  const pathname = usePathname();
  const pathLocale = routeLocale(pathname || "/");
  useSyncExternalStore(subscribe, snapshot, () => pathLocale);
  const locale = pathLocale;
  const setLanguage = useCallback(value => {
    const clean = normalizeLocale(value);
    if (snapshot() === clean) return;
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, clean); } catch { /* Switching still works in memory. */ }
    applyLanguage(clean);
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);
  const toggleLanguage = useCallback(() => setLanguage(locale === "en" ? "tr" : "en"), [locale, setLanguage]);
  const t = useCallback((key, values) => translate(locale, key, values), [locale]);
  return useMemo(() => ({ locale, nextLocale: locale === "en" ? "tr" : "en", setLanguage, toggleLanguage, t }), [locale, setLanguage, toggleLanguage, t]);
}
export const useTranslation = useLanguage;
