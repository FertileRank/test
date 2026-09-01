/**
 * build/lib/routes.mjs — the routing kernel.
 *
 * Single place where a route's identity is turned into a URL, a file, a trail or a
 * relationship. Every other module (render, artifacts, validate, sync) must go through
 * this file so that the header, the breadcrumbs, the BreadcrumbList JSON-LD, the visible
 * breadcrumb <nav>, sitemap.xml, llms.txt and the link validator can never disagree about
 * what a path looks like.
 *
 * Contract (do not add exports):
 *   buildGraph, canonicalUrl, breadcrumbTrail, breadcrumbJsonLd,
 *   siblings, relatedRoutes, normalizePath, outputFileFor
 *
 * Guarantees:
 *   - ESM, Node >= 18, ZERO dependencies (not even node: builtins are needed here).
 *   - Importing this file has NO side effects: it defines constants and functions, runs
 *     nothing, touches no filesystem, reads no environment.
 *   - Fully deterministic: no Date, no Math.random, no iteration over unordered structures.
 *     Every list this module returns is in `routes[]` manifest order, so two builds of the
 *     same manifest produce byte-identical output.
 *   - Nothing here mutates the route objects it is given.
 *
 * A Route is the object literal documented in site.config.mjs:
 *   { id, path, parent, title, navLabel, description, priority, changefreq,
 *     inNav, inFooter, inSitemapXml, inLlms, group, icon, summary, keywords[] }
 */

/**
 * A final path segment that looks like a real file ("sitemap.xml", "favicon.ico",
 * "site.a1b2c3d4.css") must never be given a trailing slash. Directory-style routes
 * ("/about", "/404") always get one.
 */
const FILE_SEGMENT_RE = /\.[A-Za-z0-9]{1,8}$/;

/** Any URI scheme ("https:", "mailto:", "tel:", "data:", "javascript:"). */
const SCHEME_RE = /^[A-Za-z][A-Za-z0-9+.-]*:/;

/** An explicitly requested directory index document. */
const INDEX_DOC_RE = /\/index\.html?$/i;

/**
 * Normalise an href into the site's one canonical spelling of a path.
 *
 * This is the function that guarantees every internal link in the build agrees on
 * trailing slashes. Rules:
 *   - Root-relative and relative paths gain a leading slash and a trailing slash.
 *   - A trailing "index.html" / "index.htm" is stripped to its directory.
 *   - Duplicate slashes collapse.
 *   - A final segment carrying a file extension keeps its exact shape (no trailing slash).
 *   - "?query" and "#fragment" are preserved verbatim and are not part of the path.
 *   - Absolute URLs, protocol-relative URLs, mailto:/tel:/data:/javascript: and bare
 *     "#fragment" targets are returned untouched — they are not site paths.
 *
 *   normalizePath('/about')                -> '/about/'
 *   normalizePath('/about/index.html#bio') -> '/about/#bio'
 *   normalizePath('services//lab/')        -> '/services/lab/'
 *   normalizePath('/sitemap.xml')          -> '/sitemap.xml'
 *   normalizePath('/assets/site.css?v=3')  -> '/assets/site.css?v=3'
 *   normalizePath('#testimonials')         -> '#testimonials'
 *   normalizePath('https://x.test/a')      -> 'https://x.test/a'
 *
 * @param {string} href
 * @returns {string}
 */
export function normalizePath(href) {
  if (href === null || href === undefined) return '/';
  let s = String(href).trim();
  if (s === '') return '/';

  // Not a site path — hand it back exactly as given.
  if (s.startsWith('//')) return s;
  if (s.startsWith('#')) return s;
  if (SCHEME_RE.test(s)) return s;

  // Split off ?query / #fragment; whichever comes first wins, the rest rides along.
  const q = s.indexOf('?');
  const h = s.indexOf('#');
  let cut = -1;
  if (q >= 0 && h >= 0) cut = Math.min(q, h);
  else if (q >= 0) cut = q;
  else if (h >= 0) cut = h;

  let suffix = '';
  if (cut >= 0) {
    suffix = s.slice(cut);
    s = s.slice(0, cut);
  }

  if (s === '') return '/' + suffix;

  s = s.replace(/\\/g, '/');
  if (!s.startsWith('/')) s = '/' + s;
  s = s.replace(/\/{2,}/g, '/');
  s = s.replace(INDEX_DOC_RE, '/');

  if (!s.endsWith('/')) {
    const last = s.slice(s.lastIndexOf('/') + 1);
    if (!FILE_SEGMENT_RE.test(last)) s += '/';
  }
  return s + suffix;
}

