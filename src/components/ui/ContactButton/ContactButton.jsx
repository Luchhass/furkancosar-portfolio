"use client";

export default function GradientActionButton({
  className = "",
  href = "",
  id = "",
  label = "",
  onClick,
}) {
  function updateFillOrigin(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    button.style.setProperty(
      "--gradient-fill-x",
      `${event.clientX - rect.left}px`,
    );

    button.style.setProperty(
      "--gradient-fill-y",
      `${event.clientY - rect.top}px`,
    );
  }

  return (
    <a
      id={id}
      href={href}
      className={`gradient-action-button group pointer-events-auto relative isolate inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden bg-transparent px-5 text-xs leading-none font-black whitespace-nowrap text-white no-underline md:w-41.75 ${className}`}
      onClick={onClick}
      onPointerEnter={updateFillOrigin}
      onPointerLeave={updateFillOrigin}
    >
      <span
        className="gradient-action-fill pointer-events-none z-0"
        aria-hidden="true"
      />

      <span
        className="gradient-action-border pointer-events-none z-20"
        aria-hidden="true"
      />

      <span
        className="gradient-action-dot relative z-10 h-2 w-2 rounded-full"
        aria-hidden="true"
      />

      <span className="relative z-10">{label}</span>
    </a>
  );
}
