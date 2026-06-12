import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  fetchGithubUser,
  fetchGithubRepos,
  fetchGithubSocials,
  detectSkills,
  RateLimitError,
} from '@/lib/github-api'

/** Maps GitHub social provider names → our form field keys */
function mapSocials(socials: { provider: string; url: string }[]) {
  const result: Record<string, string> = {}

  console.log('[analyze] social_accounts raw:', JSON.stringify(socials))

  for (const { provider, url } of socials) {
    const p = provider.toLowerCase()
    const urlLower = url.toLowerCase()

    if (p === 'linkedin' || urlLower.includes('linkedin.com/')) {
      // Store full URL — readme-generator handles both URL and username
      result.linkedin = url
    } else if (p === 'twitter' || p === 'x' || urlLower.includes('twitter.com/') || urlLower.includes('x.com/')) {
      // Extract username from URL, strip queries/anchors/slashes/protocols
      result.twitter = url
        .replace(/^(https?:\/\/)?(www\.)?(twitter|x)\.com\//i, '')
        .split(/[?#]/)[0]
        .replace(/\/$/, '')
        .replace(/^@/, '')
    } else if (p === 'instagram' || urlLower.includes('instagram.com/')) {
      result.instagram = url
        .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
        .split(/[?#]/)[0]
        .replace(/\/$/, '')
        .replace(/^@/, '')
    } else if (p === 'youtube' || urlLower.includes('youtube.com/') || urlLower.includes('youtu.be/')) {
      result.youtube = url
    } else if (p === 'telegram' || urlLower.includes('t.me/') || urlLower.includes('telegram.me/') || urlLower.includes('telegram.dog/')) {
      // Extract username from t.me, telegram.me, or telegram.dog URLs
      result.telegram = url
        .replace(/^(https?:\/\/)?(www\.)?t\.me\//i, '')
        .replace(/^(https?:\/\/)?(www\.)?telegram\.me\//i, '')
        .replace(/^(https?:\/\/)?(www\.)?telegram\.dog\//i, '')
        .split(/[?#]/)[0]
        .replace(/\/$/, '')
        .replace(/^@/, '')
    } else if (p === 'facebook' || urlLower.includes('facebook.com/')) {
      result.facebook = url
    }
  }

  console.log('[analyze] mapped socials:', JSON.stringify(result))
  return result
}

// ── Shared Gemini caller ────────────────────────────────
async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)

  // Models confirmed available — tries in order, uses first that works
  const modelNames = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
  ]

  const errors: string[] = []

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      console.log(`[analyze] ✅ Model: ${modelName}`)
      return result.response.text().trim()
    } catch (e) {
      const msg = e instanceof Error ? e.message.slice(0, 100) : String(e)
      errors.push(`${modelName}: ${msg}`)
      console.warn(`[analyze] ❌ ${modelName}: ${msg}`)
    }
  }

  throw new Error(`All models failed:\n${errors.join('\n')}`)
}

// ── POST /api/analyze ───────────────────────────────────
export async function POST(req: NextRequest) {
  // Parse body
  let username: string
  try {
    const body = await req.json()
    username = (body.username ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!username) {
    return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 })
  }

  // API key guard
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI service is not configured (missing GEMINI_API_KEY)' },
      { status: 503 }
    )
  }

  // ── Try full GitHub analysis ──────────────────────────
  try {
    const [user, repos, socials] = await Promise.all([
      fetchGithubUser(username),
      fetchGithubRepos(username),
      fetchGithubSocials(username),
    ])

    const skills      = detectSkills(repos)
    const socialLinks = mapSocials(socials)

    const topRepos = repos.slice(0, 8).map((r) => r.name).join(', ')
    const languages = [
      ...new Set(repos.map((r) => r.language).filter(Boolean).slice(0, 8)),
    ].join(', ')

    const prompt = `You are helping a software developer write a concise GitHub profile bio.

Based on the following information about them:
- GitHub username: ${user.login}
- Display name: ${user.name ?? 'not set'}
- Current bio: ${user.bio ?? 'none'}
- Location: ${user.location ?? 'unknown'}
- Public repositories: ${user.public_repos}
- Notable repositories: ${topRepos || 'none'}
- Programming languages: ${languages || 'various'}

Write a compelling, developer-focused bio of 2–3 short sentences that:
1. Sounds natural and genuine — not like a CV or job description
2. Highlights what they build or are passionate about
3. May optionally include their location or a fun detail
4. Uses NO first person (no "I", "my", "me")

Return ONLY the bio text, with no quotes, labels, or extra commentary.`

    const bio = await callGemini(apiKey, prompt)

    return NextResponse.json({
      bio,
      skills,
      name:      user.name ?? '',
      location:  user.location ?? '',
      website:   user.blog ?? '',
      twitter:   socialLinks.twitter   ?? user.twitter_username ?? '',
      linkedin:  socialLinks.linkedin  ?? '',
      instagram: socialLinks.instagram ?? '',
      youtube:   socialLinks.youtube   ?? '',
      telegram:  socialLinks.telegram  ?? '',
      facebook:  socialLinks.facebook  ?? '',
    })


  } catch (err: unknown) {
    // ── GitHub rate limit fallback: AI bio from username only ──
    if (err instanceof RateLimitError) {
      console.warn('[analyze] GitHub rate limited — falling back to username-only AI')

      const fallbackPrompt = `Write a short, professional GitHub profile bio (2 sentences max) for a developer with the username "${username}". Sound natural, no first person. Return only the bio text.`

      try {
        const bio = await callGemini(apiKey, fallbackPrompt)
        return NextResponse.json({
          bio,
          skills: [],
          name: '',
          location: '',
          twitter: '',
          website: '',
        })
      } catch {
        return NextResponse.json(
          { error: 'GitHub rate limit reached. Wait ~1 hour or add GITHUB_TOKEN to .env.local' },
          { status: 429 }
        )
      }
    }

    // ── GitHub user not found ──
    const msg = err instanceof Error ? err.message : String(err)
    if (msg === 'Not Found') {
      return NextResponse.json(
        { error: `GitHub user "${username}" not found` },
        { status: 404 }
      )
    }

    // ── Other errors ──
    console.error('[analyze error]', msg)
    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      { error: isDev ? `Debug: ${msg}` : 'Analysis failed — please try again' },
      { status: 500 }
    )
  }
}
