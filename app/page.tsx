'use client'

import { useState } from 'react'
import { Github, Sparkles } from 'lucide-react'
import ProfileForm from '@/components/ProfileForm'
import Preview from '@/components/Preview'
import { DEFAULT_DATA, generateReadme, ProfileData } from '@/lib/readme-generator'

export default function Home() {
  const [data, setData] = useState<ProfileData>(DEFAULT_DATA)
  const markdown = generateReadme(data)

  return (
    <main className="min-h-screen flex flex-col">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-[#2a2a3a] px-6 py-3.5 flex items-center justify-between bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#a855f7] flex items-center justify-center glow-pulse shrink-0">
            <Sparkles size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              GitHub README Generator
            </h1>
            <p className="text-[11px] text-gray-500 leading-none mt-0.5">
              Build a stunning profile README — no markdown needed
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-[#a78bfa] bg-[#7C5CFC]/10 border border-[#7C5CFC]/25 px-2.5 py-1 rounded-full">
            <Sparkles size={10} />
            AI Powered
          </span>
          <a
            href="https://github.com/OgabekHub/github-readme-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-150"
          >
            <Github size={16} />
            <span className="text-sm">GitHub</span>
          </a>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Form panel */}
        <div className="overflow-y-auto border-r border-[#2a2a3a] p-6">
          <ProfileForm data={data} onChange={setData} />
        </div>

        {/* Preview panel */}
        <div className="overflow-hidden flex flex-col bg-[#0a0a0f]">
          <Preview markdown={markdown} />
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-[#2a2a3a] px-6 py-2.5 flex items-center justify-center">
        <p className="text-[11px] text-gray-600">
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
            className="hover:text-gray-400 transition-colors"
          >
            Open Source
          </a>
        </p>
      </footer>
    </main>
  )
}
