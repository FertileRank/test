/**
 * build/lib/render.mjs — server-rendered chrome.
 *
 * This module is the fix for the single largest finding in the audit: the navigation does
 * not exist in the shipped HTML at all. `/assets/mega-menu.min.js` builds the entire header
 * at runtime with `document.body.insertAdjacentHTML('afterbegin', HEADER_HTML)`, so all 21
 * exported pages contain 0 `<header>` elements and 20 of 21 contain 0 `<nav>` elements. A
 * crawler that does not execute JavaScript sees a site with no navigation, and Lighthouse
 * attributes 561.6 ms of Style & Layout — 47% of the measured 1.2 s main thread — to the
 * work that injection causes.
 *
 * Everything here is a pure string builder:
 *   - no DOM, no filesystem, no network, no environment, no `Date`, no `Math.random`;
 *   - importing this file has no side effects;
 *   - the same (route, graph, cfg) always produces byte-identical output, so two builds of
 *     the same manifest diff to nothing.
 *
 * Contract (do not add exports):
 *   renderSkipLink, renderHeader, renderFooter, renderBreadcrumbs, renderRelated, renderHeadTags
 *
 * Output rules enforced throughout this file:
 *   - ZERO inline `on*` handlers and ZERO inline `style=` attributes. The shipped header
 *     carries `<img style="height:44px;width:auto;...">`; this one carries a class and real
 *     `width`/`height` attributes instead.
 *   - Every disclosure is a real `<button type="button" aria-expanded aria-controls>`.
 *     Never a `<div>` and never an `<a role="button">`.
 *   - No `role="button"` on an anchor: it overrides the link role and breaks middle-click
 *     and open-in-new-tab. The shipped `.mm-cta` and mobile CTA both do this.
 *   - Redundant implicit roles are dropped: `role="banner"` on `<header>`,
 *     `role="navigation"` on `<nav>`, `role="contentinfo"` on `<footer>`, `role="main"`.
 *   - `aria-current="page"` and `.mm-active` are computed at BUILD time from the route
 *     graph. The `data-mm-match` regex attributes and the runtime `new RegExp()` loop are
 *     gone.
 *   - Exactly one `<h1>` per page, and never inside the header or the footer. Footer column
 *     titles are `<h2>` (the export opens them at `<h4>` directly after an `<h2>`, which is
 *     the measured `heading-order` failure — 63 elements across 21 pages). Mega-panel titles
 *     are non-heading `<p id>` referenced by `aria-labelledby`.
 *   - Every link carries descriptive text. Nothing here can emit "Learn More".
 *
 * Deliberately NOT rendered here:
 *   - The search overlay (24 elements / 1,565 B of markup + 8,135 B of CSS). It belongs to
 *     the lazily-loaded search.js, injected on first open.
 *   - The consultation modal. It is built on first intent by the lazy loader.
 *   - The `<style>`/`<link>` for CSS and every `<script>`: `inline-critical-css`,
 *     `defer-third-party`, `lazy-modal` and `preload-lcp` in html.mjs own those.
 *   - The Organization and WebSite JSON-LD nodes: `artifacts.mjs::organizationJsonLd`
 *     builds them once and sync.mjs injects the identical bytes on every page.
 *     `renderHeadTags` emits only the PER-PAGE graph and references those nodes by @id.
 *
 * ---------------------------------------------------------------------------------------
 * CSS CONTRACT — stable class names this module introduces
 * ---------------------------------------------------------------------------------------
 * The export styles the footer and the skip link through builder-generated `il*` classes
 * whose meaning changes from page to page (il13, il15, il23, il25, il30 and il33 each map
 * to two different rules depending on the file), so they can never appear in a shared
 * stylesheet. This module emits stable semantic classes instead. css.mjs must ship the
 * following rules, carrying over the declarations the export already had:
 *
 *   .mtfs-skip-link           <- .il2   (position:absolute;top:-100%;left:50%;
 *                                        transform:translateX(-50%);background:var(--teal);
 *                                        color:#fff;padding:12px 24px;border-radius:0 0 8px 8px;
 *                                        z-index:9999;font-weight:600)
 *   .mtfs-skip-link:focus,
 *   .mtfs-skip-link:focus-visible { top:0 }        <- replaces the onfocus/onblur pair
 *   .mtfs-footer              <- .il21   .mtfs-footer__grid      <- .il22
 *   .mtfs-footer__logo img    <- .il23   .mtfs-footer__blurb     <- .il24
 *   .mtfs-footer__contact     <- .il25   .mtfs-footer__contact a <- .il26
 *   .mtfs-footer__title       <- .il27  (and it MUST NOT inherit the global h2 size — it is
 *                                        a .85rem uppercase label that is now an <h2>)
 *   .mtfs-footer__list        <- .il28   .mtfs-footer__list li   <- .il29
 *   .mtfs-footer__list a      <- .il30   .mtfs-footer__bottom    <- .il31
 *   .mtfs-footer__bottom a    <- .il32
 *   .mtfs-footer a:hover, .mtfs-footer a:focus-visible { color: var(--teal) }
 *   .mm-col-title             <- mirror of `.mm-col h4` (the panel title is a <p> now)
 *   .mm-col-title .mm-pill    <- mirror of `.mm-col h4 .mm-pill`
 *   .mm-col-mgmt .mm-col-title .mm-pill <- mirror of `.mm-col-mgmt h4 .mm-pill`
 *   .mm-logo-img              <- mirror of `.mm-logo img` (replaces the inline style=)
 *   .mtfs-breadcrumb / __list / __item / __current  (new; separators are CSS-generated:
 *                                `.mtfs-breadcrumb__item + .mtfs-breadcrumb__item::before
 *                                { content: "/" }` — never a literal "/" text node)
 *
 * Every `.mm-*` class already present in the export is reproduced verbatim so
 * `/assets/mega-menu.css` continues to apply to this markup unchanged.
 *
 * IMPORTANT: the closed state of `.mm-panel` lives ONLY in CSS
 * (`.mm-panel{opacity:0;visibility:hidden;pointer-events:none}`). `visibility:hidden` does
 * remove the panel from the accessibility tree and the tab order, so it satisfies the
 * disclosure rule — but ONLY if that rule is in the inline critical block. If it is ever
 * moved to an async sheet, first paint shows all three mega panels expanded in flow.
 *
 * ---------------------------------------------------------------------------------------
 * `cfg` shape
 * ---------------------------------------------------------------------------------------
 * `cfg` is either the `site` object from site.config.mjs, or a bundle `{ site, navIcons }`.
 * Both are accepted so callers can pass `cfg` straight through from html.mjs's `ctx`.
 *
 * Required `site` keys (site.config.mjs contract): origin, name, legalName, description,
 * telephone, email, address{streetAddress, addressLocality, addressRegion, postalCode,
 * addressCountry}, logo, defaultOgImage, locale, lang.
 *
 * `logo` and `defaultOgImage` may be a URL string or `{url, width, height, alt}`. Prefer the
 * object form: without width/height the logo reserves no space (its CDN host was measurably
 * unreachable during the Lighthouse run) and `og:image:width`/`og:image:height` cannot be
 * emitted — this module will not invent dimensions.
 *
 * OPTIONAL `site` keys, each degrading gracefully when absent:
 *   telephoneDisplay  '(866) 634-9144'       - otherwise derived from `telephone`
 *   footerBlurb       short footer sentence  - otherwise `description`
 *   copyrightYear     2026                   - otherwise the year is omitted (no `new Date()`)
 *   credit            {label, href}          - the "Design by ..." footer credit
 *   areaServed        schema.org node        - one value shared by all 13 Service nodes
 *   fontPreloads      [{href, type, fetchpriority}] - otherwise FONT_PRELOADS below
 *   preconnect        ['https://host']       - otherwise PRECONNECT below
 *   twitterSite       '@handle'              - omitted when absent
 *
 * `navIcons` is TRUSTED first-party config: its values are inline `<svg>` strings emitted
 * raw. Anything that is not a string beginning with `<svg` is dropped.
 */

