import { PRIMARY_COLOR } from "@/data/brand";
import { DEFAULT_SCALE, MAX_DPR, MOBILE_MAX_DPR, TRAIL_LIFETIME, MOBILE_TRAIL_LIFETIME, TRAIL_MAX_POINTS, MOBILE_TRAIL_MAX_POINTS, TRAIL_SPACING, MOBILE_TRAIL_SPACING, TRAIL_HEAD_DEDUP_DISTANCE, BURST, BURST_COLOR_DELAY, BURST_Y_RATIO, TAP_MAX_DISTANCE, TAP_MAX_DURATION, INTERACTIVE_TARGET, clamp, smoothStep, cellNoise } from "./pentagonMotion";
import { drawCellPath, drawCell, buildCells, resizeCanvas } from "./pentagonDrawing";
import { updateActiveCells } from "./pentagonDeformation";

export default function mountPentagonCanvas(root, gradientCanvas, cellCanvas) {
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
  let tapCandidate = null;

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
    const center = radius * scene.dpr;
    const size = Math.ceil(center * 2);
    glowCanvas.width = glowCanvas.height = size;
    const mask = glowCtx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      const dy = y + .5 - center;
      for (let x = 0; x < size; x++) {
        const dx = x + .5 - center;
        const distance = Math.sqrt(dx * dx + dy * dy) / center;
        if (distance >= 1) continue;
        const opacity = distance < .34 ? .98 - .16 * distance / .34
          : distance < .68 ? .82 - .6 * (distance - .34) / .34
          : .22 * (1 - distance) / .32;
        mask.data[(y * size + x) * 4 + 3] = opacity * 255;
      }
    }
    glowCtx.putImageData(mask, 0, 0);
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

  function drawGradientLayer(now, sources) {
    if (!scene) return;

    clearRegion(gradientCtx, previousGradientBounds);
    previousGradientBounds = null;

    if (sources.length === 0 && bursts.length === 0) {
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
    for (const burst of bursts) {
      const radius = Math.max(0, (now - burst.time) / 1000 - BURST_COLOR_DELAY) * burst.speed;
      left = Math.min(left, burst.x - radius); top = Math.min(top, burst.y - radius / BURST_Y_RATIO);
      right = Math.max(right, burst.x + radius); bottom = Math.max(bottom, burst.y + radius / BURST_Y_RATIO);
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

    // The color follows the same elliptical distance and travel speed as the
    // tile vibration. A short delay places it just behind the moving front.
    for (const burst of bursts) {
      const age = (now - burst.time) / 1000 - BURST_COLOR_DELAY;
      if (age <= 0) continue;
      const outer = age * burst.speed;
      const inner = Math.max(0, outer - burst.speed * BURST.settleSeconds);
      const bandWidth = (outer - inner) / 32;
      gradientCtx.save();
      gradientCtx.translate(burst.x, burst.y);
      gradientCtx.scale(1, 1 / BURST_Y_RATIO);
      gradientCtx.strokeStyle = "#000";
      gradientCtx.lineWidth = bandWidth;
      for (let step = 0; step < 32; step++) {
        const distance = inner + bandWidth * (step + .5);
        const phase = clamp((age - distance / burst.speed) / BURST.settleSeconds, 0, 1);
        const vibration = Math.pow(Math.sin(phase * Math.PI * 3), 2);
        const envelope = Math.sin(phase * Math.PI) * Math.pow(1 - phase, .7);
        const attenuation = clamp(1 - .25 * distance / burst.reach, 0, 1);
        gradientCtx.globalAlpha = vibration * envelope * attenuation * .95;
        gradientCtx.beginPath();
        gradientCtx.arc(0, 0, distance, 0, Math.PI * 2);
        gradientCtx.stroke();
      }
      gradientCtx.restore();
    }

    gradientCtx.globalAlpha = 1;
    gradientCtx.globalCompositeOperation = "source-in";
    gradientCtx.fillStyle = PRIMARY_COLOR;
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
    bursts = bursts.filter(burst => now - burst.time < (BURST.travelSeconds + BURST.settleSeconds + BURST_COLOR_DELAY) * 1000);

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

    const stableHead = bursts.length === 0 && !lastHadBurst && !cellsSettling && sources.length === 1 && trail.length === 0 && !lastHadTrail && pointer.x === lastHeadX && pointer.y === lastHeadY && pointer.intensity === lastHeadIntensity && pointer.energy === lastHeadEnergy;
    // A stationary pointer has nothing left to animate with a solid accent.
    if (stableHead) return;

    drawGradientLayer(now, sources);
    restoreCells();
    cellsSettling = updateActiveCells(scene, sources, bursts, elapsed, now);
    const { activeCells } = scene;
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
      activeStates: built.cells.map((cell) => ({ cell, x: 0, y: 0, proximity: 0, springResponse: 190 + cellNoise(cell.row, cell.column, 2) * 24 })),
      activeCells: [],
      springCells: new Set(),
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
    tapCandidate = null;
    pointer.targetIntensity = 0;
    lastInput = null;
    pointer.speed = 0;
    lastTrailPoint = null;
    pendingPointer = null;
    requestFrame();
  }

  function suspendInteraction() {
    tapCandidate = null;
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
      for (const index of scene.springCells) {
        const state = scene.activeStates[index];
        for (const key of ["lift", "foldX", "foldY", "x", "y", "rotation"]) {
          state[key] = state[`${key}Velocity`] = 0;
        }
      }
      scene.springCells.clear();
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
    if (tapCandidate && event.pointerId === tapCandidate.pointerId &&
      Math.hypot(event.clientX - tapCandidate.x, event.clientY - tapCandidate.y) > TAP_MAX_DISTANCE) {
      tapCandidate = null;
    }
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
    const alreadyPressed = tapCandidate !== null;
    tapCandidate = null;
    if (!scene || !shouldUseInteraction || !isVisible || isPageIntroActive || document.hidden ||
      alreadyPressed || event.isPrimary === false || event.button !== 0 || document.body.dataset.siteMenuOpen === "true" ||
      event.target.closest?.(INTERACTIVE_TARGET)) return;
    rootRect = root.getBoundingClientRect();
    if (!isInsideRootRect(event.clientX, event.clientY)) return;
    tapCandidate = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
  }

  function handlePointerUp(event) {
    const tap = tapCandidate;
    deactivatePointer();
    if (!tap || event.pointerId !== tap.pointerId || event.button !== 0 ||
      performance.now() - tap.time > TAP_MAX_DURATION ||
      Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > TAP_MAX_DISTANCE ||
      !scene || !shouldUseInteraction || !isVisible || isPageIntroActive || document.hidden ||
      document.body.dataset.siteMenuOpen === "true" || event.target.closest?.(INTERACTIVE_TARGET)) return;
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
      const distance = Math.hypot(dx, dy * BURST_Y_RATIO);
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

  function handleScroll() {
    tapCandidate = null;
    scheduleRootRectUpdate();
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

  const lifecycle = new AbortController();
  const options = { signal: lifecycle.signal };
  const passive = { ...options, passive: true };

  if (shouldUseInteraction) {
    window.addEventListener("pointermove", handlePointerMove, passive);
    window.addEventListener("pointerdown", handlePointerDown, passive);
    window.addEventListener("pointerup", handlePointerUp, passive);
    window.addEventListener("pointercancel", handlePointerLeave, passive);
    window.addEventListener("pointerout", handleWindowPointerOut, passive);
  }

  window.addEventListener("resize", scheduleResize, options);
  window.addEventListener("orientationchange", scheduleResize, options);
  window.addEventListener("scroll", handleScroll, passive);
  window.addEventListener("pageshow", handlePageShow, options);
  window.addEventListener("blur", deactivatePointer, options);
  window.addEventListener("page-intro:start", handlePageIntroStart, options);
  window.addEventListener("page-intro:complete", handlePageIntroComplete, options);
  document.addEventListener("visibilitychange", handleVisibilityChange, options);

  resize();

  return () => {
    resizeObserver.disconnect();
    visibilityObserver.disconnect();

    lifecycle.abort();

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
}
