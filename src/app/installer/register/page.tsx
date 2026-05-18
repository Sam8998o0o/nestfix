'use client'

import { useState, useRef } from 'react'
import { IconCheck, IconUpload, IconAlertCircle } from '@tabler/icons-react'
import { AREA_OPTIONS, CURTAIN_TYPES, OWNER_WHATSAPP } from '@/lib/constants'
import { registerInstaller, uploadIdPhoto } from '@/lib/supabase'

type PageState = 'form' | 'uploading' | 'success' | 'error'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1.5px solid #ddd8cc',
  background: '#fffef9',
  fontSize: 15,
  color: '#1c1c1a',
  outline: 'none',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#5c5850',
  marginBottom: 8,
}

export default function InstallerRegisterPage() {
  const [pageState, setPageState] = useState<PageState>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [idPhoto, setIdPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleArea(area: string) {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )
  }

  function toggleService(service: string) {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    )
  }

  function validate(): string {
    if (!name.trim()) return 'Please enter your full name.'
    if (!phone.trim()) return 'Please enter your WhatsApp number.'
    if (selectedAreas.length === 0) return 'Please select at least one service area.'
    if (selectedServices.length === 0) return 'Please select at least one installation type.'
    if (!idPhoto) return 'Please upload your IC / identity photo.'
    return ''
  }

  async function handleSubmit() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setPageState('uploading')
    try {
      const id_photo_url = await uploadIdPhoto(idPhoto!)
      await registerInstaller({
        name: name.trim(),
        phone: phone.trim(),
        areas: selectedAreas,
        service_types: selectedServices,
        id_photo_url,
      })
      // Notify owner via WhatsApp
      const msg = `[NestFix] New installer application!\nName: ${name.trim()}\nPhone: ${phone.trim()}\nAreas: ${selectedAreas.join(', ')}\nServices: ${selectedServices.join(', ')}\nPlease review in Supabase dashboard.`
      window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
      setPageState('success')
    } catch {
      setPageState('error')
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (pageState === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 20, padding: 'clamp(32px, 6vw, 48px)', maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f5ecd8', border: '2px solid #c8a96e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <IconCheck size={32} color="#a8894e" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1c1c1a', marginBottom: 10 }}>Application submitted!</h2>
          <p style={{ fontSize: 15, color: '#5c5850', lineHeight: 1.6 }}>
            We will review your application and contact you via WhatsApp within <strong>1–2 business days</strong>.
          </p>
        </div>
      </div>
    )
  }

  // ── Error screen ────────────────────────────────────────────────────────
  if (pageState === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 20, padding: 'clamp(32px, 6vw, 48px)', maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff0f0', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <IconAlertCircle size={32} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1c1c1a', marginBottom: 10 }}>Something went wrong</h2>
          <p style={{ fontSize: 15, color: '#5c5850', marginBottom: 24 }}>Please try again or contact us via WhatsApp.</p>
          <button
            onClick={() => setPageState('form')}
            style={{ background: '#2d2d2a', color: '#fff', border: 'none', borderRadius: 99, padding: '11px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#2d2d2a', padding: 'clamp(28px, 5vw, 48px) clamp(20px, 5vw, 40px)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ color: '#c8a96e', fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 10 }}>NESTFIX</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, margin: '0 0 8px' }}>Join as an Installer</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Apply to receive curtain installation jobs in your area.
          </p>
        </div>
      </div>

      {/* Form body */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 clamp(20px, 5vw, 40px) 60px' }}>

        {/* Error banner */}
        {error && (
          <div style={{ background: '#fff0f0', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconAlertCircle size={18} color="#dc2626" />
            <span style={{ fontSize: 14, color: '#dc2626', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Personal info card */}
        <div style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 16, marginTop: 24, overflow: 'hidden' }}>
          <div style={{ background: '#f5f0e8', borderBottom: '1.5px solid #ddd8cc', padding: '12px 20px' }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9c9890' }}>Personal Info</span>
          </div>
          <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ahmad bin Razak"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 011-2345 6789"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Service areas card */}
        <div style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 16, marginTop: 16, overflow: 'hidden' }}>
          <div style={{ background: '#f5f0e8', borderBottom: '1.5px solid #ddd8cc', padding: '12px 20px' }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9c9890' }}>Service Areas</span>
          </div>
          <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
            <p style={{ fontSize: 13, color: '#9c9890', marginBottom: 14, marginTop: 0 }}>Select all areas you can cover</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AREA_OPTIONS.map(area => {
                const selected = selectedAreas.includes(area)
                return (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 99,
                      border: selected ? '1.5px solid #c8a96e' : '1.5px solid #ddd8cc',
                      background: selected ? '#f5ecd8' : '#fffef9',
                      color: selected ? '#a8894e' : '#5c5850',
                      fontSize: 13,
                      fontWeight: selected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {area}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Installation types card */}
        <div style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 16, marginTop: 16, overflow: 'hidden' }}>
          <div style={{ background: '#f5f0e8', borderBottom: '1.5px solid #ddd8cc', padding: '12px 20px' }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9c9890' }}>Installation Types</span>
          </div>
          <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
            <p style={{ fontSize: 13, color: '#9c9890', marginBottom: 14, marginTop: 0 }}>Select all types you can install</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CURTAIN_TYPES.map(ct => {
                const selected = selectedServices.includes(ct.type)
                return (
                  <button
                    key={ct.type}
                    onClick={() => toggleService(ct.type)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: selected ? '1.5px solid #c8a96e' : '1.5px solid #ddd8cc',
                      background: selected ? '#f5ecd8' : '#fffef9',
                      color: selected ? '#a8894e' : '#5c5850',
                      fontSize: 14,
                      fontWeight: selected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: selected ? '2px solid #c8a96e' : '2px solid #ddd8cc',
                      background: selected ? '#c8a96e' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}>
                      {selected && <IconCheck size={13} color="#fff" strokeWidth={3} />}
                    </span>
                    {ct.type}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* IC photo upload card */}
        <div style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 16, marginTop: 16, overflow: 'hidden' }}>
          <div style={{ background: '#f5f0e8', borderBottom: '1.5px solid #ddd8cc', padding: '12px 20px' }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9c9890' }}>Identity Verification</span>
          </div>
          <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
            <label style={labelStyle}>IC / Identity Card Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => setIdPhoto(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '20px',
                borderRadius: 10,
                border: idPhoto ? '1.5px solid #c8a96e' : '1.5px dashed #ccc6b8',
                background: idPhoto ? '#f5ecd8' : '#fffef9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.15s',
              }}
            >
              {idPhoto ? (
                <>
                  <IconCheck size={18} color="#a8894e" />
                  <span style={{ fontSize: 14, color: '#a8894e', fontWeight: 600 }}>{idPhoto.name}</span>
                  <span style={{ fontSize: 12, color: '#9c9890' }}>— Tap to change</span>
                </>
              ) : (
                <>
                  <IconUpload size={18} color="#9c9890" />
                  <span style={{ fontSize: 14, color: '#9c9890' }}>Tap to upload IC photo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={pageState === 'uploading'}
          style={{
            marginTop: 24,
            width: '100%',
            background: pageState === 'uploading' ? '#9c9890' : '#2d2d2a',
            color: '#fff',
            border: 'none',
            borderRadius: 99,
            padding: '15px 28px',
            fontSize: 16,
            fontWeight: 800,
            cursor: pageState === 'uploading' ? 'not-allowed' : 'pointer',
            letterSpacing: '0.03em',
            transition: 'background 0.15s',
          }}
        >
          {pageState === 'uploading' ? 'Submitting…' : 'Submit Application'}
        </button>
        <p style={{ fontSize: 12, color: '#9c9890', textAlign: 'center', marginTop: 12 }}>
          Your IC photo is stored securely and only used for verification.
        </p>

      </div>
    </div>
  )
}
