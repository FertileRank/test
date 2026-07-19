# MedTech For Solutions — Divi 5 Theme Builder Package

Copy-paste versions of the site's global header (with mega menu, AI search,
and back-to-top) and footer for the Divi 5 Theme Builder. Both snippets are
fully self-contained — no jQuery, no external CSS/JS files, no shortcodes.

| File | Paste into |
|---|---|
| `header-mega-menu.html` | Theme Builder → **Global Header** → Code module |
| `footer.html` | Theme Builder → **Global Footer** → Code module |

## Installing the header

1. WordPress admin → **Divi → Theme Builder**.
2. On the **Default Website Template**, click **Add Global Header → Build Global Header**.
3. Add a section (regular, 1 column is fine) and set its top/bottom padding to **0**.
4. Add a **Code** module and paste the entire contents of `header-mega-menu.html`.
5. Save the layout, then save the Theme Builder changes.

What you get: the fixed teal/lime header with logo, Lab Solutions + Management
mega panels, About dropdown, phone link, AI search overlay (⌘K / Ctrl+K),
"Schedule Consultation" CTA, mobile hamburger menu, compact-on-scroll behavior,
and the floating back-to-top button.

Notes:

- The header is `position: fixed`, so a spacer `<div>` at the end of the
  snippet reserves its height (88px desktop / 76px tablet, auto-measured by a
  small script). If your page sections already leave room at the top, delete
  the `.mm-header-spacer` div and the sizing script at the bottom.
- Disable Divi's default navigation (the Theme Builder global header replaces
  it automatically once assigned to all pages).
- The script is idempotent: if the markup is present it only wires up
  behavior; if the markup is missing (e.g. you paste only the `<script>` +
  `<style>` parts) it injects the header at the top of `<body>` itself.

## Installing the footer

1. In the same Theme Builder template, click **Add Global Footer → Build Global Footer**.
2. Add a section with **0** top/bottom padding.
3. Add a **Code** module and paste the entire contents of `footer.html`. Save.

The footer is scoped under `.mtfs-footer` so it cannot collide with Divi or
theme styles.

## Link + asset assumptions

- All navigation URLs are root-relative (`/about/`, `/lab-solutions/…`,
  `/contact/`, `/staff/`) and match the Search Atlas site structure in
  `pages.manifest.json`. WordPress permalinks must resolve the same paths.
- The logo is a transparent PNG at `/site-assets/mtfs-logo.png` (upload the
  `site-assets/` folder to the site root). To serve it from the Media Library
  instead, swap the `src` in the `.mm-logo` `<img>` — it appears twice in
  `header-mega-menu.html` (static markup + the `HEADER_HTML` fallback in the
  script).
- **Favicon**: upload `site-assets/favicon-512.png` as the WordPress **Site
  Icon** (Appearance → Customize → Site Identity, or Settings → General →
  Site Icon). WordPress generates all favicon sizes from it automatically.
- The DM Sans font is pulled from Google Fonts via `@import` at the top of
  each snippet's `<style>`. If your Divi theme already loads DM Sans, you can
  remove the import.

## Editing the menu

- **Nav items / mega panel entries**: edit the static markup near the top of
  `header-mega-menu.html` (the `<ul class="mm-nav">` block and the
  `.mm-panel` regions).
- **AI search index**: the `SEARCH_INDEX` array at the top of the `<script>`
  defines every searchable page (title, keywords, snippet). Add or edit
  entries when pages change.
- **Phone number / CTA**: appears twice — in the `.mm-right` block of the
  markup and nowhere else.
- **Footer columns**: plain HTML lists inside `footer.html`.

## Full-page conversion (`pages/` + `global.css`)

Every page of the site converted for Divi 5 — content unchanged.

| File | What it is |
|---|---|
| `global.css` | One consolidated stylesheet for all 19 pages |
| `pages/<page>.html` | That page's full content for a Divi Code module |
| `site-assets/` | Local page imagery (JPG + WebP pairs) referenced as `/site-assets/…` — upload this folder to the site root (or rewrite the `src`/`srcset` paths to Media Library URLs) |
| `pages/coming-soon.html` | Bonus: "new website coming soon" promo page — fully self-contained (does not need `global.css`); set the launch date in its CONFIG line, and optionally assign it a blank Theme Builder template for a true standalone splash |

### Install the global stylesheet (once)

Paste the contents of `global.css` into **Divi → Theme Options →
General → Custom CSS** (or enqueue it from a child theme, which is
better for a stylesheet this size — see below).

Child theme option:

```php
// functions.php
add_action('wp_enqueue_scripts', function () {
  wp_enqueue_style('mtfs-global', get_stylesheet_directory_uri() . '/mtfs-global.css', [], '1.0');
});
```

### Install a page

1. Create the WordPress page with the matching permalink
   (`pages/lab-solutions-gpo-purchasing.html` → `/lab-solutions/gpo-purchasing/`;
   the exact path is in the comment at the top of each file).
2. Edit with Divi, add one regular section, one column, **0 padding**
   top/bottom on section and row, full width.
3. Add a **Code** module and paste the page file's entire contents. Save.

### How the conversion works

- Each page is wrapped in `<div class="mtfs-page mtfs-<page>">`.
- Every CSS rule in `global.css` is scoped to the page(s) that
  originally defined it — `.mtfs-page …` for rules shared by all
  pages, `.mtfs-<page> …` for page-specific rules. All prefixes are a
  single class, so every original specificity relationship is
  preserved and nothing can leak into Divi, wp-admin, or other theme
  areas.
- Page-level `noindex`/dev scripts were already removed; the Website
  Studio page-observer script and per-page footers were dropped
  (tracking comes from the OTTO pixel, the footer from the global
  footer template). Each page keeps its own small interactivity
  script (scroll animations, FAQ accordions, the contact-form
  handler) and its JSON-LD structured data.
- The header template auto-hides its spacer on converted pages
  (`body:has(.mtfs-page)`), because these layouts already offset the
  fixed header inside their hero sections.

### Verified

Each converted page was rendered next to its static original in
headless Chromium (1366px, full page) and pixel-diffed. All 19 match
except the footer block — intentionally replaced by the single global
footer (five lab pages previously had a variant footer with
placeholder links to pages that don't exist) — and the nav highlight,
which keys off real permalinks.

### Titles / meta / SEO

Page `<title>`, meta description, canonical, and Open Graph tags are
not part of the body HTML — set them in WordPress (the site's SEO
plugin or OTTO), using the original values from the static pages.
