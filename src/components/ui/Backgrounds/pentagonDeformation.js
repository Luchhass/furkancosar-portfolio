import { BURST, DEFAULT_SCALE, clamp, hoverFalloff, settleSpring } from "./pentagonMotion";

export function updateActiveCells(scene, sources, bursts, elapsed, now) {
  const { columns, metrics, activeStates, activeGeneration, activeCells, springCells } = scene;
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
          springCells.add(index);
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
  let cellsSettling = false;
  // A click wave travels through the grid. Pointer trails only need the
  // cells they touch and the ones still settling from earlier frames.
  // Keep row-major paint order so overlapping edges render the same way.
  const nearby = bursts.length ? null : [...springCells].sort((a, b) => a - b);
  const count = nearby?.length ?? activeStates.length;
  for (let position = 0; position < count; position++) {
    const index = nearby ? nearby[position] : position;
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
    if (springCells.has(index)) {
      const influenced = activeGeneration[index] === generation;
      const settling = updateSprings(state, influenced, dt);
      if (!influenced && !settling) springCells.delete(index);
      cellsSettling ||= settling;
    }
    const lift = clamp(state.lift ?? 0, 0, 1);
    if (lift < .001 && Math.abs(state.x) < .01 && Math.abs(state.y) < .01 &&
      Math.abs(state.waveX) + Math.abs(state.waveY) + Math.abs(state.waveScale) < .001) continue;
    activeCells.push(state);
    state.brightness = 1 + lift * 0.14;
    state.depth = lift;
    state.fold = lift * .72;
    state.scale = DEFAULT_SCALE - lift * .045;
  }
  return cellsSettling;
}

function updateSprings(state, influenced, dt) {
  const target = influenced ? Math.pow(state.proximity, .92) : 0;
  const radialX = influenced ? state.forceX / state.weight : 0;
  const radialY = influenced ? state.forceY / state.weight : 0;
  const dragX = influenced ? state.dragX / state.weight : 0;
  const dragY = influenced ? state.dragY / state.weight : 0;
  const response = state.springResponse;
  const torque = (radialX * dragY - radialY * dragX) * target * .018;
  const lift = settleSpring(state, "lift", target, dt, response, 25);
  const foldX = settleSpring(state, "foldX", radialX, dt, 155, 24);
  const foldY = settleSpring(state, "foldY", radialY, dt, 155, 24);
  const x = settleSpring(state, "x", (-radialX * .09 + dragX * .025) * target * state.cell.width, dt, response, 23, .01);
  const y = settleSpring(state, "y", (-radialY * .09 + dragY * .025) * target * state.cell.height, dt, response, 23, .01);
  const rotation = settleSpring(state, "rotation", torque, dt, 145, 24, .0001);
  return lift || foldX || foldY || x || y || rotation;
}
