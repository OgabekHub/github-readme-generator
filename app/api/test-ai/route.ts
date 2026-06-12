import { NextResponse } from 'next/server'

/**
 * Diagnostic endpoint — visits /api/test-ai to see:
 * - Is the GEMINI_API_KEY valid?
 * - Which models are available for this key?
 */
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 503 })
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=50`,
    { cache: 'no-store' }
  )

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({
      status: res.status,
      problem: data.error?.message ?? 'Unknown API error',
      hint: res.status === 400
        ? 'API key may be invalid or Generative Language API is not enabled in your Google Cloud project.'
        : undefined,
    })
  }

  // Filter to only show generateContent-capable models
  const models: string[] = (data.models ?? [])
    .filter((m: { supportedGenerationMethods?: string[] }) =>
      m.supportedGenerationMethods?.includes('generateContent')
    )
    .map((m: { name: string }) => m.name)

  return NextResponse.json({
    status: 'OK',
    generateContentModels: models,
    totalModels: data.models?.length ?? 0,
  })
}
