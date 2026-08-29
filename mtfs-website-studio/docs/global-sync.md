# Global Sync Master — specification

`site.config.mjs` is the single source of truth for the whole build. This document is its
contract: the schema field by field, which artifact each field derives, the invariants the
validator enforces, what happens when one is violated, and a worked example of adding a route.

Read `docs/architecture.md` first for the system shape. This document is the detail.

---

## 1. Why a master file exists

The export drifted because the same fact was hand-written in many places. Every item below is
measured, from the four audits in `docs/audit/`:

| Symptom | Places the fact was written |
| --- | --- |
| 12 of 21 `BreadcrumbList` trails omitted the `/services/` tier | each trail, by hand |
| `/our-team/` breadcrumb said "Staff"; its `<title>` and nav label said "Our Team" | 2 |
| `/terms-of-service/` breadcrumb said "Terms of Service"; its `<h1>` said "Terms of Use" | 2 |
| One `@id` `#organization` carried **four** different `@type` shapes across 18 pages | 18 |
| `/services/lab-solutions/` and `/services/management-services/` were the only routes missing from the site-wide footer — while all ten of their children were in it | 21 footers |
| `sitemap.xml` (20 locs), `llms.txt` (20 links) and `llms-full.txt` (20 sources) agreed **by luck** | 3 generators |
| 8 of 22 `_redirects` rules used slash-less targets, producing 301 → 301 chains on the highest-value legacy paths | 22 rules, two conventions |

None of those is a content mistake. Each is a copy that fell out of sync. The fix is structural:
write the fact once, generate every consumer.

---

## 2. `site` — brand-level facts

```js
export const site = {
  origin, name, legalName, description, foundingDate, telephone, email,
  address: { streetAddress, addressLocality, addressRegion, postalCode, addressCountry },
  logo, defaultOgImage, locale: 'en_US', lang: 'en',
  gtmId: 'GTM-MKTJCBZG',
  searchAtlas: { projectId, trackingSecret, dynamicOptimizationSrc, dynamicOptimizationUuid },
};
```

| Field | Derives | Notes |
| --- | --- | --- |
| `origin` | every canonical, `og:url`, JSON-LD `@id`, `sitemap.xml` `<loc>`, `llms*.txt` URLs | Scheme + host, **no** trailing slash. All 21 export canonicals are already self-referencing against this origin; that property is preserved exactly. |
| `name` | `og:site_name`, `Organization.name`, footer, `llms.txt` header | |
| `legalName` | `Organization.legalName` | The export carried this as `alternateName`; `legalName` is the correct schema.org property and the footer copyright already reads "MedTech For Solutions Inc." |
| `description` | `Organization.description` | Structured data, not a meta description — the 160-char rule does **not** apply here. Per-page descriptions live on `routes[].description`. |
| `foundingDate` | `Organization.foundingDate`, footer, `llms.txt` | **OPEN ISSUE.** The export says 2005 in six places and 2006 once, in Dwight Ryan's bio on `/our-team/`. 2005 is kept because it is the overwhelming majority and what the existing structured data publishes. Resolve with the client — do not guess. |
| `telephone`, `email` | `Organization`, footer NAP, `/contact/` | `+1-866-634-9144`, `info@medtech4solutions.com`. |
| `address.*` | `Organization.address` (PostalAddress), footer NAP, `/contact/` | **OPEN ISSUE.** `/contact/` says "Suite 303"; all 21 footers and the schema `streetAddress` say "399 Knollwood Road" with no suite. NAP consistency is ordinary local-SEO hygiene and is currently broken against the site's own schema. |
| `logo`, `defaultOgImage` | `Organization.logo` / `.image`, `og:image` + `og:image:width/height/alt`, `twitter:image` | All of these were absent from **0 of 21** pages in the export while 12 pages declared `twitter:card=summary_large_image` with no image to fill it. |
| `locale`, `lang` | `og:locale=en_US`, `<html lang="en">`, hreflang | One spelling site-wide. |
| `gtmId` | the idle GTM loader and its `<noscript>` iframe | Kept working, deferred, never deleted — a hard constraint from `BRIEF.md`. |
| `searchAtlas.projectId`, `.trackingSecret` | `analytics.js` `data-*` attributes; the `/api/track/` and `/api/event/` payloads | The tracker's payload must stay byte-for-byte identical. |
| `searchAtlas.dynamicOptimizationSrc`, `.dynamicOptimizationUuid` | the second idle-loaded third-party script | |

