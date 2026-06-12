/**
 * One-shot publisher for trading-schedule + maintenance articles that
 * are filed via Asana but didn't land on the blog. Originally scoped to
 * the April + May 2026 schedule posts; now also handles single-event
 * maintenance notices (Centroid Bridge migration, etc.).
 *
 * Pass --slug <slug> to publish only one article from the registry
 * below. With no flag, all entries are upserted in order.
 *
 * What it does, per article:
 *   1. Upserts the post into `posts` (English-canonical, published=true)
 *   2. Triggers the Unsplash download endpoint (TOS) for the chosen photo
 *   3. Downloads the photo at 1200×630 from Unsplash CDN
 *   4. Uploads it to Supabase Storage under cms-images/unsplash-covers/<slug>.jpg
 *   5. Sets posts.cover_image to the public URL
 *
 * Translation to the 8 non-English locales is handled separately by
 * `npm run translate:archive -- --slug <slug>` (already idempotent).
 *
 * Idempotent: re-running upserts the post (no duplicate rows) and
 * overwrites the storage object. Safe to re-run any time content needs
 * a tweak.
 *
 * Usage:
 *   npm run publish:schedule
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * UNSPLASH_ACCESS_KEY.
 */
import { createClient } from '@supabase/supabase-js'

const STORAGE_BUCKET = 'cms-images'
const STORAGE_PREFIX = 'unsplash-covers'

type Article = {
  slug: string
  title: string
  excerpt: string
  bodyHtml: string
  publishedAt: string         // ISO
  category: string
  unsplashId: string
  unsplashPhotographer: string
}

const APRIL: Article = {
  slug: 'news_30_03_2026',
  title: 'Trading Schedule for April 2026 Holidays',
  excerpt:
    "Easter weekend brings the only multi-day market pause in the European calendar — and a sliver of catch-up movement when liquidity returns the Tuesday after. Here's how OnFin's instrument-level schedule shifts across…",
  publishedAt: '2026-03-30T00:00:00.000Z',
  category: 'platform-updates',
  unsplashId: 'aGKspo5OIyg',
  unsplashPhotographer: 'Jakub Żerdzicki',
  bodyHtml: `
<p>Easter weekend brings the only multi-day market pause in the European calendar — and a sliver of catch-up movement when liquidity returns the Tuesday after. Here's how OnFin's instrument-level schedule shifts across the holiday week, plus the post-holiday reopening times you'll want on your trading calendar.</p>
<p>All times below are based on the trading terminal server time (EET).</p>
<table>
<thead>
<tr><th>Date</th><th>Event</th><th>Schedule changes</th></tr>
</thead>
<tbody>
<tr>
<td>Apr 2, 2026</td>
<td>Maundy Thursday</td>
<td><ul><li>ASX200 — early close 16:00</li><li>HK50 — early close 22:00</li><li>DAX40, CAC40, EuroStoxx50 — early close 23:00</li></ul></td>
</tr>
<tr>
<td>Apr 3, 2026</td>
<td>Good Friday</td>
<td><ul><li>Metals, Brent, WTI, NGAS, ASX200, DAX40, CAC40, EuroStoxx50, HK50, IBEX35, FTSE100, N25, CFD Shares US, CFD Shares DE, CFD Shares Asia — trading off</li><li>DowJones30, Nasdaq100, S&amp;P500, Nikkei225, Russell2000 — early close 16:15</li></ul></td>
</tr>
<tr>
<td>Apr 6, 2026</td>
<td>Easter Monday</td>
<td><ul><li>ASX200, DAX40, CAC40, EuroStoxx50, HK50, IBEX35, FTSE100, N25, CFD Shares DE, XALUSD, CFD Shares Asia — trading off</li></ul></td>
</tr>
<tr>
<td>Apr 7, 2026</td>
<td>Post-Easter reopening</td>
<td><ul><li>CAC40 — late open 09:00</li><li>HK50 — trading off</li></ul></td>
</tr>
<tr>
<td>Apr 8, 2026</td>
<td>Post-Easter reopening</td>
<td><ul><li>EuroStoxx50, DAX40 — late open 03:15</li><li>ASX200 — late open 02:50</li><li>FTSE100 — late open 03:00</li><li>HK50 — late open 04:15</li></ul></td>
</tr>
<tr>
<td>Apr 21, 2026</td>
<td>Tiradentes Day</td>
<td><ul><li>USDBRL — trading off</li></ul></td>
</tr>
<tr>
<td>Apr 30, 2026</td>
<td>Labour Day Eve</td>
<td><ul><li>DAX40, CAC40, EuroStoxx50 — early close 23:00</li><li>HK50 — early close 22:00</li></ul></td>
</tr>
</tbody>
</table>
<p>Set your alarms, square away your Friday positions, and we'll see you back on the other side of Easter Monday. As always, plan your trades with these changes in mind — and where positions might roll over a closed session, decide ahead of time whether to hold or close.</p>
`.trim(),
}

