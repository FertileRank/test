# Applying this inside Search Atlas Website Studio

This repo produces a complete, deployable `dist/`. Website Studio, however, is where the site is
actually edited and published — project UUID `e311c34b-e043-4493-8bbe-3b526ea53fd2` on
`builder.searchatlas.com`. This document maps the refactor onto Studio's three editing surfaces:
the **global head embed**, the **global body embed**, and **per-page** content.

Read `docs/architecture.md` and `docs/performance-refactor.md` first. This is the application
guide, not the rationale.

---

## 0. Choose your integration mode first

There are two honest ways to run this, and mixing them halfway is how sites break.

### Mode A — build pipeline is the publisher (recommended)

Studio remains the content-editing surface. Its export is the pipeline's **input**, and `dist/` is
what deploys.

```
Website Studio  ──export──►  src/source-export/  ──node build/sync.mjs──►  dist/  ──deploy──►  live
```

Everything in this document that says "remove from Studio" still applies — the pipeline strips it,
but leaving it in means every export carries it and every diff is noisy. Everything that says
"paste into the head embed" is optional in this mode, because `render.mjs` emits it. Use Mode A if
you can put a `node` step between Studio and the CDN.

### Mode B — Studio publishes directly

No build step. You are hand-applying the refactor through Studio's embeds. You get most of the
win — the third-party deferral, the removed dev taps, the removed no-cache meta, the lazy modal,
the async CSS — but you **lose the guarantees**: no `validateManifest`, no `validateLinks`, no
footer-coverage enforcement, no content-hashing, and the per-page critical CSS has to be one shared
block instead of a per-page slice.

Sections 1–4 below are written for Mode B and are additive in Mode A.

**One thing is true in both modes:** §5 (what to remove) is not optional. Those items are actively
harmful and cost nothing to delete.

---

## 1. Global head embed

Order matters inside `<head>`. Paste in this order.

### 1.1 Charset must be first — verify Studio does not move it

The export shipped GTM's inline script **ahead of `<meta charset>`**. A charset declaration must
appear within the first 1024 bytes and not after a script, so that is a spec violation. If Studio's
head embed inserts *after* its own `<meta charset>`, you are fine. If it inserts at the very top of
`<head>`, do not put a `<script>` in it — put the connection hints and CSS there and load scripts
from the body embed (§2).

### 1.2 Connection hints and exactly two font preloads

```html
<link rel="preconnect" href="https://media.cdn.builder.searchatlas.com" crossorigin>
<link rel="dns-prefetch" href="https://media.cdn.builder.searchatlas.com">

<link rel="preload" as="font" type="font/woff2" fetchpriority="high" crossorigin
      href="https://media.cdn.builder.searchatlas.com/site-assets/e311c34b-e043-4493-8bbe-3b526ea53fd2/811e11966d29f3a01fcb19b087b61ac0.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="https://media.cdn.builder.searchatlas.com/site-assets/e311c34b-e043-4493-8bbe-3b526ea53fd2/ca72d2bcea8f4daa783dbdfa2d9b4606.woff2">
```

**Exactly these two files, and no others.** `fonts.css` declares 14 `@font-face` blocks over 4
unique woff2, but Lighthouse's `network-requests` proves the browser fetched exactly **two** — both
`latin`. Neither `latin-ext` file was requested, and preloading them would waste two connections on
bytes nobody needs. The Sora file is `fetchpriority=high` because it paints the measured LCP
element, `h1#h1`.

`crossorigin` is mandatory on font preloads. Without it the browser fetches the file twice.

### 1.3 Inline critical CSS

```html
<style id="mtfs-critical">/* … */</style>
```

Contents, in this order:

1. **All 14 `@font-face` blocks** from `/assets/css/fonts.css`, verbatim. Then **delete the
   `<link rel=stylesheet href="/assets/css/fonts.css?v=…">`** — inlining it removes a
   render-blocking request measured at 152 ms, and the whole file is only 460 B brotli.
   **Keep all 14 blocks. Do not collapse them into 4** with `font-weight: 400 700` ranges: the same
   physical woff2 backs four weights, and a range would make the browser synthesise bold if the file
   is static rather than variable.
