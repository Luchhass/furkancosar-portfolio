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

// A full viewport canvas at native DPR is disproportionately expensive on
// high-density displays. The geometry is deliberately low-frequency, so this
// cap is visually indistinguishable while keeping the backing stores small.
const MAX_DPR = 1;
const MOBILE_MAX_DPR = 0.85;

const TRAIL_LIFETIME = 1100;
const MOBILE_TRAIL_LIFETIME = 950;

const TRAIL_MAX_POINTS = 64;
const MOBILE_TRAIL_MAX_POINTS = 48;

const TRAIL_SPACING = 14;
const MOBILE_TRAIL_SPACING = 14;
const TRAIL_HEAD_DEDUP_DISTANCE = 18;

const HERO_FLOW_DURATION = 15000;
const HERO_FLOW_GRADIENT_SIZE = 2.6;
const BURST = { travelSeconds: .9, settleSeconds: .34, displacement: 7, maxActive: 3 };

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

function settleSpring(state, key, target, elapsed, stiffness, damping, epsilon = .001) {
  const velocityKey = `${key}Velocity`;
  let value = state[key] ?? 0;
  let velocity = state[velocityKey] ?? 0;
  const steps = Math.max(1, Math.ceil(elapsed / .008));
  const dt = elapsed / steps;
  for (let step = 0; step < steps; step++) {
    velocity += ((target - value) * stiffness - velocity * damping) * dt;
    value += velocity * dt;
  }
  const settled = Math.abs(target - value) < epsilon && Math.abs(velocity) < epsilon * 5;
  state[key] = settled ? target : value;
  state[velocityKey] = settled ? 0 : velocity;
  return !settled;
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

function drawCell(ctx, cell, transform) {
  const x = cell.x + (transform?.x ?? 0) + (transform?.waveX ?? 0);
  const y = cell.y + (transform?.y ?? 0) + (transform?.waveY ?? 0);
  const scale = (transform?.scale ?? DEFAULT_SCALE) + (transform?.waveScale ?? 0);
  const rotation = (transform?.rotation ?? 0) + (transform?.waveRotation ?? 0);
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

  ctx.beginPath();
  for (let index = 0; index < 6; index += 1) {
    let pointX = index === 0 || index === 3 ? 0 : index < 3 ? halfWidth : -halfWidth;
    let pointY = index === 0 ? -halfHeight : index === 3 ? halfHeight : index === 1 || index === 5 ? -halfHeight * 0.5 : halfHeight * 0.5;
    if (fold > 0) {
      const directionalDot = (pointX * foldX + pointY * foldY) / Math.max(halfWidth, halfHeight);
      const tuck = smoothStep(clamp((directionalDot + 0.18) / 1.18, 0, 1)) * fold * cell.width * 0.32;
      pointX -= foldX * tuck;
      pointY -= foldY * tuck;
    }
    if (index === 0) ctx.moveTo(pointX, pointY);
    else ctx.lineTo(pointX, pointY);
  }
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
  const cellWidth = clamp(width * CELL_SIZE_RATIO, 42, 65) * Math.SQRT2;
  const cellHeight = cellWidth * CELL_HEIGHT_RATIO;
  const xStep = cellWidth * X_STEP_RATIO;
  const yStep = cellHeight * Y_STEP_RATIO;
  const columns = Math.ceil(width / xStep) + 4;
  const rows = Math.ceil(height / yStep) + 4;
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

    // Touch uses the same trail while pressed; releasing lets it settle.
    const shouldUseInteraction = !prefersReducedMotion;
    const maxDpr = isTouchDevice ? MOBILE_MAX_DPR : MAX_DPR;
    const smoothingFrameMs = isTouchDevice ? 1000 / 30 : 1000 / 60;
    const trailLifetime = isTouchDevice
      ? MOBILE_TRAIL_LIFETIME
      : TRAIL_LIFETIME;
    const trailMaxPoints = isTouchDevice
      ? MOBILE_TRAIL_MAX_POINTS
      : TRAIL_MAX_POINTS;
    const trailSpacing = isTouchDevice ? MOBILE_TRAIL_SPACING : TRAIL_SPACING;

    const contextOptions = { alpha: true, desynchronized: true };
    const gradientCtx = gradientCanvas.getContext("2d", contextOptions);
    const cellCtx = cellCanvas.getContext("2d", contextOptions);
    const staticCanvas = document.createElement("canvas");
    const staticCtx = staticCanvas.getContext("2d", contextOptions);
    const glowCanvas = document.createElement("canvas");
    const glowCtx = glowCanvas.getContext("2d", contextOptions);

    if (!gradientCtx || !cellCtx || !staticCtx || !glowCtx) {
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
    let isPageIntroActive = Boolean(window.__pageIntroActivePath);
    let lastCanvasWidth = 0;
    let lastCanvasHeight = 0;
    let lastCanvasDpr = 0;
    let previousCellBounds = null;
    let previousGradientBounds = null;
    let lastHeadX = NaN;
    let lastHeadY = NaN;
    let lastHeadIntensity = NaN;
    let lastHadTrail = true;
    let cellsSettling = false;
    let lastInput = null;
    let lastHeadEnergy = NaN;
    let bursts = [];
    let lastHadBurst = false;

    const pointer = {
      intensity: 0,
      speed: 0,
      energy: 0,
      directionX: 0,
      directionY: 0,
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

    function clipBounds(left, top, right, bottom) {
      const dpr = scene.dpr;
      const x = Math.max(0, Math.floor(left * dpr) / dpr);
      const y = Math.max(0, Math.floor(top * dpr) / dpr);
      return { x, y, width: Math.max(0, Math.min(scene.width, Math.ceil(right * dpr) / dpr) - x), height: Math.max(0, Math.min(scene.height, Math.ceil(bottom * dpr) / dpr) - y) };
    }

    function clearRegion(ctx, bounds) {
      if (!bounds) return;
      ctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
      ctx.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    function restoreCells() {
      if (!previousCellBounds) return;
      // Restore only last frame's deformed cells; the rest of the grid is intact.
      const { x, y, width, height } = previousCellBounds;
      clearRegion(cellCtx, previousCellBounds);
      const scaleX = staticCanvas.width / scene.width;
      const scaleY = staticCanvas.height / scene.height;
      cellCtx.drawImage(staticCanvas, x * scaleX, y * scaleY, width * scaleX, height * scaleY, x, y, width, height);
      previousCellBounds = null;
    }

    function drawStaticLayer() {
      if (!scene) return;

      clearCanvas(staticCtx, staticCanvas);
      staticCtx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);

      scene.cells.forEach((cell) => {
        drawCell(staticCtx, cell);
      });
    }

    function cacheGlowMask() {
      // All trail lights share this falloff. Scale/alpha reuse one bounded bitmap.
      const radius = Math.min(280, Math.max(145, scene.width * 0.155));
      scene.glowRadius = radius;
      glowCanvas.width = glowCanvas.height = Math.ceil(radius * 2 * scene.dpr);
      glowCtx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
      const mask = glowCtx.createRadialGradient(radius, radius, 0, radius, radius, radius);
      mask.addColorStop(0, "rgba(255,255,255,0.98)");
      mask.addColorStop(0.34, "rgba(255,255,255,0.82)");
      mask.addColorStop(0.68, "rgba(255,255,255,0.22)");
      mask.addColorStop(1, "rgba(255,255,255,0)");
      glowCtx.fillStyle = mask;
      glowCtx.fillRect(0, 0, radius * 2, radius * 2);
    }

    function drawBaseLayer() {
      if (!scene) return;

      clearCanvas(gradientCtx, gradientCanvas);
      clearCanvas(cellCtx, cellCanvas);

      cellCtx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
      cellCtx.drawImage(staticCanvas, 0, 0, scene.width, scene.height);
      previousCellBounds = null;
      previousGradientBounds = null;
      lastHeadIntensity = NaN;
    }

    function getActiveCells(sources, elapsed, now) {
      const { columns, metrics, activeStates, activeGeneration, activeCells } = scene;
      const generation = ++scene.generation;
      const cellCore = metrics.cellWidth * .22;
      activeCells.length = 0;
      for (const source of sources) {
        if (source.strength <= 0) continue;
        const radius = metrics.radius * (source.cellRadiusScale ?? source.radiusScale);
        const minRow = clamp(Math.floor((source.y - radius - metrics.offsetY) / metrics.yStep) - 2, 0, scene.rows - 1);
        const maxRow = clamp(Math.ceil((source.y + radius - metrics.offsetY) / metrics.yStep) + 2, 0, scene.rows - 1);
        for (let row = minRow; row <= maxRow; row += 1) {
          const rowOffset = row % 2 === 0 ? 0 : metrics.rowOffset;
          const minColumn = clamp(Math.floor((source.x - radius - metrics.offsetX - rowOffset) / metrics.xStep) - 2, 0, columns - 1);
          const maxColumn = clamp(Math.ceil((source.x + radius - metrics.offsetX - rowOffset) / metrics.xStep) + 2, 0, columns - 1);
          for (let column = minColumn; column <= maxColumn; column += 1) {
            const index = row * columns + column;
            const state = activeStates[index];
            const dx = source.x - state.cell.x;
            const dy = source.y - state.cell.y;
            const squared = dx * dx + dy * dy;
            if (squared >= radius * radius) continue;
            const distance = Math.sqrt(squared);
            const rawProximity = Math.max(0, 1 - distance / radius);
            if (rawProximity <= 0.035) continue;
            const influence = hoverFalloff(rawProximity) * source.strength;
            const seen = activeGeneration[index] === generation;
            if (!seen) {
              activeGeneration[index] = generation;
              state.proximity = 0;
              state.weight = 0;
              state.forceX = state.forceY = 0;
              state.dragX = state.dragY = 0;
            }
            // Blend the whole trail instead of abruptly switching to its
            // strongest sample when two lights overlap.
            state.proximity = Math.max(state.proximity, influence);
            state.weight += influence;
            // A finite core prevents direction from flipping at the tile centre.
            const softDistance = Math.sqrt(squared + cellCore * cellCore);
            state.forceX += dx / softDistance * influence;
            state.forceY += dy / softDistance * influence;
            state.dragX += (source.directionX ?? 0) * influence;
            state.dragY += (source.directionY ?? 0) * influence;
          }
        }
      }
      const dt = Math.min(elapsed / 1000, 0.032);
      cellsSettling = false;
      for (let index = 0; index < activeStates.length; index++) {
        const state = activeStates[index];
        state.waveX = state.waveY = state.waveScale = state.waveRotation = 0;
        for (const burst of bursts) {
          const offset = index * 3;
          const phase = ((now - burst.time) / 1000 - burst.distances[offset] / burst.speed) / BURST.settleSeconds;
          if (phase <= 0 || phase >= 1) continue;
          // A travelling, damped push/rebound: each tile settles before the next ring.
          const vibration = Math.sin(phase * Math.PI * 3) * Math.pow(1 - phase, 2);
          const amplitude = vibration * (1 - .25 * burst.distances[offset] / burst.reach);
          state.waveX += burst.distances[offset + 1] * amplitude * BURST.displacement;
          state.waveY += burst.distances[offset + 2] * amplitude * BURST.displacement;
          state.waveScale -= amplitude * .016;
          state.waveRotation += amplitude * .008;
        }
        const influenced = activeGeneration[index] === generation;
        const target = influenced ? Math.pow(state.proximity, .92) : 0;
        const radialX = influenced ? state.forceX / state.weight : 0;
        const radialY = influenced ? state.forceY / state.weight : 0;
        const dragX = influenced ? state.dragX / state.weight : 0;
        const dragY = influenced ? state.dragY / state.weight : 0;
        const response = 190 + cellNoise(state.cell.row, state.cell.column, 2) * 24;
        cellsSettling = settleSpring(state, "lift", target, dt, response, 25) || cellsSettling;
        cellsSettling = settleSpring(state, "foldX", radialX, dt, 155, 24) || cellsSettling;
        cellsSettling = settleSpring(state, "foldY", radialY, dt, 155, 24) || cellsSettling;
        cellsSettling = settleSpring(state, "x", (-radialX * .09 + dragX * .025) * target * state.cell.width, dt, response, 23, .01) || cellsSettling;
        cellsSettling = settleSpring(state, "y", (-radialY * .09 + dragY * .025) * target * state.cell.height, dt, response, 23, .01) || cellsSettling;
        const torque = (radialX * dragY - radialY * dragX) * target * .018;
        cellsSettling = settleSpring(state, "rotation", torque, dt, 145, 24, .0001) || cellsSettling;
        const lift = clamp(state.lift, 0, 1);
        if (lift < .001 && Math.abs(state.x) < .01 && Math.abs(state.y) < .01 &&
          Math.abs(state.waveX) + Math.abs(state.waveY) + Math.abs(state.waveScale) < .001) continue;
        activeCells.push(state);
        state.sourceX = state.cell.x + state.foldX * metrics.radius;
        state.sourceY = state.cell.y + state.foldY * metrics.radius;
        state.brightness = 1 + lift * 0.14;
        state.depth = lift;
        state.fold = lift * .72;
        state.scale = DEFAULT_SCALE - lift * .045;
      }
      return activeCells;
    }

    function drawGradientLayer(now, sources) {
      if (!scene) return;

      clearRegion(gradientCtx, previousGradientBounds);
      previousGradientBounds = null;

      if (sources.length === 0) {
        return;
      }

      gradientCtx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
      gradientCtx.globalCompositeOperation = "source-over";
      let left = scene.width, top = scene.height, right = 0, bottom = 0;
      for (const source of sources) {
        const radius = scene.glowRadius * (source.radiusScale ?? 1);
        left = Math.min(left, source.x - radius); top = Math.min(top, source.y - radius);
        right = Math.max(right, source.x + radius); bottom = Math.max(bottom, source.y + radius);
      }
      const bounds = clipBounds(left - 1, top - 1, right + 1, bottom + 1);
      previousGradientBounds = bounds;
      gradientCtx.save();
      gradientCtx.beginPath();
      gradientCtx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
      gradientCtx.clip();

      sources.forEach((source) => {
        const strength = clamp(source.gradientStrength ?? source.strength, 0, 1);

        if (strength <= 0.006) return;

        const scale = source.radiusScale ?? 1;
        const radius = scene.glowRadius * scale;
        gradientCtx.globalAlpha = strength;
        gradientCtx.drawImage(
          glowCanvas,
          source.x - radius,
          source.y - radius,
          glowCanvas.width / scene.dpr * scale,
          glowCanvas.height / scene.dpr * scale,
        );
      });

      gradientCtx.globalAlpha = 1;
      gradientCtx.globalCompositeOperation = "source-in";
      gradientCtx.fillStyle = createHeroFlowGradient(
        gradientCtx,
        scene.width,
        now,
      );
      gradientCtx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      gradientCtx.restore();
    }

    function drawFrame(now = performance.now()) {
      frameId = 0;

      if (!scene || !isVisible || document.hidden || !shouldUseInteraction || isPageIntroActive) {
        return;
      }

      const elapsed = lastDrawAt ? Math.min(now - lastDrawAt, 64) : smoothingFrameMs;
      lastDrawAt = now;

      const deltaIntensity = pointer.targetIntensity - pointer.intensity;
      // CSS pixels per second, with a smooth decay after the last input.
      const speed = pointer.speed * Math.exp(-Math.max(0, now - (lastInput?.time ?? now) - 35) / 90);
      const targetEnergy = 1 - Math.exp(-speed / 750);
      pointer.energy += (targetEnergy - pointer.energy) * (1 - Math.exp(-elapsed / (targetEnergy > pointer.energy ? 65 : 180)));
      if (Math.abs(targetEnergy - pointer.energy) < .0001) pointer.energy = targetEnergy;

      const follow = 1 - Math.exp(-elapsed / 42);
      pointer.x += (pointer.targetX - pointer.x) * follow;
      pointer.y += (pointer.targetY - pointer.y) * follow;
      if (Math.hypot((pointer.targetX - pointer.x) * scene.width, (pointer.targetY - pointer.y) * scene.height) < .1) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }
      const smoothing = 1 - Math.pow(0.86, elapsed / smoothingFrameMs);
      pointer.intensity = Math.abs(deltaIntensity) < 0.0001 ? pointer.targetIntensity : pointer.intensity + deltaIntensity * smoothing;

      trail = trail.filter((point) => now - point.createdAt < trailLifetime);
      bursts = bursts.filter(burst => now - burst.time < (BURST.travelSeconds + BURST.settleSeconds) * 1000);

      if (pointer.targetIntensity > 0) {
        const distance = lastTrailPoint ? Math.hypot((pointer.x - lastTrailPoint.x) * scene.width, (pointer.y - lastTrailPoint.y) * scene.height) : 0;
        if (!lastTrailPoint) {
          lastTrailPoint = { x: pointer.x, y: pointer.y, createdAt: now };
        } else if (distance >= trailSpacing) {
          const count = Math.min(trailMaxPoints, Math.floor(distance / trailSpacing));
          const start = lastTrailPoint;
          for (let index = 1; index <= count; index++) {
            const fraction = index * trailSpacing / distance;
            lastTrailPoint = { x: start.x + (pointer.x - start.x) * fraction, y: start.y + (pointer.y - start.y) * fraction, createdAt: now, energy: pointer.energy, directionX: pointer.directionX, directionY: pointer.directionY };
            trail.push(lastTrailPoint);
          }
          if (trail.length > trailMaxPoints) trail.splice(0, trail.length - trailMaxPoints);
        }
      }

      const sources = [];
      for (const burst of bursts) {
        const age = (now - burst.time) / 1000;
        if (age >= .55) continue;
        const pulse = Math.sin(age / .55 * Math.PI);
        sources.push({
          x: burst.x, y: burst.y,
          strength: 0, gradientStrength: pulse,
          radiusScale: .8 + pulse * .95, cellRadiusScale: 0,
        });
      }

      if (pointer.intensity > 0.01) {
        sources.push({
          gradientStrength: pointer.intensity * (.48 + pointer.energy * .52),
          radiusScale: .58 + pointer.energy * .36,
          cellRadiusScale: .95 + pointer.energy * .2,
          strength: pointer.intensity * (.48 + pointer.energy * .52),
          directionX: pointer.directionX * pointer.energy,
          directionY: pointer.directionY * pointer.energy,
          x: pointer.x * scene.width,
          y: pointer.y * scene.height,
        });
      }

      trail.forEach((point) => {
        const distanceFromHead = Math.hypot(
          (point.x - pointer.x) * scene.width,
          (point.y - pointer.y) * scene.height,
        );

        if (
          pointer.intensity > 0.01 &&
          distanceFromHead < TRAIL_HEAD_DEDUP_DISTANCE
        ) {
          return;
        }

        const age = now - point.createdAt;
        const life = clamp(1 - age / trailLifetime, 0, 1);
        const trailStrength = Math.pow(smoothStep(life), 0.72);

        if (trailStrength <= 0.008) return;

        sources.push({
          gradientStrength: trailStrength * (.36 + (point.energy ?? 0) * .5),
          radiusScale: (.5 + (point.energy ?? 0) * .32) * (.8 + life * .2),
          cellRadiusScale: (.85 + (point.energy ?? 0) * .18) * (.75 + life * .25),
          strength: trailStrength * (.32 + (point.energy ?? 0) * .45),
          directionX: (point.directionX ?? 0) * (point.energy ?? 0) * life,
          directionY: (point.directionY ?? 0) * (point.energy ?? 0) * life,
          x: point.x * scene.width,
          y: point.y * scene.height,
        });
      });

      drawGradientLayer(now, sources);

      const stableHead = bursts.length === 0 && !lastHadBurst && !cellsSettling && sources.length === 1 && trail.length === 0 && !lastHadTrail && pointer.x === lastHeadX && pointer.y === lastHeadY && pointer.intensity === lastHeadIntensity && pointer.energy === lastHeadEnergy;
      // The color still flows, but stationary cell geometry needs no more paint.
      if (!stableHead) {
      restoreCells();
      const activeCells = getActiveCells(sources, elapsed, now);
      if (activeCells.length > 0) {
        let left = scene.width, top = scene.height, right = 0, bottom = 0;
        for (const { cell } of activeCells) {
          const padding = 64;
          left = Math.min(left, cell.x - cell.width * 0.7 - padding);
          right = Math.max(right, cell.x + cell.width * 0.7 + padding);
          top = Math.min(top, cell.y - cell.height * 0.7 - padding);
          bottom = Math.max(bottom, cell.y + cell.height * 0.7 + padding);
        }
        previousCellBounds = clipBounds(left, top, right, bottom);
        cellCtx.save();
        cellCtx.globalCompositeOperation = "destination-out";

        activeCells.forEach(({ cell }) => {
          // Remove only the original tile. Enlarged erasure used to cut into
          // neighbours and made the entire halo look like a thick outline.
          drawCellPath(cellCtx, cell, DEFAULT_SCALE + 0.006);
          cellCtx.fill();
        });

        cellCtx.restore();

        activeCells.forEach((state) => drawCell(cellCtx, state.cell, state));
      }
      }
      lastHeadX = pointer.x; lastHeadY = pointer.y; lastHeadIntensity = pointer.intensity; lastHadTrail = trail.length > 0;
      lastHeadEnergy = pointer.energy;
      lastHadBurst = bursts.length > 0;

      const shouldContinue =
        pointer.intensity > 0.002 ||
        pointer.targetIntensity > 0 ||
        trail.length > 0 ||
        bursts.length > 0 ||
        cellsSettling ||
        Math.abs(deltaIntensity) > 0.0008;

      if (shouldContinue) {
        frameId = requestAnimationFrame(drawFrame);
      } else {
        // One exact restoration at rest also removes subpixel crop seams on
        // fractional mobile DPRs. Moving frames still restore only dirty bounds.
        drawBaseLayer();
      }
    }

    function requestFrame() {
      if (!frameId && shouldUseInteraction && isVisible && !document.hidden && !isPageIntroActive) {
        lastDrawAt = 0;
        frameId = requestAnimationFrame(drawFrame);
      }
    }

    function resize() {
      rootRect = root.getBoundingClientRect();

      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

      if (
        scene &&
        Math.abs(width - lastCanvasWidth) < 0.5 &&
        Math.abs(height - lastCanvasHeight) < 0.5 &&
        dpr === lastCanvasDpr
      ) {
        return;
      }

      const built = buildCells(width, height);
      bursts = [];

      resizeCanvas(gradientCanvas, width, height, dpr);
      resizeCanvas(cellCanvas, width, height, dpr);
      resizeCanvas(staticCanvas, width, height, dpr);

      lastCanvasWidth = width;
      lastCanvasHeight = height;
      lastCanvasDpr = dpr;

      scene = {
        ...built,
        dpr,
        height,
        width,
        generation: 0,
        activeGeneration: new Uint32Array(built.cells.length),
        activeStates: built.cells.map((cell) => ({ cell, x: 0, y: 0, proximity: 0 })),
        activeCells: [],
      };

      drawStaticLayer();
      cacheGlowMask();
      drawBaseLayer();
      requestFrame();
    }

    function isInsideRootRect(clientX, clientY) {
      return (
        rootRect.width > 0 &&
        rootRect.height > 0 &&
        clientX >= rootRect.left &&
        clientX <= rootRect.right &&
        clientY >= rootRect.top &&
        clientY <= rootRect.bottom
      );
    }

    function scheduleResize() {
      if (resizeFrameId) return;

      resizeFrameId = requestAnimationFrame(() => {
        resizeFrameId = 0;
        resize();
      });
    }

    function scheduleRootRectUpdate() {
      if (!isVisible) return;

      if (rectFrameId) return;

      rectFrameId = requestAnimationFrame(() => {
        rectFrameId = 0;
        rootRect = root.getBoundingClientRect();
      });
    }

    function deactivatePointer() {
      pointer.targetIntensity = 0;
      lastInput = null;
      pointer.speed = 0;
      lastTrailPoint = null;
      pendingPointer = null;
      requestFrame();
    }

    function suspendInteraction() {
      if (frameId) cancelAnimationFrame(frameId);
      if (pointerFrameId) cancelAnimationFrame(pointerFrameId);
      frameId = 0;
      pointerFrameId = 0;
      pendingPointer = null;
      pointer.targetIntensity = 0;
      pointer.intensity = 0;
      pointer.speed = pointer.energy = 0;
      lastInput = null;
      trail.length = 0;
      bursts.length = 0;
      lastHadBurst = false;
      lastTrailPoint = null;
      cellsSettling = false;
      if (scene) {
        for (const state of scene.activeStates) {
          for (const key of ["lift", "foldX", "foldY", "x", "y", "rotation"]) {
            state[key] = state[`${key}Velocity`] = 0;
          }
        }
        pointer.directionX = pointer.directionY = 0;
        restoreCells();
        clearRegion(gradientCtx, previousGradientBounds);
        previousGradientBounds = null;
      }
    }

    function updateInteraction(clientX, clientY) {
      if (!scene || !shouldUseInteraction || isPageIntroActive) return;

      rootRect = root.getBoundingClientRect();

      if (rootRect.width <= 0 || rootRect.height <= 0) {
        deactivatePointer();
        return;
      }

      if (!isInsideRootRect(clientX, clientY)) {
        deactivatePointer();
        return;
      }

      const nextX = clamp((clientX - rootRect.left) / rootRect.width, 0, 1);
      const nextY = clamp((clientY - rootRect.top) / rootRect.height, 0, 1);
      const time = performance.now();
      if (lastInput) {
        const elapsed = time - lastInput.time;
        if (elapsed > 0) {
          const dx = (nextX - lastInput.x) * rootRect.width;
          const dy = (nextY - lastInput.y) * rootRect.height;
          const distance = Math.hypot(dx, dy);
          pointer.speed = clamp(distance / Math.max(elapsed, 8) * 1000, 0, 4000);
          if (distance > .2) {
            const blend = 1 - Math.exp(-elapsed / 65);
            pointer.directionX += (dx / distance - pointer.directionX) * blend;
            pointer.directionY += (dy / distance - pointer.directionY) * blend;
          }
        }
      } else pointer.speed = 0;
      lastInput = { x: nextX, y: nextY, time };

      if (pointer.intensity < .002 && pointer.targetIntensity === 0) {
        pointer.x = nextX;
        pointer.y = nextY;
      }
      pointer.targetIntensity = 1;
      pointer.targetX = nextX;
      pointer.targetY = nextY;

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
      if (
        !isVisible ||
        !scene ||
        !shouldUseInteraction ||
        isPageIntroActive
      ) {
        return;
      }

      if (!isInsideRootRect(event.clientX, event.clientY)) {
        if (pointer.targetIntensity > 0 || pointer.intensity > 0.002) {
          deactivatePointer();
        }

        return;
      }

      scheduleInteraction(event.clientX, event.clientY);
    }

    function handlePointerLeave() {
      deactivatePointer();
    }

    function handlePointerDown(event) {
      handlePointerMove(event);
      if (!scene || !shouldUseInteraction || !isVisible || isPageIntroActive || document.hidden ||
        event.button !== 0 || document.body.dataset.siteMenuOpen === "true" ||
        event.target.closest?.("a, button, input, textarea, select, [role='button'], [role='dialog']")) return;
      rootRect = root.getBoundingClientRect();
      if (!isInsideRootRect(event.clientX, event.clientY)) return;
      const x = (event.clientX - rootRect.left) / rootRect.width * scene.width;
      const y = (event.clientY - rootRect.top) / rootRect.height * scene.height;
      // Distances are cached once per click, rather than recalculated per frame.
      const distances = new Float32Array(scene.cells.length * 3);
      let reach = 1;
      scene.cells.forEach((cell, index) => {
        const dx = cell.x - x;
        const dy = cell.y - y;
        const distance = Math.hypot(dx, dy * 1.12);
        const directionLength = Math.hypot(dx, dy) || 1;
        distances[index * 3] = distance;
        distances[index * 3 + 1] = dx / directionLength;
        distances[index * 3 + 2] = dy / directionLength;
        reach = Math.max(reach, distance);
      });
      bursts.push({ x, y, time: performance.now(), distances, reach, speed: reach / BURST.travelSeconds });
      if (bursts.length > BURST.maxActive) bursts.shift();
      requestFrame();
    }

    function handleWindowPointerOut(event) {
      if (!event.relatedTarget) deactivatePointer();
    }

    function handlePageShow() {
      scheduleResize();
      scheduleRootRectUpdate();
    }

    function handlePageIntroStart() {
      isPageIntroActive = true;
      suspendInteraction();
    }

    function handlePageIntroComplete() {
      isPageIntroActive = false;
      scheduleRootRectUpdate();
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        suspendInteraction();
      } else requestFrame();
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

        suspendInteraction();
      },
      { rootMargin: "0px" },
    );

    resizeObserver.observe(root);
    visibilityObserver.observe(root.closest("[data-hero-fullscreen-surface]") || root);

    if (shouldUseInteraction) {
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      window.addEventListener("pointerdown", handlePointerDown, {
        passive: true,
      });
      window.addEventListener("pointerup", handlePointerLeave, {
        passive: true,
      });
      window.addEventListener("pointercancel", handlePointerLeave, {
        passive: true,
      });
      window.addEventListener("pointerout", handleWindowPointerOut, { passive: true });
    }

    window.addEventListener("resize", scheduleResize);
    window.addEventListener("orientationchange", scheduleResize);
    window.addEventListener("scroll", scheduleRootRectUpdate, {
      passive: true,
    });
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("blur", deactivatePointer);
    window.addEventListener("page-intro:start", handlePageIntroStart);
    window.addEventListener("page-intro:complete", handlePageIntroComplete);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    resize();

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      if (shouldUseInteraction) {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointerup", handlePointerLeave);
        window.removeEventListener("pointercancel", handlePointerLeave);
        window.removeEventListener("pointerout", handleWindowPointerOut);
      }

      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("orientationchange", scheduleResize);
      window.removeEventListener("scroll", scheduleRootRectUpdate);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("blur", deactivatePointer);
      window.removeEventListener("page-intro:start", handlePageIntroStart);
      window.removeEventListener(
        "page-intro:complete",
        handlePageIntroComplete,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (frameId) cancelAnimationFrame(frameId);
      if (pointerFrameId) cancelAnimationFrame(pointerFrameId);
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
      if (rectFrameId) cancelAnimationFrame(rectFrameId);
      // Drop backing stores immediately when a route unmounts, not on a later GC.
      gradientCanvas.width = gradientCanvas.height = 0;
      cellCanvas.width = cellCanvas.height = 0;
      staticCanvas.width = staticCanvas.height = 0;
      glowCanvas.width = glowCanvas.height = 0;
      scene = null;
      trail = [];
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
