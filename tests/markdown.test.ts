// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { markdownToHtml } from '@/lib/markdown'

describe('markdownToHtml', () => {
  it('removes scripts and event handlers', () => {
    const html = markdownToHtml('<p align="center"><img src=x onerror="alert(1)"><script>alert(2)</script></p>')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('<script')
    expect(html).toContain('align="center"')
  })

  it('renders GitHub-flavored Markdown the generator uses', () => {
    const html = markdownToHtml('# Title\n\n> quote\n\n- **[repo](https://github.com/a/repo)** — desc\n\n---')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('<strong><a href="https://github.com/a/repo"')
    expect(html).toContain('<hr>')
  })

  it('opens links in a new tab without leaking the opener', () => {
    const html = markdownToHtml('[x](https://example.com)')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('drops javascript: links', () => {
    expect(markdownToHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:')
  })
})
