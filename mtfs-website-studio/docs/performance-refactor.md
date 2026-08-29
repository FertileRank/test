# Performance refactor — evidence, cause, fix

One section per measured bottleneck in `BRIEF.md`. Each gives the evidence with its real numbers,
the root cause, the specific fix, the build pass that implements it, and the expected effect on
Main Thread Work, JS Execution Time, the Critical Rendering Path and compression.

---

## 0. Read this before any number in this document

**The Lighthouse baseline was measured against the export with third-party hosts unreachable.**

The run is Lighthouse 12.8.2, mobile, against the exact export in a sandbox where
`www.googletagmanager.com`, `dashboard.fertilerank.com` and `media.cdn.builder.searchatlas.com`
could not be reached. Three consequences follow, and they all point the same way:

1. **GTM cost zero.** `GTM-MKTJCBZG` was the first element inside `<head>`, synchronous. In the
   measurement it failed to connect and executed nothing. In production it loads a tag manager and
   whatever containers it carries. That cost is real, unmeasured here, and additive.
2. **The Search Atlas `dynamic_optimization.js` cost zero**, for the same reason.
3. **The image CDN was unreachable**, which changes which element wins LCP. Lighthouse recorded
   the LCP element as `section.hero > div.hero-inner > div.hero-copy > h1#h1` — a **text** node in
   Sora. With images loading, an image could win instead. This is why the `preload-lcp` pass
   decides from each page's own above-the-fold content and emits **at most one**
   `fetchpriority=high` preload, rather than hard-coding the font everywhere.

So: **Perf 99 is a ceiling, not a description of the live site.** Real-world third-party cost is
additional and unmeasured. Nothing in this document projects a post-fix Lighthouse score. Re-measure
after deploy, ideally twice — once in the same sandboxed conditions to compare like with like, and
once with third parties reachable to see the truth.

**Measured baseline (Lighthouse 12.8.2, mobile, export, third parties unreachable):**

```
Performance 99 · Accessibility 91 · Best Practices 96 · SEO 92
FCP 1.7 s · LCP 1.8 s · TBT 30 ms · CLS 0.005 · TTI 3.1 s
main thread 1.2 s · 903 DOM elements · max DOM depth 15
Main-thread breakdown:  Style & Layout 561.6 ms · Script Evaluation 122.9 ms
                        Script Parse & Compile 22.5 ms
bootup-time, mega-menu.min.js: 78.7 ms total / 17.5 ms scripting / 3.1 ms parse-compile
Failing audits: link-text (0) · heading-order (0) · label-content-name-mismatch (0)
                aria-allowed-attr · aria-progressbar-name · errors-in-console
```

Every "measured" number below is either from that run, from the four audits in `docs/audit/`, or
from this repo's own build output. Every "projected" number is labelled as such.

---

## 1. Render-blocking CSS — est. 380 ms

**Evidence (measured).** Three blocking `<link rel=stylesheet>` in `<head>`:

| File | Bytes | Blocking time |
| --- | --- | --- |
| `/assets/mega-menu.css` | 30,074 | 602 ms |
| `/assets/mtfs-images.css` | 3,128 | 302 ms |
| `/assets/css/fonts.css` | 6,688 | 152 ms |

Lighthouse's `render-blocking-resources` estimates 380 ms of savings across the three.

**Root cause.** Three separate sheets, each discovered by the parser and each blocking first paint,
none of them split by what the first viewport actually needs.

**Fix.** Zero render-blocking stylesheets. The `inline-critical-css` pass replaces the page's
`<style>` blocks and the three `<link>`s with:
- an inline `<style id="mtfs-critical">` containing all 14 `@font-face` blocks + the shared
  critical CSS + this page's own critical slice, and
- `<link rel="stylesheet" href="/assets/site.<hash>.css" media="print" data-mtfs-async>` with a
  `<noscript>` fallback carrying the same href.

`fonts.css` is inlined and its `<link>` deleted: 6,688 B raw, but only 460 B brotli, and it buys
back 152 ms of the measured 380 ms. All 14 `@font-face` blocks are kept — **not** collapsed into 4
with `font-weight: 400 700` ranges, because the same physical woff2 backs four weights and a range
would make the browser synthesise bold if the file is static rather than variable.

`mtfs-images.css`'s CLS-critical subset (the `.mtfs-media` base rule, `.mtfs-media img`, and the
five aspect-ratio declarations — 528 B minified) is promoted into the inline block so image boxes
are reserved before the CDN resolves. The remaining 1,930 B of below-fold grid layout goes into the
async sheet. That removes a third render-blocking request while **strengthening** CLS protection.

