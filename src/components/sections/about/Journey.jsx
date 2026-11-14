"use client";
import MiniTitleText from "@/components/ui/MiniTitleText";
import ReadingText from "@/components/ui/ReadingText";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION, detailFrom, detailTo, titleSlideFrom, titleSlideTo } from "@/lib/motionPresets";
import { observeReveal, repeatReveal, reverseReveal } from "@/lib/repeatReveal";
import { sequenceReveal } from "@/lib/revealSequence";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

const chapters = [
  { short: "Foundation", label: "THE FOUNDATION", title: ["Curiosity"], copy: "Studying Web Design at Istanbul University gave me a foundation in how digital interfaces are structured and experienced. I began exploring the connection between design and code, learning to turn ideas into clear layouts, responsive pages and small details that make a website feel intuitive." },
  { short: "In practice", label: "LEARNING BY BUILDING", title: ["Practice"], copy: "Internships and software specialization at Nişantaşı University helped me connect theory with practical development. Working with real teams and project requirements taught me to think beyond individual screens, solve problems carefully and build interfaces that work reliably for the people using them." },
  { short: "Independent", label: "INDEPENDENT THINKING", title: ["Ownership"], copy: "Freelance projects gave me the opportunity to take responsibility for the complete frontend experience. From understanding an idea and planning its structure to refining responsive layouts and interactions, I learned to balance visual detail with usability and carry a project through to its final delivery." },
  { short: "What's next", label: "THE NEXT CHAPTER", title: ["Growth"], copy: "Today, I continue developing my frontend skills through startup work and independent projects. I bring design, code and motion together while exploring better ways to build fast, accessible interfaces. Every project is another opportunity to improve my process, question the details and create something more thoughtful." },
];

export default function Journey() {
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const navigationTweenRef = useRef(null);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);

  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = ref.current;
      repeatReveal(gsap.from(root.querySelectorAll(".journey-controls"), { ...detailFrom(), ...detailTo() }), root);
      const panels = Array.from(root.querySelectorAll(".journey-slide"));
      root.classList.add("journey-deck");
      setEnhanced(true);
      setActive(0);
      let current = 0;
      let transition;
      const fill = gsap.quickTo(root.querySelector(".journey-rail-fill"), "scaleX", { duration: MOTION.progressScrub, ease: MOTION.ease });
      gsap.set(panels, { autoAlpha: 0 });
      gsap.set(panels[0], { autoAlpha: 1 });
      const titleEntrances = panels.map(panel => gsap.fromTo(panel.querySelectorAll(".journey-line"),
        titleSlideFrom(), { ...titleSlideTo(), paused: true }));
      const titleSequences = titleEntrances.map((animation, index) => sequenceReveal(animation, panels[index], { stage: 2 }));
      const stopObservingTitles = observeReveal(root,
        () => titleSequences[current].enter(),
        () => { titleSequences.forEach(sequence => sequence.exit()); titleEntrances.forEach(reverseReveal); });

      function show(index) {
        if (index === current) return;
        const previous = panels[current];
        const next = panels[index];
        const direction = index > current ? 1 : -1;
        titleSequences[current].exit();
        reverseReveal(titleEntrances[current]);
        transition?.kill();
        gsap.set(panels.filter((panel) => panel !== previous), { autoAlpha: 0 });
        transition = gsap.timeline({ defaults: { ease: "power3.out" } })
          .to(previous, { autoAlpha: 0, y: -direction * 18, duration: 0.18 })
          .set(next, { autoAlpha: 1, y: 0 })
          .call(() => {
            titleSequences[index].enter();
            next.querySelector("[data-reading-reveal]")?.dispatchEvent(new Event("reading-reveal:play"));
          });
        current = index;
        setActive(index);
      }

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onToggle: (self) => { if (self.isActive) document.body.dataset.journeyActive = "true"; else delete document.body.dataset.journeyActive; },
        onUpdate: (self) => {
          fill(self.progress);
          show(Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length)));
        },
      });
      triggerRef.current = trigger;
      const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      fill(trigger.progress);
      show(Math.min(chapters.length - 1, Math.floor(trigger.progress * chapters.length)));
      return () => {
        transition?.revert();
        stopObservingTitles();
        titleSequences.forEach(sequence => sequence.dispose());
        titleEntrances.forEach(animation => animation.kill());
        navigationTweenRef.current?.kill();
        gsap.set(root.querySelectorAll(".journey-slide, .journey-line, .journey-slide-index, .journey-slide-label, .journey-slide-copy"), { clearProps: "transform,opacity,visibility" });
        cancelAnimationFrame(refreshFrame);
        fill.tween.kill();
        trigger.kill();
        delete document.body.dataset.journeyActive;
        triggerRef.current = null;
        root.classList.remove("journey-deck");
        setEnhanced(false);
      };
    });
    return () => media.revert();
  }, { scope: ref });

  function selectChapter(index) {
    const trigger = triggerRef.current;
    if (!trigger) {
      ref.current.querySelectorAll(".journey-slide")[index]?.scrollIntoView({ block: "center" });
      return;
    }
    const progress = (index + 0.5) / chapters.length;
    navigationTweenRef.current?.kill();
    navigationTweenRef.current = gsap.to(window, { scrollTo: { y: trigger.start + (trigger.end - trigger.start) * progress, autoKill: true }, ...MOTION.scrollTo, overwrite: "auto" });
  }

  return <section ref={ref} className="ui-journey journey-story" data-header-theme="dark" aria-labelledby="journey-title">
    <div className="journey-frame">
      <header className="journey-deck-heading"><h2 id="journey-title" className="ui-section-label"><MiniTitleText>My journey</MiniTitleText></h2></header>
      <div className="journey-slides">{chapters.map((chapter, index) => <article className="journey-slide" key={chapter.label} aria-hidden={enhanced ? active !== index : undefined}>
        <div className="journey-slide-words"><h3>{chapter.title.map((line) => <span className="journey-line-mask" key={line}><span className="journey-line">{line}</span></span>)}</h3><ReadingText active={enhanced && active === index} className="journey-slide-copy">{chapter.copy}</ReadingText></div>
      </article>)}</div>
      <nav className="journey-controls" aria-label="Journey chapters">
        <div className="journey-rail" aria-hidden="true"><span className="journey-rail-fill" /></div>
        <div className="journey-chapter-links">{chapters.map((chapter, index) => <button type="button" key={chapter.label} aria-label={`Go to chapter ${index + 1}: ${chapter.short}`} aria-current={active === index ? "step" : undefined} onClick={() => selectChapter(index)}><span>0{index + 1}</span><span>{chapter.short}</span></button>)}</div>
      </nav>
    </div>
  </section>;
}
