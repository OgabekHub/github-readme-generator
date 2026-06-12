'use client'

import { useState } from 'react'
import { ProfileData, SKILL_OPTIONS, THEMES, LAYOUT_TEMPLATES, SKILL_COLORS } from '@/lib/readme-generator'
import { X, Sparkles, Loader2, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import { TRANSLATIONS } from '@/lib/i18n'

interface FormProps {
  data: ProfileData
  onChange: (data: ProfileData) => void
  lang: 'uz' | 'en' | 'ru'
  session: { loggedIn: boolean; username?: string; name?: string; avatarUrl?: string }
  onLogout: () => Promise<void>
  onCommit: () => Promise<void>
  committing: boolean
  commitResult: { success: boolean; url?: string; error?: string } | null
}

interface AISuggestion {
  bio: string
  bioEn?: string
  bioRu?: string
  skills: string[]
  name: string
  location: string
  twitter: string
  website: string
  linkedin: string
  instagram: string
  youtube: string
  telegram: string
  facebook: string
  projects?: { name: string; description: string }[]
  projectsEn?: { name: string; description: string }[]
  projectsRu?: { name: string; description: string }[]
}

/* ── Reusable text input ──────────────────────────────── */
function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
        {label}
      </span>
      <input
        {...props}
        className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent transition-all duration-150"
      />
    </label>
  )
}

