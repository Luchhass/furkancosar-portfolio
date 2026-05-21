"use client";

import RevealTextLine from "@/components/layout/ScrollReveal/RevealTextLine";
import { useState } from "react";

const projectTypes = ["Website", "Interface", "Ecommerce", "Dashboard"];

const contactNotes = [
  ["01", "Idea"],
  ["02", "Scope"],
  ["03", "Motion"],
  ["04", "Launch"],
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      projectType: String(formData.get("projectType") || "").trim(),
      timeline: String(formData.get("timeline") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Message could not be sent.");
      }

      form.reset();
      setModal({
        status: "success",
        title: "Message Sent",
        message:
          "Your project note landed safely. I will review the scope and get back to you soon.",
      });
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
      className="min-h-dvh overflow-hidden bg-white px-8 py-20 text-black md:px-10 md:py-24 lg:px-16 lg:py-32"
      aria-labelledby="contact-form-title"
    >
      <div className="grid w-full grid-cols-[40px_minmax(0,1fr)] gap-x-4 md:grid-cols-[120px_minmax(0,1fr)] md:gap-x-5 lg:grid-cols-[160px_minmax(0,1fr)_160px] lg:items-start lg:gap-x-5">
        <p data-reveal-part="kicker" className="m-0 flex items-center gap-2 self-start text-[13px] leading-none font-black tracking-[0.08em] text-black/55 uppercase md:text-sm">
          <span data-reveal-inner className="inline-flex items-center gap-2">
            <span
              className="gradient-action-dot h-2 w-2 rounded-full"
              aria-hidden="true"
            />
            Contact
          </span>
        </p>

        <div className="col-span-2 mt-6 grid min-w-0 gap-8 md:mt-7 md:gap-10 lg:col-start-2 lg:col-span-1 lg:row-start-1 lg:mt-0 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <h2
              id="contact-form-title"
              data-reveal-part="title"
              className="m-0 text-[44px] leading-[0.9] font-black tracking-[-0.04em] uppercase md:text-[80px] lg:text-[120px]"
            >
              <span className="block">BUILD</span>
              <span className="gradient-text-flow block">NOW</span>
            </h2>

            <div>
              <p className="m-0 mt-5 max-w-md text-[13px] leading-tight font-medium text-black/60 md:mt-7 md:text-sm">
                <RevealTextLine>
                  Tell me what you want to build, where the project is right now,
                </RevealTextLine>
                <RevealTextLine>
                  and what kind of feeling the interface should carry. We can
                  talk
                </RevealTextLine>
                <RevealTextLine>
                  through the screens, motion details, responsive flow and launch
                </RevealTextLine>
                <RevealTextLine>
                  priorities before shaping the cleanest frontend path.
                </RevealTextLine>
              </p>

              <div data-reveal-part="content" className="mt-7 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 border-t border-black/10 pt-5 md:mt-9 md:grid-cols-4">
                {contactNotes.map(([number, label]) => (
                  <div key={label}>
                    <span className="gradient-text-flow block text-[28px] leading-[0.82] font-black md:text-[30px] lg:text-[32px]">
                      {number}
                    </span>

                    <span className="mt-2 block text-[10px] leading-none font-black tracking-[0.14em] text-black/45 uppercase">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form
            data-reveal-part="content"
            className="relative grid min-w-0 border-t border-black/10 pt-5"
            aria-label="Project contact form"
            onSubmit={handleSubmit}
          >
            <span
              className="gradient-bg-flow absolute -top-px left-0 h-0.5 w-24"
              aria-hidden="true"
            />

            <div className="grid md:grid-cols-2">
              <label className="group grid gap-2.5 border-b border-black/10 py-3.5 transition-colors duration-300 hover:border-black/25 focus-within:border-black/35 md:border-r md:pr-5">
                <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 group-focus-within:animate-[hero-flow_15s_ease-in-out_infinite] group-focus-within:bg-[linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff)] group-focus-within:bg-size-[260%_100%] group-focus-within:bg-clip-text group-focus-within:text-transparent">
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
                <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 group-focus-within:animate-[hero-flow_15s_ease-in-out_infinite] group-focus-within:bg-[linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff)] group-focus-within:bg-size-[260%_100%] group-focus-within:bg-clip-text group-focus-within:text-transparent">
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
                <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 group-focus-within:animate-[hero-flow_15s_ease-in-out_infinite] group-focus-within:bg-[linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff)] group-focus-within:bg-size-[260%_100%] group-focus-within:bg-clip-text group-focus-within:text-transparent">
                  Project Type
                </span>

                <select
                  className="h-9 w-full appearance-none bg-transparent pr-8 text-[15px] leading-none font-semibold tracking-[-0.01em] text-black outline-none placeholder:text-black/28 md:text-base"
                  name="projectType"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select one
                  </option>

                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <span
                  className="pointer-events-none absolute right-0 bottom-4 text-sm leading-none font-black text-black/35 md:right-5"
                  aria-hidden="true"
                >
                  ↓
                </span>
              </label>

              <label className="group grid gap-2.5 border-b border-black/10 py-3.5 transition-colors duration-300 hover:border-black/25 focus-within:border-black/35 md:pl-5">
                <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 group-focus-within:animate-[hero-flow_15s_ease-in-out_infinite] group-focus-within:bg-[linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff)] group-focus-within:bg-size-[260%_100%] group-focus-within:bg-clip-text group-focus-within:text-transparent">
                  Timeline
                </span>

                <input
                  className="h-9 w-full bg-transparent text-[15px] leading-none font-semibold tracking-[-0.01em] text-black outline-none placeholder:text-black/28 md:text-base"
                  name="timeline"
                  type="text"
                  placeholder="2-4 weeks"
                />
              </label>
            </div>

            <label className="group grid gap-2.5 border-b border-black/10 py-3.5 transition-colors duration-300 hover:border-black/25 focus-within:border-black/35 md:py-4">
              <span className="text-[10px] leading-none font-black tracking-[0.16em] text-black/40 uppercase transition-colors duration-300 group-focus-within:animate-[hero-flow_15s_ease-in-out_infinite] group-focus-within:bg-[linear-gradient(90deg,#6768ff,#884cff,#a53cdd,#cf3d9f,#ee4b67,#cf3d9f,#884cff,#6768ff)] group-focus-within:bg-size-[260%_100%] group-focus-within:bg-clip-text group-focus-within:text-transparent">
                Message
              </span>

              <textarea
                className="min-h-28 w-full resize-none bg-transparent text-[15px] leading-tight font-semibold tracking-[-0.01em] text-black outline-none placeholder:text-black/28 md:min-h-32 md:text-base"
                name="message"
                placeholder="A few details about the project, pages, style, budget or deadline..."
                required
              />
            </label>

            <div className="mt-5 flex flex-col gap-4 md:mt-6 md:flex-row md:flex-wrap md:items-center md:justify-between">
              <p className="m-0 max-w-58 text-[10px] leading-[1.2] font-bold tracking-[0.12em] text-black/45 uppercase">
                Usually replies after reviewing scope and availability.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                onPointerEnter={updateActionFillOrigin}
                onPointerLeave={updateActionFillOrigin}
                className="gradient-action-button group relative isolate inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden bg-black px-5 text-[11px] leading-none font-black whitespace-nowrap text-white transition-opacity duration-300 disabled:pointer-events-none disabled:opacity-65 md:w-fit md:px-7"
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

                <span className="relative z-10">
                  {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

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
              className="mt-4 mb-0 text-[34px] leading-[0.9] font-black tracking-[-0.04em] uppercase md:text-[44px]"
            >
              {modal.title}
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
