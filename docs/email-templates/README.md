# Email templates

Reusable MailerLite email templates in the current OnFin brand styling
(Montserrat headings and body, lime `#9fce10` accent, white rounded
card on `#f7f7f7`). Derived from the June 2026 newsletter sends, which are
the canonical styling reference.

## schedule-update.template.html

Service-notice template for trading schedule changes (public holidays,
maintenance windows, DST shifts). First used for the Juneteenth June 19,
2026 notice (campaigns `06152026 Juneteenth Schedule June 2026 *`).

### Placeholders

| Placeholder | Content |
| --- | --- |
| `{{SUBJECT}}` | Email subject, repeated in `<title>` |
| `{{PREHEADER}}` | Hidden preview line, one sentence |
| `{{EYEBROW}}` | Green uppercase label, e.g. "Trading schedule update" |
| `{{H1}}` | Headline, e.g. "Juneteenth: trading hours on June 19" |
| `{{INTRO}}` | One-paragraph explanation of what changes and why |
| `{{DATE}}` | Date band above the table, e.g. "June 19, 2026" |
| `{{ROWS}}` | Schedule rows, see row snippet below |
| `{{NOTE}}` | Small gray note, e.g. "All times are trading terminal server time (EET)." |
| `{{RECOMMEND}}` | "Plan your trades accordingly" line |
| `{{SUPPORT_LINE}}` | Lead-in text before the support@onfin.io mailto link |
| `{{BLOG_URL}}` | Matching blog post, e.g. `https://blog.onfin.io/<locale>/news_DD_MM_YYYY` |
| `{{BUTTON_LABEL}}` | CTA label, e.g. "View on the blog" |

Row snippet for `{{ROWS}}` (repeat per instrument group; right cell holds
the close time or "Closed"):

```html
<tr><td style="font-family:Montserrat,Arial,sans-serif;font-size:14px;line-height:1.5;color:#222222;padding:12px 12px 12px 14px;border-bottom:1px solid #eeeeee;">DowJones30, Nikkei225, Nasdaq100, S&amp;P500, Russel2000</td><td align="right" style="font-family:Montserrat,Arial,sans-serif;font-size:14px;font-weight:600;white-space:nowrap;color:#000000;padding:12px 14px 12px 12px;border-bottom:1px solid #eeeeee;">Closes at 20:00</td></tr>
```

### Per-locale chrome

The template body is EN. For RU/ID/MY also translate the footer chrome
strings in place: "Follow OnFin", the "You're receiving this..." line, and
"Unsubscribe" (copy them from the matching locale's last newsletter send).
For VI: "Theo dõi OnFin" / "Bạn nhận được email này vì đã đăng ký nhận cập
nhật từ OnFin." / "Hủy đăng ký".

Keep holiday names (Juneteenth, Labour Day...) and instrument tickers in
English in every locale; that matches all prior sends. Never use em-dashes.

### Sending checklist

1. Sender: `OnFin.io <support@onfin.io>` (service notices; newsletters use
   `OnFin Team <newsletter@onfin.io>`). RU campaigns: `language_id: 3`.
2. Target the locale segments, NOT groups (raw API, the MCP can't set
   segments): locale_en `187832149066384765` + locale_world
   `187832163892200463` for EN, locale_ru `187832151949968399`, locale_id
   `187832154825163952`, locale_my `187832157664708318`, locale_vi
   `187832160674121030`.
3. Create via `POST /api/campaigns` with `segments: [...]`, then
   `POST /api/campaigns/{id}/schedule` with
   `{delivery: "scheduled", schedule: {date, hours, minutes, timezone_id: 338}}`
   (338 = Europe/Kiev, EET).
4. Verify after scheduling: `filter_for_humans` shows the right segments and
   `emails[0].content` is non-empty (update_campaign can silently drop both).
5. Publish the matching blog post first so `{{BLOG_URL}}` resolves
   (`scripts/publish-schedule-posts.ts` + `translate:archive`).
