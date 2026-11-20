"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, normalizeLocale, translate } from "@/lib/i18n";
import { localizedPath, routeLocale } from "@/lib/localizedRoutes";

const STORAGE_KEY = "furkancosar-language";
const languageValues = Object.fromEntries(LOCALES.map(locale => [
  locale,
  {
    locale,
    nextLocale: locale === "en" ? "tr" : "en",
    t: (key, values) => translate(locale, key, values),
  },
]));

function applyLanguage(locale) {
  document.documentElement.lang = locale;
  document.documentElement.dataset.locale = locale;
}

function syncFromStorage(event) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  const locale = normalizeLocale(event.newValue);
  const { pathname, search, hash } = window.location;
  const nextPath = localizedPath(pathname, locale);
  if (nextPath !== pathname) {
    window.__pageIntroDoneForPath = nextPath;
    window.__pageIntroActivePath = null;
    window.history.replaceState(null, "", nextPath + search + hash);
  }
  applyLanguage(locale);
}

export function LanguageEffects() {
  const { locale } = useLanguage();

  useEffect(() => {
    rememberLanguage(locale);
  }, [locale]);

  useEffect(() => {
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  return null;
}

export function rememberLanguage(locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // The pathname still determines the current language.
  }
  applyLanguage(locale);
}

export function useLanguage() {
  const pathname = usePathname();
  return languageValues[pathname ? routeLocale(pathname) : DEFAULT_LOCALE];
}