const MAY: Article = {
  slug: 'news_27_04_2026',
  title: 'Holiday Trading Schedule for May 2026',
  excerpt:
    'May arrives with two long-weekend pauses — one each side of the Atlantic. Labour Day at the start of the month closes most European indices, and Memorial Day at the end mutes US stocks and metals…',
  publishedAt: '2026-04-27T00:00:00.000Z',
  category: 'platform-updates',
  unsplashId: 'fiXLQXAhCfk',
  unsplashPhotographer: 'Maxim Hopman',
  bodyHtml: `
<p>May arrives with two long-weekend pauses — one each side of the Atlantic. Labour Day at the start of the month closes most European indices, and Memorial Day at the end mutes US stocks and metals. Here's the OnFin instrument-level schedule for both, plus the late-open windows when markets reopen.</p>
<p>All times below are based on the trading terminal server time (EET).</p>
<h2>Labour Day</h2>
<table>
<thead>
<tr><th>Date</th><th>Event</th><th>Schedule changes</th></tr>
</thead>
<tbody>
<tr>
<td>May 1, 2026</td>
<td>Labour Day</td>
<td><ul><li>DAX40, CAC40, EuroStoxx50, HK50, IBEX35, N25 — pricing off</li><li>FTSE100 — early close 23:00</li></ul></td>
</tr>
<tr>
<td>May 4, 2026</td>
<td>Post-holiday reopening</td>
<td><ul><li>DAX40, EuroStoxx50 — late open 03:15</li><li>CAC40 — late open 09:00</li><li>HK50 — late open 04:15</li><li>FTSE100, XALUSD — pricing off</li></ul></td>
</tr>
<tr>
<td>May 5, 2026</td>
<td>Post-holiday reopening</td>
<td><ul><li>FTSE100 — late open 03:00</li></ul></td>
</tr>
</tbody>
</table>
<h2>Memorial Day</h2>
<table>
<thead>
<tr><th>Date</th><th>Event</th><th>Schedule changes</th></tr>
</thead>
<tbody>
<tr>
<td>May 22, 2026</td>
<td>Pre-Memorial Day</td>
<td><ul><li>FTSE100 — early close 23:00</li><li>HK50 — early close 22:00</li></ul></td>
</tr>
<tr>
<td>May 25, 2026</td>
<td>Memorial Day</td>
<td><ul><li>S&amp;P500, Nasdaq100, DowJones30, Nikkei225, Russell2000 — early close 20:00</li><li>DAX40, CAC40, EuroStoxx50 — early close 23:00</li><li>Metals, WTI — early close 21:30</li><li>Brent — early close 20:30</li><li>NGAS — early close 21:15</li><li>HK50, FTSE100, XALUSD, CFD Shares US — pricing off</li></ul></td>
</tr>
<tr>
<td>May 26, 2026</td>
<td>Post-Memorial Day reopening</td>
<td><ul><li>HK50 — late open 04:15</li><li>FTSE100 — late open 03:00</li></ul></td>
</tr>
</tbody>
</table>
<p>Two long weekends, two re-entries — keep these dates on your calendar and decide ahead of time how you'll manage open positions through the closed sessions. We'll see you back at the desk.</p>
`.trim(),
}

