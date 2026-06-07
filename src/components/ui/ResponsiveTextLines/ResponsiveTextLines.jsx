"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

function tokenizeText(text) {
  return String(text || "").match(/\S+\s*/g) || [];
}

function areLinesEqual(previousLines, nextLines) {
  if (!previousLines || previousLines.length !== nextLines.length) {
    return false;
  }

  return previousLines.every((line, index) => line === nextLines[index]);
}

export default function ResponsiveTextLines({
  text,
  lineAttribute,
  onLinesChange,
}) {
  const measureRef = useRef(null);
  const latestSignatureRef = useRef("");
  const [lines, setLines] = useState(null);

  const tokens = useMemo(() => tokenizeText(text), [text]);
  const lineProps = { [lineAttribute]: "" };

  useLayoutEffect(() => {
    const measureElement = measureRef.current;
    const container = measureElement?.parentElement;

    if (!measureElement || !container || !tokens.length) {
      setLines(null);
      return undefined;
    }

    let frame = null;

    function measureLines() {
      frame = null;

      const tokenElements = Array.from(
        measureElement.querySelectorAll("[data-responsive-text-token]"),
      );

      const nextLines = [];

      tokenElements.forEach((tokenElement) => {
        const rect = tokenElement.getBoundingClientRect();
        const textContent = tokenElement.textContent || "";

        if (!rect.width && !textContent.trim()) return;

        const lastLine = nextLines[nextLines.length - 1];

        if (!lastLine || Math.abs(lastLine.top - rect.top) > 1) {
          nextLines.push({
            text: textContent,
            top: rect.top,
          });
          return;
        }

        lastLine.text += textContent;
      });

      const measuredLines = nextLines
        .map((line) => line.text.trimEnd())
        .filter(Boolean);

      const signature = measuredLines.join("\u001f");

      setLines((currentLines) =>
        areLinesEqual(currentLines, measuredLines) ? currentLines : measuredLines,
      );

      if (latestSignatureRef.current !== signature) {
        latestSignatureRef.current = signature;
        onLinesChange?.();
      }
    }

    function scheduleMeasure() {
      if (frame !== null) return;

      frame = window.requestAnimationFrame(measureLines);
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure);

    resizeObserver.observe(container);
    scheduleMeasure();

    return () => {
      resizeObserver.disconnect();

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [onLinesChange, tokens]);

  return (
    <>
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 block whitespace-normal text-inherit"
        style={{ visibility: "hidden" }}
      >
        {tokens.map((token, index) => (
          <span key={`${token}-${index}`} data-responsive-text-token>
            {token}
          </span>
        ))}
      </span>

      {lines?.length ? (
        <span className="block">
          {lines.map((line, index) => (
            <span
              key={`${line}-${index}`}
              className="block overflow-hidden"
            >
              <span {...lineProps} className="block">
                {line}
              </span>
            </span>
          ))}
        </span>
      ) : (
        <span className="block">{text}</span>
      )}
    </>
  );
}
