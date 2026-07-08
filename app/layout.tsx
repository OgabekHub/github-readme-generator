import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GitHub README Generator — Build a stunning profile in seconds',
  description:
    'Create a beautiful GitHub profile README in seconds — no markdown needed. AI-powered bio generator, 40+ skill icons, GitHub stats widgets.',
  keywords: ['github', 'readme', 'generator', 'profile', 'markdown', 'ai', 'open source'],
  openGraph: {
    title: 'GitHub README Generator',
    description:
      'Create a beautiful GitHub profile README in seconds — no markdown needed.',
    url: 'https://github-readme-generator-one.vercel.app',
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
    <html lang="en">
      <body className={`${outfit.className} bg-[var(--bg-main)] text-[var(--text-main)] min-h-screen flex flex-col transition-colors duration-300`}>
        {children}
      </body>
    </html>
  )
}
