# Divi 5 Custom Code Modules — MedTech For Solutions

Conversion of the sanitized Website Studio export
(`MedTechFullySanitizedWebsiteStudioProjectSyncEnabled.zip`) into paste-ready,
performance-optimized Divi 5 Code modules.

| File | What it is |
|---|---|
| `mtfs-about-divi5-module.html` | **About page** — hero, company story, values, history timeline, team grid, mission, CTA (with consultation wizard), related links, footer. One self-contained block. |
| `mtfs-404-divi5-module.html` | **404 page** — typographic 404 hero with recovery links, for a Theme Builder 404 template. |
| `wp-uploads/mtfs/` | Image + font package. Upload its contents to `/wp-content/uploads/mtfs/` (FTP / file manager, keep names) so the modules' asset URLs resolve. |
| `wp-uploads/mtfs/mtfs-fonts.css` | Optional self-hosted webfont stylesheet (swap-in replacement for the Google Fonts link). |

## Install (About page)

1. **Upload assets**: copy everything inside `wp-uploads/mtfs/` to
   `/wp-content/uploads/mtfs/` on the WordPress host. (The WP media-library
   uploader renames files and changes paths — use FTP or a file manager so the
   URLs baked into the module resolve unchanged.)
2. In the Divi 5 builder add a **fullwidth section** (or a one-column row with
   0 padding / no gutter), insert a **Code module**, and paste the entire
   contents of `mtfs-about-divi5-module.html`. The leading comment block may be
   deleted first.
3. Publish. Page meta (title/description/OG) is head-level and belongs to
   Divi/your SEO plugin, not the module — the source page's values are noted in
   the PR description.

Module structure, in order: critical `<style>` → semantic HTML → deferred
styles (`preload as="style"` + `onload` swap + `<noscript>` fallback) →
IIFE-wrapped `<script>`.

## Configuration switches

- **Consultation wizard** (`data-mtfs-endpoint` on `div.mtfs-about`): empty by
  default, which leaves the "Schedule a Consultation" button as a normal link
  to `/contact/`. Set it to a JSON form-handler URL (WPForms/Gravity Forms
  webhook, custom REST route, or the original platform handler) to activate
  the 4-step modal wizard. The wizard POSTs
  `{"data":{form_name,service,name,practice,role,email,phone,preferred_time,notes}}`
  — the same payload shape as the source site — and includes a honeypot field.
- **Footer**: the module ends with a `<footer class="mtfs-ft">` mirroring the
  source page. If your Divi Theme Builder template already outputs a global
  footer, delete that block from the paste.
- **Fonts**: loaded from Google Fonts, deferred. To self-host instead, point
  the `<link id="mtfs-fonts">` href at
  `/wp-content/uploads/mtfs/mtfs-fonts.css` and delete the two
  `fonts.googleapis.com` / `fonts.gstatic.com` preconnects. If DM Sans/Sora
  are already enabled in Divi Theme Options, delete the module's font links
  entirely to avoid a duplicate request.

## Performance notes

- Above-the-fold CSS (hero + intro section, ~6 KB) is inlined at the top;
  everything below the fold sits in a second style block after the markup, so
  first paint never waits on it. Non-critical *external* CSS (fonts) uses the
  `preload`/`onload` pattern with a `<noscript>` fallback and a JS fallback
  for browsers without preload support.
- The hero image is the LCP element: `<link rel="preload" as="image">` +
  `loading="eager"` + `fetchpriority="high"`. All other images are
  `loading="lazy" decoding="async"` with explicit `width`/`height` (CLS-safe;
  card crops are reserved via CSS `aspect-ratio`).
- JS is one IIFE, parsed after the markup, no globals except the namespaced
  `window.MtfsAbout`. The consultation modal's CSS and DOM are built lazily on
  the first trigger click — zero cost for visitors who never open it.
