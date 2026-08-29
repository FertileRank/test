# `snippets/` — copy-paste blocks for Search Atlas Website Studio

Much of medtech4solutions.com is edited inside the **Website Studio UI** (builder.searchatlas.com,
project `e311c34b-e043-4493-8bbe-3b526ea53fd2`) rather than in this repository. These seven files are
the Studio-side equivalent of what `build/sync.mjs` emits, so an editor who never touches the repo can
still ship the corrected chrome.

**`build/sync.mjs` is the authority.** These snippets are transcribed from its real output in
`dist/` — not written by hand, not illustrative. If the two ever disagree, the build wins and the
snippet is stale. Re-copy from `dist/` rather than editing a snippet in place.

---

## 1. The seven files

| File | Kind | Studio destination | Appears once per… |
|---|---|---|---|
| `00-README.md` | docs | — | — |
| `10-head-critical.html` | paste block | **Global head embed**, position 1 | site |
| `20-head-schema.html` | paste block | Block A -> **Global head embed**, position 2. Blocks B/C -> **per-page head** | A: site · B/C: page |
| `30-body-header.html` | paste block | **Global header** region (or top of the global body embed) | site |
| `40-body-footer.html` | paste block | **Global footer** region | site |
| `50-body-deferred-scripts.html` | paste block | **Global body embed**, last block on the page | site |
| `60-headers-and-redirects.txt` | reference | `_headers` / `_redirects` in project publish settings | site |

Website Studio wraps its global embeds in HTML comment markers, which are visible in the export and
are the reliable way to find them in a published page:

```
<!-- ws:header-embeddings start -->   ... global head embed ...   <!-- ws:header-embeddings end -->
<!-- ws:footer-embeddings start -->   ... global body embed ...   <!-- ws:footer-embeddings end -->
<!-- ws:form-submit-shim start -->    ... platform form handler, KEEP ...
<!-- ws:page-observer start -->       ... editor preview only, DELETE ...
```

---

## 2. Required order

Order is load-bearing. Getting it wrong is not cosmetic — three of these blocks change what the
browser paints before it has any CSS.

**Inside `<head>`, top to bottom**

1. `<meta charset>` — must land inside the document's first 1024 bytes. Deleting the head GTM script
   (section 4 below) is what makes this true again; in the export the charset sits *after* a 381-byte
   script, which is a spec violation.
2. `<meta name="viewport">`
3. `10-head-critical.html` — preconnect, font preloads, inline critical CSS, then the non-blocking
   site stylesheet.
4. `20-head-schema.html` Block A (Organization + WebSite), byte-identical on all 21 pages.
5. `20-head-schema.html` Block B (WebPage + BreadcrumbList + optional Service), per page.
6. `20-head-schema.html` Block C (FAQPage), **only** on the two pages that render a visible FAQ.

The critical CSS must come **before** the site stylesheet link and **before** any page-level `<style>`
the Studio emits, because `mega-menu.css`'s trailing site-wide override section deliberately beats the
page blocks at equal specificity (`section.sec,.sec{padding-top:88px}` over the home page's own
`section.sec{padding:100px 0}` — 88px is what renders today and must keep rendering).

**Inside `<body>`, top to bottom**

1. `30-body-header.html` — skip link, GTM `<noscript>`, `<header>`, mobile scrim, back-to-top button.
   The skip link must be the **first node in `<body>`**. In the export it is on 3 of 21 pages *and*
   `mega-menu.js` used `insertAdjacentHTML('afterbegin', HEADER_HTML)`, which put the header ahead of
   it — so it sat about ten tab stops deep and skipped nothing.
2. `<main id="main">` … page content … `</main>` — the Studio page body. Every page needs this
   wrapper; only 3 of 21 have one today. It is the skip-link target.
3. `40-body-footer.html`
4. `50-body-deferred-scripts.html` — always last.

---

## 3. Per-page edits these blocks cannot do for you

A Studio global block is one block for every page, so two things must be set per page. Both spots are
marked with `>> PER-PAGE` comments in the files.

- **`aria-current="page"`** on the nav link and the footer link that point at the page being viewed,
  plus `class="mm-active"` on the header one. The build derives these from `currentRoute`; a global
  paste block cannot. Do **not** reintroduce the export's runtime fix for this — `mega-menu.js` ran a
  `new RegExp()` loop over `data-mm-match` attributes on every page load, and it is deleted on purpose.
