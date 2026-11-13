# Page scroll

All pages share `createSectionScroll` in `src/lib/sectionScroll.js`, mounted and
cleaned up by MotionExperience on navigation and motion-preference changes.
Lenis runs on GSAP's existing ticker and updates ScrollTrigger.

- Wheel easing: .105 lerp. Touch follows the finger directly, with .11 inertia lerp.
- Approaching a large section's top in either direction progressively weights
  the current gesture within 16% of the viewport (max 135px). The input multiplier
  eases from 1 to .34 as distance closes.
- A crossing gesture ends exactly on the edge and briefly holds there. No idle
  timer, autonomous alignment tween, backwards correction or post-gesture snap.
- Fast input (180px event or 2.4px/ms) bypasses docking for 800ms.
- After docking, 55px accumulated intent releases it. Strong input releases it
  immediately. A fresh touch gesture also releases the hold.
- Pinned Highlights and the interior of Journey retain their own scroll ranges.
- Inner archive/form/accordion scrolling takes priority when it can consume input.
  At its edge, input can continue onto the page.
- Page intro, menu, modal, hidden tab and reduced-motion preferences suspend or
  remove the controller. Keyboard and pointer actions release docking.

Tune the shared SECTION_SCROLL object instead of adding page-specific values.
Verify with `node scripts/verify-section-scroll.mjs`.