import { breadcrumbTrail, canonicalUrl, normalizePath, relatedRoutes } from './routes.mjs';

/* ================================================================== *
 * Escaping — every caller-supplied string goes through one of these.
 * ================================================================== */

/**
 * HTML-escape text or an attribute value. Safe in both positions: quotes and apostrophes are
 * encoded too, so the result can be dropped inside "..." or '...' or between tags.
 * @param {unknown} value
 * @returns {string}
 */
function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Schemes that must never reach an href/src. */
const UNSAFE_SCHEME_RE = /^[\s\x00-\x1F]*(?:javascript|vbscript|data)[\s\x00-\x1F]*:/i;

/**
 * Escape a URL for an attribute, neutralising script-bearing schemes.
 * `mailto:`, `tel:`, `http(s):` and root-relative paths pass through unchanged.
 * @param {unknown} value
 * @returns {string}
 */
function escUrl(value) {
  if (value === null || value === undefined) return '';
  const raw = String(value).trim();
  if (raw === '') return '';
  return UNSAFE_SCHEME_RE.test(raw) ? '#' : esc(raw);
}

/**
 * Render one attribute, or nothing at all for null/undefined/false/''.
 * `true` renders the boolean form.
 * @param {string} name
 * @param {unknown} value
 * @returns {string}
 */
function attr(name, value) {
  if (value === null || value === undefined || value === false) return '';
  if (value === true) return ' ' + name;
  const s = String(value);
  if (s === '') return '';
  return ' ' + name + '="' + esc(s) + '"';
}

/** Same as attr(), but the value is treated as a URL. */
function urlAttr(name, value) {
  const u = escUrl(value);
  return u === '' ? '' : ' ' + name + '="' + u + '"';
}

/** `<meta name="..." content="...">`, skipped entirely when the content is empty. */
function metaName(name, content) {
  const c = content === null || content === undefined ? '' : String(content);
  return c === '' ? '' : '<meta name="' + esc(name) + '" content="' + esc(c) + '">';
}

/** `<meta property="..." content="...">` for Open Graph. */
function metaProperty(property, content) {
  const c = content === null || content === undefined ? '' : String(content);
  return c === '' ? '' : '<meta property="' + esc(property) + '" content="' + esc(c) + '">';
}

/**
 * Serialise JSON-LD for a `<script>` body.
 *
 * `<`, `>` and `&` become \u escapes so no `</script` sequence can terminate the element
 * early and no entity is mis-parsed; U+2028 and U+2029 are escaped because they are valid
 * in JSON but not in a JavaScript string literal. The result is still valid JSON.
 *
 * @param {unknown} value
 * @returns {string}
 */
function jsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Join fragments, dropping the empties, with no separator. */
function join(parts) {
  return parts.filter((p) => typeof p === 'string' && p !== '').join('');
}

/* ================================================================== *
 * cfg / icon plumbing
 * ================================================================== */

/**
 * Accept `site`, or `{site, navIcons}`, and always hand back both.
 * @param {object} cfg
 * @returns {{site: object, icons: object}}
 */
function resolveCfg(cfg) {
  const c = cfg && typeof cfg === 'object' ? cfg : {};
  const site = c.site && typeof c.site === 'object' ? c.site : c;
  const icons =
    c.navIcons && typeof c.navIcons === 'object' && c.navIcons !== null
      ? c.navIcons
      : site && typeof site.navIcons === 'object' && site.navIcons !== null
        ? site.navIcons
        : {};
  return { site: site && typeof site === 'object' ? site : {}, icons };
}

/**
 * One inline icon from the sprite. Values are trusted first-party SVG strings; anything that
 * is not a string starting with `<svg` renders as nothing rather than as markup.
 * @param {object} icons
 * @param {string|null|undefined} key
 * @returns {string}
 */
function icon(icons, key) {
  if (!key) return '';
  const svg = icons && Object.prototype.hasOwnProperty.call(icons, key) ? icons[key] : null;
  if (typeof svg !== 'string') return '';
  const trimmed = svg.trim();
  if (!/^<svg[\s>]/i.test(trimmed)) return '';
  if (/<\/script/i.test(trimmed)) return '';
  return trimmed;
}

/**
 * A url/width/height/alt bundle from a config value that may be a bare string.
 * @param {unknown} value
 * @param {string} fallbackAlt
 * @returns {{url: string, width: string, height: string, alt: string}}
 */
