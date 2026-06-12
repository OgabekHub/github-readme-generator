import { NextRequest } from 'next/server'

const THEME_COLORS: Record<string, { bgStart: string, bgEnd: string, textStart: string, textEnd: string, accent: string, textMuted: string }> = {
  radical: {
    bgStart: '#0a0a0f',
    bgEnd: '#141424',
    textStart: '#7C5CFC',
    textEnd: '#a855f7',
    accent: '#7C5CFC',
    textMuted: '#9ca3af'
  },
  dark: {
    bgStart: '#0d1117',
    bgEnd: '#161b22',
    textStart: '#ffffff',
    textEnd: '#8b949e',
    accent: '#58a6ff',
    textMuted: '#8b949e'
  },
  tokyonight: {
    bgStart: '#1a1b26',
    bgEnd: '#24283b',
    textStart: '#7aa2f7',
    textEnd: '#b4f9f8',
    accent: '#f7768e',
    textMuted: '#a9b1d6'
  },
  dracula: {
    bgStart: '#282a36',
    bgEnd: '#44475a',
    textStart: '#ff79c6',
    textEnd: '#bd93f9',
    accent: '#50fa7b',
    textMuted: '#f8f8f2'
  },
  github_dark: {
    bgStart: '#0d1117',
    bgEnd: '#0d1117',
    textStart: '#58a6ff',
    textEnd: '#1f6feb',
    accent: '#58a6ff',
    textMuted: '#8b949e'
  },
  gruvbox: {
    bgStart: '#282828',
    bgEnd: '#3c3836',
    textStart: '#fe8019',
    textEnd: '#fabd2f',
    accent: '#8ec07c',
    textMuted: '#ebdbb2'
  },
  merko: {
    bgStart: '#0a0f0d',
    bgEnd: '#14241c',
    textStart: '#4ade80',
    textEnd: '#22c55e',
    accent: '#4ade80',
    textMuted: '#a3a3a3'
  },
  cobalt: {
    bgStart: '#001b36',
    bgEnd: '#002f5d',
    textStart: '#3399ff',
    textEnd: '#00e1ff',
    accent: '#3399ff',
    textMuted: '#99ccff'
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') || 'Developer'
  const title = searchParams.get('title') || 'Full-Stack Developer'
  const theme = searchParams.get('theme') || 'radical'

  const colors = THEME_COLORS[theme] || THEME_COLORS.radical

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="200" viewBox="0 0 850 200">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bgStart}" />
      <stop offset="100%" stop-color="${colors.bgEnd}" />
    </linearGradient>
    <linearGradient id="text-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.textStart}" />
      <stop offset="100%" stop-color="${colors.textEnd}" />
    </linearGradient>
    <style>
      .title { font-family: 'Inter', -apple-system, system-ui, sans-serif; font-weight: 800; font-size: 34px; fill: url(#text-grad); }
      .subtitle { font-family: 'Inter', -apple-system, system-ui, sans-serif; font-weight: 500; font-size: 17px; fill: ${colors.textMuted}; }
      .bracket { font-family: monospace; font-size: 26px; fill: ${colors.accent}; opacity: 0.9; }
      .grid-lines { stroke: ${colors.accent}; stroke-width: 0.5; opacity: 0.08; }
      .glow { filter: drop-shadow(0px 0px 8px ${colors.accent}44); }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg-grad)" rx="16" />
  
  <!-- Grid pattern -->
  <path class="grid-lines" d="M 0,40 L 850,40 M 0,80 L 850,80 M 0,120 L 850,120 M 0,160 L 850,160" />
  <path class="grid-lines" d="M 100,0 L 100,200 M 200,0 L 200,200 M 300,0 L 300,200 M 400,0 L 400,200 M 500,0 L 500,200 M 600,0 L 600,200 M 700,0 L 700,200 M 800,0 L 800,200" />
  
  <!-- Glowing accent circle -->
  <circle cx="720" cy="100" r="90" fill="${colors.accent}" opacity="0.08" filter="blur(25px)" />
  <circle cx="150" cy="50" r="60" fill="${colors.textEnd}" opacity="0.05" filter="blur(20px)" />
  
  <!-- Main card elements -->
  <g transform="translate(65, 95)">
    <text x="0" y="0" class="bracket">&gt;</text>
    <text x="25" y="-3" class="title glow">${name}</text>
    <text x="25" y="32" class="subtitle">${title}</text>
  </g>
  
  <!-- Design brackets on right side -->
  <g transform="translate(730, 95)" opacity="0.2">
    <text x="0" y="0" font-family="monospace" font-size="64" fill="${colors.accent}">{ }</text>
  </g>
  
  <!-- Tech details corner markings -->
  <rect x="18" y="18" width="8" height="2" fill="${colors.accent}" opacity="0.5" />
  <rect x="18" y="18" width="2" height="8" fill="${colors.accent}" opacity="0.5" />
  
  <rect x="824" y="18" width="8" height="2" fill="${colors.accent}" opacity="0.5" />
  <rect x="830" y="18" width="2" height="8" fill="${colors.accent}" opacity="0.5" />
  
  <rect x="18" y="180" width="8" height="2" fill="${colors.accent}" opacity="0.5" />
  <rect x="18" y="174" width="2" height="8" fill="${colors.accent}" opacity="0.5" />
  
  <rect x="824" y="180" width="8" height="2" fill="${colors.accent}" opacity="0.5" />
  <rect x="830" y="174" width="2" height="8" fill="${colors.accent}" opacity="0.5" />
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  })
}
