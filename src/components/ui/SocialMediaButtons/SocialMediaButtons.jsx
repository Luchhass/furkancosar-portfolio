"use client";

function SocialIcon({ icon }) {
  if (icon === "instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.5" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (icon === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.76 8.42a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28Zm-1.42 2.02h2.84v8.42H5.34v-8.42Zm4.6 0h2.72v1.15h.04c.38-.72 1.3-1.48 2.68-1.48 2.86 0 3.39 1.88 3.39 4.32v4.43h-2.84v-3.93c0-.94-.02-2.14-1.3-2.14-1.3 0-1.5 1.02-1.5 2.08v3.99H9.94v-8.42Z" />
      </svg>
    );
  }

  if (icon === "github") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3.6a8.4 8.4 0 0 0-2.65 16.37c.42.08.57-.18.57-.4 0-.2-.01-.86-.01-1.56-2.1.39-2.64-.51-2.81-.98-.1-.24-.54-.98-.92-1.18-.31-.17-.75-.59-.01-.6.7-.01 1.2.64 1.37.91.8 1.35 2.08.97 2.59.74.08-.58.31-.97.56-1.19-1.86-.21-3.81-.93-3.81-4.14 0-.91.32-1.66.86-2.24-.09-.21-.38-1.07.08-2.23 0 0 .71-.23 2.33.86a8 8 0 0 1 4.24 0c1.62-1.1 2.33-.86 2.33-.86.46 1.16.17 2.02.08 2.23.54.58.86 1.32.86 2.24 0 3.22-1.96 3.93-3.82 4.14.32.28.6.81.6 1.64 0 1.19-.01 2.14-.01 2.43 0 .22.15.49.57.4A8.4 8.4 0 0 0 12 3.6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.08 10.83 20.6 3.6h-1.54l-5.67 6.28L8.86 3.6H3.6l6.84 9.58-6.84 7.22h1.54l5.99-6.32 4.51 6.32h5.26l-6.82-9.57Zm-2.27 2.4-.69-.98-5.47-7.82h2.39l4.41 6.3.69.98 5.73 8.18h-2.39l-4.67-6.66Z" />
    </svg>
  );
}

export default function SocialMediaButtons({ item, animationAttribute }) {
  function updateActionFillOrigin(event) {
    const link = event.currentTarget;
    const rect = link.getBoundingClientRect();

    link.style.setProperty(
      "--gradient-fill-x",
      `${event.clientX - rect.left}px`,
    );
    link.style.setProperty(
      "--gradient-fill-y",
      `${event.clientY - rect.top}px`,
    );
  }

  return (
    <a
      href={item.href}
      aria-label={item.name || item.label}
      target="_blank"
      rel="noreferrer"
      {...(animationAttribute ? { [animationAttribute]: "" } : {})}
      onPointerEnter={updateActionFillOrigin}
      onPointerLeave={updateActionFillOrigin}
      className="gradient-action-button group/social relative isolate inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-white no-underline"
    >
      <span
        className="gradient-action-fill pointer-events-none z-0 rounded-full"
        aria-hidden="true"
      />

      <span
        className="gradient-action-border pointer-events-none z-20 rounded-full"
        style={{ padding: "1.5px" }}
        aria-hidden="true"
      />

      <span
        className="relative z-10 h-4.5 w-4.5 [&_svg]:h-full [&_svg]:w-full"
        aria-hidden="true"
      >
        <SocialIcon icon={item.icon} />
      </span>
    </a>
  );
}