import { useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import TitleLine from "@/components/ui/TitleLine";
import { useLocalizedContent } from "@/lib/localizeContent";
import { updateActionFillOrigin } from "@/lib/pointerOrigin";

export default function ContactFeedback({ isSent, modal, sectionRef, submitButtonRef, setIsSent, setModal }) {
  const localize = useLocalizedContent();
  useGSAP(() => {
    if (!isSent || !sectionRef.current) return;
    const section = sectionRef.current;
    const button = submitButtonRef.current;
    const overlay = section.querySelector("[data-contact-success-overlay]");
    const content = section.querySelector("[data-contact-success-content]");
    const sectionRect = section.getBoundingClientRect();
    const buttonRect = button?.getBoundingClientRect();
    const originX = buttonRect ? buttonRect.left + buttonRect.width / 2 - sectionRect.left : sectionRect.width / 2;
    const originY = buttonRect ? buttonRect.top + buttonRect.height / 2 - sectionRect.top : sectionRect.height / 2;

    gsap.set(overlay, { clipPath: `circle(0px at ${originX}px ${originY}px)` });
    gsap.set(content, { opacity: 0, y: 28, scale: 0.94 });
    gsap.timeline()
      .to(overlay, { clipPath: `circle(${Math.hypot(sectionRect.width, sectionRect.height) * 0.82}px at ${originX}px ${originY}px)`, duration: 1.05, ease: "power4.inOut" })
      .to(content, { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "back.out(1.35)" }, "-=0.18");
  }, { dependencies: [isSent], revertOnUpdate: true, scope: sectionRef });

  useEffect(() => {
    if (!isSent) return undefined;
    const overlay = sectionRef.current?.querySelector("[data-contact-success-overlay]");
    let fade;
    const fadeTimer = window.setTimeout(() => {
      fade = gsap.to(overlay, {
        autoAlpha: 0,
        duration: 1.15,
        ease: "power2.inOut",
        onComplete: () => setIsSent(false),
      });
    }, 4200);

    return () => {
      window.clearTimeout(fadeTimer);
      fade?.kill();
    };
  }, [isSent, sectionRef, setIsSent]);

  return localize(<>
      {isSent ? (
        <div data-contact-success-overlay className="absolute inset-0 z-40 grid place-items-center bg-primary text-white">
          <div data-contact-success-content className="flex flex-col items-center text-center">
            <span className="contact-success-check" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none"><path d="m13 25 8 8 15-17" /></svg>
            </span>
            <p className="mt-7 mb-0 text-[clamp(28px,5vw,72px)] leading-none font-black tracking-[-0.05em] uppercase">Message sent</p>
          </div>
        </div>
      ) : null}

      {modal ? (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-result-title"
        >
          <div className="relative w-full max-w-md overflow-hidden border border-white/12 bg-[#111] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,.38)] md:p-7">
            <span
              className="gradient-bg-flow absolute top-0 left-0 h-1 w-full"
              aria-hidden="true"
            />

            <p className="m-0 flex items-center gap-2 text-[10px] leading-none font-black tracking-[0.16em] text-white/50 uppercase">
              <span
                className="h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_#eb5e288c]"
                aria-hidden="true"
              />
              Try Again
            </p>

            <h3
              id="contact-result-title"
              className="ui-section-title"
            >
              <TitleLine>Message Failed</TitleLine>
            </h3>

            <p className="m-0 mt-4 text-sm leading-tight font-medium text-white/70">
              {modal}
            </p>

            <button
              type="button"
              className="gradient-action-button gradient-action-paint group relative isolate mt-7 inline-flex h-12 w-full items-center justify-center overflow-hidden bg-transparent px-5 text-[11px] leading-none font-black whitespace-nowrap text-white md:w-fit md:px-7"
              onClick={() => setModal(null)}
              onPointerEnter={updateActionFillOrigin}
              onPointerLeave={updateActionFillOrigin}
            >

              <span
                className="gradient-action-border pointer-events-none z-20"
                aria-hidden="true"
              />

              <span className="relative z-10">CLOSE</span>
            </button>
          </div>
        </div>
      ) : null}
  </>);
}
