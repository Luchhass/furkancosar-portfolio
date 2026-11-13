# Page scroll

All pages share `createSectionScroll` in `src/lib/sectionScroll.js`, mounted and
cleaned up by MotionExperience on navigation and motion-preference changes.
Lenis runs on GSAP's existing ticker and updates ScrollTrigger.

- Wheel easing: .105 lerp. Touch follows the finger directly, with .11 inertia lerp.
- Wheel and touch input always retain their full distance. No approach resistance
  or extra input threshold for leaving a section.
- After 150ms without input, once momentum is nearly finished (velocity below
  .65 and remaining travel below 6px), a nearby section may settle into frame.
  Capture distance is 14% of the viewport, capped at 140px; alignment takes .24s.
- Only the nearest eligible point is used. It can correct an overshoot of at most
  24px, and never recaptures the section the current gesture departed from.
- Fast gestures (180px event or 2.4px/ms) stay free for that gesture. A new gesture
  starts after an input gap of 220ms, or on a new touch.
- New wheel/touch input interrupts alignment at its current position immediately.
  Touch alignment waits until the finger is lifted and inertia has subsided.
- Pinned Highlights and the interior of Journey retain their own scroll ranges.
- Inner archive/form/accordion scrolling takes priority when it can consume input.
  At its edge, input can continue onto the page.
- Oversized sections align only at their edges, without snapping inside content.
- Page intro, menu, modal, hidden tab and reduced-motion preferences suspend or
  remove the controller. Keyboard and pointer actions cancel pending alignment.

Tune the shared SECTION_SCROLL object instead of adding page-specific values.
Verify with `node scripts/verify-section-scroll.mjs`.
