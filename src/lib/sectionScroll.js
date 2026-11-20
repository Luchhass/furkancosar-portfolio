import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const SECTION_SCROLL = Object.freeze({
  travelLerp: .12,
  captureRatio: .24,
  captureMax: 240,
  idleDelay: 110,
  nativeIdleDelay: 220,
  settleVelocity: 1.5,
  settleDistance: 10,
  duration: .28,
});

// Choose only a nearby resting frame, never a point inside a pinned story.
export function restingSection(position, targets, ranges, viewport, limit) {
  const radius = Math.min(SECTION_SCROLL.captureMax, viewport * SECTION_SCROLL.captureRatio);
  // Pinned sections own their activation/release zones, and must never become
  // alignment destinations. Otherwise a nearby frame can pull the scroll into
  // a pin even when the gesture settled just outside its boundary.
  const isPinnedZone = value => ranges.some(([start, end]) =>
    value >= start - radius && value <= end + radius);
  if (isPinnedZone(position)) return null;
  // The same radius and nearest-frame rule apply in both directions.
  // Returning to the frame where a gesture began is valid too.
  const nearby = targets.filter(target => target >= 0 && target <= limit &&
    !isPinnedZone(target) &&
    Math.abs(target - position) <= radius);
  return nearby.reduce((best, value) => best === null || Math.abs(value - position) < Math.abs(best - position) ? value : best, null);
}

export function createSectionScroll() {
  let lastDeltaTime = 0;
  let input = null;
  let aligning = false;
  let targets = [];
  let ranges = [];
  let disposed = false;
  let direction = 0;
  let touchDown = false;
  let nativePosition = window.scrollY;
  let lastNativeScrollAt = 0;
  let nativeScrollEnded = false;
  const hasNativeScrollEnd = "onscrollend" in document;
  const nested = ".ui-screen, .journey-slide-words, textarea, [data-lenis-prevent]";

  function nestedConsumes(target, delta) {
    const element = target instanceof Element ? target.closest(nested) : null;
    if (!element) return false;
    if (element.matches("[data-lenis-prevent]")) return true;
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
      // Lenis forwards the last move's delta again on release.
      if (event.type === "touchend") return true;
      cancelAlignment();
      if (Math.abs(data.deltaX) > Math.abs(data.deltaY) || event.ctrlKey) {
        input = null;
        return false;
      }
      if (!data.deltaY) return true;
      const previousDirection = direction;
      const nextDirection = Math.sign(data.deltaY);
      direction = nextDirection;
      if (nestedConsumes(event.target, data.deltaY)) {
        input = null;
        if (lenis.isScrolling === "smooth") lenis.scrollTo(lenis.actualScroll, { immediate: true });
        return true;
      }
      // Reverse from the current position instead of fighting queued momentum.
      if (event.type === "wheel" && previousDirection && previousDirection !== nextDirection) lenis.scrollTo(lenis.actualScroll, { immediate: true });
      lastDeltaTime = performance.now();
      input = blocked() ? null : event.type === "wheel" ? "wheel" : "touch";
      // Never reduce, trap or discard the user's scroll delta.
      return true;
    },
  });

  function measure() {
    if (disposed) return;
    const y = window.scrollY;
    const triggers = ScrollTrigger.getAll().filter(trigger => trigger.pin);
    ranges = triggers.map(trigger => [trigger.start, trigger.end]);
    const nodes = document.querySelectorAll("main .ui-screen, main .journey-story");
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
    input = null;
    cancelAlignment();
  }
  function touchStart() {
    interrupt();
    touchDown = true;
    nativePosition = window.scrollY;
    lastNativeScrollAt = 0;
    nativeScrollEnded = false;
    direction = 0;
  }
  function touchEnd(event) {
    touchDown = event.touches.length > 0;
    if (input === "touch") lastDeltaTime = performance.now();
  }
  function touchCancel() {
    touchDown = false;
    interrupt();
  }
  function trackNativeScroll() {
    if (input !== "touch" || window.scrollY === nativePosition) return;
    nativePosition = window.scrollY;
    lastNativeScrollAt = performance.now();
    nativeScrollEnded = false;
  }
  function finishNativeScroll(event) {
    // Ignore Lenis's synthetic signal and scrollend from nested scrollers.
    if (input === "touch" && event.isTrusted && event.target === document) {
      nativeScrollEnded = true;
    }
  }
  function readyToAlign(now) {
    if (input === "touch") {
      if (!lastNativeScrollAt) return false;
      if (hasNativeScrollEnd) return nativeScrollEnded;
      return now - Math.max(lastNativeScrollAt, lastDeltaTime) >= SECTION_SCROLL.nativeIdleDelay;
    }
    return now - lastDeltaTime >= SECTION_SCROLL.idleDelay &&
      Math.abs(lenis.velocity) <= SECTION_SCROLL.settleVelocity &&
      Math.abs(lenis.targetScroll - lenis.animatedScroll) <= SECTION_SCROLL.settleDistance;
  }
  const tick = time => {
    if (document.hidden) return;
    lenis.raf(time * 1000);
    if (!input || aligning || touchDown || blocked() || !readyToAlign(performance.now())) return;
    const settledPosition = lenis.actualScroll;
    const position = input === "touch" ? settledPosition : lenis.targetScroll;
    input = null;
    const target = restingSection(position, targets, ranges, window.innerHeight, lenis.limit);
    if (target === null || Math.abs(target - settledPosition) < 2) return;
    // Freeze wheel momentum at the settled position before starting the short
    // section alignment tween. Otherwise the pending Lenis target keeps moving
    // underneath the snap and carries the page past the section start.
    lenis.scrollTo(settledPosition, { immediate: true });
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
  window.addEventListener("touchend", touchEnd, { passive: true });
  window.addEventListener("touchcancel", touchCancel, { passive: true });
  window.addEventListener("scroll", trackNativeScroll, { passive: true });
  // Lenis may stop native scrollend in capture. Listen on the same target
  // so a browser completion remains observable even when its velocity is zero.
  if (hasNativeScrollEnd) window.addEventListener("scrollend", finishNativeScroll, true);
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
    window.removeEventListener("touchend", touchEnd);
    window.removeEventListener("touchcancel", touchCancel);
    window.removeEventListener("scroll", trackNativeScroll);
    if (hasNativeScrollEnd) window.removeEventListener("scrollend", finishNativeScroll, true);
    window.removeEventListener("pointerdown", interrupt);
    window.removeEventListener("keydown", interrupt);
    document.removeEventListener("visibilitychange", syncLock);
    lenis.destroy();
  };
}
