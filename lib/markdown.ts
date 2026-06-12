// Minimal markdown -> HTML converter, tailored to the output of
// generateReadme(). Not a full markdown parser — just enough to
// render badges, images, links, bold text, and lists for the preview.

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n')
  const html: string[] = []
  let inList = false

  for (const rawLine of lines) {
    const line = rawLine.trim()

    // Pass through raw HTML lines (h1, h3, p, hr, img, etc.)
    if (/^<\/?(h1|h3|p|hr|img|br)/i.test(line) || line === '') {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      if (line !== '') html.push(convertInline(line))
      continue
    }

    // Markdown bullet list
    if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${convertInline(line.slice(2))}</li>`)
      continue
    }

    if (inList) {
      html.push('</ul>')
      inList = false
    }

    // Markdown headings
    if (line.startsWith('### ')) {
      html.push(`<h3>${convertInline(line.slice(4))}</h3>`)
      continue
    }

    // Default: paragraph
    html.push(`<p>${convertInline(line)}</p>`)
  }

  if (inList) html.push('</ul>')

  return html.join('\n')
}

function convertInline(text: string): string {
  let out = text

  // Bold: **text**
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Markdown image-link badges: [![alt](src)](href)
  out = out.replace(
    /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g,
    '<a href="$3" target="_blank" rel="noopener noreferrer"><img src="$2" alt="$1" style="display:inline-block;margin:2px"/></a>'
  )

  // Plain markdown images: ![alt](src)
  out = out.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="display:inline-block"/>'
  )

  return out
}
