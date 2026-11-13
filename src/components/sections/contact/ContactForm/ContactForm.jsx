"use client";
import MiniTitleText from "@/components/ui/MiniTitleText";
import TitleLine from "@/components/ui/TitleLine";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createMotionMedia } from "@/lib/motionMedia";
import ReadingText from "@/components/ui/ReadingText";
import OutlineCirclesBackground from "@/components/ui/Backgrounds/OutlineCirclesBackground";
import { bindMagnet } from "@/lib/pointerMotion";

const contactNotes = [
  ["01", "Idea"],
  ["02", "Scope"],
  ["03", "Motion"],
  ["04", "Launch"],
];

gsap.registerPlugin(useGSAP);

function updateActionFillOrigin(event) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();

  button.style.setProperty(
    "--gradient-fill-x",
    `${event.clientX - rect.left}px`,
  );

  button.style.setProperty(
    "--gradient-fill-y",
    `${event.clientY - rect.top}px`,
  );
}

export default function ContactForm() {
  const notesRef = useRef(null);
  const sectionRef = useRef(null);
  const submitButtonRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [isSent, setIsSent] = useState(false);

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
    const fadeTimer = window.setTimeout(() => {
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 1.15,
        ease: "power2.inOut",
        onComplete: () => setIsSent(false),
      });
    }, 4200);

    return () => window.clearTimeout(fadeTimer);
  }, [isSent]);

  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const notes = notesRef.current;
      const anchors = Array.from(notes.querySelectorAll("[data-contact-note-anchor]"));
      const cleanups = anchors.map((anchor) => bindMagnet(anchor, anchor.querySelector("[data-contact-note]")));
      return () => cleanups.forEach((cleanup) => cleanup());
    });
    return () => media.revert();
  }, { scope: notesRef });

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      project: String(formData.get("project") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    setIsSubmitting(true);
    const requestStartedAt = performance.now();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      const remainingSpinnerTime = 420 - (performance.now() - requestStartedAt);
      if (remainingSpinnerTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingSpinnerTime));
      }

      if (!response.ok) {
        throw new Error(data.message || "Message could not be sent.");
      }

      form.reset();
      setCompletion(0);
      setIsSent(true);
    } catch (error) {
      setModal({
        status: "error",
        title: "Message Failed",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
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
          className="ui-section-label inline-flex items-center gap-2 text-black/55"
        >
          <MiniTitleText>Contact</MiniTitleText>
        </p>

        <div className="ui-section-body ui-section-split contact-layout">
          <div className="contact-intro min-w-0">
            <h2
              id="contact-form-title"
              data-reveal-part="title"
              className="ui-section-title"
            >
              <TitleLine>BUILD</TitleLine>
              <TitleLine className="gradient-text-flow">NOW</TitleLine>
            </h2>

            <div className="contact-description">
              <ReadingText className="ui-section-copy ui-section-copy-spaced text-black/60">Tell me what you want to build, where the project is right now, and what kind of feeling the interface should carry. We can talk through the screens, motion details, responsive flow and launch priorities before shaping the cleanest frontend path.</ReadingText>

              <div
                ref={notesRef}
                data-reveal-part="content"
                className="contact-notes mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-black/10 pt-5 md:mt-9 md:grid-cols-4"
              >
                {contactNotes.map(([number, label]) => (
                  <div key={label} data-contact-note-anchor>
                    <div data-contact-note className="w-fit">
                      <span className="gradient-text-flow block text-[28px] leading-[0.82] font-black md:text-[30px] lg:text-[32px]">
                        {number}
                      </span>

                      <span className="mt-2 block text-[10px] leading-none font-black tracking-[0.14em] text-black/45 uppercase">
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form
            data-reveal-part="content"
            className="ui-form contact-form relative grid min-w-0 border-t border-black/10 pt-5"
            aria-label="Project contact form"
            onSubmit={handleSubmit}
            onInput={(event) => {
              const data = new FormData(event.currentTarget);
              const fields = ["name", "email", "phone", "project", "message"];
              setCompletion(fields.filter((field) => String(data.get(field) || "").trim()).length / fields.length);
            }}
          >
            <span
              className="gradient-bg-flow absolute -top-px left-0 h-0.5 transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${15 + completion * 85}%` }}
              aria-hidden="true"
            />

            <div className="grid md:grid-cols-2">
              <label className="group grid gap-2.5 border-b border-black/10 py-3.5 transition-colors duration-300 hover:border-black/25 focus-within:border-black/35 md:border-r md:pr-5">
                <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 gradient-focus-flow group-focus-within:animate-[hero-flow_var(--gradient-flow-duration)_ease-in-out_infinite] group-focus-within:bg-[linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff)] group-focus-within:bg-size-[260%_100%] group-focus-within:bg-clip-text group-focus-within:text-transparent">
                  Name
                </span>

                <input
                  className="h-9 w-full bg-transparent text-[15px] leading-none font-semibold tracking-[-0.01em] text-black outline-none placeholder:text-black/28 md:text-base"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="group grid gap-2.5 border-b border-black/10 py-3.5 transition-colors duration-300 hover:border-black/25 focus-within:border-black/35 md:pl-5">
                <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 gradient-focus-flow group-focus-within:animate-[hero-flow_var(--gradient-flow-duration)_ease-in-out_infinite] group-focus-within:bg-[linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff)] group-focus-within:bg-size-[260%_100%] group-focus-within:bg-clip-text group-focus-within:text-transparent">
                  Email
                </span>

                <input
                  className="h-9 w-full bg-transparent text-[15px] leading-none font-semibold tracking-[-0.01em] text-black outline-none placeholder:text-black/28 md:text-base"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  required
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2">
              <label className="group relative grid gap-2.5 border-b border-black/10 py-3.5 transition-colors duration-300 hover:border-black/25 focus-within:border-black/35 md:border-r md:pr-5">
                <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 gradient-focus-flow group-focus-within:animate-[hero-flow_var(--gradient-flow-duration)_ease-in-out_infinite] group-focus-within:bg-[linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff)] group-focus-within:bg-size-[260%_100%] group-focus-within:bg-clip-text group-focus-within:text-transparent">
                  Phone
                </span>

                <input
                  className="h-9 w-full bg-transparent text-[15px] leading-none font-semibold tracking-[-0.01em] text-black outline-none placeholder:text-black/28 md:text-base"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+90 5xx xxx xx xx"
                  maxLength={30}
                  required
                />
              </label>

              <label className="group grid gap-2.5 border-b border-black/10 py-3.5 transition-colors duration-300 hover:border-black/25 focus-within:border-black/35 md:pl-5">
                <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 gradient-focus-flow group-focus-within:animate-[hero-flow_var(--gradient-flow-duration)_ease-in-out_infinite] group-focus-within:bg-[linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff)] group-focus-within:bg-size-[260%_100%] group-focus-within:bg-clip-text group-focus-within:text-transparent">
                  Project
                </span>

                <input
                  className="h-9 w-full bg-transparent text-[15px] leading-none font-semibold tracking-[-0.01em] text-black outline-none placeholder:text-black/28 md:text-base"
                  name="project"
                  type="text"
                  placeholder="What are you building?"
                  maxLength={160}
                  required
                />
              </label>
            </div>

            <label className="contact-message group grid gap-2.5 py-3.5 transition-colors duration-300 md:py-4">
              <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 gradient-focus-flow group-focus-within:animate-[hero-flow_var(--gradient-flow-duration)_ease-in-out_infinite] group-focus-within:bg-[linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff)] group-focus-within:bg-size-[260%_100%] group-focus-within:bg-clip-text group-focus-within:text-transparent">
                Project details / Message
              </span>

              <textarea
                className="min-h-28 w-full resize-none bg-transparent text-[15px] leading-tight font-semibold tracking-[-0.01em] text-black outline-none placeholder:text-black/28 md:min-h-32 md:text-base"
                name="message"
                placeholder="Tell me more about your project and what you need..."
                required
              />
            </label>

            <div className="contact-actions flex flex-col gap-4 border-t border-black/10 pt-6 md:flex-row md:items-center md:justify-between">
              <p className="m-0 max-w-58 text-[10px] leading-[1.2] font-bold tracking-[0.12em] text-black/45 uppercase">
                Usually replies after reviewing scope and availability.
              </p>

              <button
                ref={submitButtonRef}
                type="submit"
                disabled={isSubmitting}
                onPointerEnter={updateActionFillOrigin}
                onPointerLeave={updateActionFillOrigin}
                className="ui-button gradient-action-button group relative isolate inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden bg-black px-5 text-[11px] leading-none font-black whitespace-nowrap text-white transition-opacity duration-300 disabled:pointer-events-none disabled:opacity-65 md:w-fit md:px-7"
              >
                <span
                  className="gradient-action-fill pointer-events-none z-0"
                  aria-hidden="true"
                />

                {isSubmitting ? (
                  <span className="contact-submit-spinner relative z-10" aria-hidden="true" />
                ) : null}

                <span className="relative z-10">
                  {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {isSent ? (
        <div data-contact-success-overlay className="absolute inset-0 z-40 grid place-items-center bg-[linear-gradient(135deg,#e64d78,#b840bb_48%,#685ee8)] text-white">
          <div data-contact-success-content className="flex flex-col items-center text-center">
            <span className="contact-success-check" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none"><path d="m13 25 8 8 15-17" /></svg>
            </span>
            <p className="mt-7 mb-0 text-[clamp(28px,5vw,72px)] leading-none font-black tracking-[-0.05em] uppercase">Mesajınız gönderildi</p>
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
                className={`h-2 w-2 rounded-full ${
                  modal.status === "success"
                    ? "gradient-action-dot"
                    : "bg-[#ee4b67] shadow-[0_0_18px_rgba(238,75,103,.55)]"
                }`}
                aria-hidden="true"
              />
              {modal.status === "success" ? "Delivered" : "Try Again"}
            </p>

            <h3
              id="contact-result-title"
              className="ui-section-title"
            >
              <TitleLine>{modal.title}</TitleLine>
            </h3>

            <p className="m-0 mt-4 text-sm leading-tight font-medium text-white/70">
              {modal.message}
            </p>

            <button
              type="button"
              className="gradient-action-button group relative isolate mt-7 inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden bg-transparent px-5 text-[11px] leading-none font-black whitespace-nowrap text-white md:w-fit md:px-7"
              onClick={() => setModal(null)}
              onPointerEnter={updateActionFillOrigin}
              onPointerLeave={updateActionFillOrigin}
            >
              <span
                className="gradient-action-fill pointer-events-none z-0"
                aria-hidden="true"
              />

              <span
                className="gradient-action-border pointer-events-none z-20"
                aria-hidden="true"
              />

              <span
                className="gradient-action-dot relative z-10 h-2 w-2 rounded-full"
                aria-hidden="true"
              />

              <span className="relative z-10">CLOSE</span>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
