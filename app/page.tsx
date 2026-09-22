'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { Sparkles, Info, CheckCircle, XCircle, X, PencilLine, Eye } from 'lucide-react'
import { MotionConfig } from 'framer-motion'
import GithubIcon from '@/components/GithubIcon'
import ProfileForm, { CommitResult } from '@/components/ProfileForm'
import Preview from '@/components/Preview'
import ThemeToggle from '@/components/ThemeToggle'
import ClickRipple from '@/components/ClickRipple'
import { generateReadme } from '@/lib/readme-generator'
import { Language, TRANSLATIONS, translateError } from '@/lib/i18n'
import { escapeHtml } from '@/lib/escape'
import { useOrigin, useStoredChoice } from '@/lib/browser-state'
import { useProfileData } from '@/lib/form-store'
import { cleanGithubUsername, isValidGithubUsername } from '@/lib/github-username'
import confetti from 'canvas-confetti'

type AuthNotice = { kind: 'error'; code: string } | { kind: 'connected' }

const LANGUAGES = ['uz', 'en', 'ru'] as const
const COLOR_MODES = ['dark', 'light'] as const

// Stats shown in the live preview until the user enters a username (never exported)
const DEMO_USER = 'OgabekHub'

/** A banner served from these hosts cannot be loaded by GitHub. */
function isLocalUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return (
      hostname === 'localhost' || hostname === '[::1]' || hostname.endsWith('.local') ||
      /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)
    )
  } catch {
    return false
  }
}

// Result of the GitHub OAuth redirect (/?error=… or /?connected=1), captured once
// in the browser before the query string is cleaned up.
const oauthRedirect: AuthNotice | null = (() => {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const error = params.get('error')
  if (error) return { kind: 'error', code: error }
  return params.has('connected') ? { kind: 'connected' } : null
})()

const noopSubscribe = () => () => {}

