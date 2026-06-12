'use client'

import { useState } from 'react'
import { ProfileData, SKILL_OPTIONS, THEMES, LAYOUT_TEMPLATES } from '@/lib/readme-generator'
import { X, Sparkles, Loader2, CheckCircle, XCircle, ChevronDown } from 'lucide-react'

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
  projects?: { name: string; description: string }[]
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
  const [themeOpen, setThemeOpen] = useState(false)
  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false)
  
  // AI Options state
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false)
  const [aiTone, setAiTone] = useState<'professional' | 'minimalist' | 'creative' | 'hacker'>('professional')
  const [aiInstructions, setAiInstructions] = useState('')
  const [toneDropdownOpen, setToneDropdownOpen] = useState(false)

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
    onChange({
      ...data,
      bio:              suggestion.bio       || data.bio,
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
      featuredProjects: suggestion.projects && suggestion.projects.length > 0 ? suggestion.projects : data.featuredProjects,
    })
    setSuggestion(null)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Basic Info ────────────────────────────────── */}
      <section className="flex flex-col gap-4 bg-[#111119]/70 border border-[#232333]/90 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-[#232333]/60 pb-3 mb-1">
          <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-widest">
            Basic Info
          </h2>
        </div>
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
            className="bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all duration-150 resize-none"
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
      <section className="flex flex-col gap-4 bg-[#111119]/70 border border-[#232333]/90 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-[#232333]/60 pb-3 mb-1">
          <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-widest">
            Links & AI Analysis
          </h2>
        </div>

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
              className="flex-1 min-w-0 bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all duration-150"
            />
            <button
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
                {analyzing ? 'Tahlil...' : 'AI Tahlil'}
              </span>
            </button>
          </div>
        </div>

        {/* AI Options Toggle */}
        <div className="border-t border-[#232333]/60 pt-3">
          <button
            type="button"
            onClick={() => setAiSettingsOpen(!aiSettingsOpen)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            <span>⚙️ AI Sozlamalari</span>
            <span className="text-[10px]">{aiSettingsOpen ? '▲' : '▼'}</span>
          </button>

          {aiSettingsOpen && (
            <div className="flex flex-col gap-3 mt-3 slide-down bg-[#14141e]/30 border border-[#222232]/50 p-3.5 rounded-xl">
              {/* Tone Selection */}
              <div className="flex flex-col gap-1.5 relative">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  Bio Ohangi (Tone)
                </span>
                <button
                  type="button"
                  onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                  className="flex items-center justify-between w-full bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-xs text-gray-100 hover:border-[#7C5CFC]/60 transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50"
                >
                  <span>
                    {aiTone === 'professional' && '💼 Professional (Jiddiy)'}
                    {aiTone === 'minimalist' && '🔍 Minimalist (Qisqa)'}
                    {aiTone === 'creative' && '🎨 Creative / Funny (Kreativ)'}
                    {aiTone === 'hacker' && '💻 Hacker Style (Kiber-punk)'}
                  </span>
                  <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${toneDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {toneDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setToneDropdownOpen(false)} />
                    <div className="absolute top-[calc(100%+4px)] left-0 w-full z-40 bg-[#13131c] border border-[#2a2a3e] rounded-xl shadow-2xl py-1 max-h-56 overflow-y-auto backdrop-blur-md">
                      {[
                        { value: 'professional', label: '💼 Professional (Jiddiy)' },
                        { value: 'minimalist', label: '🔍 Minimalist (Qisqa)' },
                        { value: 'creative', label: '🎨 Creative / Funny (Kreativ)' },
                        { value: 'hacker', label: '💻 Hacker Style (Kiber-punk)' },
                      ].map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => {
                            setAiTone(t.value as any)
                            setToneDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3.5 py-1.5 text-xs transition-all duration-150 ${
                            aiTone === t.value
                              ? 'bg-[#7C5CFC]/15 text-[#a78bfa] font-semibold'
                              : 'text-gray-300 hover:bg-[#7C5CFC]/5'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Custom Instructions */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  Qo'shimcha ko'rsatmalar
                </span>
                <textarea
                  placeholder="Masalan: Men choyni yaxshi ko'raman deb yoz, yoki React/Web3 ga ko'proq urg'u ber..."
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  rows={2}
                  className="bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50 resize-none"
                />
              </div>
            </div>
          )}
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
          <div className="slide-down border border-[#7C5CFC]/30 bg-[#7C5CFC]/5 backdrop-blur-md shadow-[0_0_20px_#7C5CFC15] rounded-xl p-4 flex flex-col gap-3">
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

            {/* Suggested projects */}
            {suggestion.projects && suggestion.projects.length > 0 && (
              <div className="flex flex-col gap-1.5 border-t border-[#7C5CFC]/20 pt-2.5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                  Tavsiya etilgan top loyihalar
                </span>
                <div className="flex flex-col gap-1.5">
                  {suggestion.projects.map((p, idx) => (
                    <div key={idx} className="bg-[#14141e]/50 border border-[#222232]/70 p-2.5 rounded-xl text-xs flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-200 flex items-center gap-1">
                        🚀 {p.name}
                      </span>
                      <p className="text-gray-400 leading-normal">{p.description}</p>
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

      {/* ── Featured Projects ──────────────────────────── */}
      <section className="flex flex-col gap-4 bg-[#111119]/70 border border-[#232333]/90 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-[#232333]/60 pb-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
            <h2 className="text-xs font-bold text-gray-200 uppercase tracking-widest">
              Featured Projects
            </h2>
          </div>
          {data.featuredProjects.length < 5 && (
            <button
              onClick={() => {
                const updated = [...data.featuredProjects, { name: '', description: '' }]
                update('featuredProjects', updated)
              }}
              className="text-xs font-semibold text-[#a78bfa] hover:text-[#c084fc] transition-colors"
            >
              + Yangi loyiha
            </button>
          )}
        </div>

        {data.featuredProjects.length === 0 ? (
          <p className="text-xs text-gray-500 italic">
            Hozircha loyihalar yo'q. Loyiha nomi va tavsifini qo'shish uchun yuqoridagi tugmani bosing yoki AI Tahlil orqali generatsiya qiling.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.featuredProjects.map((project, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 p-3 bg-[#14141e]/50 border border-[#222232] rounded-xl relative group"
              >
                <button
                  onClick={() => {
                    const updated = data.featuredProjects.filter((_, i) => i !== idx)
                    update('featuredProjects', updated)
                  }}
                  className="absolute top-2.5 right-2.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 animate-fade-in"
                  title="Remove project"
                >
                  <X size={14} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      Loyiha nomi
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. github-readme-generator"
                      value={project.name}
                      onChange={(e) => {
                        const updated = [...data.featuredProjects]
                        updated[idx] = { ...updated[idx], name: e.target.value }
                        update('featuredProjects', updated)
                      }}
                      className="bg-[#15151f] border border-[#2a2a3a] rounded-lg px-2.5 py-1.5 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      Loyiha tavsifi
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Generate premium README templates for GitHub with AI"
                      value={project.description}
                      onChange={(e) => {
                        const updated = [...data.featuredProjects]
                        updated[idx] = { ...updated[idx], description: e.target.value }
                        update('featuredProjects', updated)
                      }}
                      className="bg-[#15151f] border border-[#2a2a3a] rounded-lg px-2.5 py-1.5 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Tech Stack ────────────────────────────────── */}
      <section className="flex flex-col gap-4 bg-[#111119]/70 border border-[#232333]/90 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-[#232333]/60 pb-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
            <h2 className="text-xs font-bold text-gray-200 uppercase tracking-widest">
              Tech Stack
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
              <span className="text-gray-400 hover:text-gray-300 text-[11px] font-medium transition-colors">
                Guruhlash
              </span>
            </label>
            {data.skills.length > 0 && (
              <button
                onClick={() => update('skills', [])}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={11} />
                Clear all ({data.skills.length})
              </button>
            )}
          </div>
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
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                  active
                    ? 'bg-[#7C5CFC]/15 border-[#7C5CFC] shadow-[0_0_12px_#7C5CFC44]'
                    : 'bg-[#14141e]/50 border-[#222232] hover:border-[#7C5CFC]/40 hover:bg-[#7C5CFC]/5'
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
                    active ? 'text-[#a78bfa]' : 'text-gray-500'
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
      <section className="flex flex-col gap-4 bg-[#111119]/70 border border-[#232333]/90 rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-[#232333]/60 pb-3 mb-1">
          <div className="w-1.5 h-4.5 rounded-sm bg-gradient-to-b from-[#7C5CFC] to-[#a855f7]" />
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-widest">
            Widgets & Theme
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Theme Dropdown */}
          <div className="flex flex-col gap-1.5 relative">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Theme
            </span>
            
            {/* Custom Select Trigger */}
            <button
              type="button"
              onClick={() => {
                setThemeOpen(!themeOpen)
                setLayoutDropdownOpen(false)
              }}
              className="flex items-center justify-between w-full bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-100 hover:border-[#7C5CFC]/60 transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50"
            >
              <span>{THEMES.find((t) => t.value === data.theme)?.label || data.theme}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${themeOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Select Options Dropdown */}
            {themeOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setThemeOpen(false)}
                />
                <div className="absolute top-[calc(100%+4px)] left-0 w-full z-20 bg-[#13131c] border border-[#2a2a3e] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] py-1.5 max-h-56 overflow-y-auto backdrop-blur-md slide-down">
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
                            ? 'bg-[#7C5CFC]/15 text-[#a78bfa] font-semibold'
                            : 'text-gray-300 hover:bg-[#7C5CFC]/5 hover:text-white'
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
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Shablon (Layout)
            </span>
            
            {/* Custom Select Trigger */}
            <button
              type="button"
              onClick={() => {
                setLayoutDropdownOpen(!layoutDropdownOpen)
                setThemeOpen(false)
              }}
              className="flex items-center justify-between w-full bg-[#15151f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-100 hover:border-[#7C5CFC]/60 transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50"
            >
              <span>{LAYOUT_TEMPLATES.find((t) => t.value === data.layoutTemplate)?.label || 'Classic (Markazlashtirilgan)'}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${layoutDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Select Options Dropdown */}
            {layoutDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setLayoutDropdownOpen(false)}
                />
                <div className="absolute top-[calc(100%+4px)] left-0 w-full z-20 bg-[#13131c] border border-[#2a2a3e] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] py-1.5 max-h-56 overflow-y-auto backdrop-blur-md slide-down">
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
                            ? 'bg-[#7C5CFC]/15 text-[#a78bfa] font-semibold'
                            : 'text-gray-300 hover:bg-[#7C5CFC]/5 hover:text-white'
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
            { key: 'showBanner' as const, label: '⚡ Header Banner' },
            { key: 'showStats' as const, label: '📊 GitHub Stats' },
            { key: 'showStreak' as const, label: '🔥 Streak Stats' },
            { key: 'showTopLangs' as const, label: '📝 Top Languages' },
            { key: 'showTrophies' as const, label: '🏆 Trophies' },
            { key: 'showVisitorBadge' as const, label: '👁️ Visitor Counter' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 bg-[#14141e]/50 border border-[#222232] rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-[#7C5CFC]/40 transition-all duration-150 select-none"
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
