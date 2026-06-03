"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function GoogleAnalyticsPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const event = [
      "event",
      "page_view",
      {
        page_path: `${window.location.pathname}${window.location.search}`,
        page_location: window.location.href,
        page_title: document.title,
      },
    ];

    if (typeof window.gtag === "function") {
      window.gtag(...event);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }, [pathname]);

  return null;
}
