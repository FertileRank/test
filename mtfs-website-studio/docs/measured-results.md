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
| Time to Interactive | 3.1 s | **1.7 s** | −45% |
| Total Blocking Time | 30 ms | 30 ms | **no change** |
| Cumulative Layout Shift | 0.005 | **0** | eliminated |
| Main-thread work | 1.2 s | **0.6 s** | −50% |
| Script bootup time | 0.1 s | **0.0 s** | — |
| DOM elements | 903 (failing) | **595 (passing)** | −34% |
| Total byte weight | 213 KiB | **36 KiB** | −83% |

> **Correction.** An earlier revision of this document reported TBT 10 ms, TTI
> 1.6 s, main-thread 0.5 s, DOM 594 and 33 KiB. Those came from a `dist/` that
> had been built before `src/assets/js/book-consultation-modal.js` existed, so
> the served page carried no `consult-modal.js` loader tag and the browser
> fetched one fewer deferred script than a correct build does. The numbers above
> are from a clean build of the current tree, verified to contain the loader
> (`200 · 3,305 B · consult-modal.f64fcb9e.js` in the network log).
>
> The honest consequence is that **Total Blocking Time did not improve** — it is
> 30 ms before and after. The earlier 10 ms was an artefact of the missing
> script. TBT was already passing comfortably at 30 ms, and nothing in this
> refactor targeted it; the wins are in paint, interactivity and bytes.

**Reproducibility.** Two consecutive builds from an unchanged tree produce
byte-identical output — `diff -rq` over the full `dist/` reports zero differing
paths, `.br` and `.gz` siblings included. That is what makes a stale build
detectable at all, and it is why `routes.mjs` and `render.mjs` contain no `Date`
or `Math.random` and why `copyrightYear` is a manifest literal.

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
production-like run reports 0.6 s total.)*

## Audits that flipped from failing to passing

| Audit | Before | After |
|---|---|---|
| `uses-text-compression` | fail — est. savings of 140 KiB | **pass** |
| `unused-css-rules` | fail — est. savings of 15 KiB | **pass** |
| `render-blocking-resources` | fail — est. savings of 380 ms | **pass** |
| `dom-size` | fail — 903 elements | **pass** — 595 |
| `link-text` (SEO) | fail | **pass** |
| `heading-order` | fail | **pass** |
| `aria-allowed-attr` | fail | **pass** |
| `label-content-name-mismatch` | fail | *notApplicable* — see below |
| `aria-progressbar-name` | fail | *notApplicable* — see below |
| `color-contrast` | fail on service pages (passed on `/`) | measured per page |

**`notApplicable` is not the same as `pass`, and this table should not pretend
otherwise.** Both of those audits now return `notApplicable` because no element
matching them remains in the served page — the consultation wizard that carried
the unnamed `role="progressbar"` and the mismatched button label is lazy-loaded,
so Lighthouse never sees it. That is the intended outcome, and the underlying
defects *are* fixed in `src/assets/js/book-consultation-modal.js`
(`aria-pressed` → `aria-selected` on the six `role="option"` buttons,
`aria-label="Consultation form progress"` on the track). But the audits resume
the moment the wizard is on the page, so the fix is verified by reading the
module, not by this score.

Worth stating for the same reason: lazy-loading alone would **not** have cleared
them. The home page instantiates the same wizard eagerly in `#hero-form-card`, so
the fixes inside the modal source are what do the work.

`color-contrast` failed on the service-page template and already passed on `/`,
so the single-page table above cannot represent it. See the sweep below.

## Site-wide sweep — the gains are not a one-page result

Everything above is `/`. To check the refactor generalises, five representative
templates were run through the same before/after harness.

| Template | Before P/A/BP/SEO | After P/A/BP/SEO | FCP | TTI |
|---|---|---|---|---|
| `/` | 99 / 91 / 96 / 92 | **100 / 100 / 96 / 100** | 1.7 → **0.9 s** | 3.0 → **1.5 s** |
| `/services/lab-solutions/gpo-purchasing/` | 99 / 88 / 96 / 92 | **100 / 95 / 96 / 100** | 1.6 → **0.7 s** | 2.9 → **1.1 s** |
| `/contact/` | 99 / 88 / 96 / 100 | **100 / 100 / 96 / 100** | 1.7 → **1.1 s** | 3.0 → **1.5 s** |
| `/privacy-policy/` | 99 / 88 / 96 / 100 | **100 / 100 / 96 / 100** | 1.7 → **0.9 s** | 3.0 → **1.2 s** |
| `/404/` | 99 / 91 / 96 / 69 | **100 / 100 / 96 / 69** | 1.5 → **0.8 s** | 1.9 → **1.4 s** |

Performance reaches 100 on every template and FCP and TTI improve on every one.
Two rows need explaining rather than glossing.

### `/404/` SEO stays at 69 — and should

The only failing SEO audit is `is-crawlable: Page is blocked from indexing`. A
404 page *ought* to be `noindex`; the export marked it `noindex, follow` and the
manifest keeps that. Lighthouse scores the page as a document without knowing it
is an error page. **Do not "fix" this.** Making `/404/` indexable to win 31
points would put a soft 404 in the index.

### The service template reaches 95 on accessibility, not 100

One `color-contrast` failure survives, and it is a real defect this refactor did
**not** fix:

```
div.hero-stat-card > div.il5 > div > p.il8
contrast 2.26  —  foreground #9aada9 on background #fdfafa at 9.6pt
```

