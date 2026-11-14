"use client";
import MiniTitleText from "@/components/ui/MiniTitleText";
import ReadingText from "@/components/ui/ReadingText";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION, titleSlideFrom, titleSlideTo } from "@/lib/motionPresets";
import { observeReveal, repeatReveal, reverseReveal } from "@/lib/repeatReveal";
import { sequenceReveal } from "@/lib/revealSequence";
import navigationStyles from "./JourneyNavigation.module.css";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

const chapters = [
  { short: "Spark", label: "MIDDLE SCHOOL", title: ["Curiosity"], copy: "My interest in coding started in middle school with Arduino. My uncle, a software developer who worked with large companies and ran his own business, inspired me to try it myself. Watching him turn ideas into working things made me curious. I began experimenting, learning through small projects and the satisfaction of making something work." },
  { short: "Web", label: "MY FIRST WEB PAGES", title: ["First steps"], copy: "As I entered high school, I started spending time at my uncle's office. I tried to put what I saw into practice, building small pages with HTML, CSS and JavaScript. There was plenty of trial and error, but each exercise helped me understand how a website came together and gave me another reason to keep going." },
  { short: "Office", label: "LEARNING IN THE WORKPLACE", title: ["On the job"], copy: "During high school summers, I took software-related internships and helped around the office, running errands and handling everyday tasks. I watched the developers work, asked questions and got to know the rhythm of a software team. Alongside that experience, I began experimenting with React Native and building my first attempts at mobile apps." },
  { short: "Study", label: "CHOOSING MY PROFESSION", title: ["Going deeper"], copy: "After high school, I enrolled in Web Design at Istanbul University and committed to making development my profession. I also completed a year of frontend training at Acunmedya Akademi at Nişantaşı University, covering HTML, CSS, JavaScript, React and Next.js. After practical exams, our final project brought frontend and backend students together: Swagger documentation, daily meetings, sprints and version control gave us a taste of real team delivery." },
  { short: "Build", label: "PUTTING LEARNING INTO PRACTICE", title: ["My own work"], copy: "While continuing university, I kept building projects of my own: websites, games and applications that gave me room to test new ideas. Each project helped me move beyond exercises and solve problems independently. They became a way to turn what I had learned into things people could use, while finding the gaps I still needed to work on." },
  { short: "Today", label: "BUILDING SOMETHING TOGETHER", title: ["Today"], copy: "Eventually, I co-founded a small startup with friends studying at Marmara University. We now offer web services together, from websites and apps to simple PHP bots, SEO and advertising support. It is where my learning meets real requests and shared responsibility. Alongside university, this work has also helped me learn mobile app development and begin writing simple backend code." },
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
      const controls = root.querySelector(".journey-controls");
      const rail = controls.querySelector(".journey-rail");
      const railRect = rail.getBoundingClientRect();
      const sweepDuration = .95;
      const navigation = gsap.timeline({ paused: true })
        .fromTo(rail, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: sweepDuration, ease: "none" });
      controls.querySelectorAll("button").forEach((button, index) => {
        const position = railRect.width ? (button.getBoundingClientRect().left - railRect.left) / railRect.width : index / chapters.length;
        navigation.fromTo(button.querySelector("[data-journey-step-enter]"),
          { yPercent: MOTION.miniTitle.yPercent },
          { ...MOTION.miniTitle, yPercent: 0 }, gsap.utils.clamp(0, 1, position) * sweepDuration);
      });
      repeatReveal(navigation, controls);
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
        const stepTrack = controls.querySelectorAll("[data-journey-step-track]")[index];
        gsap.fromTo(stepTrack,
          { xPercent: -50, x: 0 }, { xPercent: 0, duration: .6, ease: "power3.inOut", overwrite: true,
            onComplete: () => gsap.set(stepTrack, { xPercent: -50 }),
          });
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
        gsap.killTweensOf(controls.querySelectorAll("[data-journey-step-track]"));
        gsap.set(controls.querySelectorAll("[data-journey-step-track]"), { clearProps: "transform" });
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

  return <section ref={ref} className="ui-journey journey-story" style={{ "--journey-chapters": chapters.length }} data-header-theme="dark" aria-labelledby="journey-title">
    <div className="journey-frame">
      <header className="journey-deck-heading"><h2 id="journey-title" className="ui-section-label"><MiniTitleText>My journey</MiniTitleText></h2></header>
      <div className="journey-slides">{chapters.map((chapter, index) => <article className="journey-slide" key={chapter.label} aria-hidden={enhanced ? active !== index : undefined}>
        <div className="journey-slide-words"><h3><span className="journey-line-mask"><span className="journey-line">{chapter.short}</span></span></h3><ReadingText active={enhanced && active === index} className="journey-slide-copy">{chapter.copy}</ReadingText></div>
      </article>)}</div>
      <nav className={`journey-controls ${navigationStyles.controls}`} aria-label="Journey chapters">
        <div className="journey-rail" aria-hidden="true"><span className="journey-rail-fill" /></div>
        <div className="journey-chapter-links">{chapters.map((chapter, index) => <button type="button" key={chapter.label} aria-label={`Go to chapter ${index + 1}: ${chapter.short}`} aria-current={active === index ? "step" : undefined} onClick={() => selectChapter(index)}><span className={navigationStyles.entry} data-journey-step-enter><span className={`${navigationStyles.body} invisible`} aria-hidden="true"><span className={navigationStyles.number}>0{index + 1}</span><span className={navigationStyles.label}>{chapter.short}</span></span><span className={navigationStyles.track} data-journey-step-track aria-hidden="true">{[0, 1].map(copy => <span className={navigationStyles.body} key={copy}><span className={`${navigationStyles.number} ${active === index ? "gradient-text-flow" : ""}`} data-journey-step-number>0{index + 1}</span><span className={navigationStyles.label}>{chapter.short}</span></span>)}</span></span></button>)}</div>
      </nav>
    </div>
  </section>;
}
