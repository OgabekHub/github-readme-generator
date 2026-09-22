// Theme names differ between the widget services, so every widget URL goes through
// the helpers below instead of passing the raw theme name along.
// Palettes and service mappings were taken from the services' own theme sources
// (github-readme-stats, github-readme-streak-stats, github-profile-trophy,
// github-profile-summary-cards); unsupported themes map to the closest-looking one.

export const THEMES = [
  { value: 'radical', label: '🔥 Radical (Purple/Pink)' },
  { value: 'tokyonight', label: '🌃 Tokyo Night' },
  { value: 'dracula', label: '🧛 Dracula' },
  { value: 'github_dark', label: '🐙 GitHub Dark' },
  { value: 'dark', label: '⬛ Dark' },
  { value: 'synthwave', label: '🌆 Synthwave' },
  { value: 'outrun', label: '🏎️ Outrun' },
  { value: 'ocean_dark', label: '🌊 Ocean Dark' },
  { value: 'nord', label: '❄️ Nord' },
  { value: 'onedark', label: '🎨 One Dark' },
  { value: 'moonlight', label: '🌙 Moonlight' },
  { value: 'midnight_purple', label: '💜 Midnight Purple' },
  { value: 'neon', label: '💡 Neon' },
  { value: 'chartreuse_dark', label: '🟢 Chartreuse Dark' },
  { value: 'shades_of_purple', label: '🟣 Shades of Purple' },
  { value: 'merko', label: '🌿 Merko (Green)' },
  { value: 'gruvbox', label: '🍂 Gruvbox' },
  { value: 'solarized_dark', label: '☀️ Solarized Dark' },
  { value: 'cobalt', label: '💙 Cobalt' },
  { value: 'blue_green', label: '🔵 Blue Green' },
  { value: 'nightowl', label: '🦉 Night Owl' },
  { value: 'material_palenight', label: '🌌 Material Palenight' },
  { value: 'jolly', label: '🎪 Jolly' },
  { value: 'rose_pine', label: '🌹 Rose Pine' },
  { value: 'catppuccin_mocha', label: '🐱 Catppuccin Mocha' },
  { value: 'aura', label: '✨ Aura' },
  { value: 'ambient_gradient', label: '🌅 Ambient Gradient' },
  // 🔮 Maxsus Gradientlar (Custom)
  { value: 'gradient_sunset', label: '🌇 Sunset Gradient' },
  { value: 'gradient_ocean', label: '🌊 Ocean Gradient' },
  { value: 'gradient_cyberpunk', label: '🤖 Cyberpunk Gradient' },
  { value: 'gradient_emerald', label: '💎 Emerald Gradient' },
  { value: 'default', label: '⚪ Default (Light)' },
  { value: 'buefy', label: '🌤️ Buefy (Light)' },
  { value: 'vue', label: '💚 Vue (Light)' },
]

export function isKnownTheme(theme: string): boolean {
  return THEMES.some((t) => t.value === theme)
}

/** Background (start/end), title, icon and text colors — hex without "#". */
export interface ThemePalette {
  bg: string
  bg2: string
  title: string
  icon: string
  text: string
}

const p = (bg: string, bg2: string, title: string, icon: string, text: string): ThemePalette => ({ bg, bg2, title, icon, text })

