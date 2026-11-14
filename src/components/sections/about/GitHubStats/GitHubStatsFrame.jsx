"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef } from "react";
import useSectionScene from "@/lib/useSectionScene";

export default function GitHubStatsFrame({ children, ...props }) {
  const localize = useLocalizedContent();
  const ref = useRef(null);
  useSectionScene(ref, "stats");
  return localize(<section ref={ref} {...props} className={`${props.className} stats-scene`}>
    {children}
  </section>);
}
