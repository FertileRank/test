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
- The logo loads from the Search Atlas CDN
  (`media.cdn.builder.searchatlas.com`). To self-host it, upload the PNG to
  the WordPress Media Library and swap the `src` in the `.mm-logo` `<img>`.
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
