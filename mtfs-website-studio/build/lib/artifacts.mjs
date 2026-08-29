/**
 * =============================================================================
 * build/lib/artifacts.mjs — THE DERIVED-ARTIFACT GENERATORS
 * =============================================================================
 *
 * THE ONE IDEA IN THIS FILE: every file it emits used to be maintained BY HAND,
 * and every one of them had already drifted away from the pages it describes.
 * After this module, `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`,
 * `_headers` and `_redirects` are pure functions of `site.config.mjs` (plus, for
 * llms-full.txt, the Markdown mirror of the pages the build itself just wrote).
 * Nobody edits them. Nobody CAN edit them — `build/sync.mjs` overwrites all six
 * on every run. Drift stops being a thing that has to be policed and becomes a
 * thing that cannot be expressed.
 *
 * That is not a stylistic preference. It is the direct remedy for defects that
 * were MEASURED in the audited export:
 *
 *   _redirects   8 of 22 rules (/who-we-are, /gpo, /gpo-registration,
 *                /recruitment and their trailing-slash twins) pointed at
 *                slash-LESS targets while /practice, /temp-staff,
 *                /laboratory-solutions and /policy pointed at the canonical
 *                trailing-slash form. /gpo and /practice — five lines apart,
 *                into the same subtree — disagreed with each other. Every
 *                canonical route ends in '/', so those eight rules resolved as
 *                301 -> 301 on the highest-value legacy paths. Here, every
 *                `to` comes out of `redirects[]`, and validate.mjs asserts that
 *                each one is an existing route path ending in '/' (or a
 *                '/#fragment' whose id exists on the target page).
 *
 *   _headers     '/*.html' matched NONE of the 20 pretty-URL documents — the
 *                site serves /about/, not /about.html — so 19 of 21 documents
 *                matched no rule at all, and five UNHASHED asset filenames were
 *                served `immutable` for a year. Here the rules come out of
 *                `headerRules[]`, where the catch-all is '/*' and `immutable`
 *                is scoped to /assets/*, which sync.mjs guarantees is entirely
 *                content-hashed.
 *
 *   sitemap.xml  All 20 <loc> entries shared one hard-coded
 *                <lastmod>2026-08-21</lastmod>, and changefreq/priority were
 *                hand-maintained per URL. Here the URL set, the order,
 *                changefreq and priority all come from `routes[]`, and lastmod
 *                is an explicit PARAMETER — this module never reads the clock,
 *                so two runs over the same inputs produce byte-identical
 *                output.
 *
 *   robots.txt   Carried `Allow: /_next/static/` and `Allow: /_next/image/` —
 *                Next.js internals that cannot exist in a static Website Studio
 *                export — plus `Disallow: /api/` and `Disallow: /admin/` for
 *                paths that are not in the build. Those four lines are gone.
 *                The six named AI-crawler groups are KEPT verbatim, because
 *                robots.txt group matching is most-specific-wins rather than
 *                additive and they were the export's deliberate policy.
 *
 *   llms.txt /   The three crawler-facing indexes agreed on the same 20 URLs in
 *   llms-full    the same order only by coincidence; nothing enforced it. Here
 *                all three read the same `inSitemapXml` / `inLlms` flags off the
 *                same array, so agreement is structural. llms.txt additionally
 *                gains the per-link `summary` the convention supports and the
 *                export omitted.
 *
 * -----------------------------------------------------------------------------
 * WHAT llms.txt AND llms-full.txt ACTUALLY DO — read this before citing them
 * -----------------------------------------------------------------------------
 * Google Search IGNORES both files. They have no effect on crawling, indexing,
 * ranking, or inclusion in AI Overviews. No AEO/GEO/"AI-optimisation" mechanism
 * exists for Google Search, and this repo must never claim one. These two files
 * exist for THIRD-PARTY AI crawlers that have chosen to look for them —
 * ClaudeBot, GPTBot, ChatGPT-User, PerplexityBot and similar — and for humans
 * and tools that want a clean text mirror of the site. The header text emitted
 * by `llmsTxt()` and `llmsFullTxt()` says exactly that, on the file itself, so
 * the claim cannot be quietly upgraded later by someone reading only the
 * artifact. The levers that actually move Google are the ordinary ones: correct
 * semantic HTML, a crawlable server-rendered navigation, clean structured data,
 * fast pages and genuinely useful content.
 *
 * -----------------------------------------------------------------------------
 * CONTRACT
 * -----------------------------------------------------------------------------
 *   sitemapXml(routes, graph, cfg, lastmod)
 *   robotsTxt(cfg)
 *   llmsTxt(routes, graph, cfg)
 *   llmsFullTxt(routes, graph, cfg, pageMarkdown)
 *   headersFile(cfg)
 *   redirectsFile(cfg)
 *   organizationJsonLd(cfg)
 *   htmlToMarkdown(html)
 *
 * ESM, Node >= 18, ZERO npm dependencies — and this module imports nothing at
 * all, not even a node: builtin. It is pure string in, string out, which is why
 * it is trivially testable and why `build/sync.mjs` can call it in any order.
 *
 * `cfg` is tolerant on purpose, matching render.mjs::resolveCfg: pass the `site`
 * object directly, or pass `{ site, headerRules, redirects, aiCrawlers }`. The
 * artifact generators that need `headerRules` / `redirects` look for them on the
 * wrapper first, then on `site`, then fall back to an empty list — so a caller
 * that forgets to pass them gets an empty file rather than a crash with a
 * half-written artifact on disk.
 *
 * DETERMINISM RULES OBSERVED THROUGHOUT
 *   1. No `Date`, no `Math.random`, no filesystem access, no network. Same
 *      inputs -> same bytes. `lastmod` is a parameter for exactly this reason.
 *   2. Iteration order is `routes[]` order, never object-key order.
 *   3. Nothing is silently dropped. `llmsFullTxt` THROWS when a route flagged
 *      `inLlms` has no Markdown, because a partial mirror is worse than no
 *      mirror: a crawler reads its silence as absence. (That is not
 *      hypothetical — the export's llms-full.txt silently deleted every numeric
 *      stat tile, all six /about/ timeline years and every testimonial
 *      attribution, and nothing failed.)
 */

/* eslint-disable max-len */

/* ================================================================== *
 * SECTION 0 — tiny shared helpers
 * ================================================================== */

/**
 * Accept `site`, or a `{ site, … }` wrapper, and always hand back a usable
 * bundle. Mirrors render.mjs::resolveCfg so the two modules can be called with
 * the identical argument from sync.mjs.
 *
 * @param {object} cfg
 * @returns {{site: object, headerRules: object[], redirects: object[], aiCrawlers: string[]}}
 */
function resolveCfg(cfg) {
  const c = cfg && typeof cfg === 'object' ? cfg : {};
  const site = c.site && typeof c.site === 'object' ? c.site : c;
  const pick = (key, fallback) => {
    if (Array.isArray(c[key])) return c[key];
    if (site && Array.isArray(site[key])) return site[key];
    return fallback;
  };
  return {
    site: site && typeof site === 'object' ? site : {},
    headerRules: pick('headerRules', []),
    redirects: pick('redirects', []),
    aiCrawlers: pick('aiCrawlers', DEFAULT_AI_CRAWLERS),
  };
}

/** Origin with any trailing slashes removed. `''` when unset. */
function originOf(site) {
  return String((site && site.origin) || '').trim().replace(/\/+$/, '');
}

/** Root-relative path of a route object or a bare string. Always starts with '/'. */
function pathOf(route) {
  if (typeof route === 'string') return route.startsWith('/') ? route : '/' + route;
  const p = route && typeof route.path === 'string' ? route.path : '/';
  return p.startsWith('/') ? p : '/' + p;
}

/** origin + route path. The canonical URL for every artifact this module writes. */
function absUrl(site, route) {
  return originOf(site) + pathOf(route);
}

/**
 * BCP-47 language tag. `locale` ('en_US') wins over `lang` ('en') because
 * schema.org's inLanguage prefers the fuller tag; underscores become hyphens.
 */
function bcp47(site) {
  const locale = String((site && site.locale) || '');
  if (locale !== '') return locale.replace(/_/g, '-');
  return String((site && site.lang) || 'en');
}

/**
 * XML text/attribute escaping for sitemap.xml. All five predefined entities are
 * escaped — `>` and `'` are not strictly required in text content, but escaping
 * every one of them means the same function is safe in an attribute too, and a
 * route path that ever gains a `&` (a query string, say) can never break the
 * document.
 */
function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Drop `undefined`/`null`/`''` entries and join the rest with newlines. */
function lines(parts) {
  return parts.filter((p) => typeof p === 'string' && p !== '').join('\n');
}

