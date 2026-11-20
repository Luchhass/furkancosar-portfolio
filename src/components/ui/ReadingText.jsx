"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION } from "@/lib/motionPresets";
import { observeReveal, reverseReveal } from "@/lib/repeatReveal";
import { sequenceReveal } from "@/lib/revealSequence";
import { useLanguage } from "@/hooks/useLanguage";

gsap.registerPlugin(useGSAP, SplitText);

export default function ReadingText(props) {
  const { locale } = useLanguage();
  return <ReadingTextContent key={locale} {...props} />;
}

function ReadingTextContent({ as: Tag = "p", children, active = true, waitForIntro = false, ...attributes }) {
  const localize = useLocalizedContent();
  const ref = useRef(null);
  useGSAP(() => {
    if (!active) return;
    const root = ref.current;
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      let release;
      let animation;
      let sequence;
      let visible = false;
      const play = () => {
        if (visible && (!waitForIntro || window.__pageIntroDoneForPath === location.pathname)) {
          sequence?.refresh();
        }
      };
      const replay = () => { if (visible) sequence?.replay(); };
      const originalLabel = root.getAttribute("aria-label");
      let accessibleLabel = originalLabel;
      if (originalLabel === null) {
        const accessible = root.cloneNode(true);
        accessible.querySelectorAll('[aria-hidden="true"]').forEach(node => node.remove());
        accessible.querySelectorAll(".block").forEach(node => node.append(" "));
        accessibleLabel = accessible.textContent.replace(/\s+/g, " ").trim();
        root.setAttribute("aria-label", accessibleLabel);
      }
      const split = SplitText.create(root, {
        type: "lines,words", mask: "words", linesClass: "reading-line", wordsClass: "reading-word", autoSplit: true, deepSlice: false, aria: "auto",
        onSplit(self) {
          root.setAttribute("aria-label", accessibleLabel);
          release?.();
          sequence?.dispose();
          animation?.kill();
          if (!self.words.length) return;
          const spread = Math.min(MOTION.reading.maxSpread, MOTION.reading.wordStagger * Math.max(0, self.words.length - 1));
          animation = gsap.timeline({ paused: true }).fromTo(self.words, {
            y: (_index, word) => -(word.parentElement.getBoundingClientRect().height + MOTION.reading.hiddenOffset),
            rotationX: MOTION.reading.rotationX, transformOrigin: "50% 0%", autoAlpha: 1,
          }, {
            y: 0, rotationX: 0, duration: MOTION.reading.duration, ease: MOTION.reading.ease,
            stagger: { amount: spread, from: "start" },
          });
          sequence = sequenceReveal(animation, root, {
            canPlay: () => !waitForIntro || window.__pageIntroDoneForPath === location.pathname,
          });
          release = observeReveal(root, () => { visible = true; sequence.enter(); }, () => { visible = false; sequence.exit(); reverseReveal(animation); });
          return animation;
        },
      });
      window.addEventListener("page-intro:complete", play);
      root.addEventListener("reading-reveal:play", replay);
      return () => {
        window.removeEventListener("page-intro:complete", play);
        root.removeEventListener("reading-reveal:play", replay);
        release?.();
        sequence?.dispose();
        animation?.kill();
        split.revert();
        if (originalLabel === null) root.removeAttribute("aria-label");
      };
    });
    return () => media.revert();
  }, { scope: ref, dependencies: [active, waitForIntro, children], revertOnUpdate: true });
  return localize(<Tag ref={ref} data-reading-reveal {...attributes}>{children}</Tag>);
}
