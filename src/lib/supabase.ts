import { createClient } from '@supabase/supabase-js'
import { PLATFORM_FEE_RATE } from './constants'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Quote helpers ──────────────────────────────────────────────────────────

export type QuoteInsert = {
  customer_name: string
  customer_phone: string
  area: string
  windows_json: object
  customer_total: number
  has_photo: boolean
}

export async function insertQuote(data: QuoteInsert) {
  const installer_payout = Math.floor(data.customer_total * PLATFORM_FEE_RATE)
  const { error } = await supabase.from('quotes').insert({
    ...data,
    installer_payout,
    status: 'open',
  })
  if (error) throw error
}

// ── Installer helpers ──────────────────────────────────────────────────────

export type InstallerInsert = {
  name: string
  phone: string
  areas: string[]
  service_types: string[]
  id_photo_url: string | null
}

export async function registerInstaller(data: InstallerInsert) {
  const { error } = await supabase.from('installers').insert({
    ...data,
    status: 'pending',
  })
  if (error) throw error
}

export async function uploadIdPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `id-photos/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('installer-docs')
    .upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('installer-docs').getPublicUrl(path)
  return data.publicUrl
}
