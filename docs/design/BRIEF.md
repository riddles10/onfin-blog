# Antigravity design brief — blog.onfin.io

You are the designer for the public-facing pages of `blog.onfin.io`, a brand-new editorial site for OnFin (a multi-asset broker, parent site `onfin.io`). The repository is a Next.js 15 App Router project with the data layer, admin panel, and route stubs already in place. **Your job is the visual design and the React component layer for two routes only — the blog index and the blog article.** Treat everything else as out-of-scope.

---

## What is already done (don't touch it)

- **Data layer.** `app/[lang]/page.tsx` and `app/[lang]/[slug]/page.tsx` already fetch from Supabase, emit per-page metadata, and emit JSON-LD `Article` schema. They render placeholder semantic HTML — your job is to replace that placeholder JSX with real components.
- **Design tokens.** `app/globals.css` has the OnFin brand palette, fonts, container width, and the `.prose-blog` rules that style article body HTML. **Use these tokens. Do not introduce new colors, fonts, or spacing scales.**
- **Tailwind theme.** `tailwind.config.ts` exposes the same tokens as Tailwind utilities (`bg-brand-lime`, `text-ink-500`, `font-display`, `max-w-site`).
- **Admin panel.** `/admin` is the ba-cms editorial UI; do not redesign it.
- **SEO scaffolding.** Next's `metadata`, `sitemap.ts`, and `robots.ts` are wired. JSON-LD Article schema is emitted from the article page. Don't duplicate any of that — focus on what's visible.

---

## Two pages to design

### 1. Blog index (`/en`)

Lives at `app/[lang]/page.tsx`. The data is already fetched server-side; you replace the JSX inside the default export with your design.

**What it must do**

- Read **legibly** above all else — this is an editorial site for traders, not a marketing landing page. Long-form content is the primary product; the index is the doorway to it.
- Surface the latest 10–20 articles as readable **cards** with: title, publication date, category label, short excerpt, optional cover image. Cards click anywhere to the article — entire card is one big link.
- Provide **category filter chips** at the top of the list. Active state is visually obvious. Clicking a chip filters the URL (`/en?category=trading-guides`) — a search-engine-crawlable filter, not a JS-only toggle.
- Hero section: title ("OnFin Blog" or similar), one-sentence subtitle, no CTAs competing for attention. Hero is restrained — readers came for articles, give them articles.
- Pagination or load-more for older posts. Don't render all 100+ articles in one DOM tree.

**What it should NOT have**

- No promotional banners ("Open an Account", "Claim a Bonus") cluttering the page. The blog is editorial; OnFin's marketing site is `onfin.io`.
- No newsletter modal that fires on scroll. A small inline newsletter card at the bottom is fine; an interrupting modal is not.
- No category dropdowns or hidden navigation. Chips are visible, sort options are visible.

### 2. Blog article (`/en/<slug>`)

Lives at `app/[lang]/[slug]/page.tsx`. Same pattern — replace the JSX, keep the data fetching and JSON-LD intact.

The article page is where readers spend 5+ minutes, so legibility carries the most weight. Build the layout in this priority order:

