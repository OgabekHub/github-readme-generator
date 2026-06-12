import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <body
        className={`${inter.className} bg-[#0a0a0f] text-gray-100 antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
