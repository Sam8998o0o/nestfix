'use client'

import { useState } from 'react'
import {
  IconAlertCircle, IconClockHour4, IconBriefcase,
  IconCurrencyDollar, IconUser, IconRefresh,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────

type AuthState = 'phone' | 'otp' | 'checking' | 'ready' | 'not_found' | 'error'

type Installer = {
  id: string
  name: string
  phone: string
  areas: string[]
  service_types: string[]
  id_photo_url: string | null
  status: 'pending' | 'approved' | 'suspended'
  created_at: string
}

type JobRow = {
  id: string
  area: string
  windows_json: unknown[]
  installer_payout: number
  created_at: string
  status: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: Installer['status'] }) {
  const styles: Record<string, React.CSSProperties> = {
    approved: { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' },
    pending:  { background: '#f5ecd8', color: '#a8894e', border: '1px solid #c8a96e' },
    suspended:{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' },
  }
  const labels: Record<string, string> = {
    approved: '● Active',
    pending:  '● Under Review',
    suspended:'● Suspended',
  }
  return (
    <span style={{ ...styles[status], borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>
      {labels[status]}
    </span>
  )
}

// ── Auth shell ─────────────────────────────────────────────────────────────

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 20, padding: 'clamp(28px, 5vw, 40px)', maxWidth: 440, width: '100%' }}>
        <p style={{ color: '#c8a96e', fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 8px' }}>NESTFIX</p>
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

// ── Section card wrapper ───────────────────────────────────────────────────

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fffef9', border: '1.5px solid #ddd8cc', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ background: '#ede8df', borderBottom: '1.5px solid #ddd8cc', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: '#9c9890' }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c5850' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function InstallerDashboardPage() {
  const [authState, setAuthState] = useState<AuthState>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [authError, setAuthError] = useState('')
  const [installer, setInstaller] = useState<Installer | null>(null)
  const [jobHistory, setJobHistory] = useState<JobRow[]>([])
  const [openJobs, setOpenJobs] = useState<JobRow[]>([])
  const [loadingData, setLoadingData] = useState(false)

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
  }

  // ── Auth: send OTP ──────────────────────────────────────────────────────
  async function sendOtp() {
    if (!phone.trim()) { setAuthError('Please enter your WhatsApp number.'); return }
    setAuthError('')
    setAuthState('checking')
    try {
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

  // ── Auth: verify OTP ────────────────────────────────────────────────────
  async function verifyOtp() {
    if (!otp.trim()) { setAuthError('Please enter the 6-digit code.'); return }
    setAuthError('')
    setAuthState('checking')
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
      if (error) throw error
      await loadDashboard(phone)
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Verification failed.')
      setAuthState('otp')
    }
  }

  // ── Load all dashboard data ─────────────────────────────────────────────
  async function loadDashboard(installerPhone: string) {
    setLoadingData(true)
    try {
      // Fetch installer record
      const { data: installerData, error: iErr } = await supabase
        .from('installers')
        .select('*')
        .eq('phone', installerPhone)
        .single()

      if (iErr || !installerData) {
        setAuthState('not_found')
        return
      }

      setInstaller(installerData as Installer)

      // Fetch job history (taken + completed)
      const { data: historyData } = await supabase
        .from('quotes')
        .select('id, area, windows_json, installer_payout, created_at, status')
        .eq('installer_id', installerData.id)
        .in('status', ['taken', 'completed'])
        .order('created_at', { ascending: false })

      setJobHistory((historyData as JobRow[]) ?? [])

      // Fetch open jobs preview (max 3)
      const { data: openData } = await supabase
        .from('quotes')
        .select('id, area, windows_json, installer_payout, created_at, status')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3)

      setOpenJobs((openData as JobRow[]) ?? [])
      setAuthState('ready')
    } catch {
      setAuthState('error')
    } finally {
      setLoadingData(false)
    }
  }

  async function refreshDashboard() {
    if (!installer) return
    setLoadingData(true)
    await loadDashboard(installer.phone)
  }

  // ── Derived earnings ────────────────────────────────────────────────────
  const totalEarnings = jobHistory.reduce((sum, j) => sum + (j.installer_payout ?? 0), 0)
  const jobCount = jobHistory.length

  // ─────────────────────────────── RENDER ──────────────────────────────────

  if (authState === 'phone') {
    return (
      <AuthShell title="Installer Dashboard" subtitle="Enter your registered WhatsApp number to continue.">
        {authError && <ErrorBanner msg={authError} />}
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#5c5850', marginBottom: 8 }}>WhatsApp Number</label>
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendOtp()} placeholder="e.g. 011-2345 6789" style={inputStyle} />
        <button onClick={sendOtp} style={{ ...primaryBtn, marginTop: 20 }}>Send OTP</button>
      </AuthShell>
    )
  }

  if (authState === 'otp') {
    return (
      <AuthShell title="Enter OTP" subtitle={`We sent a 6-digit code to ${phone}`}>
        {authError && <ErrorBanner msg={authError} />}
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#5c5850', marginBottom: 8 }}>6-digit Code</label>
        <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && verifyOtp()} placeholder="123456" style={{ ...inputStyle, letterSpacing: '0.3em', fontSize: 22, textAlign: 'center' }} />
        <button onClick={verifyOtp} style={{ ...primaryBtn, marginTop: 20 }}>Verify</button>
        <button onClick={() => { setAuthState('phone'); setAuthError('') }} style={{ marginTop: 10, width: '100%', background: 'transparent', border: 'none', color: '#9c9890', fontSize: 13, cursor: 'pointer' }}>← Back</button>
      </AuthShell>
    )
  }

  if (authState === 'checking') {
    return (
      <AuthShell title="Verifying…" subtitle="Please wait a moment.">
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#9c9890', fontSize: 14 }}>Checking your details…</div>
      </AuthShell>
    )
  }

  if (authState === 'not_found') {
    return (
      <AuthShell title="Account Not Found" subtitle="">
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff0f0', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <IconAlertCircle size={26} color="#dc2626" />
          </div>
          <p style={{ fontSize: 14, color: '#5c5850', lineHeight: 1.7, margin: '0 0 20px' }}>
            We couldn&apos;t find your account. Make sure you registered with this number.
          </p>
          <a href="/installer/register" style={{ display: 'inline-block', background: '#2d2d2a', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, padding: '11px 24px', borderRadius: 99 }}>
            Register as Installer
          </a>
        </div>
      </AuthShell>
    )
  }

  if (authState === 'error') {
    return (
      <AuthShell title="Something went wrong" subtitle="">
        <div style={{ textAlign: 'center', paddingBottom: 16 }}>
          <button onClick={() => setAuthState('phone')} style={{ ...primaryBtn, width: 'auto', padding: '11px 28px' }}>Try again</button>
        </div>
      </AuthShell>
    )
  }

  // ── Authenticated dashboard ─────────────────────────────────────────────
  if (authState === 'ready' && installer) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f0e8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* Dark header */}
        <div style={{ background: '#2d2d2a', width: '100%' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(24px, 4vw, 44px) clamp(20px, 5vw, 80px)' }}>
            <p style={{ color: '#c8a96e', fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 10px' }}>NESTFIX · INSTALLERS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ color: '#fff', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, margin: '0 0 10px' }}>
                  Welcome back, {installer.name.split(' ')[0]}
                </h1>
                <StatusBadge status={installer.status} />
              </div>
              <button
                onClick={refreshDashboard}
                disabled={loadingData}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '8px 18px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
              >
                <IconRefresh size={14} />
                {loadingData ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(24px, 3vw, 40px) clamp(20px, 5vw, 80px) 60px' }}>

          {/* ── 1. Profile card ── */}
          <Card title="Your Profile" icon={<IconUser size={15} />}>
            <div style={{ padding: 'clamp(16px, 2vw, 24px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Name</p>
                  <p style={{ fontSize: 15, color: '#1c1c1a', fontWeight: 600, margin: 0 }}>{installer.name}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>WhatsApp</p>
                  <p style={{ fontSize: 15, color: '#1c1c1a', fontWeight: 600, margin: 0 }}>{installer.phone}</p>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Service Areas</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {installer.areas.map(area => (
                    <span key={area} style={{ background: '#f5ecd8', border: '1px solid #c8a96e', color: '#a8894e', borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>{area}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Installation Types</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {installer.service_types.map(st => (
                    <p key={st} style={{ fontSize: 14, color: '#5c5850', margin: 0 }}>· {st}</p>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #ddd8cc', padding: '10px 20px', background: '#fdfcf8' }}>
              <p style={{ fontSize: 12, color: '#9c9890', margin: 0 }}>To update your details, contact us on WhatsApp</p>
            </div>
          </Card>

          {/* ── 2. Earnings card ── */}
          <Card title="Total Earnings" icon={<IconCurrencyDollar size={15} />}>
            <div style={{ padding: 'clamp(20px, 2.5vw, 32px)', display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900, color: '#c8a96e', letterSpacing: '-0.02em', lineHeight: 1 }}>
                RM {totalEarnings}
              </span>
              <span style={{ fontSize: 14, color: '#9c9890' }}>
                {jobCount} job{jobCount !== 1 ? 's' : ''} completed
              </span>
            </div>
          </Card>

          {/* ── 3. Job history card ── */}
          <Card title="Job History" icon={<IconBriefcase size={15} />}>
            {jobHistory.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9c9890', fontSize: 14 }}>
                No completed jobs yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #ddd8cc' }}>
                      {['Area', 'Windows', 'Payout', 'Date'].map(h => (
                        <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobHistory.map((job, i) => (
                      <tr key={job.id} style={{ background: i % 2 === 0 ? '#fffef9' : '#fdfcf8', borderBottom: '1px solid #ddd8cc' }}>
                        <td style={{ padding: '12px 20px', color: '#1c1c1a', fontWeight: 500 }}>{job.area}</td>
                        <td style={{ padding: '12px 20px', color: '#5c5850' }}>
                          {Array.isArray(job.windows_json) ? job.windows_json.length : '—'}
                        </td>
                        <td style={{ padding: '12px 20px', color: '#a8894e', fontWeight: 700 }}>RM {job.installer_payout}</td>
                        <td style={{ padding: '12px 20px', color: '#9c9890', whiteSpace: 'nowrap' }}>{formatDate(job.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* ── 4. Open jobs preview card ── */}
          <Card title="Available Jobs" icon={<IconClockHour4 size={15} />}>
            {openJobs.length === 0 ? (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: '#9c9890', fontSize: 14 }}>
                No open jobs right now.
              </div>
            ) : (
              <>
                {openJobs.map(job => (
                  <div key={job.id} style={{ padding: '14px 20px', borderBottom: '1px solid #ddd8cc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1a', margin: '0 0 2px' }}>{job.area}</p>
                      <p style={{ fontSize: 12, color: '#9c9890', margin: 0 }}>
                        {Array.isArray(job.windows_json) ? job.windows_json.length : 0} window{(Array.isArray(job.windows_json) ? job.windows_json.length : 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#c8a96e' }}>RM {job.installer_payout}</span>
                  </div>
                ))}
                <div style={{ padding: '12px 20px' }}>
                  <a
                    href="/installer/jobs"
                    style={{ fontSize: 14, fontWeight: 600, color: '#c8a96e', textDecoration: 'none' }}
                    onMouseOver={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#a8894e')}
                    onMouseOut={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#c8a96e')}
                  >
                    View all jobs →
                  </a>
                </div>
              </>
            )}
          </Card>

        </div>
      </div>
    )
  }

  return null
}