/**
 * Strip ?query and #fragment, leaving only the path portion of an already-normalised href.
 * @param {string} href
 * @returns {string}
 */
function pathOnly(href) {
  const s = normalizePath(href);
  const q = s.indexOf('?');
  const h = s.indexOf('#');
  let cut = -1;
  if (q >= 0 && h >= 0) cut = Math.min(q, h);
  else if (q >= 0) cut = q;
  else if (h >= 0) cut = h;
  return cut >= 0 ? s.slice(0, cut) : s;
}

/**
 * Accept either a Route object or a bare path string wherever a route is expected.
 * @param {object|string} route
 * @returns {string}
 */
function routePath(route) {
  if (typeof route === 'string') return normalizePath(route);
  if (route && typeof route.path === 'string') return normalizePath(route.path);
  return '/';
}

/**
 * Build the route graph.
 *
 * A route whose declared `parent` id does not exist is treated as a root here so the rest
 * of the build still works; validate.mjs::validateManifest reports it as an error.
 * Duplicate ids and paths keep their FIRST occurrence in the maps (again: reported by
 * validateManifest, not silently repaired).
 *
 * @param {object[]} routes  the ordered manifest from site.config.mjs
 * @returns {{byId: Map<string, object>, byPath: Map<string, object>,
 *            children: Map<string, object[]>, roots: object[]}}
 */
export function buildGraph(routes) {
  const list = Array.isArray(routes) ? routes.filter((r) => r && typeof r === 'object') : [];

  const byId = new Map();
  const byPath = new Map();
  const children = new Map();
  const roots = [];

  for (const r of list) {
    if (r.id !== undefined && r.id !== null && !byId.has(r.id)) byId.set(r.id, r);
    if (typeof r.path === 'string') {
      const p = pathOnly(r.path);
      if (!byPath.has(p)) byPath.set(p, r);
    }
    if (r.id !== undefined && r.id !== null && !children.has(r.id)) children.set(r.id, []);
  }

  for (const r of list) {
    const pid = r.parent === undefined ? null : r.parent;
    if (pid !== null && pid !== r.id && children.has(pid)) children.get(pid).push(r);
    else roots.push(r);
  }

  return { byId, byPath, children, roots };
}

/**
 * Absolute canonical URL for a route: origin + path, always with the trailing slash the
 * manifest declares. Accepts a Route or a path string.
 *
 * @param {object|string} route
 * @param {{origin?: string}} site  the `site` object from site.config.mjs
 * @returns {string}
 */
export function canonicalUrl(route, site) {
  const origin = String((site && site.origin) || '').trim().replace(/\/+$/, '');
  return origin + routePath(route);
}

/**
 * The breadcrumb trail, root first, self last.
 *
 * Walks `parent` ids. The home route (path '/') is prepended when the chain does not
 * already start there, so a manifest that declares top-level pages as `parent: null`
 * still produces "Home > Services > Lab Solutions > GPO Purchasing". Cycles are broken
 * defensively (a route can appear at most once).
 *
 * Home itself returns [home] — callers (renderBreadcrumbs) omit the visible <nav> when
 * the trail has fewer than two entries.
 *
 * @param {object|string} route
 * @param {ReturnType<typeof buildGraph>} graph
 * @returns {object[]} Route[] from root to self
 */
