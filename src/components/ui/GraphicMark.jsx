// Font-independent decorative marks, drawn on a shared 64-unit grid.
export default function GraphicMark({ variant = "asterisk" }) {
  return (
    <svg
      className="graphic-mark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width="1em"
      height="1em"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: "inline-block", flexShrink: 0, verticalAlign: "middle" }}
    >
      {variant === "arrow" ? (
        <path d="M13 51 51 13M13 13h38v38" stroke="currentColor" strokeWidth="7" strokeLinejoin="miter" />
      ) : variant === "plus" ? (
        <path d="M32 7v50M7 32h50" stroke="currentColor" strokeWidth="6" />
      ) : (
        <path d="M32 5v54M5 32h54M13 13l38 38M13 51l38-38" stroke="currentColor" strokeWidth="6" />
      )}
    </svg>
  );
}