/**
 * The named AI/LLM crawler groups the export declared explicitly, in the
 * export's own order. Kept because robots.txt group matching is
 * most-specific-wins, NOT additive: a named group inherits nothing from `*`, so
 * these six groups are the whole policy for those agents. The `*` group this
 * module emits carries no Disallow, so there is nothing to repeat inside them —
 * if a Disallow is ever added to `*`, it MUST be copied into each of these
 * groups or they will silently bypass it.
 *
 * Google-Extended is included as the export had it. Note for whoever revisits
 * this: Google-Extended governs Gemini/Vertex AI grounding ONLY. It has no
 * effect on Google Search ranking or on AI Overview sourcing, so allowing or
 * disallowing it is a licensing decision, not an SEO one.
 */
const DEFAULT_AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
];

/**
 * `group` -> section heading, for llms.txt. `routes[]` keeps same-group routes
 * contiguous, so walking the array once and starting a new heading whenever
 * `group` changes emits each section exactly once, in site order.
 * An unknown group falls back to a title-cased version of its own id, so adding
 * a group to site.config.mjs degrades to something readable rather than
 * throwing.
 */
const GROUP_HEADINGS = {
  main: 'Main',
  'lab-solutions': 'Lab Solutions',
  'management-services': 'Management Services',
  legal: 'Policies',
  system: 'Site',
};

