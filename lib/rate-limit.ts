import type { NextRequest } from 'next/server'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/**
 * Fixed-window in-memory rate limiter.
 * Limits are per server instance — for strict limits across serverless
 * instances, back this with a shared store (e.g. Redis / Vercel KV).
 */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now()

  if (buckets.size > 10_000) {
    buckets.forEach((b, k) => {
      if (b.resetAt <= now) buckets.delete(k)
    })
  }

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  bucket.count++
  return { ok: true, retryAfter: 0 }
}

/** Client IP as reported by the hosting proxy (Vercel sets x-real-ip / x-forwarded-for). */
export function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  )
}