export const THEME_PALETTES: Record<string, ThemePalette> = {
  radical: p('141321', '141321', 'fe428e', 'f8d847', 'a9fef7'),
  tokyonight: p('1a1b27', '1a1b27', '70a5fd', 'bf91f3', '38bdae'),
  dracula: p('282a36', '282a36', 'ff6e96', '79dafa', 'f8f8f2'),
  github_dark: p('0d1117', '0d1117', '58a6ff', '1f6feb', 'c3d1d9'),
  dark: p('151515', '151515', 'ffffff', '79ff97', '9f9f9f'),
  synthwave: p('2b213a', '2b213a', 'e2e9ec', 'ef8539', 'e5289e'),
  outrun: p('141439', '141439', 'ffcc00', 'ff1aff', '8080ff'),
  ocean_dark: p('151a28', '151a28', '8957b2', 'ffffff', '92d534'),
  nord: p('2e3440', '2e3440', '81a1c1', '88c0d0', 'd8dee9'),
  onedark: p('282c34', '282c34', 'e4bf7a', '8eb573', 'df6d74'),
  moonlight: p('222436', '222436', 'ff757f', '599dff', 'f8f8f8'),
  midnight_purple: p('000000', '000000', '9745f5', '9f4bff', 'ffffff'),
  neon: p('000000', '000000', '00ead3', '00ead3', 'ff449f'),
  chartreuse_dark: p('000000', '000000', '7fff00', '00aeff', 'ffffff'),
  shades_of_purple: p('2d2b55', '2d2b55', 'fad000', 'b362ff', 'a599e9'),
  merko: p('0a0f0b', '0a0f0b', 'abd200', 'b7d364', '68b587'),
  gruvbox: p('282828', '282828', 'fabd2f', 'fe8019', '8ec07c'),
  solarized_dark: p('002b36', '002b36', '268bd2', 'b58900', '859900'),
  cobalt: p('193549', '193549', 'e683d9', '0480ef', '75eeb2'),
  blue_green: p('040f0f', '040f0f', '2f97c1', 'f5b700', '0cf574'),
  nightowl: p('011627', '011627', 'c792ea', 'ffeb95', '7fdbca'),
  material_palenight: p('292d3e', '292d3e', 'c792ea', '89ddff', 'a6accd'),
  jolly: p('291b3e', '291b3e', 'ff64da', 'a960ff', 'ffffff'),
  rose_pine: p('191724', '191724', '9ccfd8', 'ebbcba', 'e0def4'),
  catppuccin_mocha: p('1e1e2e', '1e1e2e', '94e2d5', 'cba6f7', 'cdd6f4'),
  aura: p('15141b', '15141b', 'a277ff', 'ffca85', '61ffca'),
  ambient_gradient: p('4158d0', 'ffcc70', 'ffffff', 'ffffff', 'ffffff'),
  gradient_sunset: p('ff512f', 'dd2476', 'ffffff', 'ffffff', 'ffffff'),
  gradient_ocean: p('2193b0', '6dd5ed', 'ffffff', 'ffffff', 'ffffff'),
  gradient_cyberpunk: p('120458', 'ff00a0', 'ffffff', '00ffcc', 'ffffff'),
  gradient_emerald: p('11998e', '38ef7d', 'ffffff', 'ffffff', 'ffffff'),
  default: p('fffefe', 'fffefe', '2f80ed', '4c71f2', '434d58'),
  buefy: p('ffffff', 'ffffff', '7957d5', 'ff3860', '363636'),
  vue: p('fffefe', 'fffefe', '41b883', '41b883', '273849'),
}

export function themePalette(theme: string): ThemePalette {
  return Object.hasOwn(THEME_PALETTES, theme) ? THEME_PALETTES[theme] : THEME_PALETTES.radical
}

// ── github-readme-stats (stats, top languages, WakaTime) ────
const STATS_GRADIENTS: Record<string, string> = {
  gradient_sunset: '&theme=dark&bg_color=30,ff512f,dd2476&title_color=fff&text_color=fff&icon_color=fff',
  gradient_ocean: '&theme=dark&bg_color=45,2193b0,6dd5ed&title_color=fff&text_color=fff&icon_color=fff',
  gradient_cyberpunk: '&theme=dark&bg_color=90,120458,ff00a0,fe2c54&title_color=fff&text_color=fff&icon_color=00ffcc',
  gradient_emerald: '&theme=dark&bg_color=120,11998e,38ef7d&title_color=fff&text_color=fff&icon_color=fff',
}

/** Themes the services only know by their hyphenated name */
const HYPHENATED_IN_STATS = new Set([
  'midnight_purple', 'chartreuse_dark', 'shades_of_purple', 'solarized_dark', 'blue_green', 'material_palenight',
])
const HYPHENATED_IN_STREAK = new Set([
  ...HYPHENATED_IN_STATS, 'github_dark', 'ocean_dark', 'rose_pine', 'catppuccin_mocha', 'ambient_gradient',
])
/** Themes a service does not have at all — rendered with explicit colors instead */
const MISSING_IN_STATS_AND_STREAK = new Set(['moonlight'])

