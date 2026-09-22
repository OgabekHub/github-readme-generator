import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
// Outfit has no Cyrillic glyphs — Inter is only downloaded when Russian text is shown
const inter = Inter({ subsets: ['cyrillic'], variable: '--font-inter', preload: false })

// Applies the saved theme/language before the first paint (no light-theme flash)
const PREFERENCES_SCRIPT = `try{var t=localStorage.getItem('app_theme');if(t==='light'||t==='dark')document.documentElement.className=t;var l=localStorage.getItem('app_lang');if(l==='uz'||l==='en'||l==='ru')document.documentElement.lang=l}catch(e){}`

// Public URL of the deployment (absolute links for Open Graph / Twitter cards)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: 'GitHub README Generator — Build a stunning profile in seconds',
  description:
    'Create a beautiful GitHub profile README in seconds — no markdown needed. AI-powered bio generator, 60+ skill icons, GitHub stats widgets.',
  keywords: ['github', 'readme', 'generator', 'profile', 'markdown', 'ai', 'open source'],
  openGraph: {
    title: 'GitHub README Generator',
    description:
      'Create a beautiful GitHub profile README in seconds — no markdown needed.',
    ...(siteUrl ? { url: siteUrl } : {}),
    siteName: 'GitHub README Generator',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub README Generator',
    description:
      'Create a beautiful GitHub profile README in seconds — no markdown needed.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // The inline script may change class/lang before hydration
    <html lang="uz" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_SCRIPT }} />
      </head>
      <body className={`${outfit.variable} ${inter.variable} font-sans bg-[var(--bg-main)] text-[var(--text-main)] min-h-screen flex flex-col transition-colors duration-300`}>
        {children}
      </body>
    </html>
  )
}
