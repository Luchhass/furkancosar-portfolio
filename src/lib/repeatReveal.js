import gsap from "gsap";

// Observe stationary layout anchors, never the transformed reveal target.
// One observer serves cards, headings, details and decorative entrances.
const entries = new Map();
const visibleAnchors = new Map();
let observer;

export function repeatReveal(animation, anchor) {
  if (!anchor) return animation;
  animation.pause(0);
  const release = observeReveal(anchor, () => animation.play(), () => animation.reverse());
  gsap.context()?.add(() => release);
  return animation;
}

export function observeReveal(anchor, enter, exit) {
  anchor.dataset.repeatReveal = visibleAnchors.get(anchor) ? "visible" : "hidden";
  if (!observer) observer = new IntersectionObserver((changes) => {
    for (const change of changes) {
      const animations = entries.get(change.target);
      if (!animations) continue;
      const visible = change.isIntersecting;
      visibleAnchors.set(change.target, visible);
      change.target.dataset.repeatReveal = visible ? "visible" : "hidden";
      for (const item of animations) visible ? item.enter() : item.exit();
    }
  }, { rootMargin: "0px", threshold: 0 });
  let animations = entries.get(anchor);
  if (!animations) {
    animations = new Set();
    entries.set(anchor, animations);
    observer.observe(anchor);
  }
  const item = { enter, exit };
  animations.add(item);
  if (visibleAnchors.has(anchor)) queueMicrotask(() => {
    if (animations.has(item)) visibleAnchors.get(anchor) ? enter() : exit();
  });
  const release = () => {
    animations.delete(item);
    if (!animations.size) {
      entries.delete(anchor);
      visibleAnchors.delete(anchor);
      observer?.unobserve(anchor);
      delete anchor.dataset.repeatReveal;
    }
    if (!entries.size) { observer?.disconnect(); observer = null; }
  };
  return release;
}

export function loopWhileVisible(animation, anchor) {
  let visible = false;
  const sync = () => animation.paused(!visible || document.hidden);
  const stop = observeReveal(anchor, () => { visible = true; sync(); }, () => { visible = false; sync(); });
  document.addEventListener("visibilitychange", sync);
  gsap.context()?.add(() => () => { stop(); document.removeEventListener("visibilitychange", sync); });
  sync();
  return animation;
}
