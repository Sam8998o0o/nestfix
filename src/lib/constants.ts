// Pricing modes:
//   'blind' → flat RM 25 regardless of size (only if width < 270 cm)
//   'track' → ratePerUnit × Math.ceil(width / 30)  where ratePerUnit is per-30cm rate
export const CURTAIN_TYPES = [
  {
    type: 'Blinds',
    shortType: 'Blinds',
    mode: 'blind' as const,
    flatPrice: 25,
    icon: 'IconLayoutRows',
    note: 'RM 25 (width < 270 cm)',
  },
  {
    type: 'Track with Curtain only (1 Layer)',
    shortType: 'Track 1L',
    mode: 'track' as const,
    ratePerUnit: 3.50,
    icon: 'IconLayoutList',
    note: 'RM 3.50 / 30 cm',
  },
  {
    type: 'Track with Curtain and Sheer (2 Layer)',
    shortType: 'Track 2L',
    mode: 'track' as const,
    ratePerUnit: 7.00,
    icon: 'IconStack2',
    note: 'RM 7.00 / 30 cm',
  },
  {
    type: 'Motorized Track with Curtain only (1 Layer)',
    shortType: 'Motor 1L',
    mode: 'track' as const,
    ratePerUnit: 4.50,
    icon: 'IconSettingsAutomation',
    note: 'RM 4.50 / 30 cm',
  },
  {
    type: 'Motorized Track with Curtain and Sheer (2 Layer)',
    shortType: 'Motor 2L',
    mode: 'track' as const,
    ratePerUnit: 8.00,
    icon: 'IconSettingsAutomation',
    note: 'RM 8.00 / 30 cm',
  },
]

// Floor-to-ceiling surcharge applies ONLY when height >= 300 cm (max 360 cm).
export const FLOOR_CEILING_SURCHARGE = 20    // +RM 20 when height 300–360 cm
export const FLOOR_CEILING_MIN_HEIGHT = 300  // cm
export const FLOOR_CEILING_MAX_HEIGHT = 360  // cm

// Minimum order — if total of all windows is below this, charge this instead
export const MINIMUM_ORDER = 120  // RM 120

export const AREA_OPTIONS = [
  'Petaling Jaya', 'Shah Alam', 'Subang Jaya', 'Klang',
  'Cheras', 'Ampang', 'Puchong', 'Cyberjaya', 'Putrajaya', 'Other',
]

// ⚠️ IMPORTANT: Update this with the real WhatsApp number before going live
export const OWNER_WHATSAPP = '60163468998'

export const REVIEWS = [
  {
    initials: 'SL',
    name: 'Sarah Lim',
    rating: 5,
    date: '2 days ago',
    text: 'Added 4 different windows with different blind types and got the total instantly. Installer came next day, everything perfect!',
    tags: ['4 windows', 'Subang Jaya'],
    avatarColor: { bg: '#f5ecd8', text: '#a8894e', border: '#c8a96e' },
  },
  {
    initials: 'AH',
    name: 'Ahmad Haziq',
    rating: 5,
    date: '1 week ago',
    text: 'New house 6 windows — added them all, got total RM 380. Very transparent pricing, no surprise charges!',
    tags: ['6 windows', 'Cheras'],
    avatarColor: { bg: '#fde8cf', text: '#92400e', border: '#d97706' },
  },
  {
    initials: 'MW',
    name: 'Michelle Wong',
    rating: 5,
    date: '2 weeks ago',
    text: 'Mix of roller blinds and motorized for master bedroom. Price was exactly as quoted. Highly recommend!',
    tags: ['Blinds + Track', 'PJ'],
    avatarColor: { bg: '#ede9fe', text: '#5b21b6', border: '#7c3aed' },
  },
  {
    initials: 'RN',
    name: 'Raj Naidu',
    rating: 4,
    date: '3 weeks ago',
    text: 'Good service overall. Quote accurate, installer professional. End result great.',
    tags: ['Track 2 Layer', 'Puchong'],
    avatarColor: { bg: '#dcfce7', text: '#15803d', border: '#22c55e' },
  },
  {
    initials: 'FC',
    name: 'Fiona Chai',
    rating: 5,
    date: '1 month ago',
    text: 'Third time using NestFix. The multi-window feature saves so much time — no more calling around for prices.',
    tags: ['Motorized Track', 'Shah Alam'],
    avatarColor: { bg: '#fce7f3', text: '#9d174d', border: '#ec4899' },
  },
]