function imageRef(value, fallbackAlt) {
  if (typeof value === 'string') {
    return { url: value, width: '', height: '', alt: fallbackAlt || '' };
  }
  if (value && typeof value === 'object') {
    // Accept `url` (the contract spelling) or `src` (the natural spelling when
    // authoring a config by hand). Tolerating both matters because the failure
    // mode of getting it wrong is SILENT: url === '' makes renderHeader fall
    // back to the text wordmark, and the build still succeeds.
    const href = typeof value.url === 'string' ? value.url
      : typeof value.src === 'string' ? value.src
        : '';
    return {
      url: href,
      width: value.width === undefined || value.width === null ? '' : String(value.width),
      height: value.height === undefined || value.height === null ? '' : String(value.height),
      alt: typeof value.alt === 'string' ? value.alt : fallbackAlt || '',
    };
  }
  return { url: '', width: '', height: '', alt: fallbackAlt || '' };
}

/** `tel:` href from a configured phone number: keep a leading `+`, drop everything else. */
function telHref(telephone) {
  const s = String(telephone === null || telephone === undefined ? '' : telephone);
  const digits = s.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  return digits === '' || digits === '+' ? '' : 'tel:' + digits;
}

/**
 * Human-readable phone number. Uses `site.telephoneDisplay` when present; otherwise formats
 * a North-American number as "(866) 634-9144" and hands anything else back unchanged.
 * @param {object} site
 * @returns {string}
 */
function telDisplay(site) {
  if (site && typeof site.telephoneDisplay === 'string' && site.telephoneDisplay !== '') {
    return site.telephoneDisplay;
  }
  const raw = String((site && site.telephone) || '');
  const digits = raw.replace(/\D/g, '');
  const nanp = digits.length === 11 && digits.charAt(0) === '1' ? digits.slice(1) : digits;
  if (nanp.length !== 10) return raw;
  return '(' + nanp.slice(0, 3) + ') ' + nanp.slice(3, 6) + '-' + nanp.slice(6);
}

/** "399 Knollwood Road, White Plains, NY 10603" from the configured PostalAddress. */
function addressLine(site) {
  const a = (site && site.address) || {};
  const street = a.streetAddress ? String(a.streetAddress) : '';
  const city = a.addressLocality ? String(a.addressLocality) : '';
  const region = a.addressRegion ? String(a.addressRegion) : '';
  const zip = a.postalCode ? String(a.postalCode) : '';
  const tail = [region, zip].filter(Boolean).join(' ');
  return [street, city, tail].filter(Boolean).join(', ');
}

/** 'en_US' -> 'en-US' for schema.org `inLanguage`. */
function bcp47(site) {
  const locale = String((site && site.locale) || '');
  if (locale !== '') return locale.replace(/_/g, '-');
  return String((site && site.lang) || 'en');
}

/* ================================================================== *
 * Route helpers
 * ================================================================== */

/** Path of a Route or a path string, normalised, with any ?query/#fragment removed. */
function pathOf(route) {
  const p = normalizePath(typeof route === 'string' ? route : route && route.path);
  const marks = [p.indexOf('?'), p.indexOf('#')].filter((i) => i >= 0);
  const cut = marks.length > 0 ? Math.min(...marks) : p.length;
  return p.slice(0, cut);
}

/** The visible label for a route: navLabel, then title, then id. */
function labelOf(route) {
  if (!route) return '';
  if (route.navLabel) return String(route.navLabel);
  if (route.title) return String(route.title);
  return String(route.id === undefined || route.id === null ? '' : route.id);
}

/** Look a route up by path; null when the manifest does not have it. */
function routeAt(graph, path) {
  if (!graph || !graph.byPath) return null;
  return graph.byPath.get(pathOf(path)) || null;
}

/** Children of a route, in manifest order. */
function childrenOf(graph, route) {
  if (!graph || !graph.children || !route) return [];
  return graph.children.get(route.id) || [];
}

/** Every path on the current route's breadcrumb trail — the input to `.mm-active`. */
function trailPaths(currentRoute, graph) {
  const set = new Set();
  if (!currentRoute || !graph) return set;
  for (const r of breadcrumbTrail(currentRoute, graph)) set.add(pathOf(r));
  set.add(pathOf(currentRoute));
  return set;
}

/* ================================================================== *
 * Primary navigation shape
 * ================================================================== */

/**
 * The top-level nav, in the order the export ships it:
 *   Home | Lab Solutions (disclosure) | Management (disclosure) | About (disclosure)
 *   | Book a Consultation (mobile-only)
 *
 * Everything that CAN come from the manifest does: hrefs, link text, panel item blurbs,
 * icons, item counts and the hub links are all read from `routes[]` through the graph. The
 * only literals below are chrome copy with no home in a route record — the trigger label
 * where it differs from the hub's navLabel ("Management" vs "Management Services"), the
 * panel heading, and the feature-card title. A panel whose hub path is missing from the
 * manifest is skipped rather than rendered empty.
 */
const NAV_PANELS = [
  {
    key: 'lab',
    panelId: 'mm-lab-panel',
    hubPath: '/services/lab-solutions/',
    triggerLabel: 'Lab Solutions',
    panelTitle: 'Laboratory Solutions',
    featureTitle: 'Built for ART labs',
  },
  {
    key: 'mgmt',
    panelId: 'mm-mgmt-panel',
    hubPath: '/services/management-services/',
    triggerLabel: 'Management',
    panelTitle: 'Management Services',
    featureTitle: 'Operational support',
  },
  {
    key: 'about',
    panelId: 'mm-about-panel',
    hubPath: null,
    itemPaths: ['/about/', '/our-team/'],
    triggerLabel: 'About',
    panelTitle: null,
    featureTitle: null,
  },
];

/** The "View all services" foot-link target. */
const SERVICES_HUB_PATH = '/services/';

/**
 * Where the header CTA points.
 *
 * `#consult` is a deliberate ADDITION: the lazy loader opens the consultation modal on this
 * hash at load and on hashchange, and the anchor gives a no-JS visitor a real destination.
 * PRECONDITION: `/contact/` must carry an element with `id="consult"`, otherwise
 * `validateLinks` reports `missing-fragment` for every page.
 */
const CONSULT_HREF = '/contact/#consult';

/**
 * Fonts to preload. Verified against the Lighthouse network-requests log: of the four unique
 * woff2 files fonts.css declares, the browser requested exactly these two, both `latin`.
 * Sora paints the measured LCP element (`h1#h1`), so it goes first at fetchpriority=high.
 * The two `latin-ext` files are never requested and must never be preloaded.
 */
