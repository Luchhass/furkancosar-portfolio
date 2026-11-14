"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { createMotionMedia } from "@/lib/motionMedia";
import { heroTitleExit, heroDetailExit } from "@/lib/heroScrollExit";
import TitleLine from "@/components/ui/TitleLine";
import ReadingText from "@/components/ui/ReadingText";
import styles from "./Toolkit.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const techGroups = [
  {
    id: "core",
    title: "Core Frontend",
    description:
      "The base I use for structure, styling, behavior, typing and scalable CSS details.",
    items: [
      { name: "HTML5", logo: "/tech-logos/html5.svg" },
      { name: "CSS3", logo: "/tech-logos/css3.svg" },
      { name: "JavaScript", logo: "/tech-logos/javascript.svg" },
      { name: "TypeScript", logo: "/tech-logos/typescript.svg" },
      { name: "Sass", logo: "/tech-logos/sass.svg" },
    ],
  },
  {
    id: "interface",
    title: "Interface Stack",
    description:
      "The stack I use to build responsive interfaces, reusable components and polished layouts.",
    items: [
      { name: "React", logo: "/tech-logos/react.svg" },
      { name: "Next.js", logo: "/tech-logos/nextjs.svg" },
      { name: "Tailwind CSS", logo: "/tech-logos/tailwindcss.svg" },
      { name: "Bootstrap", logo: "/tech-logos/bootstrap.svg" },
      { name: "Lucide", logo: "/tech-logos/lucide.svg" },
    ],
  },
  {
    id: "workflow",
    title: "Development Workflow",
    description:
      "The tools that help me version, format, ship and keep the development process organized.",
    items: [
      { name: "Git", logo: "/tech-logos/git.svg" },
      { name: "GitHub", logo: "/tech-logos/github.svg" },
      { name: "Vercel", logo: "/tech-logos/vercel.svg" },
      { name: "Vite", logo: "/tech-logos/vite.svg" },
      { name: "ESLint", logo: "/tech-logos/eslint.svg" },
      { name: "Prettier", logo: "/tech-logos/prettier.svg" },
      { name: "npm", logo: "/tech-logos/npm.svg" },
      { name: "Yarn", logo: "/tech-logos/yarn.svg" },
      { name: "VS Code", logo: "/tech-logos/vscode.svg" },
      { name: "Postman", logo: "/tech-logos/postman.svg" },
    ],
  },
  {
    id: "product",
    title: "Product Collaboration",
    description:
      "The apps I use while planning screens, discussing details and tracking real product work.",
    items: [
      { name: "Figma", logo: "/tech-logos/figma.svg" },
      { name: "Discord", logo: "/tech-logos/discord.svg" },
      { name: "Jira", logo: "/tech-logos/jira.svg" },
    ],
  },
];


const labels = ["Foundation", "Interface", "Workflow", "Collaboration"];
const phase = (progress, start, end) => gsap.utils.clamp(0, 1, (progress - start) / (end - start));

export default function TechStackAccordion() {
  const localize = useLocalizedContent();
  const root = useRef(null);

  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const section = root.current;
      const frame = section.querySelector("[data-toolkit-frame]");
      const names = Array.from(section.querySelectorAll("[data-toolkit-label]"));
      const tracks = Array.from(section.querySelectorAll("[data-toolkit-track]"));

      const introExit = gsap.timeline({ paused: true })
        .to(section.querySelectorAll("#toolkit-heading > .title-reveal-mask"), heroTitleExit(), 0)
        .to(section.querySelector("[data-toolkit-copy]"), heroDetailExit(), 0);
      gsap.set(names, { scale: 0 });
      const nameSetters = names.map(node => {
        const setX = gsap.quickSetter(node, "scaleX");
        const setY = gsap.quickSetter(node, "scaleY");
        return value => { setX(value); setY(value); };
      });
      const popEase = gsap.parseEase("back.out(1.4)");
      const trackSetters = tracks.map(node => gsap.quickSetter(node, "x", "px"));
      let widths = [];
      let viewportWidth = 0;
      let travelDistance = 0;
      const measure = () => {
        viewportWidth = frame.clientWidth;
        widths = tracks.map(track => track.scrollWidth);
        travelDistance = Math.max(...widths) + viewportWidth;
      };
      // All stages are pure functions of one scrubbed scroll position.
      // There is no timed playback or independent sequence to get out of sync.
      const state = { progress: 0 };
      const draw = () => {
        const p = state.progress;
        introExit.progress(phase(p, .04, .2));
        nameSetters.forEach((setter, index) => {
          const offset = index * .025;
          const reverseOffset = (names.length - 1 - index) * .025;
          const labelIn = popEase(phase(p, .23 + offset, .30 + offset));
          const labelOut = popEase(1 - phase(p, .43 + reverseOffset, .50 + reverseOffset));
          setter(labelIn * labelOut);
        });
        tracks.forEach((track, index) => {
          const distance = phase(p, .60, .98) * (widths[index] + viewportWidth);
          const from = index % 2 === 0 ? -widths[index] : viewportWidth;
          trackSetters[index](from + (index % 2 === 0 ? distance : -distance));
        });
      };
      measure();
      draw();
      const animation = gsap.to(state, {
        progress: 1, ease: "none", onUpdate: draw,
        scrollTrigger: {
          id: "toolkit-strips", trigger: section, start: "top top",
          // Keep the same stages with a shorter, more responsive scroll journey.
          // The longest row sets scroll length; every row shares its start/end.
          end: () => { measure(); return `+=${travelDistance / (.38 * 3.5)}`; },
          pin: frame, scrub: .3, invalidateOnRefresh: true,
          onRefresh: () => { measure(); draw(); },
        },
      });
      const resize = new ResizeObserver(() => { measure(); draw(); });
      resize.observe(frame);
      tracks.forEach(track => resize.observe(track));
      return () => {
        resize.disconnect();
        animation.scrollTrigger?.kill();
        animation.kill();
        introExit.revert();
      };
    });
    return () => media.revert();
  }, { scope: root, dependencies: [localize], revertOnUpdate: true });

  return localize(<section ref={root} className={styles.section} data-header-theme="light" aria-labelledby="toolkit-heading">
    <div data-toolkit-frame className={styles.frame}>
      <div data-toolkit-intro className={`ui-section ${styles.intro}`}>
        <div className={styles.center}>
          <h2 id="toolkit-heading" className="ui-section-title">
            <TitleLine data-toolkit-title>TOOLS</TitleLine>
            <TitleLine data-toolkit-title fromRight className="gradient-text-flow">I USE</TitleLine>
          </h2>
          <ReadingText data-toolkit-copy className="ui-section-copy">The technologies behind the interfaces I build. From the first line of code to the final interaction, these are the tools I use to turn ideas into thoughtful digital experiences.</ReadingText>
        </div>
      </div>
      <div data-toolkit-bands className={styles.bands} aria-hidden="true">
        {techGroups.map((group, index) => <div key={group.id} className={styles.band}>
          <span data-toolkit-label className={styles.label}>{labels[index]}</span>
          <div data-toolkit-track className={styles.track}>
            {group.items.map(tool => <span className={styles.tool} key={tool.name}>
              <Image src={tool.logo} alt="" width={100} height={100} draggable={false} />
              <span>{tool.name}</span>
            </span>)}
          </div>
        </div>)}
      </div>
      <ul className="sr-only" aria-label="Technologies I use">
        {techGroups.flatMap(group => group.items).map(tool => <li key={tool.name}>{tool.name}</li>)}
      </ul>
    </div>
  </section>);
}
