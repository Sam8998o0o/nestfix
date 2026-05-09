'use client'

import { useState, useRef } from 'react'
import { IconBrandWhatsapp, IconCheck, IconStarFilled, IconChevronDown } from '@tabler/icons-react'
import WindowCard from '@/components/WindowCard'
import TotalBox from '@/components/TotalBox'
import ReviewCard from '@/components/ReviewCard'
import Navbar from '@/components/Navbar'
import {
  CURTAIN_TYPES, AREA_OPTIONS, OWNER_WHATSAPP, REVIEWS,
  MINIMUM_ORDER, FLOOR_CEILING_MIN_HEIGHT, FLOOR_CEILING_MAX_HEIGHT,
} from '@/lib/constants'
import { calcWindow } from '@/lib/pricing'
import type { WindowData } from '@/lib/types'

function createDefaultWindow(): WindowData {
  const base = { id: crypto.randomUUID(), typeIdx: 0, width: 120, height: 180, photo: null }
  const { price, valid } = calcWindow(base)
  return { ...base, price, valid }
}

const inputCls = 'w-full border border-[#ddd8cc] rounded-xl px-4 py-3 text-sm bg-white text-[#1c1c1a] focus:outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20 transition-all'
const selectCls = 'w-full border border-[#ddd8cc] rounded-xl px-4 py-3 text-sm bg-white text-[#1c1c1a] focus:outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20 transition-all appearance-none cursor-pointer'

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <span style={{ background: '#c8a96e', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>{n}</span>
      <span style={{ fontSize: 'clamp(11px, 1.1vw, 13px)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5c5850' }}>{label}</span>
    </div>
  )
}

