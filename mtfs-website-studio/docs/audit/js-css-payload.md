# JS & CSS payload audit — MedTech For Solutions export

Scope: `assets/mega-menu.js` (43,143 B), `assets/book-consultation-modal.js` (72,105 B),
`assets/mega-menu.css` (30,074 B), `assets/mtfs-images.css` (3,128 B), `assets/css/fonts.css` (6,688 B),
and the four inline scripts at the tail of every page.

Source of truth: `/tmp/claude-0/-home-user-test/da065df0-1665-52a8-b803-716d1ee66e9a/scratchpad/src/source-export/`
Measured Lighthouse data: `lh-mobile.json` (real run, mobile, LH 12.8.2 — third-party hosts unreachable in
the sandbox, so real-world numbers are worse, never better).

**Every byte count in this document was measured** with `wc -c`, `Buffer.byteLength`, `zlib.gzipSync(level 9)`
and `zlib.brotliCompressSync(quality 11)` against the files on disk. No number is estimated unless the row
says "target". Timing figures are only ever quoted from `lh-mobile.json`.

---

## 0. Baseline — what the home page actually downloads today

| Resource | raw B | gzip-9 B | brotli-11 B | How it loads |
|---|---:|---:|---:|---|
| `/` (index.html) | 88,297 | 23,937 | 18,924 | document |
| `/assets/css/fonts.css` | 6,688 | 560 | 460 | **render-blocking** (152 ms) |
| `/assets/mega-menu.css` | 30,074 | 6,260 | 5,357 | **render-blocking** (602 ms) |
| `/assets/mtfs-images.css` | 3,128 | 949 | 782 | **render-blocking** (302 ms) |
| `/assets/mega-menu.min.js` | 29,331 | 8,522 | 7,300 | `defer` |
| `/assets/book-consultation-modal.min.js` | 58,472 | 32,579 | 29,964 | `defer` |
| **Total first-party** | **215,990** | **72,807** | **62,787** | |

Nothing is pre-compressed and `_headers` sets no `Content-Encoding`, so **215,990 B is what actually crosses
the wire**. Lighthouse `uses-text-compression` measures 140 KiB of savings left on the table; `total-byte-weight`
reports 213 KiB transferred.

The single most useful measured number in the whole report is `mainthread-work-breakdown`:

| bucket | measured ms |
|---|---:|
| **Style & Layout** | **561.6** |
| Other | 348.5 |
| Script Evaluation | 122.9 |
| Rendering | 66.4 |
| Parse HTML & CSS | 60.3 |
| Script Parse & Compile | 22.5 |

Style & Layout is 47% of the 1.2 s main thread. Script evaluation is only 122.9 ms, and
`bootup-time` attributes just 78.7 ms total / 17.5 ms scripting / 3.1 ms parse-compile to `mega-menu.min.js`.
**The header is not expensive because the JS is slow to run; it is expensive because 30 KB of blocking CSS
has to be recomputed against 207 nodes that the parser never saw.** That is the case for SSR, and it is
measured, not asserted.

Corroborating measured facts:
- `dom-size` **fails** at 903 elements, and the deepest node Lighthouse names is
  `a.mm-item > span.mm-item-ico > svg > path` — inside the injected mega panel.
- `layout-shifts`: the one shift on the page is on `body.mm-injected > main#main > section.sec`.
- `network-requests`: `/src/lib/routeNotifier.ts`, `/src/lib/virtualPageObserver.ts`, `/src/lib/inspector.ts`
  and `/pages.manifest.json` all return **404** — 4 wasted round trips per page.
- `largest-contentful-paint-element` is **`h1#h1`** — a *text* node in Sora, not an image (see §5).

---

## 1. `mega-menu.js` — where the 43 KB goes, and what may survive SSR

### 1.1 Unminified composition (43,143 B, 814 lines)

| Region | lines | bytes | % |
|---|---|---:|---:|
| Banner comment + IIFE preamble | 1–19 | 1,139 | 2.6% |
| **`SEARCH_INDEX` (24 records)** | 20–214 | **10,245** | **23.7%** |
| `SEARCH_SUGGESTIONS` (6 chips) | 216–223 | 513 | 1.2% |
| Search engine (`tokenize`/`SYNONYMS`/`expandQuery`/`scoreResult`/`highlightSnippet`/`runSearch`) | 225–308 | 3,641 | 8.4% |
| **`ICONS` — 15 inline SVG strings** | 310–330 | **4,744** | **11.0%** |
| `LAB_SERVICES` + `MGMT_SERVICES` data | 332–348 | 2,026 | 4.7% |
| `svc()` + `panelMarkup()` string builders | 350–377 | 1,380 | 3.2% |
| **`HEADER_HTML` markup string** | 379–467 | **6,102** | **14.1%** |
| `init()` prologue + inject + `setMobileOpen` | 469–491 | 1,130 | 2.6% |
| Sticky/compact + back-to-top | 493–515 | 850 | 2.0% |
| Disclosure (hover/click/keyboard/burger/outside-click) | 517–611 | 3,592 | 8.3% |
| Search overlay behaviour (render/keys/Cmd+K) | 613–783 | 6,686 | 15.5% |
| Active-link highlighting | 785–806 | 885 | 2.1% |
| Bootstrap tail | 808–814 | 198 | 0.5% |
| blank separator lines | — | 11 | — |

### 1.2 Shipped (minified) composition — `mega-menu.min.js`, 29,331 B

This is the file that is actually served, so this is the split that matters.

| Segment | bytes | % of file |
|---|---:|---:|
| IIFE preamble | 25 | 0.1% |
| **`SEARCH_INDEX` — 24 records** | **8,685** | **29.6%** |
| `SEARCH_SUGGESTIONS` | 424 | 1.4% |
| Search engine + `SYNONYMS` | 1,898 | 6.5% |
| **`ICONS` — 15 inline SVG** | **4,391** | **15.0%** |
| `LAB_SERVICES` + `MGMT_SERVICES` | 1,416 | 4.8% |
| `svc()` + `panelMarkup()` | 781 | 2.7% |
| **`HEADER_HTML`** | **4,426** | **15.1%** |
| `init()` — all behaviour + bootstrap | 7,285 | 24.8% |
| **Total** | **29,331** | 100% |

`init()` breaks down further:

| Sub-segment | bytes |
|---|---:|
| inject (`insertAdjacentHTML`) + element refs + `setMobileOpen` | 655 |
| sticky `.mm-scrolled` + back-to-top visibility (scroll + rAF) | 494 |
| disclosure panels, hover intent, click, keydown, burger, outside-click, Escape | 1,845 |
| **search overlay UI (chips, results, arrow keys, Cmd+K)** | **3,693** |
| active-link highlighting (`data-mm-match` regexes, panel `.mm-item` highlight) | 598 |

### 1.3 Answering the question directly

- **Data (`SEARCH_INDEX` + `SEARCH_SUGGESTIONS` + `LAB`/`MGMT`): 10,525 B = 35.9%** of the shipped file.
- **Icon SVG strings: 4,391 B = 15.0%.** (Rendered into the header they become 25 `<svg>`/25 `<path>` nodes.)
- **DOM construction (`HEADER_HTML` + the two markup builders + the `insertAdjacentHTML`/refs prologue):
  5,862 B = 20.0%.**
