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

const REPOS_PER_PAGE = 100
const MAX_REPO_PAGES = 3

/**
 * The user's own non-fork repos, most-starred first.
 * The /users/{user}/repos endpoint cannot sort by stars, so the (up to 300 most
 * recently pushed) repos are fetched and sorted here.
 */
export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  const repos: GithubRepo[] = []
  for (let page = 1; page <= MAX_REPO_PAGES; page++) {
    const res = await githubRequest(
      `/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=${REPOS_PER_PAGE}&page=${page}`
    )
    if (res.status === 404) throw new Error('Not Found')
    if (isRateLimited(res)) throw new RateLimitError()
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
    const batch: GithubRepo[] = await res.json()
    repos.push(...batch)
    if (batch.length < REPOS_PER_PAGE) break
  }
  return repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
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

// ── GitHub language → skillicons.dev slug mapping ───────
const LANGUAGE_TO_SKILL: Record<string, string> = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  'Jupyter Notebook': 'python',
  Java: 'java',
  Go: 'go',
  Rust: 'rust',
  PHP: 'php',
  Blade: 'laravel',
  CSS: 'css',
  SCSS: 'sass',
  Sass: 'sass',
  HTML: 'html',
  Swift: 'swift',
  Kotlin: 'kotlin',
  'C++': 'cpp',
  'C#': 'cs',
  Dart: 'dart',
  Vue: 'vue',
  Svelte: 'svelte',
  Ruby: 'ruby',
  Shell: 'bash',
  Dockerfile: 'docker',
  HCL: 'terraform',
  Solidity: 'solidity',
}

// Common GitHub topic spellings that differ from the skill slug
const TOPIC_TO_SKILL: Record<string, string> = {
  reactjs: 'react', 'react-js': 'react', 'react-native': 'react',
  next: 'nextjs', 'next-js': 'nextjs', vuejs: 'vue', 'vue-js': 'vue', angularjs: 'angular', sveltekit: 'svelte',
  tailwindcss: 'tailwind', 'tailwind-css': 'tailwind', scss: 'sass', vitejs: 'vite', 'redux-toolkit': 'redux',
  node: 'nodejs', 'node-js': 'nodejs', expressjs: 'express', 'express-js': 'express',
  golang: 'go', csharp: 'cs', 'c-sharp': 'cs', dotnet: 'cs', 'c-plus-plus': 'cpp', flutter: 'dart',
  postgresql: 'postgres', mongo: 'mongodb', mongoose: 'mongodb', 'spring-boot': 'spring', springboot: 'spring',
  'ruby-on-rails': 'rails', 'django-rest-framework': 'django', k8s: 'kubernetes', shell: 'bash',
  'amazon-web-services': 'aws', 'google-cloud': 'gcp', 'google-cloud-platform': 'gcp', 'github-actions': 'github',
  jupyter: 'python', 'jupyter-notebook': 'python',
}

/**
 * Analyses a user's public repos and returns a ranked list of skill slugs
 * that match the SKILL_OPTIONS list (for display in ProfileForm).
 */
export function detectSkills(repos: GithubRepo[]): string[] {
  const counts: Record<string, number> = {}
  const add = (slug: string | undefined, points: number) => {
    if (slug && SKILL_OPTIONS.includes(slug)) counts[slug] = (counts[slug] || 0) + points
  }

  for (const repo of repos) {
    // Primary language contributes 1 point
    if (repo.language && Object.hasOwn(LANGUAGE_TO_SKILL, repo.language)) add(LANGUAGE_TO_SKILL[repo.language], 1)
    // Topics that match a skill contribute 2 points
    for (const topic of repo.topics ?? []) {
      add(Object.hasOwn(TOPIC_TO_SKILL, topic) ? TOPIC_TO_SKILL[topic] : topic, 2)
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug]) => slug)
}
