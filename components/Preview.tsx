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
      <div className="flex items-center justify-between border-b border-[#2a2a3a] px-4 py-2 shrink-0">
        <div className="flex gap-1">
          <button
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === 'preview'
                ? 'bg-[#7C5CFC] text-white shadow-[0_0_10px_#7C5CFC55]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Eye size={13} /> Preview
          </button>
          <button
            onClick={() => setTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === 'code'
                ? 'bg-[#7C5CFC] text-white shadow-[0_0_10px_#7C5CFC55]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Code2 size={13} /> Markdown
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-[#2a2a3a] text-gray-300 hover:border-[#7C5CFC] hover:text-white transition-all duration-150"
          >
            {copied ? (
              <Check size={13} className="text-green-400" />
            ) : (
              <Copy size={13} />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#7C5CFC] text-white hover:bg-[#6a4ce0] transition-all duration-150 shadow-[0_0_10px_#7C5CFC44]"
          >
            <Download size={13} /> Download
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
