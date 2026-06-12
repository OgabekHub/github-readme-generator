export interface ProfileData {
  name: string
  title: string
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
  bioEn: string
  bioRu: string
  featuredProjects: { name: string; description: string }[]
  projectsEn: { name: string; description: string }[]
  projectsRu: { name: string; description: string }[]
  showBanner: boolean
  showStats: boolean
  showStreak: boolean
  showTopLangs: boolean
  showTrophies: boolean
  showVisitorBadge: boolean
  theme: string
  funFact: string
}

export const SKILL_OPTIONS = [
  'javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'python',
  'django', 'fastapi', 'java', 'go', 'rust', 'php', 'laravel',
  'vue', 'angular', 'svelte', 'tailwind', 'css', 'html', 'sass',
  'mongodb', 'postgres', 'mysql', 'redis', 'docker', 'kubernetes',
  'aws', 'gcp', 'azure', 'git', 'github', 'figma', 'graphql',
  'flutter', 'kotlin', 'swift', 'cpp', 'cs', 'dotnet',
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
}


export const THEMES = [
  { value: 'radical', label: 'Radical (Purple/Pink)' },
  { value: 'dark', label: 'Dark' },
  { value: 'tokyonight', label: 'Tokyo Night' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'github_dark', label: 'GitHub Dark' },
  { value: 'gruvbox', label: 'Gruvbox' },
  { value: 'merko', label: 'Merko (Green)' },
  { value: 'cobalt', label: 'Cobalt (Blue)' },
]

export const LAYOUT_TEMPLATES = [
  { value: 'classic', label: 'Classic (Markazlashtirilgan)' },
  { value: 'minimalist', label: 'Minimalist (Oddiy & Qisqa)' },
  { value: 'cyberpunk', label: 'Cyberpunk (Neon / Kiber)' },
]

const SOCIAL_ICONS: Record<string, (val: string) => string> = {
  twitter: (v) =>
    `<a href="https://twitter.com/${v.replace('@', '')}" target="_blank"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter" /></a>`,
  linkedin: (v) =>
    `<a href="${v.startsWith('http') ? v : `https://linkedin.com/in/${v}`}" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>`,
  telegram: (v) =>
    `<a href="https://t.me/${v.replace('@', '')}" target="_blank"><img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" /></a>`,
  facebook: (v) =>
    `<a href="${v.startsWith('http') ? v : `https://facebook.com/${v}`}" target="_blank"><img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white" alt="Facebook" /></a>`,
  instagram: (v) =>
    `<a href="https://instagram.com/${v.replace('@', '')}" target="_blank"><img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>`,
  youtube: (v) =>
    `<a href="${v.startsWith('http') ? v : `https://youtube.com/${v}`}" target="_blank"><img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" /></a>`,
  website: (v) =>
    `<a href="${v.startsWith('http') ? v : `https://${v}`}" target="_blank"><img src="https://img.shields.io/badge/Website-7C5CFC?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Website" /></a>`,
  email: (v) =>
    `<a href="mailto:${v}"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>`,
}

