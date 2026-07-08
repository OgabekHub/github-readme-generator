'use client'

import { useState } from 'react'
import { Copy, Check, Download, Eye, Code2 } from 'lucide-react'
import { markdownToHtml } from '@/lib/markdown'
import { TRANSLATIONS } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

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
    <div className="flex flex-col h-full relative">
      {/* ── Floating Action Bar ────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-input)] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-transparent text-[var(--text-main)] hover:bg-white/10 active:scale-95 transition-all duration-150"
        >
          {copied ? (
            <Check size={14} className="text-green-400" />
          ) : (
            <Copy size={14} className="text-[#7C5CFC]" />
          )}
          {copied ? t.copiedBtn : t.copyBtn}
        </button>
        <div className="w-[1px] h-4 bg-[var(--border-input)]" />
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7C5CFC] to-[#a855f7] text-white hover:shadow-[0_0_15px_rgba(124,92,252,0.5)] active:scale-95 transition-all duration-150"
        >
          <Download size={14} /> Download
        </button>
      </div>

      {/* ── Tabs Header ────────────────────────────── */}
      <div className="flex items-center justify-center border-b border-[var(--border-input)] px-5 py-3 shrink-0 bg-[var(--bg-main)]/40 backdrop-blur-sm transition-colors duration-300">
        <div className="flex gap-1 bg-[var(--bg-input)]/80 border border-[var(--border-input)] p-1 rounded-xl transition-colors duration-300">
          <button
            onClick={() => setTab('preview')}
            className={`relative flex items-center gap-1.5 px-6 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === 'preview' ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {tab === 'preview' && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#7C5CFC] rounded-lg shadow-[0_2px_8px_rgba(124,92,252,0.4)]" />
            )}
            <span className="relative z-10 flex items-center gap-1.5"><Eye size={12} /> {t.previewTab}</span>
          </button>
          <button
            onClick={() => setTab('code')}
            className={`relative flex items-center gap-1.5 px-6 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === 'code' ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {tab === 'code' && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#7C5CFC] rounded-lg shadow-[0_2px_8px_rgba(124,92,252,0.4)]" />
            )}
            <span className="relative z-10 flex items-center gap-1.5"><Code2 size={12} /> {t.markdownTab}</span>
          </button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {tab === 'preview' ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md-preview bg-[var(--bg-card)] backdrop-blur-sm rounded-xl p-8 text-sm text-[var(--text-light)] leading-relaxed border border-[var(--border-input)]/50 transition-colors duration-300 shadow-sm min-h-full"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
            />
          ) : (
            <motion.pre
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--bg-card)] backdrop-blur-sm rounded-xl p-6 text-xs text-[var(--text-light)] overflow-x-auto whitespace-pre-wrap font-mono border border-[var(--border-input)]/50 leading-relaxed transition-colors duration-300 shadow-sm min-h-full"
            >
              {markdown}
            </motion.pre>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
