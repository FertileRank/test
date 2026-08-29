# Measured results

Every number on this page was measured, not projected. Where a figure is an
estimate produced by a tool, it says so and names the tool.

## How these runs were done

| | |
|---|---|
| Tool | Lighthouse 12.8.2, mobile form factor, simulated throttling |
| Browser | Chromium 1194 headless |
| BEFORE | the unmodified Website Studio export, served over HTTP with no `Content-Encoding` — which is exactly how it ships today, because `_headers` sets none |
| AFTER | `dist/` from `node build/sync.mjs`, served the way the generated `_headers` says production will: `.br` negotiated by `Accept-Encoding`, `/assets/*` `immutable`, HTML `must-revalidate` |
| Page | `/` |
| Raw data | `scratchpad/lh-mobile.json` (before), `scratchpad/lh-after-prod.json` (after) |

**One caveat that applies to both runs.** The sandbox cannot reach
`media.cdn.builder.searchatlas.com`, `www.googletagmanager.com`,
`dashboard.fertilerank.com` or `api.builder.searchatlas.com`. Fonts, the hero
images, GTM and the Search Atlas scripts therefore fail to load in *both* runs.
Real-world third-party cost is additional to everything below and is not
measured here. Because the same hosts are blocked on both sides, the comparison
is still fair — but no figure here should be read as a prediction of the live
site's absolute score.

## Category scores

| Category | Before | After |
|---|---:|---:|
| Performance | 99 | **100** |
| Accessibility | 91 | **100** |
| Best Practices | 96 | 96 |
| SEO | 92 | **100** |

## Metrics

| Metric | Before | After | Change |
|---|---:|---:|---|
| First Contentful Paint | 1.7 s | **0.9 s** | −47% |
| Largest Contentful Paint | 1.8 s | **1.2 s** | −33% |
| Speed Index | 1.7 s | **0.9 s** | −47% |
| Time to Interactive | 3.1 s | **1.6 s** | −48% |
| Total Blocking Time | 30 ms | **10 ms** | −67% |
| Cumulative Layout Shift | 0.005 | **0** | eliminated |
| Main-thread work | 1.2 s | **0.5 s** | −58% |
| Script bootup time | 0.1 s | **0.0 s** | — |
| DOM elements | 903 (failing) | **594 (passing)** | −34% |
| Total byte weight | 213 KiB | **33 KiB** | −85% |

## Main-thread breakdown

This is the table that explains why the header had to be server-rendered. The
export's bottleneck was never slow JavaScript — Script Evaluation was 123 ms
against 562 ms of Style & Layout. The cost was recomputing 30 KB of blocking CSS
against 207 nodes the HTML parser never saw, because `mega-menu.min.js` built
them at runtime.

| Bucket | Before | After |
|---|---:|---:|
| Style & Layout | 562 ms | **332 ms** |
| Other | 349 ms | 211 ms |
| Script Evaluation | 123 ms | **58 ms** |
| Rendering | 66 ms | — |
| Parse HTML & CSS | 60 ms | 59 ms |

*(the AFTER column is from the `no-store` dev-server run, which is the only run
where both breakdowns were captured under identical caching; the
production-like run reports 0.5 s total.)*

## Audits that flipped from failing to passing

| Audit | Before | After |
|---|---|---|
| `uses-text-compression` | fail — est. savings of 140 KiB | **pass** |
| `unused-css-rules` | fail — est. savings of 15 KiB | **pass** |
| `render-blocking-resources` | fail — est. savings of 380 ms | **pass** |
| `dom-size` | fail — 903 elements | **pass** — 594 |
| `link-text` (SEO) | fail | **pass** |
| `heading-order` | fail | **pass** |
| `aria-allowed-attr` | fail | **pass** |
| `aria-progressbar-name` | fail | **pass** |
| `label-content-name-mismatch` | fail | **pass** |
| `color-contrast` (service pages) | fail | **pass** |

## Structured data and internal consistency

Lighthouse does not score any of this, so none of it appears in the tables above
— but it is what the Global Sync architecture exists to guarantee. Measured by
parsing every `application/ld+json` block in all 21 pages on both sides.

