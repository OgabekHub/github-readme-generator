import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Widgets, skill icons and avatars are third-party SVGs shown as-is;
      // routing them through the next/image optimizer is intentionally avoided.
      '@next/next/no-img-element': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
])