- **Behaviour: 6,630 B = 22.6%**, of which the search overlay alone is 3,693 B (12.6%) and everything
  else — disclosure, sticky, back-to-top, active-link — is 2,937 B (10.0%).

Rendering `HEADER_HTML` produces **13,725 B of HTML / 207 elements** (gz 3,044, br 2,501):

| Injected chrome | bytes | elements |
|---|---:|---:|
| `<header class="mm-header">` … `</header>` | 11,830 | 179 |
| &nbsp;&nbsp;· lab mega panel | 4,183 | 62 |
| &nbsp;&nbsp;· management mega panel | 4,083 | 62 |
| &nbsp;&nbsp;· about panel | 1,190 | 20 |
| `.mm-mobile-scrim` | 54 | 1 |
| `.mm-back-to-top` | 276 | 3 |
| `.mm-search-overlay` (Cmd+K dialog) | 1,565 | 24 |

### 1.4 What MUST stay client-side once the header is server-rendered

| Concern | Verdict | Why |
|---|---|---|
| `SEARCH_INDEX` | **remove** | Its 20 unique `href`s are *exactly* the 20 canonical non-404 routes (verified — see §1.5). It is a build artifact of `routes[]` in `site.config.mjs`. |
| `SEARCH_SUGGESTIONS`, search engine, overlay UI | **move to a lazily-loaded `search.js`** | Only reachable via the `#mm-search-open` button or ⌘/Ctrl+K. Zero users pay for it on load. |
| `ICONS` | **remove** | SSR them inline into the header markup (or a `<symbol>` sprite). They are static strings. |
| `LAB_SERVICES`/`MGMT_SERVICES`, `svc()`, `panelMarkup()`, `HEADER_HTML` | **remove** | This is `renderHeader()` in `build/lib/render.mjs`. |
| Active-link highlighting | **remove** | `aria-current="page"` + `.mm-active` are emitted at build time from `currentRoute`; the `data-mm-match` regexes and the `new RegExp()` per nav item disappear. |
| `.mm-scrolled` toggle at `y > 50` | **keep, but rewrite** | Replace the `scroll` listener + rAF with a 1-px `IntersectionObserver` sentinel at the top of `<body>` — zero scroll handlers, zero layout reads. |
| `.mm-back-to-top` visible at `y > 500` | **keep, same sentinel** | A second sentinel at 500 px, plus the click handler (`scrollTo` with `prefers-reduced-motion` check). |
| Mega-panel disclosure | **keep (reduced)** | CSS `:hover` / `:focus-within` can open the panels with no JS at all; JS is still required to keep `aria-expanded` truthful, to support tap-to-open on `(hover: none)`, Escape-to-close, and outside-click. |
| Burger / mobile drawer | **keep** | `aria-expanded`, `.mm-mobile-open`, `body.mm-menu-lock`, scrim. |

### 1.5 Verified: the search index is derivable, and it currently contains duplicates

`SEARCH_INDEX` holds **24 records but only 20 unique `href`s**. Duplicated:
`/services/lab-solutions/real-time-monitoring/` ×2 (the second titled "OvaTools LMS"),
`/services/lab-solutions/practice-development/` ×2, `/services/management-services/` ×2,
`/services/management-services/call-center/` ×2.

The 20 unique paths are precisely the canonical route list minus `/404/`. Generated from `routes[]`:

| form | bytes | brotli |
|---|---:|---:|
| current 24 records as JSON | 8,927 | 2,069 |
| deduped to 20 records | 7,291 | 1,984 |
| deduped + short keys | 6,371 | 1,813 |

Do **not** simply drop the duplicates: the "OvaTools LMS" record carries alias keywords
(`ovatools`, `LMS`, `laboratory management system`) that the canonical record lacks. Fold those aliases into
the canonical route's `keywords` array in `site.config.mjs` so search coverage is preserved.

### 1.6 Byte budget for the replacement `nav.js`

| `mega-menu.min.js` piece | today | disposition | kept in `nav.js` |
|---|---:|---|---:|
| `SEARCH_INDEX` | 8,685 | → `/assets/search-index.<hash>.json`, fetched on first search open | 0 |
| `SEARCH_SUGGESTIONS` | 424 | → `search.js` | 0 |
| Search engine | 1,898 | → `search.js` | 0 |
| `ICONS` | 4,391 | → SSR'd inline | 0 |
| `LAB`/`MGMT` data | 1,416 | → `site.config.mjs` `routes[]` | 0 |
| `svc()` + `panelMarkup()` | 781 | → `render.mjs` | 0 |
| `HEADER_HTML` | 4,426 | → `render.mjs` | 0 |
| inject + refs + `setMobileOpen` | 655 | drop injection, keep refs + mobile toggle | 420 |
| sticky + back-to-top | 494 | rewrite as IO sentinels | 320 |
| disclosure + burger + Escape + outside-click | 1,845 | keep | 1,650 |
| search overlay behaviour | 3,693 | → `search.js` | 0 |
| active-link highlighting | 598 | → build time | 0 |
| preamble + bootstrap | 25 | keep | 60 |
| *(new)* intent loader for `search.js` + `consult-modal.js` | — | new | 550 |
| **TOTAL** | **29,331** | | **3,000** |

> **`nav.js` budget: ≤ 3,000 B minified, ≤ 1,300 B brotli.** That is a **89.8 % cut** from 29,331 B.
> A CSS-first disclosure (`:hover`/`:focus-within` opens the panel; JS only syncs `aria-expanded`) reaches
> roughly 1,800 B; treat 1,800 B as the stretch floor and 3,000 B as the hard ceiling. A build that ships
> `nav.js` over 3,000 B minified has left data or markup in the script and must be rejected.

Companion budgets: `search.js` ≤ 5,000 B min / ≤ 1,800 B br (loaded on `#mm-search-open` click or ⌘K only);
`search-index.<hash>.json` ≤ 7,500 B raw / ≤ 2,000 B br (loaded with it).

---

## 2. `book-consultation-modal.js` — what it is, and the correct lazy trigger

### 2.1 Composition (72,105 B unminified / 58,472 B minified)

| Region | lines | bytes | % of 72,105 |
|---|---|---:|---:|
| Banner + IIFE preamble | 1–9 | 439 | 0.6% |
| CSS template literal (injected as `<style id="mtfs-modal-css">`) | 10–323 | 10,550 | 14.6% |
| 13 inline SVG strings | 325–340 | 2,786 | 3.9% |
| `SERVICE_OPTIONS` (8) + `STEP_LABELS` | 342–353 | 761 | 1.1% |
| `esc()`, `genRef()`, `injectCSS()` | 355–375 | 627 | 0.9% |
| `createFormInstance`: state, validation, `goTo`, review, reset | 377–518 | 5,614 | 7.8% |
| **`buildHTML()`** | 519–644 | **41,539** | **57.6%** |
| &nbsp;&nbsp;· **of which one base64 PNG** | 530 | **32,626** | **45.2%** |
| &nbsp;&nbsp;· of which real markup | | 8,913 | 12.4% |
| Ref caching + event bindings + submit `fetch` | 646–756 | 4,470 | 6.2% |
| Popup open/close + focus trap | 758–806 | 2,137 | 3.0% |
| `init()`: inline card, popup, `wireTriggers`, `MutationObserver` | 808–874 | 2,794 | 3.9% |
| Stub + bootstrap + `window.MtfsModal` | 876–889 | 380 | 0.5% |

