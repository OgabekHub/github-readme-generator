import type { NextRequest } from 'next/server'

export const TOKEN_COOKIE = 'gh_token'
export const STATE_COOKIE = 'gh_oauth_state'
/** The app only creates/updates the public `username/username` repo, so it never needs private repo access. */
export const OAUTH_SCOPE = 'public_repo'

export function githubApiHeaders(token?: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/**
 * Rejects cross-site browser requests to state-changing endpoints
 * (defense in depth on top of SameSite=Lax cookies).
 * Browsers always send Origin on POST; requests without it are not browser CSRF.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
