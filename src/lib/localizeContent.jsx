"use client";
import { cloneElement, isValidElement, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { translate } from "./i18n";
import { localizedPath } from "./localizedRoutes";

// Translate React content before rendering: never mutate GSAP's split DOM.
const textProps = new Set(["aria-label", "title", "placeholder", "alt", "label", "text", "ariaLabel"]);
const contentProps = new Set(["titleLines", "copyLines", "words", "stat", "action"]);
function values(value, locale) {
  if (typeof value === "string") return translate(locale, value);
  if (Array.isArray(value)) return value.map(item => values(item, locale));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, textProps.has(key) || contentProps.has(key) ? values(item, locale) : item]));
  return value;
}
export function localizeContent(node, locale, path = "root") {
  if (typeof node === "string") return translate(locale, node);
  if (Array.isArray(node)) return node.map((child, index) => localizeContent(child, locale, `${path}.${index}`));
  if (!isValidElement(node)) return node;
  const props = { key: node.key ?? path };
  for (const [key, value] of Object.entries(node.props)) {
    if (key === "children") props.children = localizeContent(value, locale, `${path}.children`);
    else if (key === "href" && typeof value === "string" && value.startsWith("/")) props.href = localizedPath(value, locale);
    else if (textProps.has(key) || contentProps.has(key)) props[key] = values(value, locale);
  }
  // DOM-owning animation components manage their own locale boundaries.
  // Function names are minified in production and cannot identify components.
  return cloneElement(node, props);
}
export function useLocalizedContent() {
  const { locale } = useLanguage();
  return useCallback(node => localizeContent(node, locale), [locale]);
}
