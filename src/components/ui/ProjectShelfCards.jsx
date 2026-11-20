import ProjectShelfCard from "./ProjectShelfCard";

export default function ProjectShelfCards({ projects, total = projects.length, onOpen }) {
  return projects.map((project, index) => (
    <ProjectShelfCard key={project.id} project={project} onOpen={onOpen}
      number={String(total - index).padStart(2, "0")} />
  ));
}
