"use client";
import { useRef } from "react";
import useSectionScene from "@/lib/useSectionScene";

export default function GitHubStatsFrame({ children, ...props }) {
  const ref = useRef(null);
  useSectionScene(ref, "stats");
  return <section ref={ref} {...props} className={`${props.className} stats-scene`}>
    {children}
  </section>;
}