- **Block B of `20-head-schema.html`**, whose canonical, title, description and breadcrumb trail are
  all page-specific.

If your Studio plan exposes only one global header and no per-page header override, leave
`aria-current` off entirely rather than hard-coding it to Home. A wrong `aria-current` is worse than
a missing one: it tells a screen-reader user they are on a page they are not on.

---

## 4. DELETE from the current project first

Paste nothing until these are gone. Several of the new blocks are actively harmful alongside the old
ones — two stylesheets fighting, two GTM containers, two header implementations.

**From the global head embed / project custom code**

| Delete | Why | Measured |
|---|---|---|
| The inline `<script>` GTM container between `<!-- Google Tag Manager -->` and `<!-- End Google Tag Manager -->` | It is the first element in `<head>`, ahead of `<meta charset>`, and it is synchronous | 381 B, pushes charset out of the first 1024 bytes |
| The second, empty `<!-- Google Tag Manager --> <!-- End Google Tag Manager -->` comment pair inside `ws:header-embeddings` | Duplicate marker left by the builder | — |
| `<script id="sa-dynamic-optimization" src="https://dashboard.fertilerank.com/scripts/dynamic_optimization.js" defer>` | Re-added by `50-body-deferred-scripts.html` behind the idle loader, with the same `data-uuid` | — |
| `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">` | Overrides `_headers`; forces a full re-download every visit | see `60-headers-and-redirects.txt` |
| `<meta http-equiv="Pragma" content="no-cache">` | Same | — |
| `<meta http-equiv="Expires" content="0">` | Same | — |
| `<link rel="stylesheet" href="/assets/css/fonts.css?v=20260723">` | Its 14 `@font-face` blocks are inlined by `10-head-critical.html` | 6,688 B raw, 152 ms render-blocking |
| `<link rel="stylesheet" href="/assets/mega-menu.css?v=20260722">` | Split into the inline critical block + `/assets/site.<hash>.css` | 30,074 B, 602 ms render-blocking |
| `<link rel="stylesheet" href="/assets/mtfs-images.css?v=20260722">` | CLS-critical 528 B subset inlined; the rest folded into the site sheet | 3,128 B, 302 ms render-blocking |
| `<script src="/assets/mega-menu.min.js?v=20260722" defer>` | Replaced by the server-rendered header + `nav.js` | 29,331 B |
| `<script src="/assets/book-consultation-modal.min.js?v=20260722" defer>` | Now loaded on first intent only, by `consult-modal.js` | 58,472 B on every page |
| `<style id="mtfs-context-links">` and `<style id="mtfs-visible-related-links">` | Byte-identical on 20 pages each; moved into the hashed, year-cached site sheet | 319 B + 1,850 B per page |
| The inline **LPS Visitor Tracker** `<script>` between `<!-- LPS Visitor Tracker Start -->` and `<!-- LPS Visitor Tracker End -->` | Replaced by the deferred, cacheable `/assets/analytics.<hash>.js`. Payloads are preserved byte-for-byte | 7,090 B inline per page, un-cacheable |
| `<script type="module" data-lps-tap="route-notifier">` | Imports `/src/lib/routeNotifier.ts` and `/src/lib/virtualPageObserver.ts` — both 404 | 2 x 404 per page |
| `<script data-lps-tap="inspector">` | Imports `/src/lib/inspector.ts` — 404 | 1 x 404 per page |
| Both `<link rel="preload" as="image" fetchpriority="high">` tags | `10-head-critical.html` preloads the two fonts instead; the measured LCP element on `/` is `h1#h1`, a text node in Sora | — |
| `itemscope itemtype="https://schema.org/WebPage"` on `<html>` (4 pages) and `<meta itemprop="url">` | Second structured-data vocabulary contradicting the JSON-LD | — |
| `<meta name="twitter:url">` | Not a documented X card property | 17 pages |
| `<meta name="keywords">` | Ignored by Google since 2009 | 4 pages |

**From the global body embed / page templates**