### 2.2 The headline finding: a 512×512 PNG is base64-inlined into the JS

Line 530 of `book-consultation-modal.js` embeds one `data:image/png;base64,…` **32,626 characters long**.
Decoded it is **24,451 B**, and its IHDR reads **512 × 512**. It is rendered at:

```
alt="MedTech For Solutions" width="28" height="28"
style="width:28px;height:28px;border-radius:6px;object-fit:contain;flex-shrink:0;display:block"
```

A 512×512 logo painted into a 28×28 box, carried in the JavaScript bundle where it cannot be cached
separately, cannot be lazily decoded, and — being base64 — cannot be compressed. Measured:

| variant | raw | gzip-9 | brotli-11 |
|---|---:|---:|---:|
| `book-consultation-modal.min.js` as shipped | 58,472 | 32,579 | 29,964 |
| same file, data URI swapped for a real `<img src>` | 25,875 | 7,794 | **6,637** |

**Replacing one data URI with a file reference removes 23,327 B of brotli — a 77.8 % cut — with zero
functional change.** This one edit is worth more than every other change in this document combined.

### 2.3 What it actually does

A 4-step consultation wizard (`Service → Practice → Contact → Review`, plus a success screen with a
generated `MT-XXXXXX` reference code), rendered **twice on every page load**:

1. an **inline card**, if `document.getElementById('hero-form-card')` exists (line 815) — home page only;
2. a **popup instance**, unconditionally appended to `<body>` (lines 830–832), roughly 98 static tags plus
   8 option cards, in addition to the inline copy.

Submission is a single `fetch` (line 740):

```js
fetch('https://api.builder.searchatlas.com/api/forms/566d4fdc-f54c-42ad-a5de-1cf7617636df/submit/', {
  method: 'POST',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
}).catch(function() { /* silent – UX proceeds regardless */ });
```

with a honeypot guard (`#mtfs-company_fax`, lines 712–716) that silently shows "success" without posting.

### 2.4 Dependency surface

Zero libraries, zero polyfills, zero build tooling. Platform APIs only: `fetch`, `MutationObserver`,
`requestAnimationFrame`, `setTimeout`, `Element.closest`, `HTMLElement.dataset`, `element.offsetParent`,
`document.head.appendChild`. It writes nothing to `localStorage`/`sessionStorage`. It reaches exactly one
network origin (`api.builder.searchatlas.com`) and only on submit. It injects its own stylesheet
(10,534 B of CSS in a template literal) into `<head>` at `init()`, so it has **no CSS dependency on
`mega-menu.css`** — which is what makes it cleanly extractable.

Two defects found while reading:

- Line 887: `window.MtfsModal = { open: function(btn) { init(); open(btn); } };` — there is no `open` in
  scope, so this resolves to `window.open(btn)` and opens a browser popup window. The public API is broken.
- Lines 822–826 build `popupContainer.innerHTML = buildPopupShell()` where `buildPopupShell()` returns
  `'<span></span>'`, and append that stray `<span>` to `<body>`. Dead node on every page.

### 2.5 Confirmed from the code: exactly which selectors open it

Only three selectors bind, all inside `wireTriggers()`:

```js
/* data-open-consult: on home page → scroll to inline card; elsewhere → popup */
Array.prototype.slice.call(document.querySelectorAll('[data-open-consult]')).forEach(function(el) {   // line 837
/* .mm-cta → popup */
Array.prototype.slice.call(document.querySelectorAll('.mm-cta')).forEach(function(el) {               // line 852
/* .open-consult-modal → popup */
Array.prototype.slice.call(document.querySelectorAll('.open-consult-modal')).forEach(function(el) {   // line 861
```

Each loop is guarded by `if (el.dataset.consultBound) return; el.dataset.consultBound = '1';`.

**There is no hash trigger, no `#consult`, and no idle trigger in the shipped code.** Counted across the
21 pages (markup only, `<script>`/`<style>` stripped):

| selector | occurrences in page markup |
|---|---|
| `[data-open-consult]` | **1** — one in-body link on `/about/`; every other instance is injected by `mega-menu.js` (`.mm-cta`, line 436, and the mobile-only nav link, line 426 — both of which also carry `data-open-consult`) |
| `.mm-cta` | **0** in markup — injected only |
| `.open-consult-modal` | **0 site-wide** — a dead selector |
| `#hero-form-card` | **1**, on `/` only |

Two consequences worth stating plainly:

1. Because `.mm-cta` also carries `data-open-consult`, the first loop claims it and the `.mm-cta` loop is a
   no-op. So on **`/` the popup is unreachable**: `heroSlot` exists, so every trigger takes the
   `scrollIntoView` branch. 25,875 B of popup code (post-logo-fix) and a whole second wizard instance are
   built on the home page and can never be opened.
2. The `MutationObserver` at lines 872–873 (`observer.observe(document.body, {childList:true, subtree:false})`)
   exists **only** because `mega-menu.js` injects `.mm-cta`/`data-open-consult` into `<body>` after this
   script may already have run. Once the header is SSR'd, the observer has no reason to exist and should be
   deleted — it is a permanent mutation callback on `<body>` for a race that no longer happens.

### 2.6 The correct lazy-load trigger set

Delete the eager `<script src="/assets/book-consultation-modal.min.js" defer>` from all 20 pages. In
`nav.js`, register a single capture-phase delegate plus a hash check:

| Trigger | Rule | Rationale |
|---|---|---|
| **Click, delegated** | one `document.addEventListener('click', …, true)` testing `e.target.closest('[data-open-consult], .mm-cta, .open-consult-modal')`; `e.preventDefault()`, `await import()`, then open | Reproduces all three shipped selectors with one listener and no `MutationObserver`. Keep `.open-consult-modal` even though it is currently unused — it is part of the documented public contract in the file's own banner. |
| **Hash `#consult`** | on load *and* on `hashchange` | **New capability, not present today.** It is what makes the CTAs work without JS: SSR the header CTA as `href="/contact/#consult"` so a no-JS visitor lands on the real contact page. Note in the changelog that this is an addition. |
| **Idle warm-up** | `requestIdleCallback(…, {timeout: 3000})` — **only** on pages that contain at least one trigger **and** do not contain `#hero-form-card` | On `/` the popup is unreachable (§2.5), so idle-warming it there is pure waste. Gate on `document.querySelector('[data-open-consult],.mm-cta,.open-consult-modal') && !document.getElementById('hero-form-card')`. |
| **Home-page inline card** | keep eager, but as its own small module | `#hero-form-card` is above-the-fold interactive content on `/`; deferring it behind intent would be a UX regression, and it is the element Lighthouse flags for `aria-progressbar-name`. |

