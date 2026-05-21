"use client";

import { useLayoutEffect, useRef } from "react";

export default function IdentityBand() {
  const titleRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const title = titleRef.current;
    const text = textRef.current;

    if (!title || !text) {
      return undefined;
    }

    let frame = null;
    let lastWidth = 0;

    function fitTitle(force = false) {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }

      frame = window.requestAnimationFrame(() => {
        const availableWidth = title.getBoundingClientRect().width;

        if (!force && Math.abs(availableWidth - lastWidth) < 0.5) {
          return;
        }

        title.style.fontSize = "";

        const currentSize = Number.parseFloat(
          window.getComputedStyle(title).fontSize,
        );
        const textWidth = text.getBoundingClientRect().width;

        if (availableWidth > 0 && textWidth > 0 && currentSize > 0) {
          title.style.fontSize = `${
            currentSize * (availableWidth / textWidth) * 0.995
          }px`;
          lastWidth = availableWidth;
        }
      });
    }

    const resizeObserver = new ResizeObserver(() => fitTitle());
    resizeObserver.observe(title);
    fitTitle(true);

    document.fonts?.ready.then(() => fitTitle(true));

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }

      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section
      data-header-theme="light"
      className="relative overflow-hidden border-y border-black/10 bg-white px-8 py-6 text-black md:px-10 md:py-8 lg:px-16 lg:py-12"
      style={{ containerType: "inline-size" }}
      aria-labelledby="identity-band-title"
    >
      <div className="relative z-10 grid gap-4 md:gap-5">
        <p className="m-0 flex flex-col text-[10px] leading-tight font-extrabold text-black/80 lowercase md:text-[11px]">
          <span>frontend detail.</span>
          <span>visual motion.</span>
        </p>

        <h2
          id="identity-band-title"
          ref={titleRef}
          className="gradient-text-flow m-0 block w-full overflow-visible whitespace-nowrap text-[clamp(28px,11cqw,220px)] leading-[0.84] font-black tracking-[-0.04em] uppercase"
        >
          <span ref={textRef} className="inline-block whitespace-nowrap">
            Furkancosar
          </span>
        </h2>
      </div>
    </section>
  );
}
