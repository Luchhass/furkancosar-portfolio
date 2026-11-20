import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION, titleSlideFrom, titleSlideTo } from "@/lib/motionPresets";
import { observeReveal, repeatReveal, reverseReveal } from "@/lib/repeatReveal";
import { sequenceReveal } from "@/lib/revealSequence";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export default function useJourneyMotion(ref, chapterCount) {
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
      const stepTracks = controls.querySelectorAll("[data-journey-step-track]");
      const sweepDuration = .95;
      const navigation = gsap.timeline({ paused: true })
        .fromTo(rail, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: sweepDuration, ease: "none" });
      controls.querySelectorAll("button").forEach((button, index) => {
        const position = railRect.width ? (button.getBoundingClientRect().left - railRect.left) / railRect.width : index / chapterCount;
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
        const stepTrack = stepTracks[index];
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
          show(Math.min(chapterCount - 1, Math.floor(self.progress * chapterCount)));
        },
      });
      triggerRef.current = trigger;
      const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      fill(trigger.progress);
      show(Math.min(chapterCount - 1, Math.floor(trigger.progress * chapterCount)));
      return () => {
        gsap.killTweensOf(stepTracks);
        gsap.set(stepTracks, { clearProps: "transform" });
        transition?.revert();
        stopObservingTitles();
        titleSequences.forEach(sequence => sequence.dispose());
        titleEntrances.forEach(animation => animation.kill());
        navigationTweenRef.current?.kill();
        gsap.set(root.querySelectorAll(".journey-slide, .journey-line, .journey-slide-copy"), { clearProps: "transform,opacity,visibility" });
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
  }, { scope: ref, dependencies: [chapterCount], revertOnUpdate: true });

  function selectChapter(index) {
    const trigger = triggerRef.current;
    if (!trigger) {
      ref.current.querySelectorAll(".journey-slide")[index]?.scrollIntoView({ block: "center" });
      return;
    }
    const progress = (index + 0.5) / chapterCount;
    navigationTweenRef.current?.kill();
    navigationTweenRef.current = gsap.to(window, { scrollTo: { y: trigger.start + (trigger.end - trigger.start) * progress, autoKill: true }, ...MOTION.scrollTo, overwrite: "auto" });
  }

  return { active, enhanced, selectChapter };
}
