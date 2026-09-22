'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FeaturedProject,
  isValidEmail,
  isValidWebsite,
  LAYOUT_TEMPLATES,
  MAX_PROJECTS,
  ProfileData,
  SKILL_COLORS,
  SKILL_OPTIONS,
  usesGithubWidgets,
} from '@/lib/readme-generator'
import { THEMES } from '@/lib/themes'
import Dropdown from '@/components/Dropdown'
import { X, Sparkles, Loader2, CheckCircle, XCircle, ChevronDown, Search } from 'lucide-react'
import { TRANSLATIONS, translateError } from '@/lib/i18n'
import { cleanGithubUsername, isValidGithubUsername } from '@/lib/github-username'

export interface CommitResult {
  success: boolean
  url?: string
  error?: string
  warning?: string
}

interface FormProps {
  data: ProfileData
  onChange: (data: ProfileData) => void
  lang: 'uz' | 'en' | 'ru'
  session: { loggedIn: boolean; username?: string; name?: string; avatarUrl?: string }
  onLogout: () => Promise<void>
  onCommit: () => Promise<void>
  committing: boolean
  commitResult: CommitResult | null
  /** Accordion section to open, e.g. 'extras' after returning from GitHub OAuth */
  requestedSection?: string | null
  /** The app runs on a local URL, so a banner image would not load on GitHub */
  bannerUnavailable?: boolean
  onReset: () => void
}

const LINK_KEYS = ['email', 'telegram', 'twitter', 'linkedin', 'instagram', 'youtube', 'facebook', 'website'] as const

type WidgetKey = {
  [K in keyof ProfileData]: K extends `show${string}` ? K : never
}[keyof ProfileData]

const WIDGET_KEYS: WidgetKey[] = [
  'showBanner', 'showCapsuleRender', 'showTypingSvg', 'showStats', 'showStreak', 'showTopLangs', 'showTrophies',
  'showSummaryCards', 'showActivityGraph', 'show3dContrib', 'showSnakeAnimation', 'showWakatime', 'showVisitorBadge', 'showCommittersRank',
]