2. **`src/assets/css/critical.css`** (27,734 B as authored; minified into the build's inline block).
3. The **CLS-critical subset of `mtfs-images.css`** — the `.mtfs-media` base rule,
   `.mtfs-media img`, and the five aspect-ratio declarations, 528 B minified.

**The four rules you must not omit.** Every piece of header chrome is hidden by CSS alone:

```css
.mm-panel        { position:fixed; top:96px; opacity:0; visibility:hidden; pointer-events:none }
.mm-mobile-scrim { /* hidden */ }
.mm-back-to-top  { opacity:0; visibility:hidden }
.mm-search-overlay { /* hidden */ }
```

…plus the **entire `@media (max-width:1180px)` drawer closed-state block**, which converts the nav
into a fixed off-canvas drawer. Defer any of these and first paint shows all three mega panels
expanded in flow — 144 elements, 12 service links with icons and blurbs — then snaps. This is the
single highest-risk item in the whole refactor.

Also add, in the same block:

```css
:root { --mm-header-h: 80px }
@media (max-width:1180px) { :root { --mm-header-h: 76px } }
html { scroll-padding-top: var(--mm-header-h) }
```

**Do not add `body { padding-top: … }`.** The header is `position:fixed` and `.hero`'s existing
120px padding already clears it; adding body padding doubles the offset and shifts every page.

Measured in this build: the inline block is **36,697 B raw / 6,413 B brotli** on `/`, averaging
**28,744 B across 21 pages**. It is large. That is the trade for zero render-blocking stylesheets,
and the home document still comes out **smaller compressed** than the export's (16,323 B vs
18,924 B brotli).

### 1.4 Async site stylesheet

```html
<link rel="stylesheet" href="/assets/site.<hash>.css" media="print" data-mtfs-async>
<noscript><link rel="stylesheet" href="/assets/site.<hash>.css"></noscript>
```

The `media="print"` swap is flipped to `all` by a tiny inline snippet on load. In Mode B, upload
`src/assets/css/site.css` (26,199 B as authored; 28,111 B minified with the deduped page CSS
prepended) to Studio's asset store and use its URL.

**Caching caveat for Mode B:** Studio's asset URLs may not be content-hashed. `immutable` caching
is only safe on a hashed filename. If the URL is not hashed, do **not** serve it immutable — use a
short max-age and re-check when you change the file.

### 1.5 Per-page head metadata

In Mode A this is `renderHeadTags()` and there is nothing to do. In Mode B, set per page in Studio's
SEO panel, in this order: title → description → robots → canonical → hreflang → og → twitter →
JSON-LD.

Rules the SEO audit measured and that must hold on **all** pages:

- **One `og:image`, `og:image:width`, `og:image:height`, `og:image:alt` and `twitter:image` on every
  page.** These were on **0 of 21** pages while 12 declared `twitter:card=summary_large_image` — a
  card type that requires an image. Until a real image asset exists, downgrade those 12 to
  `summary` so no page requests a card it cannot fill.
- **The full set on every page**, not a subset: `og:type`, `og:title`, `og:description`,
  `og:site_name`, `og:url`, `og:locale=en_US`, `twitter:card`, `twitter:title`,
  `twitter:description`, `twitter:image`. 14 of 21 pages carried a bare `og:url` and nothing else.
- **Delete `twitter:url`** — not a documented X card property; it appears on 17 pages as a no-op
  while `twitter:title` and `twitter:description` appear on none.
- **One robots value per tier:** `index, follow, max-image-preview:large, max-snippet:-1` on the 20
  indexable routes (11 pages had no robots meta at all), `noindex, follow` on `/404/`.
- **One viewport spelling site-wide.** Three variants exist today.
- **No `meta keywords`.** Present on 4 pages; ignored by Google since 2009.
- **hreflang: pick one policy.** Either a consistent `en` + `x-default` self-pair on all 20
  indexable pages, or none at all. The current lone `x-default` on 12 of 21 pages with no language
  alternate is a no-op — do not reproduce it.
- **`geo.region` / `geo.placename` belong on `/contact/`**, the one page with an address, geo
  coordinates and opening hours — not on `/`, `/our-team/` and `/sitemap/` where they currently sit.