const hyphenate = (theme: string) => theme.replace(/_/g, '-')

export function statsThemeParams(theme: string): string {
  if (Object.hasOwn(STATS_GRADIENTS, theme)) return STATS_GRADIENTS[theme]
  if (MISSING_IN_STATS_AND_STREAK.has(theme)) {
    const c = themePalette(theme)
    return `&bg_color=${c.bg}&title_color=${c.title}&icon_color=${c.icon}&text_color=${c.text}`
  }
  return `&theme=${HYPHENATED_IN_STATS.has(theme) ? hyphenate(theme) : theme}`
}

// ── github-readme-streak-stats ──────────────────────────────
const STREAK_GRADIENTS: Record<string, string> = {
  gradient_sunset: '&theme=dark&background=30,ff512f,dd2476&ring=fff&fire=fff&currStreakNum=fff&sideNums=fff&currStreakLabel=fff&sideLabels=fff&dates=fff',
  gradient_ocean: '&theme=dark&background=45,2193b0,6dd5ed&ring=fff&fire=fff&currStreakNum=fff&sideNums=fff&currStreakLabel=fff&sideLabels=fff&dates=fff',
  gradient_cyberpunk: '&theme=dark&background=90,120458,ff00a0,fe2c54&ring=00ffcc&fire=ff00a0&currStreakNum=fff&sideNums=fff&currStreakLabel=fff&sideLabels=fff&dates=fff',
  gradient_emerald: '&theme=dark&background=120,11998e,38ef7d&ring=fff&fire=fff&currStreakNum=fff&sideNums=fff&currStreakLabel=fff&sideLabels=fff&dates=fff',
}

export function streakThemeParams(theme: string): string {
  if (Object.hasOwn(STREAK_GRADIENTS, theme)) return STREAK_GRADIENTS[theme]
  if (MISSING_IN_STATS_AND_STREAK.has(theme)) {
    const c = themePalette(theme)
    return `&background=${c.bg}&ring=${c.title}&fire=${c.title}&currStreakNum=${c.text}&sideNums=${c.text}&currStreakLabel=${c.title}&sideLabels=${c.text}&dates=${c.text}&stroke=${c.icon}`
  }
  return `&theme=${HYPHENATED_IN_STREAK.has(theme) ? hyphenate(theme) : theme}`
}

// ── github-profile-trophy (supports 25 themes, 8 of ours by name) ──
const TROPHY_THEMES: Record<string, string> = {
  github_dark: 'darkhub', dark: 'aura', synthwave: 'gitdimmed', outrun: 'juicyfresh', ocean_dark: 'discord',
  moonlight: 'dracula', midnight_purple: 'radical', neon: 'algolia', chartreuse_dark: 'matrix',
  shades_of_purple: 'onedark', merko: 'juicyfresh', solarized_dark: 'discord', cobalt: 'dracula',
  blue_green: 'algolia', nightowl: 'darkhub', material_palenight: 'dracula', jolly: 'dracula',
  rose_pine: 'dark_dimmed', catppuccin_mocha: 'dark_dimmed', ambient_gradient: 'radical',
  gradient_sunset: 'radical', gradient_ocean: 'tokyonight', gradient_cyberpunk: 'radical', gradient_emerald: 'matrix',
  buefy: 'default', vue: 'default',
}

export function trophyTheme(theme: string): string {
  return Object.hasOwn(TROPHY_THEMES, theme) ? TROPHY_THEMES[theme] : theme
}

// ── github-profile-summary-cards ────────────────────────────
const SUMMARY_CARD_THEMES: Record<string, string> = {
  // Dracula cards read better next to these vivid themes
  radical: 'dracula', ambient_gradient: 'dracula',
  gradient_sunset: 'dracula', gradient_ocean: 'dracula', gradient_cyberpunk: 'dracula', gradient_emerald: 'dracula',
  // Not available in summary-cards
  nord: 'nord_dark', neon: 'blue_green', catppuccin_mocha: 'rose_pine',
}

export function summaryCardsTheme(theme: string): string {
  return Object.hasOwn(SUMMARY_CARD_THEMES, theme) ? SUMMARY_CARD_THEMES[theme] : theme
}
