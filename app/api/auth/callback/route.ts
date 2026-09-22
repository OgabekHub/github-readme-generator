import { NextRequest, NextResponse } from 'next/server'
import { STATE_COOKIE, TOKEN_COOKIE } from '@/lib/auth'
import { readEnv } from '@/lib/env'

/** Redirects back to the app; the page shows a translated message for the error code. */
function redirectHome(req: NextRequest, query: string) {
  const response = NextResponse.redirect(new URL(`/?${query}`, req.url))
  response.cookies.delete({ name: STATE_COOKIE, path: '/api/auth' })
  return response
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const expectedState = req.cookies.get(STATE_COOKIE)?.value

  // User pressed "Cancel" on GitHub
  if (searchParams.get('error')) {
    return redirectHome(req, 'error=access_denied')
  }
  if (!code) {
    return redirectHome(req, 'error=no_code')
  }
  if (!state || !expectedState || state !== expectedState) {
    return redirectHome(req, 'error=invalid_state')
  }

  const client_id = readEnv('GITHUB_CLIENT_ID')
  const client_secret = readEnv('GITHUB_CLIENT_SECRET')
  if (!client_id || !client_secret) {
    return redirectHome(req, 'error=oauth_not_configured')
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
        redirect_uri: `${new URL(req.url).origin}/api/auth/callback`,
      }),
      signal: AbortSignal.timeout(10_000),
    })

    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      console.error('[oauth_callback_error]', tokenData.error, tokenData.error_description)
      return redirectHome(req, 'error=oauth_error')
    }

    const access_token = tokenData.access_token
    if (!access_token) {
      return redirectHome(req, 'error=no_token')
    }

    // Redirect back to the page and store the token in a secure http-only cookie
    const response = redirectHome(req, 'connected=1')
    response.cookies.set(TOKEN_COOKIE, access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    console.error('[oauth_callback_error]', err)
    return redirectHome(req, 'error=callback_failed')
  }
}
