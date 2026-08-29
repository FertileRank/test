# Architecture — mtfs-website-studio

How the build is put together, what each module owns, where the bytes go, and how to add a page.

Scope: this repo is a **static site generator with no npm dependencies**. It reads the Search Atlas
Website Studio export, rewrites it, and writes a deployable `dist/`. It runs on a bare `node`
install (Node >= 18), imports only `node:fs`, `node:path`, `node:url`, `node:crypto` and
`node:zlib`, and has no TypeScript, no bundler and no framework.

---

## 1. The one idea

Every fact about the site is written **once**, in `site.config.mjs`, and every artifact is
*derived* from it. Nothing is hand-copied between files.

That is not an aesthetic preference. The audits measured what happens without it, in this exact
codebase:

| Drift found in the export | Root cause |
| --- | --- |
| 12 of 21 `BreadcrumbList` trails omitted the `/services/` tier | each trail hand-written instead of walked from a parent pointer |
| `/our-team/` breadcrumb said "Staff" against a `<title>` of "Our Team" | two authors, two strings |
| One `@id` (`#organization`) declared on 18 pages with **four** different `@type` shapes | the node was re-inlined per page |
| The two service hubs were the only routes missing from the site-wide footer, so all ten of their children outranked their own parents | footer was a hand-written list |
| `sitemap.xml`, `llms.txt`, `llms-full.txt` agreed on 20 URLs **by luck** | three independent generators |

Each of those is a synchronisation bug, not a content bug. Deriving them from one array is what
makes them unrepeatable. `docs/global-sync.md` specifies that contract field by field.

---

## 2. Directory layout

```
mtfs-website-studio/
├── site.config.mjs              THE GLOBAL SYNC MASTER. site + routes[] + redirects[]
│                                + headerRules[] + navIcons. Imports nothing.
├── package.json                 scripts only; "dependencies" does not exist.
├── build/
│   ├── sync.mjs                 orchestrator + CLI. The only file that touches the filesystem
│   │                            for output, and the only one that knows about dist/.
│   └── lib/
│       ├── routes.mjs           the route graph: parents, breadcrumbs, siblings, canonical URLs
│       ├── validate.mjs         manifest + link + orphan validation; the --check gate
│       ├── render.mjs           SSR partials — pure string builders, no DOM, no I/O
│       ├── css.mjs              minify / split critical / dedupe / content-hash
│       ├── html.mjs             the 12 refactor passes + transform() + minifyHtml()
│       ├── artifacts.mjs        sitemap.xml, robots.txt, llms*.txt, _headers, _redirects,
│       │                        Organization JSON-LD, htmlToMarkdown()
│       └── compress.mjs         precompress() → .gz + .br beside every text file
├── src/
│   ├── assets/
│   │   ├── css/critical.css     inlined into every <head>
│   │   ├── css/site.css         the async, content-hashed site sheet
│   │   ├── js/nav.js            behaviour-only controller for the SSR header
│   │   ├── js/analytics.js      third-party idle loader + rewritten LPS tracker
│   │   ├── js/search.js         search overlay, fetched on first intent
│   │   ├── js/consult-modal.js  intent loader for the wizard (not the wizard)
│   │   ├── js/book-consultation-modal.js   the wizard itself, fetched on intent
│   │   └── img/                 brand icons that replaced the 32,626 B base64 PNG
│   └── partials/                header.html, footer.html — reference markup for Studio paste
└── docs/
    ├── architecture.md          ← you are here
    ├── global-sync.md           the manifest spec and its invariants
    ├── performance-refactor.md  one section per measured bottleneck
    ├── aiseo-content.md         Google's AI-search guidance, applied to this site
    ├── studio-integration.md    how to apply this inside Website Studio
    └── audit/                   the four forensic audits this refactor is built on
```

The **source export is read-only**. The build never writes into it. `--out` refuses to run if the
target is the filesystem root, the repo root, an ancestor of the repo, or the source export itself.

---

## 3. Data flow

