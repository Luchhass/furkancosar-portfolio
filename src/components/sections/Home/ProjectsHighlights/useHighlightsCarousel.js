import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createMotionMedia } from "@/lib/motionMedia";
import { MOTION } from "@/lib/motionPresets";

gsap.registerPlugin(useGSAP, ScrollTrigger);

let desktopPointer;
function transformScroll() {
  return (desktopPointer ??= matchMedia("(hover: hover) and (pointer: fine)")).matches;
}

export default function useHighlightsCarousel(sectionRef) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const setTrackX = useRef(null);
  const scrollMotion = useRef({ base: 0, offset: 0, left: 0 });

  function maxScroll() {
    const viewport = viewportRef.current;
    const last = trackRef.current.lastElementChild;
    return last ? Math.max(0, last.offsetLeft + last.offsetWidth - viewport.clientWidth) : 0;
  }
  function syncOffset() {
    scrollMotion.current.offset = readScroll() - scrollMotion.current.base;
  }
  function readScroll() { return transformScroll() ? scrollMotion.current.left : viewportRef.current.scrollLeft; }
  function writeScroll(left, limit = maxScroll()) {
    const viewport = viewportRef.current;
    scrollMotion.current.left = gsap.utils.clamp(0, limit, left);
    if (transformScroll()) {
      const setX = (setTrackX.current ??= gsap.quickSetter(trackRef.current, "x", "px"));
      setX(-scrollMotion.current.left);
    } else {
      viewport.scrollLeft = scrollMotion.current.left;
    }
  }

  useGSAP(() => {
    const root = sectionRef.current;
    const track = trackRef.current;
    const media = createMotionMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () =>
      () => {
        setTrackX.current = null;
        gsap.set(track, { clearProps: "transform" });
      });
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const motion = { progress: 0 };
      let limit = maxScroll();
      const render = () => {
        const state = scrollMotion.current;
        // Reveal starts at 15% visibility; travel follows once a third is visible.
        state.base = limit * motion.progress;
        if (!drag.current?.moved) writeScroll(state.base + state.offset, limit);
      };
      const measure = () => {
        limit = maxScroll();
        render();
      };
      gsap.to(motion, { progress: 1, ease: "none", scrollTrigger: {
        trigger: track.firstElementChild, start: "33% bottom",
        endTrigger: root, end: "bottom top", scrub: MOTION.scrub, invalidateOnRefresh: true,
        onRefresh: measure,
      }, onUpdate: render });
      const resize = new ResizeObserver(measure);
      resize.observe(viewportRef.current);
      return () => resize.disconnect();
    });
    return () => media.revert();
  }, { scope: sectionRef });

  function startDrag(event) {
    suppressClick.current = false;
    syncOffset();
    if (event.pointerType !== "mouse") { drag.current = { id: event.pointerId, native: true, moved: true }; return; }
    if (event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, left: readScroll(), moved: false };
  }
  function moveDrag(event) {
    const state = drag.current;
    if (!state || state.native || state.id !== event.pointerId) return;
    const dx = event.clientX - state.x;
    if (!state.moved && Math.abs(dx) > 7) {
      state.moved = true; suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = "true";
    }
    if (state.moved) {
      event.preventDefault();
      writeScroll(state.left - dx);
      syncOffset();
    }
  }
  function endDrag(event) {
    syncOffset();
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }


  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    writeScroll(readScroll() + direction * event.currentTarget.clientWidth);
    syncOffset();
  }

  function handleClick(event) {
    if (!suppressClick.current || event.detail === 0) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function releaseDrag(event) {
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
  }

  return {
    trackRef,
    viewportProps: {
      ref: viewportRef,
      onPointerDown: startDrag,
      onPointerMove: moveDrag,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onLostPointerCapture: releaseDrag,
      onTouchMove: syncOffset,
      onClickCapture: handleClick,
      onKeyDown: handleKeyDown,
    },
  };
}