- **Strip `itemscope itemtype="https://schema.org/WebPage"` from `<html>`** on the 4 pages carrying
  it. JSON-LD is the only vocabulary.

### 1.6 JSON-LD

Two blocks per page. The first is **identical bytes on every page** — paste it in the global head
embed:

- `Organization` / `ProfessionalService` at `@id {origin}/#organization`, carrying `logo`, `image`
  and `sameAs` (all three absent today) plus the full contact set: telephone `+1-866-634-9144`, fax
  `+1-866-482-5058`, `info@medtech4solutions.com`, 399 Knollwood Road / White Plains / NY / 10603 /
  US, geo `41.0534,-73.7629`, opening hours Mo–Fr 08:30–18:00. One `@id` must never carry four
  different `@type` shapes, as it does today across 18 pages.
- `WebSite` at `@id {origin}/#website` with `publisher → {"@id":"{origin}/#organization"}` and
  `inLanguage en-US`.

The second is per-page: `WebPage` (`@id {canonical}#webpage`, with `isPartOf → #website` and
`breadcrumb →` the page's `BreadcrumbList`), the `BreadcrumbList` itself, and on the 13 service
pages a `Service` node with its own `@id {canonical}#service` and
`"provider": {"@id": "{origin}/#organization"}` **as a pure reference** — never re-inlined.

---

## 2. Global body embed

Studio's body embed is where the server-rendered chrome and the scripts go.

### 2.1 Body order is non-negotiable

```
skip link  →  <header>  →  <main id="main">  →  <footer>
```

The export injected the header with `insertAdjacentHTML('afterbegin', …)`, which placed it **ahead
of** the skip link and left the link roughly ten tab stops deep, skipping nothing. Lighthouse
reported the skip-link audit as `notApplicable` — axe never even evaluated it.

If Studio's body embed can only append to the **end** of `<body>`, you cannot put the header there.
In that case use Studio's own header/footer block features for the chrome and reserve the body
embed for the scripts. **Never re-introduce a JS-injected header.**

### 2.2 Skip link

```html
<a class="mtfs-skip-link" href="#main">Skip to main content</a>
```

First node in `<body>`. The export's version carried `onfocus="this.style.top='0'"` /
`onblur="this.style.top='-100%'"`; replace both with CSS:

```css
.mtfs-skip-link:focus, .mtfs-skip-link:focus-visible { top: 0 }
```

### 2.3 Header

Paste the markup from `src/partials/header.html` (20,090 B, reformatted one tag per line for
reading; the build emits the same markup without the indentation). It contains: the logo anchor, a
`<nav aria-label="Primary">`, the three disclosure triggers, all three panels and the utility rail.

Non-negotiables inside it:

- Every disclosure is a real `<button type="button" aria-expanded aria-controls>`. Never a `<div>`,
  never an `<a role="button">`.
- Panel titles are `<p id>` referenced by `aria-labelledby` — **not** `<h4>`. The export's panels
  made the first heading in the DOM an `<h4>` and added 3 `region` + 2 `complementary` landmarks
  inside the banner. Drop `role="region"` and the decorative `<aside>`.
- The CTA is `<a href="/contact/#consult">` **without `role="button"`**. The shipped markup put
  `role="button"` on an `<a href>`, overriding the link role and breaking middle-click and
  open-in-new-tab.
- The logo `<img>` carries real `width` and `height` attributes and a class — **no inline
  `style="height:44px;…"`**.
- `aria-current="page"` and `.mm-active` are set at **build time** from the current route. Delete
  the `data-mm-match` regex attributes and the runtime `new RegExp()` loop.
- The search overlay is **not** in this markup. Its 24 elements and 8,135 B of CSS ship with
  `search.js` on first open.
- In Mode B, the active-state markup differs per page, so the header is not literally one shared
  string. Either accept a shared header with no `aria-current` (a real, small loss) or template it
  per page. This is the clearest reason to prefer Mode A.

### 2.4 `<main id="main">`

Every page's primary content must be wrapped in `<main id="main">`. Only 3 of 21 pages had a
`<main>` at all. Drop the redundant `role="main"` from the 3 that did.

This is both the skip-link target and the extraction boundary `htmlToMarkdown()` uses to build
`llms-full.txt`.

### 2.5 Breadcrumbs

On all 19 non-home indexable pages:

```html
<nav aria-label="Breadcrumb">
  <ol class="mtfs-breadcrumb">
    <li><a href="/">Home</a></li>
    <li><a href="/services/">Services</a></li>
    <li><a href="/services/lab-solutions/">Lab Solutions</a></li>
    <li><span aria-current="page">GPO Purchasing</span></li>
  </ol>
</nav>
```

Separators are **CSS-generated** (`li + li::before { content: "/" }`), never literal `"/"` text
nodes — the export's `<div class="breadcrumb">Home / …</div>` had the slashes announced by screen
readers. The trail must match the page's `BreadcrumbList` exactly, including the `/services/` tier
that 12 of 21 pages omit today.

### 2.6 Footer

Paste `src/partials/footer.html` (4,987 B).

- **Column titles are `<h2>`, not `<h4>`.** The 63 `<h4 class="il27">` column titles are the
  measured source of the `heading-order` failure (Lighthouse cites `div.ctr > div.ftg > div.ftc >
  h4.il27`, nodeLabel "LAB SOLUTIONS").
- **Include `/services/lab-solutions/` and `/services/management-services/`.** These are the only
  two routes the export's footer omits while all ten of their children are in it, so every child
  outranks its own parent.
- Drop `role="contentinfo"` — it is the implicit role of `<footer>`.

### 2.7 Scripts, at the end of the body embed

```html
<script src="/assets/analytics.<hash>.js" defer
        data-project-id="e311c34b-e043-4493-8bbe-3b526ea53fd2"
        data-tracking-secret="…"></script>

<script src="/assets/nav.<hash>.js" defer
        data-modal-src="/assets/book-consultation-modal.<hash>.js"
        data-search-src="/assets/search.<hash>.js"
        data-search-index="/assets/search-index.<hash>.json"></script>
```

Both `defer`. `nav.js` reads its three sibling URLs off its own `document.currentScript`, so no
hashed filename is ever hard-coded inside a JS file — in Mode A the `stamp-assets` step writes them;
in Mode B you write them by hand and must update them whenever an asset changes.

`analytics.js` reads `data-project-id` and `data-tracking-secret` from its own tag. **The
`/api/track/` and `/api/event/` payloads must stay byte-for-byte identical**, including
`project_id`, `tracking_secret`, `visitor_id` (`localStorage _lps_vid`), `session_id`
(`sessionStorage _lps_sid`), `page_url` and `referrer`. These are the only payloads the site sends.

`analytics.js` also injects GTM and the Search Atlas `dynamic_optimization.js` on whichever comes
first of `requestIdleCallback`, the first real interaction, or a timeout ceiling. **Neither script
is deleted** — the brief requires both to keep working.

### 2.8 GTM `<noscript>` iframe

Keep it, in the body, and add the title it never had:

```html
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MKTJCBZG"
  height="0" width="0" title="Google Tag Manager"
  style="display:none;visibility:hidden"></iframe></noscript>
```

This is the one place an inline `style=` is acceptable, and it is standard GTM markup.

---

## 3. Per-page work

| Item | Where | Why |
| --- | --- | --- |
| Title, description, canonical, og/twitter | Studio SEO panel | §1.5 |
| `WebPage` + `BreadcrumbList` (+ `Service`) JSON-LD | per-page head | §1.6 |
| Visible breadcrumb `<nav>` | top of `<main>` | §2.5 |
| `aria-current="page"` in the nav | header markup | §2.3 |
| Exactly **one** `<link rel=preload as=image fetchpriority=high>` | per-page head | see below |
| Heading-order fixes | page body | see below |
| "Learn More" → descriptive text | page body | see below |
| Related-links block | end of `<main>` | generated from `relatedRoutes()` |

**LCP preload.** Exactly one per page. The home page currently has **two**, and neither preloads the
measured LCP element — which is `h1#h1`, a **text** node in Sora, so on `/` the correct
high-priority preload is the Sora woff2, not an image. Caveat: the image CDN was unreachable during
the Lighthouse run, which can change which element wins LCP, so decide from each page's own
above-the-fold content — and never emit more than one.

**Heading order**, page by page:
- Footer column titles `<h4>` → `<h2>` (63 elements, all 21 pages). Structural via the footer partial.
- The 11 hero stat-card `<h3>`s → `<p>`, preserving the class. These are the six decorative panel
  labels — GPO Savings Dashboard, Staffing Overview, Marketing Performance, Compliance Scorecard,
  Practice Growth, Lab Performance Dashboard — that sit between the `<h1>` and the first `<h2>` and
  produce `h1 → h3 → h2` on every service page.
- `/about/` mission cards `<h4>` → `<h3>`.
- `/privacy-policy/` and `/terms-of-service/` ToC `<h4>` → `<h2>`, inside `<aside aria-labelledby>`.
- `/contact/`: `<h2 id="loc-address">` → `<h3>` (it is nested inside a section already labelled by
  `<h2 id="loc-h">`).
- `/sitemap/`: promote the three `<p class="sm-sec-title">` to `<h2>` and
  `<div class="sm-card-head">` to `<h3>`.

**Anchor text.** All **26** "Learn More" links — 5 on `/`, 10 on `/services/`, 5 on
`/services/lab-solutions/`, 5 on `/services/management-services/`, 1 on the GPO page — get the
destination in their **visible text**, and the `aria-label` is **deleted**. One edit clears both the
SEO `link-text` failure and the `label-content-name-mismatch` failure. Same for the 6 "Get Started"
links. Do not solve this by adding more ARIA.

**Sections.** Label every `<section>` with `aria-labelledby` pointing at its own heading id, or
demote it to a `<div>`. 111 of 146 are currently unnamed.

---

## 4. Assets to upload to Studio

| File | Purpose |
| --- | --- |
| `src/assets/css/site.css` | the async site sheet |
| `src/assets/js/nav.js` | header behaviour |
| `src/assets/js/analytics.js` | third-party idle loader + rewritten tracker |
| `src/assets/js/search.js` | search overlay, fetched on first intent |
| `src/assets/js/consult-modal.js` | the modal **loader** |
| `src/assets/js/book-consultation-modal.js` | the wizard the loader fetches |
| `src/assets/img/brand-icon-96.<hash>.webp` + `…-fallback-96.<hash>.png` | what replaced the base64 PNG |
| `search-index.json` | generated from `routes[]` — **never hand-written** |

**Content-hash every one of them** if Studio lets you control the filename. The `/assets/*`
`immutable` header is honest only when the filename is hashed. In Mode A the build asserts this and
fails if it is violated.

---

## 5. Remove from the Studio project

Not optional. Each of these is measured harm.

### 5.1 The dev taps — 4 × 404 per page

```html
<script type="module" data-lps-tap="route-notifier">   <!-- imports /src/lib/routeNotifier.ts, /src/lib/virtualPageObserver.ts -->
<script type="module" data-lps-tap="inspector">        <!-- imports /src/lib/inspector.ts -->
```

Plus the `ws:page-observer` block (3,411 B/page), which fetches `/pages.manifest.json` (404),
`postMessage`s `PAGE_CHANGED` to `window.parent`, runs a `MutationObserver` on every `[id^='page-']`
and scans `document.querySelectorAll("[onclick]")`.

All four requests 404. Lighthouse `errors-in-console` **fails** listing them. This is editor-preview
instrumentation with no purpose in production.

**Keep** the 4,708 B `ws:form-submit-shim` — it is real functionality — but move it to a deferred
hashed file loaded only on pages containing `form[action*="/api/forms/"]`.

### 5.2 The no-cache meta tags

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

All three, on every page. They defeat the `_headers` policy and force a full re-download every
visit. If Studio re-inserts them on publish, that is a Studio setting to find and turn off — this is
the single highest-leverage removal in the list.

### 5.3 The eager modal script

```html
<script src="/assets/book-consultation-modal.min.js?v=20260722" defer></script>
```

58,472 B on all 20 non-404 pages, for a modal that only opens on user intent. Replace with `consult-modal.js`, which loads the wizard on: a delegated capture-phase click
matching `[data-open-consult], .mm-cta, .open-consult-modal`; the `#consult` hash on load and
`hashchange`; or a `requestIdleCallback` warm-up **only** when the page has a trigger and lacks
`#hero-form-card`.

Before doing any of that, **delete the 32,626-character base64 PNG on line 530** and reference a
real image file. It is 45.2 % of the source and 55.8 % of the shipped bundle, it is 512×512 rendered
into a 28×28 box, and removing it takes the module from 29,964 B brotli to 6,637 B — a 77.8 % cut
with zero functional change. Do this **before** lazy-loading, so the lazily-loaded module is already
the small one.

### 5.4 The runtime-injected header

```html
<script src="/assets/mega-menu.min.js?v=20260722" defer></script>
```

Replace with `nav.js` plus the server-rendered header. Delete with it the `.mm-injected`
legacy-nav-hiding rules at `mega-menu.css:1155-1158` (they hide navs that do not exist — there are
0 `<nav>` elements in 20 of 21 pages) and the `classList.add('mm-injected')` calls.

### 5.5 Inline `on*` handlers

406 elements, **812** attributes, only 4 distinct behaviours, every one already carrying a class.
Replace with `:hover` **and** `:focus-visible` rules keyed on stable semantic classes:

```css
.mtfs-footer a:hover, .mtfs-footer a:focus-visible { color: var(--teal) }
.mtfs-skip-link:focus, .mtfs-skip-link:focus-visible { top: 0 }
.contact-cta a:hover, .contact-cta a:focus-visible { color: var(--w) }
.btn-primary:hover, .btn-primary:focus-visible { background: var(--td); border-color: var(--td) }
.btn-link:hover, .btn-link:focus-visible { border-color: #fff; background: rgba(255,255,255,.08) }
```

**Never key a shared-stylesheet rule on an `il*` class.** `il13`, `il15`, `il23`, `il25`, `il30` and
`il33` each mean two different things depending on which page you are on. `.il30:hover` in a shared
sheet will style the wrong element somewhere.

### 5.6 Dead code inside the modal

`window.MtfsModal` at line 887 (it resolves `open` to `window.open` — a broken public API), the
stray `<span></span>` that `buildPopupShell()` appends to every page, and the `MutationObserver` on
`document.body` that existed only to race the JS-injected header.

### 5.7 `data-lps-eid` attributes

Builder ids on nearly every element — **11,176 B on `index.html` alone**. Purely a builder concern.
If Studio must emit them for editing, they should be stripped at publish; in Mode A the
`strip-builder-ids` pass removes them (measured: 21/21 pages, 0 remaining in output).

---

## 6. Platform files

`_headers` and `_redirects` are generated by `artifacts.mjs` from `site.config.mjs`. If Studio owns
them, apply the same rules by hand:

**`_headers`** — the HTML cache rule must be `/*`, **not** `/*.html`. The site publishes pretty
URLs, so `/about/` does not end in `.html` and 19 of 21 documents matched no rule at all. Apply
`immutable` only to content-hashed filenames — `/assets/mega-menu.css`, `/assets/mega-menu.min.js`,
`/assets/mtfs-images.css`, `/assets/book-consultation-modal.min.js` and `/assets/css/fonts.css` are
unhashed and must not be served immutable for a year. Add `X-Content-Type-Options`,
`Referrer-Policy` and `Permissions-Policy`; the export has no security headers at all.

**`_redirects`** — normalise every target to the canonical trailing-slash form. Eight rules
(`/who-we-are`, `/gpo`, `/gpo-registration`, `/recruitment` and their slashed twins) use slash-less
targets while `/practice`, `/temp-staff`, `/laboratory-solutions` and `/policy` use the canonical
form, so two rules five lines apart pointing into the same subtree disagree — and the eight resolve
as 301 → 301. Change `/untitled` and `/untitled/` from **301 to 404**: a 301 to `/404/`, which
returns 200 OK, is a soft 404 that reports success to Google.

**`robots.txt`** — remove the Next.js `Allow: /_next/static/` and `Allow: /_next/image/` lines
(this is not a Next.js site) and the `Disallow: /api/` and `/admin/` lines for paths that do not
exist. If any `Disallow` is kept, **repeat it inside each named AI-crawler group** — robots.txt
group matching is most-specific-wins, not additive, so GPTBot, ChatGPT-User, ClaudeBot,
PerplexityBot, Google-Extended and Applebot-Extended currently bypass the `*` group entirely. Keep
the `Sitemap:` directive.

**`sitemap.xml`** — generate per-page `<lastmod>`. All 20 URLs currently share the hard-coded date
2026-08-21, which carries no freshness signal at all. Keep `/404/` excluded.

**`llms.txt` / `llms-full.txt`** — regenerate from the same `routes[]` array so the three artifacts
cannot drift. Label `llms.txt` in its header as serving third-party AI crawlers only, with **no
effect on Google Search ranking**. See `docs/aiseo-content.md` §4.

---

## 7. Verification after publishing

Run these against the live site, not the export.

```bash
# 1. Server-rendered chrome exists (should be 1 / 1 / 1 on every page)
curl -s https://medtech4solutions.com/about/ | grep -c '<header'
curl -s https://medtech4solutions.com/about/ | grep -c '<nav '
curl -s https://medtech4solutions.com/about/ | grep -c 'id="main"'

# 2. Nothing that should be gone is still there (all should be 0)
curl -s https://medtech4solutions.com/ | grep -c 'data-lps-tap'
curl -s https://medtech4solutions.com/ | grep -c 'http-equiv="Cache-Control"'
curl -s https://medtech4solutions.com/ | grep -c 'onmouseover='
curl -s https://medtech4solutions.com/ | grep -c 'data-lps-eid'
curl -s https://medtech4solutions.com/ | grep -c 'book-consultation-modal.min.js'

# 3. Compression is actually being served
curl -sI -H 'Accept-Encoding: br' https://medtech4solutions.com/ | grep -i content-encoding

# 4. No render-blocking stylesheet outside <noscript>
curl -s https://medtech4solutions.com/ | grep -o '<link rel="stylesheet"[^>]*>'
```

Then re-run Lighthouse mobile. Compare against the baseline in `BRIEF.md`:
**Perf 99 / A11y 91 / BP 96 / SEO 92, FCP 1.7 s, LCP 1.8 s, TBT 30 ms, CLS 0.005, TTI 3.1 s,
main thread 1.2 s, 903 DOM elements.**

Two cautions when you read the new numbers:

- **The baseline was measured with third-party hosts unreachable.** A live run reaches GTM and
  `dynamic_optimization.js`, so some metrics can legitimately look *worse* while the site is
  genuinely faster. If you want a like-for-like comparison, re-measure in the same sandboxed
  conditions as well.
- **A DOM-size win is real but it does not come from SSR.** SSR moves the header's 207 nodes from
  script-built to parser-built without deleting them. The measured `dist/` result is **595 elements,
  passing**, down from 903 — but that came from the *deletions* (search overlay, the always-live
  second modal instance, the dev-tap blocks, the builder scaffolding), not from server-rendering.
  If you apply the chrome in Mode B without also doing the removals in §5, expect no DOM win.

Measured against `dist/` under the same blocked-host conditions (`docs/measured-results.md`):
`heading-order`, `link-text`, `aria-allowed-attr`, `dom-size`, `render-blocking-resources`,
`unused-css-rules` and `uses-text-compression` all pass;
`color-contrast` still FAILS on the service template — one node, the hero stat-card caption at
contrast 2.26 (`#9aada9` on `#fdfafa`, 9.6pt), which is why that template scores 95 on
accessibility rather than 100; it is body-content styling this refactor deliberately did not
restyle, and `--g600` (`#5c524b`) clears AA.
`label-content-name-mismatch` and `aria-progressbar-name` go **notApplicable** (no such element
remains to evaluate — which is the intended outcome, but is not the same as "pass": the audits
resume the moment one returns). **`errors-in-console` still fails**, on sandbox tunnel errors from
the unreachable CDN and third-party hosts rather than on the four 404s, which are gone — so it
cannot be confirmed fixed until it is measured where those hosts are reachable.

Note also that lazy-loading the modal alone does **not** clear `aria-allowed-attr` or
`aria-progressbar-name`: the eager inline hero card on `/` instantiates the same wizard, so the
`aria-selected` and `aria-label` fixes inside the modal code itself are what do the work.
