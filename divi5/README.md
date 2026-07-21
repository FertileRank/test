# MedTech For Solutions — Divi 5 Package (Performance-Optimized)

Everything needed to build the site in the Divi 5 Builder. All module HTML
is minified, CSS-free, and schema-free: styles live in one consolidated
stylesheet, and all SEO metadata lives in `seo-data/MedTech_SEO_Data.xlsx`
for entry in WordPress.

## Package layout

| Path | What it is |
|---|---|
| `global.min.css` | **The one stylesheet** (minified) — all 21 pages, header/mega-menu, footer, and imagery. Install once (below). |
| `global.css` | Readable source of the same stylesheet, for future editing. |
| `header-mega-menu.html` | Global Header Code module (markup + JS only, no CSS). |
| `footer.html` | Global Footer Code module (markup only, no CSS). |
| `pages/<page>.html` | One minified Code module per page (markup + its own small JS only). The permalink is in the comment on line 1 of each file. |
| `seo-data/MedTech_SEO_Data.xlsx` (+ `.csv`) | Extracted SEO data: URL → Meta Title, Meta Description, Schema (JSON-LD). This data was removed from the HTML on purpose — re-enter it in WordPress. |
| `site-assets/` | Page imagery, logo, favicon (JPG + WebP pairs) referenced as `/site-assets/…`. |
| `MedTech_Solutions_Overview.pdf` | Client overview document (linked from the homepage CTA when ready). |

## Install the stylesheet (once) — required

Option A (preferred): use the **medtech-divi-child** child theme and replace
its `mtfs-global.css` with this package's `global.min.css`.

Option B: paste the contents of `global.min.css` into
**Divi → Theme Options → General → Custom CSS**.

Do exactly one of these. The Code modules contain no CSS — without this
step, pages render unstyled.

## Install header & footer (once)

1. **Divi → Theme Builder → Default Website Template**.
2. Global Header → Build Global Header → add a Code module (section/row
   padding 0) → paste `header-mega-menu.html`.
3. Global Footer → Build Global Footer → same, paste `footer.html`.

## Install a page

1. Create the WordPress page with the permalink from the file's line-1
   comment (e.g. `pages/lab-solutions-gpo-purchasing.html` →
   `/services/lab-solutions/gpo-purchasing/`). Set
   **Settings → Permalinks → Post name** and build the page hierarchy
   (`services` → `lab-solutions` / `management-services` → child pages).
2. Edit with Divi: one section, one column, 0 padding, full width.
3. Add a **Code** module and paste the page file's entire contents.

## Enter the SEO data

Open `seo-data/MedTech_SEO_Data.xlsx`. For each page, set the Meta Title
and Meta Description in the SEO plugin (or OTTO/Search Atlas), and add each
JSON-LD object from the Schema column wrapped in
`<script type="application/ld+json">…</script>` (or deploy via OTTO).

## Performance architecture

- **Zero CSS in HTML modules** — one cacheable stylesheet, minified
  (148 KB), no per-page style recalculation or duplication.
- **Minified markup + JS** (terser-compressed; header module 86 KB → 43 KB).
- **No SEO metadata in modules** — titles/descriptions/schema are managed
  in WordPress, keeping the DOM payload minimal.
- **Lazy loading** on every content image (`loading="lazy"
  decoding="async"` with explicit width/height to prevent layout shift);
  WebP with JPEG fallback throughout.
- **Removed**: editor artifacts, tracking-preview scripts, dead CSS rules,
  no-op observers, unused keyframes — audited against the live DOM.

## Verified

Every rebuilt module was rendered in a Divi-simulated shell (header +
page + footer + `global.min.css` only) in headless Chromium at 1366 px and
pixel-diffed against the static site: all pages match within measurement
noise (≤2.3%). Interactions verified on the minified code: mega-menu
panels, AI search (⌘K), compact-on-scroll, back-to-top, mobile hamburger,
FAQ accordions, contact-form validation. Zero console errors.

Notes:

- The header teleports itself to `<body>` on load (Divi wrapper transforms
  would otherwise trap its `position: fixed`) and auto-hides its spacer on
  converted pages (`body:has(.mtfs-page)`).
- The `coming-soon` module intentionally gains the global footer on
  WordPress (the static splash page has none); assign it a blank Theme
  Builder template for a true standalone splash.
- The logo loads from `/site-assets/mtfs-logo.png`; the favicon is set as
  the WordPress Site Icon (`site-assets/favicon-512.png`).
