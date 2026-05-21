"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

export const REVEAL_COUNTER_EVENT = "reveal-counter:play";

function parseCounterValue(value) {
  const rawValue = String(value || "").trim();
  const match = rawValue.match(/^([^0-9]*)([0-9][0-9,.\s]*)(.*)$/);

  if (!match) {
    return {
      rawValue,
      prefix: "",
      suffix: "",
      target: 0,
      hasNumber: false,
      minDigits: 0,
      useGrouping: false,
    };
  }

  const [, prefix, numberPart, suffix] = match;
  const normalizedNumber = numberPart.replace(/[\s,]/g, "");
  const target = Number.parseFloat(normalizedNumber);

  return {
    rawValue,
    prefix,
    suffix,
    target: Number.isFinite(target) ? target : 0,
    hasNumber: Number.isFinite(target),
    minDigits: Math.max(2, normalizedNumber.split(".")[0]?.length || 2),
    useGrouping: numberPart.includes(","),
  };
}

function formatCounterValue(
  { prefix, suffix, target, minDigits, useGrouping },
  value,
) {
  const nextValue = Math.round(Math.min(Math.max(value, 0), target));
  const formattedValue = useGrouping
    ? nextValue.toLocaleString("en-US")
    : String(nextValue).padStart(minDigits, "0");

  return `${prefix}${formattedValue}${suffix}`;
}

function getDefaultDuration(target) {
  if (target > 500) return 12;
  if (target > 120) return 8.5;

  return 5.8;
}

function smoothStep(progress) {
  return progress * progress * (3 - 2 * progress);
}

function settleStep(progress) {
  const easedProgress = smoothStep(progress);
  const overshoot = Math.sin(progress * Math.PI) * 0.075;

  return easedProgress + overshoot;
}

function getColumnStep(progress, { place }, target) {
  if (place === 1) {
    const baseStep = Math.floor(progress);

    if (baseStep >= target) return target;

    return baseStep + settleStep(progress - baseStep);
  }

  const baseStep = Math.floor(progress / place);
  const nextStepValue = (baseStep + 1) * place;

  if (nextStepValue > target) {
    return baseStep;
  }

  const phase = (progress - baseStep * place) / place;
  const carryStart = 0.9;

  if (phase < carryStart) {
    return baseStep;
  }

  return baseStep + settleStep((phase - carryStart) / (1 - carryStart));
}

export function playRevealCounters(scope) {
  scope
    ?.querySelectorAll?.("[data-reveal-counter]")
    .forEach((counter) => {
      counter.dispatchEvent(new CustomEvent(REVEAL_COUNTER_EVENT));
    });
}

export default function RevealCounter({
  value,
  className = "",
  textClassName = "",
  delay = 0,
  duration,
}) {
  const rootRef = useRef(null);
  const tracksRef = useRef([]);
  const tweenRef = useRef(null);
  const parsedValue = useMemo(() => parseCounterValue(value), [value]);
  const hasGradientText = textClassName.includes("gradient-text-flow");
  const digitColumns = useMemo(() => {
    if (!parsedValue.hasNumber) return [];

    const target = Math.round(parsedValue.target);
    const digitCount = Math.max(
      parsedValue.minDigits,
      String(target).length,
    );

    return Array.from({ length: digitCount }, (_column, columnIndex) => ({
      id: columnIndex,
      place: 10 ** (digitCount - columnIndex - 1),
      steps: Math.floor(target / 10 ** (digitCount - columnIndex - 1)),
    }));
  }, [parsedValue]);

  useEffect(() => {
    const root = rootRef.current;
    const tracks = tracksRef.current
      .slice(0, digitColumns.length)
      .filter(Boolean);

    if (!root || !tracks.length) return undefined;

    if (!parsedValue.hasNumber) {
      gsap.set(tracks, { y: 0 });
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const target = Math.round(parsedValue.target);

    function getLineHeight(track) {
      const firstFrame = track?.firstElementChild;

      return firstFrame?.getBoundingClientRect().height || root.clientHeight;
    }

    function setZero() {
      gsap.killTweensOf(tracks);
      gsap.set(tracks, { y: 0 });
    }

    function setFinal() {
      tracks.forEach((track, trackIndex) => {
        const column = digitColumns[trackIndex];

        gsap.set(track, { y: -(column?.steps || 0) * getLineHeight(track) });
      });
    }

    function play() {
      tweenRef.current?.kill();
      gsap.killTweensOf(tracks);

      if (prefersReducedMotion.matches) {
        setFinal();
        return;
      }

      setZero();

      const totalDuration = duration ?? getDefaultDuration(target);
      const lineHeights = tracks.map(getLineHeight);
      const setters = tracks.map((track) => gsap.quickSetter(track, "y", "px"));
      const state = { value: 0 };

      function renderValue() {
        const progress = Math.min(state.value, target);

        tracks.forEach((_track, trackIndex) => {
          const column = digitColumns[trackIndex];
          const lineHeight = lineHeights[trackIndex];
          const columnStep = getColumnStep(progress, column, target);

          setters[trackIndex](-columnStep * lineHeight);
        });
      }

      tweenRef.current = gsap.to(state, {
        delay,
        value: target,
        duration: totalDuration,
        ease: "power1.inOut",
        overwrite: true,
        onUpdate: renderValue,
        onComplete: setFinal,
      });
    }

    setZero();
    root.addEventListener(REVEAL_COUNTER_EVENT, play);

    return () => {
      root.removeEventListener(REVEAL_COUNTER_EVENT, play);
      tweenRef.current?.kill();
      gsap.killTweensOf(tracks);
    };
  }, [parsedValue, digitColumns, delay, duration]);

  const initialValue = parsedValue.hasNumber
    ? formatCounterValue(parsedValue, 0)
    : parsedValue.rawValue;
  const getDigitTextStyle = (columnIndex) =>
    hasGradientText
      ? {
          "--gradient-flow-offset": `-${columnIndex}ch`,
          "--gradient-flow-size": `calc(${digitColumns.length}ch * 2.6) 100%`,
        }
      : undefined;

  return (
    <span
      ref={rootRef}
      data-reveal-counter
      className={`relative inline-block overflow-hidden align-baseline [font-variant-numeric:tabular-nums] ${className}`}
      aria-label={parsedValue.rawValue}
    >
      {parsedValue.hasNumber ? (
        <span className="inline-flex align-baseline" aria-hidden>
          {parsedValue.prefix ? (
            <span className={`inline-block ${textClassName}`}>
              {parsedValue.prefix}
            </span>
          ) : null}

          {digitColumns.map((column, columnIndex) => (
            <span
              key={column.id}
              className="relative inline-block overflow-hidden align-top"
            >
              <span
                className={`invisible block ${textClassName}`}
                style={getDigitTextStyle(columnIndex)}
              >
                0
              </span>

              <span
                ref={(element) => {
                  tracksRef.current[columnIndex] = element;
                }}
                className="absolute top-0 left-0 block will-change-transform"
              >
                {Array.from({ length: column.steps + 1 }, (_item, step) => (
                  <span
                    key={`${column.id}-${step}`}
                    className={`block ${textClassName}`}
                    style={getDigitTextStyle(columnIndex)}
                  >
                    {step % 10}
                  </span>
                ))}
              </span>
            </span>
          ))}

          {parsedValue.suffix ? (
            <span className={`inline-block ${textClassName}`}>
              {parsedValue.suffix}
            </span>
          ) : null}
        </span>
      ) : (
        <span className={`inline-block whitespace-nowrap ${textClassName}`}>
          {initialValue}
        </span>
      )}
    </span>
  );
}
