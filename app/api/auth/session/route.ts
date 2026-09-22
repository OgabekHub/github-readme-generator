import { NextRequest, NextResponse } from 'next/server'
import { githubApiHeaders, TOKEN_COOKIE } from '@/lib/auth'

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ loggedIn: false }, { headers: NO_STORE })
  }

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: githubApiHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })

    if (!userRes.ok) {
      // Token might have been revoked or expired
      const response = NextResponse.json({ loggedIn: false }, { headers: NO_STORE })
      response.cookies.delete(TOKEN_COOKIE)
      return response
    }

    const userData = await userRes.json()

    return NextResponse.json(
      {
        loggedIn: true,
        username: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
      },
      { headers: NO_STORE }
    )
  } catch (err) {
    console.error('[session_api_error]', err)
    return NextResponse.json({ loggedIn: false }, { headers: NO_STORE })
  }
}
