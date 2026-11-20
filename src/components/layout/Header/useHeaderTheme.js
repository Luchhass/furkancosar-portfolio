import { useEffect, useState } from "react";

export default function useHeaderTheme(pathname) {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const header = document.querySelector(".ui-header");
    let frame = null;

    const updateHeaderTheme = () => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        const sampleX = window.innerWidth / 2;
        const sampleY = Math.min((header?.offsetHeight ?? 0) + 4, window.innerHeight - 1);

        const section = document
          .elementsFromPoint(sampleX, sampleY)
          .map((element) => element.closest("[data-header-theme]"))
          .find(Boolean);

        const nextTheme = section?.getAttribute("data-header-theme") || "dark";

        setTheme(nextTheme);

        frame = null;
      });
    };

    updateHeaderTheme();

    window.addEventListener("scroll", updateHeaderTheme, { passive: true });
    window.addEventListener("resize", updateHeaderTheme);

    return () => {
      window.removeEventListener("scroll", updateHeaderTheme);
      window.removeEventListener("resize", updateHeaderTheme);

      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return theme;
}
