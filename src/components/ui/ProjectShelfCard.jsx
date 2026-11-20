"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function ProjectShelfCard({ project, number, onOpen }) {
  const localize = useLocalizedContent();
  function openDetails(event) {
    onOpen({ project, number, origin: event.currentTarget.getBoundingClientRect().toJSON() });
  }

  return localize(
    <div data-project-card-reveal className="shelf-card-slot shelf-card-mask">
      <div data-project-card-reveal-inner className="shelf-card-inner">
        <article className="shelf-card project-card-motion">
          <button type="button" className="shelf-card-open" aria-haspopup="dialog"
            aria-label={`Open details for ${project.name}`} onClick={openDetails} />
          <div className="shelf-card-surface">
            <span className="gradient-action-border shelf-card-border" aria-hidden="true" />
            <div className="shelf-card-image">
              {project.screenshot
                ? <Image src={project.screenshot} alt="" fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 85vw" draggable={false} />
                : <div className="gradient-bg-flow absolute inset-0 opacity-40" />}
              <span className="shelf-card-number project-card-number project-card-lift gradient-text-flow">{number}</span>
            </div>
            <div className="shelf-card-copy">
              <h3 className="project-card-lift">{project.name}</h3>
              <p className="shelf-card-description project-card-lift">{project.description || project.tagline}</p>
              <span className="shelf-card-action project-card-lift pointer-events-none" aria-hidden="true">
                View project <ArrowUpRight size={14} aria-hidden="true" />
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
