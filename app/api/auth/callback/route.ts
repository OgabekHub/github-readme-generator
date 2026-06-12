import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', req.url))
  }

  const client_id = process.env.GITHUB_CLIENT_ID
  const client_secret = process.env.GITHUB_CLIENT_SECRET

  if (!client_id || !client_secret) {
    return NextResponse.json(
      { error: 'GitHub OAuth Client ID or Client Secret is not configured. Please add them to .env.local' },
      { status: 500 }
    )
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
      }),
    })

    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(tokenData.error_description || 'oauth_error')}`, req.url)
      )
    }

    const access_token = tokenData.access_token
    if (!access_token) {
      return NextResponse.redirect(new URL('/?error=no_token', req.url))
    }

    // Redirect back to landing page and store the token in a secure http-only cookie
    const response = NextResponse.redirect(new URL('/', req.url))
    response.cookies.set('gh_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    console.error('[oauth_callback_error]', err)
    return NextResponse.redirect(new URL('/?error=callback_failed', req.url))
  }
}
