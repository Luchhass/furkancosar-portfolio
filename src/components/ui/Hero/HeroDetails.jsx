"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { latestProjects } from "@/data/projects";
import styles from "./HeroDetails.module.css";
import { MOTION } from "@/lib/motionPresets";

const previews = latestProjects.filter(project => project.screenshot).slice(0, 10);
const positions = [[30, 32], [69, 34], [29, 63], [72, 62], [51, 24]];

function setupPreviews(root, reduced, setSelectedPreviews) {
  const frames = [...root.querySelectorAll("[data-preview]")];
  const selected = gsap.utils.shuffle(frames).slice(0, gsap.utils.random(3, 5, 1));
  const slots = gsap.utils.shuffle([...positions]);
  selected.forEach((node, index) => {
    node.dataset.previewSelected = "true";
    gsap.set(node, { left: `${slots[index][0] + gsap.utils.random(-4, 4)}%`,
      top: `${slots[index][1] + gsap.utils.random(-4, 4)}%`,
      rotation: gsap.utils.random(-13, 13), opacity: 1, scale: reduced ? 1 : 0 });
  });
  setSelectedPreviews(new Set(selected.map(node => node.dataset.preview)));
  const hero = root.closest("section");
  const movers = !reduced && matchMedia("(hover: hover) and (pointer: fine)").matches ? selected.map((node, index) => {
    const inner = node.firstElementChild;
    gsap.set(inner, { transformPerspective: 1000, force3D: true });
    const options = MOTION.pointer;
    return { node, weight: .8 + index * .15,
      rx: gsap.quickTo(inner, "rotationX", options), ry: gsap.quickTo(inner, "rotationY", options) };
  }) : [];
  const move = event => {
    if (event.pointerType === "touch") return;
    const rect = root.getBoundingClientRect();
    movers.forEach(({ node, weight, rx, ry }) => {
      const dx = gsap.utils.clamp(-1, 1, (event.clientX - rect.left - node.offsetLeft) / (rect.width * .5));
      const dy = gsap.utils.clamp(-1, 1, (event.clientY - rect.top - node.offsetTop) / (rect.height * .5));
      rx(-dy * MOTION.tilt.y * weight); ry(dx * MOTION.tilt.x * weight);
    });
  };
  const reset = () => movers.forEach(({ rx, ry }) => { rx(0); ry(0); });
  if (movers.length) { hero.addEventListener("pointermove", move); hero.addEventListener("pointerleave", reset); }
  return () => {
    hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", reset);
    movers.forEach(({ rx, ry }) => [rx, ry].forEach(setter => setter.tween.kill()));
    selected.forEach(node => { delete node.dataset.previewSelected; });
  };
}

export default function HeroDetails({ variant }) {
  const localize = useLocalizedContent();
  const ref = useRef(null);
  const [selectedPreviews, setSelectedPreviews] = useState(null);
  const pathname = usePathname();
  useGSAP(() => {
    const root = ref.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (variant === "projects") return setupPreviews(root, reduced, setSelectedPreviews);
    if (reduced) return;
    const marks = [...root.querySelectorAll("[data-detail-mark]")];
    const loop = gsap.timeline({ paused: true, repeat: -1 });
      loop.fromTo(marks, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .8, stagger: .25, ease: "power3.out" })
        .to(root.querySelectorAll("[data-detail-line]"), { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, .2)
        .to({}, { duration: 4 })
        .to(marks, { opacity: 0, y: -8, duration: .6, stagger: .1 })
        .set(root.querySelectorAll("[data-detail-line]"), { scaleX: 0 });
    let visible = false;
    const sync = () => {
      if (visible && !document.hidden && window.__pageIntroDoneForPath === pathname) {
        loop.play();
      }
      else loop.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(root.closest("section"));
    window.addEventListener("page-intro:complete", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect(); loop.kill();
      window.removeEventListener("page-intro:complete", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, { scope: ref, dependencies: [variant, pathname], revertOnUpdate: true });

  return localize(<div ref={ref} className={`${styles.layer} ${styles[variant]}`} aria-hidden="true">
    {variant === "projects" && previews.map(project => <div key={project.id} data-preview={project.id} className={styles.preview}>
      <div className={styles.previewTilt}>
        {selectedPreviews?.has(project.id) && (
          <Image src={`/images/hero-projects/${project.slug}.webp`} alt="" fill loading="eager" sizes="(max-width: 767px) 23vw, 13vw" />
        )}
      </div>
    </div>)}
    {variant === "about" && <div className={styles.journey}>
      <span className={styles.caption} data-detail-mark>HOW IT STARTED / STILL BUILDING</span>
      <div className={styles.steps}>{["Arduino", "Web", "Frontend"].map((text, index) => <div key={text} data-detail-mark>
        <small>0{index + 1}</small><span>{text}</span>
      </div>)}</div>
      <span data-detail-line className={styles.line} />
    </div>}
    {variant === "contact" && <>
      <div className={`${styles.note} ${styles.idea}`} data-detail-mark><small>01 / FROM YOU</small><span>An idea.</span><i data-detail-line className={styles.line} /></div>
      <div className={`${styles.note} ${styles.reply}`} data-detail-mark><small>02 / TOGETHER</small><span>A real interface.</span><i data-detail-line className={styles.line} /></div>
    </>}
  </div>);
}
