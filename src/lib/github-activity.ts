import { redis } from './redis';
import type { GitHubActivity, GitHubRepo } from './chat/protocol';

// Live GitHub activity for the chat assistant: contributions over the last
// year and the repos he pushed to most recently, with their latest commits.

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_LOGIN = 'RutwikPatel13';

/** GitHub changes on the scale of hours; an hour keeps the API out of the hot path. */
const CACHE_KEY = 'chat:github:v7';
const CACHE_TTL_SECONDS = 60 * 60;

// Public repos the assistant should not volunteer to visitors.
// TEMPORARILY HIDDEN (2026-08-29): miniredis is off the public site.
// TEMPORARILY HIDDEN (2026-09-29): so is xbook.
// netflix-clone's latest commit is about removing leaked API keys, which is
// not what a recruiter should see first. magistrala-choovio-pilot is a
// submission for one company, named unlike the take-homes caught below.
const HIDDEN_REPOS = new Set([
  'miniredis',
  'xbook',
  'netflix-clone',
  'magistrala-choovio-pilot',
]);

// Take-home assignments for a specific company (hiver-challenge,
// securebank-challenge, healthcare-api-assessment) are not portfolio work.
const isTakeHome = (name: string) => /-(challenge|assessment)$/i.test(name);

// The profile README repo shares the login's name and holds no code.
const isHidden = (name: string) =>
  HIDDEN_REPOS.has(name) || isTakeHome(name) || name === GITHUB_LOGIN;

const RECENT_DAYS = 84;
const REPO_COUNT = 5;
/** Fetched with headroom so hidden repos can be dropped and still leave REPO_COUNT. */
const REPO_FETCH_COUNT = 20;
const COMMITS_PER_REPO = 2;

const query = `
  query($login: String!) {
    user(login: $login) {
      url
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { contributionCount } }
        }
      }
      repositories(first: ${REPO_FETCH_COUNT}, privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false,
                   orderBy: { field: PUSHED_AT, direction: DESC }) {
        nodes {
          name url description pushedAt stargazerCount
          primaryLanguage { name }
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 8) { nodes { messageHeadline committedDate } }
              }
            }
          }
        }
      }
    }
  }
`;

interface RepoNode {
  name: string;
  url: string;
  description: string | null;
  pushedAt: string;
  stargazerCount: number;
  primaryLanguage: { name: string } | null;
  defaultBranchRef: {
    target: { history?: { nodes: { messageHeadline: string; committedDate: string }[] } };
  } | null;
}

// A merge commit says a PR landed, not what it did; the commits under it do.
const isMerge = (message: string) => /^Merge (pull request|branch|remote-tracking)/.test(message);

async function fetchFromGitHub(token: string): Promise<GitHubActivity> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: GITHUB_LOGIN } }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

  const body = await response.json();
  if (body.errors) throw new Error(body.errors[0]?.message ?? 'GitHub GraphQL error');
  const user = body.data?.user;
  if (!user) throw new Error('GitHub user not found');

  const calendar = user.contributionsCollection.contributionCalendar;
  const days: number[] = calendar.weeks.flatMap(
    (w: { contributionDays: { contributionCount: number }[] }) =>
      w.contributionDays.map((d) => d.contributionCount)
  );

  const repos: GitHubRepo[] = (user.repositories.nodes as RepoNode[])
    .filter((repo) => !isHidden(repo.name))
    .slice(0, REPO_COUNT)
    .map((repo) => ({
      name: repo.name,
      url: repo.url,
      description: repo.description,
      language: repo.primaryLanguage?.name ?? null,
      stars: repo.stargazerCount,
      pushedAt: repo.pushedAt,
      commits: (repo.defaultBranchRef?.target.history?.nodes ?? [])
        .filter((c) => !isMerge(c.messageHeadline))
        .slice(0, COMMITS_PER_REPO)
        .map((c) => ({ message: c.messageHeadline, date: c.committedDate })),
    }));

  return {
    login: GITHUB_LOGIN,
    url: user.url,
    totalContributions: calendar.totalContributions,
    recentDays: days.slice(-RECENT_DAYS),
    repos,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getGitHubActivity(): Promise<GitHubActivity> {
  try {
    const cached = await redis.get<GitHubActivity>(CACHE_KEY);
    if (cached) return cached;
  } catch (error) {
    console.error('GitHub activity cache read failed:', error);
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not configured');
  const activity = await fetchFromGitHub(token);

  try {
    await redis.set(CACHE_KEY, activity, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.error('GitHub activity cache write failed:', error);
  }
  return activity;
}
