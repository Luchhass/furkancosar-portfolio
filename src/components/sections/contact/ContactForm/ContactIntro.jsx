import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ReadingText from "@/components/ui/ReadingText";
import TitleLine from "@/components/ui/TitleLine";
import { useLocalizedContent } from "@/lib/localizeContent";
import { createMotionMedia } from "@/lib/motionMedia";
import { bindMagnet } from "@/lib/pointerMotion";
import { MOTION } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";

const contactNotes = ["Idea", "Scope", "Motion", "Launch"];

export default function ContactIntro() {
  const localize = useLocalizedContent();
  const notesRef = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const notes = notesRef.current;
      const anchors = Array.from(notes.querySelectorAll("[data-contact-note-anchor]"));
      const cleanups = anchors.map((anchor) => bindMagnet(anchor, anchor.querySelector("[data-contact-note]"), 0.3));
      return () => cleanups.forEach((cleanup) => cleanup());
    });
    return () => media.revert();
  }, { scope: notesRef });

  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      notesRef.current.querySelectorAll("[data-contact-note-reveal]").forEach(item => {
        repeatReveal(gsap.fromTo(item,
          { yPercent: MOTION.miniTitle.yPercent },
          { ...MOTION.miniTitle, yPercent: 0 }), item.parentElement);
      });
    });
    return () => media.revert();
  }, { scope: notesRef });

  return localize(
    <div className="contact-intro hidden min-w-0 md:block">
      <h2
        id="contact-form-title"
        data-reveal-part="title"
        className="ui-section-title"
      >
        <TitleLine>contact.build</TitleLine>
        <TitleLine className="gradient-text-flow">contact.now</TitleLine>
      </h2>

      <div className="contact-description">
        <ReadingText className="ui-section-copy ui-section-copy-spaced text-black/60">Tell me what you want to build, where the project is right now, and what kind of feeling the interface should carry. We can talk through the screens, motion details, responsive flow and launch priorities before shaping the cleanest frontend path.</ReadingText>

        <div
          ref={notesRef}
          className="contact-notes mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-black/10 pt-5 md:mt-9 md:grid-cols-4"
        >
          {contactNotes.map((label, index) => (
            <div key={label} data-contact-note-anchor>
              <div data-contact-note className="w-fit overflow-hidden">
                <div data-contact-note-reveal>
                  <span className="gradient-text-flow block text-[28px] leading-[0.82] font-black md:text-[30px] lg:text-[32px]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-2 block text-[10px] leading-none font-black tracking-[0.14em] text-black/45 uppercase">
                    {label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
