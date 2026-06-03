"use client";

import { useLayoutEffect, useState } from "react";

export default function PageIntroPrepaintMask() {
  const [isVisible, setIsVisible] = useState(true);

  useLayoutEffect(() => {
    function hideMask() {
      setIsVisible(false);
    }

    window.addEventListener("page-intro:start", hideMask, { once: true });
    window.addEventListener("page-intro:complete", hideMask, { once: true });

    const fallbackTimer = window.setTimeout(hideMask, 9000);

    return () => {
      window.removeEventListener("page-intro:start", hideMask);
      window.removeEventListener("page-intro:complete", hideMask);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="gradient-bg-flow"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        pointerEvents: "auto",
        backgroundColor: "#fff",
      }}
    />
  );
}
