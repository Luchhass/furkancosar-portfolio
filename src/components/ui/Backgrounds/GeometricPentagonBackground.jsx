"use client";

import { useEffect, useRef } from "react";
import mountPentagonCanvas from "./mountPentagonCanvas";

export function GeometricPentagonBackground() {
  const root = useRef(null);
  const gradient = useRef(null);
  const cells = useRef(null);

  useEffect(() => mountPentagonCanvas(root.current, gradient.current, cells.current), []);

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#050505]">
      <canvas ref={gradient} className="absolute inset-0 z-10 h-full w-full" />
      <canvas ref={cells} className="absolute inset-0 z-20 h-full w-full" />
    </div>
  );
}
