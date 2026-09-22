import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DATA,
  generateReadme,
  normalizeProfileData,
  ProfileData,
  SKILL_OPTIONS,
  usesGithubWidgets,
} from '@/lib/readme-generator'

const data = (overrides: Partial<ProfileData> = {}): ProfileData => ({ ...DEFAULT_DATA, ...overrides })

describe('generateReadme — escaping', () => {
  it('escapes HTML in user text', () => {
    const md = generateReadme(data({ name: '<img src=x onerror=alert(1)>', title: 'R&D <Lead>' }))
    expect(md).toContain("I'm &lt;img src=x onerror=alert(1)&gt;</h1>")
    expect(md).toContain('<h3 align="center">R&amp;D &lt;Lead&gt;</h3>')
    expect(md).not.toMatch(/<img src=x/)
  })

  it('keeps multi-line bios inside their HTML block', () => {
    const md = generateReadme(data({ bio: 'line one\n\nline two' }))
    expect(md).toContain('<p align="center">line one<br/><br/>line two</p>')
  })

  it('only allows http(s) links', () => {
    const md = generateReadme(data({ website: 'javascript:alert(1)', linkedin: 'https://linkedin.com/in/ali' }))
    expect(md).not.toContain('javascript:')
    expect(md).toContain('href="https://linkedin.com/in/ali"')
  })

  it('builds social links from handles and URLs', () => {
    const md = generateReadme(data({ twitter: '@ali', youtube: '@chan', telegram: 'https://t.me/ali_dev', email: 'a@b.co' }))
    expect(md).toContain('href="https://twitter.com/ali"')
    expect(md).toContain('href="https://youtube.com/@chan"')
    expect(md).toContain('href="https://t.me/ali_dev"')
    expect(md).toContain('href="mailto:a@b.co"')
  })

  it('does not let a bio break out of the cyberpunk code fence', () => {
    const md = generateReadme(data({ layoutTemplate: 'cyberpunk', bio: 'a ``` b' }))
    expect(md).toContain('[SYSTEM_INFO]: a `` b')
  })

  it('escapes project names and keeps their links valid', () => {
    const md = generateReadme(data({ github: 'octocat', featuredProjects: [{ name: 'my [repo]', description: '<b>x</b>' }] }))
    expect(md).toContain('- **[my \\[repo\\]](https://github.com/octocat/my%20%5Brepo%5D)** — &lt;b&gt;x&lt;/b&gt;')
  })
})

describe('generateReadme — usernames and widgets', () => {
  it('never exports stats without the user’s own username', () => {
    const md = generateReadme(DEFAULT_DATA)
    expect(md).not.toMatch(/username=|user=/)
    expect(md).not.toContain('GitHub Stats')
  })

  it('uses the preview user only when asked to', () => {
    const md = generateReadme(DEFAULT_DATA, { previewUser: 'OgabekHub' })
    expect(md).toContain('username=OgabekHub')
    expect(md).toContain('user=OgabekHub')
  })

  it('ignores invalid usernames and cleans profile URLs', () => {
    expect(generateReadme(data({ github: 'bad name' }))).not.toContain('GitHub Stats')
    expect(generateReadme(data({ github: 'https://github.com/octocat?tab=repos' }))).toContain('username=octocat&')
  })

  it('reads 3D contributions from the default branch', () => {
    expect(generateReadme(data({ github: 'octocat', show3dContrib: true }))).toContain(
      'raw.githubusercontent.com/octocat/octocat/HEAD/profile-3d-contrib/'
    )
  })

  it('writes no setup notes into the README and respects the stats server', () => {
    const md = generateReadme(data({ github: 'octocat', showWakatime: true, wakatimeUsername: 'https://wakatime.com/@jo', statsProvider: 'official' }))
    expect(md).toContain('https://github-readme-stats.vercel.app/api/wakatime?username=jo&')
    expect(md).not.toContain('VS Code')
  })

  it('only adds the banner when the app has a public URL', () => {
    expect(generateReadme(data({ showBanner: true }))).not.toContain('/api/banner')
    expect(generateReadme(data({ showBanner: true }), { siteUrl: 'https://readme.example.com/' })).toContain(
      '<img src="https://readme.example.com/api/banner?name=Developer'
    )
  })

  it('knows which widgets need a username', () => {
    expect(usesGithubWidgets(DEFAULT_DATA)).toBe(true)
    const none = data({ showStats: false, showStreak: false, showTopLangs: false, showVisitorBadge: false })
    expect(usesGithubWidgets(none)).toBe(false)
  })
})

