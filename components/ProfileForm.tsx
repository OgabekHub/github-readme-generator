'use client'

import { useState } from 'react'
import { ProfileData, SKILL_OPTIONS, THEMES } from '@/lib/readme-generator'
import { X, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface FormProps {
  data: ProfileData
  onChange: (data: ProfileData) => void
}

interface AISuggestion {
  bio: string
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
}

/* ── Reusable text input ──────────────────────────────── */
function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <input
        {...props}
        className="bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent transition-all duration-150"
      />
    </label>
  )
}

export default function ProfileForm({ data, onChange }: FormProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const update = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    onChange({ ...data, [key]: value })
  }

  const toggleSkill = (skill: string) => {
    const skills = data.skills.includes(skill)
      ? data.skills.filter((s) => s !== skill)
      : [...data.skills, skill]
    update('skills', skills)
  }

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
        body: JSON.stringify({ username: data.github }),
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
    onChange({
      ...data,
      bio:       suggestion.bio       || data.bio,
      name:      suggestion.name      || data.name,
      location:  suggestion.location  || data.location,
      website:   suggestion.website   || data.website,
      twitter:   suggestion.twitter   || data.twitter,
      linkedin:  suggestion.linkedin  || data.linkedin,
      instagram: suggestion.instagram || data.instagram,
      youtube:   suggestion.youtube   || data.youtube,
      telegram:  suggestion.telegram  || data.telegram,
      facebook:  suggestion.facebook  || data.facebook,
      skills:    suggestion.skills.length > 0 ? suggestion.skills : data.skills,
    })
    setSuggestion(null)
  }

  return (
    <div className="flex flex-col gap-7">

      {/* ── Basic Info ────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-[#7C5CFC] uppercase tracking-widest">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Name"
            placeholder="Og'abek"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <Field
            label="Title / Role"
            placeholder="Full-Stack Developer"
            value={data.title}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Bio
          </span>
          <textarea
            placeholder="Building AI-powered tools for the Uzbek market 🇺🇿"
            value={data.bio}
            onChange={(e) => update('bio', e.target.value)}
            rows={2}
            className="bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent transition-all duration-150 resize-none"
          />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Location"
            placeholder="Bukhara, Uzbekistan"
            value={data.location}
            onChange={(e) => update('location', e.target.value)}
          />
          <Field
            label="Fun Fact"
            placeholder="I debug with print statements 😄"
            value={data.funFact}
            onChange={(e) => update('funFact', e.target.value)}
          />
        </div>
      </section>

      {/* ── Social Links ──────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-[#7C5CFC] uppercase tracking-widest">
          Links
        </h2>

        {/* GitHub + AI button row */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            GitHub Username
          </span>
          <div className="flex gap-2">
            <input
              placeholder="ogabek"
              value={data.github}
              onChange={(e) => update('github', e.target.value.trim())}
              className="flex-1 min-w-0 bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent transition-all duration-150"
            />
            <button
              onClick={handleAnalyze}
              disabled={!data.github.trim() || analyzing}
              title="Analyze GitHub profile with AI"
              className="flex shrink-0 items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#7C5CFC] to-[#a855f7] text-white hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-[0_0_14px_#7C5CFC44]"
            >
              {analyzing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span className="hidden xs:inline">
                {analyzing ? 'Tahlil...' : 'AI Tahlil'}
              </span>
            </button>
          </div>
        </div>

        {/* AI error */}
        {aiError && (
          <div className="slide-down flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            <XCircle size={13} />
            {aiError}
          </div>
        )}

        {/* AI suggestion card */}
        {suggestion && (
          <div className="slide-down border border-[#7C5CFC]/40 bg-[#7C5CFC]/5 rounded-xl p-4 flex flex-col gap-3">
            {/* Card header */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#a855f7] flex items-center justify-center shrink-0">
                <Sparkles size={10} className="text-white" />
              </div>
              <span className="text-xs font-bold text-[#a78bfa] uppercase tracking-widest">
                AI Taklifi
              </span>
            </div>

            {/* Bio */}
            {suggestion.bio && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                  Bio
                </span>
                <p className="text-sm text-gray-200 leading-relaxed italic border-l-2 border-[#7C5CFC]/40 pl-3">
                  {suggestion.bio}
                </p>
              </div>
            )}

            {/* Profil ma'lumotlari — all social fields */}
            {(suggestion.location || suggestion.twitter || suggestion.website ||
              suggestion.linkedin || suggestion.instagram || suggestion.youtube || suggestion.telegram || suggestion.facebook) && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                  Profil ma'lumotlari
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestion.location && (
                    <span className="flex items-center gap-1 text-[11px] bg-[#15151f] border border-[#2a2a3a] text-gray-300 px-2.5 py-1 rounded-full">
                      📍 {suggestion.location}
                    </span>
                  )}
                  {suggestion.twitter && (
                    <span className="flex items-center gap-1 text-[11px] bg-[#15151f] border border-[#2a2a3a] text-gray-300 px-2.5 py-1 rounded-full">
                      🐦 @{suggestion.twitter.replace('@', '')}
                    </span>
                  )}
                  {suggestion.linkedin && (
                    <span className="flex items-center gap-1 text-[11px] bg-[#15151f] border border-[#2a2a3a] text-gray-300 px-2.5 py-1 rounded-full">
                      💼 LinkedIn
                    </span>
                  )}
                  {suggestion.instagram && (
                    <span className="flex items-center gap-1 text-[11px] bg-[#15151f] border border-[#2a2a3a] text-gray-300 px-2.5 py-1 rounded-full">
                      📸 Instagram
                    </span>
                  )}
                  {suggestion.youtube && (
                    <span className="flex items-center gap-1 text-[11px] bg-[#15151f] border border-[#2a2a3a] text-gray-300 px-2.5 py-1 rounded-full">
                      ▶️ YouTube
                    </span>
                  )}
                  {suggestion.telegram && (
                    <span className="flex items-center gap-1 text-[11px] bg-[#15151f] border border-[#2a2a3a] text-gray-300 px-2.5 py-1 rounded-full">
                      ✈️ Telegram
                    </span>
                  )}
                  {suggestion.facebook && (
                    <span className="flex items-center gap-1 text-[11px] bg-[#15151f] border border-[#2a2a3a] text-gray-300 px-2.5 py-1 rounded-full">
                      👥 Facebook
                    </span>
                  )}
                  {suggestion.website && (
                    <span className="flex items-center gap-1 text-[11px] bg-[#15151f] border border-[#2a2a3a] text-gray-300 px-2.5 py-1 rounded-full">
                      🌐 {suggestion.website.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Detected skills */}
            {suggestion.skills.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                  Aniqlangan texnologiyalar
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

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={applySuggestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7C5CFC] text-white hover:bg-[#6a4ce0] active:scale-95 transition-all duration-150"
              >
                <CheckCircle size={12} /> Qabul qilish
              </button>
              <button
                onClick={() => setSuggestion(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#2a2a3a] text-gray-400 hover:text-gray-200 hover:border-gray-500 active:scale-95 transition-all duration-150"
              >
                <XCircle size={12} /> Rad etish
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <Field
            label="Telegram"
            placeholder="@username"
            value={data.telegram}
            onChange={(e) => update('telegram', e.target.value)}
          />
          <Field
            label="Twitter / X"
            placeholder="@username"
            value={data.twitter}
            onChange={(e) => update('twitter', e.target.value)}
          />
          <Field
            label="LinkedIn"
            placeholder="username or full URL"
            value={data.linkedin}
            onChange={(e) => update('linkedin', e.target.value)}
          />
          <Field
            label="Instagram"
            placeholder="@username"
            value={data.instagram}
            onChange={(e) => update('instagram', e.target.value)}
          />
          <Field
            label="YouTube"
            placeholder="channel URL or username"
            value={data.youtube}
            onChange={(e) => update('youtube', e.target.value)}
          />
          <Field
            label="Facebook"
            placeholder="username or full URL"
            value={data.facebook}
            onChange={(e) => update('facebook', e.target.value)}
          />
          <Field
            label="Website"
            placeholder="yoursite.com"
            value={data.website}
            onChange={(e) => update('website', e.target.value)}
          />
        </div>
      </section>

      {/* ── Tech Stack ────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#7C5CFC] uppercase tracking-widest">
            Tech Stack
          </h2>
          {data.skills.length > 0 && (
            <button
              onClick={() => update('skills', [])}
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={11} />
              Clear all ({data.skills.length})
            </button>
          )}
        </div>

        {/* Icon grid — shows actual skillicons.dev images */}
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
          {SKILL_OPTIONS.map((skill) => {
            const active = data.skills.includes(skill)
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                title={skill}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-150 ${
                  active
                    ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] shadow-[0_0_8px_#7C5CFC55]'
                    : 'bg-[#15151f] border-[#2a2a3a] hover:border-[#7C5CFC]/50 hover:bg-[#7C5CFC]/5'
                }`}
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
                  className={`text-[9px] leading-tight text-center w-full truncate ${
                    active ? 'text-[#a78bfa]' : 'text-gray-600'
                  }`}
                >
                  {skill}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── GitHub Widgets & Theme ─────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-[#7C5CFC] uppercase tracking-widest">
          GitHub Widgets
        </h2>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Theme
          </span>
          <select
            value={data.theme}
            onChange={(e) => update('theme', e.target.value)}
            className="bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent transition-all duration-150"
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'showStats' as const, label: '📊 GitHub Stats' },
            { key: 'showStreak' as const, label: '🔥 Streak Stats' },
            { key: 'showTopLangs' as const, label: '📝 Top Languages' },
            { key: 'showTrophies' as const, label: '🏆 Trophies' },
            { key: 'showVisitorBadge' as const, label: '👁️ Visitor Counter' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-[#7C5CFC]/40 transition-all duration-150 select-none"
            >
              <input
                type="checkbox"
                checked={data[item.key] as boolean}
                onChange={(e) => update(item.key, e.target.checked as never)}
                className="accent-[#7C5CFC] w-4 h-4 shrink-0"
              />
              <span className="text-gray-300 text-xs">{item.label}</span>
            </label>
          ))}
        </div>

        {!data.github && (data.showStats || data.showTrophies) && (
          <p className="text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
            ⚠️ GitHub username kiriting — widgetlar to'g'ri ishlash uchun kerak.
          </p>
        )}
      </section>
    </div>
  )
}