**Critical to get right:** the header's hidden states live only in CSS.
`.mm-panel { visibility:hidden }`, `.mm-burger { display:none }`, `.mm-back-to-top { visibility:hidden }`,
`.mm-mobile-scrim`, `.mm-search-overlay`, and the entire `@media (max-width:1180px)` off-canvas
drawer **closed state** are all pinned into the inline block as exact matches. Server-rendering the
header with any of those deferred paints all three mega panels expanded in flow — 144 elements, 12
service links with icons and blurbs — and then snaps. `splitCritical()` recurses into `@media`
groups precisely so the drawer's closed state can be critical while its open state is not.

**Pass:** `inline-critical-css` (7), fed by `css.mjs::splitCritical` + `dedupe` + `hashName`.

**Effect.** CRP: **3 render-blocking requests → 0** (measured in the output). Main thread: removes
the parse-and-apply of 39,890 B of blocking CSS from the critical path. The cost is a larger
document: the inline block measures **36,697 B raw / 6,413 B brotli on `/`**, and averages
**28,744 B across all 21 pages**. That trade is deliberate and it nets out well — see §13.

---

## 2. Unused CSS — 15,335 B of 30,074 B (51 %) of mega-menu.css

**Evidence (measured).** Lighthouse `unused-css-rules`: 15,335 B of 30,074 B unused on the home
page. The payload audit attributed every rule in all 1,248 lines and found that number maps almost
exactly onto **search overlay 8,135 B + mega panels 6,563 B = 14,698 B**.

**Root cause.** This is a *splitting* problem, not a deletion problem. Those rules are unused **at
load** and needed **on interaction**. Because the SSR header emits the same class names, SSR
deletes almost nothing.

**Fix.** Split three ways:
- **Critical, inline** — tokens/globals, header shell, logo, nav geometry, right CTA cluster,
  burger, the four hidden-by-default base rules, the whole `@media (max-width:1180px)` closed state.
- **Deferred async sheet** — panel grids and items, `.mm-panel.mm-open`,
  `.mm-back-to-top.mm-visible`, the mobile open-state rules, the site-wide design-system block.
- **Shipped with `search.js`** — the 8,135 B of search-overlay CSS, injected on first open. It is
  27.0 % of `mega-menu.css` and no visitor who never opens search should download it.

The only genuinely dead group is the four-selector block at `mega-menu.css:1155-1158`
(`.mm-injected nav.nav`, `.mm-injected header[role=banner]:not(.mm-header)`, `.mm-injected #hdr`,
`.mm-injected #nav.nav`), which hides "legacy" navs that do not exist — there are **0 `<nav>`
elements in 20 of 21 pages**. Deleted, along with the `classList.add('mm-injected')` calls.

**Pass:** `inline-critical-css` (7).

**Effect (measured, this build).** 263,861 B of page `<style>` harvested across 61 blocks;
`dedupe()` hoisted 15,845 B into one shared, content-hashed, year-cached sheet;
`/assets/site.<hash>.css` = **28,111 B minified / 5,141 B brotli**, non-blocking.

---

## 3. No text compression — est. 140 KiB

**Evidence (measured).** Nothing was pre-compressed and `_headers` set no `Content-Encoding`.
Lighthouse `uses-text-compression` wasted bytes: document 64,304 · `book-consultation-modal.min.js`
25,882 · `mega-menu.css` 23,785 · `mega-menu.min.js` 20,798 · `fonts.css` 6,108 ·
`mtfs-images.css` 2,179.

**Root cause.** A static export with no compression step and a `_headers` file that never mentioned
encoding. Compounding it, `llms-full.txt` (112,391 B) matched no `_headers` rule at all.

**Fix.** `compress.mjs::precompress(dir, exts)` writes `.gz` (gzip level 9) and `.br` (brotli
quality 11, with `BROTLI_PARAM_SIZE_HINT`) beside every `.html/.css/.js/.txt/.xml/.json`, including
`llms-full.txt`. `headersFile()` emits a `/*` catch-all beneath the asset rules so the 20 pretty-URL
documents are covered — the export's `/*.html` rule matched **none** of them, since `/about/` does
not end in `.html`.

**Pass:** step 11 of `sync.mjs`, plus `artifacts.mjs::headersFile`.

**Effect (measured, this build — not the Lighthouse estimate).**