describe('generateReadme — themes per service', () => {
  const withTheme = (theme: string) =>
    generateReadme(data({ github: 'octocat', theme, showTrophies: true, showSummaryCards: true }))

  it('uses the hyphenated names github-readme-stats and streak-stats expect', () => {
    expect(withTheme('shades_of_purple')).toContain('count_private=true&theme=shades-of-purple')
    expect(withTheme('github_dark')).toContain('hide_border=true&theme=github-dark')
  })

  it('maps themes the trophy and summary-card services do not have', () => {
    expect(withTheme('github_dark')).toContain('&theme=darkhub&no-frame')
    expect(withTheme('nord')).toContain('profile-details?username=octocat&theme=nord_dark')
  })

  it('renders themes no service knows with explicit colors', () => {
    const md = withTheme('moonlight')
    expect(md).toContain('&bg_color=222436&title_color=ff757f')
    expect(md).toContain('&background=222436&ring=ff757f')
  })

  it('falls back to radical for unknown themes', () => {
    expect(withTheme('__proto__')).toContain('count_private=true&theme=radical')
  })
})

describe('generateReadme — layout details', () => {
  it('keeps every skill when grouping by category', () => {
    const md = generateReadme(data({ skills: [...SKILL_OPTIONS], categorizeSkills: true }))
    for (const skill of SKILL_OPTIONS) expect(md).toContain(`i=${skill}"`)
  })

  it('fills each language tab from its own fields, falling back to the main ones', () => {
    const md = generateReadme(
      data({
        github: 'octocat',
        multilingualReadme: true,
        bio: 'Main bio',
        bioUz: 'Uzbek bio',
        bioEn: 'English bio',
        featuredProjects: [{ name: 'repo', description: 'main desc', descriptionUz: 'uz desc', descriptionRu: 'ru desc' }],
      })
    )
    const tab = (flag: string) => md.slice(md.indexOf(flag), md.indexOf('</details>', md.indexOf(flag)))
    expect(tab('🇺🇿')).toContain('Uzbek bio')
    expect(tab('🇺🇿')).toContain('uz desc')
    expect(tab('🇬🇧')).toContain('English bio')
    expect(tab('🇬🇧')).toContain('main desc')
    expect(tab('🇷🇺')).toContain('Main bio')
    expect(tab('🇷🇺')).toContain('ru desc')
  })
})

describe('normalizeProfileData', () => {
  it('keeps well-typed known fields and drops the rest', () => {
    const n = normalizeProfileData({ name: 'Ali', showStats: 'yes', skills: ['react', 'evil', 5], extra: true })
    expect(n.name).toBe('Ali')
    expect(n.showStats).toBe(true)
    expect(n.skills).toEqual(['react'])
    expect(n).not.toHaveProperty('extra')
  })

  it('repairs invalid choices', () => {
    const n = normalizeProfileData({ theme: 'nope', statsProvider: 'x', layoutTemplate: 'weird' })
    expect([n.theme, n.statsProvider, n.layoutTemplate]).toEqual(['radical', 'extended', 'classic'])
  })

  it('sanitizes projects and handles garbage input', () => {
    const n = normalizeProfileData({ featuredProjects: [{ name: 'p', description: 1 }, 'bad'] })
    expect(n.featuredProjects).toEqual([{ name: 'p', description: '', descriptionUz: '', descriptionEn: '', descriptionRu: '' }])
    expect(normalizeProfileData('junk')).toEqual(DEFAULT_DATA)
  })
})
