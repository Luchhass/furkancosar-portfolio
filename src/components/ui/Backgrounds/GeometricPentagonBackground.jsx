"use client";

import { useEffect, useRef } from "react";

const DEVELOPER_COLORS = [
  "#6768ff",
  "#884cff",
  "#a53cdd",
  "#cf3d9f",
  "#ee4b67",
  "#cf3d9f",
  "#884cff",
  "#6768ff",
];

const CELL_SIZE_RATIO = 0.0375;
const CELL_HEIGHT_RATIO = 1.15;
const X_STEP_RATIO = 1.01;
const Y_STEP_RATIO = 0.758;
const DEFAULT_SCALE = 0.982;
const HOVER_RADIUS = 92;

const MAX_DPR = 1.35;
const MOBILE_MAX_DPR = 1;

const TRAIL_LIFETIME = 1500;
const MOBILE_TRAIL_LIFETIME = 950;

const TRAIL_MAX_POINTS = 36;
const MOBILE_TRAIL_MAX_POINTS = 18;

const TRAIL_SPACING = 20;
const MOBILE_TRAIL_SPACING = 30;

const DESKTOP_FRAME_GAP = 0;
const MOBILE_FRAME_GAP = 28;

const HERO_FLOW_DURATION = 15000;
const HERO_FLOW_GRADIENT_SIZE = 2.6;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smoothStep(value) {
  return value * value * (3 - 2 * value);
}

function easeInOut(value) {
  return 0.5 - Math.cos(value * Math.PI) / 2;
}

function hoverFalloff(value) {
  return Math.pow(smoothStep(value), 1.45);
}

function cellNoise(row, column, salt = 0) {
  const value = Math.sin(
    (row + 1) * 127.1 + (column + 1) * 311.7 + salt * 74.7,
  );

  return value - Math.floor(value);
}

function createHeroFlowGradient(ctx, width, now) {
  const cycle = (now % HERO_FLOW_DURATION) / HERO_FLOW_DURATION;
  const mirrored = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
  const progress = easeInOut(mirrored);
  const gradientWidth = width * HERO_FLOW_GRADIENT_SIZE;
  const start = -progress * (gradientWidth - width);
  const gradient = ctx.createLinearGradient(start, 0, start + gradientWidth, 0);
  const lastIndex = DEVELOPER_COLORS.length - 1;

  DEVELOPER_COLORS.forEach((color, index) => {
    gradient.addColorStop(index / lastIndex, color);
  });

  return gradient;
}

function drawCellPath(ctx, cell, scale = DEFAULT_SCALE) {
  const halfWidth = (cell.width * scale) / 2;
  const halfHeight = (cell.height * scale) / 2;
  const x = cell.x;
  const y = cell.y;

  ctx.beginPath();
  ctx.moveTo(x, y - halfHeight);
  ctx.lineTo(x + halfWidth, y - halfHeight * 0.5);
  ctx.lineTo(x + halfWidth, y + halfHeight * 0.5);
  ctx.lineTo(x, y + halfHeight);
  ctx.lineTo(x - halfWidth, y + halfHeight * 0.5);
  ctx.lineTo(x - halfWidth, y - halfHeight * 0.5);
  ctx.closePath();
}