function groupHeading(group) {
  const key = String(group || '').trim();
  if (key === '') return 'Pages';
  if (Object.prototype.hasOwnProperty.call(GROUP_HEADINGS, key)) return GROUP_HEADINGS[key];
  return key
    .split(/[-_\s]+/)
    .map((w) => (w === '' ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

/* ================================================================== *
 * SECTION 1 — sitemap.xml
 * ================================================================== */

/**
 * Build sitemap.xml from `routes[]`.
 *
 * WHAT CHANGED FROM THE EXPORT
 *  - The URL set is `routes.filter(r => r.inSitemapXml)`, so /404/ is excluded
 *    structurally rather than by remembering to leave it out. llms.txt and
 *    llms-full.txt read `inLlms` off the same array, which is what makes the
 *    three artifacts agree by construction instead of by coincidence.
 *  - `<lastmod>` is a PARAMETER. The export shipped one hard-coded date on all
 *    20 URLs, which is a sitemap that carries no freshness signal at all. This
 *    module must never call `Date` — a build that stamps "now" produces a
 *    different sitemap on every run, which makes the output untestable and tells
 *    crawlers every page changed whenever anyone rebuilt. sync.mjs decides:
 *    source-file mtime per route is the honest choice, a release date is an
 *    acceptable one.
 *  - `<changefreq>`/`<priority>` come from `routes[]`. Google has ignored both
 *    since 2023; they are emitted because the export published them and removing
 *    a published signal has no upside, but they are never hand-maintained again.
 *
 * @param {object[]} routes            Ordered route manifest. When null/omitted,
 *                                     the routes are taken from `graph.byId`.
 * @param {ReturnType<import('./routes.mjs').buildGraph>} graph
 * @param {object} cfg                 `site`, or `{ site }`.
 * @param {string|Map<string,string>|Object<string,string>|null} lastmod
 *        One ISO date applied to every URL, OR a per-route lookup keyed by route
 *        id (falling back to route path). Anything falsy omits `<lastmod>`
 *        entirely, which is valid — a missing lastmod is honest, a wrong one is
 *        not.
 * @returns {string} Complete XML document, newline-terminated.
 */
export function sitemapXml(routes, graph, cfg, lastmod) {
  const { site } = resolveCfg(cfg);
  const list = Array.isArray(routes) && routes.length > 0
    ? routes
    : graph && graph.byId
      ? Array.from(graph.byId.values())
      : [];

  /** Resolve the lastmod for one route without ever reading the clock. */
  const lastmodFor = (route) => {
    if (!lastmod) return '';
    if (typeof lastmod === 'string') return lastmod;
    if (lastmod instanceof Map) {
      return String(lastmod.get(route.id) || lastmod.get(pathOf(route)) || '');
    }
    if (typeof lastmod === 'object') {
      const byId = lastmod[route.id];
      const byPath = lastmod[pathOf(route)];
      return String(byId || byPath || '');
    }
    return '';
  };

  const seen = new Set();
  const urls = [];

  for (const route of list) {
    if (!route || route.inSitemapXml !== true) continue;

    const loc = absUrl(site, route);
    // A duplicate <loc> is a manifest bug, not something to reproduce; the
    // first occurrence wins so output stays in routes[] order.
    if (seen.has(loc)) continue;
    seen.add(loc);

    const mod = lastmodFor(route);
    urls.push(
      lines([
        '  <url>',
        '    <loc>' + xmlEscape(loc) + '</loc>',
        mod !== '' ? '    <lastmod>' + xmlEscape(mod) + '</lastmod>' : '',
        route.changefreq ? '    <changefreq>' + xmlEscape(route.changefreq) + '</changefreq>' : '',
        route.priority !== undefined && route.priority !== null
          ? '    <priority>' + xmlEscape(formatPriority(route.priority)) + '</priority>'
          : '',
        '  </url>',
      ])
    );
  }

  return (
    lines([
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!-- Generated by build/lib/artifacts.mjs from site.config.mjs. Do not edit by hand. -->',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ]) + '\n'
  );
}

/**
 * `<priority>` wants one decimal place: 1 -> "1.0", 0.7 -> "0.7". Doing this by
 * hand rather than with toFixed on a possibly-string input keeps a config value
 * of `'0.7'` and one of `0.7` producing identical bytes.
 */
function formatPriority(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toFixed(1);
}

/* ================================================================== *
 * SECTION 2 — robots.txt
 * ================================================================== */

/**
 * Build robots.txt.
 *
 * KEPT FROM THE EXPORT
 *  - `User-agent: *` / `Allow: /`.
 *  - All six explicit AI-crawler groups, in the export's order. These are a
 *    deliberate policy decision by the operator and this refactor does not get
 *    to reverse it.
 *  - The `Sitemap:` directive.
 *
 * REMOVED (all four were measured to be meaningless on this site)
 *  - `Allow: /_next/static/` and `Allow: /_next/image/` — Next.js internals.
 *    This is a static Website Studio export; those paths cannot exist.
 *  - `Disallow: /api/` and `Disallow: /admin/` — neither path is in the build.
 *
 * !! IF A `Disallow` IS EVER ADDED to the `*` group, it must be repeated inside
 * every named crawler group below. robots.txt group matching is
 * MOST-SPECIFIC-WINS, not additive: a crawler that matches its own named group
 * ignores `*` completely. That is precisely why the export's six groups
 * bypassed its `Disallow: /api/` and `Disallow: /admin/` rules entirely.
 *
 * The header comment states plainly what llms.txt is and is not. Google Search
 * ignores it; it is advertised here only so third-party AI crawlers that look
 * for it can find it.
 *
 * @param {object} cfg `site`, or `{ site, aiCrawlers }`.
 * @returns {string} Complete robots.txt, newline-terminated.
 */
export function robotsTxt(cfg) {
  const { site, aiCrawlers } = resolveCfg(cfg);
  const origin = originOf(site);

  const crawlerGroups = [];
  for (const agent of aiCrawlers) {
    const name = String(agent || '').trim();
    if (name === '') continue;
    crawlerGroups.push('', 'User-agent: ' + name, 'Allow: /');
  }

  return (
    lines([
      '# =============================================================================',
      '# robots.txt — ' + (origin.replace(/^https?:\/\//, '') || 'site'),
      '# Generated by build/lib/artifacts.mjs from site.config.mjs. Do not edit by hand.',
      '# =============================================================================',
      '',
      '# Everything is crawlable. No Disallow rules are declared, so the named',
      '# groups below inherit nothing they would otherwise be missing.',
      '# !! robots.txt groups are MOST-SPECIFIC-WINS, not additive. If a Disallow is',
      '# !! ever added here, copy it into every named group below or those crawlers',
      '# !! will bypass it.',
      'User-agent: *',
      'Allow: /',
      '',
      '# ---------------------------------------------------------------------------',
      '# AI / LLM crawlers — explicit allow, carried over from the previous robots.txt',
      '# ---------------------------------------------------------------------------',
      '# Google-Extended governs Gemini / Vertex AI grounding ONLY. It has no effect on',
      '# Google Search ranking or on AI Overview sourcing, so allowing it is a content-',
      '# licensing decision, not an SEO one.',
      ...crawlerGroups,
      '',
      origin !== '' ? 'Sitemap: ' + origin + '/sitemap.xml' : '',
      '',
      '# ---------------------------------------------------------------------------',
      '# Machine-readable text mirrors, for third-party AI crawlers only:',
      '#   ' + (origin !== '' ? origin + '/llms.txt' : '/llms.txt') + '        page index with per-page summaries',
      '#   ' + (origin !== '' ? origin + '/llms-full.txt' : '/llms-full.txt') + '   full Markdown corpus',
      '# Google Search ignores both files. They affect no crawling, indexing, ranking',
      '# or AI Overview decision. They are published for crawlers that look for them.',
      '# ---------------------------------------------------------------------------',
    ]) + '\n'
  );
}

/* ================================================================== *
 * SECTION 3 — llms.txt
 * ================================================================== */

/**
 * Build llms.txt: the concise, link-per-page index.
 *
 * Format follows the llms.txt convention — an H1 for the site, a short summary,
 * then `## Section` headings each holding `- [Title](url): summary` lines. The
 * export emitted bare `- [Title](url)` even though every route already carries a
 * `summary`; the convention supports the trailing summary and a crawler that
 * only ever reads llms.txt gets far more from it, so it is emitted here.
 *
 * Section headings come from `group`, walked in `routes[]` order. Because
 * same-group routes are contiguous in the manifest, each heading is emitted
 * exactly once with no grouping pass and no sort — which also means llms.txt,
 * llms-full.txt and sitemap.xml present the pages in the same order.
 *
 * The link text is `navLabel`, the same field the nav, the footer, the
 * breadcrumbs and the related-links block use. One field, five consumers: an
 * llms.txt entry can never disagree with the on-page link to the same route the
 * way the export's "Staff" breadcrumb disagreed with its "Our Team" title.
 *
 * @param {object[]} routes
 * @param {ReturnType<import('./routes.mjs').buildGraph>} graph
 * @param {object} cfg `site`, or `{ site }`.
 * @returns {string} Complete llms.txt, newline-terminated.
 */
export function llmsTxt(routes, graph, cfg) {
  const { site } = resolveCfg(cfg);
  const list = Array.isArray(routes) ? routes : [];

  const home = list.find((r) => r && pathOf(r) === '/');
  const summary = String((home && home.summary) || site.description || '').trim();

  const body = [];
  let currentGroup = null;

  for (const route of list) {
    if (!route || route.inLlms !== true) continue;

    if (route.group !== currentGroup) {
      currentGroup = route.group;
      body.push('', '## ' + groupHeading(currentGroup), '');
    }

    const label = String(route.navLabel || route.title || route.id || '').trim();
    const url = absUrl(site, route);
    const note = String(route.summary || '').trim();
    body.push('- [' + label + '](' + url + ')' + (note !== '' ? ': ' + note : ''));
  }

  return (
    lines([
      '# ' + String(site.name || 'Site'),
      summary !== '' ? 'Summary: ' + summary : '',
      '',
      '> Generated by build/lib/artifacts.mjs from site.config.mjs. Do not edit by hand.',
      '> This file is published for third-party AI crawlers (ClaudeBot, GPTBot,',
      '> ChatGPT-User, PerplexityBot and similar) and for anyone who wants a plain-text',
      '> index of the site. GOOGLE SEARCH IGNORES IT: it has no effect on crawling,',
      '> indexing, ranking, or AI Overview inclusion. The full-text mirror lives at',
      '> ' + (originOf(site) !== '' ? originOf(site) + '/llms-full.txt' : '/llms-full.txt') + '.',
      ...body,
    ]) + '\n'
  );
}

/* ================================================================== *
 * SECTION 4 — llms-full.txt
 * ================================================================== */

/**
 * Build llms-full.txt: the full Markdown corpus, one section per indexed route.
 *
 * `pageMarkdown` is produced by `htmlToMarkdown()` (below) over the FINAL,
 * post-transform HTML of each page — so what a crawler reads here is what a
 * browser renders, not a second hand-maintained copy of the copy.
 *
 * WHY THIS FUNCTION THROWS
 * The export's llms-full.txt was not a mirror, it was a lossy summary that
 * nothing checked. Measured: all six /services/management-services/marketing/
 * headline numbers (+185%, 3.2x, 42%, $12, 3x, 40%) appeared ZERO times; the GPO
 * page's "$0 / 300+ / 1800+ / 10%-50%" dashboard collapsed to the two words
 * "Member benefits"; all six /about/ timeline years vanished; the home-page
 * testimonial attributions were dropped (while the same quotes on /our-team/
 * kept theirs); and not one internal link survived as a link. A crawler cannot
 * tell a deliberate omission from a silent one — it reads absence as fact. So a
 * missing or empty page is a BUILD FAILURE here, not a shrug: either the mirror
 * is complete or the file is not written at all.
 *
 * Heading levels are shifted down by two so a page's `<h1>` renders as `###`
 * under this file's `##` page heading and `#` document title. `htmlToMarkdown`
 * itself stays faithful (h1 -> `#`); the shift belongs to the assembler, which
 * is the only place that knows what it is nesting the page inside.
 *
 * @param {object[]} routes
 * @param {ReturnType<import('./routes.mjs').buildGraph>} graph
 * @param {object} cfg `site`, or `{ site }`.
 * @param {Map<string,string>|Object<string,string>} pageMarkdown Route id -> Markdown.
 * @returns {string} Complete llms-full.txt, newline-terminated.
 * @throws {Error} when a route flagged `inLlms` has no non-empty Markdown.
 */
export function llmsFullTxt(routes, graph, cfg, pageMarkdown) {
  const { site } = resolveCfg(cfg);
  const list = Array.isArray(routes) ? routes : [];

  const get = (id) => {
    if (!pageMarkdown) return '';
    if (pageMarkdown instanceof Map) return String(pageMarkdown.get(id) || '');
    if (typeof pageMarkdown === 'object') return String(pageMarkdown[id] || '');
    return '';
  };

  const missing = [];
  const sections = [];

  for (const route of list) {
    if (!route || route.inLlms !== true) continue;

    const md = get(route.id).trim();
    if (md === '') {
      missing.push(route.id + ' (' + pathOf(route) + ')');
      continue;
    }

    sections.push(
      '',
      '## ' + String(route.navLabel || route.title || route.id),
      '',
      'Source: ' + absUrl(site, route),
      '',
      shiftHeadings(md, 2)
    );
  }

  if (missing.length > 0) {
    throw new Error(
      'llmsFullTxt: no Markdown for ' +
        missing.length +
        ' route(s) flagged inLlms: ' +
        missing.join(', ') +
        '. A partial mirror is worse than none — a crawler reads its silence as absence. ' +
        'Either supply the Markdown (htmlToMarkdown over the built page) or clear inLlms.'
    );
  }

  return (
    lines([
      '# ' + String(site.name || 'Site') + ' — Full Site Content',
      '',
      '> Generated by build/lib/artifacts.mjs from the built pages. Do not edit by hand.',
      '> Full-text Markdown mirror of every indexed page. The canonical site is',
      '> ' + (originOf(site) !== '' ? originOf(site) + '/' : '/') + ' and each section below names its own source URL.',
      '> Published for third-party AI crawlers (ClaudeBot, GPTBot, ChatGPT-User,',
      '> PerplexityBot and similar). GOOGLE SEARCH IGNORES THIS FILE: it has no effect',
      '> on crawling, indexing, ranking, or AI Overview inclusion. The concise page',
      '> index lives at ' + (originOf(site) !== '' ? originOf(site) + '/llms.txt' : '/llms.txt') + '.',
      ...sections,
    ]) + '\n'
  );
}

/**
 * Push every ATX heading down `by` levels, capped at h6. Operates only on lines
 * that already start with `#` + space, so a `#` inside prose or inside a fenced
 * code block's content is untouched.
 */
function shiftHeadings(md, by) {
  return md.replace(/^(#{1,6})(?= )/gm, (hashes) => '#'.repeat(Math.min(6, hashes.length + by)));
}

/* ================================================================== *
 * SECTION 5 — _headers
 * ================================================================== */

/**
 * Build the Netlify-style `_headers` file from `headerRules[]`.
 *
 * Format: a path pattern on its own line, then two-space-indented
 * `Name: value` lines, then a blank line. Rules are emitted in array order,
 * which matters — `headerRules[]` puts the `/*` catch-all LAST, and on a
 * Netlify-style host every matching rule applies with the more specific path
 * winning per header name. The `/assets/*` `immutable` rule therefore overrides
 * the catch-all's `must-revalidate` for assets, and every pretty URL
 * (/about/, /services/lab-solutions/, …) is covered by `/*`.
 *
 * That is the fix for the measured defect: the export declared `/*.html`, which
 * matched NONE of the 20 pretty-URL documents, so 19 of 21 fell through to
 * browser heuristic caching.
 *
 * !! INVARIANT THIS FILE RIDES ON: `immutable` is only safe because everything
 * the build writes under /assets/ is content-hashed (site.<hash>.css,
 * nav.<hash>.js, analytics.<hash>.js, consult-modal.<hash>.js,
 * search-index.<hash>.json, /assets/img/*). sync.mjs must ASSERT that, not
 * assume it: one unhashed file under /assets/ pins a stale copy in every
 * visitor's browser for a year. The export did exactly that to five files.
 *
 * !! NOT COVERED BY THIS FILE, AND IT CANNOT BE: media.cdn.builder.searchatlas.com
 * hosts the four woff2 faces and every image. `_headers` governs our origin
 * only, so those assets sit outside this cache policy. Accepted risk, recorded
 * here rather than papered over. Self-hosting them under /assets/fonts/ would
 * bring them under the /assets/* rule — a follow-up, since it changes asset URLs.
 *
 * No `Content-Encoding` is set. compress.mjs pre-writes .gz/.br beside each
 * text file and Netlify-style hosts negotiate those automatically; declaring an
 * encoding by hand would mislabel the identity response for clients that send
 * no Accept-Encoding.
 *
 * @param {object} cfg `{ site, headerRules }`, or an object carrying `headerRules`.
 * @returns {string} Complete _headers file, newline-terminated.
 */
export function headersFile(cfg) {
  const { headerRules } = resolveCfg(cfg);

  const blocks = [];
  for (const rule of headerRules) {
    if (!rule || typeof rule.pattern !== 'string' || rule.pattern === '') continue;
    const headers = rule.headers && typeof rule.headers === 'object' ? rule.headers : {};
    const names = Object.keys(headers);
    if (names.length === 0) continue;

    const block = [rule.pattern];
    for (const name of names) {
      const value = headers[name];
      if (value === undefined || value === null || value === '') continue;
      // Header values are single-line by definition; fold any stray newline so a
      // multi-line config value cannot forge a second header.
      block.push('  ' + name + ': ' + String(value).replace(/[\r\n]+/g, ' ').trim());
    }
    if (block.length > 1) blocks.push(block.join('\n'));
  }

  return (
    lines([
      '# =============================================================================',
      '# _headers — generated by build/lib/artifacts.mjs from site.config.mjs.',
      '# Do not edit by hand: sync.mjs overwrites this file on every build.',
      '#',
      '# Rules apply in order; the more specific path wins per header name, so the',
      "# '/*' catch-all at the foot covers all 20 pretty-URL documents (/about/, not",
      "# /about.html) while /assets/* keeps its immutable caching.",
      '#',
      '# immutable is safe ONLY because every file the build writes under /assets/ is',
      '# content-hashed. sync.mjs asserts that invariant.',
      '#',
      '# Not governed here: media.cdn.builder.searchatlas.com (the four woff2 faces and',
      '# every image). _headers covers this origin only — accepted, documented risk.',
      '# =============================================================================',
      '',
      ...blocks.flatMap((b) => [b, '']),
    ]).replace(/\n{3,}/g, '\n\n') + '\n'
  );
}

/* ================================================================== *
 * SECTION 6 — _redirects
 * ================================================================== */

/**
 * Build the Netlify-style `_redirects` file from `redirects[]`.
 *
 * Format: `from  to  status`, one rule per line, columns aligned for
 * readability. Query strings are preserved by the host automatically.
 *
 * THE DRIFT THIS ENDS. The export hand-maintained 22 rules and 8 of them
 * (/who-we-are, /gpo, /gpo-registration, /recruitment and their trailing-slash
 * twins) pointed at slash-LESS targets while /practice, /temp-staff,
 * /laboratory-solutions and /policy pointed at the canonical trailing-slash
 * form — /gpo and /practice disagreeing five lines apart, into the same
 * subtree. Every canonical route on this site ends in '/', so a slash-less
 * target is a 301 to a 301 (or a 301 to a 404 on a host that does not
 * normalise), on the highest-value legacy inbound paths there are.
 *
 * Now every `to` is whatever `site.config.mjs::redirects[]` says, and
 * validate.mjs asserts that each one is an existing route path ending in '/',
 * or a '/#fragment' whose id exists on the target page (/#testimonials is the
 * one such rule, and that id does exist on the home page). This module emits
 * faithfully and does NOT silently "fix" a target: a rewrite here would hide the
 * manifest bug that validate.mjs is there to surface.
 *
 * Status codes are emitted verbatim too, including the deliberate
 * `/untitled -> /404/ 404`. The export made that a 301 to /404/, a page that
 * returns HTTP 200 — a soft 404 that tells Google the URL permanently moved to
 * a valid page. Status 404 serves the branded error body with a real 404.
 *
 * @param {object} cfg `{ site, redirects }`, or an object carrying `redirects`.
 * @returns {string} Complete _redirects file, newline-terminated.
 */
export function redirectsFile(cfg) {
  const { redirects } = resolveCfg(cfg);

  const rows = [];
  for (const rule of redirects) {
    if (!rule || typeof rule.from !== 'string' || typeof rule.to !== 'string') continue;
    if (rule.from === '' || rule.to === '') continue;
    rows.push({
      from: rule.from,
      to: rule.to,
      status: String(rule.status === undefined || rule.status === null ? 301 : rule.status),
    });
  }

  const fromWidth = rows.reduce((w, r) => Math.max(w, r.from.length), 0);
  const toWidth = rows.reduce((w, r) => Math.max(w, r.to.length), 0);

  const body = rows.map(
    (r) => r.from.padEnd(fromWidth + 2, ' ') + r.to.padEnd(toWidth + 2, ' ') + r.status
  );

  return (
    lines([
      '# =============================================================================',
      '# _redirects — generated by build/lib/artifacts.mjs from site.config.mjs.',
      '# Do not edit by hand: sync.mjs overwrites this file on every build.',
      '#',
      '# Both the bare and the trailing-slash form of every legacy source path are',
      '# listed, so the rules still work on a host that does not normalise.',
      '# Every target is a canonical route path ending in "/" (or a "/#fragment"),',
      '# which validate.mjs asserts — a slash-less target costs a second 301 hop.',
      '# Query strings are preserved by the host.',
      '# =============================================================================',
      '',
      ...body,
    ]) + '\n'
  );
}

/* ================================================================== *
 * SECTION 7 — Organization + WebSite JSON-LD
 * ================================================================== */

/**
 * Build the site-wide entity graph: the Organization/ProfessionalService node
 * and the WebSite node, as ONE `@graph` object that sync.mjs injects byte-
 * identically into every page.
 *
 * WHY BOTH NODES LIVE HERE. render.mjs::renderHeadTags emits the per-page
 * WebPage / BreadcrumbList / Service nodes and REFERENCES these two by @id
 * (`{origin}/#organization`, `{origin}/#website`). One definition, many
 * references, is the whole point of @id — and it is exactly what the export got
 * wrong: `#organization` was declared on 18 pages with FOUR different @type
 * shapes (["Organization","ProfessionalService"], ["Organization",
 * "LocalBusiness"], "LocalBusiness", and bare "Organization" with a
 * three-property subset on all 13 Service pages). One identifier cannot be four
 * different things. Here it is declared once.
 *
 * WHAT THE NODE GAINS over the export's:
 *  - `logo` and `image` (absent everywhere before).
 *  - The full contact set — faxNumber, geo, openingHoursSpecification — which
 *    previously existed only on /contact/'s separate LocalBusiness node.
 *  - A real WebSite node. Before, all 8 WebPage nodes set
 *    `isPartOf: {"@id": "…#organization"}` — a WebPage is part of a WebSite or
 *    CreativeWork, never an Organization, so every one of those edges was
 *    mistyped AND dangling.
 *
 * WHAT IT DELIBERATELY OMITS:
 *  - `sameAs`, whenever `site.sameAs` is empty. The SEO audit calls sameAs the
 *    single most important entity-reconciliation property, and it is absent from
 *    all 21 export pages — but the ONLY external social link in the whole export
 *    is the web designer's personal LinkedIn profile, repeated in 21 footers.
 *    That is not the brand's social signal and publishing it as one would be
 *    fabricating a third-party reference. An empty `sameAs: []` in JSON-LD is a
 *    positive claim of "no profiles", which is false, so the property is dropped
 *    entirely rather than emitted empty. Client to supply verified URLs.
 *  - `SearchAction` / potentialAction on WebSite. The site search is a
 *    client-side overlay; there is no `?q=` URL a search engine could call. A
 *    SearchAction pointing at a URL that does not resolve is a lie in structured
 *    data.
 *  - `AggregateRating` / `Review`. Self-serving review markup for the hosting
 *    entity is disallowed by Google and ineligible for rich results. The
 *    testimonials stay semantic HTML (blockquote + cite).
 *
 * @param {object} cfg `site`, or `{ site }`.
 * @returns {object} `{'@context', '@graph': [Organization, WebSite]}`
 */
export function organizationJsonLd(cfg) {
  const { site } = resolveCfg(cfg);
  const origin = originOf(site);
  const orgId = origin + '/#organization';
  const siteId = origin + '/#website';
  const language = bcp47(site);

  /* --- Organization / ProfessionalService --------------------------------- */
  const org = {
    // Dual type, matching the export's home-page node — the richest of the four
    // shapes it used, and the correct one: this is an organisation that is also
    // a professional service business.
    '@type': ['Organization', 'ProfessionalService'],
    '@id': orgId,
    name: site.name,
    url: origin + '/',
  };

  if (site.legalName) org.legalName = site.legalName;
  if (site.description) org.description = site.description;
  if (site.foundingDate) org.foundingDate = String(site.foundingDate);
  if (site.telephone) org.telephone = site.telephone;
  if (site.faxNumber) org.faxNumber = site.faxNumber;
  if (site.email) org.email = site.email;

  if (site.address && typeof site.address === 'object') {
    org.address = {
      '@type': 'PostalAddress',
      streetAddress: site.address.streetAddress,
      addressLocality: site.address.addressLocality,
      addressRegion: site.address.addressRegion,
      postalCode: site.address.postalCode,
      addressCountry: site.address.addressCountry,
    };
  }

  if (site.geo && typeof site.geo === 'object') {
    org.geo = {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    };
  }

  if (site.openingHours && typeof site.openingHours === 'object') {
    org.openingHoursSpecification = [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: site.openingHours.dayOfWeek,
        opens: site.openingHours.opens,
        closes: site.openingHours.closes,
      },
    ];
  }

  if (Array.isArray(site.areaServed) && site.areaServed.length > 0) {
    // site.config.mjs stores these as {type, name}; schema.org needs {'@type', name}.
    org.areaServed = site.areaServed.map((a) =>
      a && typeof a === 'object' && a.type
        ? { '@type': a.type, name: a.name }
        : a
    );
  }

  if (Array.isArray(site.knowsAbout) && site.knowsAbout.length > 0) {
    org.knowsAbout = site.knowsAbout.slice();
  }

  if (site.logo && site.logo.src) {
    org.logo = {
      '@type': 'ImageObject',
      url: site.logo.src,
      width: site.logo.width,
      height: site.logo.height,
    };
  }

  // A representative photograph, not a second copy of the logo — this is the
  // image consumers show beside the entity.
  if (site.defaultOgImage && site.defaultOgImage.src) {
    org.image = {
      '@type': 'ImageObject',
      url: site.defaultOgImage.src,
      width: site.defaultOgImage.width,
      height: site.defaultOgImage.height,
    };
    if (site.defaultOgImage.alt) org.image.caption = site.defaultOgImage.alt;
  }

  // Omitted entirely when empty — see the doc comment above.
  if (Array.isArray(site.sameAs) && site.sameAs.length > 0) org.sameAs = site.sameAs.slice();

  /* --- WebSite ------------------------------------------------------------ */
  const website = {
    '@type': 'WebSite',
    '@id': siteId,
    url: origin + '/',
    name: site.name,
    inLanguage: language,
    publisher: { '@id': orgId },
  };
  if (site.description) website.description = site.description;

  return { '@context': 'https://schema.org', '@graph': [org, website] };
}

/* ================================================================== *
 * SECTION 8 — htmlToMarkdown
 * ================================================================== *
 *
 * A small, deterministic HTML -> Markdown converter, written for exactly one
 * corpus: this site's own built pages. It is what produces the Markdown mirror
 * that feeds llms-full.txt.
 *
 * DESIGN RULES
 *  1. MAIN CONTENT ONLY. `<main>` when the page has one (all 21 pages will,
 *     after the ssr-chrome pass). When it does not — the raw export has <main>
 *     on only 3 of 21 pages — fall back to <body> minus <header>, <footer>,
 *     <nav>, the skip link and the div-based breadcrumb trails. Chrome repeated
 *     on every page is noise in a corpus: 21 identical footers teach a crawler
 *     nothing and dilute every page it appears on.
 *  2. DROP what carries no text: script, style, svg, noscript, template,
 *     iframe, head — and anything marked `aria-hidden="true"`, which is
 *     decorative by the author's own declaration (this is what keeps the
 *     related-links "→" glyph out of every link label).
 *  3. PRESERVE what the previous generator threw away. The export's
 *     llms-full.txt silently deleted every stat tile, every timeline year and
 *     every testimonial attribution. Three narrow, documented rules below —
 *     STAT-TILE PAIRING, the ADJACENT-ELEMENT SEPARATOR, and keeping anchors as
 *     real links — are aimed squarely at those three losses.
 *  4. FAITHFUL LEVELS. h1 -> `#`. Heading order is the HTML's business (the
 *     fix-a11y pass owns it); this converter reports what is there rather than
 *     quietly renumbering, so a broken outline stays visible.
 *  5. DETERMINISTIC. No DOM, no dependencies, no clock. Same HTML in, same
 *     bytes out.
 */

/** Elements that never have a closing tag. */
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/**
 * Elements that start a new block. Everything else is inline. `picture` and
 * `figure` are here so a standalone image becomes its own block rather than
 * being glued onto neighbouring prose.
 */
const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'dd', 'div',
  'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'li', 'main', 'nav', 'ol',
  'p', 'picture', 'pre', 'section', 'summary', 'table', 'tbody', 'td', 'tfoot',
  'th', 'thead', 'tr', 'ul',
]);

/**
 * Tags whose entire subtree is discarded before parsing. Removing them with a
 * regex pre-pass rather than in the tree walk means their contents — which are
 * NOT HTML (JS source, CSS, SVG path data) — never reach the tag scanner.
 */
const RAW_DROP_TAGS = ['script', 'style', 'noscript', 'template', 'iframe', 'svg', 'head'];

/**
 * Class names on the export's hand-built breadcrumb `<div>`s. Those trails are
 * navigation, not content, and they render as a literal "Home / Lab Solutions /
 * GPO Purchasing" text line. Post-refactor pages emit a real
 * `<nav aria-label="Breadcrumb">` which the nav rule already removes; this set
 * covers the pre-refactor markup so the converter is useful on both.
 */
const CHROME_CLASSES = new Set(['breadcrumb', 'bc', 'mtfs-skip-link']);

/**
 * Inline tags between which the ADJACENT-ELEMENT SEPARATOR may be inserted.
 * `a` is deliberately absent: two adjacent links read fine with a space, and
 * joining them with an em dash would imply a relationship that is not there.
 */
const SEPARATOR_TAGS = new Set([
  'span', 'strong', 'b', 'em', 'i', 'small', 'div', 'p', 'cite', 'time', 'label',
]);

/** Longest a block may be and still count as a "micro" block for stat pairing. */
const MICRO_MAX = 48;

/**
 * A stat-looking fragment: optional leading punctuation/symbols, then a digit.
 * Matches "$0", "300+", "1800+", "10% - 50%", "+185%", "3.2x", "2005".
 * Does not match "Cost to Join", "IVF Practices", "Organic Traffic".
 */
const STAT_RE = /^[^A-Za-z]*\d/;

/**
 * Named HTML entities. Scoped to the set this corpus actually uses (measured:
 * &amp; &mdash; &middot; &rdquo; &ldquo; &copy; &#64; &rsquo; &nbsp; &sect;
 * &ndash; &eacute; &hellip; &rsaquo; &lt; &rarr;) plus the common remainder, so
 * a copy edit that introduces &trade; or &deg; does not leak raw entity text
 * into the corpus.
 *
 * NOTE: &nbsp; decodes to an ORDINARY space, not U+00A0. This is a text mirror
 * for machine consumption; a non-breaking space survives whitespace collapsing
 * and shows up as a stray control-ish character in tokenised text. Deliberate.
 */
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  copy: '©', reg: '®', trade: '™', sect: '§', para: '¶',
  deg: '°', plusmn: '±', middot: '·', bull: '•',
  hellip: '…', prime: '′', Prime: '″',
  ndash: '–', mdash: '—',
  lsquo: '‘', rsquo: '’', sbquo: '‚',
  ldquo: '“', rdquo: '”', bdquo: '„',
  laquo: '«', raquo: '»', lsaquo: '‹', rsaquo: '›',
  larr: '←', uarr: '↑', rarr: '→', darr: '↓', harr: '↔',
  times: '×', divide: '÷', minus: '−', frac12: '½',
  euro: '€', pound: '£', yen: '¥', cent: '¢',
  dagger: '†', Dagger: '‡', permil: '‰',
  eacute: 'é', Eacute: 'É', egrave: 'è', agrave: 'à',
  ccedil: 'ç', uuml: 'ü', ouml: 'ö', auml: 'ä',
  ntilde: 'ñ', aacute: 'á', iacute: 'í', oacute: 'ó',
  uacute: 'ú', szlig: 'ß', oslash: 'ø', aring: 'å',
  ensp: ' ', emsp: ' ', thinsp: ' ', shy: '', zwnj: '', zwj: '',
};

/**
 * Decode named, decimal and hexadecimal character references.
 * Unknown named entities are left EXACTLY as written — silently deleting one
 * would corrupt the text, and leaving it visible makes the gap findable.
 */
function decodeEntities(text) {
  return String(text).replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]{1,31});/g, (match, body) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X'
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
      // Surrogate halves are not valid standalone scalar values.
      if (code >= 0xd800 && code <= 0xdfff) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    return Object.prototype.hasOwnProperty.call(ENTITIES, body) ? ENTITIES[body] : match;
  });
}

/* ------------------------------------------------------------------ *
 * 8a. A minimal, forgiving HTML parser
 * ------------------------------------------------------------------ */

/**
 * Parse a fragment into a tree of `{type:'element', tag, attrs, children}` and
 * `{type:'text', value}` nodes.
 *
 * Forgiving by design, because it runs over generated markup it does not
 * control: an unmatched close tag is ignored rather than throwing, and the
 * standard implicit-close rules (`<li>` closes `<li>`, a block tag closes an
 * open `<p>`, `<td>` closes `<td>`, …) are applied so slightly sloppy markup
 * still yields the right shape.
 *
 * The attribute pattern `(?:[^>"']|"[^"]*"|'[^']*')*` is what lets a quoted
 * attribute value contain a `>` without ending the tag early.
 */
function parseHtml(html) {
  const root = { type: 'root', tag: null, attrs: {}, children: [] };
  const stack = [root];
  const tagRe =
    /<\/([a-zA-Z][a-zA-Z0-9:-]*)\s*>|<([a-zA-Z][a-zA-Z0-9:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

  let lastIndex = 0;
  let match;

  const top = () => stack[stack.length - 1];
  const addText = (raw) => {
    if (raw === '') return;
    top().children.push({ type: 'text', value: raw });
  };

  while ((match = tagRe.exec(html)) !== null) {
    addText(html.slice(lastIndex, match.index));
    lastIndex = tagRe.lastIndex;

    if (match[1] !== undefined) {
      // Closing tag: pop to the nearest matching ancestor; ignore if unmatched.
      const name = match[1].toLowerCase();
      let depth = -1;
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].tag === name) {
          depth = i;
          break;
        }
      }
      if (depth > 0) stack.length = depth;
      continue;
    }

    const tag = match[2].toLowerCase();
    const attrs = parseAttrs(match[3] || '');

    // Implicit closes before opening the new element.
    while (stack.length > 1 && closedBy(top().tag, tag)) stack.pop();

    const node = { type: 'element', tag, attrs, children: [] };
    top().children.push(node);

    const selfClosing = /\/\s*$/.test(match[3] || '');
    if (!VOID_TAGS.has(tag) && !selfClosing) stack.push(node);
  }

  addText(html.slice(lastIndex));
  return root;
}

