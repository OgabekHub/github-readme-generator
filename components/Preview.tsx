'use client'

import { useEffect, useMemo, useState } from 'react'
import { Copy, Check, Download, Eye, Code2, Info } from 'lucide-react'
import { markdownToHtml } from '@/lib/markdown'
import { useIsClient } from '@/lib/browser-state'
import { TRANSLATIONS } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

// Widget images are refetched whenever their URL changes, so the rendered preview
// waits for a pause in typing instead of loading every intermediate username.
const PREVIEW_DEBOUNCE_MS = 350

interface PreviewProps {
  /** The README that is copied, downloaded and committed */
  markdown: string
  /** What the preview renders — may use a demo username while none is entered */
  previewMarkdown?: string
  /** Set when the preview shows this demo user's stats */
  demoUser?: string
  lang?: 'uz' | 'en' | 'ru'
}

/** Copies text, falling back to a hidden textarea where the async Clipboard API is unavailable. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    textarea.remove()
    return ok
  }
}

export default function Preview({ markdown, previewMarkdown = markdown, demoUser, lang = 'uz' }: PreviewProps) {
  const t = TRANSLATIONS[lang]
  const [tab, setTab] = useState<'preview' | 'code'>('preview')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [renderedMarkdown, setRenderedMarkdown] = useState(previewMarkdown)

  useEffect(() => {
    const timer = setTimeout(() => setRenderedMarkdown(previewMarkdown), PREVIEW_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [previewMarkdown])

  // Sanitizing needs the DOM, so the preview HTML is only built in the browser
  const isClient = useIsClient()
  const html = useMemo(() => (isClient ? markdownToHtml(renderedMarkdown) : ''), [isClient, renderedMarkdown])

  const handleCopy = async () => {
    setCopyState((await copyText(markdown)) ? 'copied' : 'failed')
    setTimeout(() => setCopyState('idle'), 1500)
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'README.md'
    a.click()
    // Revoking synchronously can cancel the download in some browsers
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const tabs = [
    { id: 'preview' as const, label: t.previewTab, icon: <Eye size={12} /> },
    { id: 'code' as const, label: t.markdownTab, icon: <Code2 size={12} /> },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* ── Tabs Header ────────────────────────────── */}
      <div className="flex items-center justify-center border-b border-[var(--border-input)] px-5 py-3 shrink-0 bg-surface/40 backdrop-blur-sm transition-colors duration-300">
        <div role="tablist" className="flex gap-1 bg-field/80 border border-[var(--border-input)] p-1 rounded-xl transition-colors duration-300">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              aria-controls="preview-panel"
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-1.5 px-6 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                tab === id ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {tab === id && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#7C5CFC] rounded-lg shadow-[0_2px_8px_rgba(124,92,252,0.4)]" />
              )}
              <span className="relative z-10 flex items-center gap-1.5">{icon} {label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div id="preview-panel" role="tabpanel" className="flex-1 min-h-0 overflow-auto p-4 flex flex-col">
        {demoUser && tab === 'preview' && (
          <p className="flex items-start gap-2 mb-3 text-xs text-amber-400/90 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>{t.demoNotice.replace('{user}', demoUser)}</span>
          </p>
        )}
        <AnimatePresence mode="wait">
          {tab === 'preview' ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md-preview flex-1 bg-[var(--bg-card)] backdrop-blur-sm rounded-xl p-8 text-sm text-[var(--text-light)] leading-relaxed border border-line/50 transition-colors duration-300 shadow-sm"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <motion.pre
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 bg-[var(--bg-card)] backdrop-blur-sm rounded-xl p-6 text-xs text-[var(--text-light)] overflow-x-auto whitespace-pre-wrap font-mono border border-line/50 leading-relaxed transition-colors duration-300 shadow-sm"
            >
              {markdown}
            </motion.pre>
          )}
        </AnimatePresence>

        {/* ── Action Bar — sticks to the bottom of the visible preview ── */}
        <div className="sticky bottom-4 z-10 self-center mt-4 flex items-center gap-2 p-1.5 bg-card/80 backdrop-blur-md border border-[var(--border-input)] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <button
            onClick={handleCopy}
            aria-live="polite"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-transparent text-[var(--text-main)] hover:bg-white/10 active:scale-95 transition-all duration-150"
          >
            {copyState === 'copied' ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} className={copyState === 'failed' ? 'text-red-400' : 'text-[#7C5CFC]'} />
            )}
            {copyState === 'copied' ? t.copiedBtn : copyState === 'failed' ? t.copyFailed : t.copyBtn}
          </button>
          <div className="w-[1px] h-4 bg-[var(--border-input)]" />
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7C5CFC] to-[#a855f7] text-white hover:shadow-[0_0_15px_rgba(124,92,252,0.5)] active:scale-95 transition-all duration-150"
          >
            <Download size={14} /> {t.downloadBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
