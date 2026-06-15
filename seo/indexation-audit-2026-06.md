# EggCelle.com — Indexation Audit

**Property:** https://eggcelle.com/
**Date:** 2026-06-15
**Audit window:** Last 90 days (2026-03-17 → 2026-06-15), baselined against the prior 90 days
**Prepared for:** kevin@mtpurchasing.com

---

## 0. Data sources & method note

The request referenced an attached GSC Coverage export and a Screaming Frog crawl. No
files were attached to this session, so in their place I pulled **live data** from the
connected Search Atlas integrations — which is equivalent to (and fresher than) static
exports:

| Intended source | Live substitute used | What it gave us |
|---|---|---|
| GSC Coverage / Performance export | Google Search Console API (connected) | Page-level clicks, impressions, position, 90-day deltas |
| Screaming Frog crawl | Site Explorer indexed-pages crawl (53 URLs) + OTTO site audit (17 pages) | Status codes, internal-link counts (orphan detection), canonical state, on-page issues |
| — | Local repo `index.html` | On-page directives for the new `/north-carolina/` PPC landing page |

**Could not retrieve:** `robots.txt` and `sitemap.xml` — the site sits behind Cloudflare
bot protection (403) and the host is outside this environment's network allowlist. **Two
manual checks are flagged at the end** to close that gap.

---

## 1. Executive summary

EggCelle is a **small site with a large index-bloat problem.** The crawler is aware of
**53 URLs**; only **~10–12 carry any value**, and only **4 URLs earned a single click in
the last 90 days.**

| Headline metric (last 90 days) | Value |
|---|---|
| Indexed/known URLs (Site Explorer crawl) | 53 |
| — Status 200 | 43 |
| — 301 redirects | 5 |
| — 404 | 5 |
| **Orphan pages (200, zero internal links in)** | **33** |
| URLs with **any** GSC impressions | 11 |
| URLs with **any** GSC clicks | **4** |
| Total organic clicks, 90 days | **~38** (homepage 33 / faqs 2 / requirements 2 / contact 1) |
| OTTO content-quality pillar | **11 / 100 (Critical)** |

**The core problem is not Googlebot crawl exhaustion** (the site is tiny). It is that
**~75% of indexed URLs are thin, duplicate, junk, or dead**, which drags the site-quality
signal down and suppresses the handful of pages that actually rank. The best pages sit at
**position 14–20 with 2,000–3,800 impressions and ~0 clicks** — classic "Google sees the
page but ranks it just out of click range, partly because the surrounding index is low
quality" behavior.

**The fix is consolidation, not creation:** collapse ~40 low-value URLs into ~12 strong
ones, and pipe the internal links + backlinks into the 4 money pages and 2 ranking blog
posts.

---

## 2. Bucket 1 — Indexed but 0 clicks in last 90 days

Only 4 of 43 indexed (200) URLs earned a click. The zero-click set splits into two very
different tiers:

### Tier A — Zero clicks but *earning impressions* (ranking, fixable — don't delete)

| URL | Impr (90d) | Avg pos | Keywords | Recommendation |
|---|---|---|---|---|
| `/blog/how-many-times-can-you-donate-eggs/` | **3,852** | 20 | 23 | **Rewrite** — huge impression base, zero clicks. Rework title/meta for CTR, expand to push pos 20 → page 1. Highest-upside page on the site. |
| `/blog/` (blog index) | 1,053 | 4 | 1 | **Keep** — ranking pos 4 but it's an index page; ensure it lists the strong posts. |
| `/blog/can-you-donate-eggs-while-on-birth-control/` | 430 | 16 | 19 | **Rewrite** — consolidate the birth-control cluster (Bucket 2) into this URL, then expand. |
| `/privacy-policy/` | 370 | 7 | 1 | **Keep** — legal page; 0 clicks is expected. |
| `/terms-of-use/` | 180 | 8 | 1 | **Keep** — legal page. |
| `/egg-donor-testimonials/` | 1 | 2 | 1 | **Keep** — low query volume, ranks well; fine. |

### Tier B — Zero clicks *and* zero impressions (pure index bloat, ~33 URLs)

