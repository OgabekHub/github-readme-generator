import { ImageResponse } from 'next/og'

// Social preview card (og:image) — the metadata already asked for a large image card
export const alt = 'GitHub README Generator — build a stunning GitHub profile README'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #030014 0%, #141424 60%, #2a1a5e 100%)',
          color: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, color: '#a78bfa', letterSpacing: 2 }}>✨ AI-POWERED</div>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, marginTop: 20 }}>GitHub README Generator</div>
        <div style={{ display: 'flex', fontSize: 34, marginTop: 24, color: '#cbd5e1', maxWidth: 960 }}>
          Build a stunning profile README in minutes — AI bio, 60+ skill icons, stats widgets and 1-click publish.
        </div>
        <div style={{ display: 'flex', marginTop: 48, height: 8, width: 260, borderRadius: 4, background: 'linear-gradient(90deg, #7C5CFC, #a855f7)' }} />
      </div>
    ),
    size
  )
}
