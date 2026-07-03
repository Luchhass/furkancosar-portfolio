"use client";

import Image from "next/image";
import { ExternalLink, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

const RECENT_DATE_LABEL = "Recent";

function formatProjectDate(date) {
  if (!date) return RECENT_DATE_LABEL;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return RECENT_DATE_LABEL;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getProjectNumber(project, projectNumber) {
  if (projectNumber) return projectNumber;

  const numericId = String(project?.id || "").match(/\d+/)?.[0];

  return numericId ? numericId.padStart(2, "0") : "01";
}

export default function ProjectDetailsModal({
  onClose,
  project,
  projectNumber,
}) {
  const titleId = useId();
  const closeButtonRef = useRef(null);
  const hasImage = Boolean(project?.screenshot);
  const technologies = project?.technologies?.slice(0, 5) || [];
  const displayNumber = getProjectNumber(project, projectNumber);

  useEffect(() => {
    if (!project) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, project]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-black/[0.84] px-4 py-4 text-white backdrop-blur-md md:px-7 md:py-7"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative grid h-[min(700px,calc(100dvh-1.25rem))] w-full max-w-5xl grid-rows-[minmax(112px,28%)_minmax(0,1fr)] overflow-hidden border border-white/12 bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,.58)] md:h-[min(620px,calc(100dvh-3.5rem))] md:grid-cols-[minmax(0,1.06fr)_minmax(300px,0.74fr)] md:grid-rows-1">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 grid size-10 place-items-center rounded-full bg-black/66 text-white transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/55"
          aria-label="Close project details"
        >
          <X className="size-5" strokeWidth={2.5} />
        </button>

        <div className="relative min-h-0 overflow-hidden bg-black">
          {hasImage ? (
            <Image
              className="object-cover object-center opacity-[0.84]"
              src={project.screenshot}
              alt={`${project.name} preview.`}
              fill
              sizes="(min-width:1024px) 620px, 100vw"
              priority={false}
            />
          ) : (
            <div
              className="gradient-bg-flow absolute inset-0 opacity-90"
              aria-hidden="true"
            />
          )}

          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08)_0%,rgba(0,0,0,.28)_48%,rgba(16,16,16,.86)_100%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,.1)_0%,rgba(0,0,0,.2)_48%,rgba(16,16,16,.9)_100%)]"
            aria-hidden="true"
          />

          <span className="gradient-text-flow absolute bottom-4 left-4 z-10 text-[72px] leading-[0.82] font-black md:bottom-6 md:left-6 md:text-[104px]">
            {displayNumber}
          </span>
        </div>

        <div className="flex min-h-0 flex-col p-4 pt-12 md:p-7 md:pt-16 lg:p-8 lg:pt-18">
          <h2
            id={titleId}
            className="m-0 max-w-full text-[32px] leading-[0.84] font-black tracking-[-0.04em] text-balance uppercase sm:text-[38px] md:text-[48px] lg:text-[56px]"
          >
            {project.name}
          </h2>

          <p
            className="mt-4 mb-0 max-w-[42ch] text-sm leading-relaxed font-medium text-white/58 md:mt-5 md:text-base"
            style={{
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 4,
            }}
          >
            {project.description}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-4 md:mt-5 md:gap-y-4 md:pt-5">
            {[
              ["Type", project.type],
              ["Released", formatProjectDate(project.date)],
              ["Category", project.category],
              ["Status", project.status],
            ].map(([label, value]) =>
              value ? (
                <div key={label} className="min-w-0">
                  <dt className="text-[9px] leading-none font-black tracking-[0.16em] text-white/30 uppercase">
                    {label}
                  </dt>
                  <dd className="m-0 mt-2 truncate text-xs leading-tight font-black text-white/76 uppercase">
                    {value}
                  </dd>
                </div>
              ) : null,
            )}
          </dl>

          {technologies.length ? (
            <div className="mt-4 min-h-0 md:mt-5">
              <p className="m-0 text-[9px] leading-none font-black tracking-[0.16em] text-white/30 uppercase">
                Stack
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3">
                {technologies.map((technology) => (
                  <span
                    key={technology}
                    className="border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[9px] leading-none font-black tracking-[0.08em] text-white/54 uppercase"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-auto flex items-center gap-3 pt-4 md:pt-5">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="gradient-action-button group relative isolate inline-flex h-10 min-w-[8.5rem] items-center justify-center gap-2 overflow-hidden bg-transparent px-5 text-[11px] leading-none font-black whitespace-nowrap text-white no-underline md:h-11 md:min-w-[9rem]"
              >
                <span
                  className="gradient-action-fill pointer-events-none z-0"
                  aria-hidden="true"
                />
                <span
                  className="gradient-action-border pointer-events-none z-20"
                  aria-hidden="true"
                />
                <span className="relative z-10">Live Site</span>
                <ExternalLink
                  className="relative z-10 size-4"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </a>
            ) : (
              <span className="inline-flex h-11 w-fit items-center justify-center border border-white/10 px-5 text-[11px] leading-none font-black text-white/35 uppercase">
                Live site unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
