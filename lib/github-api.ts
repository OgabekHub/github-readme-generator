import { SKILL_OPTIONS } from './readme-generator'

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

/** Optional GitHub token — increases rate limit from 60 → 5000 req/hour */
function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN
  return {
    Accept: 'application/vnd.github.v3+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export class RateLimitError extends Error {
  constructor() {
    super('GitHub API rate limit exceeded')
    this.name = 'RateLimitError'
  }
}

/**
 * Cleans a GitHub username input, extracting the raw username if a URL or @ prefix is provided.
 */
export function cleanGithubUsername(input: string): string {
  let cleaned = input.trim()

  // Remove leading @ if present
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.substring(1)
  }

  // If it's a URL or contains slashes
  if (cleaned.includes('/') || cleaned.toLowerCase().includes('github.com')) {
    try {
      // Ensure it has a protocol for URL parsing
      let urlString = cleaned
      if (!/^https?:\/\//i.test(urlString)) {
        urlString = 'https://' + urlString
      }
      const url = new URL(urlString)
      if (url.hostname.toLowerCase().includes('github.com')) {
        const segments = url.pathname.split('/').filter(Boolean)
        if (segments.length > 0) {
          cleaned = segments[0]
        }
      }
    } catch {
      // Fallback: split by slashes and get username
      const parts = cleaned.split('/').filter(Boolean)
      const githubIndex = parts.findIndex(p => p.toLowerCase().includes('github.com'))
      if (githubIndex !== -1 && parts[githubIndex + 1]) {
        cleaned = parts[githubIndex + 1]
      } else {
        cleaned = parts[parts.length - 1] || cleaned
      }
    }
  }

  // Strip query params/hash if they exist
  cleaned = cleaned.split(/[?#]/)[0]

  return cleaned.trim()
}

export async function fetchGithubUser(username: string): Promise<GithubUser> {
  const cleaned = cleanGithubUsername(username)
  const res = await fetch(`https://api.github.com/users/${cleaned}`, {
    headers: githubHeaders(),
    cache: 'no-store',
  })
  if (res.status === 404) throw new Error('Not Found')
  if (res.status === 403 || res.status === 429) throw new RateLimitError()
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  return res.json()
}

export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  const cleaned = cleanGithubUsername(username)
  const res = await fetch(
    `https://api.github.com/users/${cleaned}/repos?sort=stars&per_page=30`,
    {
      headers: githubHeaders(),
      cache: 'no-store',
    }
  )
  if (res.status === 404) throw new Error('Not Found')
  if (res.status === 403 || res.status === 429) throw new RateLimitError()
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const repos: GithubRepo[] = await res.json()
  return repos.filter((r) => !r.fork)
}

export async function fetchGithubSocials(username: string): Promise<GithubSocialAccount[]> {
  try {
    const cleaned = cleanGithubUsername(username)
    const res = await fetch(
      `https://api.github.com/users/${cleaned}/social_accounts`,
      { headers: githubHeaders(), cache: 'no-store' }
    )
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