Additional keys the build reads if present: `sameAs[]`, `geo`, `faxNumber`,
`openingHoursSpecification`, `areaServed`, `knowsAbout`, `preconnect[]`, `navGroups`.
`sameAs` matters most: it is absent from all 21 export pages, and it is the single most important
entity-reconciliation property. It must point at the **company** LinkedIn / Google Business
Profile — not the designer's personal profile, which is what all 21 footers currently link.

---

## 3. `routes[]` — the page manifest

Ordered and hierarchical. Order is the emitted order for nav, footer, sitemap and llms files, so
the array *is* the site's information architecture.

| Field | Type | Required | Derives |
| --- | --- | --- | --- |
| `id` | kebab-case string, unique | error if missing | the join key for `parent`, `graph.byId`, and every cross-reference |
| `path` | string, root-relative, **always** ends `/` | error if missing/invalid | output file (`outputFileFor`), canonical URL, `og:url`, `<loc>`, JSON-LD `@id`, every internal href |
| `parent` | route `id` or `null` | error if it names a non-existent id | `breadcrumbTrail()` → the visible breadcrumb `<nav>` **and** the `BreadcrumbList` JSON-LD; `siblings()`; `relatedRoutes()`; the header panel a page belongs to |
| `title` | 30–60 chars, unique | error if missing; length is a warning | `<title>`, `og:title`, `twitter:title`, `WebPage.name`, `llms.txt` link text |
| `navLabel` | short string | error if missing | **all link text**: primary nav, footer, breadcrumbs, related links. This is what replaced the 26 "Learn More" anchors. |
| `description` | 70–160 chars | error if missing; length is a warning | `<meta name=description>`, `og:description`, `twitter:description`, `WebPage.description` |
| `priority` | number 0.0–1.0 | error if out of range | `sitemap.xml` `<priority>` |
| `changefreq` | sitemap enum | error if invalid | `sitemap.xml` `<changefreq>` |
| `inNav` | boolean | error if not boolean | whether `renderHeader()` links it anywhere in the nav |
| `inFooter` | boolean | error if not boolean | whether `renderFooter()` links it — and `validateLinks` **enforces** that every `inFooter:true` route appears in every page's footer |
| `inSitemapXml` | boolean | error if not boolean | a `<url>` entry; also the indexability tier (`robots` meta, hreflang, WebPage node). False for `/404/` only. |
| `inLlms` | boolean | error if not boolean | a line in `llms.txt` and a section in `llms-full.txt` |
| `group` | `main` \| `lab-solutions` \| `management-services` \| `legal` \| `system` | error if not in the set | footer column, header panel, `relatedRoutes()` group-peer fallback |
| `icon` | `navIcons` key or `null` | warning if neither | the inline SVG the SSR header and panels emit |
| `summary` | 1–2 plain-text sentences | warning if missing | `llms.txt` (`- [Title](url): summary`), the mega-panel blurb, the related-links blurb |
| `keywords` | string[] | warning if not an array | `/assets/search-index.<hash>.json` |

### Derivation map — what one route object produces

```
route ────┬──► render.mjs renderHeadTags()  title, description, robots, canonical,
          │                                 hreflang, og:*, twitter:*, WebPage +
          │                                 Service + BreadcrumbList JSON-LD
          ├──► render.mjs renderHeader()    nav link (inNav), panel entry (group+icon+summary),
          │                                 aria-current="page" when it is the current route
          ├──► render.mjs renderFooter()    footer link (inFooter, group → column)
          ├──► render.mjs renderBreadcrumbs()  <nav aria-label="Breadcrumb"><ol> from
          │                                    breadcrumbTrail(); omitted on / and /404/
          ├──► render.mjs renderRelated()   related-links block from relatedRoutes()
          ├──► artifacts.mjs sitemapXml()   <url> (inSitemapXml) + priority + changefreq + lastmod
          ├──► artifacts.mjs llmsTxt()      "- [title](url): summary"  (inLlms)
          ├──► artifacts.mjs llmsFullTxt()  a section of htmlToMarkdown(rendered page)  (inLlms)
          └──► sync.mjs buildSearchIndex()  { title, href, summary, keywords, icon }
```

Nothing in that column is hand-written anywhere. If it appears twice in the output, it appeared
once in the config.

---

## 4. `redirects[]`, `headerRules[]`, `navIcons`

```js
export const redirects   = [ { from, to, status } ];        // → _redirects
export const headerRules = [ { pattern, headers: {} } ];    // → _headers
export const navIcons    = { key: '<svg …>' };              // → SSR header + panels
```