Two accessibility defects live in this file and are **not** fixed by lazy loading — they must be fixed in
the code, because they also affect the eager inline card on `/`:

- `aria-progressbar-name` **fails on both instances** (`div#mtfsi-step-bar > div.mtfs-progress-track` and
  `div#mtfs-modal-root > … > div.mtfs-progress-track`). The element is
  `class="mtfs-progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="1"`
  with **no accessible name**. Add `aria-label="Consultation form progress"`.
- `aria-allowed-attr` **fails on all 8 `button.mtfs-option`** cards (Lighthouse names
  `div.mtfs-options-grid > button.mtfs-option`). They are `role="option"` carrying `aria-pressed` —
  `aria-pressed` is not allowed on `role="option"`. Switch to `aria-selected`, and update the CSS selector
  `.mtfs-option[aria-pressed="true"]` and the `setAttribute('aria-pressed', …)` calls to match.

---

## 3. `mega-menu.css` — rule groups, what dies with SSR, critical vs deferred

30,074 B / 1,248 lines. Every top-level and nested rule was walked and attributed:

| Group | bytes | % | Above the fold? |
|---|---:|---:|---|
| **Search overlay** (`.mm-search-*`, `.mm-result*`, `.mm-suggest-chip`, `.mm-ai-badge`, `.mm-no-results`, `.mm-score*`) | **8,135** | 27.0% | No — dialog is `visibility:hidden` until ⌘K |
| **Mega panels** (`.mm-panel*`, `.mm-item*`, `.mm-col*`, `.mm-pill`) | **6,563** | 21.8% | Base hidden state only (~200 B) |
| Nav bar links (`.mm-nav`, `.mm-caret`) incl. the ≤1180 drawer conversion | 3,587 | 11.9% | **Yes, all of it** |
| Burger + mobile drawer (`.mm-burger`, `.mm-mobile-*`, `.mm-menu-lock`) | 2,728 | 9.1% | Closed state yes, open state no |
| Header shell (`.mm-header`, `.mm-bar`, `.mm-injected` cleanup) | 2,398 | 8.0% | Yes |
| Tokens/globals (`:root`, `html` overflow guard) | 1,552 | 5.2% | Yes |
| Back to top (`.mm-back-to-top`) | 1,590 | 5.3% | Hidden base only (~180 B) |
| Right CTA cluster (`.mm-right`, `.mm-phone`, `.mm-cta`) | 1,215 | 4.0% | Yes |
| Site-wide design-system overrides (`body`, `.ctr`, `section.sec`, `.sc`, `.values`…) | 1,178 | 3.9% | Belongs to the page sheet, not the header |
| Logo (`.mm-logo`) | 572 | 1.9% | Yes |
| Comments / whitespace / banners | 556 | 1.8% | — |

### 3.1 Which rules die once the header is SSR'd with the same class names?

**Almost none.** This is the counter-intuitive answer and builders must internalise it: the SSR header emits
*the same class names*, so every `.mm-*` rule is still live. Only one rule group is genuinely dead:

```css
.mm-injected nav.nav,
.mm-injected header[role="banner"]:not(.mm-header),
.mm-injected #hdr,
.mm-injected #nav.nav { display: none !important; }
```

(mega-menu.css lines 1155–1158). It hides "legacy" page navs — and there are none: **0 `<nav>` elements in
20 of 21 pages** (only `/sitemap/` has one, and it is page content, not chrome). Delete it, and delete the
`document.documentElement.classList.add('mm-injected')` / `document.body.classList.add('mm-injected')` calls
with it.

What Lighthouse measures as unused is a *coverage* fact, not a *deletable* fact. `unused-css-rules` reports
**15,335 B of 30,074 B (51.0 %) unused on the home page**. That maps almost exactly onto the two on-demand
groups above: search overlay 8,135 + mega panels 6,563 = **14,698 B**, and the remainder is the legacy-nav
rule, the `prefers-reduced-motion` block, and the `.mm-mobile-open` state rules. Those rules are unused *at
load* and needed *on interaction*. The fix is **splitting**, not deleting.

### 3.2 Critical vs deferred split

Walking the file with a critical/deferred classifier (critical = anything that determines geometry or the
hidden-by-default state of chrome at first paint):

| | raw | minified | brotli-11 |
|---|---:|---:|---:|
| **Critical** (inline in `<head>`) | 16,050 | **11,257** | 2,356 |
| **Deferred** (async sheet) | 13,865 | **11,141** | 2,383 |

**Must be critical (non-negotiable, see §6):**

- `html { overflow-x: hidden; max-width: 100% }` and the `:root, .mm-header` custom-property block
- `.mm-header` and its `box-sizing` reset, `.mm-bar`, `.mm-header.mm-scrolled`
- `body::before` (the 4 px brand strip, `position:fixed; z-index:1001`)
- `.mm-logo`, `.mm-logo img`
- `.mm-nav`, `.mm-nav > li`, `.mm-nav a`, `.mm-nav button`, `.mm-caret`, `.mm-nav > li.mm-mobile-only`
- `.mm-right`, `.mm-phone`, `.mm-cta`, `.mm-search-btn` (+ `.mm-search-kbhint`)
- `.mm-burger` (`display:none` default) and the whole `@media (max-width:1180px)` nav/burger/drawer
  **closed-state** block — it converts `.mm-nav` to `position:fixed` off-canvas; deferring it guarantees CLS
- **the base hidden states**: `.mm-panel { position:fixed; opacity:0; visibility:hidden; pointer-events:none }`,
  `.mm-mobile-scrim`, `.mm-back-to-top { opacity:0; visibility:hidden }`, `.mm-search-overlay` base
- the ≤1280 / ≤1024 / ≤900 / ≤640 / ≤420 / ≤360 rules that touch header shell, nav, logo, burger, CTA cluster

**Safe to defer:** every `.mm-panel-grid` / `.mm-col` / `.mm-item*` / `.mm-panel-feature` / `.mm-panel-foot`
rule; `.mm-panel.mm-open`; `.mm-back-to-top.mm-visible` and its hover; the entire search-overlay interior
(`.mm-search-modal`, `.mm-search-input-row`, `.mm-search-status`, `.mm-result*`, `.mm-suggest-chip`,
`.mm-no-results`, `.mm-search-footer`); the `.mm-header.mm-mobile-open .mm-nav` open-state rules; the
site-wide design-system block (it belongs in the page's own critical CSS, not the header's).

**Ship the search-overlay CSS with `search.js`, not in the site sheet.** It is 8,135 B (27 %) for a feature
behind ⌘K.

---

## 4. The LPS visitor tracker — every timer, listener and layout read

Inline in every page's `<head>`, inside `<!-- LPS Visitor Tracker Start -->`: **7,175 B of block,
7,090 B of JavaScript**, un-cacheable, re-sent on every page view (× 21 pages).

Composition:

| Sub-system | bytes | % |
|---|---:|---:|
| `try{}` wrapper + IIFE + 3 endpoint constants | 272 | 3.8% |
| `g()`/`sid()`/`post()`/`base()` id + transport helpers | 840 | 11.8% |
| `ro()` conversion-target resolver | 592 | 8.3% |
| click → `/api/event/` (CTA / TEL / FORM_SUBMIT) | 292 | 4.1% |
| 25 %-scroll-depth event | 289 | 4.1% |
| first-interaction event | 291 | 4.1% |
| **section-engagement subsystem** | **4,514** | **63.7%** |

### 4.1 Complete inventory

**Timers (1 interval + 5 timeout sites):**

| # | Site | Interval / delay |
|---|---|---|
| 1 | `setInterval(function(){if(!document.hidden&&Object.keys(SEC).length)sendSE()},5000)` | **every 5 s, forever** |
| 2 | `clkT=setTimeout(sendSE,400)` — click debounce | 400 ms per click |
| 3 | `bootSE`: `setTimeout(scanSE,1200)` | 1.2 s |
| 4 | `bootSE`: `setTimeout(scanSE,3000)` | 3 s |
| 5 | `resetSE`: `setTimeout(scanSE,600)` | 600 ms (per SPA nav) |
| 6 | `resetSE`: `setTimeout(scanSE,1800)` | 1.8 s (per SPA nav) |

**Listeners (10) + 1 observer + 3 monkey-patches:**

| # | Target | Event | Handler |
|---|---|---|---|
| 1 | `window` | `popstate` | `t` (pageview → `/api/track/`) |
| 2 | `document` | `click` *(capture)* | CTA/TEL/FORM_SUBMIT → `/api/event/` |
| 3 | `window` | `scroll` *(passive)* | `sc` — 25 % depth, self-removing |
| 4 | `document` | `click` *(capture)* | first-`interaction` event, one-shot |
| 5 | `window` | `scroll` *(passive)* | depth tracking + rAF → `recomputeSE()` |
| 6 | `document` | `click` *(capture)* | section clicks / cta_clicks / rage_clicks |
| 7 | `window` | `visibilitychange` | `flushSE()` on hidden, `lastTs` reset on visible |
| 8 | `window` | `focus` | `lastTs = Date.now()` |
| 9 | `window` | `pagehide` | `flushSE` |
| 10 | `window` | `popstate` | `navSE` |
| — | — | `IntersectionObserver` | `threshold:[0,0.2,0.5,0.75,1]`, callback **ignores its entries** and calls `recomputeSE()` |
| — | `history.pushState` | patched **twice** (once → `t`, once → `navSE`) | |
| — | `history.replaceState` | patched once (→ `navSE`) | |
| — | `window` | `DOMContentLoaded` | `bootSE` (conditional) |

**Layout-reading calls, by site:**

| Site | Reads |
|---|---|
| `recomputeSE()` | `window.innerHeight`, then `s.el.getBoundingClientRect()` **per tracked section**, plus `document.body.contains(s.el)` and a `document.querySelector` per stale section |
| scroll handler #5 | `h.scrollHeight`, `window.pageYOffset ‖ h.scrollTop`, `window.innerHeight` — **synchronously, outside the rAF** |
| `sc()` (#3) | `h.scrollHeight`, `h.clientHeight`, `window.pageYOffset ‖ h.scrollTop` |
| `sendSE()` | `window.innerWidth` |
| `scanSE()` → `topSecs()` | `document.querySelectorAll("section,header,footer")` then an **O(n²)** `q.filter(e => !q.some(o => o !== e && o.contains(e)))` |

### 4.2 The offending lines, quoted

The forced synchronous layout inside `recomputeSE()`:

```js
function recomputeSE(){var vh=window.innerHeight||1,mid=vh/2,best=null;for(var k in SEC){var s=SEC[k];
if(!document.body.contains(s.el)){var f=document.querySelector('[data-section-id="'+k+'"]');…}
var r=s.el.getBoundingClientRect();
var vis=Math.max(0,Math.min(vh,r.bottom)-Math.max(0,r.top));…}tickSE();active=best}
```

The scroll handler that reads layout **before** entering the rAF — this is the real per-scroll-event reflow,
and it fires whether or not any section is tracked:

```js
addEventListener("scroll",function(){var h=document.documentElement;
var y=window.pageYOffset||h.scrollTop||0;
var dh=h.scrollHeight||1;
var d=(y+(window.innerHeight||0))/dh;
if(d>maxDepth)maxDepth=d;if(y>downMax)downMax=y;else if(downMax-y>200)revScroll=true;
if(!rafP){rafP=true;requestAnimationFrame(function(){rafP=false;recomputeSE()})}},{passive:true});
```

The 5-second heartbeat:

```js
setInterval(function(){if(!document.hidden&&Object.keys(SEC).length)sendSE()},5000);
```

The `IntersectionObserver` that throws away its own entries and does a full rect scan instead:

```js
var io=window.IntersectionObserver?new IntersectionObserver(function(){recomputeSE()},
{threshold:[0,0.2,0.5,0.75,1]}):null;
```

The O(n²) section scan, run 3× on boot and 3× more per SPA navigation:

```js
function topSecs(){var q=[].slice.call(document.querySelectorAll("section,header,footer"));
return q.filter(function(e){return !q.some(function(o){return o!==e&&o.contains(e)})})}
```

### 4.3 The decisive fact: the section-engagement payload is always empty

`scanSE()` skips every candidate that lacks a `data-section-id` attribute:

```js
var k=e.getAttribute("data-section-id"); if(!k)continue;
```

**Not one element in any of the 21 pages carries `data-section-id`.** Verified by stripping all
`<script>`/`<style>` blocks and re-counting: every page shows 4 occurrences of the string and **0 outside
`<script>`** — all four are inside the tracker's own source (`'[data-section-id="'+k+'"]'`,
`e.getAttribute("data-section-id")`, `t.target.closest("[data-section-id]")`).

Therefore, on the live site:

- `SEC` is `{}` forever → `for(var k in SEC)` in `recomputeSE()` iterates **zero times**, so
  `getBoundingClientRect()` is in fact never called;
- `sendSE()` returns at `if(!ks.length)return` → `/api/section-engagement/` receives **nothing, ever**;
- the 5 s `setInterval` wakes the main thread 12× per minute to evaluate `Object.keys(SEC).length` and
  return;
- the remaining real cost is the scroll handler's `h.scrollHeight` read (a genuine forced reflow on every
  scroll event, independent of `SEC`), the two `scroll` listeners, six `click` capture listeners, and
  6 × `topSecs()` O(n²) DOM scans per page load.

**4,514 B — 63.7 % of the inline tracker — produces zero analytics.** It is not "analytics we must not
drop"; it is instrumentation wired to attributes that were never emitted.

### 4.4 Minimal changes that keep the same payload

The payload that must be byte-for-byte preserved is: the `/api/track/` pageview (fired at parse time and on
`pushState`/`popstate`) and the `/api/event/` events (`CTA`, `TEL`, `FORM_SUBMIT`, `scroll`, `interaction`)
with the same `base()` fields — `project_id`, `tracking_secret`, `visitor_id` (localStorage `_lps_vid`),
`session_id` (sessionStorage `_lps_sid`), `page_url`, `referrer`. Nothing else is currently sent.

