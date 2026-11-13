# UI / UX layout system

The four families share the measurements in `src/app/ui.css`. Palettes, background artwork and animation behavior remain in their existing components and motion styles.

## 1. Heroes

Home, About, Projects and Contact use `Hero.jsx`: identical outer gutters, title scale, title line height, description rhythm, action height and scroll-cue alignment. The existing short-viewport and mobile title variants remain explicit.

## 2. Main sections

`ui-section` owns outer padding. `ui-section-grid` centers the main content between matching left and right rails; the small label occupies the left rail outside that content. Both edges of the main content have the same viewport inset: gutter + rail + column gap. On mobile the label stacks above the content and both edges use the page gutter. `ui-section-body`, `ui-section-title`, `ui-section-copy` and `ui-section-content` own the internal hierarchy. Avoid nesting another label rail inside the main content.

Applied to:

- Home About accordion: added a small About label and introductory sentence; heading, paragraph and accordion copy share one start line. Row icons occupy the label rail on desktop and the right edge on mobile.
- About introduction: same label/content grid and body typography. Stay Curious follows the content at the bottom right, so it cannot overlap long copy on narrow screens.
- Tools accordion: same composition and row typography as Home About.
- Projects Showcase introduction: common heading, copy, count spacing and label rail.
- Selected Work: same centered grid. Cards choose their column count from the available content width. Search and category controls keep their behavior and have at least 44px targets.
- Home Highlights: same label/content guide and card design as the project archive.
- GitHub Statistics: same title/copy hierarchy and centered content width. Stat values scale to their own cell width, with stacked cells below 1280px so language names remain readable.
- Contact: label rail plus a content split; title, description and magnetic notes align. The form uses 44px input/select targets and 16px input text. Submission, progress and confirmation behavior stay local.
- Journey: its label, heading, slides and progress controls align with the shared rail. Its sticky presentation, chapter changes and navigation remain intact.
- Collaboration CTA: a centered variant using the shared title, paragraph, gaps and action sizing.

Content splits become two columns at 1280px. Below that, content and decorative artwork stack without squeezing the text.

## 3. Mini and helper components

- Filled and outlined marquees share vertical padding, word scale, separator scale and spacing. Fill, arrow/star identity, direction and animation stay independent.
- Identity band uses the same page gutter.
- Gradient actions and the contact submit action share a 56px height and 12px bold label; their existing fills, borders and dot choices remain unchanged.
- Fullscreen project details use an explicit 44px compact action variant to retain the viewport-bound layout.
- Project cards share body padding, heading line height and description typography across Highlights and Selected Work.
- Keyboard focus has a common current-color outline. Form, search, accordion, chapter and navigation controls retain their existing interactions.

## 4. Header, footer and hamburger menu

All three share outer gutters and chrome spacing. The header has 44px control/masking cells. Footer and menu use the same navigation weight/tracking, contact typography, 44px social controls and social gaps. Display menu navigation and compact footer navigation are explicit size variants.

Menu opening/closing, footer scroll animation, white menu tones, dark footer tones, ring artwork and social hover effects remain unchanged. Mobile contact lines stack without a stray separator.

## Measurements

| Token | Mobile | 768–1023px | 1024px+ |
| --- | --- | --- | --- |
| Page gutter | 32px | 40px | 64px |
| Label rail | stacked | 120px | 160px |
| Rail gap | — | 24px | 24px |
| Main content inset, each edge | 32px | 184px | 248px |
| Section block padding | 80px | 96px | 128px |
| Content stack gap | 24px | 32px | 32px |
| Body copy | 14px / 1.5 | 16px / 1.5 | 16px / 1.5 |
| Chrome block padding | 24px | 32px | 48px |
| Standard action | 56px | 56px | 56px |
| Compact / minimum target | 44px | 44px | 44px |

Section titles use `clamp(40px, 7.8vw, 120px)`, weight 900, line height .9 and tracking -.04em. Heroes retain their viewport-height-aware scale. Sticky Journey and pinned Highlights have explicit stage title variants so their controls and cards fit the viewport; modal typography remains a separate compact variant.

## Validation

`node scripts/verify-ui-system.mjs` checks all four routes at 1440, 1024, 768, 390 and 360px: content/label starts, accordion alignment, heading overflow, outer gutters, button/input targets, menu bounds, accordion/form behavior and browser errors. It uses reduced motion to measure stable layout, with screenshots and a JSON report under `.artifacts/ui-system`.

`node scripts/verify-animation-system.mjs` separately checks normal-motion reveal/reverse cycles, project filtering/modal behavior, menu lifecycle, CTA/contact magnets and reduced-motion routes. No live contact message is sent by these checks.

`node scripts/verify-ui-stages.mjs` checks sticky Journey and Highlights at 1440×900, 1024×768, 390×844 and 844×390, including short landscape viewports. Screenshots and geometry reports are under `.artifacts/ui-system/stages`.
