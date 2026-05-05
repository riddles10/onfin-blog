// Tiny key/value store for runtime-editable configuration.
//
// Backs settings that need to live somewhere persistent but shouldn't
// require an env-var roundtrip + redeploy to change — the RSS-triage
// webhook URL is the first user. Any string-valued knob the operator
// edits in the admin UI lives here.
//
// All reads/writes go through the service-role Supabase client, and the
// `cms_settings` table has RLS enabled with no public policies so only
// the server can touch it.

import { getServiceClient } from '@/lib/supabase'

export const SETTINGS_KEYS = {
  RSS_TRIAGE_WEBHOOK_URL: 'rss_triage_webhook_url',
} as const

export type SettingsKey = (typeof SETTINGS_KEYS)[keyof typeof SETTINGS_KEYS]

/**
 * Read a single setting. Returns null when the key is unset.
 */
export async function readSetting(key: SettingsKey): Promise<string | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('cms_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  if (error) {
    console.warn('[cms-settings] read failed:', key, error.message)
    return null
  }
  return data?.value ?? null
}

/**
 * Upsert a single setting. Empty string clears the value but keeps the row;
 * pass null to fully delete the row.
 */
export async function writeSetting(
  key: SettingsKey,
  value: string | null
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getServiceClient()
  if (value === null) {
    const { error } = await supabase.from('cms_settings').delete().eq('key', key)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }
  const { error } = await supabase
    .from('cms_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
