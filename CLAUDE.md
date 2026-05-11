# NestFix — Project Blueprint for Claude Code

## Project Overview
A responsive web app for curtain installation booking in Malaysia.
The owner is a solo installer. Customers fill in their window details, get an instant
price quote, and contact the installer via WhatsApp. No login required.
Single scrollable page — no routing, no tabs.

---

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom config
- **Icons**: @tabler/icons-react
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Setup Commands
```bash
npx create-next-app@latest nestfix --typescript --tailwind --app --src-dir
cd nestfix
npm install @supabase/supabase-js @tabler/icons-react
```

---

## Tailwind Custom Colors
Add to `tailwind.config.ts`:
```js
extend: {
  colors: {
    bg: {
      DEFAULT: '#f5f0e8',
      card: '#fffef9',
      2: '#ede8df',
      3: '#e2dbd0',
    },
    ink: {
      DEFAULT: '#1c1c1a',
      2: '#5c5850',
      3: '#9c9890',
    },
    primary: '#2d2d2a',
    accent: {
      DEFAULT: '#c8a96e',
      dark: '#a8894e',
      light: '#f5ecd8',
    },
    border: {
      DEFAULT: '#ddd8cc',
      2: '#ccc6b8',
    },
  }
}
```

---

## Design System
- **Background**: `#f5f0e8` warm ivory
- **Cards**: `#fffef9` warm white
- **Header / primary buttons**: `#2d2d2a` deep charcoal
- **Accent / selected state**: `#c8a96e` warm gold
- **WhatsApp button**: `#22c55e` green
- **Border radius**: 14px cards, 10px inputs, 99px pills
- **Font**: system-ui / -apple-system

---

## Responsive Layout

### Mobile (< 768px)
- Full width, 16px side padding
- No top navbar
- Hero padding: 28px 20px

### Tablet (768px – 1024px)
- Max width 600px, centered
- Show top navbar

### Desktop (≥ 1024px)
- Max width 680px, centered
- Show top navbar
- Hero headline: 36px
- More padding on cards (24px)
- Larger section labels

### Sticky Top Navbar (tablet + desktop only, hidden on mobile)
- Background: `primary (#2d2d2a)`
- Left: "NESTFIX" in accent gold, bold, letter-spacing 0.15em
- Right: green "WhatsApp Us" button → `https://wa.me/{OWNER_WHATSAPP}`
- Height: 56px
- Hidden on mobile (`hidden md:flex`)

---

## Single Page Layout (`src/app/page.tsx`)

The entire app is ONE scrollable page. No navigation tabs. No routing.
Structure from top to bottom:

```
1. Sticky top navbar (tablet/desktop only)
2. Hero section
3. ── STEP 1: Your windows ──
4. ── STEP 2: Upload photos ──
5. ── STEP 3: Your total quote ──
6. ── STEP 4: Your details ──
7. ── STEP 5: Review & book ──
8. Reviews section
9. Footer
```

---

## Section Specs

### Hero
- Background: `primary (#2d2d2a)`
- Gold wordmark: "NESTFIX" (uppercase, letter-spacing 0.2em)
- H1: "Curtain installation, made effortless."
  - Mobile: 22px
  - Desktop: 36px
- Subtext: "Add each window below, get a total price & book via WhatsApp."
- No CTA button — users just scroll down

---

### STEP 1 — Your Windows

**Section header row** (flex, space-between, always visible):
- Left: step number circle (gold) + label "YOUR WINDOWS"
- Right: gold pill button "＋ Add window"
  - Tapping always visible — placed in header row, NOT below cards

**Window card** (one per window, stacked vertically, gap 10px):

1. **Card header** (bg-2, border-bottom):
   - Left: gold badge "Window N" + current selected type name
   - Right: × delete button (only when > 1 window exists)