```
                        site.config.mjs
       ┌────────────────────────┼────────────────────────────────┐
       │  site{}         routes[]        redirects[]  headerRules[]  navIcons{}
       │    │               │                 │            │           │
       ▼    ▼               ▼                 │            │           │
  ┌──────────────────────────────────────┐    │            │           │
  │ routes.mjs  buildGraph(routes)       │    │            │           │
  │   byId · byPath · children · roots   │    │            │           │
  │   breadcrumbTrail() · relatedRoutes()│    │            │           │
  └───────────────┬──────────────────────┘    │            │           │
                  │ graph                     │            │           │
    ┌─────────────┴──────────────┐            │            │           │
    ▼                            ▼            ▼            ▼           ▼
┌────────────────┐      ┌──────────────────────────────────────────────────┐
│ validate.mjs   │      │ render.mjs (pure strings)   artifacts.mjs         │
│ validateManifest│     │  renderSkipLink()            sitemapXml()         │
│  ↳ fails FIRST │      │  renderHeader()   ◀──────────  robotsTxt()        │
└────────────────┘      │  renderBreadcrumbs()          llmsTxt()           │
                        │  renderRelated()              llmsFullTxt()       │
                        │  renderFooter()               headersFile()       │
                        │  renderHeadTags()             redirectsFile()     │
                        └───────────┬──────────────────────────────────────┘
                                    │ partials + head block
  src/source-export/                │
  <route>/index.html  ──────────────┤
       │                            ▼
       │              ┌──────────────────────────────────────────────┐
       │              │ html.mjs  transform(html, ctx)               │
       │              │  1 strip-dev-taps      7  inline-critical-css│
       │              │  2 strip-nocache-meta  8  defer-third-party  │
       │              │  3 strip-builder-ids   9  lazy-modal         │
       │              │  4 dedupe-gtm         10  strip-inline-handlers
       │              │  5 hoist-charset      11  fix-a11y           │
       │              │  6 ssr-chrome         12  preload-lcp        │
       │              └───────────────┬──────────────────────────────┘
       │                              │
  src/assets/css/*  ──►  css.mjs  ────┤   ctx.assets = { criticalCss, siteCssHref,
  src/assets/js/*   ──►  hashName() ──┤                  navJsHref, modalJsHref,
                                      │                  analyticsJsHref, … }
                                      ▼
                     ┌────────────────────────────────────────┐
                     │ sync.mjs orchestrator-owned steps      │
                     │   head-tags · stamp-assets · minify-html│
                     └────────────────┬───────────────────────┘
                                      ▼
                                    dist/
                     ┌──────────────────────────────────────────┐
                     │ <route>/index.html  ×21                  │
                     │ assets/site.<hash>.css                   │
                     │ assets/{nav,analytics,search,             │
                     │         consult-modal,book-…}.<hash>.js  │
                     │ assets/search-index.<hash>.json          │
                     │ sitemap.xml robots.txt llms.txt          │
                     │ llms-full.txt _headers _redirects        │
                     └────────────────┬─────────────────────────┘
                                      ▼
                     ┌──────────────────────────────────────────┐
                     │ RE-READ dist/ and validate the WRITTEN   │
                     │ bytes: validateLinks() · findOrphans()   │
                     │ · /assets/ content-hash invariant        │
                     └────────────────┬─────────────────────────┘
                                      ▼
                     compress.mjs precompress() → .gz (gzip 9) + .br (brotli 11)
                                      ▼
                              summary table → stdout
```

Two properties of that diagram matter more than the boxes:

**Validation happens on the output, not the input.** Step 9 re-reads the 21 files it just wrote
from disk and validates *those* bytes. A pass that corrupts a link is caught; a pass that fixes a
link in memory but fails to write it is caught too.

**`llms-full.txt` is extracted from the rendered output.** `htmlToMarkdown()` runs over
`p.outHtml`, not over the source export. What the file mirrors is what actually ships — which is
the specific defect the content audit found in the export's own `llms-full.txt`, where every stat
tile and every `/about/` timeline year had been silently dropped.

---

## 4. What each module owns

