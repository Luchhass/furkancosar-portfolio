# Performance work — 12 November 2026

The artwork, breakpoints, scroll choreography, pointer trail, colors and interactions are retained. This work reduces rendering and allocation costs rather than lowering the canvas resolution, removing effects or imposing a lower desktop frame-rate cap.

## Findings

- Hero interaction cleared two full-screen canvas surfaces and copied the entire static grid on every frame, even with a stationary pointer.
- Each trail point recreated a radial gradient every frame. Active cells allocated temporary maps, geometry arrays and transform objects repeatedly.
- Offscreen sections continued running CSS gradients and SVG animations. The home page had 81 running CSS animations while the hero was visible.
- Counter reels rendered every intermediate integer. The About page had 754 digit frames; a larger GitHub count would grow this further. Some tall reels also requested permanent compositor layers.
- Shared pointer handlers updated an invisible custom cursor and created new magnetic-button tweens repeatedly.

## Changes

### Hero canvas

The original static artwork remains pre-rendered. A frame restores only the previous deformation bounds, then draws the currently affected cells. Lighting also clears and composites only its affected region. Stationary cell geometry is reused while the color animation continues.

One bounded light-mask bitmap is reused for the original radial falloff. It replaces per-point, per-frame radial-gradient creation. Active-cell records and typed generation flags are reused; the six-point cell geometry is calculated without temporary vertex arrays. Existing cell count, trail length, glow radius, shadows and pixel-density limits remain intact.

Canvas dimensions come from layout dimensions, not the scroll-scaled bounding rectangle. A scroll transform therefore cannot accidentally enlarge the backing store. Interaction pauses outside the hero and in hidden tabs; all canvas backing stores are explicitly released when the component is cleaned up.

### Other animation work

CSS and SVG animation in offscreen sections pauses through IntersectionObserver and resumes on return. Invisible hover fills are paused. Split headings no longer run a background-position animation on an element that has no background image; redundant character transforms are cleared after their entrance completes.

Digit reels contain at most 11 frames per column and roll modulo 10, retaining the original carry animation and final values. Temporary `will-change` is removed after counting.

Shared pointer work is batched to one update per animation frame. Hidden custom-cursor movement is skipped. Magnetic controls reuse quick tweens while hovered, and their tweens and pending frames are cleaned up on route changes.

Responsive animation subscriptions share one native media-query listener per distinct query. Each component still owns a GSAP context; it is reverted when its conditions change. The final subscriber explicitly removes the native listener. This fixes the recorded growth of 96 event listeners per four-page navigation cycle: after the change the total remains at 770 across all three cycles.

The old mobile canvas render gap (which effectively limited a 60Hz screen to about 30 canvas updates per second) has been removed. Pointer intensity now uses elapsed time, so its easing duration is preserved across refresh rates rather than depending on the number of rendered frames.

## Recorded comparison

Same machine, headless Chrome 157.0.8103.52, 1440×900, development server, no CPU throttling. Both recordings use the same scripted pointer path and scroll sequence, with Canvas2D call instrumentation. These are single-run diagnostic results, not a guarantee of the same FPS on every device. Browser automation and development mode add overhead.

| Measurement | Before | After |
| --- | ---: | ---: |
| Hero, moving pointer: average frame interval | 52.72 ms | 37.13 ms |
| Equivalent sampled frame rate | 19.0 FPS | 26.9 FPS |
| Hero, stationary pointer: average frame interval | 36.37 ms | 16.81 ms |
| Equivalent sampled frame rate | 27.5 FPS | 59.5 FPS |
| Hero, idle: p95 frame interval | 33.4 ms | 16.8 ms |
| Scroll exit: average frame interval | 40.17 ms | 32.29 ms |
| Running CSS animations with hero visible | 81 | 22 |
| About page live DOM elements | 1,740 | 1,048 |
| About page counter frames | 754 | 62 |
| About page JS heap after explicit GC | 11.67 MiB | 10.92 MiB |

The table uses the final saved `before.json` and `after.json` recordings. An earlier optimized recording reached 33.3 FPS on the moving-pointer scenario; the final recording reached 26.9 FPS versus the original 19.0 FPS (about 42% higher). This heavy scenario still does not sustain 60 FPS in this headless development environment. The heap change is modest; the larger gains are reduced paint work, fewer DOM elements and bounded counter/compositor surfaces. Network cache usage is not the cause measured here.

In a separate 390×844 mobile touch recording, the held-pointer lighting rendered 133 frames in 2,216.5 ms, approximately 60 canvas updates per second. This measures the canvas update rate in mobile emulation, not physical-phone performance.

The production build was also checked across 12 client-side navigations (Home → About → Projects → Contact → Home, three rounds). Event listeners stayed at 452 in every sample, with one document and 1,250 DOM nodes. Old hero canvas backing stores were zero-sized immediately on unmount. Post-GC JS heap samples were 7.82, 8.32 and 8.67 MiB; this short run does not prove all retained memory is bounded, but the previously measured native-listener accumulation is gone. JS heap figures exclude canvas/GPU allocations and browser/network caches.

The idle hero cell canvas has the identical pre/post SHA-256 hash:

`8377e4873f90141b6b868ac03a0c02c8d038c7246dbc3ce0f1a7a93aa8220272`

Pixel-exact restoration after pointer interaction is checked at device pixel ratios 1 and 2. The cached glow is a rasterized version of the same radial falloff; gradient sampling during interaction is not claimed to be pixel-identical to the former live-gradient renderer.

## Reproducing checks

Start the dev server, then run:

```sh
node scripts/profile-performance.mjs current
node scripts/verify-performance.mjs
node scripts/verify-resource-lifecycle.mjs
node scripts/profile-mobile.mjs
npm run test:motion
npm run lint
npm run build
```

Raw performance JSON is under `.artifacts/performance/`. `verify-performance` compares the saved before/after artwork and verifies pointer reaction, stationary-geometry reuse, trail clearing, offscreen pausing and correct counter values. The lifecycle script checks that old canvas buffers are released across 12 client-side navigations and records post-GC heap/DOM/listener samples. Profiling should run without a simultaneous build or second browser benchmark.

These changes follow the browser guidance on [reusing pre-rendered canvas primitives](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) and [avoiding unnecessary paint and permanent compositor layers](https://web.dev/articles/animations-guide).