1. **The body text.** Body width 65–75ch (the `.prose-blog` styles already handle most of this — don't override them unless you have a structural reason). Generous line-height. Calm hierarchy: H2 > H3 > H4. Code blocks should not exist on this site — there's no code, but a `<blockquote>` styling should look elegant.
2. **Breadcrumbs at the top** — `Blog / <Category> / <Article title>`. Real links, schema.org `BreadcrumbList` JSON-LD welcome (you can add it inside the article JSX).
3. **Title block (H1).** Followed by the publication date, the byline (author name + avatar + one-line bio), and the cover image if present. Author block matters — readers should be able to see who wrote it without scrolling.
4. **Body content.** Pulled in via `dangerouslySetInnerHTML` against the `.prose-blog` container — that wrapper exists in the stub already, keep it.
5. **A reading-progress indicator at the top of the viewport** is a nice-to-have, not required.
6. **Optional table of contents** in a sticky right rail on desktop. Generate from H2s. Hidden on mobile.
7. **Share rail** — Twitter/X, LinkedIn, copy-link. Sticky on desktop (left rail), inline at the bottom of the body on mobile. No Facebook/Instagram, no chat-app shares.
8. **Author block at the bottom** — bigger version of the byline at the top. Avatar, name, bio, links if present.
9. **Related posts (3 cards)** — same category if available, otherwise newest. Reuse the index's card component.
10. **A single, restrained CTA at the very bottom.** "Open an OnFin account" or "Try OnFin in demo mode", linking to `https://onfin.io/`. One link, not a busy banner.

---

## Design constraints

### Use the existing tokens

The brand visual identity is already settled at `onfin.io`. The blog must read as part of that family. The design tokens are in `app/globals.css` and `tailwind.config.ts`:

- **Colors**: `brand-lime` (#9fce10) is the only saturated accent — use it for CTAs, the active chip state, the blockquote rule, and accent underlines. Body backgrounds stay white or `ink-50`. Body text is `ink-600`. Headings are `brand-black`. `brand-coral` and `brand-blue` exist but use them sparingly — `brand-blue` is the link color in body prose.
- **Fonts**: `font-display` (Unbounded) for h1/h2/h3, `font-sans` (Montserrat) for everything else.
- **Container**: 1200px max via `.container-site` or `max-w-site`. The article body sits inside that container at 65–75ch reading width, centered.
- **Border radius**: `rounded-pill` for chips, `rounded-2xl` for cards.

Look at `docs/design/reference/onfin-baselayout.astro` to see how the parent site assembles header/hero/footer. **You don't have to copy it pixel-for-pixel** — improve where it makes sense — but the family resemblance must be obvious.

### SEO — non-negotiable

The blog's whole point is organic traffic from search. Every design decision needs to either help or stay neutral on SEO. Specifically:

- **Single H1 per page.** Article title is the H1. Index hero is the H1.
- **Semantic landmarks.** `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`. ARIA roles only when there isn't a semantic tag for it.
- **Real `<a href>` links** for every navigation, including category filters and pagination. No "click handler" links that don't update the URL.
- **Image alt text** on cover images and any decorative imagery. Decorative images get `alt=""` plus `aria-hidden="true"`.
- **Lazy loading** on below-the-fold images. The hero/cover image of an article is `priority={true}` for `next/image`; everything else is `loading="lazy"`.
- **Don't break the JSON-LD.** Article schema is emitted in the page already. If you add BreadcrumbList JSON-LD, put it next to the existing `<script type="application/ld+json">` block.
- **Web Core Vitals.** No layout shift on font load (`display: swap` already configured). No oversized client bundles — ship server components by default, mark interactive bits `'use client'` only when needed.

### Accessibility floor

- **WCAG AA contrast.** `brand-lime` on white fails AA for text — use it on dark surfaces for type, or as a non-text accent (border, underline). For dark CTAs use brand-black on brand-lime, which passes.
- **Keyboard navigation.** Every interactive element is reachable via Tab. Focus rings are visible (a 2px lime outline is fine).
- **Skip-to-content link** at the top, visible on focus.
- **Reduced motion.** Honor `prefers-reduced-motion`: drop hover scale animations and progress-bar transitions.
- **Color is never the only signal.** Active chip state is bold + filled, not just colored.

### Responsive breakpoints

Use Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Critical breakpoints to design at:

- **375 / 414** (mobile): single column, full-bleed cover image, share rail collapses to inline buttons under the body.
- **768** (tablet): two-column post grid on the index, article still single column.
- **1024+** (desktop): post grid hits its final density. Article gets the optional sticky TOC + share rail.

---

## Components needed

You decide the file layout under `components/blog/`. A reasonable starting set:

- `PostCard.tsx` — single article tile for the index and related-posts row
- `CategoryChips.tsx` — the filter row, active state via the `?category` query
- `Breadcrumbs.tsx` — generic `Blog / Category / Title` chain, emits BreadcrumbList JSON-LD
- `AuthorByline.tsx` — small (top of article) and large (bottom of article) variants
- `TableOfContents.tsx` — generated from H2s in the article body, sticky on desktop
- `ShareRail.tsx` — Twitter/X, LinkedIn, copy-link
- `RelatedPosts.tsx` — grid of three PostCards
- `ArticleCTA.tsx` — the single bottom CTA back to onfin.io

**Server components by default.** Only `'use client'` on components that genuinely need browser state (the share rail's copy-link, the TOC's scroll-spy). Your `next/image` usage should rely on the `images.remotePatterns` already configured in `next.config.js` (Supabase + Unsplash).

---

## Reference material in this folder

- `tokens/onfin-global.css` — the parent site's `global.css`, source of the design tokens. Already imported into `app/globals.css`; this copy is here as a reference.
- `reference/onfin-baselayout.astro` — the parent site's BaseLayout (Astro) showing how onfin.io builds header/hero/footer.
- `reference/onfin-blog-index.astro` — the **previous** blog index (Astro, Hygraph-backed) on onfin.io. Useful for tone, not for layout — the goal is to do better than this.
- `reference/onfin-blog-article.astro` — the previous blog article page. Same caveat.
- `assets/logo/logo-header.svg` — header logo. Also available in `public/logo.svg` and `public/logo-dark.svg` for direct use in components.
- `assets/favicon/favicon.ico` — favicon. Already wired into `public/`.
- `content-samples/article-platform-update-sample.md` — a short, dry, "schedule notice" article (~300 words). Test that the article layout doesn't look empty at this length.
- `content-samples/article-trading-guide-sample.md` — a long, hierarchical, FAQ-having article (~2200 words). Test that the TOC, share rail, and reading flow handle the long form gracefully.
- `sitemap.md` — the route map and category list.

---

## Definition of done

- The two routes (`/en` and `/en/<slug>`) render with your components, using only tokens defined in `app/globals.css` and `tailwind.config.ts`.
- The pages pass Lighthouse SEO ≥ 95 and Accessibility ≥ 95 on the two sample articles in `content-samples/`.
- Single H1 per page; semantic landmarks throughout; all images have alt text.
- Mobile (375), tablet (768), and desktop (1280) views all read cleanly without horizontal scroll.
- Category chips actually filter (URL changes; SSR returns the filtered list).
- The short and long sample articles both render without visual holes — short ones don't look empty, long ones don't fatigue the reader.
- All interactive components are keyboard-navigable with visible focus states.
- The visual family with `onfin.io` is unmistakable on first glance — same colors, same type, same tone — but the editorial reading experience is better because that's what this site is for.

When the design is in place, hand it back to engineering to wire the live data and run a Lighthouse + manual SEO audit pass.
