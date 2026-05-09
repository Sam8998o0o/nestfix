'use client'

import { IconBrandWhatsapp } from '@tabler/icons-react'
import { OWNER_WHATSAPP } from '@/lib/constants'

export default function Navbar() {
  return (
    <nav style={{
      display: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: '#2d2d2a',
      height: '56px',
      width: '100%',
    }}
    className="md:flex items-center"
    >
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 clamp(20px, 5vw, 80px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ color: '#c8a96e', fontWeight: 800, letterSpacing: '0.15em', fontSize: '13px', textTransform: 'uppercase' }}>
          NESTFIX
        </span>
        <a
          href={`https://wa.me/${OWNER_WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#22c55e',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            padding: '7px 16px',
            borderRadius: '99px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}
        >
          <IconBrandWhatsapp size={15} />
          WhatsApp Us
        </a>
      </div>
    </nav>
  )
}