`redirects[]` fixes the export's two-convention mess. Every `to` is normalised to the canonical
trailing-slash form, and the validator asserts it (§5.2), so the eight slash-less rules
(`/who-we-are`, `/gpo`, `/gpo-registration`, `/recruitment` and their slashed twins) can no longer
produce a 301 → 301 chain.

`headerRules[]` orders from specific to general. The catch-all is `/*`, **not** `/*.html`: the site
publishes pretty URLs, so the document for `/about/` ends in a slash and 19 of 21 documents matched
no rule at all in the export. `immutable` is applied only to `/assets/*`, and `sync.mjs` asserts
that every file it writes there is content-hashed before that promise is made.

`navIcons` values are inline SVG strings using `currentColor` with no `width`/`height` attributes,
so they inherit colour and are sized by CSS. Moving them here removed 4,391 B of icon data from
JavaScript.

---

## 5. Invariants the validator enforces

Two functions, run at two different moments. **`validateManifest` runs first, before a single
source file is read** — a bad manifest stops the build immediately rather than producing 21 subtly
wrong pages.

### 5.1 `validateManifest(routes)` — structural

**Errors (build fails under `--check`):**

- `routes` is not an array, or is empty
- a route is not an object; missing or non-string `id`; **duplicate `id`**
- missing or non-string `path`; path does not start with `/`; **does not end with `/`**; contains
  a query or fragment; contains a doubled slash; contains whitespace; ends in `index.html`;
  is not canonical per `normalizePath()`; **duplicate `path`**
- missing `title`; **duplicate `title`** (21 unique titles is an asset — the export has no
  doorway pages and must keep none)
- missing `navLabel`; missing `description`
- `priority` not a number in 0.0–1.0; `changefreq` not a valid sitemap value
- any of `inNav` / `inFooter` / `inSitemapXml` / `inLlms` not a boolean
- `group` not one of the five allowed values
- `parent` names a route id that does not exist; a route is its own parent; **a cycle in the
  parent chain**; a route's `path` is not under its declared parent's path
- no route declares the home path `/`
- **redirects:** `from` or `to` not root-relative; `from` shadows a real route path; invalid
  `status`; `to` does not end in `/`; `to` is not canonical (*"this is a 301 → 301 chain"*); `to`
  is not an existing route path; `to` is itself a redirect source (*two-hop chain*); a
  `301`/`302` whose target is non-indexable (*"soft 404 — use status 404"*, which is exactly the
  `/untitled → /404/` defect)

**Warnings (reported, do not fail):**

- `id` not kebab-case; `path` not lowercase; a route more than one level below its parent
- `title` outside 30–60 chars, `description` outside 70–160 chars — 15 of 21 export descriptions
  exceeded 160 and one title exceeded 60. *(Pass `{strictLengths:true}` to promote these to
  errors; the default is a warning so a real content fix is not blocked by a build gate.)*
- duplicate `description`; missing `summary`; `keywords` not an array; `icon` neither a string
  nor `null`
- duplicate redirect source with the same target (redundant but harmless)

### 5.2 `validateLinks(pages, graph, opts)` — against the **written** dist

The pages handed to this function are re-read from disk after the write step, so it validates the
bytes that will actually deploy. Problem kinds:

| Kind | Level | Meaning |
| --- | --- | --- |
| `unknown-page` | error | a rendered page whose path is not a route |
| `trailing-slash` | error | an internal href missing its trailing slash |
| `unknown-target` | error | href resolves to neither a route, `EXTRA_ALLOWED_PATHS`, nor an emitted asset |
| `redirect-target` | error | an internal link points at a redirect source instead of the canonical path — a self-inflicted 301 |
| `absolute-internal` | error | `https://medtech4solutions.com/…` used where a root-relative path belongs; the export has **zero** of these and must keep zero |
| `missing-fragment` | error | `/path/#id` where `id` does not exist on that page |
| `generic-anchor` | error | anchor text in the blocklist: `learn more`, `get started`, `click here`, `read more` |
| `label-in-name` | error | visible text not contained in the accessible name (WCAG 2.5.3) — the `aria-label="Marketing"` over "Learn More" shape |
| `empty-anchor` | error | `<a>` with no visible text and no accessible name |
| `missing-footer` | error | a page with no `<footer>` |
| `footer-coverage` | error | a footer that omits a route flagged `inFooter` — this is the check that makes the two service hubs' omission structurally impossible |
| `noindex-target` | warn | a link to a non-indexable route (currently `/sitemap/` → `/404/`) |
| `missing-page` | warn (error with `expectAllRoutes:true`) | a manifest route with no rendered page |

