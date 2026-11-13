import ReadingText from "@/components/ui/ReadingText";
import MiniTitleText from "@/components/ui/MiniTitleText";
import TitleLine from "@/components/ui/TitleLine";
import RevealCounter from "@/components/ui/RevealCounter/RevealCounter";
import { getGitHubProfileStats } from "@/lib/githubStats";
import GitHubStatsFrame from "./GitHubStatsFrame";
export default async function GitHubStats() {
  const { username, stats } = await getGitHubProfileStats();

  return (
    <GitHubStatsFrame
      data-header-theme="dark"
      data-scroll-reveal="sequence"
      className="ui-screen ui-fit-panel bg-[#141414] ui-section text-white"
      aria-labelledby="github-statistics-title"
    >
      <div className="ui-section-grid">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          data-reveal-part="kicker"
          className="ui-section-label inline-flex items-center gap-2 text-white"
        >
          <MiniTitleText>@{username}</MiniTitleText>
        </a>

        <div className="ui-section-body">
          <h2
            id="github-statistics-title"
            data-reveal-part="title"
            className="ui-section-title"
          >
            <TitleLine>GitHub</TitleLine>
            <TitleLine>Statistics</TitleLine>
          </h2>

          <ReadingText className="ui-section-copy ui-section-copy-spaced text-white/55">Real-time insights into development activity. From repository management to commit history, track the development flow. Highlighting the dedication behind exceptional digital experiences.</ReadingText>

          <div
            data-reveal-part="content"
            className="ui-stats-grid ui-section-content grid border-t border-white/10"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                data-scene-row
                className="ui-stat-cell border-b border-white/10"
              >
                <p className="ui-stat-value m-0 leading-none font-black tracking-[-0.04em] text-white uppercase">
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
    </GitHubStatsFrame>
  );
}
