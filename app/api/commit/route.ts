import { NextRequest, NextResponse } from 'next/server'
import { githubApiHeaders, isSameOrigin, TOKEN_COOKIE } from '@/lib/auth'

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

  const github = (path: string, init: RequestInit = {}) =>
    fetch(`https://api.github.com${path}`, {
      ...init,
      headers: { ...githubApiHeaders(token), 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    })
  const githubError = async (res: Response) => ((await res.json().catch(() => ({}))) as { message?: string }).message || 'unknown error'

  try {
    // 1. Get user profile details
    const userRes = await github('/user')
    if (!userRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch GitHub user data. Token might be invalid.', code: 'unauthorized' },
        { status: 401 }
      )
    }

    const userData = await userRes.json()
    const username = encodeURIComponent(userData.login)
    const repoPath = `/repos/${username}/${username}`

    // 2. Check if the special username/username repository exists
    const repoRes = await github(repoPath)
    let created = false
    let isPrivate = false

    if (repoRes.status === 404) {
      const createRes = await github('/user/repos', {
        method: 'POST',
        body: JSON.stringify({
          name: userData.login,
          description: 'Personal profile README created using GitHub README Generator.',
          private: false,
          auto_init: true,
        }),
      })
      if (!createRes.ok) {
        return NextResponse.json(
          { error: `Failed to create profile repository: ${await githubError(createRes)}`, code: 'commit_failed' },
          { status: 502 }
        )
      }
      created = true
    } else if (repoRes.ok) {
      const repo = await repoRes.json()
      if (repo.archived) {
        return NextResponse.json(
          { error: `${userData.login}/${userData.login} is archived and cannot be updated.`, code: 'repo_archived' },
          { status: 409 }
        )
      }
      isPrivate = !!repo.private
    } else {
      return NextResponse.json(
        { error: `Failed to check profile repository: ${await githubError(repoRes)}`, code: 'commit_failed' },
        { status: 502 }
      )
    }

    // 3. Get README.md SHA if it already exists
    const readmeRes = await github(`${repoPath}/contents/README.md`)
    let sha: string | undefined = undefined
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json()
      sha = readmeData.sha
    }

    // 4. Write README.md content to the repository.
    // A just-created repo can take a moment to initialize, so retry briefly instead of a fixed sleep.
    const body = JSON.stringify({
      message: 'docs: update profile README.md via GitHub README Generator',
      content: Buffer.from(markdown).toString('base64'),
      sha,
    })
    let putRes = await github(`${repoPath}/contents/README.md`, { method: 'PUT', body })
    for (let attempt = 1; created && attempt <= 5 && [404, 409, 422].includes(putRes.status); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      const retryReadme = await github(`${repoPath}/contents/README.md`)
      const retrySha = retryReadme.ok ? (await retryReadme.json()).sha : undefined
      putRes = await github(`${repoPath}/contents/README.md`, {
        method: 'PUT',
        body: JSON.stringify({ ...JSON.parse(body), sha: retrySha }),
      })
    }

    if (!putRes.ok) {
      return NextResponse.json(
        { error: `Failed to write README.md: ${await githubError(putRes)}`, code: 'commit_failed' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      url: `https://github.com/${username}/${username}`,
      // A profile README is only shown on the profile when the repo is public
      ...(isPrivate ? { warning: 'private_repo' } : {}),
    })
  } catch (err) {
    console.error('[commit_api_error]', err)
    return NextResponse.json({ error: 'Internal server error', code: 'commit_failed' }, { status: 500 })
  }
}
