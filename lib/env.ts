/**
 * Reads a server env var, treating empty values and the `.env.local.example`
 * placeholders ("your_…_here") as unset — a placeholder GITHUB_TOKEN would
 * otherwise make GitHub reject every request with 401.
 */
export function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value && !/^your_/i.test(value) ? value : undefined
}
