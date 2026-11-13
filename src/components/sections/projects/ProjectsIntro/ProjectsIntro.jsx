import RevealTextLine from "@/components/layout/ScrollReveal/RevealTextLine";
import RevealCounter from "@/components/ui/RevealCounter/RevealCounter";
import { projectCount } from "@/data/projects";
export default function ProjectsIntro() {
  const countLabel = String(projectCount);

  return (
    <section
      data-header-theme="light"
      data-scroll-reveal="sequence"
      className="ui-screen overflow-hidden bg-white ui-section text-black"
      aria-labelledby="projects-intro-title"
    >
      <div className="ui-section-grid">
        <p
          data-reveal-part="kicker"
          className="ui-section-label text-black/55"
        >
          <span data-reveal-inner>
            Archive
          </span>
        </p>

        <div className="ui-section-body ui-section-stack">
          <h2 id="projects-intro-title" data-reveal-part="title" className="ui-section-title flex flex-col">
            <span>Projects</span>
            <span className="gradient-text-flow">Showcase</span>
          </h2>

          <p className="ui-section-copy text-black/65">
            <RevealTextLine>This archive brings together interfaces built with clean structure,</RevealTextLine>
            <RevealTextLine>responsive layouts, strong visual rhythm and polished interaction details.</RevealTextLine>
            <RevealTextLine>Each project is shaped to turn a simple idea into a clear digital</RevealTextLine>
            <RevealTextLine>experience that feels modern, usable and carefully finished.</RevealTextLine>
          </p>

          <div data-reveal-part="content" className="flex w-fit items-center gap-3 border-t border-black/10 pt-4" aria-label={`${countLabel} selected projects`}>
            <span className="text-[28px] leading-[0.82] font-black md:text-[30px] lg:text-[32px]">
              <RevealCounter value={countLabel} textClassName="gradient-text-flow" />
            </span>
            <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/45 uppercase">selected projects</span>
          </div>
        </div>
      </div>
    </section>
  );
}