| Delete | Why | Measured |
|---|---|---|
| Everything between `<!-- ws:page-observer start -->` and `<!-- ws:page-observer end -->` | Editor-preview feature: posts `PAGE_CHANGED` to `window.parent` and fetches `/pages.manifest.json` | 3,411 B/page, 1 x 404 |
| The inline `.aos` script that calls `new IntersectionObserver(...)` inside `forEach` | Creates one never-disconnected observer **per element** — 25 of them on `/`. Replaced by a single shared observer in `50-body-deferred-scripts.html` | 575 B |
| The GTM `<noscript>` iframe inside `ws:footer-embeddings` | Re-emitted at the top of `30-body-header.html`, this time with `title="Google Tag Manager"` | 21 pages |
| Every inline `onmouseover` / `onmouseout` / `onfocus` / `onblur` attribute | 406 elements carry 812 handlers, only 4 distinct behaviours. They give mouse users a hover state and keyboard users nothing. CSS `:hover` + `:focus-visible` pairs in the site sheet replace them | 38–48 per page |
| Every `data-lps-eid` attribute | Builder identifiers with no runtime meaning | 11,176 B on `/` alone |

**KEEP**

- Everything between `<!-- ws:form-submit-shim start -->` and `<!-- ws:form-submit-shim end -->`. It
  binds `form[action*="/api/forms/"]` and is the only thing that submits the contact form. The repo
  build moves it to a deferred hashed file; in the Studio, leave it where it is.
- The GTM container ID `GTM-MKTJCBZG` and the dynamic-optimization `data-uuid`
  `f2087532-0394-429e-ad53-c821afc623e5`. Both are re-added by `50-body-deferred-scripts.html`, deferred
  rather than deleted.

---

## 5. After pasting — verification

Run these against the published site, not the Studio preview.

1. **View source, JS disabled.** `<header>` and `<nav aria-label="Primary">` must be in the served
   HTML. In the export there are 0 `<header>` and 0 `<nav>` elements in 20 of 21 pages, because the
   whole header was built at runtime. This is the single most important check.
2. `<meta charset>` is the first child of `<head>`.
3. Exactly one `<h1>`, and it is not inside `<header>` or `<footer>`.
4. Tab once from the address bar: the first stop is "Skip to main content", and it lands on
   `<main id="main">`.
5. Search the source for `on mouseover`/`onmouseout` (no space) — expect zero hits.
6. Search for `role="option"` and `aria-pressed` together — expect zero. `aria-pressed` is not allowed
   on `role="option"`.
7. Network panel: exactly two font files requested (`811e1196…woff2` Sora latin, `ca72d2bc…woff2`
   DM Sans latin), and zero render-blocking stylesheets.
8. No 404s in the console. The export produced four per page.
9. Re-run Lighthouse mobile and **record the numbers you measure.** The audited baseline on the exact
   export was Performance 99 / Accessibility 91 / Best Practices 96 / SEO 92, with FCP 1.7 s, LCP 1.8 s,
   TBT 30 ms, CLS 0.005, TTI 3.1 s and 903 DOM elements. Do not publish a projected score anywhere.
   Note that the audit run had both third-party hosts unreachable, so real-world numbers are worse.

---

## 6. Hashed filenames

Five references inside these snippets carry a content hash and **change on every build that changes
the file**. They are listed once here so there is a single place to update after a publish:

| Token | Current value |
|---|---|
| site stylesheet | `/assets/site.2e0bf98e.css` |
| nav controller | `/assets/nav.ebcdfd8a.js` |
| consultation loader | `/assets/consult-modal.f64fcb9e.js` |
| consultation bundle | `/assets/book-consultation-modal.259343cd.js` |
| search controller | `/assets/search.8563ac9d.js` |
| search index | `/assets/search-index.f66a04ab.json` |
| analytics | `/assets/analytics.d45398e1.js` |

`_headers` serves `/assets/*` as `public, max-age=31536000, immutable`. That is safe **only** because
every one of those filenames is content-hashed. Never point an immutable rule at an unhashed name —
the export did exactly that for `mega-menu.css`, `mega-menu.min.js`, `mtfs-images.css`,
`book-consultation-modal.min.js` and `css/fonts.css`.

---

## 7. A note on `llms.txt` and `llms-full.txt`

Both files are published and both are regenerated from `routes[]`. They serve **third-party AI
crawlers** — ClaudeBot, GPTBot, ChatGPT-User, PerplexityBot. **Google Search ignores both.** They have
no effect on Google indexing, ranking, or AI Overview inclusion, and nothing in this repo or in the
Studio project should claim otherwise. There is likewise no AEO/GEO markup, chunk delimiter or
machine-only content variant anywhere in these snippets, because no such mechanism exists for Google.
The levers are ordinary SEO, semantic HTML, crawlability, page experience and useful content.
