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
  let tone = 'professional'
  let instructions = ''
  try {
    const body = await req.json()
    username = (body.username ?? '').trim()
    tone = (body.tone ?? 'professional').trim()
    instructions = (body.instructions ?? '').trim()
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

    const featuredRepos = repos.slice(0, 3).map((r) => ({
      name: r.name,
      description: r.description ?? '',
    }))

    const languages = [
      ...new Set(repos.map((r) => r.language).filter(Boolean).slice(0, 8)),
    ].join(', ')

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

    const rawResult = await callGemini(apiKey, prompt)
    const jsonText = rawResult
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/g, '')
      .trim()

    let aiData = { 
      bio: '', 
      bioEn: '', 
      bioRu: '', 
      projects: [] as { name: string; description: string }[],
      projectsEn: [] as { name: string; description: string }[],
      projectsRu: [] as { name: string; description: string }[]
    }
    try {
      aiData = JSON.parse(jsonText)
    } catch (e) {
      console.error('[analyze] Failed to parse AI JSON:', jsonText, e)
      aiData = { 
        bio: rawResult, 
        bioEn: '', 
        bioRu: '', 
        projects: [],
        projectsEn: [],
        projectsRu: []
      }
    }

    return NextResponse.json({
      bio:        aiData.bio || '',
      bioEn:      aiData.bioEn || '',
      bioRu:      aiData.bioRu || '',
      projects:   aiData.projects || [],
      projectsEn: aiData.projectsEn || [],
      projectsRu: aiData.projectsRu || [],
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
