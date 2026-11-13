"use client";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import ReadingText from "@/components/ui/ReadingText";

export default function ProjectShelfCard({ project, number, onOpen }) {
  return <div className="shelf-card-slot"><div data-project-card-reveal className="shelf-card-mask"><div data-project-card-reveal-inner className="shelf-card-inner">
    <article className="shelf-card project-card-motion">
      <button type="button" className="shelf-card-open" aria-haspopup="dialog" aria-label={`Open details for ${project.name}`}
        onClick={event => onOpen({ project, number, origin: event.currentTarget.getBoundingClientRect().toJSON() })} />
      <div className="shelf-card-surface">
        <span className="gradient-action-border shelf-card-border" aria-hidden="true" />
        <div className="shelf-card-image">
          {project.screenshot ? <Image src={project.screenshot} alt={`${project.name} preview`} fill sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 85vw" draggable={false} /> : <div className="gradient-bg-flow absolute inset-0 opacity-40" />}
          <span className="shelf-card-number project-card-number project-card-lift gradient-text-flow"><span className="shelf-card-reveal">{number}</span></span>
        </div>
        <div className="shelf-card-copy">
          <h3 className="project-card-lift"><span className="shelf-card-reveal">{project.name}</span></h3>
          <p className="shelf-card-description project-card-lift"><ReadingText as="span" className="shelf-card-reveal">{project.description || project.tagline}</ReadingText></p>
          {project.liveUrl && <a className="shelf-card-action project-card-lift" href={project.liveUrl} target="_blank" rel="noopener noreferrer" draggable={false} aria-label={`Visit ${project.name} live site`}>
            <span className="shelf-card-reveal inline-flex items-center gap-2">View project <ArrowUpRight size={14} aria-hidden="true" /></span>
          </a>}
        </div>
      </div>
    </article>
  </div></div></div>;
}
