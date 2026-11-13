import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const SECTION_SCROLL = Object.freeze({
  lerp: .105,
  captureRatio: .16,
  captureMax: 135,
  minimumResistance: .34,
  fastDelta: 180,
  fastSpeed: 2.4,
  fastCooldown: 800,
  releaseDistance: 55,
});

// Resistance is applied to the user's current input, never to a later correction.
export function approachSection(delta, position, targets, ranges, viewport, limit) {
  if (ranges.some(([start, end]) => position > start + 3 && position < end - 3)) return { delta, dock: null };
  const sign = Math.sign(delta);
  const radius = Math.min(SECTION_SCROLL.captureMax, viewport * SECTION_SCROLL.captureRatio);
  const ahead = targets.filter(target => target >= 0 && target <= limit && (target - position) * sign > .5);
  const target = ahead.reduce((best, value) => Math.abs(value - position) < Math.abs(best - position) ? value : best, Infinity);
  const distance = Math.abs(target - position);
  if (distance > radius) return { delta, dock: null };
  const t = distance / radius;
  const weighted = delta * (SECTION_SCROLL.minimumResistance + (1 - SECTION_SCROLL.minimumResistance) * t * t);
  if (Math.abs(weighted) >= distance || (distance < 3 && Math.abs(delta) >= distance)) {
    return { delta: target - position, dock: target };
  }
  return { delta: weighted, dock: null };
}

export function createSectionScroll() {
  let lastDeltaTime = 0;
  let cooldown = 0;
  let dock = null;
  let release = 0;
  let targets = [];
  let ranges = [];
  let disposed = false;
  let direction = 0;
  const nested = ".ui-screen, .journey-slide-words, textarea, [data-lenis-prevent]";

  function nestedConsumes(target, delta) {
    const element = target instanceof Element ? target.closest(nested) : null;
    if (!element) return false;
    if (element.matches("textarea, [data-lenis-prevent]")) return true;
    if (element.matches(".projects-shelf")) return false;
    // First bring the viewport frame into place; only then scroll its contents.
    if (element.matches(".ui-screen") && Math.abs(element.getBoundingClientRect().top) > 3) return false;
    return element.scrollHeight > element.clientHeight + 2 &&
      (delta > 0 ? element.scrollTop < element.scrollHeight - element.clientHeight - 2 : element.scrollTop > 2);
  }

  const lenis = new Lenis({
    lerp: SECTION_SCROLL.lerp,
    smoothWheel: true,
    syncTouch: true,
    syncTouchLerp: .11,
    touchInertiaExponent: 1.45,
    prevent: node => node instanceof Element && node.matches(nested) && nestedConsumes(node, direction),
    virtualScroll: data => {
      const { event } = data;
      if (Math.abs(data.deltaX) > Math.abs(data.deltaY) || event.ctrlKey) return false;
      direction = data.deltaY;
      // Once a touch has arrived at the edge, don't let its trailing fling undo it.
      if (event.type === "touchend" && dock !== null) return false;
      if (!data.deltaY || nestedConsumes(event.target, data.deltaY)) {
        return true;
      }
      const now = performance.now();
      const speed = Math.abs(data.deltaY) / Math.max(16, now - lastDeltaTime);
      lastDeltaTime = now;
      const fast = Math.abs(data.deltaY) >= SECTION_SCROLL.fastDelta || speed > SECTION_SCROLL.fastSpeed;
      if (fast) {
        cooldown = now + SECTION_SCROLL.fastCooldown;
        dock = null;
      }
      if (dock !== null) {
        release += Math.abs(data.deltaY);
        if (fast || release >= SECTION_SCROLL.releaseDistance) {
          dock = null;
          cooldown = now + 350;
        } else {
          data.deltaY = 0;
          return true;
        }
      }
      if (now >= cooldown && !blocked() && event.type !== "touchend") {
        const shaped = approachSection(data.deltaY, lenis.targetScroll, targets, ranges, window.innerHeight, lenis.limit);
        data.deltaY = shaped.delta;
        if (shaped.dock !== null) { dock = shaped.dock; release = 0; }
      }
      return true;
    },
  });

  function measure() {
    if (disposed) return;
    const y = window.scrollY;
    const triggers = ScrollTrigger.getAll().filter(trigger => trigger.pin);
    ranges = triggers.map(trigger => [trigger.start, trigger.end]);
    const nodes = document.querySelectorAll("main .ui-hero, main .ui-screen, main .journey-story, footer");
    targets = [...nodes].flatMap(node => {
      const pin = triggers.find(trigger => trigger.pin === node);
      const top = pin ? pin.start : y + node.getBoundingClientRect().top;
      if (node.matches(".journey-deck")) {
        const end = top + node.offsetHeight - window.innerHeight;
        ranges.push([top, end]);
        return [top, end];
      }
      return [top];
    });
  }

  function blocked() {
    return document.hidden || document.body.style.overflow === "hidden" ||
      document.documentElement.style.overflow === "hidden" ||
      document.body.dataset.siteMenuOpen === "true" ||
      window.__pageIntroDoneForPath !== location.pathname;
  }

  function syncLock() {
    if (blocked()) { lenis.stop(); dock = null; }
    else lenis.start();
  }
  function interrupt() {
    cooldown = performance.now() + 500;
    dock = null;
  }
  const touchStart = () => { dock = null; release = 0; cooldown = 0; };
  const tick = time => { if (!document.hidden) lenis.raf(time * 1000); };
  const introDone = () => { measure(); syncLock(); };
  const lockObserver = new MutationObserver(syncLock);
  lockObserver.observe(document.body, { attributes: true, attributeFilter: ["style", "data-site-menu-open"] });
  lockObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
  const resizeObserver = new ResizeObserver(measure);
  const main = document.querySelector("main");
  if (main) resizeObserver.observe(main);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  ScrollTrigger.addEventListener("refresh", measure);
  window.addEventListener("resize", measure);
  window.addEventListener("page-intro:complete", introDone);
  window.addEventListener("touchstart", touchStart, { passive: true });
  window.addEventListener("pointerdown", interrupt, { passive: true });
  window.addEventListener("keydown", interrupt);
  document.addEventListener("visibilitychange", syncLock);
  measure();
  syncLock();
  return () => {
    disposed = true;
    lockObserver.disconnect();
    resizeObserver.disconnect();
    gsap.ticker.remove(tick);
    ScrollTrigger.removeEventListener("refresh", measure);
    window.removeEventListener("resize", measure);
    window.removeEventListener("page-intro:complete", introDone);
    window.removeEventListener("touchstart", touchStart);
    window.removeEventListener("pointerdown", interrupt);
    window.removeEventListener("keydown", interrupt);
    document.removeEventListener("visibilitychange", syncLock);
    lenis.destroy();
  };
}