| # | Change | Effect |
|---|---|---|
| 1 | **Delete `setInterval(…,5000)`.** Flush on `visibilitychange` → `hidden` and on `pagehide` (both already exist and both already call `flushSE`). Add `navigator.sendBeacon` — already the preferred path in `sendSE()`. | Removes 12 main-thread wakeups/min. No payload change: the heartbeat never posted anything, and a `visibilitychange` flush is strictly more reliable than a 5 s poll. |
| 2 | **Delete `recomputeSE()`'s rect loop.** Let the `IntersectionObserver` callback consume its own `entries`: `entry.isIntersecting` → `seen`, `entry.intersectionRatio` → dwell attribution, `entry.boundingClientRect` → the rect the observer *already computed off the main thread*. | Removes every `getBoundingClientRect()` from the scroll path. Identical `seen` / `dwell_ms` semantics. |
| 3 | **Move `h.scrollHeight` / `pageYOffset` / `innerHeight` inside the rAF.** They currently execute in the listener body, before `requestAnimationFrame`. | Removes the one forced reflow that actually fires today. `max_depth` and `reverse_scrolled` are unchanged — they are sampled at most once per frame either way. |
| 4 | **Merge the two `scroll` listeners into one**, and merge the three capture-phase `click` listeners into one dispatcher that runs `ro()` once. | 5 listeners → 2. `ro()` currently runs up to twice per click. |
| 5 | **Gate the whole section-engagement subsystem** behind `if (document.querySelector('[data-section-id]'))`. | Zero behaviour change today (nothing matches). Preserves the capability for when `render.mjs` starts emitting `data-section-id` on sections. |
| 6 | **Replace the two `pushState` patches with one.** `history.pushState` is currently wrapped twice — once calling `t()`, once calling `navSE()`. Wrap once, call both. | One indirection instead of two on every SPA navigation. |
| 7 | **Delete `topSecs()`'s O(n²) filter.** `document.querySelectorAll('[data-section-id]')` returns the tracked set directly; no containment filtering needed. | Removes 6 O(n²) DOM scans per page load. |
| 8 | **Move it out of the inline `<head>` into `/assets/analytics.<hash>.js` with `defer`**, hashed and `immutable`-cached. | 7,090 B × 21 pages of un-cacheable inline JS → one 1-year-cacheable file. Also unblocks a strict CSP (no inline script hash to maintain). |

> **`analytics.js` budget: ≤ 2,400 B minified, ≤ 1,000 B brotli** with the section-engagement subsystem
> gated (helpers 840 + `ro()` 592 + three event handlers 872 ≈ 2,304 B today, before minification of the
> merged listeners).

**Constraint for builders:** if `render.mjs` ever emits `data-section-id` on `<section>` elements, that turns
the section-engagement endpoint **on** for the first time. That is a behaviour change, not a preservation.
Do not do it silently — either leave sections untagged (matching today), or tag them and record it as a
deliberate analytics addition in the changelog.

### 4.5 The other three inline scripts

| Block | bytes | Verdict |
|---|---:|---|
| `ws:form-submit-shim` | 4,708 | **Keep**, but move to `/assets/form-shim.<hash>.js` deferred, and load it only on pages containing `form[action*="/api/forms/"]`. It binds a `submit` handler that harvests fields, POSTs JSON, and swaps in a success card. It is real functionality. |
| `ws:page-observer` | 3,411 | **Delete** (contract pass 1). It `postMessage`s `PAGE_CHANGED` to `window.parent`, drives a `MutationObserver` on every `[id^='page-']` element with `attributeFilter:["class","style"]`, listens for `NAVIGATE_TO_VIRTUAL_PAGE`, and scans `document.querySelectorAll("[onclick]")`. All of it is builder-preview machinery. It also `fetch("/pages.manifest.json")` → **404** (measured). |
| AOS + FAQ script | 575 | **Keep, rewrite.** It currently does `document.querySelectorAll('.aos').forEach(el => { new IntersectionObserver(…).observe(el) })` — **one observer per element**, 25 observers on the home page, never disconnected. Use one observer for all elements and `unobserve` after the first intersection. The FAQ half is fine but should set `aria-expanded` from SSR'd markup rather than assuming it. |
| Builder dev taps | 246 + 113 | **Delete** (contract pass 1). Three 404s measured: `/src/lib/routeNotifier.ts`, `/src/lib/virtualPageObserver.ts`, `/src/lib/inspector.ts`. |

`.aos` element counts vary per page (home 25, `/services/` 18, `/contact/` 11, several service pages 7–11,
`/about/` `/our-team/` `/privacy-policy/` `/terms-of-service/` `/404/` 0) — so the AOS module should be
skipped entirely when the page contains no `.aos`.

---

## 5. `fonts.css` — 14 blocks, 4 files, 2 that matter

**14 `@font-face` blocks. 14 `url()` references. 4 unique `.woff2` files.** All 14 set `font-display: swap`
(Lighthouse `font-display` passes).

| Unique file | Family | Weights declared | Subset |
|---|---|---|---|
| `5d18d31d23ada61ebee1d589b11d5da3.woff2` | DM Sans | 400, 500, 600, 700 (×4 blocks) | latin-ext |
| `ca72d2bcea8f4daa783dbdfa2d9b4606.woff2` | DM Sans | 400, 500, 600, 700 (×4 blocks) | **latin** |
| `08e1ba85bcb55277782f56766af09467.woff2` | Sora | 600, 700, 800 (×3 blocks) | latin-ext |
| `811e11966d29f3a01fcb19b087b61ac0.woff2` | Sora | 600, 700, 800 (×3 blocks) | **latin** |

All four live on `https://media.cdn.builder.searchatlas.com/site-assets/e311c34b-e043-4493-8bbe-3b526ea53fd2/`.

### 5.1 Which are used above the fold — measured, not inferred

`network-requests` in `lh-mobile.json` shows the browser requested **exactly two** font files on the home page:

```
-1   0  Font  …/ca72d2bcea8f4daa783dbdfa2d9b4606.woff2   ← DM Sans, latin
-1   0  Font  …/811e11966d29f3a01fcb19b087b61ac0.woff2   ← Sora,    latin
```

(`statusCode -1` because the CDN host was unreachable in the sandbox; the *request* is the evidence.)
**Neither latin-ext file was requested.** Confirmed independently by scanning the home page's visible text
for codepoints outside the `latin` `unicode-range`: there is exactly one — `→` U+2192 — and U+2192 is in
**neither** range (latin covers U+2191 and U+2193 but not U+2192), so it falls back to a system font and
triggers no download. A minor fidelity bug worth fixing by swapping `→` for an inline SVG or U+2192's
in-range sibling in the `.mtfs-related__arrow` markup.

Both requested files are needed above the fold:
- `body { font-family: 'DM Sans', sans-serif; … }` — nav links, CTA, hero sub-copy;
- `h1,h2,h3,h4 { font-family: 'Sora', sans-serif; … }` — and **`largest-contentful-paint-element` is
  `section.hero > div.hero-inner > div.hero-copy > h1#h1`**, a text node in Sora.

### 5.2 The correct preload set — exactly these two URLs

