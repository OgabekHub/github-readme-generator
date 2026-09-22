import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { OAUTH_SCOPE, STATE_COOKIE } from '@/lib/auth'
import { readEnv } from '@/lib/env'

export async function GET(req: NextRequest) {
  const client_id = readEnv('GITHUB_CLIENT_ID')
  if (!client_id || !readEnv('GITHUB_CLIENT_SECRET')) {
    return NextResponse.redirect(new URL('/?error=oauth_not_configured', req.url))
  }

  const origin = new URL(req.url).origin
  const state = randomBytes(16).toString('hex')

  const githubUrl = new URL('https://github.com/login/oauth/authorize')
  githubUrl.searchParams.set('client_id', client_id)
  githubUrl.searchParams.set('redirect_uri', `${origin}/api/auth/callback`)
  githubUrl.searchParams.set('scope', OAUTH_SCOPE)
  githubUrl.searchParams.set('state', state)

  // The callback only accepts the code together with this one-time state (OAuth CSRF protection)
  const response = NextResponse.redirect(githubUrl)
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 10 * 60,
  })
  return response
}
