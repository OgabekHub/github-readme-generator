import { escapeHtml } from './escape'
import { cleanGithubUsername, isValidGithubUsername } from './github-username'
import {
  isKnownTheme,
  statsThemeParams,
  streakThemeParams,
  summaryCardsTheme,
  trophyTheme,
} from './themes'

export interface FeaturedProject {
  name: string
  /** Single-language README text; also the fallback for every language tab */
  description: string
  descriptionUz?: string
  descriptionEn?: string
  descriptionRu?: string
}

export interface ProfileData {
  name: string
  title: string
  /** Single-language README bio; also the fallback for every language tab */
  bio: string
  location: string
  github: string
  twitter: string
  linkedin: string
  telegram: string
  facebook: string
  instagram: string
  youtube: string
  website: string
  email: string
  skills: string[]
  categorizeSkills: boolean
  layoutTemplate: string
  multilingualReadme: boolean
  bioUz: string
  bioEn: string
  bioRu: string
  featuredProjects: FeaturedProject[]
  showBanner: boolean
  showStats: boolean
  showStreak: boolean
  showTopLangs: boolean
  showTrophies: boolean
  showVisitorBadge: boolean
  showCommittersRank: boolean
  showActivityGraph: boolean
  showCapsuleRender: boolean
  capsuleColor: string
  showTypingSvg: boolean
  typingLines: string
  showSummaryCards: boolean
  showSnakeAnimation: boolean
  showWakatime: boolean
  wakatimeUsername: string
  show3dContrib: boolean
  theme: string
  funFact: string
  statsProvider: 'official' | 'extended' | 'custom'
  customStatsUrl: string
}

export const SKILL_OPTIONS = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'php', 'cpp', 'cs', 'swift', 'kotlin', 'dart', 'ruby', 'bash',
  // Frontend & Styling
  'react', 'nextjs', 'vue', 'angular', 'svelte', 'tailwind', 'bootstrap', 'css', 'html', 'sass', 'vite', 'redux',
  // Backend & Frameworks
  'nodejs', 'express', 'nestjs', 'django', 'fastapi', 'laravel', 'spring', 'flask', 'rails',
  // Databases & ORMs
  'mongodb', 'postgres', 'mysql', 'redis', 'sqlite', 'firebase', 'supabase', 'prisma', 'graphql',
  // DevOps & Cloud
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'vercel', 'netlify', 'nginx', 'cloudflare', 'jenkins', 'terraform', 'git', 'github', 'linux', 'ubuntu',
  // Tools & Design
  'figma', 'postman', 'vscode',
  // AI & Web3
  'tensorflow', 'pytorch', 'solidity',
]

export const SKILL_COLORS: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  react: '#61dafb',
  nextjs: '#0070f3',
  nodejs: '#339933',
  python: '#3776ab',
  django: '#092e20',
  fastapi: '#009688',
  java: '#007396',
  go: '#00add8',
  rust: '#dee2e6',
  php: '#777bb4',
  laravel: '#ff2d20',
  vue: '#4fc08d',
  angular: '#dd0031',
  svelte: '#ff3e00',
  tailwind: '#06b6d4',
  css: '#1572b6',
  html: '#e34f26',
  sass: '#cc6699',
  mongodb: '#47a248',
  postgres: '#4169e1',
  mysql: '#4479a1',
  redis: '#dc382d',
  docker: '#2496ed',
  kubernetes: '#326ce5',
  aws: '#ff9900',
  gcp: '#4285f4',
  azure: '#0078d4',
  git: '#f05032',
  github: '#7c5cfc',
  figma: '#f24e1e',
  graphql: '#e10098',
  flutter: '#02569b',
  kotlin: '#7f52ff',
  swift: '#f05138',
  cpp: '#00599c',
  cs: '#239120',
  dotnet: '#512bd4',
  // Newly added skills:
  bootstrap: '#9061f9', // Bright Purple
  vite: '#646cff',
  redux: '#9b66ff', // Bright Violet
  express: '#cccccc', // Light Grey/Silver
  nestjs: '#e0234e',
  spring: '#6db33f',
  flask: '#ffffff', // White
  ruby: '#cc342d',
  rails: '#cc0000',
  sqlite: '#38bdf8', // Bright Blue
  firebase: '#ffca28',
  supabase: '#3ecf8e',
  prisma: '#10b981', // Emerald Green
  vercel: '#ffffff', // White
  netlify: '#00c7b7',
  nginx: '#00d254', // Bright Green
  cloudflare: '#f38020',
  jenkins: '#d24939',
  terraform: '#845ef7', // Bright Purple
  linux: '#f8c018',
  ubuntu: '#e95420',
  bash: '#4eed30',
  postman: '#ff6c37',
  vscode: '#007acc',
  tensorflow: '#ff9f00',
  pytorch: '#ee4c2c',
  solidity: '#c5c5c5', // Silver
  dart: '#0175c2', // Bright Blue
}


