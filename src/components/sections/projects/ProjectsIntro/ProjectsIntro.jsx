import RevealTextLine from "@/components/layout/ScrollReveal/RevealTextLine";
import OutlineCirclesBackground from "@/components/ui/Backgrounds/OutlineCirclesBackground";
import RevealCounter from "@/components/ui/RevealCounter/RevealCounter";
import { projectCount } from "@/data/projects";

export default function ProjectsIntro() {
  const countLabel = String(projectCount);

  return (
    <section
      data-header-theme="light"
      data-scroll-reveal="sequence"
      className="relative isolate min-h-dvh overflow-hidden bg-white px-8 py-20 text-black md:px-10 md:py-24 lg:px-16 lg:py-32"
      aria-labelledby="projects-intro-title"
    >
      <OutlineCirclesBackground />

      <div className="relative z-10 grid w-full max-w-205 grid-cols-1 gap-y-5 md:grid-cols-[120px_minmax(0,1fr)] md:gap-x-5 md:gap-y-0 lg:grid-cols-[160px_minmax(0,1fr)]">
        <p
          data-reveal-part="kicker"
          className="m-0 inline-flex items-center gap-2 self-start text-[13px] leading-none font-black tracking-[0.08em] text-black/55 uppercase md:pt-3 md:text-sm"
        >
          <span data-reveal-inner className="inline-flex items-center gap-2">
            <span
              className="gradient-action-dot h-2 w-2 rounded-full"
              aria-hidden="true"
            />
            Archive
          </span>
        </p>

        <div className="grid min-w-0 gap-5 md:col-start-2 md:gap-7">
          <h2
            id="projects-intro-title"
            data-reveal-part="title"
            className="m-0 flex flex-col text-[44px] leading-[0.9] font-black tracking-[-0.04em] uppercase md:text-[80px] lg:text-[120px]"
          >
            <span>Projects</span>
            <span className="gradient-text-flow">Showcase</span>
          </h2>

          <p className="m-0 max-w-2xl text-[13px] leading-tight font-medium text-black/65 md:text-sm">
            <RevealTextLine>
              This archive brings together interfaces built with clean
              structure,
            </RevealTextLine>
            <RevealTextLine>
              responsive layouts, strong visual rhythm and polished interaction
              details.
            </RevealTextLine>
            <RevealTextLine>
              Each project is shaped to turn a simple idea into a clear digital
            </RevealTextLine>
            <RevealTextLine>
              experience that feels modern, usable and carefully finished.
            </RevealTextLine>
          </p>

          <div
            data-reveal-part="content"
            className="flex w-fit items-center gap-3 border-t border-black/10 pt-4"
            aria-label={`${countLabel} selected projects`}
          >
            <span className="text-[28px] leading-[0.82] font-black md:text-[30px] lg:text-[32px]">
              <RevealCounter
                value={countLabel}
                textClassName="gradient-text-flow"
              />
            </span>

            <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/45 uppercase">
              selected projects
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}