const FONT_PRELOADS = [
  {
    href: 'https://media.cdn.builder.searchatlas.com/site-assets/e311c34b-e043-4493-8bbe-3b526ea53fd2/811e11966d29f3a01fcb19b087b61ac0.woff2',
    type: 'font/woff2',
    fetchpriority: 'high',
  },
  {
    href: 'https://media.cdn.builder.searchatlas.com/site-assets/e311c34b-e043-4493-8bbe-3b526ea53fd2/ca72d2bcea8f4daa783dbdfa2d9b4606.woff2',
    type: 'font/woff2',
    fetchpriority: '',
  },
];

/** Third-party origins worth an early connection (the font and image CDN). */
const PRECONNECT = ['https://media.cdn.builder.searchatlas.com'];

/** Routes under this prefix get a schema.org Service node — 13 pages: /services/ plus 12. */
const SERVICE_PREFIX = '/services/';

/** areaServed used by every Service node when site.config.mjs does not override it. */
const DEFAULT_AREA_SERVED = { '@type': 'Country', name: 'United States' };

/** Only /contact/ carries geo.* meta: it is the page with the address and opening hours. */
const GEO_META_PATH = '/contact/';

/* ================================================================== *
 * renderSkipLink
 * ================================================================== */

/**
 * The skip link, which must be the FIRST node inside `<body>`.
 *
 * The export ships one on 3 of 21 pages, and even there `mega-menu.js` inserts the header
 * with `insertAdjacentHTML('afterbegin', ...)`, which puts the header AHEAD of it — so the
 * link sits roughly ten tab stops deep and skips nothing. Lighthouse reports the skip-link
 * audit as "notApplicable" because axe never gets to evaluate it.
 *
 * The `onfocus`/`onblur` pair that revealed it is replaced by
 * `.mtfs-skip-link:focus, .mtfs-skip-link:focus-visible { top: 0 }`.
 *
 * @returns {string}
 */
export function renderSkipLink() {
  return '<a class="mtfs-skip-link" href="#main">Skip to main content</a>';
}

/* ================================================================== *
 * renderHeader
 * ================================================================== */

/**
 * One mega-panel service link.
 * @param {object} route
 * @param {string} groupKey
 * @param {object} icons
 * @param {string} currentPath
 * @returns {string}
 */
function panelItem(route, groupKey, icons, currentPath) {
  const href = pathOf(route);
  const isCurrent = href === currentPath;
  const ico = icon(icons, route.icon);
  return join([
    '<li>',
    '<a class="mm-item' + (isCurrent ? ' mm-active' : '') + '"',
    urlAttr('href', href),
    attr('data-mm-section', groupKey),
    attr('aria-current', isCurrent ? 'page' : null),
    '>',
    ico === '' ? '' : '<span class="mm-item-ico" aria-hidden="true">' + ico + '</span>',
    '<span class="mm-item-body">',
    '<strong>' + esc(labelOf(route)) + '</strong>',
    route.summary ? '<span>' + esc(route.summary) + '</span>' : '',
    '</span>',
    '</a>',
    '</li>',
  ]);
}

/**
 * A disclosure `<li>`: the trigger button plus the panel it controls.
 * @param {object} spec  one entry of NAV_PANELS
 * @param {object} graph
 * @param {object} icons
 * @param {string} currentPath
 * @param {Set<string>} trail
 * @returns {string}  '' when the manifest has none of the panel's routes
 */
function navPanel(spec, graph, icons, currentPath, trail) {
  const hub = spec.hubPath ? routeAt(graph, spec.hubPath) : null;
  if (spec.hubPath && !hub) return '';

  const items = hub
    ? childrenOf(graph, hub)
    : (spec.itemPaths || []).map((p) => routeAt(graph, p)).filter(Boolean);
  if (items.length === 0) return '';

  const triggerId = spec.panelId + '-trigger';
  const titleId = spec.panelId + '-title';
  const active =
    (hub !== null && trail.has(pathOf(hub))) || items.some((r) => trail.has(pathOf(r)));

  const servicesHub = routeAt(graph, SERVICES_HUB_PATH);
  const arrow = icon(icons, 'arrowR');
  const caret = icon(icons, 'caret');

  // Feature card. A <div>, not an <aside>: an <aside> inside <header> adds a complementary
  // landmark per panel (three of them) for what is a styled link. The hub link it carries is
  // the header's only route to /services/lab-solutions/ and /services/management-services/,
  // the two routes the export's footer omits, so the link itself stays.
  const feature =
    hub && spec.featureTitle
      ? join([
          '<div class="mm-panel-feature">',
          '<strong>' + esc(spec.featureTitle) + '</strong>',
          hub.summary ? '<span>' + esc(hub.summary) + '</span>' : '',
          '<a',
          urlAttr('href', pathOf(hub)),
          attr('aria-current', pathOf(hub) === currentPath ? 'page' : null),
          '>Explore ' + esc(labelOf(hub)),
          arrow === '' ? '' : ' <span aria-hidden="true">' + arrow + '</span>',
          '</a>',
          '</div>',
        ])
      : '';

  const foot =
    hub && servicesHub
      ? join([
          '<div class="mm-panel-foot">',
          '<span>' + esc(String(items.length)) + ' service lines</span>',
          '<a',
          urlAttr('href', pathOf(servicesHub)),
          attr('aria-current', pathOf(servicesHub) === currentPath ? 'page' : null),
          '>View all ' + esc(labelOf(servicesHub)),
          arrow === '' ? '' : ' <span aria-hidden="true">' + arrow + '</span>',
          '</a>',
          '</div>',
        ])
      : '';

  // The panel title is a <p>, not an <h4>: three <h4> elements inside <header> would make the
  // first heading in the document an h4 and break the outline before the page's <h1>.
  const title =
    spec.panelTitle === null || spec.panelTitle === undefined
      ? ''
      : join([
          '<p class="mm-col-title" id="' + esc(titleId) + '">',
          esc(spec.panelTitle),
          ' <span class="mm-pill">' + esc(String(items.length)) + '</span>',
          '</p>',
        ]);

  return join([
    '<li>',

    '<button type="button"',
    attr('id', triggerId),
    attr('class', active ? 'mm-active' : null),
    attr('data-mm-trigger', spec.key),
    ' aria-expanded="false"',
    attr('aria-controls', spec.panelId),
    '>',
    esc(spec.triggerLabel),
    caret === '' ? '' : ' <span class="mm-caret" aria-hidden="true">' + caret + '</span>',
    '</button>',

    // The closed state comes from the inline critical CSS:
    // .mm-panel{opacity:0;visibility:hidden;pointer-events:none}. visibility:hidden removes
    // the panel from the accessibility tree AND the tab order, which is what the disclosure
    // rule requires — but only while that rule is in the critical block.
    '<div class="mm-panel mm-panel-' + esc(spec.key) + '"',
    attr('id', spec.panelId),
    '>',
    '<div class="mm-panel-grid">',
    '<div class="mm-col mm-col-' + esc(spec.key) + '">',
    title,
    '<ul class="mm-items"',
    attr('aria-labelledby', title === '' ? triggerId : titleId),
    '>',
    items.map((r) => panelItem(r, spec.key, icons, currentPath)).join(''),
    '</ul>',
    '</div>',
    feature,
    '</div>',
    foot,
    '</div>',

    '</li>',
  ]);
}