```html
<link rel="preload" as="font" type="font/woff2" crossorigin fetchpriority="high"
      href="https://media.cdn.builder.searchatlas.com/site-assets/e311c34b-e043-4493-8bbe-3b526ea53fd2/811e11966d29f3a01fcb19b087b61ac0.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="https://media.cdn.builder.searchatlas.com/site-assets/e311c34b-e043-4493-8bbe-3b526ea53fd2/ca72d2bcea8f4daa783dbdfa2d9b4606.woff2">
```

Sora first and at `fetchpriority="high"` because it paints the LCP element; DM Sans second. `crossorigin` is
mandatory — fonts are fetched in CORS mode and a preload without it is fetched twice.

Also required:

```html
<link rel="preconnect" href="https://media.cdn.builder.searchatlas.com" crossorigin>
```

**Do not preload the two latin-ext files.** They are never fetched; preloading them would cost two requests
and earn a "preloaded but not used within a few seconds" console warning.

### 5.3 Other actions

- **Inline `fonts.css` into the critical block and delete the `<link>`.** The whole file is 6,688 B raw but
  only **460 B brotli** — it is 14 near-identical blocks. Inlining it removes one render-blocking request
  and, per `render-blocking-resources`, **152 ms of the measured 380 ms**.
- Do **not** collapse the 14 blocks into 4 by writing `font-weight: 400 700`. The same physical file backs
  four weights, which means either it is a variable font (in which case a range is correct) or it is a
  static 400 file being labelled 700 (in which case a range makes the browser synthesise bold and the
  rendering changes). Without being able to fetch and parse the `fvar` table, keep the 14 explicit blocks —
  they cost 460 B brotli.
- **Cross-origin fonts on a third-party CDN sit outside `_headers`.** `_headers` cannot set
  `Cache-Control` on `media.cdn.builder.searchatlas.com`. Note this as an accepted risk; self-hosting the
  four `.woff2` under `/assets/fonts/` would bring them under the existing
  `/assets/* → max-age=31536000, immutable` rule and remove a DNS + TLS handshake. Flag it as a follow-up,
  not part of this refactor (it changes asset URLs).

---

## 6. FOUC / CLS when moving from JS-injected header to SSR header

### 6.1 Why today's CLS is only 0.005 — and why that is luck, not design

`.mm-header { position: fixed; top: 4px; … }`. Nothing reserves space for it: there is **no
`body { padding-top: … }`** anywhere in `mega-menu.css`. The header is a pure overlay; the hero clears it
with its own `.hero { padding: 120px 0 90px }`. Because the header is out of flow *and* the CSS is
render-blocking, injecting it late shifts nothing. Measured CLS 0.005, `layout-shifts` reports **one** shift,
on `body.mm-injected > main#main > section.sec`.

### 6.2 The specific risk SSR introduces

Once `<header class="mm-header">` is the first child of `<body>` in the HTML, an unstyled or
not-yet-styled header is **in flow**. And the hidden state of every piece of chrome comes *only* from CSS:

```css
.mm-panel { position: fixed; top: 96px; …; opacity: 0; visibility: hidden; pointer-events: none; … }
.mm-burger { display: none; }                       /* until @media (max-width:1180px) */
.mm-back-to-top { …; opacity: 0; visibility: hidden; … }
```

and, at ≤1180 px, the nav is converted into a fixed off-canvas drawer:

```css
.mm-nav { display: flex !important; flex-direction: column; position: fixed !important;
          top: 76px; right: 0; width: min(430px,100vw); height: calc(100dvh - 76px); … }
```

So if the header's CSS is deferred or async, the first paint shows: the logo, the nav list, **all three mega
panels fully expanded in flow** (144 elements, 12 service links with icons and blurbs, plus the two feature
asides), the back-to-top button, and — if it is SSR'd — the entire search dialog. On mobile the nav renders
as an in-flow stack that then snaps to a fixed drawer. That is a multi-thousand-pixel content jump and a
catastrophic CLS.

### 6.3 How to avoid it — six rules, all mandatory

1. **Inline the header's critical CSS in `<head>`, before any markup.** Never `media="print" onload` it,
   never `rel=preload as=style onload`, never put it in the async sheet. Measured cost: 11,257 B minified.
   Marginal document cost after brotli, measured on a synthetic assembly of the real home page:
   **+1,931 B**.
2. **Ship the hidden-by-default states in that inline block.** `.mm-panel`, `.mm-mobile-scrim`,
   `.mm-back-to-top`, `.mm-search-overlay` base rules. These are ~200 B each and they are the difference
   between a clean paint and a 2,000 px reflow.
3. **Ship the entire `@media (max-width:1180px)` nav/burger/drawer *closed* state inline.** This is the
   single most dangerous block to defer. Its open-state siblings (`.mm-header.mm-mobile-open .mm-nav`, drawer
   item typography) can go in the async sheet.
4. **Do not SSR the search overlay.** Its 24 elements and 1,565 B of markup belong to `search.js`, which
   injects them on first open. That removes the need to ship `.mm-search-overlay`'s hidden state at all and
   takes 8,135 B of CSS off the critical path.
5. **Reserve the header's height in a token, not by accident.** Add
   `:root { --mm-header-h: 80px } @media (max-width:1180px){ :root{--mm-header-h:76px} }` to the inline block
   and have `scroll-padding-top: var(--mm-header-h)` on `html` so in-page anchors are not hidden behind the
   fixed bar. Keep `.hero`'s existing padding — do **not** add `body{padding-top}`, which would double the
   offset and shift every page.
6. **Give the logo explicit dimensions.** Today `mega-menu.js` emits
   `style="height:44px;width:auto;max-width:220px;…"` (an inline `style=`, which the contract forbids).
   SSR it as `width` / `height` attributes plus a class, so the intrinsic box is reserved before the image
   from `media.cdn.builder.searchatlas.com` (measured: **unreachable in the LH run**, so this is a real
   failure mode) resolves.

Also fold in, since they are in the same markup:

- `<a class="mm-cta" href="/contact/" data-open-consult role="button">` and the mobile-only twin at line 426
  both put `role="button"` on an `<a href>`. That overrides the link role, breaks middle-click and
  open-in-new-tab, and contradicts the contract's "every nav link has descriptive text / real `<button>` for
  disclosure". SSR them as plain links to `/contact/#consult`; JS upgrades them to modal openers.
- `<button class="mm-search-close" id="mm-search-close" aria-label="Close search">ESC</button>` has visible
  text "ESC" and accessible name "Close search" — a `label-content-name-mismatch` shape. Wrap the visible
  text: `<button aria-label="Close search"><span aria-hidden="true">ESC</span></button>`.