2. **Curtain type selector** (grid, 1 column on mobile / 2 columns on tablet+):
   - 5 tiles:
     - Blinds → flat RM 25 (width must be < 270 cm)
     - Track with Curtain only (1 Layer) → RM 3.50 per 30 cm width
     - Track with Curtain and Sheer (2 Layer) → RM 7.00 per 30 cm width
     - Motorized Track with Curtain only (1 Layer) → RM 4.50 per 30 cm width
     - Motorized Track with Curtain and Sheer (2 Layer) → RM 8.00 per 30 cm width
   - Selected: accent-light bg + accent border + accent-dark text
   - Each tile: Tabler icon + type name + pricing hint (e.g. "RM 3.50 / 30 cm")

3. **Dimension inputs** (2 inputs in a row — NO panels field):
   - Width (cm) — number, default 120
   - Height (cm) — number, default 180
   - **No panels input** — removed entirely

4. **Floor-to-ceiling indicator** (auto-shown, no manual select):
   - If height >= 300 cm AND height <= 360 cm:
     - Show a gold info callout: "Floor-to-ceiling surcharge: +RM 20 applied"
   - If height < 300 cm: no surcharge, no callout shown
   - If Blinds selected AND width >= 270 cm:
     - Show a red warning: "Blinds max width is 270 cm — please reduce width"
     - Price shows RM 0 / disabled until width < 270

5. **Per-window price row** (border-top inside card):
   - Label: "This window estimate"
   - Value: "RM X" (single price, no range — see pricing logic below)
   - Live update on every input change

**Price Calculation Logic (per window):**
```ts
// ── Blinds ──
if (type.mode === 'blind') {
  if (width >= 270) return { price: 0, valid: false }  // show warning
  price = 25
}

// ── Track / Motorized ──
if (type.mode === 'track') {
  const units = Math.ceil(width / 30)   // number of 30-cm segments, rounded up
  price = Math.round(units * type.ratePerUnit * 100) / 100
}

// Floor-to-ceiling surcharge (applies to ALL types)
if (height >= 300 && height <= 360) {
  price += 20
}

// windowPrice = price  (single value, no min/max range per window)
```

**Total quote with minimum order:**
```ts
const rawTotal = windows.reduce((sum, w) => sum + w.price, 0)
const finalTotal = rawTotal < 120 ? 120 : rawTotal
// If minimum applies, show: "RM 120 (minimum order applies)"
// Otherwise show: "RM {finalTotal}"
```

**State (React useState):**
```ts
type WindowData = {
  id: string
  typeIdx: number   // index into CURTAIN_TYPES
  width: number
  height: number
  // NO panels field
  price: number     // computed, single value
  valid: boolean    // false if Blinds + width >= 270
}
const [windows, setWindows] = useState<WindowData[]>([createDefaultWindow()])
```

**Behaviour:**
- 1 window auto-created on page load
- "Add window" appends new window with defaults
- Delete button removes that window (only when > 1)
- All prices update live on every change
- Smooth scroll to new card after adding
- Blinds tile is visually dimmed / shows warning if width >= 270 cm

---

### STEP 2 — Upload Photos (optional)