`EXTRA_ALLOWED_PATHS` holds the legal non-route link targets: `/sitemap.xml`, `/robots.txt`,
`/llms.txt`, `/llms-full.txt`, `/favicon.ico` and `/assets/*`. It exists because exactly one
legitimate internal link in the export is not a route — `/sitemap/` → `/sitemap.xml`, anchor text
"XML sitemap".

### 5.3 `findOrphans(pages, graph)`

Routes with no inbound internal link. A self-link does not count. `/` is never an orphan (it is the
entry point) and non-indexable routes are excluded, so `/404/` having no inbound links is correct
once it is dropped from the HTML sitemap.

### 5.4 The `/assets/` hash invariant

`sync.mjs` lists everything it wrote under `dist/assets/` and fails if any filename does not match
`name.<8–32 hex>.ext`. The range is 8–32, not a fixed 8, because two producers write there and they
disagree: `css.mjs::hashName` emits 8 (`site.2e0bf98e.css`) while the Website Studio builder emits
12 (`wordmark-1200.9b009f7cd2e5.avif`, carried over in `/assets/404/`). This check is the only
thing standing between a year of `immutable` and a stale asset nobody can flush — so when it fires,
hash the asset. Do not weaken the regex.

---

## 6. What happens on violation

| Mode | Behaviour |
| --- | --- |
| `node build/sync.mjs` | Reports everything. Errors are printed under **PROBLEMS**; the run still writes `dist/` so you can inspect the damage. Exit code reflects the error count. |
| `node build/sync.mjs --check` | Validates and **writes nothing**. Exits non-zero on any error-level problem. This is the CI gate. |
| Warnings, any mode | Printed, never fatal. Repeated warnings are collapsed with a count so one systemic problem does not bury a unique one. |

A manifest error is fatal **before** any page is read. A link error is found **after** the write,
against the real bytes. Everything is reported in one pass — the build does not stop at the first
problem, because fixing 14 problems one build at a time is how people stop running the validator.

Current state of a real run: **0 errors, 14 warnings, PASS.** The warnings are 11 redundant
redirect pairs (`/gpo` and `/gpo/` both mapping to the same canonical target — deliberate), the
`/sitemap/` → `/404/` link, and 18 unreferenced files inherited from the export's `/assets/404/`
bundle.

---

## 7. Worked example — adding `/services/lab-solutions/cryostorage/`

> Note: the brief fixes the route inventory at 21 pages. This walkthrough shows the mechanism; it
> is not a recommendation to add this page.

### The edit — one object, in one file

Append to `routes[]` in `site.config.mjs`, after the other `lab-solutions` children:

```js
{
  id: 'cryostorage',
  path: '/services/lab-solutions/cryostorage/',
  parent: 'lab-solutions',
  title: 'Cryostorage Management for IVF Laboratories | MedTech',   // 56 chars
  navLabel: 'Cryostorage',
  description:
    'Tank monitoring, chain-of-custody records and inventory audits for IVF cryostorage, '
    + 'managed by MedTech For Solutions for fertility laboratories nationwide.',   // 154 chars
  priority: 0.7,
  changefreq: 'monthly',
  inNav: true,
  inFooter: true,
  inSitemapXml: true,
  inLlms: true,
  group: 'lab-solutions',
  icon: 'flask',
  summary:
    'Continuous cryostorage tank monitoring with documented chain of custody and periodic '
    + 'inventory reconciliation for ART laboratories.',
  keywords: ['cryostorage', 'cryopreservation', 'tank monitoring', 'chain of custody', 'inventory audit'],
},
```

Then create the body content at `src/source-export/services/lab-solutions/cryostorage/index.html`.
Only the page's own `<main>` content matters — the build supplies chrome, head and assets.

### What updates automatically

**Every page in the site (21 → 22 pages):**

1. **Header nav** — `renderHeader()` reads `inNav` + `group`, and the Lab Solutions disclosure
   panel gains a sixth `<a>` with `navLabel` as its text, `icon` as its inline SVG and `summary`
   as its blurb. The panel's item count updates with it. No markup is edited.
2. **Footer** — `renderFooter()` reads `inFooter` + `group`; the Lab Solutions column gains a link
   on all 22 pages. `validateLinks` immediately begins enforcing that coverage: drop the link and
   the build fails with `footer-coverage`.

