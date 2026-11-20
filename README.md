# Furkan Cosar — Portfolio

Next.js App Router, React, Tailwind CSS and GSAP. Four routes: Home, About, Projects and Contact.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. Copy `.env.example` to `.env.local` for optional mail and GitHub credentials. Never commit local credentials.

## Motion architecture

- `Hero` renders the heading, cue and footer. `useHeroMotion` coordinates their entrances, perspective and scroll exit. The background mounts a canvas controller with separate drawing and deformation modules.
- `TitleLine`: whole-line 2D horizontal entrance inside a stable mask. Section titles enter from the left; hero/CTA title lines alternate sides. Pointer and scroll effects remain on separate layers.
- `ReadingText`: masked words enter downward in reading order using the original About paragraph's .86s power3.out motion. Stagger is bounded for long copy; there are no character masks or duplicate blur layers. Reduced motion renders ordinary text. Shared by hero/body/CTA, accordion, Journey and project descriptions.
- `ScrollReveal` / `repeatReveal`: typography and details enter at first visibility, reverse offscreen within .26s, and restart immediately on re-entry. Stable masks are observed separately rather than delaying all text behind a section timeline.
- `useSectionScene`: scoped rules, staggered rows, reading opacity and depth layers.
- `ProjectShelfCard` serves Highlights and the archive. `useShelfCardReveal` coordinates each card's vertical reveal and desktop tilt.
- `ProjectsHighlights` uses a scroll-linked horizontal track on desktop and supports touch swiping, pointer dragging and arrow keys.
- `ProjectDetailsModal`: opaque fullscreen body portal, card-origin preview entrance, animated close, readable scrollable content and keyboard focus containment.
- `AboutMeAccordion` uses a shared section reveal and animates each panel independently.
- `Journey`: CSS-sticky chapter presentation across viewport sizes. Scroll switches one chapter at a time; a continuous progress rail and clickable chapter controls expose the current position. Reduced motion uses normal document flow.
- The toolkit reads its groups from `src/data/toolkit.js`. Its scroll hook coordinates the pinned intro and alternating logo strips.
- `MarqueeText` / `ScrollMarqueeText`: velocity-sensitive looping type and scroll-filled outline type.
- `ContactForm` composes its field list, submission state and feedback. The client form and API share the same field normalization.
- `CollaborationCTA`, `IdentityBand`, navigation and footer: distinct typographic and geometric scenes.
- `MotionExperience` manages section scrolling and pauses offscreen decorative animations. `useLanguage` derives the locale from the current pathname, and `LanguageEffects` synchronizes the document language and cross-tab changes.

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