- Dashed border upload zone, full width
- Click/tap to open file picker (accept image/*)
- On upload: image preview (80px height), filename, "Tap to change" link
- Border becomes solid accent when photo uploaded
- Label shows "optional" in muted text

---

### STEP 3 — Your Total Quote

Dark charcoal box (`primary` bg):
- Gold eyebrow: "ESTIMATED TOTAL INSTALLATION FEE"
- Large white price:
  - If raw total >= RM 120: show **"RM {total}"**
  - If raw total < RM 120: show **"RM 120"** with a small muted line below: "Minimum order applies"
- Muted subtext: "N windows · confirmed on-site by installer"
- Breakdown list (one line per window):
  - "Window 1 — Blinds  RM 25"
  - "Window 2 — Track 2L  RM 84"
  - If minimum applied: show a note row: "Minimum order: RM 120"
- Updates live whenever any window changes

---

### STEP 4 — Your Details

Three fields:
- Name (text, placeholder "e.g. Sarah")
- Phone number (tel, placeholder "e.g. 011-2345 6789")
- Area (select):
  Petaling Jaya, Shah Alam, Subang Jaya, Klang, Cheras,
  Ampang, Puchong, Cyberjaya, Putrajaya, Other

---

### STEP 5 — Review & Book

**Summary table** (auto-updates live):
- One row per window: "Window N | Type · W×H cm"
- Photos row: "✓ filename.jpg" (green) or "Not uploaded" (muted)
- Total row (accent-light bg): **"Total | RM {finalTotal}"** (large bold)
  - If minimum applied, add sub-note: "Minimum order of RM 120 applied"

**Accept callout** (accent-light bg + accent border):
- ✓ icon + "Happy with this quote?" + "Tap below — details sent automatically"

**WhatsApp button** (green, full width):
- "Book via WhatsApp" with WhatsApp icon
- Opens: `https://wa.me/{OWNER_WHATSAPP}?text={encodedMessage}`

**Note**: "Full quote sent automatically · We confirm within 2 hours"

---

## WhatsApp Message Format

This is CRITICAL. When user taps "Book via WhatsApp", build this exact message:

```
Hi! Booking via NestFix.

*Name:* {name}
*Phone:* {phone}
*Area:* {area}

*Windows ({count}):*
Window 1: {type} · {W}×{H} cm · {floor-to-ceiling note if applicable} → RM {price}
Window 2: {type} · {W}×{H} cm → RM {price}
(repeat for all windows)

*Photos:* Yes — will send separately   OR   No
*Total: RM {finalTotal}*{minimumNote}

When are you available?
```

- `{floor-to-ceiling note}` = "floor-to-ceiling" — only shown if height was 300–360 cm
- `{minimumNote}` = "\n_(Minimum order of RM 120 applied)_" — only appended if rawTotal < 120
- Single price per window, no range
- Use `*text*` for bold (WhatsApp markdown)
- URL encode the full message
- Open with: `window.open('https://wa.me/' + OWNER_WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank')`

---

## Reviews Section

**Header** (primary bg):
- "What our customers say"
- "Verified reviews from real bookings"

**Rating summary**: score "4.9" + ★★★★★ + "Based on 84 reviews"

**5 static review cards:**
```ts
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
```

---

## Footer
- Primary background
- "NestFix" in accent color, bold
- "Professional curtain installation · Klang Valley"
- "nestfix.my · WhatsApp +60 12-345 6789"

---

## Static Data (`src/lib/constants.ts`)

```ts
// Pricing modes:
//   'blind'  → flat RM 25 regardless of size (only if width < 270cm)
//   'track'  → ratePerUnit × Math.ceil(width / 30)  where ratePerUnit is per-30cm rate
export const CURTAIN_TYPES = [
  {
    type: 'Blinds',
    mode: 'blind' as const,
    flatPrice: 25,
    icon: 'IconLayoutRows',
    note: 'RM 25 (width < 270 cm)',
  },
  {
    type: 'Track with Curtain only (1 Layer)',
    mode: 'track' as const,
    ratePerUnit: 3.50,   // per 30 cm of width
    icon: 'IconLayoutList',
    note: 'RM 3.50 / 30 cm',
  },
  {
    type: 'Track with Curtain and Sheer (2 Layer)',
    mode: 'track' as const,
    ratePerUnit: 7.00,
    icon: 'IconStack2',
    note: 'RM 7.00 / 30 cm',
  },
  {
    type: 'Motorized Track with Curtain only (1 Layer)',
    mode: 'track' as const,
    ratePerUnit: 4.50,
    icon: 'IconSettingsAutomation',
    note: 'RM 4.50 / 30 cm',
  },
  {
    type: 'Motorized Track with Curtain and Sheer (2 Layer)',
    mode: 'track' as const,
    ratePerUnit: 8.00,
    icon: 'IconSettingsAutomation',
    note: 'RM 8.00 / 30 cm',
  },
]

```ts
// Floor-to-ceiling surcharge applies ONLY when height >= 300 cm (max 360 cm).
// No surcharge for heights below 300 cm.
export const FLOOR_CEILING_SURCHARGE = 20   // +RM 20 when height 300–360 cm
export const FLOOR_CEILING_MIN_HEIGHT = 300  // cm
export const FLOOR_CEILING_MAX_HEIGHT = 360  // cm

// Minimum order value — if total of all windows is below this, charge this instead
export const MINIMUM_ORDER = 120  // RM 120

export const AREA_OPTIONS = [
  'Petaling Jaya', 'Shah Alam', 'Subang Jaya', 'Klang',
  'Cheras', 'Ampang', 'Puchong', 'Cyberjaya', 'Putrajaya', 'Other',
]

// ⚠️ IMPORTANT: Update this with the real WhatsApp number before going live
export const OWNER_WHATSAPP = '6'
```

---

## Supabase Schema

Run in Supabase SQL Editor:

```sql
create table quotes (
  id             uuid default gen_random_uuid() primary key,
  customer_name  text,
  customer_phone text,
  area           text,
  windows_json   jsonb not null,
  total_min      integer not null,
  total_max      integer not null,
  has_photo      boolean default false,
  created_at     timestamp default now()
);

create table reviews (
  id            uuid default gen_random_uuid() primary key,
  customer_name text not null,
  rating        integer check (rating between 1 and 5),
  comment       text,
  tags          text[],
  is_approved   boolean default false,
  created_at    timestamp default now()
);
```

After user taps "Book via WhatsApp", also POST the quote data to Supabase
`quotes` table so the owner has a full record of every enquiry.

---

## File Structure

```
src/
├── app/
│   ├── page.tsx           ← complete single-page app
│   ├── layout.tsx         ← metadata, viewport
│   └── globals.css        ← Tailwind directives + resets
├── lib/
│   ├── constants.ts       ← all static data + OWNER_WHATSAPP
│   ├── pricing.ts         ← calcWindow() function
│   ├── types.ts           ← WindowData, Review types
│   └── supabase.ts        ← Supabase client
└── components/
    ├── Navbar.tsx          ← sticky top bar (tablet/desktop only)
    ├── WindowCard.tsx      ← window card with type grid + inputs
    ├── TotalBox.tsx        ← dark total quote box
    ├── PhotoUpload.tsx     ← upload zone with preview
    └── ReviewCard.tsx      ← review card with avatar + stars
```

---

## Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Key UX Rules

1. **No login** — visitors use immediately, zero friction
2. **One scrollable page** — no tabs, no routing
3. **Live price updates** — every input change recalculates instantly
4. **"Add window" always visible** — in section header row (right side)
5. **Start with 1 window** — auto-created on mount
6. **Mobile first, fully responsive** — works on phone AND desktop
7. **WhatsApp is the ONLY booking method** — no form submission needed
8. **WhatsApp message contains ALL details** — type, width, height, floor-to-ceiling flag, per-window price, final total
9. **No panels input** — removed entirely; width drives track pricing
10. **Blinds width limit** — show warning and block booking if Blinds selected with width ≥ 270 cm
11. **Floor-to-ceiling auto-surcharge** — +RM 20 automatically applied when height 300–360 cm; no manual select needed
12. **Minimum order RM 120** — if total of all windows < RM 120, final charge is RM 120; clearly shown in quote and WhatsApp message

---

## Build Order for Claude Code

Read this entire file, then build in this order:

1. Run setup commands + install dependencies
2. Configure Tailwind custom colors in `tailwind.config.ts`
3. Create `src/lib/types.ts`
4. Create `src/lib/constants.ts` with all static data
5. Create `src/lib/pricing.ts` with `calcWindow()` function
6. Create `src/lib/supabase.ts` client
7. Create `src/components/Navbar.tsx`
8. Create `src/components/WindowCard.tsx`
9. Create `src/components/TotalBox.tsx`
10. Create `src/components/PhotoUpload.tsx`
11. Create `src/components/ReviewCard.tsx`
12. Build `src/app/layout.tsx`
13. Build `src/app/globals.css`
14. Build `src/app/page.tsx` — the complete single-page app
15. Create `.env.local` template
16. Run `npm run build` — must pass with zero errors
17. Run `npm run dev` — confirm starts successfully

After building, confirm:
- Zero TypeScript errors
- Zero build errors  
- WhatsApp message includes ALL customer + window details
- Responsive: looks good on mobile AND desktop
- "Add window" button is visible without scrolling
- OWNER_WHATSAPP is clearly marked in constants.ts for easy update