/**
 * The server-rendered site header.
 *
 * Emits, in order: the logo link, `<nav aria-label="Primary">` carrying the full mega-menu
 * as nested `<ul>` with a real `<a href>` for every destination and a
 * `<button type="button" aria-expanded="false" aria-controls>` for each of the three
 * disclosure panels, then the utility rail (phone, search trigger, CTA, burger), and finally
 * the mobile scrim and back-to-top button that mega-menu.css positions as fixed siblings of
 * the header.
 *
 * Class names are exactly the ones `/assets/mega-menu.css` already targets, so the existing
 * stylesheet applies to this markup unchanged.
 *
 * @param {object} currentRoute
 * @param {ReturnType<import('./routes.mjs').buildGraph>} graph
 * @param {object} cfg
 * @returns {string}
 */
export function renderHeader(currentRoute, graph, cfg) {
  const { site, icons } = resolveCfg(cfg);
  const currentPath = pathOf(currentRoute);
  const trail = trailPaths(currentRoute, graph);

  const home = routeAt(graph, '/');
  const logo = imageRef(site.logo, site.name ? String(site.name) : '');
  const phone = telDisplay(site);
  const phoneHref = telHref(site.telephone);

  const homeItem = home
    ? join([
        '<li><a',
        urlAttr('href', pathOf(home)),
        attr('class', currentPath === pathOf(home) ? 'mm-active' : null),
        attr('aria-current', currentPath === pathOf(home) ? 'page' : null),
        '>' + esc(labelOf(home)) + '</a></li>',
      ])
    : '';

  const panels = NAV_PANELS.map((spec) => navPanel(spec, graph, icons, currentPath, trail)).join('');

  // Mobile-only CTA. No role="button" on an anchor — that overrides the link role and breaks
  // middle-click and open-in-new-tab.
  const mobileCta = join([
    '<li class="mm-mobile-only"><a',
    urlAttr('href', CONSULT_HREF),
    ' data-open-consult>Book a Consultation</a></li>',
  ]);

  const phoneIco = icon(icons, 'phone');
  const searchIco = icon(icons, 'search');
  const arrow = icon(icons, 'arrowR');
  const arrowUp = icon(icons, 'arrowU');

  return join([
    '<header class="mm-header" id="mm-header">',
    '<div class="mm-bar">',

    '<a class="mm-logo" href="/"',
    attr('aria-label', (site.name ? String(site.name) + ' ' : '') + 'Home'),
    '>',
    logo.url === ''
      ? '<span class="mm-logo-text">' + esc(site.name) + '</span>'
      : join([
          '<img class="mm-logo-img"',
          urlAttr('src', logo.url),
          attr('alt', logo.alt || site.name || ''),
          attr('width', logo.width || null),
          attr('height', logo.height || null),
          ' decoding="async">',
        ]),
    '</a>',

    '<nav aria-label="Primary">',
    '<ul class="mm-nav" id="mm-nav">',
    homeItem,
    panels,
    mobileCta,
    '</ul>',
    '</nav>',

    '<div class="mm-right">',

    phoneHref === ''
      ? ''
      : join([
          '<a class="mm-phone"',
          urlAttr('href', phoneHref),
          '>',
          phoneIco === '' ? '' : '<span aria-hidden="true">' + phoneIco + '</span>',
          '<span>' + esc(phone) + '</span>',
          '</a>',
        ]),

    // The kbd hint is aria-hidden so the visible text ("Search") stays contained in the
    // accessible name ("Open AI search"). Without that this is a label-in-name failure.
    '<button class="mm-search-btn" type="button" id="mm-search-open"',
    ' aria-label="Open AI search" aria-haspopup="dialog" aria-expanded="false">',
    searchIco === '' ? '' : '<span aria-hidden="true">' + searchIco + '</span>',
    '<span>Search</span>',
    '<span class="mm-search-kbhint" aria-hidden="true"><kbd>&#8984;</kbd><kbd>K</kbd></span>',
    '</button>',

    '<a class="mm-cta"',
    urlAttr('href', CONSULT_HREF),
    ' data-open-consult>Book a Consultation',
    arrow === '' ? '' : ' <span aria-hidden="true">' + arrow + '</span>',
    '</a>',

    '<button class="mm-burger" type="button" aria-label="Toggle menu"',
    ' aria-controls="mm-nav" aria-expanded="false">',
    '<span aria-hidden="true"></span>',
    '<span aria-hidden="true"></span>',
    '<span aria-hidden="true"></span>',
    '</button>',

    '</div>',
    '</div>',
    '</header>',

    // Fixed-position siblings of the header. mega-menu.css hides both by default
    // (.mm-mobile-scrim, .mm-back-to-top { opacity:0; visibility:hidden }); nav.js reveals
    // them from an IntersectionObserver sentinel rather than a scroll handler.
    '<div class="mm-mobile-scrim" aria-hidden="true"></div>',
    '<button class="mm-back-to-top" id="mm-back-to-top" type="button" aria-label="Back to top">',
    arrowUp === '' ? '' : '<span aria-hidden="true">' + arrowUp + '</span>',
    '</button>',
  ]);
}

/* ================================================================== *
 * renderFooter
 * ================================================================== */

