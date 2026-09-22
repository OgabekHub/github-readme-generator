import defaultTheme from 'tailwindcss/defaultTheme.js'

/**
 * A color backed by a CSS variable that also supports opacity modifiers
 * (`bg-card/80`). Tailwind cannot apply `/80` to an arbitrary `[var(--x)]` value.
 */
const cssVar = (name) => ({ opacityValue }) =>
  opacityValue === undefined || String(opacityValue).startsWith('var(')
    ? `var(${name})`
    : `color-mix(in srgb, var(${name}) calc(${opacityValue} * 100%), transparent)`

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '480px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        accent: '#7C5CFC',
        surface: cssVar('--bg-main'),
        card: cssVar('--bg-card'),
        field: cssVar('--bg-input'),
        line: cssVar('--border-input'),
        muted: cssVar('--text-muted'),
        glow: cssVar('--glow-color'),
      },
      fontFamily: {
        // Outfit has no Cyrillic glyphs; Inter covers the Russian UI
        sans: ['var(--font-outfit)', 'var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}

export default config