- `srcset` is intentionally absent: the sanitized export contains exactly one
  resolution per image. If you regenerate variants, add
  `srcset`/`sizes` to the hero and team images.

## Divi-conflict engineering

- Every class is `mtfs-`-prefixed; no bare element selectors escape the
  `.mtfs-about` / `.mtfs-404` wrappers (the source styled `body`, `h1`–`h4`,
  `img`, `svg`, `:root` globally — all rescoped). CSS variables live on the
  wrapper, not `:root`.
- No jQuery use, no `document.write`, no synchronous XHR, no MutationObserver,
  no smooth-scroll or scroll-lock side effects outside the open modal.
- The only `!important` declarations are the reduced-motion accessibility
  overrides (mirroring the source) and the modal's `[hidden]` display guard —
  nothing that fights Divi's own styles.
- Idempotency guard (`window.MtfsAbout`) prevents double-binding if Divi
  renders the module twice (visual builder preview).

## Compatibility flags found in the source export (and how they were handled)

1. **Platform form backend** — the wizard and a global form shim POST to
   `/api/forms/contact/submit/`, a Website Studio server feature that does not
   exist under WordPress. → Wizard made endpoint-configurable and dormant by
   default; the dead form shim was dropped. *Requires server-side setup to
   re-enable (see Configuration).*
2. **Editor-only scripts** — `postMessage` route notifiers and an inspector
   (`/src/lib/*.ts` module imports) run only inside the Studio iframe. →
   Removed.
3. **Missing sanitized assets** — `navigation.js/css`, `mtfs-images.css`, and
   13 referenced images (incl. all team photos) are absent from the zip. →
   Hero/media styling reconstructed; images remapped by dimension from the 18
   shipped files and renamed semantically in `wp-uploads/mtfs/` (swap in real
   team photos when available).
4. **Injected site chrome** — the mega-menu header (fixed positioning,
   `body::before` brand stripe, `body.route-404` hooks) would fight the Divi
   header. → Omitted; Divi Theme Builder owns header/nav.
5. **Unscoped global CSS** — `:root` variables, `body` typography, and a
   site-wide `svg{width:24px;height:24px}` rule that would resize Divi's own
   icons. → Fully rescoped (see above).
6. **Inline event handlers** — footer links used `onmouseover`/`onmouseout`
   style mutation. → Replaced with CSS `:hover`.
7. **Cache-busting meta** — `Cache-Control`/`Pragma`/`Expires` meta tags in the
   export head. → Dropped (caching belongs to the server/CDN).
8. **Google Fonts** — third-party CSS/font origins (`fonts.googleapis.com`,
   `fonts.gstatic.com`); standard CORS-safe font serving, preconnected. GDPR
   note: EU visitors' IPs reach Google — use the self-hosted option if that
   matters for compliance.
9. **No jQuery/Lodash/CDN duplicates, no `document.write`** anywhere in the
   export — nothing to deduplicate against Divi's bundles.
10. **Content fix** — the source stats row repeated "2005 · Founded" twice;
    the duplicate now shows "125+ collective years of experience" (a figure
    stated in the source's own timeline copy).

## Validation performed

- Nu (W3C) HTML checker: 0 errors / 0 warnings for both modules' markup. (The
  one structural liberty is inherent to the container: a Code module cannot
  reach `<head>`, so its `<style>`/`<link>` tags live at body level — valid in
  every browser's parser, universal practice for Divi code modules.)
- `node --check` on the extracted IIFEs.
- Headless Chromium render harness with hostile theme-style globals
  (Georgia/purple headings, oversized `svg` rules): no leakage in either
  direction at 1440px and 390px.
- Wizard exercised end-to-end against a mock endpoint: 4 steps, validation,
  honeypot, POST payload byte-compatible with the source site's schema,
  success screen with reference code; with no endpoint configured the CTA
  falls through to normal `/contact/` navigation.
- Google Fonts blocked at the network level to confirm the system-font
  fallback stacks render acceptably.
