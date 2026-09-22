import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as banner } from '@/app/api/banner/route'
import { GET as login } from '@/app/api/auth/login/route'
import { GET as callback } from '@/app/api/auth/callback/route'
import { POST as logout } from '@/app/api/auth/logout/route'
import { POST as commit } from '@/app/api/commit/route'
import { rateLimit } from '@/lib/rate-limit'

const BASE = 'http://localhost:3000'

describe('/api/banner', () => {
  it('escapes name and title so the SVG cannot run scripts', async () => {
    const res = await banner(new NextRequest(`${BASE}/api/banner?name=${encodeURIComponent('<script>x</script>')}&title=R%26D`))
    const svg = await res.text()
    expect(svg).toContain('&lt;script&gt;x&lt;/script&gt;')
    expect(svg).toContain('R&amp;D')
    expect(svg).not.toContain('<script>')
    expect(res.headers.get('content-security-policy')).toBe("default-src 'none'; style-src 'unsafe-inline'")
  })

  it('supports every UI theme and ignores prototype keys', async () => {
    const nord = await (await banner(new NextRequest(`${BASE}/api/banner?theme=nord`))).text()
    expect(nord).toContain('stop-color="#2e3440"')
    const proto = await (await banner(new NextRequest(`${BASE}/api/banner?theme=__proto__`))).text()
    expect(proto).toContain('stop-color="#0a0a0f"') // radical
  })
})

describe('GitHub OAuth', () => {
  beforeEach(() => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'client-id')
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'client-secret')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('asks for public_repo only and sets a one-time state', async () => {
    const res = await login(new NextRequest(`${BASE}/api/auth/login`))
    const location = new URL(res.headers.get('location')!)
    expect(location.origin).toBe('https://github.com')
    expect(location.searchParams.get('scope')).toBe('public_repo')
    const state = location.searchParams.get('state')
    expect(state).toMatch(/^[0-9a-f]{32}$/)
    expect(res.cookies.get('gh_oauth_state')?.value).toBe(state)
  })

  it('treats .env.local.example placeholders as not configured', async () => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'your_github_client_id_here')
    const res = await login(new NextRequest(`${BASE}/api/auth/login`))
    expect(res.headers.get('location')).toBe(`${BASE}/?error=oauth_not_configured`)
  })

  it('rejects a callback whose state does not match', async () => {
    const req = new NextRequest(`${BASE}/api/auth/callback?code=abc&state=forged`, { headers: { cookie: 'gh_oauth_state=real' } })
    expect((await callback(req)).headers.get('location')).toBe(`${BASE}/?error=invalid_state`)
  })

  it('reports a cancelled authorization', async () => {
    const req = new NextRequest(`${BASE}/api/auth/callback?error=access_denied`)
    expect((await callback(req)).headers.get('location')).toBe(`${BASE}/?error=access_denied`)
  })
})

describe('state-changing endpoints', () => {
  const post = (path: string, init: { origin?: string; cookie?: string; body?: unknown } = {}) =>
    new NextRequest(`${BASE}${path}`, {
      method: 'POST',
      headers: {
        host: 'localhost:3000',
        'content-type': 'application/json',
        ...(init.origin ? { origin: init.origin } : {}),
        ...(init.cookie ? { cookie: init.cookie } : {}),
      },
      body: JSON.stringify(init.body ?? {}),
    })

  it('rejects cross-site requests', async () => {
    expect((await commit(post('/api/commit', { origin: 'https://evil.example', cookie: 'gh_token=t' }))).status).toBe(403)
    expect((await logout(post('/api/auth/logout', { origin: 'https://evil.example' }))).status).toBe(403)
  })

  it('requires a session and a markdown string', async () => {
    expect((await commit(post('/api/commit', { origin: BASE }))).status).toBe(401)
    const res = await commit(post('/api/commit', { origin: BASE, cookie: 'gh_token=t', body: { markdown: 42 } }))
    expect(res.status).toBe(400)
    expect((await res.json()).code).toBe('markdown_required')
  })
})

describe('rateLimit', () => {
  it('blocks after the limit until the window resets', () => {
    vi.useFakeTimers()
    const key = `test-${Math.random()}`
    expect(rateLimit(key, 2, 1000).ok).toBe(true)
    expect(rateLimit(key, 2, 1000).ok).toBe(true)
    expect(rateLimit(key, 2, 1000)).toEqual({ ok: false, retryAfter: 1 })
    vi.advanceTimersByTime(1001)
    expect(rateLimit(key, 2, 1000).ok).toBe(true)
    vi.useRealTimers()
  })
})
