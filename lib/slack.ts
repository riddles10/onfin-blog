// Slack incoming-webhook helper for daily draft notifications.
//
// Posts Block Kit messages to a single editorial channel configured via
// SLACK_WEBHOOK_URL. No-op (with a console.warn) if the env var is unset, so
// the cron pipeline keeps running even when notifications are disabled.
//
// Slack incoming webhooks accept Block Kit JSON directly. We use a `header`
// + a `section` with QA scores + an `actions` block for the edit/preview
// links. The action buttons are rendered as ordinary buttons in Slack and
// degrade to text links in email digests.

import {
  SLACK_BOT_NAME,
  SITE_NAME,
  EDIT_URL_PATTERN,
  PREVIEW_URL_PATTERN,
} from '@/lib/cms-config'

export type DraftNotificationOptions = {
  title: string                   // post title (English)
  titleSecondary?: string         // post title (secondary language), optional
  slug: string                    // post slug used in URLs
  topic: string                   // original topic that drove generation
  topicSource: 'queue' | 'keyword-research' | 'rss' | 'manual'
  category: string
  wordCountEn: number
  wordCountSecondary?: number
  qaScoreEn: number               // 0-100
  qaScoreSecondary?: number       // 0-100
  qaGradeEn: string               // A / B / C / D / F
  qaGradeSecondary?: string
  coverImageUrl?: string | null   // Unsplash thumb for the message image block
  photographerName?: string | null
  baseUrl: string                 // e.g. https://blog.onfin.io (no trailing /)
  postId: string                  // for the admin edit link
}

/**
 * Build a full URL from a pattern and baseUrl by replacing placeholders.
 * Returns null if the pattern is null (feature not configured).
 */
function buildUrl(
  baseUrl: string,
  pattern: string | null,
  replacements: Record<string, string>
): string | null {
  if (!pattern) return null
  let url = pattern
  for (const [key, value] of Object.entries(replacements)) {
    url = url.replace(`{${key}}`, value)
  }
  return `${baseUrl}${url}`
}

function emojiForGrade(grade: string | undefined): string {
  if (!grade) return ':grey_question:'
  const g = grade.toUpperCase()
  if (g === 'A' || g === 'B') return ':white_check_mark:'
  if (g === 'C') return ':warning:'
  return ':x:'
}

function pickWorstGrade(a: string, b?: string): string {
  if (!b) return a
  const order: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, F: 4 }
  const ai = order[a?.toUpperCase()] ?? 4
  const bi = order[b?.toUpperCase()] ?? 4
  return ai >= bi ? a : b
}

function formatSource(src: DraftNotificationOptions['topicSource']): string {
  if (src === 'queue') return 'from topic queue'
  if (src === 'keyword-research') return 'live keyword research'
  if (src === 'rss') return 'from RSS feed'
  return 'manual'
}

/**
 * Send a Slack Block Kit message announcing a freshly drafted post.
 * Provides clickable buttons to edit the draft and preview the article.
 * No-op if SLACK_WEBHOOK_URL is missing.
 */
export async function postDraftNotification(opts: DraftNotificationOptions): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not set — skipping draft notification')
    return
  }

  const editUrl = buildUrl(opts.baseUrl, EDIT_URL_PATTERN, { id: opts.postId })
  const previewUrl = buildUrl(opts.baseUrl, PREVIEW_URL_PATTERN, { slug: opts.slug })

  const worstGrade = pickWorstGrade(opts.qaGradeEn, opts.qaGradeSecondary)
  const headerEmoji = emojiForGrade(worstGrade)

  // Block 1: header — title, with worst-grade emoji as a quick visual signal.
  const blocks: Array<Record<string, unknown>> = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${headerEmoji} New draft: ${opts.title}`.slice(0, 150),
        emoji: true,
      },
    },
  ]

  // Block 2: secondary-language title (italics) if present.
  if (opts.titleSecondary) {
    blocks.push({
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `_${opts.titleSecondary}_` },
      ],
    })
  }

  // Block 3: scores + topic.
  const scoreLines: string[] = [
    `*EN:* ${opts.qaScoreEn}/100 (${opts.qaGradeEn}) · ${opts.wordCountEn} words`,
  ]
  if (opts.qaScoreSecondary != null && opts.qaGradeSecondary) {
    scoreLines.push(
      `*Secondary:* ${opts.qaScoreSecondary}/100 (${opts.qaGradeSecondary}) · ${opts.wordCountSecondary ?? '?'} words`
    )
  }
  scoreLines.push(`*Topic:* ${opts.topic}`)
  scoreLines.push(`*Source:* ${formatSource(opts.topicSource)} · ${opts.category}`)

  blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: scoreLines.join('\n') },
  })

  // Block 4: cover image preview.
  if (opts.coverImageUrl) {
    blocks.push({
      type: 'image',
      image_url: opts.coverImageUrl,
      alt_text: opts.title,
    })
  }

  // Block 5: action buttons.
  const actionElements: Array<Record<string, unknown>> = []
  if (editUrl) {
    actionElements.push({
      type: 'button',
      text: { type: 'plain_text', text: 'Edit draft', emoji: true },
      url: editUrl,
      style: 'primary',
    })
  }
  if (previewUrl) {
    actionElements.push({
      type: 'button',
      text: { type: 'plain_text', text: 'Preview', emoji: true },
      url: previewUrl,
    })
  }
  if (actionElements.length > 0) {
    blocks.push({ type: 'actions', elements: actionElements })
  }

  // Block 6: photographer credit, if any.
  if (opts.photographerName) {
    blocks.push({
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `Cover by ${opts.photographerName} on Unsplash` },
      ],
    })
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: SLACK_BOT_NAME,
        // Slack uses `text` as a fallback for clients that don't render blocks
        // (notifications, email digests). Always include a meaningful summary.
        text: `New ${SITE_NAME} blog draft: ${opts.title} (${opts.qaGradeEn}, ${opts.qaScoreEn}/100)`,
        blocks,
      }),
    })

    if (!res.ok) {
      console.warn(
        `Slack webhook failed: ${res.status} ${res.statusText} — ${await safeText(res)}`
      )
    }
  } catch (err) {
    console.warn('Slack webhook error:', err)
  }
}

/**
 * Send a plain text failure alert to Slack. Used by the cron pipeline when
 * something explodes mid-flight so the operator notices.
 */
export async function postFailureAlert(
  message: string,
  context?: Record<string, unknown>
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const contextLines = context
    ? Object.entries(context)
        .map(([k, v]) => `*${k}:* \`${String(v).slice(0, 200)}\``)
        .join('\n')
    : ''

  const blocks: Array<Record<string, unknown>> = [
    {
      type: 'header',
      text: { type: 'plain_text', text: ':rotating_light: Daily draft pipeline failed', emoji: true },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: message.slice(0, 2000) },
    },
  ]
  if (contextLines) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: contextLines.slice(0, 2000) },
    })
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: SLACK_BOT_NAME,
        text: `Daily draft pipeline failed: ${message.slice(0, 200)}`,
        blocks,
      }),
    })
  } catch (err) {
    console.warn('Slack failure-alert error:', err)
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 200)
  } catch {
    return '<no body>'
  }
}