export const MAX_PROJECTS = 5

const REPO_URL = 'https://github.com/OgabekHub/github-readme-generator'

// Every SKILL_OPTIONS entry belongs to exactly one group
const SKILL_GROUPS = [
  {
    icon: '💻',
    label: 'Frontend',
    skills: ['html', 'css', 'javascript', 'typescript', 'react', 'nextjs', 'vue', 'angular', 'svelte', 'tailwind', 'sass', 'figma', 'bootstrap', 'vite', 'redux'],
  },
  {
    icon: '⚙️',
    label: 'Backend & Databases',
    skills: ['nodejs', 'python', 'django', 'fastapi', 'java', 'go', 'rust', 'php', 'laravel', 'cpp', 'cs', 'graphql', 'mongodb', 'postgres', 'mysql', 'redis', 'express', 'nestjs', 'spring', 'flask', 'ruby', 'rails', 'sqlite', 'firebase', 'supabase', 'prisma', 'solidity'],
  },
  {
    icon: '🛠️',
    label: 'DevOps, Mobile & Tools',
    skills: ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'github', 'kotlin', 'swift', 'vercel', 'netlify', 'nginx', 'cloudflare', 'jenkins', 'terraform', 'linux', 'ubuntu', 'bash', 'postman', 'vscode', 'tensorflow', 'pytorch', 'dart'],
  },
]

export const LAYOUT_TEMPLATES = [
  { value: 'classic', label: 'Classic (Markazlashtirilgan)' },
  { value: 'minimalist', label: 'Minimalist (Oddiy & Qisqa)' },
  { value: 'cyberpunk', label: 'Cyberpunk (Neon / Kiber)' },
]

// ── Output safety helpers ───────────────────────────────
// Everything the user (or the AI / a GitHub profile) typed is escaped: GitHub renders
// the entities back as plain characters, and the live preview can never run injected HTML.

function safeText(value: string): string {
  return escapeHtml(value.trim())
}

/** Multi-line text inside an HTML block — a blank line would end the block early. */
function safeMultiline(value: string): string {
  return safeText(value).replace(/\r?\n/g, '<br/>')
}

/** Link text for `[text](url)` — brackets would end the link label early. */
function safeLinkText(value: string): string {
  return safeText(value).replace(/[[\]]/g, '\\$&')
}

/** URL for a Markdown `(url)` target — parentheses would end the target early. */
function markdownUrl(url: string): string {
  return url.replace(/\(/g, '%28').replace(/\)/g, '%29')
}

