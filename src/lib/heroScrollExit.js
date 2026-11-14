// The hero and toolkit intro share the exact same scroll-exit motion.
export const heroTitleExit = () => ({
  xPercent: index => index % 2 ? 18 : -18,
  y: -70, opacity: 0, stagger: .06, ease: "none",
});

export const heroDetailExit = () => ({
  autoAlpha: 0, y: -32,
  x: (_index, target) => target.dataset.heroExit === "stat" ? -18 : target.dataset.heroExit === "action" ? 18 : 0,
  scale: .98, ease: "none",
});