/** `openTag` is implicitly closed when `nextTag` opens. */
function closedBy(openTag, nextTag) {
  switch (openTag) {
    case 'p':
      return BLOCK_TAGS.has(nextTag);
    case 'li':
      return nextTag === 'li';
    case 'dt':
    case 'dd':
      return nextTag === 'dt' || nextTag === 'dd';
    case 'td':
    case 'th':
      return nextTag === 'td' || nextTag === 'th' || nextTag === 'tr' ||
             nextTag === 'tbody' || nextTag === 'tfoot' || nextTag === 'thead';
    case 'tr':
      return nextTag === 'tr' || nextTag === 'tbody' || nextTag === 'tfoot' || nextTag === 'thead';
    case 'thead':
    case 'tbody':
      return nextTag === 'tbody' || nextTag === 'tfoot';
    case 'option':
      return nextTag === 'option';
    default:
      return false;
  }
}

/** Pull `name`, `name=value`, `name="value"` and `name='value'` out of a tag's attribute text. */
function parseAttrs(source) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const name = m[1].toLowerCase();
    let value = m[2];
    if (value === undefined) value = '';
    else if (value[0] === '"' || value[0] === "'") value = value.slice(1, -1);
    attrs[name] = decodeEntities(value);
  }
  return attrs;
}

