# Page scroll

All pages share `createSectionScroll` in `src/lib/sectionScroll.js`, mounted and
cleaned up by MotionExperience on navigation and motion-preference changes.
Lenis runs on GSAP's existing ticker and updates ScrollTrigger.

- Wheel easing uses a .12 lerp. The browser handles touch movement and inertia.
- Wheel and touch input always retain their full distance. No approach resistance
  or extra input threshold for leaving a section.
- Wheel alignment can start after 110ms without input, once Lenis velocity is at
  most 1.5 and the remaining travel is at most 10px.
- Touch alignment waits for finger release and a native document `scrollend`.
  Browsers without `scrollend` wait 220ms after release or the last page movement,
  whichever comes later.
- The nearest eligible section aligns over .28s within 24% of the viewport height,
  capped at 240px. New wheel or touch input interrupts alignment.
- Pinned Highlights and the interior of Journey retain their own scroll ranges.
- Inner archive/form/accordion scrolling takes priority when it can consume input.
  At its edge, input can continue onto the page.
- Oversized sections align only at their edges, without snapping inside content.
- Page intro, menu, modal, hidden tab and reduced-motion preferences suspend or
  remove the controller. Keyboard and pointer actions cancel pending alignment.

Tune the shared SECTION_SCROLL object instead of adding page-specific values.
With the app running on port 3001, verify touch momentum and wheel alignment with
`node scripts/verify-touch-scroll.mjs`. Set `TEST_URL` to use another port.