export default function Home() {
  const [windows, setWindows] = useState<WindowData[]>([createDefaultWindow()])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [area, setArea] = useState('')
  const newWindowRef = useRef<HTMLDivElement>(null)

  const addWindow = () => {
    setWindows(prev => [...prev, createDefaultWindow()])
    setTimeout(() => newWindowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  const updateWindow = (id: string, updates: Partial<Omit<WindowData, 'id' | 'price' | 'valid'>>) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w
      const updated = { ...w, ...updates }
      const { price, valid } = calcWindow(updated)
      return { ...updated, price, valid }
    }))
  }

  const deleteWindow = (id: string) => setWindows(prev => prev.filter(w => w.id !== id))

  const rawTotal = windows.reduce((sum, w) => sum + w.price, 0)
  const minimumApplies = rawTotal > 0 && rawTotal < MINIMUM_ORDER
  const finalTotal = minimumApplies ? MINIMUM_ORDER : rawTotal

  const buildMessage = () => {
    const windowLines = windows.map((w, i) => {
      const type = CURTAIN_TYPES[w.typeIdx]
      const isFC = w.height >= FLOOR_CEILING_MIN_HEIGHT && w.height <= FLOOR_CEILING_MAX_HEIGHT
      const photoNote = w.photo ? ` · photo: ${w.photo.name}` : ''
      return `Window ${i + 1}: ${type.type} · ${w.width}×${w.height} cm${isFC ? ' · floor-to-ceiling' : ''}${photoNote} → RM ${w.price}`
    }).join('\n')

    const hasPhotos = windows.some(w => w.photo)
    const minimumNote = minimumApplies ? `\n_(Minimum order of RM ${MINIMUM_ORDER} applied)_` : ''

    return (
      `Hi! Booking via NestFix.\n\n*Name:* ${name || '—'}\n*Phone:* ${phone || '—'}\n*Area:* ${area || '—'}\n\n` +
      `*Windows (${windows.length}):*\n${windowLines}\n\n` +
      `*Photos:* ${hasPhotos ? 'Yes — will send separately' : 'No'}\n` +
      `*Total: RM ${finalTotal}*${minimumNote}\n\nWhen are you available?`
    )
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(buildMessage())}`, '_blank')
  }

  const wrap: React.CSSProperties = { maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 80px)' }
  const section: React.CSSProperties = { paddingTop: 'clamp(36px, 4.5vw, 64px)' }

  return (
    <div style={{ background: '#f5f0e8', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Navbar />

      {/* HERO */}
      <section style={{ background: '#2d2d2a', width: '100%' }}>
        <div style={{ ...wrap, paddingTop: 'clamp(44px, 6vw, 88px)', paddingBottom: 'clamp(44px, 6vw, 88px)' }}>
          <p style={{ color: '#c8a96e', fontSize: '11px', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 18px' }}>NESTFIX</p>
          <h1 style={{ color: '#fff', fontWeight: 800, lineHeight: 1.1, margin: '0 0 16px', fontSize: 'clamp(28px, 4.5vw, 60px)' }}>
            Curtain installation,<br />made effortless.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 'clamp(14px, 1.4vw, 19px)', lineHeight: 1.65, margin: 0, maxWidth: '520px' }}>
            Add each window below, get a total price &amp; book via WhatsApp.
          </p>
        </div>
      </section>

      <div style={wrap}>

        {/* STEP 1 — YOUR WINDOWS */}
        <section style={section}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ background: '#c8a96e', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>1</span>
              <span style={{ fontSize: 'clamp(11px, 1.1vw, 13px)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5c5850' }}>Your Windows</span>
            </div>
            <button onClick={addWindow}
              style={{ background: '#c8a96e', color: '#fff', border: 'none', borderRadius: '99px', padding: '10px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              onMouseOver={e => (e.currentTarget.style.background = '#a8894e')}
              onMouseOut={e => (e.currentTarget.style.background = '#c8a96e')}
            >
              ＋ Add window
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))', gap: '16px' }}>
            {windows.map((win, i) => (
              <div key={win.id} ref={i === windows.length - 1 ? newWindowRef : undefined}>
                <WindowCard
                  win={win} index={i + 1} showDelete={windows.length > 1}
                  onChange={updates => updateWindow(win.id, updates)}
                  onDelete={() => deleteWindow(win.id)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* STEP 2 — YOUR TOTAL QUOTE */}
        <section style={section}>
          <StepLabel n={2} label="Your Total Quote" />
          <TotalBox windows={windows} />
        </section>

        {/* STEP 3 — YOUR DETAILS */}
        <section style={section}>
          <StepLabel n={3} label="Your Details" />
          <div style={{ background: '#fffef9', borderRadius: '16px', border: '1px solid #ddd8cc', padding: 'clamp(20px, 3vw, 36px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 }}>Name</label>
                <input type="text" placeholder="e.g. Sarah" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 }}>Phone number</label>
                <input type="tel" placeholder="e.g. 011-2345 6789" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 }}>Area</label>
                <select value={area} onChange={e => setArea(e.target.value)} className={selectCls}>
                  <option value="">Select your area</option>
                  {AREA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <IconChevronDown size={16} style={{ position: 'absolute', right: '14px', bottom: '13px', color: '#9c9890', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
        </section>

        {/* STEP 4 — REVIEW & BOOK */}
        <section style={{ ...section, paddingBottom: 'clamp(48px, 7vw, 96px)' }}>
          <StepLabel n={4} label="Review & Book" />

          {/* Summary table */}
          <div style={{ background: '#fffef9', borderRadius: '16px', border: '1px solid #ddd8cc', overflow: 'hidden', marginBottom: '16px' }}>
            {windows.map((win, i) => {
              const type = CURTAIN_TYPES[win.typeIdx]
              return (
                <div key={win.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #ddd8cc', gap: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#5c5850', flexShrink: 0, fontWeight: 600 }}>Window {i + 1}</span>
                    <span style={{ fontSize: '13px', color: '#1c1c1a', textAlign: 'right' }}>{type.type} · {win.width}×{win.height} cm</span>
                  </div>
                  {win.photo && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #ddd8cc', background: '#fdfcf8' }}>
                      <span style={{ fontSize: '12px', color: '#9c9890' }}>Window {i + 1} photo</span>
                      <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>✓ {win.photo.name}</span>
                    </div>
                  )}
                </div>
              )
            })}
            <div style={{ padding: '18px 20px', background: '#f5ecd8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1c1a' }}>Total estimate</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#1c1c1a' }}>RM {finalTotal}</span>
              </div>
              {minimumApplies && (
                <p style={{ fontSize: '12px', color: '#a8894e', margin: '4px 0 0', textAlign: 'right' }}>Minimum order of RM {MINIMUM_ORDER} applied</p>
              )}
            </div>
          </div>

          {/* Callout */}
          <div style={{ background: '#f5ecd8', border: '1px solid #c8a96e', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#c8a96e', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconCheck size={14} style={{ color: '#fff' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1a', margin: 0 }}>Happy with this quote?</p>
              <p style={{ fontSize: '13px', color: '#5c5850', margin: '4px 0 0' }}>Tap below — details sent automatically</p>
            </div>
          </div>

          {/* WhatsApp button */}
          <button onClick={handleWhatsApp}
            style={{ width: '100%', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '16px', padding: '18px 24px', fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            onMouseOver={e => (e.currentTarget.style.background = '#16a34a')}
            onMouseOut={e => (e.currentTarget.style.background = '#22c55e')}
          >
            <IconBrandWhatsapp size={22} />
            Book via WhatsApp
          </button>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9c9890', margin: '12px 0 0' }}>
            Full quote sent automatically · We confirm within 2 hours
          </p>
        </section>
      </div>

      {/* REVIEWS */}
      <section>
        <div style={{ background: '#2d2d2a', width: '100%' }}>
          <div style={{ ...wrap, paddingTop: 'clamp(32px, 4vw, 56px)', paddingBottom: 'clamp(28px, 3.5vw, 48px)' }}>
            <h2 style={{ color: '#fff', fontWeight: 800, margin: '0 0 6px', fontSize: 'clamp(20px, 2.5vw, 32px)' }}>What our customers say</h2>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '15px', margin: '0 0 24px' }}>Verified reviews from real bookings</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: '#c8a96e', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, lineHeight: 1 }}>4.9</span>
              <div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                  {Array.from({ length: 5 }).map((_, i) => <IconStarFilled key={i} size={18} style={{ color: '#c8a96e' }} />)}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '13px', margin: 0 }}>Based on 84 reviews</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ ...wrap, paddingTop: 'clamp(24px, 3vw, 40px)', paddingBottom: 'clamp(24px, 3vw, 40px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
            {REVIEWS.map(review => <ReviewCard key={review.name} review={review} />)}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#2d2d2a', width: '100%', textAlign: 'center', padding: 'clamp(32px, 4vw, 56px) clamp(20px, 5vw, 80px)' }}>
        <p style={{ color: '#c8a96e', fontWeight: 800, fontSize: '18px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 8px' }}>NestFix</p>
        <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '14px', margin: '0 0 6px' }}>Professional curtain installation · Klang Valley</p>
        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '12px', margin: 0 }}>nestfix.my · WhatsApp +60 12-345 6789</p>
      </footer>
    </div>
  )
}