export function generateReadme(data: ProfileData, hostUrl: string = 'https://github-readme-generator.vercel.app'): string {
  const lines: string[] = []
  const template = data.layoutTemplate || 'classic'

  // Banner
  if (data.showBanner) {
    const bannerUrl = `${hostUrl}/api/banner?name=${encodeURIComponent(data.name || 'Developer')}&title=${encodeURIComponent(data.title || 'Full-Stack Developer')}&theme=${data.theme}`
    const align = template === 'minimalist' ? 'left' : 'center'
    lines.push(`<p align="${align}">`)
    lines.push(`  <img src="${bannerUrl}" alt="Banner" width="850"/>`)
    lines.push(`</p>`)
    lines.push('')
  }

  // Header & Bio & Socials
  if (template === 'minimalist') {
    lines.push(`# ${data.name || 'Your Name'}`)
    if (data.title) {
      lines.push(`> ${data.title}`)
      lines.push('')
    }
    if (data.bio && !data.multilingualReadme) {
      lines.push(data.bio)
      lines.push('')
    }
    
    // Social Links
    const socialLinks: string[] = []
    if (data.twitter) socialLinks.push(`[Twitter](https://twitter.com/${data.twitter.replace('@', '')})`)
    if (data.linkedin) socialLinks.push(`[LinkedIn](${data.linkedin.startsWith('http') ? data.linkedin : `https://linkedin.com/in/${data.linkedin}`})`)
    if (data.telegram) socialLinks.push(`[Telegram](https://t.me/${data.telegram.replace('@', '')})`)
    if (data.facebook) socialLinks.push(`[Facebook](${data.facebook.startsWith('http') ? data.facebook : `https://facebook.com/${data.facebook}`})`)
    if (data.instagram) socialLinks.push(`[Instagram](https://instagram.com/${data.instagram.replace('@', '')})`)
    if (data.youtube) socialLinks.push(`[YouTube](${data.youtube.startsWith('http') ? data.youtube : `https://youtube.com/${data.youtube}`})`)
    if (data.website) socialLinks.push(`[Website](${data.website.startsWith('http') ? data.website : `https://${data.website}`})`)
    if (data.email) socialLinks.push(`[Email](mailto:${data.email})`)

    if (socialLinks.length > 0) {
      lines.push(socialLinks.join(' • '))
      lines.push('')
    }
  } else if (template === 'cyberpunk') {
    lines.push(`# ─── ⚡ CORE_SYSTEM // ${(data.name || 'DEVELOPER').toUpperCase()} ⚡ ───`)
    if (data.title) {
      lines.push(`> **STATUS:** ${(data.title || 'ACTIVE_SYSTEM_OPERATOR').toUpperCase()}`)
      lines.push('')
    }
    if (data.bio && !data.multilingualReadme) {
      lines.push('```')
      lines.push(`[SYSTEM_INFO]: ${data.bio}`)
      lines.push('```')
      lines.push('')
    }

    // Social badges
    const socialBadges: string[] = []
    if (data.twitter) socialBadges.push(SOCIAL_ICONS.twitter(data.twitter))
    if (data.linkedin) socialBadges.push(SOCIAL_ICONS.linkedin(data.linkedin))
    if (data.telegram) socialBadges.push(SOCIAL_ICONS.telegram(data.telegram))
    if (data.facebook) socialBadges.push(SOCIAL_ICONS.facebook(data.facebook))
    if (data.instagram) socialBadges.push(SOCIAL_ICONS.instagram(data.instagram))
    if (data.youtube) socialBadges.push(SOCIAL_ICONS.youtube(data.youtube))
    if (data.website) socialBadges.push(SOCIAL_ICONS.website(data.website))
    if (data.email) socialBadges.push(SOCIAL_ICONS.email(data.email))

    if (socialBadges.length > 0) {
      lines.push('<p align="center">')
      lines.push(`  ${socialBadges.join(' ')}`)
      lines.push('</p>')
      lines.push('')
    }
  } else {
    // Classic (existing)
    lines.push(`<h1 align="center">Hi 👋, I'm ${data.name || 'Your Name'}</h1>`)
    if (data.title) {
      lines.push(`<h3 align="center">${data.title}</h3>`)
    }
    lines.push('')

    if (data.bio && !data.multilingualReadme) {
      lines.push(`<p align="center">${data.bio}</p>`)
      lines.push('')
    }

    const socialBadges: string[] = []
    if (data.twitter) socialBadges.push(SOCIAL_ICONS.twitter(data.twitter))
    if (data.linkedin) socialBadges.push(SOCIAL_ICONS.linkedin(data.linkedin))
    if (data.telegram) socialBadges.push(SOCIAL_ICONS.telegram(data.telegram))
    if (data.facebook) socialBadges.push(SOCIAL_ICONS.facebook(data.facebook))
    if (data.instagram) socialBadges.push(SOCIAL_ICONS.instagram(data.instagram))
    if (data.youtube) socialBadges.push(SOCIAL_ICONS.youtube(data.youtube))
    if (data.website) socialBadges.push(SOCIAL_ICONS.website(data.website))
    if (data.email) socialBadges.push(SOCIAL_ICONS.email(data.email))

    if (socialBadges.length > 0) {
      lines.push('<p align="center">')
      lines.push(`  ${socialBadges.join(' ')}`)
      lines.push('</p>')
      lines.push('')
    }
  }

  // Location & fun fact
  if (data.location || data.funFact) {
    if (template === 'cyberpunk') {
      lines.push('// ──────────────────────────────────────────────')
    } else {
      lines.push('---')
    }
    lines.push('')
    if (data.location) lines.push(`- 📍 Based in **${data.location}**`)
    if (data.funFact) lines.push(`- ⚡ Fun fact: ${data.funFact}`)
    lines.push('')
  }

  // Multilingual README Tabs
  if (data.multilingualReadme) {
    // ─── Uzbek Tab ───
    lines.push('<details open>')
    lines.push('  <summary>🇺🇿 O\'zbekcha</summary>')
    lines.push('  <br/>')
    if (data.bio) {
      lines.push(`  <p align="center">${data.bio}</p>`)
      lines.push('')
    }
    if (data.featuredProjects && data.featuredProjects.length > 0) {
      lines.push('  ### 🚀 Loyihalar')
      lines.push('')
      for (const proj of data.featuredProjects) {
        if (proj.name.trim()) {
          const url = data.github ? `https://github.com/${data.github}/${proj.name}` : '#'
          lines.push(`  - **[${proj.name}](${url})** — ${proj.description || 'loyiha tavsifi'}`)
        }
      }
      lines.push('')
    }
    lines.push('</details>')
    lines.push('')

    // ─── English Tab ───
    lines.push('<details>')
    lines.push('  <summary>🇬🇧 English</summary>')
    lines.push('  <br/>')
    if (data.bioEn || data.bio) {
      lines.push(`  <p align="center">${data.bioEn || data.bio}</p>`)
      lines.push('')
    }
    const enProjects = data.projectsEn && data.projectsEn.length > 0 ? data.projectsEn : data.featuredProjects
    if (enProjects && enProjects.length > 0) {
      lines.push('  ### 🚀 Featured Projects')
      lines.push('')
      for (const proj of enProjects) {
        if (proj.name.trim()) {
          const url = data.github ? `https://github.com/${data.github}/${proj.name}` : '#'
          lines.push(`  - **[${proj.name}](${url})** — ${proj.description || 'project description'}`)
        }
      }
      lines.push('')
    }
    lines.push('</details>')
    lines.push('')

    // ─── Russian Tab ───
    lines.push('<details>')
    lines.push('  <summary>🇷🇺 Русский</summary>')
    lines.push('  <br/>')
    if (data.bioRu || data.bio) {
      lines.push(`  <p align="center">${data.bioRu || data.bio}</p>`)
      lines.push('')
    }
    const ruProjects = data.projectsRu && data.projectsRu.length > 0 ? data.projectsRu : data.featuredProjects
    if (ruProjects && ruProjects.length > 0) {
      lines.push('  ### 🚀 Избранные проекты')
      lines.push('')
      for (const proj of ruProjects) {
        if (proj.name.trim()) {
          const url = data.github ? `https://github.com/${data.github}/${proj.name}` : '#'
          lines.push(`  - **[${proj.name}](${url})** — ${proj.description || 'описание проекта'}`)
        }
      }
      lines.push('')
    }
    lines.push('</details>')
    lines.push('')
  }

  // Featured Projects
  if (!data.multilingualReadme && data.featuredProjects && data.featuredProjects.length > 0) {
    if (template === 'cyberpunk') {
      lines.push('### ⚡ ACTIVE_MISSIONS')
    } else if (template === 'minimalist') {
      lines.push('### Featured Projects')
    } else {
      lines.push('### 🚀 Featured Projects')
    }
    lines.push('')
    for (const proj of data.featuredProjects) {
      if (proj.name.trim()) {
        const url = data.github ? `https://github.com/${data.github}/${proj.name}` : '#'
        if (template === 'cyberpunk') {
          lines.push(`- **[${proj.name}](${url})** » ${proj.description || 'mission objectives description'}`)
        } else {
          lines.push(`- **[${proj.name}](${url})** — ${proj.description || 'catchy project description'}`)
        }
      }
    }
    lines.push('')
  }

const SKILL_CATEGORIES = {
  frontend: [
    'html', 'css', 'javascript', 'typescript', 'react', 'nextjs', 'vue',
    'angular', 'svelte', 'tailwind', 'sass', 'figma'
  ],
  backend: [
    'nodejs', 'python', 'django', 'fastapi', 'java', 'go', 'rust',
    'php', 'laravel', 'cpp', 'cs', 'dotnet', 'graphql', 'mongodb',
    'postgres', 'mysql', 'redis'
  ],
  tools: [
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'github',
    'flutter', 'kotlin', 'swift'
  ]
}

  // Skills
  if (data.skills.length > 0) {
    if (template === 'cyberpunk') {
      lines.push('### 🛠️ STACK_CAPABILITIES')
    } else if (template === 'minimalist') {
      lines.push('### Tech Stack')
    } else {
      lines.push('### 🛠️ Tech Stack')
    }
    lines.push('')

    if (template === 'minimalist') {
      if (data.categorizeSkills) {
        const frontend = data.skills.filter(s => SKILL_CATEGORIES.frontend.includes(s))
        const backend = data.skills.filter(s => SKILL_CATEGORIES.backend.includes(s))
        const tools = data.skills.filter(s => SKILL_CATEGORIES.tools.includes(s))

        if (frontend.length > 0) lines.push(`- **Frontend**: ${frontend.join(', ')}`)
        if (backend.length > 0) lines.push(`- **Backend & Databases**: ${backend.join(', ')}`)
        if (tools.length > 0) lines.push(`- **DevOps, Mobile & Tools**: ${tools.join(', ')}`)
      } else {
        lines.push(`**Skills**: ${data.skills.join(', ')}`)
      }
      lines.push('')
    } else {
      // Classic & Cyberpunk use icon badges
      if (data.categorizeSkills) {
        const frontend = data.skills.filter(s => SKILL_CATEGORIES.frontend.includes(s))
        const backend = data.skills.filter(s => SKILL_CATEGORIES.backend.includes(s))
        const tools = data.skills.filter(s => SKILL_CATEGORIES.tools.includes(s))

        const align = template === 'cyberpunk' ? 'left' : 'center'

        if (frontend.length > 0) {
          lines.push('#### 💻 Frontend')
          lines.push('')
          lines.push(`<p align="${align}">${frontend.map(s => `<img src="https://skillicons.dev/icons?i=${s}" alt="${s}" width="40" height="40"/>`).join(' ')}</p>`)
          lines.push('')
        }
        if (backend.length > 0) {
          lines.push('#### ⚙️ Backend & Databases')
          lines.push('')
          lines.push(`<p align="${align}">${backend.map(s => `<img src="https://skillicons.dev/icons?i=${s}" alt="${s}" width="40" height="40"/>`).join(' ')}</p>`)
          lines.push('')
        }
        if (tools.length > 0) {
          lines.push('#### 🛠️ DevOps, Mobile & Tools')
          lines.push('')
          lines.push(`<p align="${align}">${tools.map(s => `<img src="https://skillicons.dev/icons?i=${s}" alt="${s}" width="40" height="40"/>`).join(' ')}</p>`)
          lines.push('')
        }
      } else {
        const align = template === 'cyberpunk' ? 'left' : 'center'
        lines.push(
          `<p align="${align}">${data.skills
            .map(
              (s) =>
                `<img src="https://skillicons.dev/icons?i=${s}" alt="${s}" width="40" height="40"/>`
            )
            .join(' ')}</p>`
        )
        lines.push('')
      }
    }
  }

  // GitHub stats
  if (data.showStats || data.showTopLangs || data.showStreak) {
    if (template === 'cyberpunk') {
      lines.push('### 📊 SYSTEM_METRICS')
    } else {
      lines.push('### 📊 GitHub Stats')
    }
    lines.push('')

    const align = template === 'minimalist' ? 'left' : 'center'
    const statsTheme = template === 'cyberpunk' ? 'tokyonight' : data.theme

    lines.push(`<p align="${align}">`)

    if (data.showStats) {
      lines.push(
        `<img src="https://github-readme-stats.vercel.app/api?username=${
          data.github || 'yourusername'
        }&show_icons=true&theme=${statsTheme}&hide_border=true&count_private=true" alt="GitHub Stats" height="165"/>`
      )
    }
    if (data.showStreak) {
      lines.push(
        `<img src="https://github-readme-streak-stats.herokuapp.com/?user=${
          data.github || 'yourusername'
        }&theme=${statsTheme}&hide_border=true" alt="GitHub Streak" height="165"/>`
      )
    }

    lines.push('</p>')
    lines.push('')

    if (data.showTopLangs) {
      lines.push(`<p align="${align}">`)
      lines.push(
        `<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${
          data.github || 'yourusername'
        }&layout=compact&theme=${statsTheme}&hide_border=true" alt="Top Languages"/>`
      )
      lines.push('</p>')
      lines.push('')
    }
  }

  // Trophies
  if (data.showTrophies) {
    if (template === 'cyberpunk') {
      lines.push('### 🏆 SYSTEM_ACHIEVEMENTS')
    } else {
      lines.push('### 🏆 Trophies')
    }
    lines.push('')
    const align = template === 'minimalist' ? 'left' : 'center'
    const statsTheme = template === 'cyberpunk' ? 'tokyonight' : data.theme
    lines.push(`<p align="${align}">`)
    lines.push(
      `<img src="https://github-profile-trophy.vercel.app/?username=${
        data.github || 'yourusername'
      }&theme=${statsTheme}&no-frame=true&row=1&column=6" alt="Trophies"/>`
    )
    lines.push('</p>')
    lines.push('')
  }

  // Visitor badge
  if (data.showVisitorBadge && data.github) {
    if (template === 'cyberpunk') {
      lines.push('// ──────────────────────────────────────────────')
    } else {
      lines.push('---')
    }
    lines.push('')
    const align = template === 'minimalist' ? 'left' : 'center'
    const badgeColor = template === 'cyberpunk' ? 'ff0055' : '7c5cfc'
    lines.push(
      `<p align="${align}"><img src="https://komarev.com/ghpvc/?username=${data.github}&label=Profile%20Views&color=${badgeColor}&style=for-the-badge" alt="Profile Views"/></p>`
    )
    lines.push('')
  }

  if (template === 'cyberpunk') {
    lines.push('// ──────────────────────────────────────────────')
    lines.push(
      '<p align="center"><i>// SYSTEM_GENERATED // BY_README_GEN // TERMINAL_EOF</i></p>'
    )
  } else {
    lines.push('---')
    lines.push(
      `<p align="center"><i>Generated with ❤️ using <a href="${hostUrl}" target="_blank">GitHub README Generator</a>. Star the repository on <a href="https://github.com/OgabekHub/github-readme-generator" target="_blank">GitHub</a>! ⭐</i></p>`
    )
  }

  return lines.join('\n')
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
  bioEn: '',
  bioRu: '',
  featuredProjects: [],
  projectsEn: [],
  projectsRu: [],
  showBanner: false,
  showStats: true,
  showStreak: true,
  showTopLangs: true,
  showTrophies: false,
  showVisitorBadge: true,
  theme: 'radical',
  funFact: '',
}
