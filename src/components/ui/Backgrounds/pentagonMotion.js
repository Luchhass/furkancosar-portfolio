export const CELL_SIZE_RATIO = 0.0375;
export const CELL_HEIGHT_RATIO = 1.15;
export const X_STEP_RATIO = 1.01;
export const Y_STEP_RATIO = 0.758;
export const DEFAULT_SCALE = 0.982;
export const HOVER_RADIUS = 92;

// A full viewport canvas at native DPR is disproportionately expensive on
// high-density displays. The geometry is deliberately low-frequency, so this
// cap is visually indistinguishable while keeping the backing stores small.
export const MAX_DPR = 1;
export const MOBILE_MAX_DPR = 0.85;

export const TRAIL_LIFETIME = 1100;
export const MOBILE_TRAIL_LIFETIME = 950;

export const TRAIL_MAX_POINTS = 64;
export const MOBILE_TRAIL_MAX_POINTS = 48;

export const TRAIL_SPACING = 14;
export const MOBILE_TRAIL_SPACING = 14;
export const TRAIL_HEAD_DEDUP_DISTANCE = 18;

export const BURST = { travelSeconds: .9, settleSeconds: .34, displacement: 7, maxActive: 3 };
export const BURST_COLOR_DELAY = .045;
export const BURST_Y_RATIO = 1.12;
export const TAP_MAX_DISTANCE = 10;
export const TAP_MAX_DURATION = 450;
export const INTERACTIVE_TARGET = "a, button, input, textarea, select, [role='button'], [role='dialog']";

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function smoothStep(value) {
  return value * value * (3 - 2 * value);
}

export function hoverFalloff(value) {
  return Math.pow(smoothStep(value), 1.45);
}

export function settleSpring(state, key, target, elapsed, stiffness, damping, epsilon = .001) {
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

export function cellNoise(row, column, salt = 0) {
  const value = Math.sin(
    (row + 1) * 127.1 + (column + 1) * 311.7 + salt * 74.7,
  );

  return value - Math.floor(value);
}

