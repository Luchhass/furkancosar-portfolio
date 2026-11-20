"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createMotionMedia } from "@/lib/motionMedia";
import { loopWhileVisible } from "@/lib/repeatReveal";
import { useLanguage } from "@/hooks/useLanguage";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function LetterReel(props) {
  const { locale } = useLanguage();
  return <LetterReelContent key={locale} {...props} />;
}

function LetterReelContent({ words }) {
  const ref = useRef(null);
  const count = Math.max(...words.map(word => word.length));
  useGSAP(() => {
    const root = ref.current;
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const slots = [...root.children];
      const context = document.createElement("canvas").getContext("2d");
      const font = getComputedStyle(root);
      const size = parseFloat(font.fontSize);
      context.font = `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
      const tracking = parseFloat(font.letterSpacing) || 0;
      const width = letter => letter ? `${Math.max(0, context.measureText(letter).width + tracking) / size}em` : "0em";
      slots.forEach((slot, index) => { slot.style.width = width(words[0][index]); });
      const clock = { time: 0 };
      const ease = gsap.parseEase("power3.inOut");
      let wordIndex = 0;
      let columns = [];
      let pendingPreparation = false;
      let lastTime = 0;
      const prepare = () => {
        const current = words[wordIndex % words.length];
        const next = words[(wordIndex + 1) % words.length];
        columns = slots.map((slot, index) => {
          const track = slot.lastElementChild;
          const steps = gsap.utils.random(4, 7, 1);
          const downward = Math.random() > .5;
          const delay = Math.random() * .18;
          const duration = gsap.utils.random(.7, 1.15);
            const letters = [current[index] || " ", ...Array.from({ length: steps - 1 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]), next[index] || " "];
            if (downward) letters.reverse();
            track.replaceChildren(...letters.map(letter => {
              const row = document.createElement("span");
              row.className = "gradient-text-flow flex h-full items-center justify-center";
              row.textContent = letter;
              return row;
            }));
          return { slot, track, steps, downward, delay, duration,
            fromWidth: parseFloat(width(current[index])), toWidth: parseFloat(width(next[index])) };
        });
      };
      const draw = () => {
        if (clock.time < lastTime) {
          wordIndex++;
          pendingPreparation = true;
        }
        lastTime = clock.time;
        // Keep the landed glyphs untouched throughout the reading pause.
        // Rebuild the next reels only when the next shuffle actually starts.
        if (pendingPreparation) {
          if (clock.time < 4.1) return;
          prepare();
          pendingPreparation = false;
        }
        columns.forEach(column => {
          const progress = ease(gsap.utils.clamp(0, 1, (clock.time - 4.1 - column.delay) / column.duration));
          const y = column.downward ? -column.steps * 100 * (1 - progress) : -column.steps * 100 * progress;
          column.track.style.transform = `translateY(${y}%)`;
          const slotWidth = column.fromWidth + (column.toWidth - column.fromWidth) * progress;
          column.slot.style.width = `${slotWidth}em`;
        });
        if (clock.time >= 5.45) root.dataset.currentWord = words[(wordIndex + 1) % words.length];
      };
      prepare();
      draw();
      const loop = gsap.fromTo(clock, { time: 0 }, {
        time: 5.5, duration: 5.5, ease: "none", repeat: -1, paused: true,
        onUpdate: draw,
      });
      loopWhileVisible(loop, root.closest("section"));
      return () => {
        loop.kill();
        delete root.dataset.currentWord;
        slots.forEach((slot, index) => {
          slot.style.width = "";
          slot.lastElementChild.style.transform = "";
          slot.lastElementChild.replaceChildren(Object.assign(document.createElement("span"), { className: "gradient-text-flow flex h-full items-center justify-center", textContent: words[0][index] || " " }));
        });
      };
    });
    return () => media.revert();
  }, { scope: ref });
  return <span ref={ref} data-letter-reel className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
    {Array.from({ length: count }, (_, index) => <span key={index} className="relative block h-full overflow-hidden">
      <span className="invisible">{words[0][index]}</span>
      <span className="absolute inset-0"><span className="gradient-text-flow flex h-full items-center justify-center">{words[0][index] || " "}</span></span>
    </span>)}
  </span>;
}
