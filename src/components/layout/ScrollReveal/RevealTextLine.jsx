export default function RevealTextLine({ children, innerAttributes = {} }) {
  return (
    <span data-reveal-part="content" className="block overflow-hidden">
      <span data-reveal-inner {...innerAttributes} className="block">
        {children}
      </span>
    </span>
  );
}
