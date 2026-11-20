import {
  CELL_HEIGHT_RATIO,
  CELL_SIZE_RATIO,
  DEFAULT_SCALE,
  HOVER_RADIUS,
  X_STEP_RATIO,
  Y_STEP_RATIO,
  cellNoise,
  clamp,
  smoothStep,
} from "./pentagonMotion";

const facePaintByContext = new WeakMap();

function cellFacePaint(ctx, cell) {
  let cached = facePaintByContext.get(ctx);
  if (cached?.width !== cell.width || cached?.height !== cell.height) {
    cached = { width: cell.width, height: cell.height, shades: new Map() };
    facePaintByContext.set(ctx, cached);
  }

  const { shade, width, height } = cell;
  let paint = cached.shades.get(shade);
  if (!paint) {
    const x = width * DEFAULT_SCALE / 2;
    const y = height * DEFAULT_SCALE / 2;
    paint = ctx.createLinearGradient(-x, -y, x, y);
    paint.addColorStop(0, `rgb(${shade + 24} ${shade + 24} ${shade + 25})`);
    paint.addColorStop(.48, `rgb(${shade + 10} ${shade + 10} ${shade + 12})`);
    paint.addColorStop(1, `rgb(${shade} ${shade} ${shade + 2})`);
    cached.shades.set(shade, paint);
  }
  return paint;
}

export function drawCellPath(ctx, cell, scale = DEFAULT_SCALE) {
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

export function drawCell(ctx, cell, transform) {
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
  const facePaint = cellFacePaint(ctx, cell);
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

  ctx.fillStyle = facePaint;
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

export function buildCells(width, height) {
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

export function resizeCanvas(canvas, width, height, dpr) {
  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

