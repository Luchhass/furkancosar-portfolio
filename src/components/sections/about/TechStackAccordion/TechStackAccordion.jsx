"use client";
import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { createMotionMedia } from "@/lib/motionMedia";
import { splitCharacters } from "@/lib/motionText";
import { MOTION, headingFrom, headingTo, detailFrom, detailTo } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";
import styles from "./Toolkit.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
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
const smooth = (value) => value * value * (3 - 2 * value);

export default function TechStackAccordion() {
  const root = useRef(null);

  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const section = root.current;
      const frame = section.querySelector("[data-toolkit-frame]");
      const intro = section.querySelector("[data-toolkit-intro]");
      const names = Array.from(section.querySelectorAll("[data-toolkit-label]"));
      const tracks = Array.from(section.querySelectorAll("[data-toolkit-track]"));
      const splits = Array.from(section.querySelectorAll("[data-toolkit-title]")).map(line => splitCharacters(line));
      // Match CTA entrance timing while keeping the pinned stages scroll-driven.
      splits.forEach((split, index) => repeatReveal(gsap.from(split.chars, {
        ...headingFrom(), ...headingTo(), delay: .12 + index * MOTION.heading.lineGap,
      }), frame));
      repeatReveal(gsap.from(section.querySelector("[data-toolkit-copy]"), {
        ...detailFrom(), ...detailTo(), delay: .35,
      }), frame);

      const setIntroOpacity = gsap.quickSetter(intro, "opacity");
      const setIntroY = gsap.quickSetter(intro, "y", "px");
      const nameSetters = names.map(node => ({
        opacity: gsap.quickSetter(node, "opacity"), y: gsap.quickSetter(node, "y", "px"),
      }));
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
        const exit = smooth(phase(p, .04, .2));
        setIntroOpacity(1 - exit);
        setIntroY(-24 * exit);
        nameSetters.forEach((setter, index) => {
          const offset = index * .025;
          const labelIn = gsap.parseEase(MOTION.ease)(phase(p, .23 + offset, .30 + offset));
          const labelOut = smooth(phase(p, .43 + offset, .50 + offset));
          setter.opacity(labelIn * (1 - labelOut));
          setter.y(44 * (1 - labelIn) - 44 * labelOut);
        });
        tracks.forEach((track, index) => {
          const distance = Math.min(widths[index] + viewportWidth, phase(p, .60, .98) * travelDistance);
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
          // Every row moves two pixels per scroll pixel, regardless of tool count.
          end: () => { measure(); return `+=${travelDistance / (.38 * 2)}`; },
          pin: frame, scrub: MOTION.scrub, invalidateOnRefresh: true,
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
        splits.forEach(split => split.revert());
      };
    });
    return () => media.revert();
  }, { scope: root });

  return <section ref={root} className={styles.section} data-header-theme="light" aria-labelledby="toolkit-heading">
    <div data-toolkit-frame className={styles.frame}>
      <div data-toolkit-intro className={`ui-section ${styles.intro}`}>
        <div className={styles.center}>
          <h2 id="toolkit-heading" className="ui-section-title">
            <span><span data-toolkit-title>TOOLS</span></span>
            <span><span data-toolkit-title className="gradient-text-flow">I USE</span></span>
          </h2>
          <p data-toolkit-copy className="ui-section-copy">The technologies behind the interfaces I build. From the first line of code to the final interaction, these are the tools I use to turn ideas into thoughtful digital experiences.</p>
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
  </section>;
}