function drawSlimeBridge(ctx, cell, pointerX, pointerY, strength) {
  const deltaX = pointerX - cell.x;
  const deltaY = pointerY - cell.y;
  const distance = Math.max(Math.hypot(deltaX, deltaY), 1);
  const unitX = deltaX / distance;
  const unitY = deltaY / distance;
  const localStrength = Math.pow(strength, 1.08);

  const halfWidth = cell.width * (0.14 + localStrength * 0.6);
  const halfHeight = cell.height * (0.04 + localStrength * 0.34);

  const centerX =
    cell.x + unitX * cell.width * (0.22 + localStrength * 0.34);
  const centerY =
    cell.y + unitY * cell.height * (0.22 + localStrength * 0.34);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(Math.atan2(unitY, unitX));
  ctx.beginPath();
  ctx.ellipse(0, 0, halfWidth, halfHeight, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCell(ctx, cell, transform) {
  const x = cell.x + (transform?.x ?? 0);
  const y = cell.y + (transform?.y ?? 0);
  const scale = transform?.scale ?? DEFAULT_SCALE;
  const rotation = transform?.rotation ?? 0;
  const brightness = transform?.brightness ?? 1;
  const depth = transform?.depth ?? 0;
  const fold = transform?.fold ?? 0;
  const foldX = transform?.foldX ?? 0;
  const foldY = transform?.foldY ?? 0;

  const halfWidth = (cell.width * scale) / 2;
  const halfHeight = (cell.height * scale) / 2;
  const shade = cell.shade;

  const gradient = ctx.createLinearGradient(
    -halfWidth,
    -halfHeight,
    halfWidth,
    halfHeight,
  );

  gradient.addColorStop(0, `rgb(${shade + 24} ${shade + 24} ${shade + 25})`);
  gradient.addColorStop(
    0.48,
    `rgb(${shade + 10} ${shade + 10} ${shade + 12})`,
  );
  gradient.addColorStop(1, `rgb(${shade} ${shade} ${shade + 2})`);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  const points = [
    [0, -halfHeight],
    [halfWidth, -halfHeight * 0.5],
    [halfWidth, halfHeight * 0.5],
    [0, halfHeight],
    [-halfWidth, halfHeight * 0.5],
    [-halfWidth, -halfHeight * 0.5],
  ].map(([pointX, pointY]) => {
    if (fold <= 0) {
      return [pointX, pointY];
    }

    const directionalDot =
      (pointX * foldX + pointY * foldY) / Math.max(halfWidth, halfHeight);

    const sideStrength = smoothStep(
      clamp((directionalDot + 0.18) / 1.18, 0, 1),
    );

    const tuck = sideStrength * fold * cell.width * 0.32;

    return [pointX - foldX * tuck, pointY - foldY * tuck];
  });

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  points.slice(1).forEach(([pointX, pointY]) => {
    ctx.lineTo(pointX, pointY);
  });

  ctx.closePath();

  ctx.shadowColor = `rgba(0,0,0,${0.34 + depth * 0.32})`;
  ctx.shadowBlur = depth > 0 ? 5 + depth * 16 : 0;
  ctx.shadowOffsetX = depth > 0 ? -foldX * (1 + depth * 5) : 0;
  ctx.shadowOffsetY = depth > 0 ? -foldY * (1 + depth * 5) + depth * 2 : 0;

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = `rgba(255,255,255,${0.04 * brightness + depth * 0.045})`;
  ctx.lineWidth = 0.65 + depth * 0.45;
  ctx.stroke();

  if (depth > 0.02) {
    ctx.globalAlpha = depth * 0.14;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function buildCells(width, height) {
  const cellWidth = clamp(width * CELL_SIZE_RATIO, 42, 65);
  const cellHeight = cellWidth * CELL_HEIGHT_RATIO;
  const xStep = cellWidth * X_STEP_RATIO;
  const yStep = cellHeight * Y_STEP_RATIO;
  const columns = Math.ceil(width / xStep) + 6;
  const rows = Math.ceil(height / yStep) + 6;
  const offsetX = -cellWidth * 1.35;
  const offsetY = -cellHeight * 1.25;
  const cells = [];

  for (let row = 0; row < rows; row += 1) {
    const rowOffset = row % 2 === 0 ? 0 : xStep * 0.5;

    for (let column = 0; column < columns; column += 1) {
      const shade = 4 + Math.floor(cellNoise(row, column) * 24);

      cells.push({
        column,
        height: cellHeight,
        row,
        shade,
        width: cellWidth,
        x: offsetX + column * xStep + rowOffset + cellWidth * 0.5,
        y: offsetY + row * yStep + cellHeight * 0.5,
      });
    }
  }

  return {
    cells,
    columns,
    rows,
    metrics: {
      cellHeight,
      cellWidth,
      offsetX,
      offsetY,
      radius: Math.max(HOVER_RADIUS, Math.min(width, height) * 0.085),
      rowOffset: xStep * 0.5,
      xStep,
      yStep,
    },
  };
}

function resizeCanvas(canvas, width, height, dpr) {
  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

export function GeometricPentagonBackground() {
  const rootRef = useRef(null);
  const gradientCanvasRef = useRef(null);
  const cellCanvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const gradientCanvas = gradientCanvasRef.current;
    const cellCanvas = cellCanvasRef.current;

    if (!root || !gradientCanvas || !cellCanvas) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const isTouchDevice = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    ).matches;

    const shouldUseInteraction = !prefersReducedMotion;
    const maxDpr = isTouchDevice ? MOBILE_MAX_DPR : MAX_DPR;
    const frameGap = isTouchDevice ? MOBILE_FRAME_GAP : DESKTOP_FRAME_GAP;
    const trailLifetime = isTouchDevice
      ? MOBILE_TRAIL_LIFETIME
      : TRAIL_LIFETIME;
    const trailMaxPoints = isTouchDevice
      ? MOBILE_TRAIL_MAX_POINTS
      : TRAIL_MAX_POINTS;
    const trailSpacing = isTouchDevice ? MOBILE_TRAIL_SPACING : TRAIL_SPACING;

    const gradientCtx = gradientCanvas.getContext("2d");
    const cellCtx = cellCanvas.getContext("2d");
    const staticCanvas = document.createElement("canvas");
    const staticCtx = staticCanvas.getContext("2d");

    if (!gradientCtx || !cellCtx || !staticCtx) {
      return undefined;
    }

    let scene = null;
    let rootRect = root.getBoundingClientRect();
    let frameId = 0;
    let pointerFrameId = 0;
    let resizeFrameId = 0;
    let rectFrameId = 0;
    let isVisible = true;
    let pendingPointer = null;
    let lastTrailPoint = null;
    let trail = [];
    let lastDrawAt = 0;

    const pointer = {
      intensity: 0,
      targetIntensity: 0,
      targetX: 0.5,
      targetY: 0.46,
      x: 0.5,
      y: 0.46,
    };

    function clearCanvas(ctx, canvas) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawStaticLayer() {
      if (!scene) return;

      clearCanvas(staticCtx, staticCanvas);
      staticCtx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);

      scene.cells.forEach((cell) => {
        drawCell(staticCtx, cell);
      });
    }

    function drawBaseLayer() {
      if (!scene) return;

      clearCanvas(gradientCtx, gradientCanvas);
      clearCanvas(cellCtx, cellCanvas);

      cellCtx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
      cellCtx.drawImage(staticCanvas, 0, 0, scene.width, scene.height);
    }

    function getActiveCells(sources) {
      if (!scene) return [];

      const { columns, metrics } = scene;
      const activeCells = new Map();

      sources.forEach((source) => {
        const radius = metrics.radius * source.radiusScale;

        const minRow = clamp(
          Math.floor((source.y - radius - metrics.offsetY) / metrics.yStep) -
            2,
          0,
          scene.rows - 1,
        );

        const maxRow = clamp(
          Math.ceil((source.y + radius - metrics.offsetY) / metrics.yStep) + 2,
          0,
          scene.rows - 1,
        );

        for (let row = minRow; row <= maxRow; row += 1) {
          const rowOffset = row % 2 === 0 ? 0 : metrics.rowOffset;

          const minColumn = clamp(
            Math.floor(
              (source.x - radius - metrics.offsetX - rowOffset) /
                metrics.xStep,
            ) - 2,
            0,
            columns - 1,
          );

          const maxColumn = clamp(
            Math.ceil(
              (source.x + radius - metrics.offsetX - rowOffset) /
                metrics.xStep,
            ) + 2,
            0,
            columns - 1,
          );

          for (let column = minColumn; column <= maxColumn; column += 1) {
            const index = row * columns + column;
            const cell = scene.cells[index];

            if (!cell) continue;

            const deltaX = source.x - cell.x;
            const deltaY = source.y - cell.y;
            const distance = Math.hypot(deltaX, deltaY);
            const rawProximity = Math.max(0, 1 - distance / radius);

            if (rawProximity <= 0.035) continue;

            const influence = hoverFalloff(rawProximity) * source.strength;
            const current = activeCells.get(index);

            if (current && current.proximity >= influence) {
              current.proximity = clamp(
                current.proximity + influence * 0.42,
                0,
                1,
              );
              continue;
            }

            const unitX = deltaX / Math.max(distance, 1);
            const unitY = deltaY / Math.max(distance, 1);

            activeCells.set(index, {
              cell,
              foldX: unitX,
              foldY: unitY,
              proximity: current
                ? clamp(influence + current.proximity * 0.42, 0, 1)
                : influence,
              sourceX: source.x,
              sourceY: source.y,
            });
          }
        }
      });

      return Array.from(activeCells.values()).map((item) => {
        const lift = Math.pow(clamp(item.proximity, 0, 1), 0.92);

        return {
          brightness: 1 + lift * 0.14,
          cell: item.cell,
          depth: lift,
          fold: lift * 1.18,
          foldX: item.foldX,
          foldY: item.foldY,
          proximity: item.proximity,
          rotation: clamp(
            (item.foldX - item.foldY) * lift * 0.009,
            -0.009,
            0.009,
          ),
          scale: DEFAULT_SCALE + lift * 0.012,
          sourceX: item.sourceX,
          sourceY: item.sourceY,
          x: 0,
          y: 0,
        };
      });
    }

    function drawGradientLayer(now, sources) {
      if (!scene) return;

      clearCanvas(gradientCtx, gradientCanvas);

      if (sources.length === 0) {
        return;
      }

      gradientCtx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
      gradientCtx.globalCompositeOperation = "source-over";

      sources.forEach((source) => {
        const strength = clamp(source.gradientStrength ?? source.strength, 0, 1);

        if (strength <= 0.006) return;

        const radius =
          Math.min(280, Math.max(145, scene.width * 0.155)) *
          (source.radiusScale ?? 1);

        const mask = gradientCtx.createRadialGradient(
          source.x,
          source.y,
          0,
          source.x,
          source.y,
          radius,
        );

        mask.addColorStop(0, `rgba(255,255,255,${0.98 * strength})`);
        mask.addColorStop(0.34, `rgba(255,255,255,${0.82 * strength})`);
        mask.addColorStop(0.68, `rgba(255,255,255,${0.22 * strength})`);
        mask.addColorStop(1, "rgba(255,255,255,0)");

        gradientCtx.fillStyle = mask;
        gradientCtx.fillRect(
          source.x - radius,
          source.y - radius,
          radius * 2,
          radius * 2,
        );
      });

      gradientCtx.globalCompositeOperation = "source-in";
      gradientCtx.fillStyle = createHeroFlowGradient(
        gradientCtx,
        scene.width,
        now,
      );
      gradientCtx.fillRect(0, 0, scene.width, scene.height);
      gradientCtx.globalCompositeOperation = "source-over";
    }

    function drawFrame(now = performance.now()) {
      frameId = 0;

      if (!scene || !isVisible || !shouldUseInteraction) {
        return;
      }

      if (frameGap > 0 && now - lastDrawAt < frameGap) {
        frameId = requestAnimationFrame(drawFrame);
        return;
      }

      lastDrawAt = now;

      const deltaX = pointer.targetX - pointer.x;
      const deltaY = pointer.targetY - pointer.y;
      const deltaIntensity = pointer.targetIntensity - pointer.intensity;

      pointer.x += deltaX * 0.16;
      pointer.y += deltaY * 0.16;
      pointer.intensity += deltaIntensity * 0.14;

      trail = trail.filter((point) => now - point.createdAt < trailLifetime);

      const sources = [];

      if (pointer.intensity > 0.01) {
        sources.push({
          gradientStrength: pointer.intensity,
          radiusScale: 1,
          strength: pointer.intensity,
          x: pointer.x * scene.width,
          y: pointer.y * scene.height,
        });
      }

      trail.forEach((point) => {
        const age = now - point.createdAt;
        const life = clamp(1 - age / trailLifetime, 0, 1);
        const trailStrength = Math.pow(smoothStep(life), 0.72);

        if (trailStrength <= 0.008) return;

        sources.push({
          gradientStrength: trailStrength * 0.78,
          radiusScale: 0.78 + trailStrength * 0.14,
          strength: trailStrength * 0.68,
          x: point.x * scene.width,
          y: point.y * scene.height,
        });
      });

      const activeCells = sources.length > 0 ? getActiveCells(sources) : [];

      drawGradientLayer(now, sources);

      clearCanvas(cellCtx, cellCanvas);
      cellCtx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
      cellCtx.drawImage(staticCanvas, 0, 0, scene.width, scene.height);

      if (activeCells.length > 0) {
        cellCtx.save();
        cellCtx.globalCompositeOperation = "destination-out";

        activeCells.forEach(({ cell, depth, sourceX, sourceY }) => {
          drawCellPath(cellCtx, cell, DEFAULT_SCALE + 0.006 + depth * 0.13);
          cellCtx.fill();
          drawSlimeBridge(cellCtx, cell, sourceX, sourceY, depth);
        });

        cellCtx.restore();

        activeCells.forEach(
          ({
            brightness,
            cell,
            depth,
            fold,
            foldX,
            foldY,
            rotation,
            scale,
            x,
            y,
          }) => {
            drawCell(cellCtx, cell, {
              brightness,
              depth,
              fold,
              foldX,
              foldY,
              rotation,
              scale,
              x,
              y,
            });
          },
        );
      }

      const shouldContinue =
        pointer.intensity > 0.002 ||
        pointer.targetIntensity > 0 ||
        trail.length > 0 ||
        Math.abs(deltaX) > 0.0008 ||
        Math.abs(deltaY) > 0.0008;

      if (shouldContinue) {
        frameId = requestAnimationFrame(drawFrame);
      }
    }

    function requestFrame() {
      if (!frameId && shouldUseInteraction) {
        frameId = requestAnimationFrame(drawFrame);
      }
    }

    function resize() {
      rootRect = root.getBoundingClientRect();

      const width = Math.max(1, rootRect.width);
      const height = Math.max(1, rootRect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const built = buildCells(width, height);

      resizeCanvas(gradientCanvas, width, height, dpr);
      resizeCanvas(cellCanvas, width, height, dpr);
      resizeCanvas(staticCanvas, width, height, dpr);

      scene = {
        ...built,
        dpr,
        height,
        width,
      };

      drawStaticLayer();
      drawBaseLayer();
      requestFrame();
    }

    function scheduleResize() {
      if (resizeFrameId) return;

      resizeFrameId = requestAnimationFrame(() => {
        resizeFrameId = 0;
        resize();
      });
    }

    function scheduleRootRectUpdate() {
      if (rectFrameId) return;

      rectFrameId = requestAnimationFrame(() => {
        rectFrameId = 0;
        rootRect = root.getBoundingClientRect();
      });
    }

    function deactivatePointer() {
      pointer.targetIntensity = 0;
      lastTrailPoint = null;
      pendingPointer = null;
      requestFrame();
    }

    function updateInteraction(clientX, clientY) {
      if (!scene || !shouldUseInteraction) return;

      if (rootRect.width <= 0 || rootRect.height <= 0) {
        deactivatePointer();
        return;
      }

      const isInsideHero =
        clientX >= rootRect.left &&
        clientX <= rootRect.right &&
        clientY >= rootRect.top &&
        clientY <= rootRect.bottom;

      if (!isInsideHero) {
        deactivatePointer();
        return;
      }

      const nextX = clamp((clientX - rootRect.left) / rootRect.width, 0, 1);
      const nextY = clamp((clientY - rootRect.top) / rootRect.height, 0, 1);

      const shouldSnap =
        pointer.targetIntensity === 0 && pointer.intensity < 0.03;

      const now = performance.now();

      const trailDistance = lastTrailPoint
        ? Math.hypot(
            (nextX - lastTrailPoint.x) * rootRect.width,
            (nextY - lastTrailPoint.y) * rootRect.height,
          )
        : Infinity;

      pointer.targetIntensity = 1;
      pointer.targetX = nextX;
      pointer.targetY = nextY;
      pointer.x = shouldSnap ? nextX : pointer.x;
      pointer.y = shouldSnap ? nextY : pointer.y;

      if (
        trailDistance >= trailSpacing ||
        now - (lastTrailPoint?.createdAt ?? 0) > 90
      ) {
        const nextTrailPoint = {
          createdAt: now,
          x: nextX,
          y: nextY,
        };

        trail.push(nextTrailPoint);

        if (trail.length > trailMaxPoints) {
          trail.shift();
        }

        lastTrailPoint = nextTrailPoint;
      }

      requestFrame();
    }

    function scheduleInteraction(clientX, clientY) {
      pendingPointer = { clientX, clientY };

      if (pointerFrameId) return;

      pointerFrameId = requestAnimationFrame(() => {
        const nextPointer = pendingPointer;

        pointerFrameId = 0;
        pendingPointer = null;

        if (!nextPointer) return;

        updateInteraction(nextPointer.clientX, nextPointer.clientY);
      });
    }

    function handlePointerMove(event) {
      scheduleInteraction(event.clientX, event.clientY);
    }

    function handlePointerLeave() {
      deactivatePointer();
    }

    function handlePageShow() {
      scheduleResize();
      scheduleRootRectUpdate();
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        deactivatePointer();
      }
    }

    const resizeObserver = new ResizeObserver(scheduleResize);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
          scheduleResize();
          requestFrame();
          return;
        }

        deactivatePointer();
      },
      { rootMargin: "120px 0px" },
    );

    resizeObserver.observe(root);
    visibilityObserver.observe(root);

    if (shouldUseInteraction) {
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      window.addEventListener("pointerdown", handlePointerMove, {
        passive: true,
      });
      window.addEventListener("pointerup", handlePointerLeave, {
        passive: true,
      });
      window.addEventListener("pointercancel", handlePointerLeave, {
        passive: true,
      });
    }

    window.addEventListener("resize", scheduleResize);
    window.addEventListener("orientationchange", scheduleResize);
    window.addEventListener("scroll", scheduleRootRectUpdate, {
      passive: true,
    });
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("blur", deactivatePointer);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    resize();

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      if (shouldUseInteraction) {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerdown", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerLeave);
        window.removeEventListener("pointercancel", handlePointerLeave);
      }

      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("orientationchange", scheduleResize);
      window.removeEventListener("scroll", scheduleRootRectUpdate);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("blur", deactivatePointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (frameId) cancelAnimationFrame(frameId);
      if (pointerFrameId) cancelAnimationFrame(pointerFrameId);
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
      if (rectFrameId) cancelAnimationFrame(rectFrameId);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#050505]"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.04),transparent_34%),linear-gradient(180deg,#070707_0%,#030303_56%,#050505_100%)]" />

      <canvas
        ref={gradientCanvasRef}
        className="absolute inset-0 z-10 h-full w-full"
      />

      <canvas
        ref={cellCanvasRef}
        className="absolute inset-0 z-20 h-full w-full"
      />

      <div className="absolute inset-0 z-30 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(5,5,5,0.1)_54%,rgba(3,3,3,0.64)_100%)]" />
    </div>
  );
}