That is the `--g400` grey used as caption text under the hero stat cards. It
fails WCAG AA. It is body-content styling, and the pipeline deliberately does not
restyle body content, so it is reported rather than silently changed. Fixing it
means darkening that one caption colour — `--g600` (`#5c524b`) clears AA at that
size.

What the refactor *did* fix on that template is worse than what remains. The
export had four contrast failures there; three were footer links rendering
`#ffffff` on `#fdfafa` — **contrast ratio 1.03, white on white, effectively
invisible**:

```
div.ftc > ul.il29 > li.il30 > a.il31
contrast 1.03  —  foreground #ffffff on background #fdfafa at 10.6pt
```

Those were three links to `/services/management-services/marketing/`,
`/call-center/` and `/accounting-finance/`. They are fixed because the
server-rendered footer uses `.mtfs-footer` with real declarations instead of the
builder's per-page `il29`/`il30`/`il31` classes, whose meaning shifted from page
to page — the exact hazard `css.mjs::dedupe()` refuses to hoist.

## Semantic markup and accessibility

Counted across all 21 pages of the export and all 21 pages of `dist/`.

| Check | Before | After |
|---|---:|---:|
| Pages with no `<header>` | 21 | **0** |
| Pages with no `<nav>` | 20 | **0** |
| Pages with no `<main>` | 18 | **0** |
| Pages with no skip link | 18 | **0** |
| Pages where the skip link precedes the header | 3 | **21** |
| `"Learn More"` links | 26 | **0** |
| Footers opening at `<h4>` | 21 | **0** |
| `<div class="breadcrumb">` with literal `/` text nodes | 14 | **0** |
| GTM `<noscript>` iframe with no `title` | 21 | **0** |
| Redundant implicit `role` attributes | 28 | **0** |
| **Unlabelled `<section>` elements** | **111** | **111** |

The skip-link row is the one worth dwelling on. Three pages had a skip link
and it was useless on all three: `mega-menu.js` inserted the header with
`insertAdjacentHTML('afterbegin', …)`, placing it *before* the skip link in the
DOM, so the first ten tab stops were the logo, four nav items, the phone link,
the search button, the CTA and the hamburger — and only then "Skip to main
content", which by that point skipped nothing. Lighthouse reported `skip-link` as
`notApplicable`, so it never showed up as a failure. Server-rendering the chrome
puts the skip link first on all 21 pages.

**Not fixed: 111 unlabelled `<section>` elements.** A `<section>` with no
accessible name is not exposed as a `region` landmark, so it buys nothing over a
`<div>`. This is body content, and the pipeline deliberately does not rewrite
body copy or structure beyond the specific audit fixes, so it is left alone.
It is not a Lighthouse failure — accessibility scores 100 — but it is an
unrealised opportunity, worst on `/terms-of-service/` (22) and
`/privacy-policy/` (17). Labelling them from each section's own heading would be
a safe mechanical pass; it is deliberately out of scope here.

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

## `llms-full.txt` fidelity

The content audit found the export's `llms-full.txt` was not an accurate mirror
of the pages: its generator walked headings and paragraphs and dropped several
element types wholesale, so it omitted precisely the facts an AI system would
want to cite while faithfully reproducing the site's contradictions. It is
regenerated now by `artifacts.mjs::htmlToMarkdown` from the same `<main>` content
the page renders.

Counted by grepping both files for the specific values the audit named:

| Probe | Before | After |
|---|---:|---:|
| Inline Markdown links | **0** | **35** |
| GPO tile `$0 Cost to Join` | 0 | 2 |
| Marketing tile `+185%` | 0 | 1 |
| Marketing tile `3.2x` | 0 | 1 |
| `/about/` timeline year 2008 | 0 | 2 |
| `/about/` timeline year 2012 | 0 | 2 |
| `/about/` timeline year 2016 | 0 | 2 |
| `/about/` timeline year 2020 | 1 | 3 |
| `300+` practices | 3 | 6 |
| `1,800+` contracts | 7 | 9 |
| `10% - 50%` savings | 2 | 3 |
| Testimonial attribution "Gerson" | 1 | 2 |
| Testimonial attribution "Westchester County Medical Society" | 2 | 3 |

No probe went down. 111,936 B → 140,184 B, which is the recovered content.

The zero-links row is the important one. The old corpus encoded no internal link
graph at all — every "Continue exploring" block degraded from real `<a href>`
elements to plain bullets. The timeline rows matter for the same reason: a model
reading the old file could not tell what year the GPO launched, because all six
milestone years had been stripped.

**This changes nothing for Google.** Google Search ignores `llms.txt` and
`llms-full.txt`. The file is published for third-party AI crawlers and as a
plain-text mirror for review, and its own header says exactly that. The reason to
fix it is that a partial mirror is worse than none — a crawler treats its silence
as absence.

### Converter quality

`htmlToMarkdown` was run over all 21 built pages and the output checked
programmatically for the failure modes a naive tag-stripper produces:

| Check | Result |
|---|---|
| Pages converted | 21 |
| Total Markdown | 138,122 B |
| Inline links preserved | 383 |
| Leftover HTML tags | **0** |
| Undecoded entities (`&amp;`, `&nbsp;`, `&#39;`…) | **0** |
| Empty headings | **0** |
| Runs of 4+ blank lines | **0** |
| Pages without exactly one `#` H1 | **0** |

Because the same function feeds `llms-full.txt` and the `content/` mirror, the
two cannot disagree with each other or with the page.

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
