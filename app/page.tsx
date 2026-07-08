'use client'

import { useState, useEffect } from 'react'
import { Github, Sparkles, Info } from 'lucide-react'
import ProfileForm from '@/components/ProfileForm'
import Preview from '@/components/Preview'
import ThemeToggle from '@/components/ThemeToggle'
import ClickSpark from '@/components/ClickSpark'
import { DEFAULT_DATA, generateReadme, ProfileData } from '@/lib/readme-generator'
import { TRANSLATIONS } from '@/lib/i18n'
import confetti from 'canvas-confetti'

export default function Home() {
  const [data, setData] = useState<ProfileData>(DEFAULT_DATA)
  const [hostUrl, setHostUrl] = useState('https://github-readme-generator.vercel.app')
  const [lang, setLang] = useState<'uz' | 'en' | 'ru'>('uz')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [session, setSession] = useState<{ loggedIn: boolean; username?: string; name?: string; avatarUrl?: string }>({
    loggedIn: false,
  })
  const [committing, setCommitting] = useState(false)
  const [commitResult, setCommitResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null)

  // Set host url on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostUrl(window.location.origin)
    }
  }, [])

  // Load language preference
  useEffect(() => {
    const saved = localStorage.getItem('app_lang')
    if (saved === 'uz' || saved === 'en' || saved === 'ru') {
      setLang(saved)
    }
  }, [])

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme)
      document.documentElement.className = savedTheme
    } else {
      setTheme('dark')
      document.documentElement.className = 'dark'
    }
  }, [])

  // Load user session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const json = await res.json()
        if (json.loggedIn) {
          setSession(json)
          // Pre-fill GitHub username if empty
          if (!data.github && json.username) {
            setData((prev) => ({ ...prev, github: json.username }))
          }
        }
      } catch (err) {
        console.error('Session loading failed', err)
      }
    }
    fetchSession()
  }, [])

  const handleSetLang = (l: 'uz' | 'en' | 'ru') => {
    setLang(l)
    localStorage.setItem('app_lang', l)
  }

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('app_theme', newTheme)
    document.documentElement.className = newTheme
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
      if (!res.ok) throw new Error(json.error ?? 'Commit failed')
      
      setCommitResult({ success: true, url: json.url })
      
      // Confetti celebration!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      })
    } catch (e: any) {
      setCommitResult({ success: false, error: e.message || 'Error occurred' })
    } finally {
      setCommitting(false)
    }
  }

  const markdown = generateReadme(data, hostUrl)
  const t = TRANSLATIONS[lang]

  return (
    <main className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--glow-1)] blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--glow-2)] blur-[120px] pointer-events-none -z-10" />
      
      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-[var(--border-input)] px-6 py-3.5 flex items-center justify-between bg-[var(--bg-main)]/90 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <img
            src="/logo.svg"
            alt="GitHub README Generator Logo"
            className="w-9 h-9 glow-pulse shrink-0 rounded-xl"
          />
          <div>
            <h1 className="text-sm font-bold leading-tight text-[var(--text-main)]">
              {t.appTitle}
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] leading-none mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <ThemeToggle theme={theme} onChange={handleSetTheme} />

          {/* Language Selector */}
          <div className="flex bg-[var(--bg-input)] border border-[var(--border-input)] rounded-lg p-0.5 transition-colors duration-300">
            {(['uz', 'en', 'ru'] as const).map((l) => (
              <button
                key={l}
                onClick={() => handleSetLang(l)}
                className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase transition-all duration-150 ${
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-input)] hover:bg-[#7C5CFC]/10 border border-[var(--border-input)] hover:border-[#7C5CFC]/40 text-[var(--text-main)] transition-all duration-150 hover:shadow-[0_0_10px_rgba(124,92,252,0.15)] group shrink-0"
          >
            <Github size={14} className="group-hover:rotate-[360deg] transition-transform duration-500 text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
            <span>⭐ Star on GitHub</span>
          </a>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Form panel */}
        <div className="overflow-y-auto border-r border-[var(--border-input)] p-6 transition-colors duration-300">
          <ProfileForm 
            data={data} 
            onChange={setData}
            lang={lang}
            session={session}
            onLogout={handleLogout}
            onCommit={handleCommit}
            committing={committing}
            commitResult={commitResult}
          />
        </div>

        {/* Preview panel */}
        <div className="overflow-hidden flex flex-col bg-[var(--bg-input)] transition-colors duration-300">
          {(data.showSnakeAnimation || data.show3dContrib) && data.github && (
            <div className="bg-[#7C5CFC]/10 border-b border-[#7C5CFC]/30 px-5 py-4 text-xs text-[var(--text-main)] overflow-y-auto max-h-[40vh] shrink-0">
              <div className="flex gap-2">
                <Info size={16} className="text-[#7C5CFC] shrink-0 mt-0.5" />
                <div className="w-full">
                  <strong className="block mb-2 text-sm">{t.instructionsTitle}</strong>
                  <p 
                    className="mb-3 text-[var(--text-light)]"
                    dangerouslySetInnerHTML={{ __html: t.instructionsDesc.replace('{repo}', `${data.github}/${data.github}`) }}
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
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: Platane/snk@v3
        with:
          github_user_name: \${{ github.repository_owner }}
          outputs: dist/github-contribution-grid-snake.svg?palette=github-dark
      - uses: crazy-max/ghaction-github-pages@v3
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
                      <p className="text-[var(--text-light)]">
                        <span dangerouslySetInnerHTML={{ __html: t.instructions3d }} />{' '}
                        <a href="https://github.com/yoshi389111/github-profile-3d-contrib" target="_blank" rel="noopener noreferrer" className="text-[#7C5CFC] underline hover:text-[#a855f7]">
                          {t.officialPage}
                        </a>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <Preview markdown={markdown} lang={lang} />
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
      <ClickSpark />
    </main>
  )
}