/** Column headings, keyed by `routes[].group`. */
const GROUP_LABELS = {
  'lab-solutions': 'Lab Solutions',
  'management-services': 'Management Services',
  main: 'Company',
  legal: 'Legal',
  system: 'More',
};

/** Column order. Anything else falls into "Company". */
const FOOTER_GROUP_ORDER = ['lab-solutions', 'management-services', 'main'];

/** Groups rendered in the bottom bar rather than as a column. */
const FOOTER_BOTTOM_GROUPS = new Set(['legal', 'system']);

/**
 * The site footer.
 *
 * Every column is generated from `routes[].inFooter` and `routes[].group`, so the two
 * service hubs cannot go missing again: the export's footer links 18 of 21 routes and omits
 * exactly `/services/lab-solutions/` and `/services/management-services/` while linking all
 * 10 of their children, leaving every child with more inbound links than its own parent.
 * Any inFooter route whose group has no column of its own is folded into "Company", so
 * `validateLinks`'s footer-coverage rule cannot fail because someone added a group id.
 *
 * Column titles are `<h2>`. The export opens them at `<h4>` immediately after an `<h2>`,
 * which is the `heading-order` failure Lighthouse actually names
 * (`div.ctr > div.ftg > div.ftc > h4.il27`, nodeLabel "LAB SOLUTIONS") — 63 elements across
 * all 21 pages.
 *
 * @param {object} currentRoute
 * @param {ReturnType<import('./routes.mjs').buildGraph>} graph
 * @param {object} cfg
 * @returns {string}
 */
export function renderFooter(currentRoute, graph, cfg) {
  const { site } = resolveCfg(cfg);
  const currentPath = pathOf(currentRoute);

  const all = graph && graph.byId ? [...graph.byId.values()] : [];
  const footerRoutes = all.filter((r) => r && r.inFooter === true);

  const seenGroups = [];
  const bottomRoutes = [];
  const byGroup = new Map();

  for (const r of footerRoutes) {
    const group = r.group ? String(r.group) : 'main';
    if (FOOTER_BOTTOM_GROUPS.has(group)) {
      bottomRoutes.push(r);
      continue;
    }
    const key = FOOTER_GROUP_ORDER.includes(group) ? group : 'main';
    if (!byGroup.has(key)) {
      byGroup.set(key, []);
      seenGroups.push(key);
    }
    byGroup.get(key).push(r);
  }

  const ordered = FOOTER_GROUP_ORDER.filter((g) => byGroup.has(g)).concat(
    seenGroups.filter((g) => !FOOTER_GROUP_ORDER.includes(g))
  );

  const link = (route) => {
    const href = pathOf(route);
    const isCurrent = href === currentPath;
    return join([
      '<a',
      urlAttr('href', href),
      attr('aria-current', isCurrent ? 'page' : null),
      '>' + esc(labelOf(route)) + '</a>',
    ]);
  };

  const columns = ordered
    .map((group) => {
      const routesInGroup = byGroup.get(group) || [];
      if (routesInGroup.length === 0) return '';
      const titleId = 'mtfs-footer-' + esc(group);
      return join([
        '<div class="ftc mtfs-footer__col">',
        '<h2 class="mtfs-footer__title" id="' + titleId + '">',
        esc(GROUP_LABELS[group] || group),
        '</h2>',
        '<ul class="mtfs-footer__list" aria-labelledby="' + titleId + '">',
        routesInGroup.map((r) => '<li>' + link(r) + '</li>').join(''),
        '</ul>',
        '</div>',
      ]);
    })
    .join('');

  const logo = imageRef(site.logo, site.name ? String(site.name) : '');
  const phoneHref = telHref(site.telephone);
  const phone = telDisplay(site);
  const email = site.email ? String(site.email) : '';
  const blurb = site.footerBlurb
    ? String(site.footerBlurb)
    : site.description
      ? String(site.description)
      : '';
  const address = addressLine(site);

  const credit =
    site.credit && typeof site.credit === 'object' && site.credit.href && site.credit.label
      ? join([
          ' &middot; <a',
          urlAttr('href', site.credit.href),
          ' target="_blank" rel="noopener noreferrer nofollow">',
          esc(site.credit.label),
          '</a>',
        ])
      : '';

  const year =
    site.copyrightYear === undefined || site.copyrightYear === null || site.copyrightYear === ''
      ? ''
      : String(site.copyrightYear) + ' ';

  // "MedTech For Solutions Inc." already ends in a period — do not add a second one.
  const legalName = String(site.legalName || site.name || '');

  return join([
    '<footer class="mtfs-footer">',
    '<div class="ctr">',

    '<div class="ftg mtfs-footer__grid">',

    '<div class="ftb mtfs-footer__brand">',
    logo.url === ''
      ? ''
      : join([
          '<a class="mtfs-footer__logo" href="/"',
          attr('aria-label', (site.name ? String(site.name) + ' ' : '') + 'Home'),
          '><img',
          urlAttr('src', logo.url),
          attr('alt', logo.alt || site.name || ''),
          attr('width', logo.width || null),
          attr('height', logo.height || null),
          ' loading="lazy" decoding="async"></a>',
        ]),
    blurb === '' ? '' : '<p class="mtfs-footer__blurb">' + esc(blurb) + '</p>',
    '<p class="mtfs-footer__contact">',
    phoneHref === '' ? '' : '<a' + urlAttr('href', phoneHref) + '>' + esc(phone) + '</a>',
    phoneHref !== '' && email !== '' ? ' &middot; ' : '',
    email === '' ? '' : '<a' + urlAttr('href', 'mailto:' + email) + '>' + esc(email) + '</a>',
    address === '' ? '' : '<br>' + esc(address),
    '</p>',
    '</div>',

    columns,

    '</div>',

    '<div class="fbot mtfs-footer__bottom">',
    '<span>&copy; ' + year + esc(legalName) + (legalName.endsWith('.') ? ' ' : '. ') + 'All rights reserved.</span>',
    '<span>',
    bottomRoutes.map((r, i) => (i === 0 ? '' : ' &middot; ') + link(r)).join(''),
    credit,
    '</span>',
    '</div>',

    '</div>',
    '</footer>',
  ]);
}

/* ================================================================== *
 * renderBreadcrumbs
 * ================================================================== */

