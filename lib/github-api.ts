import { SKILL_OPTIONS } from './readme-generator'
import { githubApiHeaders } from './auth'
import { readEnv } from './env'

export { cleanGithubUsername, isValidGithubUsername } from './github-username'

export interface GithubUser {
  login: string
  name: string | null
  bio: string | null
  location: string | null
  public_repos: number
  avatar_url: string
  twitter_username: string | null
  blog: string | null
}

export interface GithubRepo {
  name: string
  description: string | null
  language: string | null
  topics: string[]
  stargazers_count: number
  fork: boolean
}

export interface GithubSocialAccount {
  provider: string  // 'linkedin' | 'twitter' | 'instagram' | 'youtube' | 'facebook' | ...
  url: string
}

const REQUEST_TIMEOUT_MS = 10_000

/** Optional GitHub token — increases rate limit from 60 → 5000 req/hour */
function githubRequest(path: string): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    headers: githubApiHeaders(readEnv('GITHUB_TOKEN')),
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
}

export class RateLimitError extends Error {
  constructor() {
    super('GitHub API rate limit exceeded')
    this.name = 'RateLimitError'
  }
}

function isRateLimited(res: Response): boolean {
  return (
    res.status === 429 ||
    (res.status === 403 &&
      (res.headers.get('x-ratelimit-remaining') === '0' || res.headers.has('retry-after')))
  )
}

// All fetchers expect a username that already passed isValidGithubUsername.

export async function fetchGithubUser(username: string): Promise<GithubUser> {
  const res = await githubRequest(`/users/${encodeURIComponent(username)}`)
  if (res.status === 404) throw new Error('Not Found')
  if (isRateLimited(res)) throw new RateLimitError()
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  return res.json()
}

export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  const res = await githubRequest(`/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=30`)
  if (res.status === 404) throw new Error('Not Found')
  if (isRateLimited(res)) throw new RateLimitError()
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const repos: GithubRepo[] = await res.json()
  return repos.filter((r) => !r.fork)
}

export async function fetchGithubSocials(username: string): Promise<GithubSocialAccount[]> {
  try {
    const res = await githubRequest(`/users/${encodeURIComponent(username)}/social_accounts`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

// ── Language → skillicons.dev slug mapping ──────────────
const LANGUAGE_TO_SKILL: Record<string, string> = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  Java: 'java',
  Go: 'go',
  Rust: 'rust',
  PHP: 'php',
  CSS: 'css',
  HTML: 'html',
  'HTML5': 'html',
  Swift: 'swift',
  Kotlin: 'kotlin',
  'C++': 'cpp',
  'C#': 'cs',
  Dart: 'flutter',
  Vue: 'vue',
  Ruby: 'ruby',
}

/**
 * Analyses a user's public repos and returns a ranked list of skill slugs
 * that match the SKILL_OPTIONS list (for display in ProfileForm).
 */
export function detectSkills(repos: GithubRepo[]): string[] {
  const counts: Record<string, number> = {}

  for (const repo of repos) {
    // Primary language contributes 1 point
    if (repo.language) {
      const slug = LANGUAGE_TO_SKILL[repo.language]
      if (slug) counts[slug] = (counts[slug] || 0) + 1
    }
    // Topics that directly match a skill contribute 2 points
    for (const topic of repo.topics ?? []) {
      if (SKILL_OPTIONS.includes(topic)) {
        counts[topic] = (counts[topic] || 0) + 2
      }
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug]) => slug)
    .filter((s) => SKILL_OPTIONS.includes(s))
}
