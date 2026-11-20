import GradientActionButton from "@/components/ui/GradientActionButton/GradientActionButton";
import RevealCounter from "@/components/ui/RevealCounter/RevealCounter";
import ReadingText from "@/components/ui/ReadingText";
import { useLocalizedContent } from "@/lib/localizeContent";

export default function HeroFooter({ stat, action, copyLines, copyClassName }) {
  const localize = useLocalizedContent();
  const [completed, ...projects] = stat?.label.split(" ") ?? [];
  return localize(
    <div
      data-hero-fullscreen-hide
      className="relative z-10 row-start-3 grid w-full grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2 gap-y-4 self-end sm:gap-x-3 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-x-6"
    >
      {stat && (
        <div
          data-hero-exit="stat"
          className="ui-hero-stat-window pointer-events-auto col-start-1 row-start-2 min-w-0 overflow-hidden xl:row-start-1"
          aria-label={stat.ariaLabel}
        >
          <div data-hero-stat className="flex items-center gap-1 md:gap-3 xl:items-end xl:gap-4">
            <span className="ui-hero-counter shrink-0 font-black">
              <RevealCounter
                value={stat.value}
                textClassName="gradient-text-flow"
              />
            </span>

            <p className="ui-hero-stat-label m-0 min-w-0 font-medium text-white/90">
              <span>{completed}{" "}</span>
              <span>{projects.join(" ")}</span>
            </p>
          </div>
        </div>
      )}

      <p
        data-hero-exit="copy"
        className={`ui-hero-copy col-span-2 row-start-1 m-0 w-full justify-self-center text-center font-medium text-white/90 xl:col-span-1 xl:col-start-2 ${copyClassName}`}
      >
        <ReadingText as="span" waitForIntro spreadLines className="ui-hero-copy-lines block">
          {copyLines.map(line => <span key={line} className="ui-hero-copy-line block">{line}{" "}</span>)}
        </ReadingText>
      </p>

      {action && (
        <div data-hero-exit="action" className="col-start-2 row-start-2 flex justify-end overflow-hidden xl:col-start-3 xl:row-start-1">
          <div data-hero-button>
            <GradientActionButton {...action} />
          </div>
        </div>
      )}
    </div>
  );
}
