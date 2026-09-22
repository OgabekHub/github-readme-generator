import { NextRequest, NextResponse } from 'next/server'
import { isSameOrigin, TOKEN_COOKIE } from '@/lib/auth'
import { readEnv } from '@/lib/env'

/** Revokes the OAuth token on GitHub so it stops working even if it leaked. */
async function revokeToken(token: string) {
  const clientId = readEnv('GITHUB_CLIENT_ID')
  const clientSecret = readEnv('GITHUB_CLIENT_SECRET')
  if (!clientId || !clientSecret) return

  try {
    await fetch(`https://api.github.com/applications/${encodeURIComponent(clientId)}/token`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ access_token: token }),
      signal: AbortSignal.timeout(5_000),
    })
  } catch (err) {
    console.error('[logout] token revoke failed', err)
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden', code: 'forbidden' }, { status: 403 })
  }

  const token = req.cookies.get(TOKEN_COOKIE)?.value
  if (token) await revokeToken(token)

  const response = NextResponse.json({ success: true })
  response.cookies.delete(TOKEN_COOKIE)
  return response
}