- Lighthouse's measured `label-content-name-mismatch` and `link-text` failures are on `div.ctr > div.sg >
  article.dc > a.lk` — five links reading **"Learn More"** pointing at the five
  `/services/management-services/*` children. `renderRelated()`/the page templates must emit descriptive
  text built from `routes[].navLabel` (e.g. "Learn more about Marketing"). `heading-order` fails on
  `footer … h4.il27`; `renderFooter()` must not open at `<h4>`.
- The home page carries **two** `<link rel="preload" as="image" fetchpriority="high">`. The contract's
  `preload-lcp` pass allows exactly one — and on `/` the measured LCP element is `h1#h1`, a *text* node, so
  the correct high-priority preload there is the **Sora latin woff2**, not an image. (Caveat: the LH run had
  the image CDN unreachable, which can change which element wins LCP. The pass must therefore decide from
  the page's own above-the-fold content, and must never emit more than one.)

### 6.4 SSR does not reduce DOM size — say so honestly

`dom-size` fails at 903 elements. SSR moves the header's 207 nodes from script-built to parser-built; it does
not delete them. Realistic reduction: −24 (search overlay → `search.js`) and −~30 if the decorative
`.mm-panel-feature` asides and `.mm-panel-foot` rows are trimmed, landing near **~850 elements** — still over
Lighthouse's 800-element threshold, which is driven by the page body, not the chrome. **The SSR win is the
561.6 ms of measured Style & Layout work and crawlability (0 `<nav>` in 20 of 21 pages today), not element
count.** Do not promise a DOM-size pass from this change.

---

## 7. Byte-budget table

### 7.1 Current vs target — first load, home page

| Resource | When | Today raw | Today br | **Target raw** | **Target br** |
|---|---|---:|---:|---:|---:|
| `/` document | document | 88,297 | 18,924 | **≤ 100,000** | **≤ 21,000** |
| `/assets/css/fonts.css` | render-blocking | 6,688 | 460 | *inlined — 0 requests* | *0* |
| `/assets/mega-menu.css` | render-blocking | 30,074 | 5,357 | *split — see below* | — |
| `/assets/mtfs-images.css` | render-blocking | 3,128 | 782 | *merged — see below* | — |
| `/assets/site.<hash>.css` | async, non-blocking | — | — | **≤ 16,000** | **≤ 3,600** |
| `/assets/mega-menu.min.js` | `defer` | 29,331 | 7,300 | *replaced* | — |
| `/assets/nav.<hash>.js` | `defer` | — | — | **≤ 3,000** | **≤ 1,300** |
| `/assets/analytics.<hash>.js` | `defer` | *(7,090 inline)* | — | **≤ 2,400** | **≤ 1,000** |
| `/assets/book-consultation-modal.min.js` | `defer`, every page | 58,472 | 29,964 | *lazy* | — |
| **FIRST-LOAD TOTAL** | | **215,990** | **62,787** | **≤ 121,400** | **≤ 26,900** |

Served today with **no `Content-Encoding`**, so the honest comparison is **215,990 B on the wire today vs
≤ 26,900 B brotli** — an **87.5 % reduction** — and ≤ ~31,500 B if only gzip is negotiated.
Render-blocking requests: **3 → 0**. JS bytes before first interaction: **87,803 → ≤ 5,400**.

### 7.2 Lazily loaded — never on first load

| Resource | Trigger | Target raw | Target br |
|---|---|---:|---:|
| `/assets/consult-modal.<hash>.js` | click on `[data-open-consult], .mm-cta, .open-consult-modal`; `#consult` hash; gated idle | **≤ 26,000** | **≤ 7,000** |
| `/assets/search.<hash>.js` (+ its 8,135 B of CSS) | `#mm-search-open` click, ⌘/Ctrl+K | **≤ 5,000** | **≤ 1,800** |
| `/assets/search-index.<hash>.json` | with `search.js` | **≤ 7,500** | **≤ 2,000** |
| `/assets/form-shim.<hash>.js` | only on pages with `form[action*="/api/forms/"]` | ≤ 4,800 | ≤ 1,600 |

`consult-modal` raw is set from the measured 25,875 B (the shipped minified file with the base64 PNG replaced
by a file reference); its brotli target 7,000 B is above the measured 6,637 B to leave headroom for the
`aria-selected` and `aria-label` fixes.

### 7.3 Deleted outright

| Item | Bytes removed | Where |
|---|---:|---|
| Base64 512×512 PNG inside the modal JS | **32,626** | `book-consultation-modal.js` line 530 |
| `SEARCH_INDEX` from the nav bundle | 8,685 | → build artifact from `routes[]` |
| Search overlay behaviour + chips + engine | 6,015 | → `search.js` |
| `ICONS` strings | 4,391 | → SSR'd inline |
| `HEADER_HTML` + builders + service data | 6,623 | → `render.mjs` |
| Section-engagement subsystem (gated to no-op) | 4,514 × 21 pages | inline LPS tracker |
| `ws:page-observer` | 3,411 × 21 pages | inline |
| Builder dev taps (`route-notifier`, `inspector`) | 359 × 21 pages | inline; also kills **4 × 404 per page** |
| `data-lps-eid` attributes | **11,176** on `/` alone | every page |
| Inline `on*` handlers (38–48/page) | 1,623 on `/` | every page |
| Duplicated `<style id="mtfs-context-links">` (319 B) + `<style id="mtfs-visible-related-links">` (1,850 B) | **43,351** across 20 pages | → one hashed, `immutable`-cached sheet |
| `.mm-injected` legacy-nav-hiding rules | ~200 | `mega-menu.css` 1155–1158 |

### 7.4 Measured verification of the document budget

A synthetic assembly of the real `index.html` — SSR header markup injected, header critical CSS inlined,
dev taps / `data-lps-eid` / `on*` handlers / no-cache metas stripped:

| Stage | raw B | brotli-11 B |
|---|---:|---:|
| `index.html` today | 88,297 | 18,924 |
| + inline header critical CSS | 99,569 | 20,855 (+1,931) |
| + SSR header markup (13,725 B) | 113,294 | 22,478 (+1,623) |
| − dev taps, `data-lps-eid`, `on*` handlers, no-cache metas | **96,614** | **19,973** |

The SSR'd, self-contained document is **1,049 B brotli larger** than today's — and it costs **zero**
render-blocking stylesheets and **zero** JS to render the header.

---

## 8. Hard constraints for the build agents

1. `nav.js` ≤ 3,000 B minified. If it exceeds that, data or markup has leaked back into the script — fail
   the build, do not raise the budget.
2. The search index is a **build artifact** generated from `routes[]` in `site.config.mjs`. Never hand-write
   it. Fold the "OvaTools LMS" alias keywords into `/services/lab-solutions/real-time-monitoring/`'s
   `keywords`.
3. Header critical CSS is **inlined in `<head>`**, never async. The four hidden-by-default base rules
   (`.mm-panel`, `.mm-mobile-scrim`, `.mm-back-to-top`, `.mm-search-overlay`) and the entire
   `@media (max-width:1180px)` drawer *closed* state are part of it.
4. Never SSR the search overlay. Never SSR anything the user has not asked for.
5. Delete the base64 PNG from the modal before anything else. Emit a real image asset.
6. Preload exactly two fonts, by the exact URLs in §5.2, with `crossorigin`.
7. The section-engagement subsystem must remain a no-op unless `[data-section-id]` is deliberately emitted;
   tagging sections is an analytics *addition* and must be recorded as such.
8. `_headers` cannot govern `media.cdn.builder.searchatlas.com`. Anything served from there is outside the
   cache policy — note it, do not pretend otherwise.
