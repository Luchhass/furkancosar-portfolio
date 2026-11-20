"use client";
import { useLocalizedContent } from "@/lib/localizeContent";
import MiniTitleText from "@/components/ui/MiniTitleText";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createMotionMedia } from "@/lib/motionMedia";
import OutlineCirclesBackground from "@/components/ui/Backgrounds/OutlineCirclesBackground";
import { MOTION } from "@/lib/motionPresets";
import { repeatReveal } from "@/lib/repeatReveal";

import ContactFields from "./ContactFields";
import ContactIntro from "./ContactIntro";
import ContactFeedback from "./ContactFeedback";
import useContactSubmission from "./useContactSubmission";
import { updateActionFillOrigin } from "@/lib/pointerOrigin";

gsap.registerPlugin(useGSAP);

export default function ContactForm() {
  const localize = useLocalizedContent();
  const sectionRef = useRef(null);
  const submitButtonRef = useRef(null);
  const { completion, isSent, isSubmitting, modal, setIsSent, setModal, handleInput, handleSubmit } = useContactSubmission();

  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const form = sectionRef.current.querySelector("form");
      const targets = form.querySelectorAll("[data-contact-field-reveal]");
      repeatReveal(gsap.fromTo(targets,
        { yPercent: MOTION.miniTitle.yPercent },
        { ...MOTION.miniTitle, yPercent: 0, stagger: MOTION.line.stagger }), form);
    });
    return () => media.revert();
  }, { scope: sectionRef });

  return (
    localize(<section
      data-header-theme="light"
      data-scroll-reveal="sequence"
      ref={sectionRef}
      className="ui-screen ui-screen-scroll relative isolate overflow-hidden bg-white ui-section text-black"
      aria-labelledby="contact-form-title"
    >
      <OutlineCirclesBackground />

      <div className="ui-section-grid relative z-10">
        <p
          data-reveal-part="kicker"
          className="ui-section-label hidden items-center gap-2 text-black/55 md:inline-flex"
        >
          <MiniTitleText>Contact</MiniTitleText>
        </p>

        <div className="ui-section-body ui-section-split contact-layout">
          <ContactIntro />

          <form
            className="ui-form contact-form relative grid min-w-0 border-t border-black/10 pt-5"
            aria-label="Project contact form"
            onSubmit={handleSubmit}
            onInput={handleInput}
          >
            <span
              className="gradient-bg-flow absolute -top-px left-0 h-0.5 transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${15 + completion * 85}%` }}
              aria-hidden="true"
            />

            <ContactFields />

            <div className="contact-actions flex flex-col gap-4 border-t border-black/10 pt-6 md:flex-row md:items-center md:justify-between">
              <div className="overflow-hidden"><p data-contact-field-reveal className="m-0 max-w-58 text-[10px] leading-[1.2] font-bold tracking-[0.12em] text-black/45 uppercase">
                Usually replies after reviewing scope and availability.
              </p></div>

              <div className="w-full overflow-hidden md:w-fit">
              <button
                data-contact-field-reveal
                ref={submitButtonRef}
                type="submit"
                disabled={isSubmitting}
                onPointerEnter={updateActionFillOrigin}
                onPointerLeave={updateActionFillOrigin}
                className="ui-button gradient-action-button gradient-action-paint group relative isolate inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden bg-black px-5 text-[11px] leading-none font-black whitespace-nowrap text-white transition-opacity duration-300 disabled:pointer-events-none disabled:opacity-65 md:w-fit md:px-7"
              >

                {isSubmitting ? (
                  <span className="contact-submit-spinner relative z-10" aria-hidden="true" />
                ) : null}

                <span className="relative z-10">
                  {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                </span>
              </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ContactFeedback {...{ isSent, modal, sectionRef, submitButtonRef, setIsSent, setModal }} />
    </section>)
  );
}