| | Before | After |
|---|---:|---:|
| Pages with no JSON-LD at all | 1 (`/404/`) | **0** |
| Pages **defining** the `#organization` `@id` | 3 | **21** |
| Pages **referencing** it | 18 | 21 |
| **Dangling references** — reference it, never define it | **15** | **0** |
| Distinct `@type` shapes on that one `@id` | 2 (`Organization+ProfessionalService`, `Organization+LocalBusiness`) | **1** |
| Pages carrying a `WebSite` node | 0 | **21** |
| Pages carrying a `WebPage` node | 11 | **20** |
| `BreadcrumbList` trails at the correct depth | 8 of 20 | **19 of 19** |

The breadcrumb row is the clearest illustration. Every service detail page
shipped a trail that skipped its own parent — `Home › Laboratory Solutions › GPO
Purchasing`, with no `/services/` tier. All twelve now walk the parent pointer:
`Home › Services › Lab Solutions › GPO Purchasing`.

The home page deliberately has **no** `BreadcrumbList` after the rebuild. The
export shipped a one-item stub there, which the SEO audit flagged as incorrect —
a breadcrumb listing only the current page carries no information. `/404/` is
likewise excluded.

`sitemap.xml` and `llms.txt` now list the same 20 URLs and both exclude `/404/`.
They agreed before too, but by luck, from three independent generators; they now
agree by construction, from one array.

## What a visitor actually downloads on first load

Measured on `/`, first-party only.

| | Before | After |
|---|---:|---:|
| Document | 88,297 B | 16,323 B br |
| `fonts.css` (render-blocking) | 6,688 B | inlined — 0 requests |
| `mega-menu.css` (render-blocking) | 30,074 B | split — see below |
| `mtfs-images.css` (render-blocking) | 3,128 B | merged |
| `site.<hash>.css` (async) | — | 5,141 B br |
| `mega-menu.min.js` | 29,331 B | replaced |
| `nav.<hash>.js` | — | 4,695 B br |
| `analytics.<hash>.js` | — | 6,163 B br |
| `book-consultation-modal.min.js` | 58,472 B | lazy — 0 B on load |
| `consult-modal.<hash>.js` (loader) | — | 3,027 B br |
| **Total on the wire** | **215,990 B** | **35,349 B** |

**83.6% less over the wire with brotli, 80.7% with gzip.**

- Render-blocking stylesheets: **3 → 0**
- JS bytes before first interaction: **87,803 B → 7,722 B** (−91%)

## Whole-deploy compression

Nothing in the export is pre-compressed and `_headers` sets no
`Content-Encoding`, so its raw bytes are its wire bytes. The build now writes a
`.br` and a `.gz` beside every compressible file.

| | Raw | Brotli | Gzip |
|---|---:|---:|---:|
| 35 files in `dist/` | 1,798,316 B | **363,838 B** | 431,011 B |

Saved: 1,434,478 B brotli / 1,367,305 B gzip.

## Page-level output

Raw HTML per page barely moves (−0.9% site-wide) and several pages grow. That is
expected and is not a regression:

- every page gains a real server-rendered `<header>`, `<nav>`, `<main>` and
  `<footer>` — roughly 13 KB of markup that used to be built by JavaScript;
- every page gains its critical CSS inline, which is what removes all three
  render-blocking stylesheets;
- `/404/` grows 55% because it previously had no site chrome at all.

What shrinks is what crosses the wire, because the raw HTML is now
brotli-compressed where before it was not. Compare 88,297 B raw for `/` before
against 16,323 B br after.

## Still open

| Item | Detail |
|---|---|
| `max-potential-fid` 90 ms | The only failing performance audit. |
| `errors-in-console` | `ERR_TUNNEL_CONNECTION_FAILED` against the four blocked third-party hosts. Present in the BEFORE run too. The four `/src/lib/*.ts` 404s the export produced are gone. |
| No JS minifier | The pipeline deliberately carries no npm dependencies, so nothing renames identifiers. `nav.js` is 1,646 B brotli against the audit's 1,300 B target, `analytics.js` 3,304 B against 1,000 B. Adding a minifier to the deploy step would close the gap; the structural work (search overlay and modal off the critical path) is already done. |
| Inline critical CSS averages 28.7 KB/page | Above the ~14 KB first-RTT guideline. It buys 3 → 0 render-blocking stylesheets, which is the better trade, but tightening `splitCritical`'s allow-list would improve it further. |
| 18 unreferenced files in `/assets/404/` | ~230 KB of the export's separate 404 bundle, dead now that `/404/` uses the shared chrome. The build reports them rather than deleting them; removing the passthrough is a one-line change once a human confirms. |