```
36 files · 1,839,662 B raw → 373,368 B brotli   (1,466,294 B saved, 79.7 %)
                           → 442,103 B gzip     (1,397,559 B saved)
```

The Lighthouse "est. 140 KiB" figure describes the export's home-page request set. The two lines
above are this build's own whole-site measurement. They are different quantities; do not add them
or restate one as the other.

---

## 4. Navigation is 100 % client-side injected

**Evidence (measured).** `/assets/mega-menu.min.js` (29,331 B) calls
`document.body.insertAdjacentHTML('afterbegin', HEADER_HTML)`. Evaluating its markup builders
produces **13,725 B of HTML and 207 elements** — the `<header>` alone is 11,830 B / 179 elements
(lab panel 4,183 B / 62 els, management panel 4,083 B / 62 els, about panel 1,190 B / 20 els), plus
scrim, back-to-top and search overlay, with 25 inline `<svg>` and 25 `<path>` nodes. Verified across
the export: **0 `<header>` and 0 `<nav>` elements in 20 of 21 pages** (the only `<nav>` is the
sitemap's breadcrumb). Lighthouse attributes max DOM depth 15 to
`body.mm-injected > HEADER > DIV > NAV > UL > LI > DIV > DIV > DIV > UL > LI > A > SPAN > svg > path`
and names `a.mm-item > span.mm-item-ico > svg > path` as the deepest node.

**Root cause.** The whole header is data and markup living in JavaScript: `SEARCH_INDEX` 8,685 B
(29.6 %), `ICONS` 4,391 B (15.0 %), `HEADER_HTML` 4,426 B (15.1 %), service data 1,416 B — 64 % of
the module is not behaviour. Only ~2,937 B is behaviour outside the search overlay.

**The cost is Style & Layout, not script.** This is the number that matters and it is easy to get
wrong: `mainthread-work-breakdown` gives **Style & Layout 561.6 ms — 47 % of the 1.2 s main
thread** — against **Script Evaluation 122.9 ms** and Parse & Compile 22.5 ms, while `bootup-time`
attributes only **78.7 ms** total to `mega-menu.min.js` itself. Injecting 207 elements into a live
document forces style recalculation and layout; that, not parsing 29 KB, is the expense.

**Fix.** `renderHeader()` in `build/lib/render.mjs` emits the full static header — logo anchor,
`<nav aria-label="Primary">`, three disclosure `<button aria-expanded aria-controls>` triggers,
all three panels, the utility rail — generated from `routes[]`. `ICONS` moves to `navIcons` in
`site.config.mjs`; the service data moves to `routes[]`; active-link highlighting becomes build-time
`aria-current="page"` and `.mm-active`, so the runtime `data-mm-match` regex loop is deleted
entirely. `mega-menu.min.js` is replaced by a behaviour-only `nav.js`.

The search overlay is **not** server-rendered: its 24 elements / 1,565 B of markup and 8,135 B of
CSS belong to a lazily-loaded `search.js`.

**Pass:** `ssr-chrome` (6), fed by `render.mjs`.

**Effect.** Removes 561.6 ms of Style & Layout work and makes the navigation crawlable — with JS
off, the export had no navigational path to either service hub at all. Verified in the output:
`<header>` 1, `<nav>` 1–2, `<main id="main">` 1 on every page, including `/404/`.

**Honest limit:** SSR does **not** meaningfully reduce the 903-element DOM. The same nodes are
parser-built instead of script-built. Realistic landing point is ~850 elements after removing the
search overlay (−24) and trimming decorative panel furniture (−~30) — still over Lighthouse's 800
threshold, which is driven by page body content, not the header. Do not promise a DOM-size win.

---

## 5. Builder dev taps → 4 × 404 per page

**Evidence (measured).** Every page ships
`<script type="module" data-lps-tap="route-notifier">` importing `/src/lib/routeNotifier.ts` and
`/src/lib/virtualPageObserver.ts`, and `<script data-lps-tap="inspector">` importing
`/src/lib/inspector.ts` — all 404 (211 B each). The 3,411 B `ws:page-observer` block fetches
`/pages.manifest.json` (404, 546 B), `postMessage`s `PAGE_CHANGED` to `window.parent`, runs a
`MutationObserver` with `attributeFilter ["class","style"]` on every `[id^='page-']`, and scans
`document.querySelectorAll("[onclick]")`. Lighthouse `errors-in-console` **fails**, listing these.

**Root cause.** Editor-preview instrumentation published to production.

**Fix.** Delete all of it: both `[data-lps-tap]` module scripts (359 B/page, three 404s) and the
`ws:page-observer` block (3,411 B/page, one 404). The 4,708 B `ws:form-submit-shim` is **kept** —
it is real functionality — but moved to a deferred, hashed `/assets/form-shim.<hash>.js` loaded only
on pages containing `form[action*="/api/forms/"]`.

**Pass:** `strip-dev-taps` (1). **Measured: applied on 21 / 21 pages.**

**Effect.** 4 fewer requests per page, ~3,770 B less inline JS per page, and the `errors-in-console`
failure is removed at its source.

---

## 6. Cache headers contradict themselves

**Evidence (measured).** Every page carries
`<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">` plus
`Pragma: no-cache` and `Expires: 0`, defeating the `_headers` policy and forcing a full
re-download every visit.

**Root cause.** A builder default that overrides the deploy platform's policy from inside the
document.

**Fix.** `strip-nocache-meta` removes all three. `headersFile()` then owns caching honestly:
`/assets/*` immutable for a year, `/favicon.ico` a week, `sitemap.xml`/`robots.txt`/`llms*.txt` an
hour, and a `/*` catch-all of `public, max-age=0, must-revalidate` plus `X-Content-Type-Options`,
`Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy` and `X-Frame-Options` — the
export had **no security headers of any kind**.

`immutable` is only safe because every file the build writes under `/assets/` is content-hashed,
and `sync.mjs` **asserts** that invariant rather than assuming it (measured: "all 25 files are
content-hashed").

**Accepted, documented risk:** `_headers` governs this origin only. The four woff2 faces and every
image live on `media.cdn.builder.searchatlas.com` and sit outside the policy entirely. Self-hosting
the fonts under `/assets/fonts/` would bring them under the immutable rule but changes asset URLs —
a follow-up, not part of this refactor.

**Pass:** `strip-nocache-meta` (2). **Measured: applied on 20 / 21 pages** (`/404/` carried no such
meta).

---

## 7. GTM is the first element in `<head>`, synchronous

**Evidence (measured).** The GTM inline script precedes `<meta charset>`. A charset declaration
must appear within the first 1024 bytes and not after a script, so this is a spec violation.
`https://dashboard.fertilerank.com/scripts/dynamic_optimization.js` is `defer` but still
parser-discovered early. **Both hosts were unreachable during the Lighthouse run, so neither cost
anything in the measurement.**

**Root cause.** Standard GTM install guidance ("as high in `<head>` as possible") applied literally,
ahead of the charset.

**Fix.** `renderHeadTags()` emits `<meta charset="UTF-8">` unconditionally first. Both third
parties are injected by `analytics.js` on whichever comes **first** of: `requestIdleCallback`, the
first real user interaction (`pointerdown` / `keydown` / `touchstart` / `scroll`, all passive and
capture-phase, `once`), or a timeout ceiling. Neither is deleted — `BRIEF.md` requires both to keep
working. GTM's `<noscript>` iframe stays in the served HTML and now carries
`title="Google Tag Manager"` (it had none).

**Passes:** `hoist-charset` (5), `dedupe-gtm` (4), `defer-third-party` (8).
**Measured:** `dedupe-gtm` 21 / 21, `defer-third-party` 21 / 21, `hoist-charset` **0 / 21** — a
no-op on every page because `head-tags` already emits charset first. The pass stays as the standing
guarantee.

**Effect.** Unmeasurable here by construction: the run could not reach either host. In production
this moves two third-party scripts off the parser's discovery path entirely. That is the one change
in this document whose benefit is certain in the field and invisible in the lab.

---

## 8. LPS visitor tracker — ~9 KB inline per page, un-cacheable

**Evidence (measured).** 7,090 B of inline JS in every page's `<head>`. Of that, **4,514 B
(63.7 %)** is a section-engagement subsystem wired to `data-section-id` — an attribute that appears
**zero times outside `<script>` in all 21 pages**. `scanSE()` skips every candidate at
`if(!k)continue;`, so `SEC` is `{}` forever, `sendSE()` returns at `if(!ks.length)return`, and
`/api/section-engagement/` **has never fired**.

The cost is real anyway: `setInterval(…, 5000)` wakes the main thread 12×/min; the scroll handler
reads `var dh=h.scrollHeight||1` **synchronously outside its rAF** — the one genuine forced reflow
that does fire; an `IntersectionObserver` with `threshold:[0,0.2,0.5,0.75,1]` throws away its own
entries and calls `recomputeSE()`; `topSecs()` runs an O(n²) containment filter six times per page
load. Full inventory: 1 `setInterval`, 5 `setTimeout` sites, 10 listeners, 1 `IntersectionObserver`,
`history.pushState` patched **twice** and `replaceState` once.

**Fix — exactly these changes and no more.** Delete the 5 s interval and rely on the existing
`visibilitychange → hidden` and `pagehide` flushes with `sendBeacon`. Let the `IntersectionObserver`
consume its own `entries`. Move `scrollHeight` / `pageYOffset` / `innerHeight` **inside** the rAF.
Merge the two scroll listeners into one and the three capture-phase click listeners into one
dispatcher. Wrap `pushState` once. Replace `topSecs()` with `querySelectorAll('[data-section-id]')`.
Gate the whole subsystem behind `if (document.querySelector('[data-section-id]'))`.

**Two constraints that are not negotiable.** The `/api/track/` and `/api/event/` payloads stay
**byte-for-byte identical**, including `project_id`, `tracking_secret`, `visitor_id`
(`localStorage _lps_vid`), `session_id` (`sessionStorage _lps_sid`), `page_url`, `referrer` — these
are the only payloads the site actually sends. And if `render.mjs` ever starts emitting
`data-section-id`, that **turns on an endpoint that has never fired** — an analytics *addition*,
not a preservation. Do not do it silently.

**Pass:** moved out of the document into `/assets/analytics.<hash>.js` with `defer`.

**Effect.** ~7 KB of un-cacheable inline JS per page becomes one year-cached file; the forced
synchronous layout on the scroll path is removed; the 12×/min wake-up is gone.

---

## 9. 38–48 inline `on*` handlers per page

**Evidence (measured).** 406 elements carry **812** `on*` attributes site-wide: `onmouseover` 403,
`onmouseout` 403, `onfocus` 3, `onblur` 3. Only **4 distinct behaviours** and 30 distinct
`(tag, class, handler)` shapes — and every affected element already has a class, with zero
exceptions. Dominant values: `this.style.color='#1F6E75'` ×380, `this.style.color=''` ×315,
`this.style.color='rgba(255,255,255,.6)'` ×84, `this.style.color='var(--teal)'` ×19.

The point is not the bytes. **Mouse users got a hover state and keyboard users got nothing**: the
export's only focus styling is a `:focus-visible` outline, never the colour change.

**Root cause.** Visual polish written as inline JS instead of CSS.

**Fix.** Strip every `on*` attribute and ship four rules, each pairing `:hover` with
`:focus-visible`:

```css
.mtfs-footer a:hover, .mtfs-footer a:focus-visible { color: var(--teal) }
.mtfs-skip-link:focus, .mtfs-skip-link:focus-visible { top: 0 }
.contact-cta a:hover, .contact-cta a:focus-visible { color: var(--w) }
.btn-primary:hover, .btn-primary:focus-visible { background: var(--td); border-color: var(--td) }
.btn-link:hover, .btn-link:focus-visible { border-color: #fff; background: rgba(255,255,255,.08) }
```

**Hazard, do not skip.** The `il*` class names **collide across pages**: `il13`, `il15`, `il23`,
`il25`, `il30` and `il33` each map to two different handler pairs depending on the file. Never emit
`.il30:hover` into a shared stylesheet. Replacements must use stable semantic classes.

**Pass:** `strip-inline-handlers` (10). **Measured: 1 / 21 pages changed** — because `ssr-chrome`
and `fix-a11y` replace most of the affected markup wholesale before this pass runs, so it only has
residual handlers left to clean up. Verified in output: `onmouseover` count is **0** on every page;
the only surviving `style=` attribute site-wide is the GTM `<noscript>` iframe's
`style="display:none;visibility:hidden"`, which is standard.

**Effect.** 812 attributes removed, a strict CSP becomes possible, and keyboard users get the hover
affordance for the first time.

---

## 10. 263,330 B of inline CSS site-wide, 35,460 B byte-identical

**Evidence (measured).** Two `<style>` blocks are byte-identical across 20 pages each:
`#mtfs-context-links` (319 B) and `#mtfs-visible-related-links` (1,850 B) — **43,351 B site-wide
that is never cached and re-sent on every page view**. `index.html` alone carries 3 inline `<style>`
blocks totalling 19,846 B. Stripping `data-lps-eid` from `index.html` removes **11,176 B**;
stripping its `on*` handlers removes 1,623 B.

**Fix.** `css.mjs::dedupe(cssBlocks)` returns `{ shared, perPage[] }`. The shared half is prepended
to the single hashed `/assets/site.<hash>.css`, already covered by the `/assets/*` immutable rule,
turning per-view inline CSS into a one-year-cached file. `strip-builder-ids` removes every
`data-lps-eid`.

**Pass:** `strip-builder-ids` (3), `inline-critical-css` (7).
**Measured:** `strip-builder-ids` applied on 21 / 21; output pages contain **0** `data-lps-eid`.
`dedupe()` hoisted **15,845 B** out of the 263,861 B harvested.

---

## 11. Failing audits

Six audits fail. Five are content and markup defects; the sixth is §5.

| Audit | Score | Source, exactly |
| --- | --- | --- |
| SEO `link-text` | 0 | 5 `<a class="lk" aria-label="…">Learn More</a>` on `/index.html:401-405`; **26** "Learn More" links site-wide across 5 pages, plus 6 "Get Started" |
| `label-content-name-mismatch` | 0 | the same five links — visible text "Learn More" is not contained in the accessible name "Marketing" (WCAG 2.5.3) |
| `heading-order` | 0 | 63 footer `<h4 class="il27">` column titles after an `<h2>`; selector `div.ctr > div.ftg > div.ftc > h4.il27`, nodeLabel "LAB SOLUTIONS". Plus 11 hero `<h3>` stat-card skips and 4 in-page skips — 21/21 pages affected |
| `aria-allowed-attr` | fail | `book-consultation-modal.js:521` emits `<button role="option" aria-pressed="false">` for all 8 service options — `aria-pressed` is not allowed on `role=option`. **Doubled to 16 nodes** because the script builds an inline *and* a popup instance per page |
| `aria-progressbar-name` | fail | `book-consultation-modal.js:535-539`, `<div class="mtfs-progress-track" role="progressbar">` with an unwired sibling `<p class="mtfs-step-label">` |
| BP `errors-in-console` | fail | the four 404s from §5 plus unreachable third-party hosts |

**Fixes.** One content edit clears both `link-text` and `label-content-name-mismatch`: put the
destination in the **visible text**, sourced from `routes[].navLabel`, and delete the `aria-label`.
Applied to all 26 links, not just the 5 the home-page audit reported — the other 21 fail as soon as
their pages are scanned. `validateLinks` then blocks `learn more` / `get started` / `click here` /
`read more` at build time so they cannot return.

Heading order is fixed **structurally**, not patched per page: `renderFooter()` emits `<h2>` column
titles; the 11 hero stat-card `<h3>`s are demoted to `<p>` with their class preserved; the six
decorative stat-panel labels (GPO Savings Dashboard, Staffing Overview, Marketing Performance,
Compliance Scorecard, Practice Growth, Lab Performance Dashboard) stop being headings, which fixes
the document outline, the Lighthouse failure and the `llms-full.txt` heading skew in one change.

The two ARIA defects live **inside the modal code**, and lazy-loading does not fix them, because the
eager inline hero card on `/` instantiates the same wizard: the progress track gets
`aria-label="Consultation form progress"`, and the 8 option buttons move from `aria-pressed` to
`aria-selected` (with the CSS selector and `setAttribute` calls updated to match).

**Pass:** `fix-a11y` (11). **Measured: applied on 19 / 21 pages.**

---

## 12. The consultation modal ships eagerly on every page

**Evidence (measured).** `<script src="/assets/book-consultation-modal.min.js?v=20260722" defer>` on
all 20 non-404 pages. The file is 58,472 B raw / 32,579 B gzip / **29,964 B brotli**.

**A single 512×512 base64 PNG on line 530 is 32,626 characters — 45.2 % of the 72,105 B source and
55.8 % of the shipped file.** Decoded it is 24,451 B; its IHDR reads 512×512; it is rendered into a
**28×28** box. Because base64 is incompressible it wrecks the whole bundle's ratio. With the data
URI swapped for a file reference the module measures **25,875 B raw / 7,794 B gzip / 6,637 B
brotli** — a **77.8 % brotli cut with zero functional change**.

Three further defects: only three selectors bind (`[data-open-consult]` — once site-wide;
`.mm-cta` — 0 times in markup, injected by the header script which *also* carries
`data-open-consult`, so that loop is a no-op; `.open-consult-modal` — **0 times site-wide, a dead
selector**). On `/` the popup instance is **provably unreachable**: `#hero-form-card` exists, so
every trigger takes the `heroSlot.scrollIntoView` branch. And the modal root is built with `hidden`
while its own CSS declares `#mtfs-modal-root{display:flex}` — author-origin `display:flex` beats
the UA `[hidden]{display:none}`, so **a closed 4-step dialog with ~15 focusable controls sits in the
accessibility tree and the tab order on every page**. Lighthouse proves it is laid out: the second
progressbar has a non-zero `boundingRect` at top 163.

**Fix, in this order.**
1. **Delete the base64 PNG first.** Emit a real 56×56 image asset under `/assets/img/` and reference
   it by URL. Do this *before* lazy-loading, so the lazily-loaded module is already the small one.
2. Drop the eager `<script>` from all 20 pages.
3. Load on exactly three triggers: **(a)** one capture-phase delegated document click testing
   `e.target.closest('[data-open-consult], .mm-cta, .open-consult-modal')`; **(b)** the `#consult`
   hash on load and on `hashchange` — this does **not** exist today and is a deliberate addition, so
   the header CTA is server-rendered as `href="/contact/#consult"` for no-JS reachability;
   **(c)** `requestIdleCallback` warm-up **only** when the page has a trigger and lacks
   `#hero-form-card`, because on `/` the popup is unreachable.
4. When constructed, make the closed state genuinely `display:none` — declare
   `#mtfs-modal-root[hidden]{display:none!important}` *before* the `display:flex` rule. Never build
   two live instances on one page.
5. Delete the `MutationObserver` on `document.body` (it existed only to race the JS-injected header),
   `window.MtfsModal` at line 887 (it resolves `open` to `window.open` — a broken public API), and
   the stray `<span></span>` that `buildPopupShell()` appends to every page.

Emitting `<a href="/contact/#consult">` **without** `role="button"`: the shipped markup put
`role="button"` on an `<a href>`, which overrides the link role and breaks middle-click and
open-in-new-tab.

**Pass:** `lazy-modal` (9), plus `src/assets/js/consult-modal.js` as the intent loader.
**Measured: applied on 21 / 21 pages.** Verified: **0** occurrences of `data:image/png;base64` in
the shipped wizard, which now references `/assets/img/brand-icon-96.<hash>.webp`.

**Effect.** Removes 58,472 B of eager JS from every page, plus — from the closed-modal fix alone —
8 `aria-allowed-attr` nodes, 1 `aria-progressbar-name` node and ~15 phantom tab stops per page.

---

## 13. Before / after

**Every "measured" row is an actual measurement.** Baseline numbers come from the Lighthouse 12.8.2
mobile run and the four audits; "after" numbers come from a real run of `node build/sync.mjs`.
**Every "projected" row is an estimate and is labelled.** No Lighthouse score is projected.

### 13.1 Home page first load

| Metric | Before | After | Basis |
| --- | --- | --- | --- |
| Render-blocking stylesheets | **3** (39,890 B) | **0** | measured both sides |
| Document, raw | **88,297 B** | **90,344 B** | measured both sides |
| Document, brotli | **18,924 B** | **16,323 B** | measured both sides |
| Inline critical `<style>` | n/a | **36,697 B raw / 6,413 B br** | measured |
| Async site sheet | n/a | **28,111 B raw / 5,141 B br** | measured |
| Pre-interaction JS, raw | **87,803 B** (mega-menu 29,331 + modal 58,472) | **37,058 B** (nav 16,224 + analytics 20,834) | measured both sides |
| Pre-interaction JS, brotli | not served compressed | **10,858 B** | measured |
| Whole first load, raw | **215,990 B** | **155,513 B** | measured both sides |
| Whole first load, brotli | **nothing pre-compressed** | **32,322 B** | measured |
| Whole first load, gzip | nothing pre-compressed | **38,065 B** | measured |
| 404 requests per page | **4** | **0** | measured before; structural after |
| `data-lps-eid` attributes | 11,176 B on `/` alone | **0** | measured both sides |
| Inline `on*` handlers | **812** site-wide | **0** | measured both sides |
| `<header>` / `<nav>` in served HTML | **0 / 0** on 20 of 21 pages | **1 / 1–2** on 21 of 21 | measured both sides |
| `<main id="main">` | **3 of 21** pages | **21 of 21** | measured both sides |

### 13.2 Whole site

| Metric | Before | After | Basis |
| --- | --- | --- | --- |
| Pages | 21 | 21 | fixed inventory |
| Total HTML, raw | **1,476,524 B** | **1,462,730 B** (−0.9 %) | measured |
| Duplicated inline `<style>` | **43,351 B** re-sent per view | **15,845 B** hoisted to one hashed sheet | measured |
| Text compression | none | **1,839,662 B → 373,368 B br (79.7 %)** across 36 files | measured |
| `/assets/` content-hashed | partial (only `/assets/404/*`) | **25 of 25** | measured |
| Security headers | **none** | 5, via `/*` | measured |
| Build gate | none | `--check`: 0 errors, 14 warnings, PASS | measured |

### 13.3 Expected effects — **projected, not measured**

| Lighthouse metric | Direction | Reasoning |
| --- | --- | --- |
| Main Thread Work | should fall substantially | Style & Layout was **561.6 ms of the 1.2 s** measured main thread, dominated by injecting 207 header elements into a live document. SSR moves that to parser-time. Magnitude unverified until re-measured. |
| JS Execution Time | should fall modestly | Script Evaluation was only **122.9 ms** measured, and `mega-menu.min.js` contributed **78.7 ms**. Removing 87,803 B of pre-interaction JS helps, but this was never the big number. Do not oversell it. |
| Critical Rendering Path | 3 blocking requests → 0 | measured on both sides; the ~380 ms Lighthouse attributed to them is an estimate from the baseline run |
| Compression | large improvement | measured: 79.7 % brotli reduction across 36 files, where the export shipped nothing pre-compressed |
| DOM size | **little change** | 903 elements today; realistic landing point ~850 after removing the search overlay (−24) and trimming panel furniture (−~30). Still over the 800 threshold. **Do not promise a DOM win.** |
| CLS | should hold at ~0.005 | only if the four hidden-by-default rules and the mobile drawer's closed state stay in the inline critical block. This is the single highest-risk item in the refactor. |
| LCP | unknown | measured LCP element was `h1#h1`, a text node in Sora — but the image CDN was unreachable, which can change which element wins. `preload-lcp` decides per page and emits at most one `fetchpriority=high` preload. |
| Third-party cost | **worse than measured, everywhere** | GTM and `dynamic_optimization.js` executed nothing during the baseline run |

---

## 14. Open issues — honest gaps

**1. There is no JavaScript minifier, so shipped JS is over its byte budgets.**
The zero-dependency constraint means no minifier, and `sync.mjs` hashes the source files as
authored — comments included. Measured, against the payload audit's budgets:

| Module | Shipped raw | Shipped br | Comments-stripped raw / br | Audit budget |
| --- | --- | --- | --- | --- |
| `nav.js` | 16,224 | 4,695 | 6,996 / 1,728 | ≤ 3,000 min / ≤ 1,300 br |
| `search.js` | 14,223 | 4,087 | 11,735 / 3,079 | ≤ 5,000 raw / ≤ 1,800 br |
| `consult-modal.js` | 9,434 | 3,027 | 2,600 / 821 | ~550 B (loader portion) |
| `analytics.js` | 20,834 | 6,163 | 11,782 / 3,461 | ≤ 2,400 min / ≤ 1,000 br |
| `book-consultation-modal.js` | 39,983 | 8,987 | 36,130 / 7,778 | ≤ 26,000 raw / ≤ 7,000 br |

The comments-stripped column was measured by removing block and line comments and blank lines; it
is **not** a substitute for a real minifier and should not be quoted as a shipped figure. The
audit's instruction was: *"If the build emits nav.js over 3,000 B minified, data or markup has
leaked back in — fail the build, do not raise the budget."* No data or markup has leaked back in —
the overage is documentation prose — but the budget is not met as shipped and the build does not
currently enforce it. Two honest options: add a conservative comment-stripper to `css.mjs`'s
sibling in `sync.mjs` and enforce the budget, or relax the budget to a brotli-on-the-wire figure
and record the decision. Do not quietly do neither.

**2. The step-1 chooser uses `role="listbox"` + `role="option"` + `aria-selected`, not a radio
group.** The semantics audit's preferred fix was `<fieldset><legend>` with `<input type="radio">`,
which needs no ARIA and gives arrow-key navigation free. What shipped is the documented fallback's
cousin: valid ARIA (`aria-selected` **is** allowed on `role=option`), so `aria-allowed-attr` is
cleared, but it is still an ARIA construction where native HTML would do. Worth revisiting.

**3. `/assets/404/` ships 17 unreferenced files** inherited from the export's own hashed bundle, and
`/assets/consult-modal.<hash>.js` is emitted but currently unreferenced. Both are reported as
warnings by the asset cross-reference step. Dead weight in the deploy, not a correctness problem.

**4. Every projection in §13.3 is unverified.** Re-measure with Lighthouse after deploy before
quoting any of it to anyone.