/** Returns a normalized absolute http(s) URL, or '' if the value is not one. */
function httpUrl(value: string): string {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

/** Accepts a full profile URL, "site.com/path" or a bare handle ("@user", "user"). */
function profileUrl(value: string, base: string): string {
  const v = value.trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return httpUrl(v)
  if (/^(www\.)?[a-z\d-]+(\.[a-z\d-]+)+\//i.test(v)) return httpUrl(`https://${v}`)
  const handle = v.replace(/^@/, '').split(/[/?#\s]/)[0]
  return handle ? `${base}${encodeURIComponent(handle)}` : ''
}

function websiteUrl(value: string): string {
  const v = value.trim()
  if (!v) return ''
  return httpUrl(/^https?:\/\//i.test(v) ? v : `https://${v}`)
}

function emailUrl(value: string): string {
  const v = value.trim()
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(v) ? `mailto:${v}` : ''
}

type SocialKey = 'twitter' | 'linkedin' | 'telegram' | 'facebook' | 'instagram' | 'youtube' | 'website' | 'email'

const SOCIAL_LINKS: { key: SocialKey; label: string; color: string; logo: string; url: (v: string) => string }[] = [
  { key: 'twitter', label: 'Twitter', color: '1DA1F2', logo: 'twitter', url: (v) => profileUrl(v, 'https://twitter.com/') },
  { key: 'linkedin', label: 'LinkedIn', color: '0077B5', logo: 'linkedin', url: (v) => profileUrl(v, 'https://linkedin.com/in/') },
  { key: 'telegram', label: 'Telegram', color: '2CA5E0', logo: 'telegram', url: (v) => profileUrl(v, 'https://t.me/') },
  { key: 'facebook', label: 'Facebook', color: '1877F2', logo: 'facebook', url: (v) => profileUrl(v, 'https://facebook.com/') },
  { key: 'instagram', label: 'Instagram', color: 'E4405F', logo: 'instagram', url: (v) => profileUrl(v, 'https://instagram.com/') },
  { key: 'youtube', label: 'YouTube', color: 'FF0000', logo: 'youtube', url: (v) => profileUrl(v, 'https://youtube.com/@') },
  { key: 'website', label: 'Website', color: '7C5CFC', logo: 'googlechrome', url: websiteUrl },
  { key: 'email', label: 'Email', color: 'D14836', logo: 'gmail', url: emailUrl },
]

/** Social links the user filled in, in display order, with invalid values skipped. */
function socialLinks(data: ProfileData): { label: string; url: string; badge: string }[] {
  return SOCIAL_LINKS.flatMap(({ key, label, color, logo, url }) => {
    const href = url(data[key] ?? '')
    return href
      ? [{ label, url: href, badge: `https://img.shields.io/badge/${label}-${color}?style=for-the-badge&logo=${logo}&logoColor=white` }]
      : []
  })
}

function socialBadges(data: ProfileData): string[] {
  return socialLinks(data).map(
    (s) => `<a href="${escapeHtml(s.url)}" target="_blank"><img src="${s.badge}" alt="${s.label}" /></a>`
  )
}

function hexColor(value: string, fallback: string): string {
  const hex = value.trim().replace(/^#/, '')
  return /^[\da-f]{6}$/i.test(hex) ? hex : fallback
}

/** WakaTime login from "user", "@user" or a wakatime.com profile URL. */
function wakatimeUser(value: string): string {
  const v = value
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?wakatime\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0]
  return /^[\w.-]{1,50}$/.test(v) ? v : ''
}

export interface ReadmeOptions {
  /** Public URL of this app — used for the banner image and the footer link */
  siteUrl?: string
  /**
   * Username for the stats widgets while none is entered. Only for the live
   * preview: exported READMEs never contain someone else's statistics.
   */
  previewUser?: string
}

const TABS = [
  { open: true, summary: '🇺🇿 O\'zbekcha', bio: 'bioUz', description: 'descriptionUz', heading: '🚀 Loyihalar', placeholder: 'loyiha tavsifi' },
  { open: false, summary: '🇬🇧 English', bio: 'bioEn', description: 'descriptionEn', heading: '🚀 Featured Projects', placeholder: 'project description' },
  { open: false, summary: '🇷🇺 Русский', bio: 'bioRu', description: 'descriptionRu', heading: '🚀 Избранные проекты', placeholder: 'описание проекта' },
] as const

export function generateReadme(data: ProfileData, { siteUrl: rawSiteUrl = '', previewUser = '' }: ReadmeOptions = {}): string {
  const lines: string[] = []
  const template = data.layoutTemplate || 'classic'
  const siteUrl = httpUrl(rawSiteUrl).replace(/\/$/, '')
  const theme = isKnownTheme(data.theme) ? data.theme : 'radical'
  const githubInput = cleanGithubUsername(data.github)
  const github = isValidGithubUsername(githubInput) ? githubInput : ''
  const userPath = encodeURIComponent(github)
  // Stats-style widgets may fall back to the preview user; profile-specific ones never do
  const statsUser = encodeURIComponent(github || (isValidGithubUsername(previewUser) ? previewUser : ''))
  const name = safeText(data.name)
  const title = safeText(data.title)
  const capsuleColor = hexColor(data.capsuleColor || '', '7C5CFC')
  const align = template === 'minimalist' ? 'left' : 'center'
  // The cyberpunk layout always uses its own neon widget themes
  const widgetTheme = template === 'cyberpunk' ? 'tokyonight' : theme

  const projectUrl = (projectName: string) =>
    github ? markdownUrl(`https://github.com/${userPath}/${encodeURIComponent(projectName.trim())}`) : '#'
  const projectLine = (projectName: string, description: string, separator: string, placeholder: string) =>
    `- **[${safeLinkText(projectName)}](${projectUrl(projectName)})** ${separator} ${safeText(description) || placeholder}`
  const projects = data.featuredProjects.filter((p) => p.name.trim())

  // Capsule Render — TOP
  if (data.showCapsuleRender) {
    const capsuleType = template === 'cyberpunk' ? 'rect' : 'waving'
    lines.push(
      `<p align="center"><img src="https://capsule-render.vercel.app/api?type=${capsuleType}&color=${capsuleColor}&height=120&section=header&text=${encodeURIComponent(data.name.trim() || 'Developer')}&fontSize=36&fontColor=ffffff&animation=fadeIn" alt="Header" width="100%"/></p>`
    )
    lines.push('')
  }

  // Banner (served by this app, so it needs the app's public URL)
  if (data.showBanner && siteUrl) {
    const bannerUrl = `${siteUrl}/api/banner?name=${encodeURIComponent(data.name.trim() || 'Developer')}&title=${encodeURIComponent(data.title.trim() || 'Full-Stack Developer')}&theme=${theme}`
    lines.push(`<p align="${align}">`)
    lines.push(`  <img src="${bannerUrl}" alt="Banner" width="850"/>`)
    lines.push(`</p>`)
    lines.push('')
  }

  // Header & Bio & Socials
  if (template === 'minimalist') {
    lines.push(`# ${name || 'Your Name'}`)
    if (title) {
      lines.push(`> ${title}`)
      lines.push('')
    }
    if (data.bio.trim() && !data.multilingualReadme) {
      lines.push(safeText(data.bio))
      lines.push('')
    }

    // Social Links
    const links = socialLinks(data).map((s) => `[${s.label}](${markdownUrl(s.url)})`)
    if (links.length > 0) {
      lines.push(links.join(' • '))
      lines.push('')
    }
  } else if (template === 'cyberpunk') {
    lines.push(`# ─── ⚡ CORE_SYSTEM // ${safeText((data.name.trim() || 'DEVELOPER').toUpperCase())} ⚡ ───`)
    if (title) {
      lines.push(`> **STATUS:** ${safeText(data.title.toUpperCase())}`)
      lines.push('')
    }
    if (data.bio.trim() && !data.multilingualReadme) {
      // Code blocks are shown verbatim (no escaping) — only a ``` fence could break out of it
      lines.push('```')
      lines.push(`[SYSTEM_INFO]: ${data.bio.trim().replace(/`{3,}/g, '``')}`)
      lines.push('```')
      lines.push('')
    }

    const badges = socialBadges(data)
    if (badges.length > 0) {
      lines.push('<p align="center">')
      lines.push(`  ${badges.join(' ')}`)
      lines.push('</p>')
      lines.push('')
    }
  } else {
    // Classic (existing)
    lines.push(`<h1 align="center">Hi 👋, I'm ${name || 'Your Name'}</h1>`)
    if (title) {
      lines.push(`<h3 align="center">${title}</h3>`)
    }
    lines.push('')

    if (data.bio.trim() && !data.multilingualReadme) {
      lines.push(`<p align="center">${safeMultiline(data.bio)}</p>`)
      lines.push('')
    }

    const badges = socialBadges(data)
    if (badges.length > 0) {
      lines.push('<p align="center">')
      lines.push(`  ${badges.join(' ')}`)
      lines.push('</p>')
      lines.push('')
    }
  }

  // Typing SVG
  if (data.showTypingSvg) {
    const lines2type = data.typingLines.trim()
      ? data.typingLines
      : data.title.trim()
        ? `${data.title.trim()};Open Source Enthusiast;Always Learning`
        : 'Developer;Open Source Enthusiast;Always Learning'
    const typingUrl = `https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=7C5CFC&center=${template !== 'minimalist'}&width=500&lines=${encodeURIComponent(lines2type)}`
    lines.push(`<p align="${align}"><img src="${typingUrl}" alt="Typing SVG"/></p>`)
    lines.push('')
  }

  // Location & fun fact
  if (data.location.trim() || data.funFact.trim()) {
    if (template === 'cyberpunk') {
      lines.push('// ──────────────────────────────────────────────')
    } else {
      lines.push('---')
    }
    lines.push('')
    if (data.location.trim()) lines.push(`- 📍 Based in **${safeText(data.location)}**`)
    if (data.funFact.trim()) lines.push(`- ⚡ Fun fact: ${safeText(data.funFact)}`)
    lines.push('')
  }

  // Multilingual README Tabs — each language falls back to the main bio/description
  if (data.multilingualReadme) {
    for (const tab of TABS) {
      lines.push(tab.open ? '<details open>' : '<details>')
      lines.push(`  <summary>${tab.summary}</summary>`)
      lines.push('  <br/>')
      const bio = (data[tab.bio] || data.bio).trim()
      if (bio) {
        lines.push(`  <p align="center">${safeMultiline(bio)}</p>`)
        lines.push('')
      }
      if (projects.length > 0) {
        lines.push(`  ### ${tab.heading}`)
        lines.push('')
        for (const proj of projects) {
          lines.push(`  ${projectLine(proj.name, proj[tab.description] || proj.description, '—', tab.placeholder)}`)
        }
        lines.push('')
      }
      lines.push('</details>')
      lines.push('')
    }
  }

  // Featured Projects
  if (!data.multilingualReadme && projects.length > 0) {
    if (template === 'cyberpunk') {
      lines.push('### ⚡ ACTIVE_MISSIONS')
    } else if (template === 'minimalist') {
      lines.push('### Featured Projects')
    } else {
      lines.push('### 🚀 Featured Projects')
    }
    lines.push('')
    for (const proj of projects) {
      if (template === 'cyberpunk') {
        lines.push(projectLine(proj.name, proj.description, '»', 'mission objectives description'))
      } else {
        lines.push(projectLine(proj.name, proj.description, '—', 'catchy project description'))
      }
    }
    lines.push('')
  }

  // Skills — only known slugs ever reach the icon URLs
  const skills = data.skills.filter((s) => SKILL_OPTIONS.includes(s))
  if (skills.length > 0) {
    if (template === 'cyberpunk') {
      lines.push('### 🛠️ STACK_CAPABILITIES')
    } else if (template === 'minimalist') {
      lines.push('### Tech Stack')
    } else {
      lines.push('### 🛠️ Tech Stack')
    }
    lines.push('')

    const groups = data.categorizeSkills
      ? SKILL_GROUPS.map((g) => ({ ...g, skills: skills.filter((s) => g.skills.includes(s)) })).filter((g) => g.skills.length > 0)
      : []
    const icons = (list: string[]) =>
      list.map((s) => `<img src="https://skillicons.dev/icons?i=${s}" alt="${s}" width="40" height="40"/>`).join(' ')

    if (template === 'minimalist') {
      if (data.categorizeSkills) {
        for (const g of groups) lines.push(`- **${g.label}**: ${g.skills.join(', ')}`)
      } else {
        lines.push(`**Skills**: ${skills.join(', ')}`)
      }
      lines.push('')
    } else {
      // Classic & Cyberpunk use icon badges
      const iconAlign = template === 'cyberpunk' ? 'left' : 'center'
      if (data.categorizeSkills) {
        for (const g of groups) {
          lines.push(`#### ${g.icon} ${g.label}`)
          lines.push('')
          lines.push(`<p align="${iconAlign}">${icons(g.skills)}</p>`)
          lines.push('')
        }
      } else {
        lines.push(`<p align="${iconAlign}">${icons(skills)}</p>`)
        lines.push('')
      }
    }
  }

  // Determine stats server base URL
  const customStatsUrl = data.statsProvider === 'custom' ? httpUrl(data.customStatsUrl) : ''
  const statsBaseUrl = customStatsUrl
    ? customStatsUrl.replace(/\/+$/, '')
    : data.statsProvider === 'official'
      ? 'https://github-readme-stats.vercel.app'
      : 'https://github-stats-extended.vercel.app'

  // GitHub stats
  if (statsUser && (data.showStats || data.showTopLangs || data.showStreak)) {
    if (template === 'cyberpunk') {
      lines.push('### 📊 SYSTEM_METRICS')
    } else {
      lines.push('### 📊 GitHub Stats')
    }
    lines.push('')

    if (data.showStats || data.showStreak) {
      lines.push(`<p align="${align}">`)
      if (data.showStats) {
        lines.push(
          `<img src="${statsBaseUrl}/api?username=${statsUser}&show_icons=true&hide_border=true&count_private=true${statsThemeParams(widgetTheme)}" alt="GitHub Stats" />`
        )
      }
      if (data.showStreak) {
        lines.push(
          `<img src="https://streak-stats.demolab.com/?user=${statsUser}&hide_border=true${streakThemeParams(widgetTheme)}" alt="GitHub Streak" />`
        )
      }
      lines.push('</p>')
      lines.push('')
    }

    if (data.showTopLangs) {
      lines.push(`<p align="${align}">`)
      lines.push(
        `<img src="${statsBaseUrl}/api/top-langs/?username=${statsUser}&layout=compact&hide_border=true${statsThemeParams(widgetTheme)}" alt="Top Languages"/>`
      )
      lines.push('</p>')
      lines.push('')
    }
  }

  // Trophies
  if (statsUser && data.showTrophies) {
    if (template === 'cyberpunk') {
      lines.push('### 🏆 SYSTEM_ACHIEVEMENTS')
    } else {
      lines.push('### 🏆 Trophies')
    }
    lines.push('')
    lines.push(`<p align="${align}">`)
    lines.push(
      `<img src="https://github-profile-trophy.vercel.app/?username=${statsUser}&theme=${trophyTheme(widgetTheme)}&no-frame=true&row=1&column=6" alt="Trophies"/>`
    )
    lines.push('</p>')
    lines.push('')
  }

  // Activity Graph
  if (data.showActivityGraph && github) {
    const graphTheme = template === 'cyberpunk' ? 'tokyo-night' : 'react-dark'
    if (template === 'cyberpunk') {
      lines.push('### 📈 COMMIT_ACTIVITY_LOG')
    } else {
      lines.push('### 📈 Contribution Activity')
    }
    lines.push('')
    lines.push(`<p align="${align}">`)
    lines.push(
      `<img src="https://github-readme-activity-graph.vercel.app/graph?username=${userPath}&theme=${graphTheme}&hide_border=true&area=true" alt="Contribution Graph" width="100%"/>`
    )
    lines.push('</p>')
    lines.push('')
  }

  // Profile Summary Cards
  if (data.showSummaryCards && github) {
    const cardTheme = template === 'cyberpunk' ? 'dracula' : summaryCardsTheme(theme)
    if (template === 'cyberpunk') {
      lines.push('### 📊 PROFILE_SUMMARY_MATRIX')
    } else {
      lines.push('### 📊 Profile Summary')
    }
    lines.push('')
    lines.push(`<p align="${align}">`)
    lines.push(`<img src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${userPath}&theme=${cardTheme}" alt="Profile Summary" width="100%"/>`)
    lines.push('</p>')
    lines.push(`<p align="${align}">`)
    lines.push(`<img src="https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=${userPath}&theme=${cardTheme}" alt="Repos Per Language"/>`)
    lines.push(`<img src="https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=${userPath}&theme=${cardTheme}" alt="Most Commit Language"/>`)
    lines.push('</p>')
    lines.push('')
  }

  // WakaTime Stats (served by the same github-readme-stats instance)
  const wakaUser = encodeURIComponent(wakatimeUser(data.wakatimeUsername)) || statsUser
  if (data.showWakatime && wakaUser) {
    if (template === 'cyberpunk') {
      lines.push('### ⏱️ CODING_TIME_LOG')
    } else {
      lines.push('### ⏱️ WakaTime Stats')
    }
    lines.push('')
    lines.push(`<p align="${align}">`)
    lines.push(`<img src="${statsBaseUrl}/api/wakatime?username=${wakaUser}&hide_border=true&layout=compact${statsThemeParams(widgetTheme)}" alt="WakaTime Stats"/>`)
    lines.push('</p>')
    lines.push('')
  }

  // 3D Contribution — generated by a GitHub Action into the profile repo's default branch
  if (data.show3dContrib && github) {
    if (template === 'cyberpunk') {
      lines.push('### 🌎 3D_CONTRIBUTION_MAP')
    } else {
      lines.push('### 🌎 3D Contribution Graph')
    }
    lines.push('')
    lines.push(`<p align="${align}">`)
    lines.push(`<img src="https://raw.githubusercontent.com/${userPath}/${userPath}/HEAD/profile-3d-contrib/profile-night-rainbow.svg" alt="3D Contribution" width="100%"/>`)
    lines.push('</p>')
    lines.push('')
  }

  // Snake Animation — generated by a GitHub Action into the `output` branch
  if (data.showSnakeAnimation && github) {
    if (template === 'cyberpunk') {
      lines.push('### 🐍 COMMIT_SNAKE_PROTOCOL')
    } else {
      lines.push('### 🐍 Contribution Snake')
    }
    lines.push('')
    lines.push(`<p align="${align}">`)
    lines.push(`<img src="https://raw.githubusercontent.com/${userPath}/${userPath}/output/github-contribution-grid-snake.svg" alt="Snake animation"/>`)
    lines.push('</p>')
    lines.push('')
  }

  // Visitor badge + Committers rank
  if ((data.showVisitorBadge || data.showCommittersRank) && github) {
    if (template === 'cyberpunk') {
      lines.push('// ──────────────────────────────────────────────')
    } else {
      lines.push('---')
    }
    lines.push('')
    const badgeColor = template === 'cyberpunk' ? 'ff0055' : '7c5cfc'
    const badgeParts: string[] = []
    if (data.showVisitorBadge) {
      badgeParts.push(
        `<img src="https://komarev.com/ghpvc/?username=${userPath}&label=Profile%20Views&color=${badgeColor}&style=for-the-badge" alt="Profile Views"/>`
      )
    }
    if (data.showCommittersRank) {
      badgeParts.push(
        `<a href="https://committers.top/uzbekistan" target="_blank"><img src="https://user-badge.committers.top/uzbekistan/${userPath}.svg" alt="Uzbekistan GitHub Rank"/></a>`
      )
    }
    lines.push(`<p align="${align}">${badgeParts.join(' ')}</p>`)
    lines.push('')
  }

  if (template === 'cyberpunk') {
    lines.push('// ──────────────────────────────────────────────')
    lines.push(
      '<p align="center"><i>// SYSTEM_GENERATED // BY_README_GEN // TERMINAL_EOF</i></p>'
    )
  } else {
    // Capsule Render — BOTTOM
    if (data.showCapsuleRender) {
      lines.push(
        `<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=${capsuleColor}&height=80&section=footer" alt="Footer" width="100%"/></p>`
      )
      lines.push('')
    }
    lines.push('---')
    lines.push(
      `<p align="center"><i>Generated with ❤️ using <a href="${escapeHtml(siteUrl || REPO_URL)}" target="_blank">GitHub README Generator</a>. Star the repository on <a href="${REPO_URL}" target="_blank">GitHub</a>! ⭐</i></p>`
    )
  }

  return lines.join('\n')
}

/** Widgets that show nothing useful until the user's own GitHub username is known. */
export function usesGithubWidgets(data: ProfileData): boolean {
  return (
    data.showStats || data.showStreak || data.showTopLangs || data.showTrophies ||
    data.showActivityGraph || data.showSummaryCards || data.show3dContrib || data.showSnakeAnimation ||
    data.showVisitorBadge || data.showCommittersRank || (data.showWakatime && !wakatimeUser(data.wakatimeUsername))
  )
}

export const DEFAULT_DATA: ProfileData = {
  name: '',
  title: '',
  bio: '',
  location: '',
  github: '',
  twitter: '',
  linkedin: '',
  telegram: '',
  facebook: '',
  instagram: '',
  youtube: '',
  website: '',
  email: '',
  skills: [],
  categorizeSkills: false,
  layoutTemplate: 'classic',
  multilingualReadme: false,
  bioUz: '',
  bioEn: '',
  bioRu: '',
  featuredProjects: [],
  showBanner: false,
  showStats: true,
  showStreak: true,
  showTopLangs: true,
  showTrophies: false,
  showVisitorBadge: true,
  showCommittersRank: false,
  showActivityGraph: false,
  showCapsuleRender: false,
  capsuleColor: '#7C5CFC',
  showTypingSvg: false,
  typingLines: '',
  showSummaryCards: false,
  showSnakeAnimation: false,
  showWakatime: false,
  wakatimeUsername: '',
  show3dContrib: false,
  theme: 'radical',
  funFact: '',
  statsProvider: 'extended',
  customStatsUrl: '',
}

const STATS_PROVIDERS: ProfileData['statsProvider'][] = ['official', 'extended', 'custom']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '')

/** Rebuilds ProfileData from untrusted input (e.g. localStorage), keeping only well-typed known fields. */
export function normalizeProfileData(raw: unknown): ProfileData {
  const source = isRecord(raw) ? raw : {}
  const result: Record<string, unknown> = { ...DEFAULT_DATA }

  for (const key of Object.keys(DEFAULT_DATA) as (keyof ProfileData)[]) {
    const fallback = DEFAULT_DATA[key]
    if (!Array.isArray(fallback) && typeof source[key] === typeof fallback) result[key] = source[key]
  }

  result.skills = Array.isArray(source.skills)
    ? source.skills.filter((s): s is string => typeof s === 'string' && SKILL_OPTIONS.includes(s))
    : []
  result.featuredProjects = Array.isArray(source.featuredProjects)
    ? source.featuredProjects.filter(isRecord).slice(0, MAX_PROJECTS).map((p) => ({
        name: asString(p.name),
        description: asString(p.description),
        descriptionUz: asString(p.descriptionUz),
        descriptionEn: asString(p.descriptionEn),
        descriptionRu: asString(p.descriptionRu),
      }))
    : []
  if (!STATS_PROVIDERS.includes(result.statsProvider as ProfileData['statsProvider'])) result.statsProvider = 'extended'
  if (!LAYOUT_TEMPLATES.some((t) => t.value === result.layoutTemplate)) result.layoutTemplate = 'classic'
  if (!isKnownTheme(result.theme as string)) result.theme = 'radical'

  return result as unknown as ProfileData
}
