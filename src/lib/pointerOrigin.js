export function updateActionFillOrigin(event) {
  const control = event.currentTarget;
  if (event.type === "focus" || event.type === "blur") {
    control.style.removeProperty("--gradient-fill-x");
    control.style.removeProperty("--gradient-fill-y");
    return;
  }
  const { left, top } = control.getBoundingClientRect();
  control.style.setProperty("--gradient-fill-x", `${event.clientX - left}px`);
  control.style.setProperty("--gradient-fill-y", `${event.clientY - top}px`);
}

export function updateTitleFillOrigin(event) {
  const link = event.currentTarget;
  const text = link.querySelector(".gradient-title-text");
  const rect = (text || link).getBoundingClientRect();

  const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
  const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

  link.style.setProperty("--gradient-title-fill-x", `${x}px`);
  link.style.setProperty("--gradient-title-fill-y", `${y}px`);
}
