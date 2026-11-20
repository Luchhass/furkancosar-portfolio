import GradientActionButton from "@/components/ui/GradientActionButton/GradientActionButton";
import RevealCounter from "@/components/ui/RevealCounter/RevealCounter";
import ReadingText from "@/components/ui/ReadingText";
import { useLocalizedContent } from "@/lib/localizeContent";

export default function HeroFooter({ stat, action, copyLines, copyClassName }) {
  const localize = useLocalizedContent();
  return localize(
    <div
      data-hero-fullscreen-hide
      className="relative z-10 row-start-3 grid w-full grid-cols-2 items-end gap-4 self-end xl:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] xl:gap-x-6"
    >
      {stat && (
        <div
          data-hero-exit="stat"
          className="pointer-events-auto col-start-1 row-start-2 min-w-0 overflow-hidden pr-3 xl:row-start-1 xl:pr-0"
          aria-label={stat.ariaLabel}
        >
          <div data-hero-stat className="flex items-end gap-1 md:gap-2 xl:gap-3">
            <span className="ui-hero-counter text-[56px] leading-[0.82] font-black">
              <RevealCounter
                value={stat.value}
                textClassName="gradient-text-flow"
              />
            </span>

            <p className="ui-hero-stat-label m-0 min-w-0 text-[16px] leading-tight font-medium text-white/90 md:text-[18px] xl:text-[20px]">
              {stat.labelLines.map((line, index) => (
                <span key={line} className={index > 0 ? "hidden md:block" : "block"}>
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      <p
        data-hero-exit="copy"
        className={`ui-hero-copy col-span-2 row-start-1 m-0 w-full max-w-[46ch] justify-self-center text-center font-medium text-white/90 xl:col-span-1 xl:col-start-2 xl:max-w-md ${copyClassName}`}
      >
        <ReadingText as="span" waitForIntro className="block text-wrap md:hidden">{copyLines.join(" ")}</ReadingText>
        <ReadingText as="span" waitForIntro className="hidden md:block">
          {copyLines.map(line => <span key={line} className="block text-wrap">{line}</span>)}
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
