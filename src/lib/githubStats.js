const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const GITHUB_USERNAME = "luchhass";
const REPOSITORIES_PER_PAGE = 25;
const MAX_RETRIES = 2;

const fallbackStats = {
  username: GITHUB_USERNAME,
  stats: [
    {
      value: "24",
      label: "Repositories",
    },
    {
      value: "640",
      label: "Commits",
    },
    {
      value: "JavaScript",
      label: "Most Used Language",
    },
  ],
};

const githubStatsQuery = `
  query PortfolioGithubStats($login: String!, $after: String, $first: Int!) {
    user(login: $login) {
      repositories(
        first: $first
        after: $after
        ownerAffiliations: OWNER
        isFork: false
        privacy: PUBLIC
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          defaultBranchRef {
            target {
              ... on Commit {
                history {
                  totalCount
                }
              }
            }
          }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
              }
            }
          }
        }
      }
    }
  }
`;

function getToken() {
  return process.env.GITHUB_TOKEN?.trim();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMostUsedLanguage(repositories) {
  const languageSizes = new Map();

  repositories.forEach((repository) => {
    repository.languages?.edges?.forEach((edge) => {
      const languageName = edge.node?.name;

      if (!languageName) return;

      languageSizes.set(
        languageName,
        (languageSizes.get(languageName) || 0) + (edge.size || 0),
      );
    });
  });

  return (
    Array.from(languageSizes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    fallbackStats.stats[2].value
  );
}

async function requestGitHubStatsPage({ token, after }) {
  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: githubStatsQuery,
      variables: {
        login: GITHUB_USERNAME,
        after,
        first: REPOSITORIES_PER_PAGE,
      },
    }),
    next: {
      revalidate: 3600,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      statusText: response.statusText,
      message: payload?.message,
      errors: payload?.errors,
      repositories: null,
    };
  }

  if (payload?.errors?.length) {
    return {
      ok: false,
      status: response.status,
      statusText: response.statusText,
      message: "GraphQL response contains errors.",
      errors: payload.errors,
      repositories: null,
    };
  }

  return {
    ok: true,
    status: response.status,
    statusText: response.statusText,
    message: null,
    errors: null,
    repositories: payload?.data?.user?.repositories || null,
  };
}

async function fetchGitHubStatsPage({ token, after }) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const result = await requestGitHubStatsPage({ token, after });

    if (result.ok) {
      return result.repositories;
    }

    const shouldRetry =
      result.status === 502 || result.status === 503 || result.status === 504;

    if (!shouldRetry || attempt === MAX_RETRIES) {
      console.warn("GitHub statistics request failed:", {
        status: result.status,
        statusText: result.statusText,
        message: result.message,
        errors: result.errors,
        tokenExists: Boolean(token),
        tokenLength: token?.length,
      });

      return null;
    }

    await wait(450 * (attempt + 1));
  }

  return null;
}

export async function getGitHubProfileStats() {
  const token = getToken();

  if (!token) return fallbackStats;

  try {
    let after = null;
    let repositoryCount = 0;
    const repositories = [];

    do {
      const page = await fetchGitHubStatsPage({ token, after });

      if (!page) return fallbackStats;

      repositoryCount = page.totalCount;
      repositories.push(...(page.nodes || []));
      after = page.pageInfo?.hasNextPage ? page.pageInfo.endCursor : null;
    } while (after);

    const commitCount = repositories.reduce(
      (total, repository) =>
        total + (repository.defaultBranchRef?.target?.history?.totalCount || 0),
      0,
    );

    const mostUsedLanguage = getMostUsedLanguage(repositories);

    return {
      username: GITHUB_USERNAME,
      stats: [
        {
          value: String(repositoryCount),
          label: "Repositories",
        },
        {
          value: String(commitCount),
          label: "Commits",
        },
        {
          value: mostUsedLanguage,
          label: "Most Used Language",
        },
      ],
    };
  } catch (error) {
    console.warn("GitHub statistics fallback used:", {
      message: error?.message,
    });

    return fallbackStats;
  }
}
