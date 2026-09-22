import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectSkills, fetchGithubRepos, GithubRepo, RateLimitError } from '@/lib/github-api'
import { cleanGithubUsername, isValidGithubUsername } from '@/lib/github-username'

describe('GitHub usernames', () => {
  it.each([
    ['@octocat', 'octocat'],
    ['https://github.com/torvalds?tab=repositories', 'torvalds'],
    ['github.com/octocat/', 'octocat'],
    ['a/../../orgs/nodejs', 'a'],
  ])('cleans %s', (input, expected) => {
    expect(cleanGithubUsername(input)).toBe(expected)
  })

  it('validates GitHub login rules', () => {
    expect(isValidGithubUsername('octo-cat')).toBe(true)
    expect(isValidGithubUsername('-octocat')).toBe(false)
    expect(isValidGithubUsername('octo cat')).toBe(false)
    expect(isValidGithubUsername('a'.repeat(40))).toBe(false)
  })
})

describe('detectSkills', () => {
  const repo = (language: string | null, topics: string[] = []) => ({ language, topics }) as GithubRepo

  it('maps GitHub languages to skill slugs', () => {
    expect(detectSkills([repo('Dart'), repo('Shell'), repo('SCSS')]).sort()).toEqual(['bash', 'dart', 'sass'])
  })

  it('understands common topic spellings and ranks by weight', () => {
    expect(detectSkills([repo(null, ['tailwindcss']), repo('TypeScript'), repo(null, ['postgresql'])])).toEqual([
      'tailwind',
      'postgres',
      'typescript',
    ])
  })
})

describe('fetchGithubRepos', () => {
  afterEach(() => vi.unstubAllGlobals())

  const repos = (count: number, stars: (i: number) => number, fork = false) =>
    Array.from({ length: count }, (_, i) => ({ name: `r${stars(i)}`, stargazers_count: stars(i), fork }))

  it('fetches every page and sorts by stars (the endpoint cannot)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(repos(100, (i) => i)))
      .mockResolvedValueOnce(Response.json([...repos(2, (i) => 1000 + i), ...repos(1, () => 5000, true)]))
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchGithubRepos('octo cat')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.github.com/users/octo%20cat/repos?type=owner&sort=pushed&per_page=100&page=1')
    expect(result.map((r) => r.stargazers_count).slice(0, 3)).toEqual([1001, 1000, 99])
    expect(result.some((r) => r.fork)).toBe(false)
  })

  it('reports rate limiting', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 403, headers: { 'x-ratelimit-remaining': '0' } })))
    await expect(fetchGithubRepos('octocat')).rejects.toBeInstanceOf(RateLimitError)
  })
})
