/**
 * Populate the "Also read" section of a MailerLite EN newsletter draft
 * with the 3 most recent items from blog.onfin.io/rss.xml (excluding the
 * article being emailed about).
 *
 * Designed for the publish-day workflow on the May–June 2026 EN
 * newsletter pipeline. Each draft was pre-built with a placeholder
 * Also-read section bracketed by HTML sentinel comments:
 *
 *   <!--ALSO_READ_START-->
 *   ...placeholder cards...
 *   <!--ALSO_READ_END-->
 *
 * This script fetches the live feed, picks the top 3 items excluding the
 * current article's slug, renders 3 stacked cards (title + excerpt +
 * link), and replaces everything between the sentinels via the
 * MailerLite Connect API (PUT /api/campaigns/{id}). The cards mutate
 * existing text/link blocks, which `update_campaign` accepts — verified
 * against MailerLite's builder_html block model in
 * https://app.asana.com/1/1146192511289836/project/1211858286314753/task/1214811046707297
 *
 * Usage:
 *   MAILERLITE_API_TOKEN=... npm run populate:also-read -- \
 *     --campaign 187522515904497094 \
 *     --slug    how-to-choose-forex-broker-2026-checklist
 *
 * Required env: MAILERLITE_API_TOKEN (Connect API bearer token, generate
 * in MailerLite > Integrations > API).
 */
import { argv, env, exit } from 'node:process'

const FEED_URL = 'https://blog.onfin.io/rss.xml'
const ML_API_BASE = 'https://connect.mailerlite.com/api'
const ML_ACCOUNT_ID = '861429'
const START = '<!--ALSO_READ_START-->'
const END = '<!--ALSO_READ_END-->'
const ITEM_COUNT = 3
const EXCERPT_MAX_CHARS = 140

interface FeedItem {
  title: string
  link: string
  description: string
  slug: string
}

function arg(name: string): string | undefined {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1).trimEnd() + '…'
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = []
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  for (const block of itemBlocks) {
    const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? ''
    const desc = block.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? ''
    const slug = link.split('/').pop() ?? ''
    items.push({
      title: decodeEntities(title.trim()),
      link: link.trim(),
      description: decodeEntities(desc.trim()),
      slug,
    })
  }
  return items
}

function buildCard(item: FeedItem, isFirst: boolean, isLast: boolean): string {
  const topPad = isFirst ? '8px' : '16px'
  const botPad = isLast ? '28px' : '16px'
  const border = isFirst ? '' : ' border-top:1px solid #eeeeee;'
  const excerpt = truncate(item.description, EXCERPT_MAX_CHARS)
  return `
      <tr><td class="px-pad" style="padding: ${topPad} 40px ${botPad} 40px;${border}"><a href="${escHtml(item.link)}" target="_blank" style="text-decoration:none; color:inherit;"><p style="font-family:'Montserrat',Arial,sans-serif; font-size:15px; line-height:1.35; font-weight:500; color:#000000; margin:0 0 6px 0; letter-spacing:-0.005em;">${escHtml(item.title)}</p><p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; line-height:1.5; color:#666666; margin:0;">${escHtml(excerpt)}</p></a></td></tr>`
}

function buildSection(items: FeedItem[]): string {
  const cards = items
    .map((it, i) => buildCard(it, i === 0, i === items.length - 1))
    .join('')
  return `${START}
    <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:600px; max-width:600px; background-color:#ffffff; border-radius:12px; margin-top:16px;">
      <tr><td class="px-pad" style="padding: 28px 40px 16px 40px;"><p style="font-family:'Montserrat',Arial,sans-serif; font-size:11px; line-height:1; letter-spacing:0.22em; text-transform:uppercase; color:#999999; margin:0; font-weight:600;">Also read</p></td></tr>${cards}
    </table>
    ${END}`
}

async function main(): Promise<void> {
  const token = env.MAILERLITE_API_TOKEN
  const campaignId = arg('campaign')
  const currentSlug = arg('slug')

  if (!token) {
    console.error('Set MAILERLITE_API_TOKEN in .env.local')
    exit(1)
  }
  if (!campaignId || !currentSlug) {
    console.error('Usage: --campaign <id> --slug <current-article-slug>')
    exit(1)
  }

  console.log(`Fetching ${FEED_URL}`)
  const feedRes = await fetch(FEED_URL)
  if (!feedRes.ok) {
    console.error(`Feed fetch failed: ${feedRes.status}`)
    exit(1)
  }
  const xml = await feedRes.text()
  const allItems = parseFeed(xml)
  const picked = allItems
    .filter((it) => it.slug !== currentSlug)
    .slice(0, ITEM_COUNT)

  if (picked.length < ITEM_COUNT) {
    console.error(
      `Feed has fewer than ${ITEM_COUNT} usable items after excluding ${currentSlug} (got ${picked.length}). Aborting.`
    )
    exit(1)
  }

  console.log(`Top ${ITEM_COUNT} after excluding ${currentSlug}:`)
  for (const it of picked) console.log(`  - ${it.title}`)

  console.log(`Fetching campaign ${campaignId}`)
  const cRes = await fetch(`${ML_API_BASE}/campaigns/${campaignId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })
  if (!cRes.ok) {
    console.error(`Campaign fetch failed: ${cRes.status}`, await cRes.text())
    exit(1)
  }
  const campaignBody = await cRes.json()
  const campaign = campaignBody.data ?? campaignBody
  const email = campaign?.emails?.[0]
  if (!email?.content) {
    console.error('Campaign has no email content.')
    exit(1)
  }
  const content: string = email.content

  const startIdx = content.indexOf(START)
  const endIdx = content.indexOf(END)
  if (startIdx < 0 || endIdx < 0 || endIdx < startIdx) {
    console.error(
      `Sentinels ${START} / ${END} not found in campaign content. Was the draft built with the v2 Also-read template?`
    )
    exit(1)
  }

  const before = content.slice(0, startIdx)
  const after = content.slice(endIdx + END.length)
  const newContent = before + buildSection(picked) + after

  console.log(`Updating campaign ${campaignId}`)
  const putRes = await fetch(`${ML_API_BASE}/campaigns/${campaignId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ name: campaign.name, content: newContent }),
  })
  if (!putRes.ok) {
    console.error(`Update failed: ${putRes.status}`, await putRes.text())
    exit(1)
  }
  const updated = await putRes.json()
  const emailId = (updated.data ?? updated)?.emails?.[0]?.id
  console.log(
    `Done. Preview: https://preview.mailerlite.io/preview/${ML_ACCOUNT_ID}/emails/${emailId}`
  )
}

main().catch((err) => {
  console.error(err)
  exit(1)
})