export default function ProfileForm({ 
  data, 
  onChange,
  lang,
  session,
  onLogout,
  onCommit,
  committing,
  commitResult
}: FormProps) {
  const t = TRANSLATIONS[lang]
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [themeOpen, setThemeOpen] = useState(false)
  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false)
  
  // AI Options state
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false)
  const [aiTone, setAiTone] = useState<'professional' | 'minimalist' | 'creative' | 'hacker'>('professional')
  const [aiInstructions, setAiInstructions] = useState('')
  const [toneDropdownOpen, setToneDropdownOpen] = useState(false)

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    onChange({ ...data, [key]: value })
  }

  const toggleSkill = (skill: string) => {
    const skills = data.skills.includes(skill)
      ? data.skills.filter((s) => s !== skill)
      : [...data.skills, skill]
    update('skills', skills)
  }

  const cardBio = suggestion
    ? ((lang === 'en' ? suggestion.bioEn : lang === 'ru' ? suggestion.bioRu : suggestion.bio) || suggestion.bio)
    : ''

  const cardProjects = suggestion
    ? ((lang === 'en' ? suggestion.projectsEn : lang === 'ru' ? suggestion.projectsRu : suggestion.projects) || suggestion.projects)
    : []

  /* ── AI Analyze ────────────────────────────────────── */
  const handleAnalyze = async () => {
    if (!data.github.trim()) return
    setAnalyzing(true)
    setAiError(null)
    setSuggestion(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: data.github,
          tone: aiTone,
          instructions: aiInstructions
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Tahlil muvaffaqiyatsiz')
      setSuggestion(json as AISuggestion)
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'Noma\'lum xatolik')
    } finally {
      setAnalyzing(false)
    }
  }

  /* ── Apply AI suggestion ───────────────────── */
  const applySuggestion = () => {
    if (!suggestion) return

    const useMultilingual = data.multilingualReadme
    const mainBio = useMultilingual
      ? (suggestion.bio || data.bio)
      : (cardBio || data.bio)

    const mainProjects = useMultilingual
      ? (suggestion.projects && suggestion.projects.length > 0 ? suggestion.projects : data.featuredProjects)
      : (cardProjects && cardProjects.length > 0 ? cardProjects : data.featuredProjects)

    onChange({
      ...data,
      bio:              mainBio,
      bioEn:            suggestion.bioEn     || data.bioEn,
      bioRu:            suggestion.bioRu     || data.bioRu,
      name:             suggestion.name      || data.name,
      location:         suggestion.location  || data.location,
      website:          suggestion.website   || data.website,
      twitter:          suggestion.twitter   || data.twitter,
      linkedin:         suggestion.linkedin  || data.linkedin,
      instagram:        suggestion.instagram || data.instagram,
      youtube:          suggestion.youtube   || data.youtube,
      telegram:         suggestion.telegram  || data.telegram,
      facebook:         suggestion.facebook  || data.facebook,
      skills:           suggestion.skills.length > 0 ? suggestion.skills : data.skills,
      featuredProjects: mainProjects,
      projectsEn:       suggestion.projectsEn && suggestion.projectsEn.length > 0 ? suggestion.projectsEn : data.projectsEn,
      projectsRu:       suggestion.projectsRu && suggestion.projectsRu.length > 0 ? suggestion.projectsRu : data.projectsRu,
    })
    setSuggestion(null)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Basic Info ────────────────────────────────── */}
      <section className="flex flex-col gap-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm relative z-50">
        <div className="flex items-center gap-2 border-b border-[var(--border-input)]/60 pb-3 mb-1">
          <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
          <h2 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">
            {t.basicInfo}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label={t.name}
            placeholder="Og'abek"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <Field
            label={t.title}
            placeholder="Full-Stack Developer"
            value={data.title}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            {data.multilingualReadme ? 'Bio (Uzbek)' : t.bio}
          </span>
          <textarea
            placeholder={t.bioPlaceholder}
            value={data.bio}
            onChange={(e) => update('bio', e.target.value)}
            rows={2}
            className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all duration-150 resize-none"
          />
        </label>

        {data.multilingualReadme && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 border-t border-[var(--border-input)]/60 pt-3.5 slide-down">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                Bio (English)
              </span>
              <textarea
                placeholder="Write your bio in English..."
                value={data.bioEn}
                onChange={(e) => update('bioEn', e.target.value)}
                rows={2}
                className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50 resize-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                Bio (Русский)
              </span>
              <textarea
                placeholder="Напишите описание на русском..."
                value={data.bioRu}
                onChange={(e) => update('bioRu', e.target.value)}
                rows={2}
                className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50 resize-none"
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label={t.location}
            placeholder={t.locationPlaceholder}
            value={data.location}
            onChange={(e) => update('location', e.target.value)}
          />
          <Field
            label={t.funFact}
            placeholder={t.funFactPlaceholder}
            value={data.funFact}
            onChange={(e) => update('funFact', e.target.value)}
          />
        </div>
      </section>

      {/* ── Social Links ──────────────────────────────── */}
      <section className="flex flex-col gap-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm relative z-40">
        <div className="flex items-center gap-2 border-b border-[var(--border-input)]/60 pb-3 mb-1">
          <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
          <h2 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">
            {t.linksAndAi}
          </h2>
        </div>

        {/* GitHub + AI button row */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            {t.githubUsername}
          </span>
          <div className="flex gap-2">
            <input
              placeholder="ogabek"
              value={data.github}
              onChange={(e) => update('github', e.target.value.trim())}
              onBlur={(e) => {
                const cleaned = e.target.value.trim()
                  .replace(/^@/, '')
                  .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '')
                  .split(/[?#]/)[0]
                  .replace(/\/$/, '')
                update('github', cleaned)
              }}
              className="flex-1 min-w-0 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all duration-150"
            />
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!data.github.trim() || analyzing}
              title="Analyze GitHub profile with AI"
              className="flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#7C5CFC] to-[#a855f7] text-white hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-[0_0_14px_#7C5CFC44] hover:shadow-[0_0_20px_#7C5CFC66]"
            >
              {analyzing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span className="hidden xs:inline">
                {analyzing ? t.analyzing : t.aiAnalyze}
              </span>
            </button>
          </div>
        </div>

        {/* AI Options Toggle */}
        <div className="border-t border-[var(--border-input)]/60 pt-3">
          <button
            type="button"
            onClick={() => setAiSettingsOpen(!aiSettingsOpen)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <span>{t.aiSettings}</span>
            <span className="text-[10px]">{aiSettingsOpen ? '▲' : '▼'}</span>
          </button>

          {aiSettingsOpen && (
            <div className="flex flex-col gap-3 mt-3 slide-down bg-[var(--bg-input)]/30 border border-[var(--border-input)]/50 p-3.5 rounded-xl">
              {/* Tone Selection */}
              <div className="flex flex-col gap-1.5 relative">
                <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wide">
                  {t.bioTone}
                </span>
                <button
                  type="button"
                  onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                  className="flex items-center justify-between w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-main)] hover:border-[#7C5CFC]/60 transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50"
                >
                  <span>
                    {aiTone === 'professional' && t.toneProfessional}
                    {aiTone === 'minimalist' && t.toneMinimalist}
                    {aiTone === 'creative' && t.toneCreative}
                    {aiTone === 'hacker' && t.toneHacker}
                  </span>
                  <ChevronDown size={12} className={`text-[var(--text-muted)] transition-transform duration-200 ${toneDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {toneDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setToneDropdownOpen(false)} />
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full z-40 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl shadow-2xl py-1 max-h-56 overflow-y-auto backdrop-blur-md">
                      {[
                        { value: 'professional', label: t.toneProfessional },
                        { value: 'minimalist', label: t.toneMinimalist },
                        { value: 'creative', label: t.toneCreative },
                        { value: 'hacker', label: t.toneHacker },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setAiTone(opt.value as any)
                            setToneDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3.5 py-1.5 text-xs transition-all duration-150 ${
                            aiTone === opt.value
                              ? 'bg-[#7C5CFC]/15 text-[var(--text-accent)] font-semibold'
                              : 'text-[var(--text-light)] hover:bg-[#7C5CFC]/10 hover:text-[var(--text-main)]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Custom Instructions */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wide">
                  {t.customInstructions}
                </span>
                <textarea
                  placeholder={t.instructionsPlaceholder}
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  rows={2}
                  className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Multilingual README Toggle */}
        <label className="flex items-center gap-2 bg-[var(--bg-input)]/50 border border-[var(--border-input)] rounded-xl px-4 py-2.5 cursor-pointer hover:border-[#7C5CFC]/40 transition-all duration-150 select-none">
          <input
            type="checkbox"
            checked={data.multilingualReadme}
            onChange={(e) => update('multilingualReadme', e.target.checked)}
            className="accent-[#7C5CFC] w-4 h-4 shrink-0"
          />
          <span className="text-[var(--text-light)] text-xs font-semibold">{t.multilingualReadmeToggle}</span>
        </label>

        {/* AI error */}
        {aiError && (
          <div className="slide-down flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            <XCircle size={13} />
            {aiError}
          </div>
        )}

        {/* AI suggestion card */}
        {suggestion && (
          <div className="slide-down border border-[#7C5CFC]/30 bg-[#7C5CFC]/5 backdrop-blur-md shadow-[0_0_20px_#7C5CFC15] rounded-xl p-4 flex flex-col gap-3">
            {/* Card header */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#a855f7] flex items-center justify-center shrink-0">
                <Sparkles size={10} className="text-white" />
              </div>
              <span className="text-xs font-bold text-[var(--text-accent)] uppercase tracking-widest">
                {t.aiSuggestionTitle}
              </span>
            </div>

            {/* Bio */}
            {cardBio && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium">
                  {t.suggestedBio}
                </span>
                <p className="text-sm text-[var(--text-light)] leading-relaxed italic border-l-2 border-[#7C5CFC]/40 pl-3">
                  {cardBio}
                </p>
              </div>
            )}

            {/* Profil ma'lumotlari — all social fields */}
            {(suggestion.location || suggestion.twitter || suggestion.website ||
              suggestion.linkedin || suggestion.instagram || suggestion.youtube || suggestion.telegram || suggestion.facebook) && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium">
                  {t.profileDetails}
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestion.location && (
                    <span className="flex items-center gap-1 text-[11px] bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-light)] px-2.5 py-1 rounded-full">
                      📍 {suggestion.location}
                    </span>
                  )}
                  {suggestion.twitter && (
                    <span className="flex items-center gap-1 text-[11px] bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-light)] px-2.5 py-1 rounded-full">
                      🐦 @{suggestion.twitter.replace('@', '')}
                    </span>
                  )}
                  {suggestion.linkedin && (
                    <span className="flex items-center gap-1 text-[11px] bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-light)] px-2.5 py-1 rounded-full">
                      💼 LinkedIn
                    </span>
                  )}
                  {suggestion.instagram && (
                    <span className="flex items-center gap-1 text-[11px] bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-light)] px-2.5 py-1 rounded-full">
                      📸 Instagram
                    </span>
                  )}
                  {suggestion.youtube && (
                    <span className="flex items-center gap-1 text-[11px] bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-light)] px-2.5 py-1 rounded-full">
                      ▶️ YouTube
                    </span>
                  )}
                  {suggestion.telegram && (
                    <span className="flex items-center gap-1 text-[11px] bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-light)] px-2.5 py-1 rounded-full">
                      ✈️ Telegram
                    </span>
                  )}
                  {suggestion.facebook && (
                    <span className="flex items-center gap-1 text-[11px] bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-light)] px-2.5 py-1 rounded-full">
                      👥 Facebook
                    </span>
                  )}
                  {suggestion.website && (
                    <span className="flex items-center gap-1 text-[11px] bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-light)] px-2.5 py-1 rounded-full">
                      🌐 {suggestion.website.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Detected skills */}
            {suggestion.skills.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium">
                  {t.detectedSkills}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestion.skills.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 text-[11px] bg-[#7C5CFC]/15 text-[#a78bfa] border border-[#7C5CFC]/25 px-2 py-0.5 rounded-full"
                    >
                      <img
                        src={`https://skillicons.dev/icons?i=${s}`}
                        alt={s}
                        width={12}
                        height={12}
                        className="inline-block rounded-sm"
                      />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested projects */}
            {cardProjects && cardProjects.length > 0 && (
              <div className="flex flex-col gap-1.5 border-t border-[var(--border-input)]/40 pt-2.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium">
                  {t.suggestedProjects}
                </span>
                <div className="flex flex-col gap-1.5">
                  {cardProjects.map((p, idx) => (
                    <div key={idx} className="bg-[var(--bg-input)]/50 border border-[var(--border-input)]/70 p-2.5 rounded-xl text-xs flex flex-col gap-0.5">
                      <span className="font-semibold text-[var(--text-main)] flex items-center gap-1">
                        🚀 {p.name}
                      </span>
                      <p className="text-[var(--text-muted)] leading-normal">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={applySuggestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7C5CFC] text-white hover:bg-[#6a4ce0] active:scale-95 transition-all duration-150"
              >
                <CheckCircle size={12} /> {t.accept}
              </button>
              <button
                onClick={() => setSuggestion(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-gray-500 active:scale-95 transition-all duration-150"
              >
                <XCircle size={12} /> {t.decline}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label={t.email}
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <Field
            label={t.telegram}
            placeholder="@username"
            value={data.telegram}
            onChange={(e) => update('telegram', e.target.value)}
          />
          <Field
            label={t.twitter}
            placeholder="@username"
            value={data.twitter}
            onChange={(e) => update('twitter', e.target.value)}
          />
          <Field
            label={t.linkedin}
            placeholder="username or full URL"
            value={data.linkedin}
            onChange={(e) => update('linkedin', e.target.value)}
          />
          <Field
            label={t.instagram}
            placeholder="@username"
            value={data.instagram}
            onChange={(e) => update('instagram', e.target.value)}
          />
          <Field
            label={t.youtube}
            placeholder="channel URL or username"
            value={data.youtube}
            onChange={(e) => update('youtube', e.target.value)}
          />
          <Field
            label={t.facebook}
            placeholder="username or full URL"
            value={data.facebook}
            onChange={(e) => update('facebook', e.target.value)}
          />
          <Field
            label={t.website}
            placeholder="yoursite.com"
            value={data.website}
            onChange={(e) => update('website', e.target.value)}
          />
        </div>
      </section>

      {/* ── Featured Projects ──────────────────────────── */}
      <section className="flex flex-col gap-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm relative z-30">
        <div className="flex items-center justify-between border-b border-[var(--border-input)]/60 pb-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
            <h2 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">
              {t.featuredProjects}
            </h2>
          </div>
          {data.featuredProjects.length < 5 && (
            <button
              onClick={() => {
                const updated = [...data.featuredProjects, { name: '', description: '' }]
                const updatedEn = [...(data.projectsEn || []), { name: '', description: '' }]
                const updatedRu = [...(data.projectsRu || []), { name: '', description: '' }]
                onChange({
                  ...data,
                  featuredProjects: updated,
                  projectsEn: updatedEn,
                  projectsRu: updatedRu,
                })
              }}
              className="text-xs font-semibold text-[#a78bfa] hover:text-[#c084fc] transition-colors"
            >
              {t.addProject}
            </button>
          )}
        </div>

        {data.featuredProjects.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">
            {t.noProjects}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.featuredProjects.map((project, idx) => {
              const projEn = data.projectsEn?.[idx] || { name: project.name, description: '' }
              const projRu = data.projectsRu?.[idx] || { name: project.name, description: '' }
              
              return (
                <div
                  key={idx}
                  className="flex flex-col gap-2.5 p-4 bg-[var(--bg-input)]/50 border border-[var(--border-input)] rounded-xl relative group"
                >
                  <button
                    onClick={() => {
                      const updated = data.featuredProjects.filter((_, i) => i !== idx)
                      const updatedEn = (data.projectsEn || []).filter((_, i) => i !== idx)
                      const updatedRu = (data.projectsRu || []).filter((_, i) => i !== idx)
                      onChange({
                        ...data,
                        featuredProjects: updated,
                        projectsEn: updatedEn,
                        projectsRu: updatedRu,
                      })
                    }}
                    className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 animate-fade-in"
                    title="Remove project"
                  >
                    <X size={14} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Project Name */}
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                        {t.projectName}
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. github-readme-generator"
                        value={project.name}
                        onChange={(e) => {
                          const val = e.target.value
                          const updated = [...data.featuredProjects]
                          const updatedEn = [...(data.projectsEn || [])]
                          const updatedRu = [...(data.projectsRu || [])]
                          
                          updated[idx] = { ...updated[idx], name: val }
                          updatedEn[idx] = { ...projEn, name: val }
                          updatedRu[idx] = { ...projRu, name: val }
                          
                          onChange({
                            ...data,
                            featuredProjects: updated,
                            projectsEn: updatedEn,
                            projectsRu: updatedRu,
                          })
                        }}
                        className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50"
                      />
                    </div>

                    {/* Descriptions */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                        {data.multilingualReadme ? 'Description (Uzbek)' : t.projectDesc}
                      </span>
                      <input
                        type="text"
                        placeholder="Loyiha tavsifi..."
                        value={project.description}
                        onChange={(e) => {
                          const updated = [...data.featuredProjects]
                          updated[idx] = { ...updated[idx], description: e.target.value }
                          update('featuredProjects', updated)
                        }}
                        className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50"
                      />
                    </div>

                    {data.multilingualReadme ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                          Description (English)
                        </span>
                        <input
                          type="text"
                          placeholder="Project description in English..."
                          value={projEn.description}
                          onChange={(e) => {
                            const updatedEn = [...(data.projectsEn || [])]
                            updatedEn[idx] = { ...projEn, description: e.target.value }
                            update('projectsEn', updatedEn)
                          }}
                          className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50"
                        />
                      </div>
                    ) : null}

                    {data.multilingualReadme ? (
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                          Description (Русский)
                        </span>
                        <input
                          type="text"
                          placeholder="Описание проекта на русском..."
                          value={projRu.description}
                          onChange={(e) => {
                            const updatedRu = [...(data.projectsRu || [])]
                            updatedRu[idx] = { ...projRu, description: e.target.value }
                            update('projectsRu', updatedRu)
                          }}
                          className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Tech Stack ────────────────────────────────── */}
      <section className="flex flex-col gap-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm relative z-20">
        <div className="flex items-center justify-between border-b border-[var(--border-input)]/60 pb-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
            <h2 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">
              {t.techStack}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.categorizeSkills}
                onChange={(e) => update('categorizeSkills', e.target.checked)}
                className="accent-[#7C5CFC] w-3.5 h-3.5"
              />
              <span className="text-[var(--text-muted)] hover:text-[var(--text-light)] text-[11px] font-medium transition-colors">
                {t.categorize}
              </span>
            </label>
            {data.skills.length > 0 && (
              <button
                onClick={() => update('skills', [])}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={11} />
                {t.clearAll} ({data.skills.length})
              </button>
            )}
          </div>
        </div>

        {/* Icon grid — shows actual skillicons.dev images */}
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-2 pr-3 -mx-2">
          {SKILL_OPTIONS.map((skill) => {
            const active = data.skills.includes(skill)
            const glowColor = SKILL_COLORS[skill] || '#7C5CFC'
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                title={skill}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border skill-glow-btn active:scale-95 transition-all duration-200 ${
                  active
                    ? 'bg-[var(--glow-color)]/10 text-[var(--text-main)]'
                    : 'bg-[var(--bg-input)]/50 border-[var(--border-input)] hover:bg-[#7C5CFC]/5'
                }`}
                style={{
                  '--glow-color': glowColor,
                  borderColor: active ? glowColor : undefined,
                  boxShadow: active ? `0 0 12px ${glowColor}25` : undefined
                } as React.CSSProperties}
              >
                <img
                  src={`https://skillicons.dev/icons?i=${skill}`}
                  alt={skill}
                  width={28}
                  height={28}
                  className="select-none pointer-events-none"
                  loading="lazy"
                />
                <span
                  className="text-[9px] leading-tight text-center w-full truncate transition-colors duration-150"
                  style={{ color: active ? glowColor : '#6b7280' }}
                >
                  {skill}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── GitHub Widgets & Theme ─────────────────────── */}
      <section className="flex flex-col gap-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-2 border-b border-[var(--border-input)]/60 pb-3 mb-1">
          <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
          <h2 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">
            {t.widgetsAndTheme}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Theme Dropdown */}
          <div className="flex flex-col gap-1.5 relative">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t.theme}
            </span>
            
            {/* Custom Select Trigger */}
            <button
              type="button"
              onClick={() => {
                setThemeOpen(!themeOpen)
                setLayoutDropdownOpen(false)
              }}
              className="flex items-center justify-between w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] hover:border-[#7C5CFC]/60 transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50"
            >
              <span>{THEMES.find((t) => t.value === data.theme)?.label || data.theme}</span>
              <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-200 ${themeOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Select Options Dropdown */}
            {themeOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setThemeOpen(false)}
                />
                <div className="absolute top-[calc(100%+4px)] left-0 w-full z-20 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] py-1.5 max-h-56 overflow-y-auto backdrop-blur-md slide-down">
                  {THEMES.map((t) => {
                    const isSelected = t.value === data.theme
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          update('theme', t.value)
                          setThemeOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-all duration-150 flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#7C5CFC]/15 text-[var(--text-accent)] font-semibold'
                            : 'text-[var(--text-light)] hover:bg-[#7C5CFC]/10 hover:text-[var(--text-main)]'
                        }`}
                      >
                        <span>{t.label}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Layout Dropdown */}
          <div className="flex flex-col gap-1.5 relative">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t.layout}
            </span>
            
            {/* Custom Select Trigger */}
            <button
              type="button"
              onClick={() => {
                setLayoutDropdownOpen(!layoutDropdownOpen)
                setThemeOpen(false)
              }}
              className="flex items-center justify-between w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] hover:border-[#7C5CFC]/60 transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50"
            >
              <span>{LAYOUT_TEMPLATES.find((t) => t.value === data.layoutTemplate)?.label || 'Classic (Markazlashtirilgan)'}</span>
              <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-200 ${layoutDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Select Options Dropdown */}
            {layoutDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setLayoutDropdownOpen(false)}
                />
                <div className="absolute top-[calc(100%+4px)] left-0 w-full z-20 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] py-1.5 max-h-56 overflow-y-auto backdrop-blur-md slide-down">
                  {LAYOUT_TEMPLATES.map((t) => {
                    const isSelected = t.value === data.layoutTemplate
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          update('layoutTemplate', t.value)
                          setLayoutDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-all duration-150 flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#7C5CFC]/15 text-[var(--text-accent)] font-semibold'
                            : 'text-[var(--text-light)] hover:bg-[#7C5CFC]/10 hover:text-[var(--text-main)]'
                        }`}
                      >
                        <span>{t.label}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'showBanner' as const, label: t.widgetBanner },
            { key: 'showStats' as const, label: t.widgetStats },
            { key: 'showStreak' as const, label: t.widgetStreak },
            { key: 'showTopLangs' as const, label: t.widgetLangs },
            { key: 'showTrophies' as const, label: t.widgetTrophies },
            { key: 'showVisitorBadge' as const, label: t.widgetViews },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 bg-[var(--bg-input)]/50 border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-[#7C5CFC]/40 transition-all duration-150 select-none"
            >
              <input
                type="checkbox"
                checked={data[item.key] as boolean}
                onChange={(e) => update(item.key, e.target.checked as never)}
                className="accent-[#7C5CFC] w-4 h-4 shrink-0"
              />
              <span className="text-[var(--text-light)] text-xs">{item.label}</span>
            </label>
          ))}
        </div>

        {!data.github && (data.showStats || data.showTrophies) && (
          <p className="text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
            {t.githubRequiredWarning}
          </p>
        )}
      </section>

      {/* ── GitHub Publish / Deploy ─────────────────────── */}
      <section className="flex flex-col gap-4 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm border-t-[#7C5CFC]/20">
        <div className="flex items-center justify-between border-b border-[var(--border-input)]/60 pb-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
            <h2 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">
              🚀 {t.commitToProfile.split(' ')[0]} Publish
            </h2>
          </div>
          {session.loggedIn && (
            <button
              onClick={onLogout}
              className="text-[11px] text-[var(--text-muted)] hover:text-red-400 transition-colors"
            >
              {t.logout}
            </button>
          )}
        </div>

        {!session.loggedIn ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-xs text-[var(--text-muted)] leading-normal max-w-sm">
              Bu profilingizda maxsus repozitoriya (`username/username`) ochish va uning README.md faylini 1-klikda yangilash uchun kerak bo'ladi.
            </p>
            <a
              href="/api/auth/login"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#7C5CFC] to-[#a855f7] text-white hover:opacity-95 active:scale-95 transition-all duration-150 shadow-[0_0_15px_#7C5CFC44]"
            >
              <span>🔑 {t.connectGithub}</span>
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* User header */}
            <div className="flex items-center gap-3 bg-[var(--bg-input)]/50 border border-[var(--border-input)] p-3 rounded-xl">
              <img
                src={session.avatarUrl}
                alt={session.username}
                width={36}
                height={36}
                className="rounded-full border border-[#7C5CFC]/30"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[var(--text-main)]">{session.name}</span>
                <span className="text-[10px] text-[var(--text-muted)]">@{session.username}</span>
              </div>
              <span className="ml-auto text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                Connected
              </span>
            </div>

            {/* Commit controls */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onCommit}
                disabled={committing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#7C5CFC] text-white hover:bg-[#6a4ce0] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-[0_0_12px_#7C5CFC33]"
              >
                {committing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t.committing}</span>
                  </>
                ) : (
                  <>
                    <span>🚀 {t.commitToProfile}</span>
                  </>
                )}
              </button>

              {/* Success Result */}
              {commitResult?.success && (
                <div className="slide-down flex flex-col gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3.5 py-3 mt-1 leading-normal">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle size={14} className="shrink-0" />
                    <span>{t.commitSuccess}</span>
                  </div>
                  <a
                    href={commitResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-green-300 hover:text-green-200 mt-1 block font-medium"
                  >
                    {t.viewProfileBtn}
                  </a>
                </div>
              )}

              {/* Error Result */}
              {commitResult && !commitResult.success && (
                <div className="slide-down flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-3 mt-1 leading-normal">
                  <XCircle size={14} className="shrink-0" />
                  <span>{t.commitError}: {commitResult.error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
