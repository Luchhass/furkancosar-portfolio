import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { createMotionMedia } from "@/lib/motionMedia";
import { heroTitleExit, heroDetailExit } from "@/lib/heroScrollExit";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const phase = (progress, start, end) => gsap.utils.clamp(0, 1, (progress - start) / (end - start));

export default function useToolkitMotion(root, locale) {
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
        trackSetters.forEach((setTrack, index) => {
          const distance = phase(p, .60, .98) * (widths[index] + viewportWidth);
          const from = index % 2 === 0 ? -widths[index] : viewportWidth;
          setTrack(from + (index % 2 === 0 ? distance : -distance));
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
  }, { scope: root, dependencies: [locale], revertOnUpdate: true });

}