/* ------------------------------------------------------------------ *
 * 8b. Main-content extraction
 * ------------------------------------------------------------------ */

/**
 * Return the HTML of the page's main content.
 *
 * `<main>` wins when present. Otherwise `<body>` minus the site chrome, which
 * is what makes this converter work on the raw export too (only 3 of its 21
 * pages have a `<main>`; every other page's sections are direct children of
 * `<body>`).
 */
function extractMain(html) {
  const withoutRaw = stripRawBlocks(html);

  const main = /<main\b[^>]*>([\s\S]*)<\/main\s*>/i.exec(withoutRaw);
  if (main) return main[1];

  const body = /<body\b[^>]*>([\s\S]*)<\/body\s*>/i.exec(withoutRaw);
  let inner = body ? body[1] : withoutRaw;

  // Site chrome. Non-greedy so multiple <nav> elements are each removed.
  inner = inner
    .replace(/<header\b[^>]*>[\s\S]*?<\/header\s*>/gi, ' ')
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer\s*>/gi, ' ')
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav\s*>/gi, ' ');

  return inner;
}

/**
 * Remove comments and the subtrees whose contents are not HTML (JS, CSS, SVG
 * path data) before the tag scanner ever sees them.
 */
function stripRawBlocks(html) {
  let out = String(html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, ' ')
    .replace(/<!DOCTYPE[^>]*>/gi, ' ');

  for (const tag of RAW_DROP_TAGS) {
    out = out.replace(new RegExp('<' + tag + '\\b[^>]*>[\\s\\S]*?<\\/' + tag + '\\s*>', 'gi'), ' ');
    out = out.replace(new RegExp('<' + tag + '\\b[^>]*\\/>', 'gi'), ' ');
  }
  return out;
}

