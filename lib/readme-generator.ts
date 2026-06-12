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
  'flutter', 'kotlin', 'swift', 'cpp', 'csharp', 'dotnet',
]

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

const SOCIAL_ICONS: Record<string, (val: string) => string> = {
  twitter: (v) =>
    `[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/${v.replace('@', '')})`,
  linkedin: (v) =>
    `[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](${v.startsWith('http') ? v : `https://linkedin.com/in/${v}`})`,
  telegram: (v) =>
    `[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/${v.replace('@', '')})`,
  facebook: (v) =>
    `[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](${v.startsWith('http') ? v : `https://facebook.com/${v}`})`,
  instagram: (v) =>
    `[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/${v.replace('@', '')})`,
  youtube: (v) =>
    `[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](${v.startsWith('http') ? v : `https://youtube.com/${v}`})`,
  website: (v) =>
    `[![Website](https://img.shields.io/badge/Website-7C5CFC?style=for-the-badge&logo=googlechrome&logoColor=white)](${v.startsWith('http') ? v : `https://${v}`})`,
  email: (v) =>
    `[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:${v})`,
}

export function generateReadme(data: ProfileData): string {
  const lines: string[] = []

  // Header
  lines.push(
    `<h1 align="center">Hi 👋, I'm ${data.name || 'Your Name'}</h1>`
  )
  if (data.title) {
    lines.push(`<h3 align="center">${data.title}</h3>`)
  }
  lines.push('')

  // Bio
  if (data.bio) {
    lines.push(`<p align="center">${data.bio}</p>`)
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
    lines.push(socialBadges.join('\n'))
    lines.push('</p>')
    lines.push('')
  }

  // Location & fun fact
  if (data.location || data.funFact) {
    lines.push('---')
    lines.push('')
    if (data.location) lines.push(`- 📍 Based in **${data.location}**`)
    if (data.funFact) lines.push(`- ⚡ Fun fact: ${data.funFact}`)
    lines.push('')
  }

  // Skills
  if (data.skills.length > 0) {
    lines.push('### 🛠️ Tech Stack')
    lines.push('')
    lines.push(
      `<p align="center">${data.skills
        .map(
          (s) =>
            `<img src="https://skillicons.dev/icons?i=${s}" alt="${s}" width="40" height="40"/>`
        )
        .join(' ')}</p>`
    )
    lines.push('')
  }

  // GitHub stats
  if (data.showStats || data.showTopLangs || data.showStreak) {
    lines.push('### 📊 GitHub Stats')
    lines.push('')
    lines.push('<p align="center">')

    if (data.showStats) {
      lines.push(
        `<img src="https://github-readme-stats.vercel.app/api?username=${
          data.github || 'yourusername'
        }&show_icons=true&theme=${data.theme}&hide_border=true&count_private=true" alt="GitHub Stats" height="165"/>`
      )
    }
    if (data.showStreak) {
      lines.push(
        `<img src="https://github-readme-streak-stats.herokuapp.com/?user=${
          data.github || 'yourusername'
        }&theme=${data.theme}&hide_border=true" alt="GitHub Streak" height="165"/>`
      )
    }

    lines.push('</p>')
    lines.push('')

    if (data.showTopLangs) {
      lines.push('<p align="center">')
      lines.push(
        `<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${
          data.github || 'yourusername'
        }&layout=compact&theme=${data.theme}&hide_border=true" alt="Top Languages"/>`
      )
      lines.push('</p>')
      lines.push('')
    }
  }

  // Trophies
  if (data.showTrophies) {
    lines.push('### 🏆 Trophies')
    lines.push('')
    lines.push('<p align="center">')
    lines.push(
      `<img src="https://github-profile-trophy.vercel.app/?username=${
        data.github || 'yourusername'
      }&theme=${data.theme}&no-frame=true&row=1&column=6" alt="Trophies"/>`
    )
    lines.push('</p>')
    lines.push('')
  }

  // Visitor badge
  if (data.showVisitorBadge && data.github) {
    lines.push('---')
    lines.push('')
    lines.push(
      `<p align="center"><img src="https://komarev.com/ghpvc/?username=${data.github}&label=Profile%20Views&color=7c5cfc&style=for-the-badge" alt="Profile Views"/></p>`
    )
    lines.push('')
  }

  lines.push('---')
  lines.push(
    '<p align="center"><i>Generated with ❤️ using GitHub README Generator</i></p>'
  )

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
  showStats: true,
  showStreak: true,
  showTopLangs: true,
  showTrophies: false,
  showVisitorBadge: true,
  theme: 'radical',
  funFact: '',
}
