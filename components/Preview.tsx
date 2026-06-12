'use client'

import { useState } from 'react'
import { Copy, Check, Download, Eye, Code2 } from 'lucide-react'
import { markdownToHtml } from '@/lib/markdown'

interface PreviewProps {
  markdown: string
}

export default function Preview({ markdown }: PreviewProps) {
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
      <div className="flex items-center justify-between border-b border-[#222232] px-5 py-3 shrink-0 bg-[#0a0a0f]/40 backdrop-blur-sm">
        <div className="flex gap-1 bg-[#14141e]/80 border border-[#222232] p-1 rounded-xl">
          <button
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === 'preview'
                ? 'bg-[#7C5CFC] text-white shadow-[0_2px_8px_rgba(124,92,252,0.4)]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Eye size={12} /> Preview
          </button>
          <button
            onClick={() => setTab('code')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === 'code'
                ? 'bg-[#7C5CFC] text-white shadow-[0_2px_8px_rgba(124,92,252,0.4)]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code2 size={12} /> Markdown
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-[#222232] text-gray-300 hover:border-[#7C5CFC] hover:text-white active:scale-95 transition-all duration-150 bg-[#14141e]/30"
          >
            {copied ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Copy size={12} />
            )}
            {copied ? 'Copied!' : 'Copy'}
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
            className="tab-content md-preview bg-[#0d1117] rounded-xl p-6 text-sm text-gray-200 leading-relaxed border border-[#2a2a3a]/50"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
          />
        ) : (
          <pre
            key="code"
            className="tab-content bg-[#0d1117] rounded-xl p-4 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono border border-[#2a2a3a]/50 leading-relaxed"
          >
            {markdown}
          </pre>
        )}
      </div>
    </div>
  )
}
