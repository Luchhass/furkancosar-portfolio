import gsap from "gsap";
import { MOTION } from "./motionPresets";

export function bindMagnet(anchor, mover) {
  return bindPointer(anchor, mover, "magnet");
}

export function bindTilt(anchor, mover) {
  return bindPointer(anchor, mover, "tilt");
}

// Original project-card hover: retain its CSS perspective, timing and lift values.
export function bindProjectCardHover(card) {
  let frame = 0;
  let clientX = 0, clientY = 0;
  const reset = () => {
    cancelAnimationFrame(frame); frame = 0;
    card.style.setProperty("--card-tilt-x", "0deg");
    card.style.setProperty("--card-tilt-y", "0deg");
    card.style.setProperty("--lift-x", "0px");
    card.style.setProperty("--lift-y", "0px");
  };
  const move = event => {
    if (event.pointerType === "touch" || event.buttons || document.hidden) return;
    clientX = event.clientX; clientY = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (clientX - rect.left) / rect.width * 100;
      const y = (clientY - rect.top) / rect.height * 100;
      card.style.setProperty("--card-tilt-x", `${(x - 50) * MOTION.cardTilt.x}deg`);
      card.style.setProperty("--card-tilt-y", `${(50 - y) * MOTION.cardTilt.y}deg`);
      card.style.setProperty("--lift-x", `${(x - 50) * .28}px`);
      card.style.setProperty("--lift-y", `${(y - 50) * .22}px`);
    });
  };
  card.addEventListener("pointermove", move, { passive: true });
  card.addEventListener("pointerleave", reset);
  card.addEventListener("pointerdown", reset);
  window.addEventListener("blur", reset);
  return () => {
    reset();
    card.removeEventListener("pointermove", move);
    card.removeEventListener("pointerleave", reset);
    card.removeEventListener("pointerdown", reset);
    window.removeEventListener("blur", reset);
  };
}

function bindPointer(anchor, mover, type) {
  if (!anchor || !mover || !matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return () => {};
  const x = gsap.quickTo(mover, type === "tilt" ? "rotationY" : "x", MOTION.pointer);
  const y = gsap.quickTo(mover, type === "tilt" ? "rotationX" : "y", MOTION.pointer);
  let frame = 0;
  let clientX = 0;
  let clientY = 0;
  const reset = () => { cancelAnimationFrame(frame); frame = 0; x(0); y(0); };
  const move = (event) => {
    if (event.pointerType === "touch" || document.hidden) return;
    clientX = event.clientX; clientY = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const rect = anchor.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= innerHeight) { reset(); return; }
      const dx = clientX - rect.left - rect.width / 2;
      const dy = clientY - rect.top - rect.height / 2;
      if (type === "tilt") {
        x(gsap.utils.clamp(-1, 1, dx / (rect.width / 2)) * MOTION.tilt.x);
        y(-gsap.utils.clamp(-1, 1, dy / (rect.height / 2)) * MOTION.tilt.y);
      } else {
        const { radius, strength, falloff, maxX, maxY } = MOTION.magnet;
        const pull = Math.pow(Math.max(0, 1 - Math.hypot(dx, dy) / radius), falloff) * strength;
        x(gsap.utils.clamp(-maxX, maxX, dx * pull));
        y(gsap.utils.clamp(-maxY, maxY, dy * pull));
      }
    });
  };
  const target = type === "magnet" ? window : anchor;
  target.addEventListener("pointermove", move, { passive: true });
  anchor.addEventListener("pointerleave", reset);
  window.addEventListener("blur", reset);
  const visibility = () => { if (document.hidden) reset(); };
  document.addEventListener("visibilitychange", visibility);
  return () => {
    cancelAnimationFrame(frame);
    target.removeEventListener("pointermove", move);
    anchor.removeEventListener("pointerleave", reset);
    window.removeEventListener("blur", reset);
    document.removeEventListener("visibilitychange", visibility);
    x.tween.kill(); y.tween.kill();
  };
}
