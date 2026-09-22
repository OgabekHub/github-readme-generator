// Isomorphic helpers — safe to import from both client components and API routes.

/** GitHub logins: letters, digits and hyphens, max 39 chars, not starting with a hyphen. */
const USERNAME_RE = /^[a-z\d][a-z\d-]{0,38}$/i

export function isValidGithubUsername(value: string): boolean {
  return USERNAME_RE.test(value)
}

/**
 * Cleans a GitHub username input, extracting the raw username if a URL or @ prefix is provided.
 * The result still has to pass isValidGithubUsername before it is used in a request.
 */
export function cleanGithubUsername(input: string): string {
  let cleaned = input.trim().replace(/^@/, '')

  const fromUrl = cleaned.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#\s]+)/i)
  if (fromUrl) cleaned = fromUrl[1]

  // Keep only the first path segment and drop query params/hash
  return cleaned.split(/[/?#]/)[0].trim()
}
