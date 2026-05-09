import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NestFix — Curtain Installation, Made Effortless',
  description: 'Get an instant curtain installation quote and book via WhatsApp. Serving the Klang Valley.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
