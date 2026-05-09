'use client'

import { useRef } from 'react'
import {
  IconLayoutRows, IconLayoutList, IconStack2,
  IconSettingsAutomation, IconX, IconInfoCircle,
  IconAlertCircle, IconPhoto, IconTrash,
} from '@tabler/icons-react'
import {
  CURTAIN_TYPES, FLOOR_CEILING_MIN_HEIGHT,
  FLOOR_CEILING_MAX_HEIGHT, FLOOR_CEILING_SURCHARGE,
} from '@/lib/constants'
import type { WindowData } from '@/lib/types'

type Props = {
  win: WindowData
  index: number
  showDelete: boolean
  onChange: (updates: Partial<Omit<WindowData, 'id' | 'price' | 'valid'>>) => void
  onDelete: () => void
}

const ICON_MAP = { IconLayoutRows, IconLayoutList, IconStack2, IconSettingsAutomation } as const

export default function WindowCard({ win, index, showDelete, onChange, onDelete }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const selectedType = CURTAIN_TYPES[win.typeIdx]
  const isFloorCeiling = win.height >= FLOOR_CEILING_MIN_HEIGHT && win.height <= FLOOR_CEILING_MAX_HEIGHT
  const isBlindsOverWidth = selectedType.mode === 'blind' && win.width >= 270

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({ photo: { name: file.name, url: URL.createObjectURL(file) } })
  }

  const removePhoto = () => {
    onChange({ photo: null })
    if (fileRef.current) fileRef.current.value = ''
  }

  const inp: React.CSSProperties = {
    width: '100%', border: '1px solid #ddd8cc', borderRadius: '10px',
    padding: '10px 12px', fontSize: '14px', textAlign: 'center',
    background: '#fff', color: '#1c1c1a', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ background: '#fffef9', borderRadius: '16px', border: '1px solid #ddd8cc', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: '#ede8df', borderBottom: '1px solid #ddd8cc', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span style={{ background: '#c8a96e', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '3px 12px', borderRadius: '99px', flexShrink: 0 }}>
            Window {index}
          </span>
          <span style={{ fontSize: '13px', color: '#5c5850', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedType.type}
          </span>
        </div>
        {showDelete && (
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9c9890', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: '8px' }} aria-label="Remove window">
            <IconX size={16} />
          </button>
        )}
      </div>

      {/* Type selector */}
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
          {CURTAIN_TYPES.map((ct, i) => {
            const Icon = ICON_MAP[ct.icon as keyof typeof ICON_MAP]
            const selected = win.typeIdx === i
            const dimmed = ct.mode === 'blind' && win.width >= 270
            return (
              <button key={ct.type} onClick={() => onChange({ typeIdx: i })}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', borderRadius: '10px', border: selected ? '1.5px solid #c8a96e' : '1px solid #ddd8cc', background: selected ? '#f5ecd8' : '#ede8df', cursor: 'pointer', textAlign: 'left', opacity: dimmed && !selected ? 0.5 : 1 }}>
                <Icon size={17} style={{ color: selected ? '#a8894e' : '#9c9890', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: selected ? '#a8894e' : '#1c1c1a', margin: 0, lineHeight: 1.3 }}>{ct.type}</p>
                  <p style={{ fontSize: '11px', color: selected ? '#a8894e' : '#9c9890', margin: '3px 0 0' }}>{ct.note}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Dimension inputs */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontWeight: 600 }}>Width (cm)</label>
            <input type="number" value={win.width} onChange={(e) => onChange({ width: Math.max(1, Number(e.target.value) || 1) })} style={inp} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontWeight: 600 }}>Height (cm)</label>
            <input type="number" value={win.height} onChange={(e) => onChange({ height: Math.max(1, Number(e.target.value) || 1) })} style={inp} />
          </div>
        </div>
      </div>

      {/* Floor-to-ceiling notice */}
      {isFloorCeiling && (
        <div style={{ margin: '0 16px 12px', background: '#f5ecd8', border: '1px solid #c8a96e', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconInfoCircle size={15} style={{ color: '#a8894e', flexShrink: 0 }} />
          <p style={{ fontSize: '12px', color: '#a8894e', margin: 0 }}>Floor-to-ceiling surcharge: +RM {FLOOR_CEILING_SURCHARGE} applied</p>
        </div>
      )}

      {/* Blinds width warning */}
      {isBlindsOverWidth && (
        <div style={{ margin: '0 16px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconAlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
          <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>Blinds max width is 270 cm — please reduce width</p>
        </div>
      )}

      {/* Photo upload */}
      <div style={{ padding: '0 16px 12px' }}>
        <label style={{ display: 'block', fontSize: '10px', color: '#9c9890', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 }}>
          Window Photo{' '}
          <span style={{ fontSize: '10px', color: '#b8b4ac', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
        </label>
        {win.photo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5ecd8', border: '1px solid #c8a96e', borderRadius: '10px', padding: '10px 12px' }}>
            <img src={win.photo.url} alt="preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '7px', flexShrink: 0 }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#a8894e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{win.photo.name}</p>
              <button onClick={() => fileRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#a8894e', padding: 0, marginTop: '2px', textDecoration: 'underline' }}>
                Change photo
              </button>
            </div>
            <button onClick={removePhoto} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8894e', padding: '4px', flexShrink: 0 }} aria-label="Remove photo">
              <IconTrash size={15} />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
            style={{ width: '100%', border: '1.5px dashed #ddd8cc', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', cursor: 'pointer' }}
            onMouseOver={e => (e.currentTarget.style.borderColor = '#c8a96e')}
            onMouseOut={e => (e.currentTarget.style.borderColor = '#ddd8cc')}
          >
            <IconPhoto size={18} style={{ color: '#9c9890' }} />
            <span style={{ fontSize: '13px', color: '#9c9890' }}>Tap to upload photo</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {/* Price row */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid #ddd8cc', padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#5c5850' }}>This window estimate</span>
        {win.valid
          ? <span style={{ fontSize: '16px', fontWeight: 700, color: '#a8894e' }}>RM {win.price}</span>
          : <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>Fix width first</span>
        }
      </div>
    </div>
  )
}