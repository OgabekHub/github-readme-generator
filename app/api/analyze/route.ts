import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  fetchGithubUser,
  fetchGithubRepos,
  fetchGithubSocials,
  detectSkills,
  RateLimitError,
  cleanGithubUsername,
  isValidGithubUsername,
} from '@/lib/github-api'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { readEnv } from '@/lib/env'

const TONES = ['professional', 'minimalist', 'creative', 'hacker'] as const
type Tone = (typeof TONES)[number]

const MAX_INSTRUCTIONS_LENGTH = 300

// Per IP: each analysis may call Gemini several times, so keep this tight
const RATE_LIMIT = 8
const RATE_WINDOW_MS = 10 * 60 * 1000

function errorResponse(code: string, error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error, code }, { status, headers })
}

/** Maps GitHub social provider names → our form field keys */
function mapSocials(socials: { provider: string; url: string }[]) {
  const result: Record<string, string> = {}

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

  return result
}

type Project = { name: string; description: string }

const aiText = (value: unknown, max = 600) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

/**
 * Keeps the real repo names (the AI may rename them, which would break the links)
 * and only takes the rewritten descriptions — matched by name, then by position.
 */
function projectsFromAi(value: unknown, repos: Project[]): Project[] {
  const items: unknown[] = Array.isArray(value) ? value : []
  const describe = (item: unknown) =>
    item && typeof item === 'object' ? aiText((item as Record<string, unknown>).description) : ''
  return repos.map((repo, i) => {
    const byName = items.find(
      (item) =>
        !!item && typeof item === 'object' &&
        aiText((item as Record<string, unknown>).name).toLowerCase() === repo.name.toLowerCase()
    )
    return { name: repo.name, description: describe(byName ?? items[i]) || repo.description }
  })
}

// ── Helper to extract clean JSON block from a string ──
function extractJson(text: string): string {
  const trimmed = text.trim()
  const startIdx = trimmed.indexOf('{')
  const endIdx = trimmed.lastIndexOf('}')
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return trimmed.substring(startIdx, endIdx + 1)
  }
  return trimmed
}

// ── Shared Gemini caller ────────────────────────────────
// Stable pinned models first; the `-latest` aliases keep working after a pinned model is retired (404)
const MODEL_NAMES = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
]
const MODEL_TIMEOUT_MS = 20_000

const AI_FAILED_PREFIX = 'All models failed'

/** 404 = model unavailable for this key, 429/5xx = overloaded or out of quota → try the next model. */
function isRetryableModelError(e: unknown): boolean {
  const status = (e as { status?: number } | null)?.status
  return status === undefined || status === 404 || status === 429 || status >= 500
}

async function callGemini(apiKey: string, prompt: string, jsonMode: boolean = false): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const errors: string[] = []

  for (const modelName of MODEL_NAMES) {
    try {
      const model = genAI.getGenerativeModel(
        {
          model: modelName,
          generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined,
        },
        { timeout: MODEL_TIMEOUT_MS }
      )
      const result = await model.generateContent(prompt)
      console.log(`[analyze] ✅ Model: ${modelName}`)
      return result.response.text().trim()
    } catch (e) {
      const status = (e as { status?: number } | null)?.status
      const msg = `${status ?? 'network'} ${e instanceof Error ? e.message.slice(0, 160) : String(e)}`
      errors.push(`${modelName}: ${msg}`)
      console.warn(`[analyze] ❌ ${modelName}: ${msg}`)
      // An invalid key or missing permission fails the same way for every model
      if (!isRetryableModelError(e)) break
    }
  }

  throw new Error(`${AI_FAILED_PREFIX}:\n${errors.join('\n')}`)
}