/** True when a node must not contribute anything to the output at all. */
function isDropped(node) {
  if (!node || node.type !== 'element') return false;
  if (RAW_DROP_TAGS.indexOf(node.tag) !== -1) return true;
  // The author has declared this decorative. Believe them: it keeps the "→"
  // glyph out of every related-links label and the dot spans out of every badge.
  if (node.attrs['aria-hidden'] === 'true') return true;
  if (node.attrs.hidden !== undefined && node.attrs.hidden !== 'false') return true;
  if (node.tag === 'nav' || node.tag === 'header' || node.tag === 'footer') return true;
  const cls = String(node.attrs.class || '').split(/\s+/);
  for (const c of cls) if (CHROME_CLASSES.has(c)) return true;
  return false;
}

/* ------------------------------------------------------------------ *
 * 8c. Inline rendering
 * ------------------------------------------------------------------ */

/**
 * Render a run of inline nodes to a single Markdown string.
 *
 * THE ADJACENT-ELEMENT SEPARATOR. Two inline elements that sit directly beside
 * each other with NO whitespace between them are joined with " — " instead of
 * being concatenated. That single rule fixes two real losses at once:
 *
 *   `<strong>Steven C. Gerson, CPA, MPAcc</strong><span>Chief Financial
 *    Officer, Atlanta Center for Reproductive Medicine</span>`
 *      -> "**Steven C. Gerson, CPA, MPAcc** — Chief Financial Officer, …"
 *      (concatenation would have produced "…MPAccChief Financial Officer…")
 *
 *   `<a …><span class="…__title">Accounting & Finance</span><span
 *    class="…__desc">Turn purchasing data into…</span></a>`
 *      -> "[Accounting & Finance — Turn purchasing data into…](…)"
 *
 * Both are display:block spans in the stylesheet, so the separator restores
 * exactly the visual break a reader sees. It is scoped to SEPARATOR_TAGS (never
 * between two anchors), skipped when either side already carries whitespace, and
 * skipped around punctuation that implies the sentence continues.
 */