/**
 * The visible breadcrumb trail, generated from the same `breadcrumbTrail()` that feeds the
 * BreadcrumbList JSON-LD, so the markup and the structured data cannot diverge.
 *
 * The export ships a BreadcrumbList on 20 pages but a visible breadcrumb on exactly one
 * (`/sitemap/`), and 11 pages render `<div class="breadcrumb">Home / Lab Solutions / ...</div>`
 * with literal "/" text nodes that screen readers announce. Separators here are
 * CSS-generated (`.mtfs-breadcrumb__item + .mtfs-breadcrumb__item::before`).
 *
 * Returns '' for the home page (a one-item trail is a stub) and for non-indexable routes —
 * exactly the two cases where `routes.mjs::breadcrumbJsonLd` returns null.
 *
 * @param {object} currentRoute
 * @param {ReturnType<import('./routes.mjs').buildGraph>} graph
 * @returns {string}
 */
export function renderBreadcrumbs(currentRoute, graph) {
  if (!currentRoute || !graph) return '';
  if (currentRoute.inSitemapXml === false) return '';

  const trail = breadcrumbTrail(currentRoute, graph);
  if (trail.length < 2) return '';

  const last = trail.length - 1;
  const items = trail
    .map((r, i) => {
      const label = esc(labelOf(r));
      if (i === last) {
        return (
          '<li class="mtfs-breadcrumb__item">' +
          '<span class="mtfs-breadcrumb__current" aria-current="page">' +
          label +
          '</span></li>'
        );
      }
      return (
        '<li class="mtfs-breadcrumb__item"><a' +
        urlAttr('href', pathOf(r)) +
        '>' +
        label +
        '</a></li>'
      );
    })
    .join('');

  return (
    '<nav class="mtfs-breadcrumb" aria-label="Breadcrumb">' +
    '<ol class="mtfs-breadcrumb__list">' +
    items +
    '</ol></nav>'
  );
}

/* ================================================================== *
 * renderRelated
 * ================================================================== */

/**
 * The "Continue exploring" block.
 *
 * Targets come from `relatedRoutes()` — siblings, then children, then group peers, all in
 * manifest order — so the block is deterministic and never surfaces a non-indexable route.
 * Card titles come from `navLabel` and card descriptions from `summary`; nothing is
 * hand-written, so no card can ever read "Learn More".
 *
 * The markup mirrors the `.mtfs-related` block already in the export, so the stylesheet the
 * pages ship (`<style id="mtfs-visible-related-links">`, which css.mjs folds into the shared
 * hashed sheet) applies unchanged. The element is an `<aside>` rather than the export's
 * `<section>` because it is tangential to the page's own content.
 *
 * @param {object} currentRoute
 * @param {ReturnType<import('./routes.mjs').buildGraph>} graph
 * @returns {string}  '' when there is nothing to link
 */
export function renderRelated(currentRoute, graph) {
  if (!currentRoute || !graph) return '';

  const related = relatedRoutes(currentRoute, graph, 3);
  if (related.length === 0) return '';

  const headingId =
    'mtfs-related-' +
    String(currentRoute.id === undefined || currentRoute.id === null ? 'page' : currentRoute.id);
  const intro = currentRoute.summary ? String(currentRoute.summary) : '';

  const cards = related
    .map((r) =>
      join([
        '<li><a class="mtfs-related__link"',
        urlAttr('href', pathOf(r)),
        '>',
        '<span class="mtfs-related__title">' + esc(labelOf(r)) + '</span>',
        r.summary ? '<span class="mtfs-related__desc">' + esc(r.summary) + '</span>' : '',
        '<span class="mtfs-related__arrow" aria-hidden="true">&#8594;</span>',
        '</a></li>',
      ])
    )
    .join('');

  return join([
    '<aside class="mtfs-related" data-internal-link-module="related-pages"',
    ' aria-labelledby="' + esc(headingId) + '">',
    '<div class="mtfs-related__inner">',
    '<p class="mtfs-related__eyebrow">Continue exploring</p>',
    '<h2 id="' + esc(headingId) + '">Explore MedTech For Solutions</h2>',
    intro === '' ? '' : '<p class="mtfs-related__intro">' + esc(intro) + '</p>',
    '<ul class="mtfs-related__list">',
    cards,
    '</ul>',
    '</div>',
    '</aside>',
  ]);
}

/* ================================================================== *
 * renderHeadTags
 * ================================================================== */

/**
 * Copy a node without its '@context' — it is about to be nested inside a '@graph'.
 * @param {object} node
 * @returns {object}
 */
function graphNode(node) {
  const out = {};
  for (const key of Object.keys(node)) {
    if (key === '@context') continue;
    out[key] = node[key];
  }
  return out;
}

/**
 * The schema.org BreadcrumbList for a route, built from the same `breadcrumbTrail()` that
 * renders the visible `<nav aria-label="Breadcrumb">` above, so markup and structured data
 * are generated from one array.
 *
 * Mirrors `routes.mjs::breadcrumbJsonLd`: null for the home page (a one-item list is a
 * useless stub) and for non-indexable routes.
 *
 * @param {object} route
 * @param {object} graph
 * @param {object} site
 * @returns {object|null}
 */
function breadcrumbNode(route, graph, site) {
  if (!route || route.inSitemapXml === false) return null;
  const trail = breadcrumbTrail(route, graph);
  if (trail.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    '@id': canonicalUrl(route, site) + '#breadcrumb',
    itemListElement: trail.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: labelOf(r),
      item: canonicalUrl(r, site),
    })),
  };
}

/**
 * The per-page `<head>`.
 *
 * `<meta charset>` is unconditionally first — the export puts the synchronous GTM snippet
 * ahead of it, which is a spec violation (`hoist-charset` in html.mjs guarantees the same
 * property after the passes have run).
 *
 * Emitted for every route: charset, viewport, title, description, robots, canonical,
 * hreflang (en + x-default), preconnect, the two font preloads, the full Open Graph set
 * including og:image with its dimensions and alt, the full Twitter set, and the per-page
 * JSON-LD graph.
 *
 * That graph carries WebPage + BreadcrumbList, plus Service on the 13 `/services/**` routes.
 * It references — never re-inlines — the Organization node (`{origin}/#organization`) and
 * the WebSite node (`{origin}/#website`) that `artifacts.mjs::organizationJsonLd` builds
 * once and sync.mjs injects identically on every page. The export instead redefines a
 * three-property subset of the globally-identified Organization on all 13 Service pages,
 * which is what gives one @id four conflicting @type shapes across 18 pages.
 *
 * NOT emitted here: any stylesheet, any script, and any `<link rel=preload as=image>` —
 * `inline-critical-css` and `preload-lcp` own those, and `preload-lcp` must emit at most one
 * image preload per page (the home page currently ships two, neither of which is the
 * measured LCP element `h1#h1`, a text node in Sora).
 *
 * @param {object} route
 * @param {ReturnType<import('./routes.mjs').buildGraph>} graph
 * @param {object} cfg
 * @returns {string}
 */