// ── POST /api/analyze ───────────────────────────────────
export async function POST(req: NextRequest) {
  const limit = rateLimit(`analyze:${clientIp(req)}`, RATE_LIMIT, RATE_WINDOW_MS)
  if (!limit.ok) {
    return errorResponse('too_many_requests', 'Too many requests — please try again later', 429, {
      'Retry-After': String(limit.retryAfter),
    })
  }

  // Parse body
  let username: string
  let tone: Tone = 'professional'
  let instructions = ''
  try {
    const body = await req.json()
    username = cleanGithubUsername(String(body.username ?? ''))
    if (TONES.includes(body.tone)) tone = body.tone
    instructions = String(body.instructions ?? '').trim().slice(0, MAX_INSTRUCTIONS_LENGTH)
  } catch {
    return errorResponse('invalid_request', 'Invalid request body', 400)
  }

  if (!username) {
    return errorResponse('username_required', 'GitHub username is required', 400)
  }
  if (!isValidGithubUsername(username)) {
    return errorResponse('invalid_username', 'Invalid GitHub username', 400)
  }

  // API key guard
  const apiKey = readEnv('GEMINI_API_KEY')
  if (!apiKey) {
    return errorResponse('ai_not_configured', 'AI service is not configured (missing GEMINI_API_KEY)', 503)
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

    // Repos come sorted by stars
    const featuredRepos = repos.slice(0, 3).map((r) => ({
      name: r.name,
      description: r.description ?? '',
    }))

    // Most used languages first
    const languageCounts = new Map<string, number>()
    for (const r of repos) {
      if (r.language) languageCounts.set(r.language, (languageCounts.get(r.language) ?? 0) + 1)
    }
    const languages = [...languageCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([language]) => language)
      .join(', ')

    let promptInstructions = ''
    if (tone === 'minimalist') {
      promptInstructions = 'Write a very clean, minimalist, developer-focused bio of 1-2 short sentences (max 15-20 words). It should be extremely concise, using no fluff.'
    } else if (tone === 'creative') {
      promptInstructions = 'Write a highly creative, slightly humorous, and engaging developer bio of 2-3 short sentences. Include a clever pun or play on words, and make it sound witty, conversational, and highly unique.'
    } else if (tone === 'hacker') {
      promptInstructions = "Write a hacker-style, geeky developer bio of 2-3 short sentences. Make it sound like it's written by a terminal enthusiast or hardcore systems engineer (e.g., using terms like 'compiling', 'debugging', 'building systems'), but keep it highly professional."
    } else {
      promptInstructions = 'Write a compelling, professional, developer-focused bio of 2-3 short sentences that sounds natural, genuine, and highlights their core engineering passion.'
    }

    if (instructions) {
      promptInstructions += `\nAdditional custom instruction from the user: "${instructions}". Incorporate this detail naturally into the bio.`
    }

    const prompt = `You are helping a software developer write a concise, professional GitHub profile README.

Based on the following information about them:
- GitHub username: ${user.login}
- Display name: ${user.name ?? 'not set'}
- Current bio: ${user.bio ?? 'none'}
- Location: ${user.location ?? 'unknown'}
- Programming languages: ${languages || 'various'}
- Top repositories to showcase:
${featuredRepos.map((r) => `- Name: ${r.name}\n  Current Description: ${r.description || 'none'}`).join('\n')}

We need these details written in three languages: Uzbek, English, and Russian.

For the bio, match these style instructions:
${promptInstructions}
Core bio rules:
- Uses NO first person (no "I", "my", "me", "we", "our"). All sentences must be in the third-person or passive form.

For the 3 featured projects:
- Uzbek: rewrite descriptions to sound catchy, punchy, and professional in Uzbek.
- English: rewrite descriptions to sound catchy, punchy, and professional in English.
- Russian: rewrite descriptions to sound catchy, punchy, and professional in Russian.

Return the result ONLY as a raw JSON object with the following structure (do not include markdown code block formatting or backticks, just raw JSON text):
{
  "bio": "the generated bio string in Uzbek",
  "bioEn": "the generated bio string in English",
  "bioRu": "the generated bio string in Russian",
  "projects": [
    {
      "name": "project-name",
      "description": "the rewritten catchy description in Uzbek"
    }
  ],
  "projectsEn": [
    {
      "name": "project-name",
      "description": "the rewritten catchy description in English"
    }
  ],
  "projectsRu": [
    {
      "name": "project-name",
      "description": "the rewritten catchy description in Russian"
    }
  ]
}`

    const rawResult = await callGemini(apiKey, prompt, true)
    const jsonText = extractJson(rawResult)

    let aiData: Record<string, unknown> = {}
    try {
      const parsed = JSON.parse(jsonText)
      if (parsed && typeof parsed === 'object') aiData = parsed
    } catch (e) {
      // GitHub-derived suggestions (skills, socials, projects) are still useful without the AI text
      console.error('[analyze] Failed to parse AI JSON:', jsonText.slice(0, 500), e)
    }

    return NextResponse.json({
      bio:        aiText(aiData.bio),
      bioEn:      aiText(aiData.bioEn),
      bioRu:      aiText(aiData.bioRu),
      projects:   projectsFromAi(aiData.projects, featuredRepos),
      projectsEn: projectsFromAi(aiData.projectsEn, featuredRepos),
      projectsRu: projectsFromAi(aiData.projectsRu, featuredRepos),
      skills,
      name:       user.name ?? '',
      location:   user.location ?? '',
      website:    user.blog ?? '',
      twitter:    socialLinks.twitter   ?? user.twitter_username ?? '',
      linkedin:   socialLinks.linkedin  ?? '',
      instagram:  socialLinks.instagram ?? '',
      youtube:    socialLinks.youtube   ?? '',
      telegram:   socialLinks.telegram  ?? '',
      facebook:   socialLinks.facebook  ?? '',
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
        return errorResponse(
          'github_rate_limited',
          'GitHub rate limit reached. Wait ~1 hour or add GITHUB_TOKEN to .env.local',
          429
        )
      }
    }

    // ── GitHub user not found ──
    const msg = err instanceof Error ? err.message : String(err)
    if (msg === 'Not Found') {
      return errorResponse('user_not_found', `GitHub user "${username}" not found`, 404)
    }

    // ── Other errors ──
    console.error('[analyze error]', msg)
    const isDev = process.env.NODE_ENV === 'development'
    const code = msg.startsWith(AI_FAILED_PREFIX) ? 'ai_failed' : 'analysis_failed'
    return errorResponse(code, isDev ? `Debug: ${msg}` : 'Analysis failed — please try again', code === 'ai_failed' ? 502 : 500)
  }
}