const LANGUAGE_TABS = [
  { bio: 'bioUz', description: 'descriptionUz', name: 'O\'zbekcha' },
  { bio: 'bioEn', description: 'descriptionEn', name: 'English' },
  { bio: 'bioRu', description: 'descriptionRu', name: 'Русский' },
] as const

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
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
        {label}
      </span>
      <input
        {...props}
        aria-invalid={hint ? true : undefined}
        className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent transition-all duration-150"
      />
      {hint && <span className="text-[11px] text-amber-400">{hint}</span>}
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
  commitResult,
  requestedSection,
  bannerUnavailable,
  onReset,
}: FormProps) {
  const t = TRANSLATIONS[lang]
  const layoutLabels: Record<string, string> = {
    classic: t.layoutClassic,
    minimalist: t.layoutMinimalist,
    cyberpunk: t.layoutCyberpunk,
  }
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  
  // AI Options state
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false)
  const [aiTone, setAiTone] = useState<'professional' | 'minimalist' | 'creative' | 'hacker'>('professional')
  const [aiInstructions, setAiInstructions] = useState('')
  const [openSection, setOpenSection] = useState<string>('basic')
  const [skillQuery, setSkillQuery] = useState('')
  const visibleSkills = SKILL_OPTIONS.filter((skill) => skill.includes(skillQuery.trim().toLowerCase()))

  const handleSectionToggle = (id: string) => {
    setOpenSection(prev => prev === id ? '' : id)
  }

  // Open the section the page asks for (adjusting state while rendering, as React recommends)
  const [handledSection, setHandledSection] = useState(requestedSection)
  if (requestedSection !== handledSection) {
    setHandledSection(requestedSection)
    if (requestedSection) setOpenSection(requestedSection)
  }

  const cleanedGithub = cleanGithubUsername(data.github)
  const githubInvalid = cleanedGithub !== '' && !isValidGithubUsername(cleanedGithub)

  const [confirmingCommit, setConfirmingCommit] = useState(false)
  // Stats in the README are shown for the form's username, not for the connected account
  const usernameMismatch =
    !!session.username && isValidGithubUsername(cleanedGithub) &&
    cleanedGithub.toLowerCase() !== session.username.toLowerCase()

  const count = (n: number) => (n > 0 ? String(n) : undefined)
  const filledLinks = LINK_KEYS.filter((key) => data[key].trim()).length

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
    if (!cleanedGithub || githubInvalid) return
    setAnalyzing(true)
    setAiError(null)
    setSuggestion(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanedGithub,
          tone: aiTone,
          instructions: aiInstructions
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(translateError(lang, json.code, json.error))
      setSuggestion(json as AISuggestion)
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : t.errors.unknown)
    } finally {
      setAnalyzing(false)
    }
  }

  /* ── Apply AI suggestion ───────────────────── */
  const applySuggestion = () => {
    if (!suggestion) return

    // The main bio/description follows the UI language (single-language README);
    // every language tab of the multilingual README gets its own translation.
    const aiProjects: FeaturedProject[] = (suggestion.projects ?? []).map((p, i) => ({
      name: p.name,
      description: cardProjects?.[i]?.description || p.description,
      descriptionUz: p.description,
      descriptionEn: suggestion.projectsEn?.[i]?.description ?? '',
      descriptionRu: suggestion.projectsRu?.[i]?.description ?? '',
    }))

    onChange({
      ...data,
      bio:              cardBio              || data.bio,
      bioUz:            suggestion.bio       || data.bioUz,
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
      featuredProjects: aiProjects.length > 0 ? aiProjects : data.featuredProjects,
    })
    setSuggestion(null)
  }

  /* ── Featured project editing ──────────────── */
  const updateProject = (index: number, changes: Partial<FeaturedProject>) =>
    update('featuredProjects', data.featuredProjects.map((p, i) => (i === index ? { ...p, ...changes } : p)))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end -mb-3">
        <button
          type="button"
          onClick={onReset}
          className="px-2 py-1.5 -mr-2 text-[11px] text-[var(--text-muted)] hover:text-red-400 transition-colors"
        >
          {t.resetForm}
        </button>
      </div>

      {/* ── Quick start: GitHub username + AI analysis ───── */}
      <section
        aria-labelledby="quick-start-title"
        className="relative flex flex-col gap-4 bg-[var(--bg-card)] border border-[#7C5CFC]/40 rounded-2xl p-5 shadow-[0_0_24px_rgba(124,92,252,0.12)] lg:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-1">
          <h2 id="quick-start-title" className="flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
            <Sparkles size={16} className="text-[#a855f7]" /> {t.quickStartTitle}
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">{t.quickStartHint}</p>
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
              aria-invalid={githubInvalid}
              onChange={(e) => update('github', e.target.value.trim())}
              onPaste={(e) => {
                // Pasting a profile URL keeps just the username
                e.preventDefault()
                update('github', cleanGithubUsername(e.clipboardData.getData('text')))
              }}
              onBlur={(e) => update('github', cleanGithubUsername(e.target.value))}
              className="flex-1 min-w-0 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all duration-150"
            />
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!cleanedGithub || githubInvalid || analyzing}
              title={t.analyzeTitle}
              aria-label={t.analyzeTitle}
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
          {githubInvalid && (
            <p className="text-[11px] text-amber-400">{t.invalidUsername}</p>
          )}
        </div>

        {/* AI Options Toggle */}
        <div className="border-t border-line/60 pt-3">
          <button
            type="button"
            onClick={() => setAiSettingsOpen(!aiSettingsOpen)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <span>{t.aiSettings}</span>
            <span className="text-[10px]">{aiSettingsOpen ? '▲' : '▼'}</span>
          </button>

          {aiSettingsOpen && (
            <div className="flex flex-col gap-3 mt-3 slide-down bg-field/30 border border-line/50 p-3.5 rounded-xl">
              {/* Tone Selection */}
              <Dropdown
                size="sm"
                label={t.bioTone}
                value={aiTone}
                onChange={setAiTone}
                options={[
                  { value: 'professional', label: t.toneProfessional },
                  { value: 'minimalist', label: t.toneMinimalist },
                  { value: 'creative', label: t.toneCreative },
                  { value: 'hacker', label: t.toneHacker },
                ]}
              />

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
                  className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50 resize-none"
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
              <div className="flex flex-col gap-1.5 border-t border-line/40 pt-2.5">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium">
                  {t.suggestedProjects}
                </span>
                <div className="flex flex-col gap-1.5">
                  {cardProjects.map((p, idx) => (
                    <div key={idx} className="bg-field/50 border border-line/70 p-2.5 rounded-xl text-xs flex flex-col gap-0.5">
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
      </section>

      {/* ── Basic Info ────────────────────────────────── */}
      <AccordionSection id="basic" step={1} summary={data.name.trim() ? '✓' : undefined} title={t.basicInfo} isOpen={openSection === "basic"} onToggle={handleSectionToggle}>
        <div className="flex flex-col gap-4 relative">

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
        {/* Multilingual README Toggle */}
        <label className="flex items-center gap-2 bg-field/50 border border-[var(--border-input)] rounded-xl px-4 py-2.5 cursor-pointer hover:border-[#7C5CFC]/40 transition-all duration-150 select-none">
          <input
            type="checkbox"
            checked={data.multilingualReadme}
            onChange={(e) => update('multilingualReadme', e.target.checked)}
            className="accent-[#7C5CFC] w-4 h-4 shrink-0"
          />
          <span className="text-[var(--text-light)] text-xs font-semibold">{t.multilingualReadmeToggle}</span>
        </label>

        {!data.multilingualReadme ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t.bio}
            </span>
            <textarea
              placeholder={t.bioPlaceholder}
              value={data.bio}
              onChange={(e) => update('bio', e.target.value)}
              rows={2}
              className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all duration-150 resize-none"
            />
          </label>
        ) : (
          // Each tab falls back to the main bio, which is shown as the placeholder
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 slide-down">
            {LANGUAGE_TABS.map((tab) => (
              <label key={tab.bio} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                  {t.bioFor.replace('{lang}', tab.name)}
                </span>
                <textarea
                  placeholder={data.bio.trim() || t.bioPlaceholder}
                  value={data[tab.bio]}
                  onChange={(e) => update(tab.bio, e.target.value)}
                  rows={3}
                  className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50 resize-none"
                />
              </label>
            ))}
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
      
        </div>
      </AccordionSection>

      {/* ── Social Links ──────────────────────────────── */}
      <AccordionSection id="socials" step={2} summary={count(filledLinks)} title={t.links} isOpen={openSection === "socials"} onToggle={handleSectionToggle}>
        <div className="flex flex-col gap-4 relative">


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label={t.email}
            placeholder="you@example.com"
            hint={data.email.trim() && !isValidEmail(data.email) ? t.invalidEmail : undefined}
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
            placeholder={t.usernameOrUrl}
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
            placeholder={t.channelOrUsername}
            value={data.youtube}
            onChange={(e) => update('youtube', e.target.value)}
          />
          <Field
            label={t.facebook}
            placeholder={t.usernameOrUrl}
            value={data.facebook}
            onChange={(e) => update('facebook', e.target.value)}
          />
          <Field
            label={t.website}
            placeholder="yoursite.com"
            hint={data.website.trim() && !isValidWebsite(data.website) ? t.invalidWebsite : undefined}
            value={data.website}
            onChange={(e) => update('website', e.target.value)}
          />
        </div>
      
        </div>
      </AccordionSection>

      {/* ── Featured Projects ──────────────────────────── */}
      <AccordionSection id="projects" step={3} summary={count(data.featuredProjects.filter((p) => p.name.trim()).length)} title={t.featuredProjects} isOpen={openSection === "projects"} onToggle={handleSectionToggle}>
        <div className="flex flex-col gap-4 relative">
          <div className="flex justify-end mb-2">
          {data.featuredProjects.length < MAX_PROJECTS && (
            <button
              onClick={() => update('featuredProjects', [...data.featuredProjects, { name: '', description: '' }])}
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
            {data.featuredProjects.map((project, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2.5 p-4 bg-field/50 border border-[var(--border-input)] rounded-xl relative group"
                >
                  <button
                    onClick={() => update('featuredProjects', data.featuredProjects.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150"
                    title={t.removeProject}
                    aria-label={t.removeProject}
                  >
                    <X size={14} />
                  </button>

                  <div className="grid grid-cols-1 gap-2">
                    {/* Project Name */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                        {t.projectName}
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. github-readme-generator"
                        value={project.name}
                        onChange={(e) => updateProject(idx, { name: e.target.value })}
                        className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50"
                      />
                    </div>

                    {/* Descriptions — each language falls back to the main description */}
                    {!data.multilingualReadme ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                          {t.projectDesc}
                        </span>
                        <input
                          type="text"
                          placeholder={t.projectDescPlaceholder}
                          value={project.description}
                          onChange={(e) => updateProject(idx, { description: e.target.value })}
                          className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50"
                        />
                      </div>
                    ) : (
                      LANGUAGE_TABS.map((tab) => (
                        <div key={tab.description} className="flex flex-col gap-1">
                          <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                            {t.descriptionFor.replace('{lang}', tab.name)}
                          </span>
                          <input
                            type="text"
                            placeholder={project.description.trim() || t.projectDescPlaceholder}
                            value={project[tab.description] ?? ''}
                            onChange={(e) => updateProject(idx, { [tab.description]: e.target.value })}
                            className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-[#7C5CFC]/50"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
            ))}
          </div>
        )}
      
        </div>
      </AccordionSection>

      {/* ── Tech Stack ────────────────────────────────── */}
      <AccordionSection id="tech" step={4} summary={count(data.skills.length)} title={t.techStack} isOpen={openSection === "tech"} onToggle={handleSectionToggle}>
        <div className="flex flex-col gap-4 relative">
          <div className="flex justify-end mb-2">
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

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="search"
            value={skillQuery}
            onChange={(e) => setSkillQuery(e.target.value)}
            placeholder={t.skillSearch}
            aria-label={t.skillSearch}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-main)] placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/50 focus:border-transparent transition-all duration-150"
          />
        </div>

        {visibleSkills.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] italic">{t.noSkillsFound}</p>
        )}

        {/* Icon grid — shows actual skillicons.dev images (scrolls inside the card only on larger screens) */}
        <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-8 gap-2 sm:max-h-56 sm:overflow-y-auto p-2 pr-3 -mx-2">
          {visibleSkills.map((skill) => {
            const active = data.skills.includes(skill)
            const glowColor = SKILL_COLORS[skill] || '#7C5CFC'
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                title={skill}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border skill-glow-btn active:scale-95 transition-all duration-200 ${
                  active
                    ? 'bg-glow/10 text-[var(--text-main)]'
                    : 'bg-field/50 border-[var(--border-input)] hover:bg-[#7C5CFC]/5'
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
      
        </div>
      </AccordionSection>

      {/* ── GitHub Widgets & Theme ─────────────────────── */}
      <AccordionSection id="stats" step={5} summary={count(WIDGET_KEYS.filter((key) => data[key]).length)} title={t.widgetsAndTheme} isOpen={openSection === "stats"} onToggle={handleSectionToggle}>
        <div className="flex flex-col gap-4 relative">


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Dropdown
            label={t.theme}
            value={data.theme}
            onChange={(theme) => update('theme', theme)}
            options={THEMES}
          />
          <Dropdown
            label={t.layout}
            value={data.layoutTemplate}
            onChange={(layout) => update('layoutTemplate', layout)}
            options={LAYOUT_TEMPLATES.map((tmpl) => ({ value: tmpl.value, label: layoutLabels[tmpl.value] ?? tmpl.label }))}
          />
        </div>

        <WidgetGroup
          title={t.widgetGroupHeader}
          data={data}
          onToggle={update}
          items={[
            ['showBanner', t.widgetBanner],
            ['showCapsuleRender', t.widgetCapsule],
            ['showTypingSvg', t.widgetTypingSvg],
          ]}
        />

        {/* Capsule color picker */}
        {data.showCapsuleRender && (
          <div className="flex items-center gap-3 bg-field/50 border border-[var(--border-input)] rounded-lg px-3 py-2">
            <span className="text-xs text-[var(--text-muted)] shrink-0">{t.capsuleColorLabel}</span>
            <input
              type="color"
              value={data.capsuleColor || '#7C5CFC'}
              onChange={(e) => update('capsuleColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
            />
            <span className="text-xs text-[var(--text-light)] font-mono">{data.capsuleColor || '#7C5CFC'}</span>
          </div>
        )}

        {/* Typing SVG lines */}
        {data.showTypingSvg && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t.typingLinesLabel}
            </label>
            <input
              type="text"
              value={data.typingLines || ''}
              onChange={(e) => update('typingLines', e.target.value)}
              placeholder={t.typingLinesPlaceholder}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#7C5CFC]/60"
            />
          </div>
        )}

        <WidgetGroup
          title={t.widgetGroupStats}
          data={data}
          onToggle={update}
          items={[
            ['showStats', t.widgetStats],
            ['showStreak', t.widgetStreak],
            ['showTopLangs', t.widgetLangs],
            ['showTrophies', t.widgetTrophies],
            ['showSummaryCards', t.widgetSummaryCards],
            ['showActivityGraph', t.widgetActivityGraph],
          ]}
        />

        {/* Stats Provider Selector — shown when stats or top langs are enabled */}
        {(data.showStats || data.showTopLangs) && (
          <div className="flex flex-col gap-1.5">
            <Dropdown
              label={t.statsProviderLabel}
              value={data.statsProvider}
              onChange={(provider) => update('statsProvider', provider)}
              options={[
                { value: 'extended', label: t.statsProviderExtended },
                { value: 'official', label: t.statsProviderOfficial },
                { value: 'custom', label: t.statsProviderCustom },
              ]}
            />

            {/* Custom URL input */}
            {data.statsProvider === 'custom' && (
              <label className="flex flex-col gap-1.5 mt-1">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                  {t.customStatsUrlLabel}
                </span>
                <input
                  type="url"
                  value={data.customStatsUrl}
                  onChange={(e) => update('customStatsUrl', e.target.value)}
                  placeholder={t.customStatsUrlPlaceholder}
                  className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent transition-all duration-150"
                />
              </label>
            )}
          </div>
        )}

        <WidgetGroup
          title={t.widgetGroupExtras}
          data={data}
          onToggle={update}
          items={[
            ['show3dContrib', t.widget3dContrib],
            ['showSnakeAnimation', t.widgetSnake],
            ['showWakatime', t.widgetWakatime],
            ['showVisitorBadge', t.widgetViews],
            ['showCommittersRank', t.widgetCommittersRank],
          ]}
        />

        {/* WakaTime username */}
        {data.showWakatime && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t.wakatimeUsernameLabel}
            </label>
            <input
              type="text"
              value={data.wakatimeUsername || ''}
              onChange={(e) => update('wakatimeUsername', e.target.value)}
              placeholder={t.wakatimePlaceholder}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#7C5CFC]/60"
            />
            <p className="text-xs text-amber-400">{t.wakatimeHint}</p>
          </div>
        )}

        {!isValidGithubUsername(cleanedGithub) && usesGithubWidgets(data) && (
          <p className="text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
            {t.githubRequiredWarning}
          </p>
        )}

        {data.showBanner && bannerUnavailable && (
          <p className="text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
            {t.bannerLocalWarning}
          </p>
        )}
      
        </div>
      </AccordionSection>

      {/* ── GitHub Publish / Deploy ─────────────────────── */}
      <AccordionSection id="extras" step={6} summary={session.loggedIn ? '✓' : undefined} title={t.publishTitle} isOpen={openSection === "extras"} onToggle={handleSectionToggle}>
        <div className="flex flex-col gap-4 relative">
          <div className="flex justify-end mb-2">
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
              {t.connectGithubSub}
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
            <div className="flex items-center gap-3 bg-field/50 border border-[var(--border-input)] p-3 rounded-xl">
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
                {t.connected}
              </span>
            </div>

            {/* Commit controls */}
            <div className="flex flex-col gap-2">
              {usernameMismatch && (
                <p className="text-xs text-amber-400/90 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
                  {t.usernameMismatch.replace('{form}', cleanedGithub).replace('{account}', session.username ?? '')}
                </p>
              )}

              {!confirmingCommit ? (
                <button
                  onClick={() => setConfirmingCommit(true)}
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
              ) : (
                // The commit replaces the whole README.md, so ask once before overwriting it
                <div role="alertdialog" aria-label={t.commitToProfile} className="slide-down flex flex-col gap-2.5 text-xs bg-amber-400/10 border border-amber-400/30 rounded-xl px-3.5 py-3">
                  <p className="text-[var(--text-light)] leading-normal">
                    {t.commitConfirm.replace('{repo}', `${session.username}/${session.username}`)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirmingCommit(false)
                        onCommit()
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7C5CFC] text-white hover:bg-[#6a4ce0] active:scale-95 transition-all duration-150"
                    >
                      {t.commitConfirmYes}
                    </button>
                    <button
                      onClick={() => setConfirmingCommit(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] active:scale-95 transition-all duration-150"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              )}

              {/* Success Result */}
              {commitResult?.success && (
                <div className="slide-down flex flex-col gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3.5 py-3 mt-1 leading-normal">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle size={14} className="shrink-0" />
                    <span>{t.commitSuccess}</span>
                  </div>
                  {commitResult.warning === 'private_repo' && (
                    <p className="text-amber-400">{t.privateRepoWarning}</p>
                  )}
                  <a
                    href={commitResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-green-300 hover:text-green-200 mt-1 block font-medium"
                  >
                    {t.viewProfileBtn}
                  </a>

                  {/* GitHub Star CTA */}
                  <div className="border-t border-green-500/20 mt-2.5 pt-2 flex flex-col gap-2">
                    <p className="text-[10px] text-green-300/80">
                      {t.loveThisTool}
                    </p>
                    <a
                      href="https://github.com/OgabekHub/github-readme-generator"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C5CFC] hover:bg-[#a78bfa] text-white text-[11px] font-semibold transition-all duration-150 self-start shadow-[0_0_10px_#7C5CFC33] hover:shadow-[0_0_14px_#7C5CFC55] active:scale-95"
                    >
                      <Sparkles size={11} className="text-yellow-300 animate-pulse" />
                      <span>{t.starUs}</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Error Result */}
              {commitResult && !commitResult.success && (
                <div className="slide-down flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-3 mt-1 leading-normal">
                  <XCircle size={14} className="shrink-0" />
                  <span>{commitResult.error || t.commitError}</span>
                </div>
              )}
            </div>
          </div>
        )}
      
        </div>
      </AccordionSection>
    </div>
  )
}


/* ── Group of widget toggles ──────────────────────────── */
function WidgetGroup({
  title,
  items,
  data,
  onToggle,
}: {
  title: string
  items: [WidgetKey, string][]
  data: ProfileData
  onToggle: (key: WidgetKey, value: boolean) => void
}) {
  return (
    <fieldset className="flex flex-col gap-2 min-w-0">
      <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</legend>
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
        {items.map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-2.5 min-h-11 bg-field/50 border border-[var(--border-input)] rounded-lg px-3 py-2 cursor-pointer hover:border-[#7C5CFC]/40 transition-all duration-150 select-none"
          >
            <input
              type="checkbox"
              checked={data[key]}
              onChange={(e) => onToggle(key, e.target.checked)}
              className="accent-[#7C5CFC] w-4 h-4 shrink-0"
            />
            <span className="text-[var(--text-light)] text-xs">{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function AccordionSection({
  id,
  step,
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: {
  id: string
  step: number
  title: string
  /** Short status shown on the header, e.g. the number of selected skills */
  summary?: string
  isOpen: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)

  // Once the previously open section has collapsed, bring the opened one into view
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (!isOpen) return
    const timer = setTimeout(() => {
      const el = rootRef.current
      if (!el) return
      const { top } = el.getBoundingClientRect()
      if (top < 72 || top > window.innerHeight * 0.6) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      }
    }, 320)
    return () => clearTimeout(timer)
  }, [isOpen])

  return (
    <div
      ref={rootRef}
      className={`relative scroll-mt-20 lg:scroll-mt-4 bg-[var(--bg-card)] border rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] lg:backdrop-blur-sm transition-[border-color,box-shadow] duration-300 ${
        // Above the next sections (for dropdowns) but below the sticky page header
        isOpen ? 'z-30 border-[#7C5CFC]/60 shadow-[0_0_20px_rgba(124,92,252,0.15)]' : 'z-10 border-[var(--border-card)] hover:border-[#7C5CFC]/30'
      }`}
    >
      <h2>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`section-${id}`}
          onClick={() => onToggle(id)}
          className="w-full flex items-center gap-3 p-4 sm:p-5 text-left rounded-2xl transition-colors hover:bg-[#7C5CFC]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC]/60"
        >
          <span
            aria-hidden="true"
            className={`flex items-center justify-center w-6 h-6 shrink-0 rounded-full text-[11px] font-bold transition-colors duration-300 ${
              isOpen
                ? 'bg-gradient-to-br from-[#7C5CFC] to-[#a855f7] text-white shadow-[0_0_8px_rgba(124,92,252,0.5)]'
                : 'bg-[#7C5CFC]/15 text-[var(--text-accent)]'
            }`}
          >
            {step}
          </span>
          <span className="flex-1 min-w-0 truncate text-xs font-bold uppercase tracking-widest text-[var(--text-main)]">
            {title}
          </span>
          {summary && (
            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[var(--text-accent)]">
              {summary}
            </span>
          )}
          <motion.span
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="shrink-0"
          >
            <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${isOpen ? 'text-[#a855f7]' : 'text-[var(--text-muted)]'}`} />
          </motion.span>
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            id={`section-${id}`}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } },
              collapsed: { opacity: 0, height: 0, overflow: 'hidden' },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="p-4 pt-0 sm:p-5 sm:pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