export function renderHeadTags(route, graph, cfg) {
  const { site } = resolveCfg(cfg);
  const r = route || {};
  const canonical = canonicalUrl(r, site);
  const origin = String(site.origin || '').replace(/\/+$/, '');
  const indexable = r.inSitemapXml !== false;
  const path = pathOf(r);

  const title = r.title ? String(r.title) : site.name ? String(site.name) : '';
  const description = r.description
    ? String(r.description)
    : site.description
      ? String(site.description)
      : '';
  const og = imageRef(site.defaultOgImage, site.name ? String(site.name) : '');

  /* --- 1. charset FIRST, then one viewport spelling site-wide -------------- */
  const head = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
  ];

  /* --- 2. title + description --------------------------------------------- */
  head.push('<title>' + esc(title) + '</title>');
  head.push(metaName('description', description));

  /* --- 3. robots: one uniform value per tier ------------------------------- */
  head.push(
    metaName(
      'robots',
      indexable ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, follow'
    )
  );

  /* --- 4. canonical + hreflang (en + x-default, or none at all) ------------ */
  head.push('<link rel="canonical"' + urlAttr('href', canonical) + '>');
  if (indexable) {
    const lang = String(site.lang || 'en');
    head.push('<link rel="alternate"' + attr('hreflang', lang) + urlAttr('href', canonical) + '>');
    head.push('<link rel="alternate" hreflang="x-default"' + urlAttr('href', canonical) + '>');
  }

  /* --- 5. connection hints + the two font preloads ------------------------- */
  const preconnect = Array.isArray(site.preconnect) ? site.preconnect : PRECONNECT;
  for (const host of preconnect) {
    head.push('<link rel="preconnect"' + urlAttr('href', host) + ' crossorigin>');
    head.push('<link rel="dns-prefetch"' + urlAttr('href', host) + '>');
  }
  const fonts = Array.isArray(site.fontPreloads) ? site.fontPreloads : FONT_PRELOADS;
  for (const font of fonts) {
    if (!font || !font.href) continue;
    head.push(
      '<link rel="preload" as="font"' +
        urlAttr('href', font.href) +
        attr('type', font.type || 'font/woff2') +
        attr('fetchpriority', font.fetchpriority || null) +
        ' crossorigin>'
    );
  }

  /* --- 6. Open Graph ------------------------------------------------------- */
  // og:type is "website" on every page. None of the 21 routes is an article, and Open Graph
  // has no type for a service page; the 7 export pages that declare og:type all say website.
  head.push(metaProperty('og:type', 'website'));
  head.push(metaProperty('og:title', title));
  head.push(metaProperty('og:description', description));
  head.push(metaProperty('og:site_name', site.name));
  head.push(metaProperty('og:url', canonical));
  head.push(metaProperty('og:locale', site.locale || 'en_US'));
  if (og.url !== '') {
    head.push(metaProperty('og:image', og.url));
    head.push(metaProperty('og:image:width', og.width));
    head.push(metaProperty('og:image:height', og.height));
    head.push(metaProperty('og:image:alt', og.alt));
  }

  /* --- 7. Twitter: never summary_large_image without an image -------------- */
  head.push(metaName('twitter:card', og.url === '' ? 'summary' : 'summary_large_image'));
  head.push(metaName('twitter:title', title));
  head.push(metaName('twitter:description', description));
  if (og.url !== '') {
    head.push(metaName('twitter:image', og.url));
    head.push(metaName('twitter:image:alt', og.alt));
  }
  head.push(metaName('twitter:site', site.twitterSite));

  /* --- 8. geo.* only on the page that carries the address ------------------ */
  if (path === GEO_META_PATH && site.address) {
    const a = site.address;
    if (a.addressCountry && a.addressRegion) {
      head.push(metaName('geo.region', String(a.addressCountry) + '-' + String(a.addressRegion)));
    }
    head.push(metaName('geo.placename', a.addressLocality));
  }

  /* --- 9. per-page JSON-LD graph ------------------------------------------- */
  const nodes = [];
  const breadcrumb = breadcrumbNode(r, graph, site);

  if (indexable) {
    const webPage = {
      '@type': 'WebPage',
      '@id': canonical + '#webpage',
      url: canonical,
      name: title,
      inLanguage: bcp47(site),
      isPartOf: { '@id': origin + '/#website' },
    };
    if (description !== '') webPage.description = description;
    if (breadcrumb) webPage.breadcrumb = { '@id': breadcrumb['@id'] };
    nodes.push(webPage);
  }

  if (breadcrumb) nodes.push(breadcrumb);

  if (indexable && path.startsWith(SERVICE_PREFIX)) {
    const service = {
      '@type': 'Service',
      '@id': canonical + '#service',
      name: labelOf(r),
      url: canonical,
      provider: { '@id': origin + '/#organization' },
      areaServed: site.areaServed || DEFAULT_AREA_SERVED,
    };
    if (r.serviceType) service.serviceType = String(r.serviceType);
    if (description !== '') service.description = description;

    const kids = childrenOf(graph, r).filter((c) => c && c.inSitemapXml !== false);
    if (kids.length > 0) {
      service.hasOfferCatalog = {
        '@type': 'OfferCatalog',
        name: labelOf(r),
        itemListElement: kids.map((c) => ({
          '@type': 'Offer',
          itemOffered: { '@id': canonicalUrl(c, site) + '#service' },
        })),
      };
    }
    nodes.push(service);
  }

  if (nodes.length > 0) {
    head.push(
      '<script type="application/ld+json">' +
        jsonLd({ '@context': 'https://schema.org', '@graph': nodes.map(graphNode) }) +
        '</script>'
    );
  }

  return join(head);
}