const BRIDGE: Article = {
  slug: 'news_22_04_2026',
  title: 'Centroid Bridge Migration on April 25, 2026',
  excerpt:
    "A short downtime window this Saturday: our liquidity bridge is moving to upgraded server hardware — the kind of behind-the-scenes work that doesn't show up in a press release but shows up later as faster execution and tighter spreads.",
  publishedAt: '2026-04-22T00:00:00.000Z',
  category: 'platform-updates',
  unsplashId: 'VHmBX7FnXw0',
  unsplashPhotographer: 'Domaintechnik Ledl.net',
  bodyHtml: `
<p>A short downtime window this Saturday: our liquidity bridge is moving to upgraded server hardware — the kind of behind-the-scenes work that doesn't show up in a press release but shows up later as faster execution and tighter spreads.</p>
<p>All times below are in UTC.</p>
<p><strong>What you need to know</strong></p>
<ul>
<li><strong>When:</strong> Saturday, April 25, 2026 · 08:00 – 16:00 UTC</li>
<li><strong>What's affected:</strong> Pricing and trading services on OnFin's MT4 and MT5 platforms</li>
<li><strong>Expected duration:</strong> 4 to 8 hours</li>
</ul>
<p>The Centroid Bridge (CS 360) — the layer that connects OnFin's terminals to our liquidity providers — is migrating to an upgraded server environment as part of an ongoing performance investment. The bridge provider has confirmed that all preparations are complete and the cutover should run smoothly.</p>
<p>If you have weekend positions you'd want to manage actively, square them on Friday's close — pricing won't be available during the migration window. Trading resumes automatically when the cutover completes; we'll be back at the desk Monday morning.</p>
`.trim(),
}

const JUNETEENTH: Article = {
  slug: 'news_15_06_2026',
  title: 'Trading Schedule for Juneteenth, June 19, 2026',
  excerpt:
    'Juneteenth lands on Friday this year, which means US stock exchanges go quiet for the day and several index, metals, and energy contracts wrap up early. One date, a handful of early closes: here is the instrument-level schedule.',
  publishedAt: '2026-06-15T00:00:00.000Z',
  category: 'platform-updates',
  unsplashId: 'mHdATQY9fIU',
  unsplashPhotographer: 'Aditya Vyas',
  bodyHtml: `
<p>Juneteenth lands on Friday this year, which means US stock exchanges go quiet for the day and several index, metals, and energy contracts wrap up early. The pause is short: one date, a handful of early closes, and a full reopen the following Monday.</p>
<p>All times below are based on the trading terminal server time (EET).</p>
<h2>Juneteenth</h2>
<table>
<thead>
<tr><th>Date</th><th>Event</th><th>Schedule changes</th></tr>
</thead>
<tbody>
<tr>
<td>June 19, 2026</td>
<td>Juneteenth (US federal holiday)</td>
<td><ul><li>DowJones30, Nikkei225, Nasdaq100, S&amp;P500, Russel2000 - early close 20:00</li><li>DAX40, FTSE100, IBEX35, EuroStoxx50 - early close 23:00</li><li>Metals, WTI, NGAS - early close 20:00</li><li>Brent - early close 20:30</li><li>CFD Shares US - trading closed</li></ul></td>
</tr>
</tbody>
</table>
<p>We recommend considering these changes when planning your trades, especially if you hold positions in US shares CFDs that will sit closed through the holiday.</p>
<p>If you have any questions or require further assistance, please contact our support team at <a href="mailto:support@onfin.io">support@onfin.io</a>. Wishing you successful trading!</p>
`.trim(),
}

