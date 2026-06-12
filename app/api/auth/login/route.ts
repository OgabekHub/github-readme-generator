import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const client_id = process.env.GITHUB_CLIENT_ID
  if (!client_id) {
    return NextResponse.json(
      { error: 'GitHub OAuth Client ID is not configured. Please add GITHUB_CLIENT_ID to .env.local' },
      { status: 500 }
    )
  }

  const origin = new URL(req.url).origin
  const redirect_uri = `${origin}/api/auth/callback`

  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&scope=repo`

  return NextResponse.redirect(githubUrl)
}
