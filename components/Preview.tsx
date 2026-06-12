'use client'

import { useState } from 'react'
import { Copy, Check, Download, Eye, Code2 } from 'lucide-react'
import { markdownToHtml } from '@/lib/markdown'
import { TRANSLATIONS } from '@/lib/i18n'

interface PreviewProps {
  markdown: string
  lang?: 'uz' | 'en' | 'ru'
}

export default function Preview({ markdown, lang = 'uz' }: PreviewProps) {
  const t = TRANSLATIONS[lang]
  const [tab, setTab] = useState<'preview' | 'code'>('preview')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'README.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Tabs + actions ────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[var(--border-input)] px-5 py-3 shrink-0 bg-[var(--bg-main)]/40 backdrop-blur-sm transition-colors duration-300">
        <div className="flex gap-1 bg-[var(--bg-input)]/80 border border-[var(--border-input)] p-1 rounded-xl transition-colors duration-300">
          <button
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === 'preview'
                ? 'bg-[#7C5CFC] text-white shadow-[0_2px_8px_rgba(124,92,252,0.4)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Eye size={12} /> {t.previewTab}
          </button>
          <button
            onClick={() => setTab('code')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === 'code'
                ? 'bg-[#7C5CFC] text-white shadow-[0_2px_8px_rgba(124,92,252,0.4)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Code2 size={12} /> {t.markdownTab}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-input)] text-[var(--text-light)] hover:border-[#7C5CFC] hover:text-[var(--text-main)] active:scale-95 transition-all duration-150 bg-[var(--bg-input)]/30"
          >
            {copied ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Copy size={12} />
            )}
            {copied ? t.copiedBtn : t.copyBtn}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#7C5CFC] to-[#a855f7] text-white hover:opacity-90 active:scale-95 transition-all duration-150 shadow-[0_0_12px_rgba(124,92,252,0.3)]"
          >
            <Download size={12} /> Download
          </button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4">
        {tab === 'preview' ? (
          <div
            key="preview"
            className="tab-content md-preview bg-[var(--bg-input)] rounded-xl p-6 text-sm text-[var(--text-light)] leading-relaxed border border-[var(--border-input)]/50 transition-colors duration-300"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
          />
        ) : (
          <pre
            key="code"
            className="tab-content bg-[var(--bg-input)] rounded-xl p-4 text-xs text-[var(--text-light)] overflow-x-auto whitespace-pre-wrap font-mono border border-[var(--border-input)]/50 leading-relaxed transition-colors duration-300"
          >
            {markdown}
          </pre>
        )}
      </div>
    </div>
  )
}
