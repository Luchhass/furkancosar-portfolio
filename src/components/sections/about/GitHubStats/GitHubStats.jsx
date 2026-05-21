import RevealTextLine from "@/components/layout/ScrollReveal/RevealTextLine";
import RevealCounter from "@/components/ui/RevealCounter/RevealCounter";
import { getGitHubProfileStats } from "@/lib/githubStats";

export default async function GitHubStats() {
  const { username, stats } = await getGitHubProfileStats();

  return (
    <section
      data-header-theme="dark"
      data-scroll-reveal="sequence"
      className="min-h-dvh bg-[#141414] px-8 py-20 text-white md:px-10 md:py-24 lg:px-16 lg:py-32"
      aria-labelledby="github-statistics-title"
    >
      <div className="grid min-h-0 gap-7 md:gap-8 lg:grid-cols-[160px_minmax(0,1fr)_160px] lg:gap-x-5">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          data-reveal-part="kicker"
          className="m-0 w-fit text-sm leading-none font-black tracking-[0.08em] text-white uppercase no-underline transition-colors duration-200 hover:text-white/65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
        >
          <span data-reveal-inner className="block">
            @{username}
          </span>
        </a>

        <div className="min-w-0 lg:col-start-2">
          <h2
            id="github-statistics-title"
            data-reveal-part="title"
            className="m-0 mt-[-0.08em] text-[44px] leading-[0.78] font-black tracking-[-0.04em] uppercase md:text-[80px] lg:text-[120px]"
          >
            <span className="block">GitHub</span>
            <span className="block">Statistics</span>
          </h2>

          <p className="m-0 mt-6 max-w-2xl text-[15px] leading-tight font-medium text-white/55 md:mt-8 md:text-lg">
            <RevealTextLine>
              Real-time insights into development activity. From repository
            </RevealTextLine>
            <RevealTextLine>
              management to commit history, track the development flow.
            </RevealTextLine>
            <RevealTextLine>
              Highlighting the dedication behind exceptional digital
              experiences.
            </RevealTextLine>
          </p>

          <div
            data-reveal-part="content"
            className="mt-8 grid border-t border-white/10 md:mt-10 md:grid-cols-3"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-b border-white/10 py-5 md:border-r md:border-b-0 md:px-6 md:first:pl-0 md:last:border-r-0"
              >
                <p className="m-0 text-[40px] leading-none font-black tracking-[-0.04em] text-white uppercase md:text-[52px]">
                  <RevealCounter value={stat.value} />
                </p>

                <p className="m-0 mt-2 text-xs leading-none font-black tracking-[0.12em] text-white/45 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
