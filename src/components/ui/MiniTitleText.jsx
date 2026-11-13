export default function MiniTitleText({ children }) {
  return <span className="mini-title-mask"><span data-mini-title-inner>{children}</span></span>;
}