### `site.config.mjs` — the master
Five exports, no imports, no logic: `site`, `routes`, `redirects`, `headerRules`, `navIcons`.
Anything that is a *fact about the business or the site* lives here. Anything that is a *decision
about how to render a fact* does not. Full field-by-field spec: `docs/global-sync.md`.

### `build/lib/routes.mjs` — the graph
Turns the flat, ordered `routes[]` array into a navigable graph and answers every "where does this
page sit" question. `breadcrumbTrail(route, graph)` walks `parent` pointers to the root, and
`breadcrumbJsonLd()` is built from the *same* trail — so the visible `<nav aria-label="Breadcrumb">`
and the `BreadcrumbList` structured data cannot diverge. That single shared call is what fixes the
12 pages whose JSON-LD skipped the `/services/` tier.

`normalizePath()` is the one funnel for href comparison: it adds the leading and trailing slash,
strips `index.html`, and keeps `#`/`?` intact.

### `build/lib/validate.mjs` — the gate
Three checks, run at three different moments:
- `validateManifest(routes)` runs **first**, before a single file is read. Duplicate ids or paths,
  a `parent` that does not exist, a missing trailing slash, a title outside 30–60 chars or a
  description outside 70–160 chars are all reported here.
- `validateLinks(pages, graph, opts)` runs against the **written** dist. Every root-relative
  `href`/`src` must resolve to a route, to `EXTRA_ALLOWED_PATHS`, or to an emitted asset. It also
  carries the generic-anchor blocklist — `learn more`, `get started`, `click here`, `read more`
  fail the build, which is what stops the 26 "Learn More" links from coming back.
- `findOrphans(pages, graph)` reports any route with no inbound internal link.

`EXTRA_ALLOWED_PATHS` exists because exactly one legitimate internal link in the export is not a
route: `/sitemap/` → `/sitemap.xml`, anchor text "XML sitemap".

### `build/lib/render.mjs` — SSR partials
Pure string builders. No DOM, no filesystem, no globals. Given `(route, graph, cfg)` they return
markup. The hard rules they enforce, from the semantics audit:

- Body order on all 21 pages: **skip link → `<header>` → `<main id="main">` → `<footer>`.**
  The export injected the header with `insertAdjacentHTML('afterbegin', …)`, which put it *ahead*
  of the skip link and left the link ~10 tab stops deep, skipping nothing.
- Zero inline `on*` attributes and zero `style=` attributes in rendered output — including the
  logo's shipped `style="height:44px;…"`.
- Every disclosure is a real `<button type="button" aria-expanded aria-controls>`, never a `<div>`
  or an `<a role="button">`.
