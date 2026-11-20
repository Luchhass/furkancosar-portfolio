"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { circleCover, circleMask } from "@/lib/circleReveal";
import { titleSlideFrom, titleSlideTo } from "@/lib/motionPresets";
import { SITE_REPOSITORY } from "@/lib/seo";

const content = {
  en: {
    title: "Building this frontend portfolio",
    summary: "I built this portfolio to explore how expressive motion, responsive layouts and accessible content can share one interface. The live site and its source code are two ways to inspect the same project.",
    sections: [
      ["One site, two languages", "Next.js App Router serves dedicated English and Turkish URLs. Both versions render readable content, navigation and page metadata on the server so each can be shared or opened directly."],
      ["Scroll-driven motion", "The toolkit section uses CSS sticky positioning for its frame and GSAP for scroll-linked progress. When reduced motion is enabled, the tool groups remain readable in normal document flow."],
      ["Canvas with a static fallback", "The hero separates polygon geometry, drawing and interaction into distinct modules. The background is decorative, so the heading, description and links are available independently of the canvas."],
    ],
    source: "Explore the portfolio source on GitHub",
    trigger: "About this portfolio",
    close: "Close portfolio case study",
  },
  tr: {
    title: "Bu frontend portfolyosunu nasıl geliştirdim?",
    summary: "Bu portfolyoyu, animasyonlu bir arayüzde duyarlı yerleşim ve erişilebilir içeriğin nasıl birlikte çalışabileceğini araştırmak için geliştirdim. Canlı site ve kaynak kodu, aynı projeyi iki farklı açıdan incelemene olanak tanıyor.",
    sections: [
      ["Tek site, iki dil", "Next.js App Router, İngilizce ve Türkçe için ayrı adresler sunuyor. Her sürüm içeriği, gezinme bağlantılarını ve sayfa metadata’sını sunucuda oluşturuyor, böylece doğrudan açılabiliyor ve paylaşılabiliyor."],
      ["Kaydırmayla ilerleyen animasyon", "Teknolojiler bölümünün çerçevesi CSS sticky ile konumlanıyor. Animasyon GSAP ile kaydırmaya bağlı ilerliyor. Hareketi azaltma tercihi açıkken araç grupları normal sayfa akışında okunabiliyor."],
      ["Statik alternatifi olan canvas", "Giriş bölümündeki çokgenlerin geometrisi, çizimi ve etkileşimi ayrı modüllerde. Arka plan dekoratif olduğu için başlık, açıklama ve bağlantılar canvas’tan bağımsız olarak erişilebilir."],
    ],
    source: "Portfolyonun kaynak kodunu GitHub’da incele",
    trigger: "Portfolyo Hakkında",
    close: "Vaka çalışmasını kapat",
  },
};

export default function PortfolioCaseStudy() {
  const { locale } = useLanguage();
  const { title, summary, sections, source, trigger, close } = content[locale];
  const dialogRef = useRef(null);
  const scrollerRef = useRef(null);
  const closeRef = useRef(null);
  const timelineRef = useRef(null);
  const releaseRef = useRef(null);

  useEffect(() => {
    return () => releaseRef.current?.();
  }, []);

  function open(event) {
    const dialog = dialogRef.current;
    if (dialog.open) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const origin = event.detail
      ? { x: event.clientX, y: event.clientY }
      : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    releaseRef.current = () => {
      timelineRef.current?.revert();
      timelineRef.current = null;
      document.body.style.overflow = previousOverflow;
      releaseRef.current = null;
    };
    dialog.showModal();
    scrollerRef.current.scrollTop = 0;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const cover = circleCover(origin);
      const rows = dialog.querySelectorAll("[data-case-reveal]");
      timelineRef.current = gsap.timeline({
        onComplete: () => dialog.style.removeProperty("clip-path"),
        onReverseComplete: () => dialog.close(),
      })
        .fromTo(dialog, { clipPath: circleMask(origin) }, cover, 0)
        .fromTo(rows, titleSlideFrom(), { ...titleSlideTo(), stagger: .07 }, cover.duration)
        .fromTo(closeRef.current, { opacity: 0 }, { opacity: 1, duration: .24 }, cover.duration);
    }
  }

  function dismiss(event) {
    event.preventDefault();
    const timeline = timelineRef.current;
    if (timeline?.time() > 0) timeline.reverse();
    else dialogRef.current.close();
  }

  return (
    <>
      <span className="-mb-1 inline-block overflow-hidden pb-1">
        <button type="button" onClick={open} aria-haspopup="dialog" aria-controls="portfolio-case-study" data-footer-address-item
          className="ui-chrome-contact ui-chrome-contact-text block cursor-pointer text-white underline decoration-white/40 underline-offset-4 hover:decoration-[var(--color-primary)] focus-visible:-outline-offset-2">
          {trigger}
        </button>
      </span>
      <dialog ref={dialogRef} id="portfolio-case-study" aria-labelledby="portfolio-case-study-title" data-lenis-prevent
        onCancel={dismiss}
        onClose={() => releaseRef.current?.()}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-[#0b0b0b] p-0 text-white backdrop:bg-transparent">
        <button ref={closeRef} type="button" onClick={dismiss} aria-label={close}
          className="absolute end-[var(--ui-frame-inset)] top-[var(--ui-frame-inset)] z-10 grid size-11 cursor-pointer place-items-center border-0 bg-transparent p-0 text-white hover:text-[var(--color-primary)]">
          <X size={26} aria-hidden="true" />
        </button>
        <div ref={scrollerRef} className="h-full overflow-y-auto overscroll-contain">
          <article className="mx-auto grid max-w-5xl gap-8 px-[var(--ui-frame-inset)] pt-24 pb-14 md:gap-10 md:pt-28">
            <div className="overflow-hidden">
              <h2 data-case-reveal id="portfolio-case-study-title"
                className="max-w-[22ch] text-balance text-[clamp(2rem,4.5vw,4.5rem)] leading-[1.04] font-black tracking-[-.045em]">
                {title}
              </h2>
            </div>
            <div className="overflow-hidden">
              <p data-case-reveal className="max-w-[65ch] leading-relaxed text-zinc-300 md:text-lg">{summary}</p>
            </div>
            <div className="grid gap-6">
              {sections.map(([heading, copy]) => (
                <div key={heading} className="overflow-hidden">
                  <section data-case-reveal className="grid gap-2 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-6">
                    <h3 className="text-lg font-bold tracking-tight">{heading}</h3>
                    <p className="max-w-[65ch] text-sm leading-relaxed text-zinc-300 md:text-base">{copy}</p>
                  </section>
                </div>
              ))}
            </div>
            <div className="overflow-hidden">
              <a data-case-reveal href={SITE_REPOSITORY} target="_blank" rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-3 border-b border-[var(--color-primary)] pb-2 font-bold hover:text-[var(--color-primary)]">
                {source} <ArrowUpRight size={18} className="shrink-0" aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </dialog>
    </>
  );
}
