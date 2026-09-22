import DOMPurify from 'dompurify'
import { marked } from 'marked'

// Renders the generated README for the live preview: GitHub-flavored Markdown
// (including raw HTML blocks such as <p align="center">) sanitized with DOMPurify,
// so nothing in the README can run scripts inside the app.

if (DOMPurify.isSupported) {
  // Links in the preview open in a new tab, so the form is never navigated away from
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

const PURIFY_CONFIG = {
  ADD_ATTR: ['target'],
  // GitHub strips inline styles and form controls from READMEs too
  FORBID_ATTR: ['style'],
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
}

/** Returns sanitized HTML, or '' where no DOM is available (server render). */
export function markdownToHtml(markdown: string): string {
  if (!DOMPurify.isSupported) return ''
  const html = marked.parse(markdown, { async: false, gfm: true })
  return DOMPurify.sanitize(html, PURIFY_CONFIG)
}
