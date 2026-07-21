=== MedTech For Solutions — Divi Child ===
Requires at least: WordPress 6.0
Tested up to: WordPress 6.9
Requires PHP: 7.4
Parent theme: Divi (5.x — also works on 4.x)
Version: 1.0.0
License: GPLv2 or later

Divi 5 child theme for the MedTech For Solutions website.

== What this theme does on activation ==

1. Loads the Divi parent stylesheet, then this theme's style.css, then
   mtfs-global.css — the consolidated stylesheet that styles every
   converted page's Code module. Nothing needs to be pasted into
   Divi > Theme Options > Custom CSS.
2. Serves the site's imagery (photos, logo, favicon) bundled in this
   theme's site-assets/ folder at the root-relative /site-assets/... URLs
   the page markup uses. No FTP upload to the web root is needed.
3. Adds Google Fonts preconnect hints for the DM Sans / Playfair Display
   fonts the pages load.

All customizations live in this child theme, so updating the Divi parent
theme never touches them.

== Installation ==

1. WordPress admin > Appearance > Themes > Add New > Upload Theme.
2. Choose medtech-divi-child.zip, click Install Now, then Activate.
   (The Divi parent theme must already be installed.)
3. Go to Settings > Permalinks, choose "Post name", and Save (this also
   refreshes the rewrite rule that serves /site-assets/).

== Building the site content ==

Page layouts are Divi Code modules; the header and footer are Theme
Builder Code modules. The snippets live in this theme's theme-builder/
folder (header-mega-menu.html, footer.html) and the per-page module files
ship in the separate MedTech_Divi5_Package.zip:

1. Divi > Theme Builder > Default Website Template:
   - Global Header > Build Global Header > add a Code module > paste
     theme-builder/header-mega-menu.html.
   - Global Footer > Build Global Footer > add a Code module > paste
     theme-builder/footer.html.
2. For each page: create the WordPress page with the matching permalink
   (listed in the comment at the top of each pages/*.html file), edit with
   Divi, add one section/column with 0 padding, add a Code module, and
   paste the page file's contents.
3. Appearance > Customize > Site Identity: upload
   site-assets/favicon-512.png as the Site Icon.

== Notes ==

* mtfs-global.css is enqueued from this theme, so the old "paste
  global.css into Theme Options" step from earlier package versions is
  obsolete. If CSS was pasted there previously, remove it to avoid loading
  the styles twice.
* The /site-assets/ passthrough is a fallback: if a real site-assets/
  directory exists in the web root, the web server serves it directly and
  the theme's copy is ignored.
