export function circleMask({ x, y }, radius = 0) {
  return `circle(${radius}px at ${x}px ${y}px)`;
}

export function circleCover(origin) {
  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 2;
  return { clipPath: circleMask(origin, radius), duration: .75, ease: "power3.inOut" };
}
