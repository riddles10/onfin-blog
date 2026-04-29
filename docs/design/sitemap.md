# Site map — blog.onfin.io

## Public routes (the design pass scope)

| Route                                  | Purpose                                                       |
|----------------------------------------|---------------------------------------------------------------|
| `/`                                    | 308 redirect → `/en` (no design needed)                       |
| `/en`                                  | Blog index — list of every published post, newest first        |
| `/en?category=trading-guides`          | Category-filtered index (same template, filtered list)        |
| `/en/<slug>`                           | Article detail page                                           |
| `/news_DD_MM_YYYY`                     | 308 redirect → `/en/news_DD_MM_YYYY` (no design needed)        |
| `/sitemap.xml`                         | Auto-generated, no UI                                          |
| `/robots.txt`                          | Auto-generated, no UI                                          |

## Routes the design pass should NOT touch

`/admin/*` — the CMS admin panel ships with its own UI from the ba-cms package. Login at `/admin`, post editor at `/admin/blog/<id>/edit`, etc. This is private operator-facing tooling and is intentionally plain. Treat the admin surface as out-of-scope.

`/api/*` — server endpoints, no UI.

## Categories (for the index filter chips and breadcrumbs)

The CMS validates against this exact set of category slugs:

- `market-analysis`
- `trading-guides`
- `platform-updates`
- `regulation-news`
- `strategies`
- `general`

Display labels are at the design pass's discretion (e.g. "Market Analysis" rather than the slug). Keep them readable but stable across pages — the breadcrumb on the article page should show the same label as the chip on the index page.
