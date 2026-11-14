"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createMotionMedia } from "@/lib/motionMedia";
import { loopWhileVisible } from "@/lib/repeatReveal";

export default function CTALighting() {
  const ref = useRef(null);
  useGSAP(() => {
    const media = createMotionMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const backdrop = ref.current;
      const section = backdrop.closest("section");
      const sources = [...backdrop.querySelectorAll("[data-cta-light]")];
      const loops = sources.map((source, index) => {
        const origin = { x: index ? 88 : 12, y: index ? 60 : 40 };
        const position = { ...origin };
        const paint = () => {
          source.style.setProperty("--light-x", `${position.x}%`);
          source.style.setProperty("--light-y", `${position.y}%`);
        };
        const loop = gsap.timeline({ paused: true, repeat: -1 })
          .to({}, { duration: index ? .9 : .1 })
          .addLabel("pulse")
          .to(source, { opacity: 1, duration: 1.15, ease: "power2.inOut" }, "pulse")
          .to(position, { x: index ? 70 : 30, y: index ? 40 : 60, duration: 2.8, ease: "sine.inOut", onUpdate: paint }, "pulse")
          .to(source, { opacity: .25, duration: .5, ease: "sine.inOut" }, "pulse+=1.3")
          .to(source, { opacity: .9, duration: .6, ease: "sine.inOut" }, "pulse+=1.8")
          .to(source, { opacity: 0, duration: 1.2, ease: "sine.inOut" }, "pulse+=2.4")
          .to(position, { ...origin, duration: 1.3, ease: "sine.inOut", onUpdate: paint }, "pulse+=2.8")
          .to({}, { duration: .25 });
        loopWhileVisible(loop, section);
        return loop;
      });
      return () => {
        loops.forEach(loop => loop.kill());
      };
    });
    return () => media.revert();
  }, { scope: ref });
  return <div ref={ref} className="cta-liquid-backdrop" style={{ backgroundImage: "url('/images/cta-liquid-sculpture.png')" }} aria-hidden="true">
    <span data-cta-light className="cta-surface-light" style={{ "--light-x": "12%", "--light-y": "40%" }} />
    <span data-cta-light className="cta-surface-light" style={{ "--light-x": "88%", "--light-y": "60%" }} />
  </div>;
}
