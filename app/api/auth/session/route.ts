import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('gh_token')?.value

  if (!token) {
    return NextResponse.json({ loggedIn: false })
  }

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    })

    if (!userRes.ok) {
      // Token might have been revoked or expired
      const response = NextResponse.json({ loggedIn: false })
      response.cookies.delete('gh_token')
      return response
    }

    const userData = await userRes.json()

    return NextResponse.json({
      loggedIn: true,
      username: userData.login,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
    })
  } catch (err) {
    console.error('[session_api_error]', err)
    return NextResponse.json({ loggedIn: false })
  }
}
