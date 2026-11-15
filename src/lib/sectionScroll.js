import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const SECTION_SCROLL = Object.freeze({
  travelLerp: .12,
  captureRatio: .24,
  captureMax: 240,
  idleDelay: 110,
  settleVelocity: 1.5,
  settleDistance: 10,
  duration: .28,
});

// Choose only a nearby resting frame, never a point inside a pinned story.
export function restingSection(position, targets, ranges, viewport, limit) {
  if (ranges.some(([start, end]) => position > start + 3 && position < end - 3)) return null;
  const radius = Math.min(SECTION_SCROLL.captureMax, viewport * SECTION_SCROLL.captureRatio);
  // The same radius and nearest-frame rule apply in both directions.
  // Returning to the frame where a gesture began is valid too.
  const nearby = targets.filter(target => target >= 0 && target <= limit &&
    Math.abs(target - position) <= radius);
  return nearby.reduce((best, value) => best === null || Math.abs(value - position) < Math.abs(best - position) ? value : best, null);
}

export function createSectionScroll() {
  let lastDeltaTime = 0;
  let armed = false;
  let aligning = false;
  let targets = [];
  let ranges = [];
  let disposed = false;
  let direction = 0;
  const nested = ".ui-screen, .journey-slide-words, textarea, [data-lenis-prevent]";

  function nestedConsumes(target, delta) {
    const element = target instanceof Element ? target.closest(nested) : null;
    if (!element) return false;
    if (element.matches("[data-lenis-prevent]")) return true;
    if (element.matches(".projects-shelf")) return false;
    // First bring the viewport frame into place; only then scroll its contents.
    if (element.matches(".ui-screen") && Math.abs(element.getBoundingClientRect().top) > 3) return false;
    return element.scrollHeight > element.clientHeight + 2 &&
      (delta > 0 ? element.scrollTop < element.scrollHeight - element.clientHeight - 2 : element.scrollTop > 2);
  }

  const lenis = new Lenis({
    // Wheel input follows a continuous glide; touch keeps browser momentum.
    lerp: SECTION_SCROLL.travelLerp,
    smoothWheel: true,
    syncTouch: false,
    prevent: node => node instanceof Element && node.matches(nested) && nestedConsumes(node, direction),
    virtualScroll: data => {
      const { event } = data;
      cancelAlignment();
      if (Math.abs(data.deltaX) > Math.abs(data.deltaY) || event.ctrlKey) {
        armed = false;
        return false;
      }
      if (!data.deltaY) return true;
      const previousDirection = direction;
      const nextDirection = Math.sign(data.deltaY);
      direction = nextDirection;
      if (nestedConsumes(event.target, data.deltaY)) {
        armed = false;
        if (lenis.isScrolling === "smooth") lenis.scrollTo(lenis.actualScroll, { immediate: true });
        return true;
      }
      // Reverse from the current position instead of fighting queued momentum.
      if (event.type === "wheel" && previousDirection && previousDirection !== nextDirection) lenis.scrollTo(lenis.actualScroll, { immediate: true });
      lastDeltaTime = performance.now();
      armed = !blocked();
      // Never reduce, trap or discard the user's scroll delta.
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
      if (node.matches(".journey-deck") || (!pin && node.offsetHeight > window.innerHeight + 4)) {
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
    if (blocked()) { interrupt(); lenis.stop(); }
    else lenis.start();
  }
  function cancelAlignment() {
    if (!aligning) return;
    aligning = false;
    lenis.scrollTo(lenis.actualScroll, { immediate: true });
  }
  function interrupt() {
    armed = false;
    cancelAlignment();
  }
  const touchStart = () => { interrupt(); lastDeltaTime = 0; direction = 0; };
  const tick = time => {
    if (document.hidden) return;
    lenis.raf(time * 1000);
    if (!armed || aligning || lenis.isTouching || blocked() ||
      performance.now() - lastDeltaTime < SECTION_SCROLL.idleDelay ||
      Math.abs(lenis.velocity) > SECTION_SCROLL.settleVelocity ||
      Math.abs(lenis.targetScroll - lenis.animatedScroll) > SECTION_SCROLL.settleDistance) return;
    armed = false;
    const target = restingSection(lenis.targetScroll, targets, ranges, window.innerHeight, lenis.limit);
    if (target === null || Math.abs(target - lenis.actualScroll) < 2) return;
    aligning = true;
    lenis.scrollTo(target, {
      duration: SECTION_SCROLL.duration,
      lerp: 0,
      easing: t => 1 - Math.pow(1 - t, 3),
      onComplete: () => { aligning = false; },
    });
  };
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
