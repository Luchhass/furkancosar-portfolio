import { getGitHubProfileStats } from "@/lib/githubStats";
import GitHubStatsFrame from "./GitHubStatsFrame";

export default async function GitHubStats() {
  return <GitHubStatsFrame {...await getGitHubProfileStats()} />;
}
