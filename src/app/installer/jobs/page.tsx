'use client'

import { useState } from 'react'
import { IconBrandWhatsapp, IconRefresh, IconAlertCircle, IconClockHour4, IconCheck } from '@tabler/icons-react'
import { OWNER_WHATSAPP } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────

type AuthState = 'phone' | 'otp' | 'checking' | 'pending' | 'approved' | 'error'

type Quote = {
  id: string
  area: string
  windows_json: WindowSummary[]
  installer_payout: number
  created_at: string
  status: string
}

type WindowSummary = {
  typeIdx?: number
  width?: number
  height?: number
  price?: number
}

type Installer = {
  id: string
  name: string
  phone: string
  status: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function windowsSummary(windows: WindowSummary[]): string {
  if (!Array.isArray(windows) || windows.length === 0) return 'No window data'
  return `${windows.length} window${windows.length > 1 ? 's' : ''}`
}

// ── Component ──────────────────────────────────────────────────────────────

export default function InstallerJobsPage() {
  const [authState, setAuthState] = useState<AuthState>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [authError, setAuthError] = useState('')
  const [installer, setInstaller] = useState<Installer | null>(null)
  const [jobs, setJobs] = useState<Quote[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [grabbedIds, setGrabbedIds] = useState<Set<string>>(new Set())
  const [grabbingId, setGrabbingId] = useState<string | null>(null)

  // ── Auth: send OTP ────────────────────────────────────────────────────────
  async function sendOtp() {
    if (!phone.trim()) {
      setAuthError('Please enter your WhatsApp number.')
      return
    }
    setAuthError('')
    setAuthState('checking')
    try {
      // Normalise phone — strip spaces, dashes; ensure it starts with +
      const normalised = phone.replace(/[\s\-]/g, '').replace(/^0/, '+60')
      const { error } = await supabase.auth.signInWithOtp({ phone: normalised })
      if (error) throw error
      setPhone(normalised)
      setAuthState('otp')
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Failed to send OTP.')
      setAuthState('phone')
    }
  }

  // ── Auth: verify OTP ──────────────────────────────────────────────────────
  async function verifyOtp() {
    if (!otp.trim()) {
      setAuthError('Please enter the 6-digit code.')
      return
    }
    setAuthError('')
    setAuthState('checking')
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
      if (error) throw error

      // Look up installer record
      const { data, error: dbErr } = await supabase
        .from('installers')
        .select('*')
        .eq('phone', phone)
        .single()

      if (dbErr || !data) {
        setAuthState('pending')
        return
      }

      if (data.status !== 'approved') {
        setAuthState('pending')
        return
      }

      setInstaller(data as Installer)
      setAuthState('approved')
      await loadJobs()
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Verification failed.')
      setAuthState('otp')
    }
  }

  // ── Load open jobs ────────────────────────────────────────────────────────
  async function loadJobs() {
    setLoadingJobs(true)
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('id, area, windows_json, installer_payout, created_at, status')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (error) throw error
      setJobs((data as Quote[]) ?? [])
    } catch {
      // silently fail — jobs list stays empty
    } finally {
      setLoadingJobs(false)
    }
  }

  // ── Grab job ──────────────────────────────────────────────────────────────
  async function grabJob(job: Quote) {
    if (!installer) return
    setGrabbingId(job.id)
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: 'taken', installer_id: installer.id })
        .eq('id', job.id)
        .eq('status', 'open')  // guard against double-grabs
      if (error) throw error

      const msg = `[NestFix] Job grabbed!\nInstaller: ${installer.name} (${installer.phone})\nQuote ID: ${job.id}\nArea: ${job.area}\nPayout: RM ${job.installer_payout}`
      window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')

      setGrabbedIds(prev => new Set(Array.from(prev).concat(job.id)))
      setJobs(prev => prev.filter(j => j.id !== job.id))
    } catch {
      // show inline error — don't crash the page
    } finally {
      setGrabbingId(null)
    }
  }

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #ddd8cc',
    background: '#fffef9',
    fontSize: 15,
    color: '#1c1c1a',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const primaryBtn: React.CSSProperties = {
    width: '100%',
    background: '#2d2d2a',
    color: '#fff',
    border: 'none',
    borderRadius: 99,
    padding: '13px 28px',
    fontSize: 15,
    fontWeight: 800,
    cursor: 'pointer',
    letterSpacing: '0.03em',
  }

  // ── Render: phone entry ───────────────────────────────────────────────────
  if (authState === 'phone') {
    return (
      <AuthShell title="Installer Login" subtitle="Enter your registered WhatsApp number to continue.">
        {authError && <ErrorBanner msg={authError} />}
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#5c5850', marginBottom: 8 }}>WhatsApp Number</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendOtp()}
          placeholder="e.g. 011-2345 6789"
          style={inputStyle}
        />
        <button onClick={sendOtp} style={{ ...primaryBtn, marginTop: 20 }}>Send OTP</button>
      </AuthShell>
    )
  }

  // ── Render: OTP entry ─────────────────────────────────────────────────────
  if (authState === 'otp') {
    return (
      <AuthShell title="Enter OTP" subtitle={`We sent a 6-digit code to ${phone}`}>
        {authError && <ErrorBanner msg={authError} />}
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#5c5850', marginBottom: 8 }}>6-digit Code</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && verifyOtp()}
          placeholder="123456"
          style={{ ...inputStyle, letterSpacing: '0.3em', fontSize: 22, textAlign: 'center' }}
        />
        <button onClick={verifyOtp} style={{ ...primaryBtn, marginTop: 20 }}>Verify</button>
        <button onClick={() => { setAuthState('phone'); setAuthError('') }} style={{ marginTop: 10, width: '100%', background: 'transparent', border: 'none', color: '#9c9890', fontSize: 13, cursor: 'pointer' }}>← Back</button>
      </AuthShell>
    )
  }

  // ── Render: checking spinner ──────────────────────────────────────────────
  if (authState === 'checking') {
    return (
      <AuthShell title="Verifying…" subtitle="Please wait a moment.">
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#9c9890', fontSize: 14 }}>Checking your details…</div>
      </AuthShell>
    )
  }

  // ── Render: pending review ────────────────────────────────────────────────
  if (authState === 'pending') {
    return (
      <AuthShell title="Under Review" subtitle="">
        <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f5ecd8', border: '2px solid #c8a96e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <IconClockHour4 size={28} color="#a8894e" />
          </div>
          <p style={{ fontSize: 15, color: '#5c5850', lineHeight: 1.7, margin: 0 }}>
            Your application is currently <strong>under review</strong>.<br />
            We will contact you via WhatsApp once approved.
          </p>
        </div>
      </AuthShell>
    )
  }

  // ── Render: approved — jobs list ──────────────────────────────────────────
  if (authState === 'approved') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f0e8', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

        {/* Header */}
        <div style={{ background: '#2d2d2a', padding: 'clamp(20px, 4vw, 36px) clamp(20px, 5vw, 40px)' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#c8a96e', fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 4px' }}>NESTFIX</p>
              <h1 style={{ color: '#fff', fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, margin: 0 }}>
                Hi, {installer?.name?.split(' ')[0]} 👋
              </h1>
            </div>
            <button
              onClick={loadJobs}
              disabled={loadingJobs}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <IconRefresh size={15} style={{ transform: loadingJobs ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s' }} />
              {loadingJobs ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Jobs body */}
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 clamp(20px, 5vw, 40px) 60px' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9c9890', margin: 0 }}>
              Open Jobs {jobs.length > 0 && `— ${jobs.length} available`}
            </p>
            <a
              href="/installer/dashboard"
              style={{ fontSize: 13, fontWeight: 600, color: '#c8a96e', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseOver={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#a8894e')}
              onMouseOut={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#c8a96e')}
            >
              My Dashboard →
            </a>
          </div>

          {/* Empty state */}
          {!loadingJobs && jobs.length === 0 && (
            <div style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 16, padding: 'clamp(32px, 5vw, 48px)', textAlign: 'center' }}>
              <p style={{ fontSize: 15, color: '#9c9890', margin: 0 }}>No open jobs right now.</p>
              <p style={{ fontSize: 13, color: '#9c9890', marginTop: 6 }}>Check back later or hit Refresh.</p>
            </div>
          )}

          {/* Grabbed confirmation cards */}
          {Array.from(grabbedIds).map(id => (
            <div key={`grabbed-${id}`} style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 16, padding: '20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconCheck size={20} color="#16a34a" />
              <p style={{ margin: 0, fontSize: 14, color: '#15803d', fontWeight: 600 }}>Job confirmed! Customer will be contacted.</p>
            </div>
          ))}

          {/* Job cards */}
          {jobs.map(job => (
            <div key={job.id} style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>

              {/* Card header */}
              <div style={{ background: '#f5f0e8', borderBottom: '1.5px solid #ddd8cc', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1a' }}>{job.area}</span>
                <span style={{ fontSize: 12, color: '#9c9890' }}>{timeAgo(job.created_at)}</span>
              </div>

              {/* Card body */}
              <div style={{ padding: '16px 18px' }}>

                {/* Windows summary */}
                <p style={{ margin: '0 0 16px', fontSize: 14, color: '#5c5850' }}>
                  {windowsSummary(job.windows_json as WindowSummary[])}
                </p>

                {/* Payout — prominent */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Payout</span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#c8a96e', letterSpacing: '-0.02em' }}>
                    RM {job.installer_payout}
                  </span>
                </div>

                {/* Grab button */}
                <button
                  onClick={() => grabJob(job)}
                  disabled={grabbingId === job.id}
                  style={{
                    width: '100%',
                    background: grabbingId === job.id ? '#9c9890' : '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 99,
                    padding: '12px 24px',
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: grabbingId === job.id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background 0.15s',
                  }}
                >
                  <IconBrandWhatsapp size={17} />
                  {grabbingId === job.id ? 'Grabbing…' : 'Grab this job'}
                </button>

              </div>
            </div>
          ))}

        </div>
      </div>
    )
  }

  return null
}

// ── Auth shell wrapper ─────────────────────────────────────────────────────

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 20, padding: 'clamp(28px, 5vw, 40px)', maxWidth: 440, width: '100%' }}>
        <p style={{ color: '#c8a96e', fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 8, marginTop: 0 }}>NESTFIX</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1c1c1a', margin: '0 0 6px' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 14, color: '#9c9890', margin: '0 0 24px' }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div style={{ background: '#fff0f0', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      <IconAlertCircle size={16} color="#dc2626" />
      <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>{msg}</span>
    </div>
  )
}