const ARTICLES: Article[] = [APRIL, MAY, BRIDGE, JUNETEENTH]

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY
  if (!supabaseUrl || !supabaseKey || !unsplashKey) {
    console.error(
      'NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, UNSPLASH_ACCESS_KEY must be set'
    )
    process.exit(1)
  }

  // --slug <slug> filter so re-running for one new article doesn't
  // re-publish (and re-download covers for) every prior article.
  const argv = process.argv.slice(2)
  const slugIdx = argv.indexOf('--slug')
  const slugFilter = slugIdx >= 0 ? argv[slugIdx + 1] : null

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  // Pick the default author for the byline.
  const { data: defaultAuthor } = await supabase
    .from('authors')
    .select('id')
    .eq('is_default', true)
    .maybeSingle()
  const authorId = defaultAuthor?.id ?? null

  const targets = slugFilter
    ? ARTICLES.filter((a) => a.slug === slugFilter)
    : ARTICLES
  if (targets.length === 0) {
    console.error(`No article matching --slug ${slugFilter}`)
    process.exit(1)
  }

  for (const article of targets) {
    console.log(`\n=== ${article.slug} ===`)

    // 1. Upsert the post (English canonical).
    const { data: post, error: upErr } = await supabase
      .from('posts')
      .upsert(
        {
          slug: article.slug,
          title_en: article.title,
          body_en: article.bodyHtml,
          excerpt_en: article.excerpt,
          category: article.category,
          published: true,
          published_at: article.publishedAt,
          blog_author_id: authorId,
          generation_status: null,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single()
    if (upErr || !post) {
      console.error(`  ✗ post upsert failed: ${upErr?.message}`)
      continue
    }
    console.log(`  ✓ post upserted (${post.id})`)

    // 2. Trigger Unsplash download endpoint per their TOS.
    try {
      const dlRes = await fetch(
        `https://api.unsplash.com/photos/${article.unsplashId}/download`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } }
      )
      if (!dlRes.ok) {
        console.warn(`  · TOS download trigger ${dlRes.status}`)
      }
    } catch {
      // Non-fatal — TOS courtesy
    }

    // 3. Download the photo at 1200×630.
    const photoUrl = `https://images.unsplash.com/photo-${article.unsplashId}?w=1200&h=630&fit=crop&fm=jpg&q=85&auto=format`
    let buffer: Buffer
    try {
      // First, resolve the actual photo URL via the API (the
      // images.unsplash.com path needs the photo's slug-derived hash).
      const photoMetaRes = await fetch(
        `https://api.unsplash.com/photos/${article.unsplashId}`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } }
      )
      if (!photoMetaRes.ok) throw new Error(`photo meta ${photoMetaRes.status}`)
      const meta = (await photoMetaRes.json()) as { urls: { raw: string } }
      const sizedUrl = `${meta.urls.raw}&w=1200&h=630&fit=crop&fm=jpg&q=85&auto=format`
      const imgRes = await fetch(sizedUrl)
      if (!imgRes.ok) throw new Error(`image fetch ${imgRes.status}`)
      buffer = Buffer.from(await imgRes.arrayBuffer())
    } catch (err) {
      console.error(`  ✗ photo download failed: ${err instanceof Error ? err.message : String(err)}`)
      continue
    }
    console.log(`  ✓ photo downloaded (${(buffer.length / 1024).toFixed(0)} KB) by ${article.unsplashPhotographer}`)

    // 4. Upload to Supabase Storage.
    const storagePath = `${STORAGE_PREFIX}/${article.slug}.jpg`
    const { error: storeErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: '31536000',
      })
    if (storeErr) {
      console.error(`  ✗ storage upload failed: ${storeErr.message}`)
      continue
    }
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath)
    const publicUrl = urlData.publicUrl

    // 5. Set posts.cover_image.
    const { error: setErr } = await supabase
      .from('posts')
      .update({ cover_image: publicUrl })
      .eq('id', post.id)
    if (setErr) {
      console.error(`  ✗ set cover_image: ${setErr.message}`)
      continue
    }
    console.log(`  ✓ cover_image → ${publicUrl}`)
  }

  console.log('\nNext step: translate the new posts to 8 locales:')
  for (const a of targets) {
    console.log(`  npm run translate:archive -- --slug ${a.slug}`)
  }
}

main().catch((err) => {
  console.error('Publish failed:', err)
  process.exit(1)
})