**On the new page:**

3. `<title>`, `<meta name=description>`, `og:title`, `og:description`, `twitter:title`,
   `twitter:description` — from `title` / `description`.
4. `<link rel=canonical href="https://medtech4solutions.com/services/lab-solutions/cryostorage/">`,
   plus `hreflang` `en` + `x-default` self-pair, from `origin + path`.
5. `<meta name=robots content="index, follow, max-image-preview:large, max-snippet:-1">` — from
   `inSitemapXml: true`.
6. **Visible breadcrumb** — `breadcrumbTrail()` walks `cryostorage → lab-solutions → services →
   home` and emits
   `<nav aria-label="Breadcrumb"><ol>` Home / Services / Lab Solutions / **Cryostorage**
   `</ol></nav>`, with `aria-current="page"` on the last crumb and CSS-generated separators.
   The `/services/` tier is present because `parent` says so — that is the fix for the 12 export
   pages that omitted it.
7. **`BreadcrumbList` JSON-LD** — `breadcrumbJsonLd()` is built from the **same** trail. Visible
   markup and structured data cannot disagree; there is only one walk.
8. **`WebPage` node** — `@id {canonical}#webpage`, with `url`, `name`, `description`,
   `inLanguage`, `isPartOf → {origin}/#website` and `breadcrumb →` the node from step 7.
9. **`Service` node** — `@id {canonical}#service`, with `provider: {"@id": "{origin}/#organization"}`
   as a pure reference (never re-inlined) and `areaServed` from the site-level value.
10. **`Organization` + `WebSite` nodes** — the identical bytes already on every other page.
11. **`<main id="main">`, skip link, header, footer** in that body order; exactly one `<h1>`.

**On the four existing sibling pages:**

12. **Related-links block** — `relatedRoutes()` prefers siblings, so `/real-time-monitoring/`,
    `/regulatory-compliance/`, `/staffing-solutions/`, `/gpo-purchasing/` and
    `/practice-development/` now have a sixth candidate in their sibling pool. The block is
    deterministic (siblings → children → group peers, in manifest order), so the result is stable
    across builds.

**On the parent hub:**

13. `/services/lab-solutions/` gains a sixth child in `graph.children`, so its `OfferCatalog`
    `itemListElement` gains an entry pointing at the new `{canonical}#service` `@id`.

**Site artifacts:**

14. **`sitemap.xml`** — a `<url>` with `<loc>`, per-page `<lastmod>`, `<changefreq>monthly`,
    `<priority>0.7`. 20 → 21 entries.
15. **`llms.txt`** — `- [Cryostorage Management for IVF Laboratories | MedTech](https://medtech4solutions.com/services/lab-solutions/cryostorage/): Continuous cryostorage tank monitoring …`
16. **`llms-full.txt`** — a section containing `htmlToMarkdown()` of the **rendered** page.
17. **`/assets/search-index.<hash>.json`** — a record built from `title`, `path`, `summary`,
    `keywords`, `icon`. The hash changes, so `stamp-assets` rewrites the `data-search-index`
    attribute on every page's nav `<script>` tag. Nothing hand-written; the export's index had 24
    records for 20 unique hrefs and was pure duplication.
18. **`/assets/site.<hash>.css`** — rehashes only if the new page contributes CSS that changes the
    shared sheet.

**Not touched:** `_headers` and `_redirects`, because neither depends on `routes[]` — unless a
legacy path needs to point at the new page, which is a `redirects[]` edit.

### What the validator checks about the new route

Before any file is read: unique `id`, unique `path`, unique `title`, `path` under `parent`'s path,
`priority` in range, `changefreq` valid, all four flags boolean, `group` in the enum, no cycle.

After the write, on the real bytes: the new page appears in all 22 footers; every internal link
resolves and ends in `/`; the breadcrumb anchor text is `navLabel` and never a blocklisted generic
phrase; no anchor's visible text falls outside its accessible name; the page is not an orphan.

### The failure modes it forecloses

Forget `parent` → **error**, not a silently shortened breadcrumb.
Write `/services/lab-solutions/cryostorage` without the trailing slash → **error**, not a
duplicate-content pair.
Give it a title already used by another page → **error**, not a doorway page.
Add it to the nav but forget the footer → **`footer-coverage` error**, not a child that outranks
its parent.
Link to it as "Learn More" → **`generic-anchor` error**, not another Lighthouse `link-text` failure.

That is the whole point of the master file: the bugs the audits found are not reachable from here.