- Exactly one `<h1>` per page, never inside `<header>` or `<footer>`. Footer column titles are
  `<h2>` (the export's 63 `<h4>`s are what failed `heading-order`). Mega-panel titles are
  `<p id>` referenced by `aria-labelledby`, not headings.
- `renderHeadTags()` emits a fixed order: charset → viewport → title → description → robots →
  canonical → hreflang → preconnect/dns-prefetch → the two font preloads → og/twitter → JSON-LD.
  Charset is unconditionally first, which is why the `hoist-charset` pass is a measured no-op on
  all 21 pages and still stays in the pass list as a standing guarantee.

### `build/lib/css.mjs` — bytes
`minifyCss()` is conservative. `splitCritical()` is **deterministic by construction**: its only
input is an explicit allow-list of selectors, with no size budget, no "looks like a hero" heuristic
and no DOM inspection, so the same `(css, allow-list)` pair always yields the same two strings byte
for byte. Nothing is dropped — `critical + deferred` contains every declaration of the input, and a
rule whose selector list is partly critical is *split* rather than widened or narrowed.
Conditional groups (`@media`, `@supports`, `@container`, `@layer`, `@scope`) are recursed into and
re-emitted on each side, which is how the `@media (max-width:1180px)` mobile drawer's **closed
state** reaches the critical block while its open-state rules stay deferred.

The four hidden-by-default base rules — `.mm-panel`, `.mm-mobile-scrim`, `.mm-back-to-top`,
`.mm-search-overlay` — are pinned into critical as exact matches. Deferring any of them makes the
first paint show all three mega panels expanded in flow.

`hashName(base, contents)` produces `site.<8 hex>.css`. That hash is what makes the `/assets/*`
`immutable` header honest, and `sync.mjs` asserts the invariant rather than assuming it.

### `build/lib/html.mjs` — the 12 passes
Each pass is `{ name, description, run(html, ctx) }`. `run` returns **either a string (the new
html) or `{ html, notes }`** — the notes are what the build's per-page pass report is built from, so
most passes return the object form. Compose passes with `transform()` rather than by hand: it
normalises both shapes, runs them in contract order and returns `{ html, applied }`. Passes operate on strings, but not naively: the module tokenizes
`<script>`, `<style>`, `<pre>`, `<textarea>` and comments out of harm's way first, edits the
remaining markup, then detokenizes. That is why `minifyHtml()` can collapse inter-tag whitespace
without corrupting a script body.

`ctx` is `{ route, graph, cfg, assets }`, where `assets` carries the hashed hrefs the passes need to
reference.

### `build/lib/artifacts.mjs` — everything that is not a page
`sitemapXml`, `robotsTxt`, `llmsTxt`, `llmsFullTxt`, `headersFile`, `redirectsFile`,
`organizationJsonLd`, `htmlToMarkdown`. All are pure functions of `(routes, graph, cfg)` plus, for
`llmsFullTxt`, the `Map<routeId, markdown>` extracted from the rendered pages.

### `build/lib/compress.mjs` — the wire
`precompress(dir, exts)` writes `.gz` (gzip level 9) and `.br` (brotli quality 11, with
`BROTLI_PARAM_SIZE_HINT`) beside every `.html/.css/.js/.txt/.xml/.json`. `report(rows)` renders the
table.

### `build/sync.mjs` — the orchestrator
Owns three seams that fall between the declared modules, each implemented as a named step so it
appears in the per-page pass column like any other:
- **`head-tags`** — installs the `renderHeadTags()` block into the document head.
- **`stamp-assets`** — writes the hashed sibling URLs onto the nav `<script>` tag as
  `data-modal-src`, `data-search-src`, `data-search-index`, so no JS file contains a hard-coded
  hashed filename.
- **`minify-html`** — the final byte pass.

It also builds the search index from `routes[]` (never hand-written) and hashes it.

---

## 5. The pipeline, step by step

`node build/sync.mjs [--src DIR] [--out DIR] [--check] [--report] [--help]`

1. **MANIFEST** — `validateManifest(routes)`. Errors here stop the build before any file is read.
2. **SOURCE PAGES** — read one `index.html` per route from `--src`.
3. **CSS** — harvest every page's `<style>` blocks, `dedupe()` the byte-identical ones into the
   shared sheet, `splitCritical()` the residual, assemble `fonts + shared critical + page critical
   + page residual` as the inline block, hash the site sheet.
4. **SCRIPTS** — hash each JS asset, generate and hash the search index.
5. **JSON-LD** — build the Organization/WebSite node **once**; the identical bytes go on every page.
6. **PAGES** — for each route: render partials, run the 12 passes, run the three orchestrator steps.
7. **ARTIFACTS** — sitemap, robots, llms×2, `_headers`, `_redirects`.
8. **WRITE** — erase and rewrite `--out`; copy passthrough files; assert the `/assets/` hash invariant.
9. **LINK VALIDATION** — re-read the written pages and validate those bytes.
10. **ASSET REFERENCES** — cross-reference emitted assets against referenced ones; report both
    missing and unreferenced.
11. **PRE-COMPRESSION** — `.gz` + `.br` beside every text file, then the summary table.

`--check` runs 1, 2 and 9's logic and **writes nothing**, exiting non-zero on any error-level
problem. That is the CI gate. `--report` re-measures an existing `dist/` and prints only the
compression table.

---

## 6. Measured build output

From a real run of `node build/sync.mjs` against the export (this build's own measurements, not
Lighthouse estimates):

```
routes                     21
pages read                 21 / 21
page <style> harvested     263,861 B across 61 blocks in 21 pages
dedupe() hoisted            15,845 B into the shared site sheet
site sheet                  28,111 B minified  → /assets/site.<hash>.css
artifacts                   sitemap.xml 4,020 · robots.txt 1,856 · llms.txt 4,796
                            llms-full.txt 140,902 · _headers 1,619 · _redirects 2,299
written                     34 generated files + 19 copied
/assets/ invariant          OK — all 25 files content-hashed
pre-compression             1,839,662 B raw → 373,368 B brotli across 36 files
errors 0 · warnings 14 · PASS
```

Per-page HTML in vs out: total **1,476,524 B → 1,462,730 B (−0.9 %)**. That number is deliberately
unflattering and worth understanding. Three pages grow because the build *adds* real content that
was previously missing or client-side only: `/404/` +55.5 % (it had no SSR chrome at all),
`/sitemap/` +15.4 %, `/contact/` +9.3 %. Twelve service and legal pages shrink 3–9.5 %. The win is
not in the raw document — it is in the **three render-blocking stylesheets going to zero**, the
**87,803 B of pre-interaction JS** dropping to a deferred nav controller, and every text file now
shipping pre-compressed. See `docs/performance-refactor.md`.

---

## 7. How to add a page

**One edit, in one file.** Append a route object to `routes[]` in `site.config.mjs`, then add the
body content at `src/source-export/<path>/index.html`.

```js
{
  id: 'cryostorage',                                   // stable, kebab-case, unique
  path: '/services/lab-solutions/cryostorage/',        // root-relative, trailing slash
  parent: 'lab-solutions',                             // an existing route id
  title: 'Cryostorage Management for IVF Labs | MedTech',   // 30–60 chars
  navLabel: 'Cryostorage',                             // the link text everywhere
  description: '…',                                    // 70–160 chars
  priority: 0.7,
  changefreq: 'monthly',
  inNav: true, inFooter: true, inSitemapXml: true, inLlms: true,
  group: 'lab-solutions',
  icon: 'flask',                                       // a key in navIcons, or null
  summary: '…',                                        // 1–2 sentences
  keywords: ['cryostorage', 'cryopreservation', 'tank monitoring'],
}
```

That one object propagates to: the SSR header's Lab Solutions panel, the footer's Lab Solutions
column, the breadcrumb `<nav>` **and** the matching `BreadcrumbList` JSON-LD on the new page, the
related-links block on its four siblings, `sitemap.xml`, `llms.txt`, `llms-full.txt`, the
`WebPage` + `Service` JSON-LD nodes, and `/assets/search-index.<hash>.json`. `docs/global-sync.md`
walks exactly this example file by file.

What you must **not** do: hand-edit `sitemap.xml`, `llms.txt`, `_headers`, `_redirects` or the
partials in `dist/`. `sync.mjs` overwrites all of them on every build, and every one of them
carries a "generated — do not edit by hand" header saying so.

Also note the standing constraint from the brief: **the route inventory is fixed at 21 pages.**
Adding a route is a mechanical operation the pipeline supports, but the site's 21 unique-title,
zero-doorway-page structure is an asset. Add a page because there is genuinely a page's worth of
distinct content, not to chase a keyword variant.

---

## 8. Conventions that are load-bearing

- **Every internal href is root-relative and ends in `/`.** The export has zero absolute-internal
  links; `validateLinks` keeps it that way.
- **No route is ever added, removed or renamed** without a matching `redirects[]` entry, and every
  redirect target must be an existing route path ending in `/` (or a `/#fragment` whose id exists).
- **Anything under `/assets/` is content-hashed.** It is served `immutable` for a year; the hash is
  the only thing that makes that safe, and the build fails if a file there is unhashed.
- **`_headers` governs this origin only.** The four woff2 faces and every image live on
  `media.cdn.builder.searchatlas.com` and sit outside the cache policy. That is a documented,
  accepted risk, not an oversight. Self-hosting the fonts would change asset URLs and is a
  follow-up, not part of this refactor.
- **Never cite a performance number that was not measured.** The Lighthouse baseline in
  `BRIEF.md` and this build's own byte counts are the only numbers this repo may state.
