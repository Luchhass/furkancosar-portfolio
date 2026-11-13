# Furkan Cosar — Portfolio

Next.js App Router, React, Tailwind CSS and GSAP. Four routes: Home, About, Projects and Contact.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. Copy `.env.example` to `.env.local` for optional mail and GitHub credentials. Never commit local credentials.

## Motion architecture

- `Hero`: page-intro coordination, SplitText character choreography, pointer perspective and scroll-driven line separation.
- `ScrollReveal`: section typography entrances. It deliberately does not hide large sections again after they have been read.
- `useSectionScene`: scoped rules, staggered rows, reading opacity and depth layers.
- `useProjectCardMotion`: independent background, image and copy entrances; IntersectionObserver also handles horizontally scrolling cards.
- `ProjectsHighlights`: scroll-pinned horizontal archive on desktop; native swiping and dragging on smaller screens.
- `ProjectDetailsModal`: opaque fullscreen body portal, card-origin preview entrance, animated close, readable scrollable content and keyboard focus containment.
- `AboutMeAccordion` / `InterfaceSculpture`: accordion selection changes the depth of a three-layer interface illustration.
- `Journey`: CSS-sticky chapter presentation across viewport sizes. Scroll switches one chapter at a time; a continuous progress rail and clickable chapter controls expose the current position. Reduced motion uses normal document flow.
- `TechStackAccordion` / `TechConstellation`: staggered logo entrances and a counter-rotating tool orbit.
- `MarqueeText` / `ScrollMarqueeText`: velocity-sensitive looping type and scroll-filled outline type.
- `ContactForm` / `ContactEnvelope`: individual field entrances, animated focus rules, completion-driven letter movement and result dialogs.
- `CollaborationCTA`, `IdentityBand`, navigation and footer: distinct typographic and geometric scenes.
- `MotionExperience`: only shared progress, contextual cursor and magnetic links. Component animations stay in their own scopes.

Shared `motionMedia` subscriptions revert local GSAP contexts when media conditions change and release native media-query listeners after their final subscriber unmounts. Highlights pinning requires 1024px width and 720px height. Journey uses a responsive sticky frame without those size limits. Reduced motion leaves all content accessible without pinning. Decorative animation pauses outside the viewport. Avoid transforming modal ancestors; use a portal for overlays.

## Verification

```sh
npm run lint
npm run build
npm run test:motion
node scripts/verify-scenes.mjs
node scripts/verify-touch.mjs
node scripts/verify-refinements.mjs
node scripts/verify-performance.mjs
node scripts/verify-resource-lifecycle.mjs
```

Browser checks use installed Google Chrome in headless mode. Start the dev server first. `test:motion` covers all four pages at widths 1440, 768, 390 and 360, plus reduced motion; screenshots and the result report are saved under `.artifacts/motion/` (gitignored). `TEST_WIDTH`, `TEST_ROUTES` (comma-separated) and `TEST_URL` can narrow the main suite.

`verify-scenes.mjs` checks scroll-driven gallery movement, fullscreen detail placement inside pinned scenes, Journey sizing across resizes, a mocked form submission, and client-side navigation. Its form response is intercepted locally: the test does not send email.

`verify-touch.mjs` uses a touch-enabled mobile context to verify coarse-pointer behavior, tapping cards and accordions, and modal placement.

`verify-refinements.mjs` checks one-chapter-at-a-time progression, sticky positioning, the progress rail, clickable chapters and fullscreen project details at desktop, short desktop, mobile and landscape sizes, plus the reduced-motion fallback.