Every other 200-status URL (the `dipi_faq` singles, taxonomy/author archives, `-2`
duplicate slugs, system pages) gets **neither impressions nor clicks**. These are covered
in Buckets 2–4 and should be **Noindex / 301 / Consolidate** — see those sections for
per-URL calls.

> **Net:** ~6 zero-click URLs are keepers/fixers; the remaining ~33 are removal candidates.

---

## 3. Bucket 2 — Near-duplicate pages

The site has the same handful of topics published 3–5 times each (a legacy WordPress +
"DIPI FAQ" custom-post-type sprawl, plus a prior migration from `iffertility.com`).

### Cluster A — "Donate eggs on birth control / contraceptives" (5 URLs → 1)

| URL | Status | Internal links | Verdict |
|---|---|---|---|
| `/blog/can-you-donate-eggs-while-on-birth-control/` | 200 | 33 | **PRIMARY — Keep & expand** (ranks, 19 kw) |
| `/can-you-donate-eggs-on-birth-control-explore-options/` | 200 | 0 (orphan, last seen 2024) | **301** → primary |
| `/egg-donation/birth-control/` | 200 | 0 | **301** → primary |
| `/egg-donation/contraceptives/` | 200 | 0 | **301** → primary |
| `/blog/category/egg-donation/birth-control/` + `/contraceptives/` | 200 | 0 | **Noindex** (taxonomy archives) |

### Cluster B — "Egg donation frequency / how many times" (2 URLs → 1)

| URL | Status | Internal links | Verdict |
|---|---|---|---|
| `/blog/how-many-times-can-you-donate-eggs/` | 200 | 36 | **PRIMARY — Keep & rewrite** (ranks, 23 kw, 3,852 impr) |
| `/egg-donation-frequency/` | 200 | 0 (orphan) | **301** → primary |

### Cluster C — Exact-duplicate slug

| URL | Verdict |
|---|---|
| `/blog/dipi_faq/is-the-egg-donation-process-painful/` | Keep content, fold into FAQ hub |
| `/blog/dipi_faq/is-the-egg-donation-process-painful-2/` | **301 / delete** — the `-2` is a WordPress duplicate of the line above |

### Cluster D — The entire `dipi_faq` post type duplicates the FAQ hub

There are **~14 single-question `dipi_faq` URLs** (`/blog/dipi_faq/what-is-egg-donation/`,
`/how-much-do-you-get-for-donating-eggs/`, `/who-can-become-an-egg-donor/`,
`/what-is-the-duration-of-the-egg-donation-process/` ≈ `/how-long-does-the-egg-donation-process-take/`,
etc.). They each hold one Q&A that is **already answered on the consolidated, internally-linked
hub** `/egg-donor-faqs/` (200, 23 internal links).

> **Verdict for the whole `dipi_faq` CPT: Consolidate → `/egg-donor-faqs/` (301 each), then
> Noindex the `dipi_faq` archive + its `/page/2/`, `/page/3/` pagination.** This single action
> removes the largest duplicate cluster on the site.

---

## 4. Bucket 3 — Thin content (<300 words, no unique value)

These return 200 but carry little or no standalone content:

| URL / pattern | Why it's thin | Recommendation |
|---|---|---|
| `/blog/dipi_faq/*` (≈14 single-question pages) | One Q&A each (~50–150 words) | **Consolidate** → `/egg-donor-faqs/` |
| `/blog/dipi_faq/page/2/`, `/page/3/` | Paginated archive, no unique copy | **Noindex** |
| `/author/test/`, `/author/kryaniffertility-com/` | WP author archives (test + migrated user) | **Noindex** |
| `/category/uncategorized/`, `/blog/category/egg-donation/*` | Taxonomy archives, thin/duplicative | **Noindex** |
| `/donor-education-team/kryaniffertility-com/` | Team-member stub | **Noindex** (or expand if real bio) |
| `/22988292-2/` | Auto-generated numeric slug stub (2024) | **301 → /** or 410 |
| `/404-error-page/` | "404" page returning **200** (soft 404) | **Noindex** + serve real 404 |
| `/dipi_popup_maker/end/` | Popup-plugin system URL | **Noindex** (ideally `Disallow`) |
| `/cdn-cgi/l/email-protection` | Cloudflare email-obfuscation endpoint | **Noindex/Disallow** — should never be indexable |
| `/egg-donor-home/` | Old homepage variant (orphan, 2024) | **301 → /** |

---

## 5. Bucket 4 — Orphan pages (0 internal links in)

**33 of 43 live pages are orphans** (status 200, zero internal links pointing to them).
That is the single most striking number in the crawl: only **10 pages** have any internal
links at all.

**The 10 internally-linked ("real") pages:**
`/` (24) · `/egg-donation/` (25) · `/blog/how-many-times-can-you-donate-eggs/` (36) ·
`/blog/can-you-donate-eggs-while-on-birth-control/` (33) · `/blog/` (24) ·
`/egg-donor-faqs/` (23) · `/egg-donor-requirements/` (19) · `/contact-us/` (18) ·
`/egg-donor-testimonials/` (18) · `/terms-of-use/` (6)

**Orphan handling:**

| Orphan | Recommendation |
|---|---|
| `/privacy-policy/` (370 impr, legal) | **Keep + add footer link.** ⚠️ See note below — the live URL is `/privacy-policy/`, but the new PPC page links to `/privacy`. |
| All Bucket 2/3 orphans (dup/thin/junk) | They are orphaned *because* they are junk → **Noindex / 301** as specified above; no need to add links. |
| `http://eggcelle.com/` (301, **29 backlinks / 19 ref domains**) | **Keep the 301 to HTTPS** — it's already correct; just confirm it stays 301 so that link equity passes. |

> ⚠️ **Footer link mismatch:** the new PPC landing page (`index.html`) footer links to
> `/privacy` and `/terms`, but the live, ranking pages are `/privacy-policy/` and
> `/terms-of-use/`. Those footer links likely 404. Fix the hrefs.

---

## 6. Bucket 5 — Canonical conflicts & noindex mismatches

| Issue | Detail | Recommendation |
|---|---|---|
| **Self-canonicals on duplicates** | OTTO deployed *self-referential* canonicals on `/egg-donation/birth-control/`, `/egg-donation/contraceptives/`, `/egg-donation-frequency/`. This **locks the duplicates into the index** instead of consolidating them. | **Repoint canonical** to the primary URL (Bucket 2) **or 301.** This is the most important canonical fix. |
| **Homepage canonical normalization** | Was `https://eggcelle.com` (no trailing slash); actual is `https://eggcelle.com/`. Already normalized. | **Keep** (resolved) — just verify it stays consistent. |
| **Soft 404** | `/404-error-page/` returns 200. | Serve a true 404 / **Noindex**. |
| **Stale 404s still in the crawl** | `/22992604-2/`, `/blog/dipi_faq/what-is-the-screening-process-for-egg-donors/`, `/donor-education-team/eggcelle-donor-education-team/`, `/locations.kml`, `/practice/` | Confirm hard **404/410** (they already 404) and remove from sitemap. |
| **PPC page noindex + canonical** (`/north-carolina/`, repo `index.html`) | Page is `noindex, follow` **and** sets a self-canonical. Combining `noindex` with `rel=canonical` sends mixed signals to Google. For a PPC LP, **noindex is the correct choice** (keeps the thin/duplicate LP out of organic). | **Keep noindex; drop the canonical tag** (or leave it — low priority). No conflict with organic strategy. |

---

## 7. Bucket 6 — Parameterized URLs bloating the index

**Finding: there is no query-parameter bloat.** Zero of the 53 crawled URLs contain a `?`
parameter. The PPC page handles `gclid` / `utm_*` **client-side in JavaScript**
(`index.html`), so attribution params never become crawlable URLs — that's correct and
worth preserving.

**However, the *equivalent* bloat exists in path form** — WordPress is generating
crawlable junk paths instead of params:

- Custom-post-type archives: `/blog/dipi_faq/` (+ `/page/2/`, `/page/3/`)
- Taxonomy archives: `/category/uncategorized/`, `/blog/category/egg-donation/…`
- Author archives: `/author/test/`, `/author/kryaniffertility-com/`
- Auto-generated `-2` duplicate slugs

**Recommendation:** treat these exactly like parameter bloat — **Noindex** the archive
types (Yoast/RankMath: noindex CPT archives, author archives, and date/category archives
you don't use) and **Disallow** system paths (`/cdn-cgi/`, `/dipi_popup_maker/`) in
robots.txt. Pre-empt future *real* param bloat (faceted search, session IDs) with a
canonical + robots rule now, since the deprecated GSC parameter tool is no longer an option.

---

## 8. Crawl-budget & index-quality impact

For a 53-URL site, **Googlebot crawl capacity is not the binding constraint** — index
*quality* is. The mechanism that's hurting EggCelle:

1. **Thin-content ratio.** ~75% of indexed URLs are thin/dup/junk. Google's site-level
   quality assessment is dragged down (OTTO Content pillar = **11/100**), which caps how
   well the *good* pages can rank — hence 2,000–3,800 impressions stuck at position 14–20
   with ~0 clicks.
2. **Diluted internal PageRank.** Link equity is spread thin; the 2 ranking blog posts and
   4 money pages should be receiving the equity currently leaking into 33 orphans and dup
   clusters.
3. **Wasted recrawl.** Each weekly crawl re-fetches ~40 dead/dup/thin URLs.

**Projected impact of the cleanup:**

| Metric | Now | After cleanup | Change |
|---|---|---|---|
| Indexable (200) URLs | 43 | ~12 | **−72%** |
| Orphan pages | 33 | ~1 (privacy) | **−97%** |
| Duplicate clusters | 4 active | 0 | consolidated into 2 primaries |
| Crawl requests spent on low-value URLs | ~40 / cycle | ~0 | redirected to money pages |
| Backlink equity reclaimed | — | 29 (http) + cluster links | piped to homepage & 2 ranking posts |

**Expected outcome:** a leaner ~12-URL index, a materially higher content-quality signal,
and the 2 ranking blog posts (currently pos 16–20, ~4,300 combined impressions, 0 clicks)
positioned to break onto page 1.

---

## 9. Consolidated action plan (priority order)

| # | Action | Bucket | Method | Effort |
|---|---|---|---|---|
| 1 | **Noindex the entire `dipi_faq` CPT + archives + author/category/uncategorized archives** | 3, 6 | Yoast/RankMath noindex | Low |
| 2 | **301 the birth-control cluster (4 URLs) → `/blog/can-you-donate-eggs-while-on-birth-control/`** | 2 | 301 redirects | Low |
| 3 | **301 `/egg-donation-frequency/` → `/blog/how-many-times-can-you-donate-eggs/`** | 2 | 301 | Low |
| 4 | **301 `dipi_faq` single Q&As → `/egg-donor-faqs/`** | 2, 3 | 301 | Med |
| 5 | **Repoint self-canonicals on the 3 thin `/egg-donation/*` pages to their primaries** (or 301) | 5 | Canonical / 301 | Low |
| 6 | **Rewrite titles/meta + expand** the 2 high-impression zero-click blog posts | 1 | Content | Med |
| 7 | **Fix footer links** `/privacy` → `/privacy-policy/`, `/terms` → `/terms-of-use/` | 4 | HTML edit | Low |
| 8 | **301 `/egg-donor-home/` and `/22988292-2/` → `/`**; serve a real 404 for `/404-error-page/` | 3, 5 | 301 / 404 | Low |
| 9 | **Disallow** `/cdn-cgi/`, `/dipi_popup_maker/` in robots.txt | 6 | robots.txt | Low |
| 10 | **Rebuild sitemap** to contain only the ~12 canonical, indexable URLs; resubmit in GSC | all | Sitemap | Low |

---

## 10. Two manual checks to close the data gap

robots.txt and sitemap.xml could not be fetched (Cloudflare 403 + network allowlist).
Please verify:

1. **robots.txt** — confirm `/cdn-cgi/` and `/dipi_popup_maker/` are disallowed and that
   nothing important is blocked; confirm the `Sitemap:` directive points to a clean sitemap.
2. **sitemap.xml** — confirm it does **not** list the `dipi_faq` singles, taxonomy/author
   archives, 404s, or `-2` duplicate slugs. After the cleanup it should contain only the
   ~12 canonical URLs.

---

*Legend — recommendation verbs: **Consolidate** (merge content + 301 into one canonical URL),
**Rewrite** (keep URL, improve content/metadata), **Noindex** (keep page, remove from index),
**301** (permanent redirect), **Keep** (no action / already correct).*
