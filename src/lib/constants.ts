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

// Platform fee — installer receives this % of customer total
export const PLATFORM_FEE_RATE = 0.88

export const RECENT_BOOKINGS = [
  {
    area: 'Cheras',
    propertyType: 'Condo',
    service: 'Track with Curtain and Sheer (2 Layer)',
    shortService: '2 Layer Curtain Track',
    windows: 3,
    estimatedRange: 'RM 180',
    completedIn: '2 days',
  },
  {
    area: 'Puchong',
    propertyType: 'Landed House',
    service: 'Blinds',
    shortService: 'Roller Blinds',
    windows: 5,
    estimatedRange: 'RM 125',
    completedIn: '1 day',
  },
  {
    area: 'Subang Jaya',
    propertyType: 'Office',
    service: 'Motorized Track with Curtain only (1 Layer)',
    shortService: 'Motorized Track',
    windows: 4,
    estimatedRange: 'RM 380',
    completedIn: '3 days',
  },
  {
    area: 'Petaling Jaya',
    propertyType: 'Condo',
    service: 'Blinds',
    shortService: 'Roller Blinds',
    windows: 2,
    estimatedRange: 'RM 120',
    completedIn: '1 day',
  },
  {
    area: 'Ampang',
    propertyType: 'Landed House',
    service: 'Track with Curtain only (1 Layer)',
    shortService: '1 Layer Curtain Track',
    windows: 6,
    estimatedRange: 'RM 250',
    completedIn: '2 days',
  },
]