export function breadcrumbTrail(route, graph) {
  if (!route || !graph) return [];

  let current =
    typeof route === 'string'
      ? graph.byPath.get(pathOnly(route)) || graph.byId.get(route) || null
      : route;

  const trail = [];
  const seen = new Set();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    trail.unshift(current);
    const pid = current.parent === undefined ? null : current.parent;
    current = pid === null ? null : graph.byId.get(pid) || null;
  }

  const home = graph.byPath.get('/');
  if (home && trail.length > 0 && trail[0].id !== home.id) trail.unshift(home);

  return trail;
}

/**
 * schema.org BreadcrumbList for a route, generated from the same trail that renders the
 * visible <nav aria-label="Breadcrumb">, so markup and structured data cannot diverge.
 *
 * Returns null — meaning "emit nothing" — when:
 *   - the trail has fewer than two entries (the home page: a one-item BreadcrumbList is
 *     a useless stub), or
 *   - the route is not indexable (`inSitemapXml === false`, i.e. /404/).
 *
 * Names come from `navLabel` so /our-team/ reads "Our Team" and /terms-of-service/ matches
 * its own title. The node carries an @id ({canonical}#breadcrumb) so a WebPage node can
 * reference it with `breadcrumb`.
 *
 * @param {object} route
 * @param {ReturnType<typeof buildGraph>} graph
 * @param {{origin?: string}} site
 * @returns {object|null}
 */
export function breadcrumbJsonLd(route, graph, site) {
  if (route && route.inSitemapXml === false) return null;

  const trail = breadcrumbTrail(route, graph);
  if (trail.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': canonicalUrl(route, site) + '#breadcrumb',
    itemListElement: trail.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: r.navLabel || r.title || String(r.id || ''),
      item: canonicalUrl(r, site),
    })),
  };
}

/**
 * Routes sharing this route's parent, excluding the route itself, in manifest order.
 * Routes with a missing/unknown parent are siblings of the other roots.
 *
 * @param {object} route
 * @param {ReturnType<typeof buildGraph>} graph
 * @returns {object[]}
 */
export function siblings(route, graph) {
  if (!route || !graph) return [];
  const pid = route.parent === undefined ? null : route.parent;
  const pool = pid !== null && graph.children.has(pid) ? graph.children.get(pid) : graph.roots;
  return pool.filter((r) => r.id !== route.id);
}

/**
 * Deterministic "related pages" for the <aside class="mtfs-related"> block.
 *
 * Order is fixed and reproducible — siblings first, then this route's own children, then
 * remaining peers in the same `group`, each in manifest order. No shuffling, no Date, no
 * hashing: the same manifest always yields the same block.
 *
 * Non-indexable routes (`inSitemapXml === false`, i.e. /404/) are never surfaced.
 *
 * @param {object} route
 * @param {ReturnType<typeof buildGraph>} graph
 * @param {number} [max=3]
 * @returns {object[]}
 */
export function relatedRoutes(route, graph, max = 3) {
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 3;
  if (!route || !graph || limit === 0) return [];

  const out = [];
  const taken = new Set([route.id]);

  const consider = (r) => {
    if (out.length >= limit) return;
    if (!r || r.id === undefined || taken.has(r.id)) return;
    if (r.inSitemapXml === false) return;
    taken.add(r.id);
    out.push(r);
  };

  for (const r of siblings(route, graph)) consider(r);
  for (const r of graph.children.get(route.id) || []) consider(r);
  if (route.group) {
    for (const r of graph.byId.values()) {
      if (out.length >= limit) break;
      if (r.group === route.group) consider(r);
    }
  }

  return out;
}

/**
 * Route -> output file, relative to the dist root, with no leading slash.
 *
 *   '/'                          -> 'index.html'
 *   '/services/lab-solutions/'   -> 'services/lab-solutions/index.html'
 *   '/sitemap.xml'               -> 'sitemap.xml'
 *
 * @param {object|string} route
 * @returns {string}
 */
export function outputFileFor(route) {
  const rel = routePath(route).replace(/^\/+/, '');
  const bare = rel.split('#')[0].split('?')[0];
  if (bare === '') return 'index.html';
  if (FILE_SEGMENT_RE.test(bare)) return bare;
  return (bare.endsWith('/') ? bare : bare + '/') + 'index.html';
}
