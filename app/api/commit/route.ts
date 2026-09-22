import { NextRequest, NextResponse } from 'next/server'
import { isSameOrigin, TOKEN_COOKIE } from '@/lib/auth'

const MAX_MARKDOWN_LENGTH = 200_000

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden', code: 'forbidden' }, { status: 403 })
  }

  const token = req.cookies.get(TOKEN_COOKIE)?.value
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized. Please connect with GitHub first.', code: 'unauthorized' },
      { status: 401 }
    )
  }

  let markdown: unknown
  try {
    markdown = (await req.json())?.markdown
  } catch {
    return NextResponse.json({ error: 'Invalid request body.', code: 'invalid_request' }, { status: 400 })
  }

  if (typeof markdown !== 'string' || !markdown.trim()) {
    return NextResponse.json({ error: 'Markdown content is required.', code: 'markdown_required' }, { status: 400 })
  }
  if (markdown.length > MAX_MARKDOWN_LENGTH) {
    return NextResponse.json({ error: 'README is too large.', code: 'markdown_too_large' }, { status: 413 })
  }

  try {
    // 1. Get user profile details
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    })

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch GitHub user data. Token might be invalid.' }, { status: 401 })
    }

    const userData = await userRes.json()
    const username = encodeURIComponent(userData.login)

    // 2. Check if username/username repository exists
    const repoRes = await fetch(`https://api.github.com/repos/${username}/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    })

    if (repoRes.status === 404) {
      // Create the special profile repository
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.login,
          description: 'Personal profile README created using GitHub README Generator.',
          private: false,
          auto_init: true,
        }),
      })

      if (!createRes.ok) {
        const errData = await createRes.json()
        return NextResponse.json(
          { error: `Failed to create profile repository: ${errData.message || 'unknown error'}` },
          { status: 500 }
        )
      }

      // Wait a moment for GitHub to finalize repository initialization
      await new Promise((resolve) => setTimeout(resolve, 2500))
    }

    // 3. Get README.md SHA if it already exists
    const readmeRes = await fetch(`https://api.github.com/repos/${username}/${username}/contents/README.md`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    })

    let sha: string | undefined = undefined
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json()
      sha = readmeData.sha
    }

    // 4. Write README.md content to the repository
    const base64Content = Buffer.from(markdown).toString('base64')
    const putRes = await fetch(`https://api.github.com/repos/${username}/${username}/contents/README.md`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'docs: update profile README.md via GitHub README Generator',
        content: base64Content,
        sha,
      }),
    })

    if (!putRes.ok) {
      const errData = await putRes.json()
      return NextResponse.json(
        { error: `Failed to write README.md: ${errData.message || 'unknown error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, url: `https://github.com/${username}/${username}` })
  } catch (err) {
    console.error('[commit_api_error]', err)
    return NextResponse.json({ error: 'Internal server error', code: 'commit_failed' }, { status: 500 })
  }
}