export default function Home() {
  const [data, setData, resetData] = useProfileData()
  // Public URL of this app for the banner and footer link; set NEXT_PUBLIC_SITE_URL in production
  const origin = useOrigin('')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const [lang, setLang] = useStoredChoice<Language>('app_lang', LANGUAGES, 'uz')
  const [theme, setTheme] = useStoredChoice<'light' | 'dark'>('app_theme', COLOR_MODES, 'dark')
  const [session, setSession] = useState<{ loggedIn: boolean; username?: string; name?: string; avatarUrl?: string }>({
    loggedIn: false,
  })
  const [committing, setCommitting] = useState(false)
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null)
  const authResult = useSyncExternalStore(noopSubscribe, () => oauthRedirect, () => null)
  const [noticeDismissed, setNoticeDismissed] = useState(false)
  // Phones show either the form or the preview, switched from the bottom bar
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
  const authNotice = noticeDismissed ? null : authResult
  const t = TRANSLATIONS[lang]

  // Drop ?error= / ?connected= from the address bar once they have been read
  useEffect(() => {
    if (authResult) window.history.replaceState(null, '', window.location.pathname)
  }, [authResult])

  // Apply the stored theme and language to <html>
  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Load user session
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (!json.loggedIn) return
        setSession(json)
        // Pre-fill the GitHub username unless the user already typed one
        if (json.username) {
          setData((prev) => (prev.github ? prev : { ...prev, github: json.username }))
        }
      })
      .catch((err) => console.error('Session loading failed', err))
  }, [setData])

  const handleSetLang = (l: Language) => {
    setLang(l)
  }

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    // Applied synchronously so the View Transition captures the new theme
    document.documentElement.className = newTheme
    setTheme(newTheme)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setSession({ loggedIn: false })
      setCommitResult(null)
    } catch (err) {
      console.error('Logout error', err)
    }
  }

  const handleCommit = async () => {
    setCommitting(true)
    setCommitResult(null)
    try {
      const res = await fetch('/api/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown }),
      })
      const json = await res.json()
      if (!res.ok) {
        const message = translateError(lang, json.code, json.error)
        // Keep GitHub's own explanation for failed writes (e.g. missing permissions)
        throw new Error(json.code === 'commit_failed' && json.error ? `${message} (${json.error})` : message)
      }

      setCommitResult({ success: true, url: json.url, warning: json.warning })

      // Confetti celebration!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      })
    } catch (e) {
      setCommitResult({ success: false, error: e instanceof Error ? e.message : t.errors.unknown })
    } finally {
      setCommitting(false)
    }
  }

  const showMobileView = (view: 'edit' | 'preview') => {
    setMobileView(view)
    window.scrollTo({ top: 0 })
  }

  const handleReset = () => {
    if (window.confirm(t.resetConfirm)) {
      resetData()
      setCommitResult(null)
    }
  }

  // Exported README (copy / download / commit) — never contains the demo user's stats
  const markdown = generateReadme(data, { siteUrl })
  const hasOwnUsername = isValidGithubUsername(cleanGithubUsername(data.github))
  const previewMarkdown = hasOwnUsername ? markdown : generateReadme(data, { siteUrl, previewUser: DEMO_USER })
  const demoUser = previewMarkdown !== markdown ? DEMO_USER : ''

  return (
    <MotionConfig reducedMotion="user">
    <main className="min-h-screen lg:h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 relative overflow-clip pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--glow-1)] blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--glow-2)] blur-[120px] pointer-events-none -z-10" />
      
      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-input)] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 bg-surface/90 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo */}
          <img
            src="/logo.svg"
            alt="GitHub README Generator Logo"
            className="w-9 h-9 glow-pulse shrink-0 rounded-[9px]"
          />
          <div className="min-w-0">
            <h1 className="text-[13px] sm:text-sm font-bold leading-tight text-[var(--text-main)] line-clamp-2">
              {t.appTitle}
            </h1>
            <p className="hidden sm:block text-[11px] text-[var(--text-muted)] leading-none mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Switcher */}
          <ThemeToggle theme={theme} onChange={handleSetTheme} label={t.toggleTheme} />

          {/* Language Selector */}
          <div className="flex bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg p-0.5 transition-colors duration-300">
            {(['uz', 'en', 'ru'] as const).map((l) => (
              <button
                key={l}
                aria-pressed={lang === l}
                onClick={() => handleSetLang(l)}
                className={`flex items-center justify-center min-w-8 min-h-8 px-2 text-[11px] font-bold rounded-md uppercase transition-all duration-150 ${
                  lang === l
                    ? 'bg-[#7C5CFC] text-white shadow-[0_0_8px_#7C5CFC33]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-accent)] bg-[#7C5CFC]/10 border border-[#7C5CFC]/25 px-2.5 py-1 rounded-full">
            <Sparkles size={10} />
            {t.aiPowered}
          </span>
          <a
            href="https://github.com/OgabekHub/github-readme-generator"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.starOnGithub}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-input)] hover:bg-[#7C5CFC]/10 border border-[var(--border-input)] hover:border-[#7C5CFC]/40 text-[var(--text-main)] transition-all duration-150 hover:shadow-[0_0_10px_rgba(124,92,252,0.15)] group shrink-0"
          >
            <GithubIcon size={14} className="group-hover:rotate-[360deg] transition-transform duration-500 text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
            <span className="hidden md:inline">{t.starOnGithub}</span>
          </a>
        </div>
      </header>

      {/* ── GitHub connection result ───────────────────── */}
      {authNotice && (
        <div
          role={authNotice.kind === 'error' ? 'alert' : 'status'}
          className={`slide-down flex items-center gap-2 px-6 py-2.5 text-xs border-b ${
            authNotice.kind === 'error'
              ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : 'text-green-400 bg-green-500/10 border-green-500/20'
          }`}
        >
          {authNotice.kind === 'error' ? <XCircle size={14} className="shrink-0" /> : <CheckCircle size={14} className="shrink-0" />}
          <span className="flex-1">
            {authNotice.kind === 'error' ? translateError(lang, authNotice.code) : t.connectedSuccess}
          </span>
          <button
            type="button"
            onClick={() => setNoticeDismissed(true)}
            aria-label={t.dismiss}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] lg:min-h-0">
        {/* Form panel */}
        <div className={`${mobileView === 'preview' ? 'hidden lg:block' : ''} lg:overflow-y-auto lg:border-r border-[var(--border-input)] p-4 sm:p-6 transition-colors duration-300`}>
          <ProfileForm 
            data={data} 
            onChange={setData}
            lang={lang}
            session={session}
            onLogout={handleLogout}
            onCommit={handleCommit}
            committing={committing}
            commitResult={commitResult}
            requestedSection={authResult ? 'extras' : null}
            bannerUnavailable={isLocalUrl(siteUrl)}
            onReset={handleReset}
          />
        </div>

        {/* Preview panel */}
        <div className={`${mobileView === 'edit' ? 'hidden lg:flex' : 'flex'} flex-col lg:min-h-0 bg-[var(--bg-input)] transition-colors duration-300`}>
          {(data.showSnakeAnimation || data.show3dContrib) && hasOwnUsername && (
            <div className="bg-[#7C5CFC]/10 border-b border-[#7C5CFC]/30 px-5 py-4 text-xs text-[var(--text-main)] overflow-y-auto max-h-[40vh] shrink-0">
              <div className="flex gap-2">
                <Info size={16} className="text-[#7C5CFC] shrink-0 mt-0.5" />
                <div className="w-full">
                  <strong className="block mb-2 text-sm">{t.instructionsTitle}</strong>
                  <p 
                    className="mb-3 text-[var(--text-light)]"
                    dangerouslySetInnerHTML={{ __html: t.instructionsDesc.replace('{repo}', escapeHtml(`${cleanGithubUsername(data.github)}/${cleanGithubUsername(data.github)}`)) }}
                  />
                  
                  {data.showSnakeAnimation && (
                    <div className="mb-4">
                      <p 
                        className="mb-1 text-[var(--text-light)]"
                        dangerouslySetInnerHTML={{ __html: t.instructionsSnake }}
                      />
                      <pre className="p-2 bg-[var(--bg-main)] rounded border border-[var(--border-input)] overflow-x-auto text-[11px] font-mono text-[var(--text-muted)]">
{`name: Generate Snake
on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:
permissions:
  contents: write
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: Platane/snk@v3
        with:
          github_user_name: \${{ github.repository_owner }}
          outputs: dist/github-contribution-grid-snake.svg?palette=github-dark
      - uses: crazy-max/ghaction-github-pages@v5
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`}
                      </pre>
                    </div>
                  )}

                  {data.show3dContrib && (
                    <div className="mb-2">
                      <p
                        className="mb-1 text-[var(--text-light)]"
                        dangerouslySetInnerHTML={{ __html: t.instructions3d }}
                      />
                      <pre className="p-2 bg-[var(--bg-main)] rounded border border-[var(--border-input)] overflow-x-auto text-[11px] font-mono text-[var(--text-muted)]">
{`name: GitHub-Profile-3D-Contrib
on:
  schedule:
    - cron: "0 18 * * *"
  workflow_dispatch:
permissions:
  contents: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: yoshi389111/github-profile-3d-contrib@latest
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          USERNAME: \${{ github.repository_owner }}
      - name: Commit & Push
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add -A .
          if git commit -m "generated"; then
            git push
          fi`}
                      </pre>
                      <a href="https://github.com/yoshi389111/github-profile-3d-contrib" target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-[#7C5CFC] underline hover:text-[#a855f7]">
                        {t.officialPage} →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <Preview markdown={markdown} previewMarkdown={previewMarkdown} demoUser={demoUser} lang={lang} />
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-input)] px-6 py-2.5 flex items-center justify-center bg-[var(--bg-main)] transition-colors duration-300">
        <p className="text-[11px] text-[var(--text-muted)]">
          Built with ❤️ by{' '}
          <a
            href="https://github.com/OgabekHub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7C5CFC] hover:text-[#a78bfa] transition-colors"
          >
            OgabekHub
          </a>
          {' '}·{' '}
          <a
            href="https://github.com/OgabekHub/github-readme-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-main)] transition-colors"
          >
            {t.openSource}
          </a>
        </p>
      </footer>

      {/* Global Click Spark Canvas */}
      {/* ── Phones: switch between the form and the preview ── */}
      <nav
        aria-label={`${t.navEdit} / ${t.navPreview}`}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-2 border-t border-[var(--border-input)] bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        {([
          ['edit', t.navEdit, PencilLine],
          ['preview', t.navPreview, Eye],
        ] as const).map(([view, label, Icon]) => (
          <button
            key={view}
            type="button"
            aria-pressed={mobileView === view}
            onClick={() => showMobileView(view)}
            className={`relative flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] font-semibold transition-colors ${
              mobileView === view ? 'text-[var(--text-accent)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {mobileView === view && (
              <span className="absolute top-0 inset-x-10 h-0.5 rounded-full bg-gradient-to-r from-[#7C5CFC] to-[#a855f7]" />
            )}
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <ClickRipple />
    </main>
    </MotionConfig>
  )
}

