"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
export default function MiniTitleText({ children }) {
  const localize = useLocalizedContent();
  return localize(<span className="mini-title-mask"><span data-mini-title-inner>{children}</span></span>);
}
