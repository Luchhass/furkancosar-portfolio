// Shared choreography. Components choose a family, never a local multiplier.
export const MOTION = Object.freeze({
  ease: "power3.out",
  reverseDuration: .26,
  miniTitle: { yPercent: -110, duration: .55, ease: "power3.out", force3D: false },
  titleSlide: { duration: .75, ease: "expo.out", force3D: false },
  reading: { duration: .86, wordStagger: .018, maxSpread: .84, hiddenOffset: 32, rotationX: 8, ease: "power3.out" },
  heading: { yPercent: 105, rotationX: -70, duration: .85, stagger: .022, lineGap: .14 },
  detail: { y: 32, duration: .8, stagger: .1 },
  line: { yPercent: 112, duration: .78, ease: "power4.out", stagger: .075 },
  slide: { x: -120, duration: .9, ease: "expo.out" },
  maskedSlidePercent: 115,
  card: { imageScale: 1.08, imageDuration: 1.05, copyY: -22, copyDuration: .72, copyStagger: .11, copyStart: .38 },
  pop: { scale: .5, rotation: -80, duration: .8, stagger: .07, ease: "back.out(1.5)" },
  pointer: { duration: .7, ease: "power3.out" },
  letterBounce: { heightRatio: .065, minHeight: 5, maxHeight: 16, rise: .18, fall: .28, settle: .2, reboundRatio: .08 },
  magnet: { radius: 360, strength: .42, falloff: 1.25, maxX: 28, maxY: 22 },
  tilt: { x: 12, y: 10 },
  cardTilt: { x: .108, y: .122 },
  scrub: 1,
  progressScrub: .3,
  scrollTo: { duration: 1, ease: "power3.inOut" },
  counterDuration: 1.9,
  marqueeDuration: 44,
  marqueeVelocityDivisor: 700,
  marqueeMaxBoost: 4,
  orbitDuration: 80,
  idle: { duration: 3, stagger: .5, ease: "sine.inOut" },
  rings: { travelRatio: .62, travelMax: 540, sidewaysRatio: .28, sidewaysMax: 360, duration: .78, ease: "power3.inOut" },
  ringPaths: [[.45, 1, -1, -1], [-1, -.6, .5, .7], [-.4, .55, .6, -.6], [-.7, .65, .35, -.65], [.6, -.3, -.45, .4], [-.3, .3, .8, -.25], [.3, -.6, -.4, .55], [-.7, .25, .3, -.4], [.5, .6, -.5, -.2]],
});

export const headingFrom = () => ({ yPercent: MOTION.heading.yPercent, rotationX: MOTION.heading.rotationX, opacity: 0, transformOrigin: "50% 100%" });
export const headingTo = () => ({ duration: MOTION.heading.duration, stagger: MOTION.heading.stagger, ease: MOTION.ease });
export const detailFrom = () => ({ y: MOTION.detail.y, opacity: 0 });
export const detailTo = () => ({ duration: MOTION.detail.duration, stagger: MOTION.detail.stagger, ease: MOTION.ease });
export const titleSlideFrom = (fromRight = false) => ({ xPercent: fromRight ? MOTION.maskedSlidePercent : -MOTION.maskedSlidePercent });
export const titleSlideTo = () => ({ ...MOTION.titleSlide, xPercent: 0 });