function renderInline(nodes, ctx) {
  let out = '';
  let prevTag = null;

  for (const node of nodes) {
    if (isDropped(node)) continue;

    if (node.type === 'text') {
      const text = decodeEntities(node.value).replace(/[\t\r\n\f ]+/g, ' ');
      if (text === '') continue;
      if (text.trim() === '') {
        // Whitespace-only: preserve one space, and break the adjacency chain so
        // the separator rule does not fire across it.
        if (out !== '' && !/\s$/.test(out)) out += ' ';
        prevTag = null;
        continue;
      }
      out += text;
      prevTag = null;
      continue;
    }

    const rendered = renderInlineElement(node, ctx);
    if (rendered === '') continue; // empty element: adjacency chain untouched

    if (prevTag !== null && wantsSeparator(prevTag, node.tag, out, rendered)) out += ' — ';
    out += rendered;
    prevTag = node.tag;
  }

  return out;
}

/** Decide whether " — " goes between two adjacent inline elements. */
function wantsSeparator(prevTag, tag, out, next) {
  if (!SEPARATOR_TAGS.has(prevTag) || !SEPARATOR_TAGS.has(tag)) return false;
  if (out === '' || /\s$/.test(out)) return false;
  if (/^\s/.test(next)) return false;
  // Mid-sentence punctuation on either side means these two are one phrase.
  if (/[([{“‘"'\-—–/]$/.test(out)) return false;
  if (/^[),.;:!?%’”"'\-—–/]/.test(next)) return false;
  return true;
}

/** Render one inline element. */
function renderInlineElement(node, ctx) {
  const tag = node.tag;

  if (tag === 'br') return '\n';
  if (tag === 'wbr') return '';

  if (tag === 'img') {
    const src = absolutize(node.attrs.src, ctx);
    const alt = String(node.attrs.alt || '').replace(/\s+/g, ' ').trim();
    if (src === '') return '';
    return '![' + escapeLinkText(alt) + '](' + formatUrl(src) + ')';
  }

  const inner = renderInline(node.children, ctx);
  const trimmed = inner.trim();

  switch (tag) {
    case 'a': {
      if (trimmed === '') return '';
      const href = absolutize(node.attrs.href, ctx);
      // No usable destination: keep the words, drop the link syntax.
      if (href === '' || href === '#' || /^javascript:/i.test(href)) return inner;
      return '[' + escapeLinkText(trimmed) + '](' + formatUrl(href) + ')';
    }
    case 'strong':
    case 'b':
      return trimmed === '' ? inner : '**' + trimmed + '**';
    case 'em':
    case 'i':
      return trimmed === '' ? inner : '*' + trimmed + '*';
    case 'del':
    case 's':
      return trimmed === '' ? inner : '~~' + trimmed + '~~';
    case 'code':
    case 'kbd':
    case 'samp':
    case 'var':
      // Use a longer fence when the content itself contains a backtick.
      if (trimmed === '') return inner;
      return trimmed.indexOf('`') === -1 ? '`' + trimmed + '`' : '`` ' + trimmed + ' ``';
    default:
      return inner;
  }
}

/** Make a root-relative URL absolute when an origin was supplied. */
function absolutize(href, ctx) {
  const raw = String(href === undefined || href === null ? '' : href).trim();
  if (raw === '') return '';
  if (ctx.origin !== '' && raw.startsWith('/') && !raw.startsWith('//')) return ctx.origin + raw;
  return raw;
}

/** Wrap a URL in <> when bare parentheses or spaces would break the link syntax. */
function formatUrl(url) {
  return /[()\s]/.test(url) ? '<' + url + '>' : url;
}

/** `[` and `]` inside link text would close the label early. */
function escapeLinkText(text) {
  return text.replace(/([[\]])/g, '\\$1');
}

/* ------------------------------------------------------------------ *
 * 8d. Block rendering
 * ------------------------------------------------------------------ */

/**
 * Render a container's children into an ordered list of blocks.
 *
 * A block is `{ kind, text, leaf, paired }`:
 *   kind    'heading' | 'p' | 'list' | 'quote' | 'table' | 'code' | 'hr'
 *   leaf    true when the block came straight from inline content, with no
 *           nested structure. Only leaf blocks are eligible for stat pairing.
 *   paired  true when the block is already the result of a pairing, so it can
 *           never be paired a second time.
 *
 * Consecutive inline children are gathered into an implicit paragraph, exactly
 * as a browser would; block children are rendered in place.
 */
function blocksOf(node, ctx) {
  const out = [];
  let buffer = [];

  const flush = () => {
    if (buffer.length === 0) return;
    const text = tidyBlockText(renderInline(buffer, ctx));
    buffer = [];
    if (text !== '') out.push({ kind: 'p', text, leaf: true, paired: false });
  };

  for (const child of node.children) {
    if (isDropped(child)) continue;
    if (child.type === 'text' || !BLOCK_TAGS.has(child.tag)) {
      buffer.push(child);
      continue;
    }
    flush();
    for (const block of blockFor(child, ctx)) out.push(block);
  }
  flush();

  return pairStatTiles(out);
}

/** Render one block-level element into zero or more blocks. */
function blockFor(node, ctx) {
  const tag = node.tag;

  if (/^h[1-6]$/.test(tag)) {
    const level = Number(tag[1]);
    const text = tidyBlockText(renderInline(node.children, ctx)).replace(/\s*\n\s*/g, ' ');
    if (text === '') return [];
    return [{ kind: 'heading', text: '#'.repeat(level) + ' ' + text, leaf: false, paired: false }];
  }

  switch (tag) {
    case 'hr':
      return [{ kind: 'hr', text: '---', leaf: false, paired: false }];

    case 'p':
    case 'figcaption':
    case 'summary':
    case 'dt':
    case 'dd': {
      const text = tidyBlockText(renderInline(node.children, ctx));
      if (text === '') return [];
      return [{ kind: 'p', text, leaf: true, paired: false }];
    }

    case 'pre': {
      // Code is verbatim: no entity-collapsing, no inline formatting.
      const text = decodeEntities(rawText(node)).replace(/\n+$/, '');
      if (text.trim() === '') return [];
      const fence = text.indexOf('```') === -1 ? '```' : '~~~';
      return [{ kind: 'code', text: fence + '\n' + text + '\n' + fence, leaf: false, paired: false }];
    }

    case 'ul':
    case 'ol':
      return listBlock(node, ctx);

    case 'blockquote': {
      const inner = blocksOf(node, ctx);
      if (inner.length === 0) return [];
      const text = joinBlocks(inner)
        .split('\n')
        .map((line) => (line === '' ? '>' : '> ' + line))
        .join('\n');
      return [{ kind: 'quote', text, leaf: false, paired: false }];
    }

    case 'table':
      return tableBlock(node, ctx);

    default:
      // Transparent container: div, section, article, aside, figure, picture,
      // main, form, li encountered outside a list, stray tr/td, …
      return blocksOf(node, ctx);
  }
}

/**
 * STAT-TILE PAIRING (value + label -> "Label: Value").
 *
 * The export renders every statistic as two sibling block elements:
 *   `<div class="stat-box"><div class="num">$0</div><div class="lbl">Cost to
 *    Join</div></div>`
 *   `<div class="il13"><div class="il14">No</div><div class="il15">Purchase
 *    Obligations</div></div>`
 * A naive converter emits those as two orphaned lines ("$0" then "Cost to
 * Join"), and the export's own generator dropped them altogether — measured:
 * the whole "$0 / 300+ IVF Practices / 1800+ Active Contracts / 10%-50%" GPO
 * dashboard collapsed to the two words "Member benefits", the second GPO panel
 * ($0/No/No/No/Yes) went the same way, and all six
 * /services/management-services/marketing/ figures had zero occurrences.
 *
 * The rule, deliberately narrow so it can never fire on prose. All of these
 * must hold:
 *   - the container produced EXACTLY two blocks;
 *   - both are leaf paragraphs, neither already the product of a pairing;
 *   - both are at most 48 characters, single-line, colon-free, link-free;
 *   - and ONE of the two is identifiable as the VALUE, by either test:
 *       (a) exactly one side looks numeric — leading non-letters then a digit:
 *           "$0", "300+", "10% - 50%", "+185%", "3.2x", "2005"; or
 *       (b) one side is a short bare token (at most two words, at most 14
 *           characters, no sentence punctuation) and the other is at least four
 *           characters longer — which is what pairs "No" with "Purchase
 *           Obligations", "Yes" with "Immediate Savings" and "U.S." with
 *           "Nationwide Coverage".
 *
 * The prose side becomes the label and the token side the value, so the pair
 * reads "Cost to Join: $0" regardless of DOM order. When neither test resolves
 * — two numbers, two sentences, two equally short words — nothing is merged and
 * both lines are emitted unchanged. This rule only ever REASSEMBLES; it can
 * never drop a fragment.
 */
function pairStatTiles(blocks) {
  if (blocks.length !== 2) return blocks;

  const [a, b] = blocks;
  if (a.kind !== 'p' || b.kind !== 'p') return blocks;
  if (!a.leaf || !b.leaf || a.paired || b.paired) return blocks;
  if (a.text.length > MICRO_MAX || b.text.length > MICRO_MAX) return blocks;
  if (a.text.indexOf('\n') !== -1 || b.text.indexOf('\n') !== -1) return blocks;
  if (a.text.indexOf(':') !== -1 || b.text.indexOf(':') !== -1) return blocks;
  if (a.text.indexOf('](') !== -1 || b.text.indexOf('](') !== -1) return blocks;

  // (a) numeric test
  const statA = STAT_RE.test(a.text);
  const statB = STAT_RE.test(b.text);
  let valueFirst = null;
  if (statA !== statB) valueFirst = statA;

  // (b) short-token test, only when the numeric test did not resolve it
  if (valueFirst === null) {
    const tokenA = isValueToken(a.text);
    const tokenB = isValueToken(b.text);
    if (tokenA !== tokenB) {
      const short = tokenA ? a.text : b.text;
      const long = tokenA ? b.text : a.text;
      if (long.length >= short.length + 4 && long.length >= 6) valueFirst = tokenA;
    }
  }

  if (valueFirst === null) return blocks;

  const label = valueFirst ? b.text : a.text;
  const value = valueFirst ? a.text : b.text;
  return [{ kind: 'p', text: label + ': ' + value, leaf: false, paired: true }];
}

/** A bare value token: at most two words, at most 14 chars, no sentence punctuation. */
function isValueToken(text) {
  if (text.length > 14) return false;
  if (/[.!?,;]$/.test(text)) return false;
  return text.split(/\s+/).length <= 2;
}

/** Render `<ul>` / `<ol>`, including nested lists and multi-block list items. */
function listBlock(node, ctx) {
  const ordered = node.tag === 'ol';
  const start = Number(node.attrs.start);
  let index = Number.isFinite(start) && start > 0 ? start : 1;

  const items = [];
  for (const child of node.children) {
    if (isDropped(child)) continue;
    if (child.type !== 'element') continue;
    // Tolerate a list whose items were not wrapped in <li>.
    const itemNode = child.tag === 'li' ? child : { ...child, children: [child] };
    const inner = blocksOf(itemNode, ctx);
    if (inner.length === 0) continue;

    const marker = ordered ? index + '. ' : '- ';
    index += 1;

    const body = joinBlocks(inner, { tight: true });
    const indent = ' '.repeat(marker.length);
    const rendered = body
      .split('\n')
      .map((line, i) => (i === 0 ? marker + line : line === '' ? '' : indent + line))
      .join('\n');
    items.push(rendered);
  }

  if (items.length === 0) return [];
  return [{ kind: 'list', text: items.join('\n'), leaf: false, paired: false }];
}

/** Render `<table>` as a GFM pipe table. */
function tableBlock(node, ctx) {
  const rows = [];
  collectRows(node, rows);
  if (rows.length === 0) return [];

  const cellsOf = (tr) =>
    tr.children
      .filter((c) => c.type === 'element' && (c.tag === 'td' || c.tag === 'th') && !isDropped(c))
      .map((c) => renderInline(c.children, ctx).replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|').trim());

  const table = rows.map(cellsOf).filter((cells) => cells.length > 0);
  if (table.length === 0) return [];

  const width = table.reduce((w, cells) => Math.max(w, cells.length), 0);
  const pad = (cells) => {
    const copy = cells.slice();
    while (copy.length < width) copy.push('');
    return copy;
  };

  const headerIsReal = rows[0].children.some((c) => c.type === 'element' && c.tag === 'th');
  const header = headerIsReal ? pad(table[0]) : new Array(width).fill('');
  const bodyRows = headerIsReal ? table.slice(1) : table;

  const out = [
    '| ' + header.join(' | ') + ' |',
    '| ' + new Array(width).fill('---').join(' | ') + ' |',
    ...bodyRows.map((cells) => '| ' + pad(cells).join(' | ') + ' |'),
  ];

  return [{ kind: 'table', text: out.join('\n'), leaf: false, paired: false }];
}

/** Depth-first collection of `<tr>` elements, through thead/tbody/tfoot. */
function collectRows(node, out) {
  for (const child of node.children) {
    if (child.type !== 'element' || isDropped(child)) continue;
    if (child.tag === 'tr') out.push(child);
    else collectRows(child, out);
  }
}

/** Concatenate a node's descendant text without any Markdown formatting. */
function rawText(node) {
  if (node.type === 'text') return node.value;
  if (node.type !== 'element' && node.type !== 'root') return '';
  if (node.type === 'element' && RAW_DROP_TAGS.indexOf(node.tag) !== -1) return '';
  let out = '';
  for (const child of node.children) out += rawText(child);
  return out;
}

/**
 * Join blocks into a single string.
 * `tight` mode keeps a list immediately under the paragraph that introduces it,
 * which is what a reader expects inside a list item.
 */
function joinBlocks(blocks, opts) {
  const tight = Boolean(opts && opts.tight);
  let out = '';
  for (let i = 0; i < blocks.length; i += 1) {
    if (i > 0) out += tight && blocks[i].kind === 'list' ? '\n' : '\n\n';
    out += blocks[i].text;
  }
  return out;
}

/**
 * Normalise one block's inline text:
 *   - collapse runs of spaces;
 *   - turn `<br>`-derived newlines into Markdown hard breaks;
 *   - escape a line-leading character that would otherwise be read as Markdown
 *     structure (`#`, `>`, `|`, a bullet marker, an ordered-list marker);
 *   - escape a `<` that is followed by a letter or slash, so a literal `&lt;div`
 *     in the copy cannot look like a surviving tag.
 */
function tidyBlockText(text) {
  const collapsed = String(text)
    .replace(/[\t\f ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
  if (collapsed === '') return '';

  const escaped = collapsed
    .split('\n')
    .map((line) => escapeLineStart(line.trim()))
    .filter((line) => line !== '')
    .join('  \n'); // two trailing spaces = Markdown hard break

  return escaped.replace(/<(?=[a-zA-Z/!?])/g, '\\<');
}

/** Escape only the leading character, and only when it would create block markup. */
function escapeLineStart(line) {
  if (/^#{1,6}(\s|$)/.test(line)) return '\\' + line;
  if (/^>/.test(line)) return '\\' + line;
  if (/^\|/.test(line)) return '\\' + line;
  if (/^[-*+](\s)/.test(line)) return '\\' + line;
  if (/^\d+[.)](\s)/.test(line)) return line.replace(/^(\d+)([.)])/, '$1\\$2');
  return line;
}

/* ------------------------------------------------------------------ *
 * 8e. The public entry point
 * ------------------------------------------------------------------ */

/**
 * Convert a full HTML page to Markdown, main content only.
 *
 * Handled: h1-h6, p, ul/ol/li (nested, ordered `start` honoured), a, strong/b,
 * em/i, del/s, code/kbd/samp/var, pre, blockquote, table (GFM pipe form),
 * img, br, hr, figure/figcaption, dl/dt/dd, and every generic container as a
 * transparent block.
 *
 * Dropped: script, style, svg, noscript, template, iframe, head, `<header>`,
 * `<footer>`, `<nav>`, anything `aria-hidden="true"` or `hidden`, and the
 * export's div-based breadcrumb trails. HTML entities are decoded; whitespace is
 * collapsed; nothing is emitted that still looks like a tag.
 *
 * @param {string} html Full page HTML (or any fragment).
 * @param {{origin?: string}} [options]
 *        `origin` — when set, every root-relative href/src is rewritten to an
 *        absolute canonical URL. Off by default so the function is pure over its
 *        first argument; `build/sync.mjs` passes `{ origin: site.origin }` when
 *        building the corpus, because a link in llms-full.txt that reads
 *        `/services/` is useless to a crawler that fetched the file from
 *        somewhere else.
 * @returns {string} Markdown, with a single trailing newline, or `''`.
 */
export function htmlToMarkdown(html, options) {
  if (typeof html !== 'string' || html === '') return '';

  const opts = options && typeof options === 'object' ? options : {};
  const ctx = { origin: String(opts.origin || '').replace(/\/+$/, '') };

  const tree = parseHtml(extractMain(html));
  const blocks = blocksOf(tree, ctx);
  const markdown = joinBlocks(blocks).replace(/\n{3,}/g, '\n\n').trim();

  return markdown === '' ? '' : markdown + '\n';
}
