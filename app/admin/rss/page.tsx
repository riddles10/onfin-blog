import RssTriageClient from './RssTriageClient'
import { fetchAllConfiguredFeeds } from '@/lib/rss-topics'
import { readSetting, SETTINGS_KEYS } from '@/lib/cms-settings'

// Server component shell for the RSS triage admin. Pulls the initial
// feed snapshot + the configured webhook URL on the server so the page
// renders fully populated without a client-side loading flicker. The
// client child (RssTriageClient) handles refresh, paste, and triage
// button interactions.

export const dynamic = 'force-dynamic'

export default async function RssAdminPage() {
  const [items, webhookUrl] = await Promise.all([
    fetchAllConfiguredFeeds().catch((err) => {
      console.warn('[admin/rss] feed fetch failed:', err)
      return []
    }),
    readSetting(SETTINGS_KEYS.RSS_TRIAGE_WEBHOOK_URL).catch(() => null),
  ])

  return (
    <RssTriageClient initialItems={items} initialWebhookUrl={webhookUrl ?? ''} />
  )
}
