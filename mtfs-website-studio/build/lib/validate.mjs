/**
 * build/lib/validate.mjs — the guard that makes the Global Sync claim true.
 *
 * This module exists to FAIL A BUILD. `node build/sync.mjs --check` must exit non-zero
 * rather than publish a site whose internal links, manifest and redirects disagree.
 *
 * Contract (do not add exports):
 *   validateManifest, extractLinks, validateLinks, findOrphans, EXTRA_ALLOWED_PATHS
 *
 * Guarantees:
 *   - ESM, Node >= 18, ZERO dependencies. Only ./routes.mjs is imported (for the one
 *     canonical path-normalisation rule; duplicating it here is how drift starts).
 *   - Importing this file has NO side effects.
 *   - Deterministic: problems come back in page order, then source order.
 *
 * SEVERITY CONVENTION
 *   validateManifest returns string[] (per contract). Every string is prefixed with
 *   '[error] ' or '[warn] '. Callers gate the build on errors only:
 *       const problems = validateManifest(routes, { redirects });
 *       const fatal = problems.filter((p) => p.startsWith('[error]'));
 *   validateLinks returns objects that carry the level explicitly.
 */

import { normalizePath } from './routes.mjs';

/* ------------------------------------------------------------------ *
 * Allowed non-route link targets
 * ------------------------------------------------------------------ */

/**
 * Root-relative paths that are legal link targets even though they are not routes.
 *
 * A member ending in '/' is a DIRECTORY PREFIX: '/assets/' allows '/assets/**' (every
 * hashed stylesheet, script, font and image the build emits). Exact files are listed
 * exactly.
 *
 * The one legitimate non-route internal link in the export is /sitemap/ -> /sitemap.xml
 * (anchor text "XML sitemap"); it must not fail validateLinks.
 *
 * @type {Set<string>}
 */
export const EXTRA_ALLOWED_PATHS = new Set([
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/favicon.ico',
  '/assets/', // directory prefix -> /assets/**
]);

/** Anchor text that says nothing about its destination. Banned site-wide. */
const GENERIC_ANCHOR_TEXT = ['learn more', 'get started', 'click here', 'read more'];

const CHANGEFREQ = new Set([
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
]);

const GROUPS = new Set(['main', 'lab-solutions', 'management-services', 'legal', 'system']);

const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308, 404, 410]);

/** Recommended <title> / meta description lengths (SEO-11). */
const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

const KEBAB_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* ------------------------------------------------------------------ *
 * Small internal helpers
 * ------------------------------------------------------------------ */

/** Path portion of an href, with ?query and #fragment removed. */
function pathOf(href) {
  const s = normalizePath(href);
  const q = s.indexOf('?');
  const h = s.indexOf('#');
  let cut = -1;
  if (q >= 0 && h >= 0) cut = Math.min(q, h);
  else if (q >= 0) cut = q;
  else if (h >= 0) cut = h;
  return cut >= 0 ? s.slice(0, cut) : s;
}

/** '#fragment' of an href, without the hash, or '' when there is none. */
function fragmentOf(href) {
  const s = String(href);
  const h = s.indexOf('#');
  return h >= 0 ? s.slice(h + 1) : '';
}

/** True when a root-relative path is covered by EXTRA_ALLOWED_PATHS (exact or prefix). */
function isExtraAllowed(path, extra) {
  const set = extra || EXTRA_ALLOWED_PATHS;
  if (set.has(path)) return true;
  for (const entry of set) {
    if (entry.endsWith('/') && entry !== '/' && path.startsWith(entry)) return true;
  }
  return false;
}

/**
 * Blank the bodies of <script> and <style> and delete comments, keeping the opening tags
 * (so `<script src="/assets/nav.js">` is still validated) — without this, root-relative
 * strings inside JavaScript ('/about/', '/contact/' in the shipped mega-menu source) are
 * scraped as if they were links.
 */
function stripScriptAndStyleBodies(html) {
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/(<script\b[^>]*>)[\s\S]*?(<\/script\s*>)/gi, '$1$2')
    .replace(/(<style\b[^>]*>)[\s\S]*?(<\/style\s*>)/gi, '$1$2');
}

const TAG_RE =
  /<([A-Za-z][A-Za-z0-9:-]*)((?:\s+[^\s"'=<>`/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;

const ATTR_RE =
  /([^\s"'=<>`/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/** Parse a tag's attribute blob into a lowercase-keyed plain object. */
function parseAttrs(blob) {
  const out = {};
  if (!blob) return out;
  ATTR_RE.lastIndex = 0;
  let m;
  while ((m = ATTR_RE.exec(blob)) !== null) {
    const name = String(m[1] || '').toLowerCase();
    if (!name) continue;
    const value = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : '';
    if (!(name in out)) out[name] = value;
  }
  return out;
}

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  middot: '\u00b7',
  mdash: '\u2014',
  ndash: '\u2013',
  hellip: '\u2026',
  rsquo: '\u2019',
  lsquo: '\u2018',
  ldquo: '\u201c',
  rdquo: '\u201d',
};

function decodeEntities(s) {
  return String(s).replace(/&(#x?[0-9A-Fa-f]+|[A-Za-z][A-Za-z0-9]*);/g, (whole, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    const key = body.toLowerCase();
    return Object.prototype.hasOwnProperty.call(ENTITIES, key) ? ENTITIES[key] : whole;
  });
}

/**
 * Visible text of an element's inner HTML: SVG and aria-hidden subtrees removed (they are
 * not part of the accessible name), tags stripped, entities decoded, whitespace collapsed.
 */
function visibleText(inner) {
  return decodeEntities(
    String(inner)
      .replace(/<svg\b[\s\S]*?<\/svg\s*>/gi, ' ')
      .replace(/<([A-Za-z][A-Za-z0-9:-]*)\b[^>]*\baria-hidden\s*=\s*["']?true["']?[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Lowercased, punctuation-trimmed anchor text for the generic-anchor blocklist. */
function anchorKey(text) {
  return String(text)
    .toLowerCase()
    .replace(/[\u2192\u00bb\u203a>]+/g, ' ')
    .replace(/[.,!:;\u2026]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** All <a> elements as { attrs, inner, text }. */
function extractAnchors(html) {
  const cleaned = stripScriptAndStyleBodies(html);
  const out = [];
  const re = /<a\b((?:\s+[^\s"'=<>`/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*>([\s\S]*?)<\/a\s*>/gi;
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    out.push({ attrs: parseAttrs(m[1]), inner: m[2], text: visibleText(m[2]) });
  }
  return out;
}

/** Concatenated inner HTML of every <footer> element on a page ('' when there is none). */
function footerHtml(html) {
  const cleaned = stripScriptAndStyleBodies(html);
  const re = /<footer\b[^>]*>([\s\S]*?)<\/footer\s*>/gi;
  let m;
  let out = '';
  while ((m = re.exec(cleaned)) !== null) out += m[1];
  return out;
}

/** True when the document declares id="value" (used to prove #fragment targets exist). */
function hasElementId(html, id) {
  if (!id) return false;
  const cleaned = stripScriptAndStyleBodies(html);
  const re = new RegExp('\\bid\\s*=\\s*(?:"' + escapeRe(id) + '"|\'' + escapeRe(id) + '\'|' + escapeRe(id) + '(?=[\\s>]))', 'i');
  return re.test(cleaned);
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ------------------------------------------------------------------ *
 * validateManifest
 * ------------------------------------------------------------------ */

/**
 * Structural validation of `routes[]` (and optionally `redirects[]`) from site.config.mjs.
 *
 * Detects: duplicate ids, duplicate paths, a parent id that does not exist, a route that
 * is its own parent, parent cycles, a path that does not start or end in '/', a path that
 * carries a query/fragment or an index.html, a path whose parent prefix does not match its
 * declared parent, a missing home route, unknown `group`/`changefreq`, an out-of-range
 * `priority`, non-boolean flags, missing title/navLabel/description, duplicate titles, and
 * title/description lengths outside the SEO window.
 *
 * With `opts.redirects` it also asserts every redirect target is an existing route path
 * ending in '/' (or such a path plus a #fragment), that no redirect shadows a real route,
 * that no redirect points at another redirect (a two-hop 301 chain), and that no 3xx
 * redirect targets a non-indexable route (a soft 404).
 *
 * @param {object[]} routes
 * @param {{redirects?: object[], strictLengths?: boolean}} [opts]
 *        strictLengths — report title/description length violations at '[error]' instead
 *        of '[warn]'. sync.mjs should pass it in --check mode so the manifest cannot regress.
 * @returns {string[]} problems, each prefixed '[error] ' or '[warn] '
 */
export function validateManifest(routes, opts = {}) {
  const problems = [];
  const err = (m) => problems.push('[error] ' + m);
  const warn = (m) => problems.push('[warn] ' + m);
  const lengthProblem = opts && opts.strictLengths ? err : warn;

  if (!Array.isArray(routes)) {
    err('routes is not an array');
    return problems;
  }
  if (routes.length === 0) {
    err('routes is empty');
    return problems;
  }

  const byId = new Map();
  const byPath = new Map();
  const byTitle = new Map();
  const byDescription = new Map();

  routes.forEach((r, i) => {
    const where = `routes[${i}]`;
    if (!r || typeof r !== 'object') {
      err(`${where}: not an object`);
      return;
    }

    const label = r.id ? `route '${r.id}'` : where;

    /* id */
    if (typeof r.id !== 'string' || r.id === '') {
      err(`${where}: missing or non-string id`);
    } else {
      if (byId.has(r.id)) err(`duplicate route id '${r.id}' (${where} and routes[${byId.get(r.id)}])`);
      else byId.set(r.id, i);
      if (!KEBAB_RE.test(r.id)) warn(`${label}: id is not kebab-case`);
    }

    /* path */
    if (typeof r.path !== 'string' || r.path === '') {
      err(`${label}: missing or non-string path`);
    } else {
      const p = r.path;
      if (!p.startsWith('/')) err(`${label}: path '${p}' must start with '/'`);
      if (!p.endsWith('/')) err(`${label}: path '${p}' must end with '/'`);
      if (/[?#]/.test(p)) err(`${label}: path '${p}' must not contain a query or fragment`);
      if (/\/\//.test(p)) err(`${label}: path '${p}' contains a doubled slash`);
      if (/\s/.test(p)) err(`${label}: path '${p}' contains whitespace`);
      if (/index\.html?$/i.test(p)) err(`${label}: path '${p}' must be a directory path, not a document`);
      if (p !== p.toLowerCase()) warn(`${label}: path '${p}' is not lowercase`);
      if (normalizePath(p) !== p) err(`${label}: path '${p}' is not canonical (expected '${normalizePath(p)}')`);
      if (byPath.has(p)) err(`duplicate route path '${p}' ('${r.id}' and '${routes[byPath.get(p)].id}')`);
      else byPath.set(p, i);
    }

    /* copy */
    if (typeof r.title !== 'string' || r.title.trim() === '') err(`${label}: missing title`);
    else {
      const t = r.title.trim();
      if (byTitle.has(t)) err(`duplicate title "${t}" ('${r.id}' and '${routes[byTitle.get(t)].id}')`);
      else byTitle.set(t, i);
      if (t.length > TITLE_MAX) lengthProblem(`${label}: title is ${t.length} chars (max ${TITLE_MAX})`);
      else if (t.length < TITLE_MIN) lengthProblem(`${label}: title is ${t.length} chars (min ${TITLE_MIN})`);
    }

    if (typeof r.navLabel !== 'string' || r.navLabel.trim() === '') err(`${label}: missing navLabel`);

    if (typeof r.description !== 'string' || r.description.trim() === '') err(`${label}: missing description`);
    else {
      const d = r.description.trim();
      if (byDescription.has(d)) warn(`duplicate description ('${r.id}' and '${routes[byDescription.get(d)].id}')`);
      else byDescription.set(d, i);
      if (d.length > DESC_MAX) lengthProblem(`${label}: description is ${d.length} chars (max ${DESC_MAX})`);
      else if (d.length < DESC_MIN) lengthProblem(`${label}: description is ${d.length} chars (min ${DESC_MIN})`);
    }

    if (typeof r.summary !== 'string' || r.summary.trim() === '') {
      warn(`${label}: missing summary (used by llms.txt, nav panels and related links)`);
    }
    if (!Array.isArray(r.keywords)) warn(`${label}: keywords is not an array`);

    /* sitemap + flags */
    if (typeof r.priority !== 'number' || !(r.priority >= 0 && r.priority <= 1)) {
      err(`${label}: priority must be a number between 0.0 and 1.0`);
    }
    if (typeof r.changefreq !== 'string' || !CHANGEFREQ.has(r.changefreq)) {
      err(`${label}: changefreq '${r.changefreq}' is not a valid sitemap value`);
    }
    for (const flag of ['inNav', 'inFooter', 'inSitemapXml', 'inLlms']) {
      if (typeof r[flag] !== 'boolean') err(`${label}: ${flag} must be a boolean`);
    }
    if (typeof r.group !== 'string' || !GROUPS.has(r.group)) {
      err(`${label}: group '${r.group}' is not one of ${[...GROUPS].join(' | ')}`);
    }
    if (r.icon !== null && typeof r.icon !== 'string') warn(`${label}: icon should be a navIcons key or null`);
  });

  /* parents: existence, self-reference, cycles, prefix agreement */
  for (const r of routes) {
    if (!r || typeof r !== 'object' || typeof r.id !== 'string') continue;
    const label = `route '${r.id}'`;
    const pid = r.parent === undefined ? null : r.parent;
    if (pid === null) continue;

    if (typeof pid !== 'string' || !byId.has(pid)) {
      err(`${label}: parent '${pid}' is not an existing route id`);
      continue;
    }
    if (pid === r.id) {
      err(`${label}: is its own parent`);
      continue;
    }

    const parent = routes[byId.get(pid)];
    if (typeof r.path === 'string' && typeof parent.path === 'string') {
      if (!r.path.startsWith(parent.path)) {
        err(`${label}: path '${r.path}' is not under its declared parent '${pid}' ('${parent.path}')`);
      } else {
        const depth = (s) => s.split('/').filter(Boolean).length;
        if (depth(r.path) !== depth(parent.path) + 1) {
          warn(`${label}: path '${r.path}' is ${depth(r.path) - depth(parent.path)} levels below parent '${pid}'`);
        }
      }
    }

    // cycle detection
    const seen = new Set([r.id]);
    let cursor = pid;
    while (typeof cursor === 'string' && byId.has(cursor)) {
      if (seen.has(cursor)) {
        err(`${label}: parent chain contains a cycle at '${cursor}'`);
        break;
      }
      seen.add(cursor);
      const next = routes[byId.get(cursor)].parent;
      cursor = next === undefined ? null : next;
    }
  }

  if (!byPath.has('/')) err("no route declares the home path '/'");

  /* redirects */
  const redirects = opts && Array.isArray(opts.redirects) ? opts.redirects : null;
  if (redirects) {
    const froms = new Map();
    const redirectSources = new Set();
    for (const rule of redirects) {
      if (rule && typeof rule.from === 'string') redirectSources.add(pathOf(rule.from));
    }

    redirects.forEach((rule, i) => {
      const where = `redirects[${i}]`;
      if (!rule || typeof rule !== 'object') {
        err(`${where}: not an object`);
        return;
      }
      const { from, to, status } = rule;

      if (typeof from !== 'string' || !from.startsWith('/')) {
        err(`${where}: from '${from}' must be a root-relative path`);
      } else {
        const key = pathOf(from);
        if (froms.has(key)) err(`${where}: duplicate redirect source '${from}' (also redirects[${froms.get(key)}])`);
        else froms.set(key, i);
        if (byPath.has(key)) err(`${where}: from '${from}' shadows the real route '${key}'`);
      }

      if (typeof status !== 'number' || !REDIRECT_STATUS.has(status)) {
        err(`${where}: status ${status} is not a valid redirect status`);
      }

      if (typeof to !== 'string' || !to.startsWith('/')) {
        err(`${where}: to '${to}' must be a root-relative path`);
        return;
      }
      const target = pathOf(to);
      if (!target.endsWith('/')) {
        err(`${where}: to '${to}' must end in '/' (canonical trailing-slash form)`);
      }
      if (normalizePath(to) !== to) {
        err(`${where}: to '${to}' is not canonical (expected '${normalizePath(to)}') — this is a 301 -> 301 chain`);
      }
      if (!byPath.has(target)) {
        err(`${where}: to '${to}' is not an existing route path`);
        return;
      }
      if (redirectSources.has(target)) {
        err(`${where}: to '${to}' is itself a redirect source — two-hop redirect chain`);
      }
      const targetRoute = routes[byPath.get(target)];
      if (targetRoute && targetRoute.inSitemapXml === false && typeof status === 'number' && status >= 300 && status < 400) {
        err(`${where}: ${status} to non-indexable '${target}' is a soft 404 — use status 404`);
      }
    });
  }

  return problems;
}

/* ------------------------------------------------------------------ *
 * extractLinks
 * ------------------------------------------------------------------ */

/**
 * Every root-relative link target in a document.
 *
 * Scans `href`, `src`, `srcset` (each candidate) and `action` (form submits) on every
 * element. Script and style BODIES are blanked first — their opening tags survive, so
 * `<script src="/assets/nav.js">` is still checked, but root-relative strings inside
 * JavaScript are not mistaken for links. Comments are dropped.
 *
 * Ignores anything that is not a site path: mailto:, tel:, http(s):, protocol-relative
 * '//host', data:, javascript: and bare '#fragment'.
 *
 * @param {string} html
 * @returns {{href: string, raw: string, attr: string}[]}
 *   raw  — the attribute value exactly as authored ('/about', '/assets/x.css?v=3')
 *   href — the same target after normalizePath ('/about/', '/assets/x.css?v=3')
 *   attr — 'href' | 'src' | 'srcset' | 'action'
 */
export function extractLinks(html) {
  const cleaned = stripScriptAndStyleBodies(html);
  const out = [];

  const take = (attr, value) => {
    const raw = String(value).trim();
    if (raw === '') return;
    if (!raw.startsWith('/')) return; // relative, absolute, scheme'd or fragment-only
    if (raw.startsWith('//')) return; // protocol-relative
    out.push({ href: normalizePath(raw), raw, attr });
  };

  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(cleaned)) !== null) {
    const attrs = parseAttrs(m[2]);
    for (const attr of ['href', 'src', 'action']) {
      if (attrs[attr] !== undefined) take(attr, decodeEntities(attrs[attr]));
    }
    if (attrs.srcset !== undefined) {
      for (const candidate of decodeEntities(attrs.srcset).split(',')) {
        const url = candidate.trim().split(/\s+/)[0];
        if (url && !url.startsWith('data:')) take('srcset', url);
      }
    }
  }

  return out;
}

/* ------------------------------------------------------------------ *
 * validateLinks
 * ------------------------------------------------------------------ */

/**
 * Cross-check every page's links against the route manifest.
 *
 * Errors:
 *   unknown-target      a root-relative link that is neither a route nor allowed — a future 404
 *   redirect-target     a link that would hit a redirect instead of the canonical target
 *   trailing-slash      trailing-slash / index.html drift ('/about' or '/about/index.html')
 *   absolute-internal   an internal link written as an absolute URL on our own origin
 *   generic-anchor      'Learn More' / 'Get Started' / 'Click Here' / 'Read More'
 *   empty-anchor        an <a> with no visible text and no aria-label/title
 *   label-in-name       aria-label that does not contain the visible text (WCAG 2.5.3)
 *   missing-fragment    '/page/#id' where the target page has no element with that id
 *   footer-coverage     a page whose <footer> omits a route flagged inFooter
 *   missing-footer      a page with no <footer> element at all
 *   unknown-page        a page whose own path is not in the manifest
 *
 * Warnings:
 *   noindex-target      a link to a route with inSitemapXml === false (e.g. /404/)
 *   missing-page        a manifest route with no rendered page (error with expectAllRoutes)
 *
 * @param {{path: string, html: string}[]} pages
 * @param {import('./routes.mjs').buildGraph extends never ? object : object} graph
 * @param {{site?: object, origin?: string, redirects?: object[],
 *          checkFooterCoverage?: boolean, checkAnchorText?: boolean,
 *          genericAnchorText?: Iterable<string>, expectAllRoutes?: boolean,
 *          extraAllowedPaths?: Iterable<string>}} [opts]
 * @returns {{level: 'error'|'warn', page: string, message: string, rule: string, href?: string}[]}
 */
export function validateLinks(pages, graph, opts = {}) {
  const problems = [];
  const list = Array.isArray(pages) ? pages : [];
  const o = opts || {};

  const add = (level, page, rule, message, href) => {
    const p = { level, page, message, rule };
    if (href !== undefined) p.href = href;
    problems.push(p);
  };

  const byPath = (graph && graph.byPath) || new Map();
  const origin = String((o.origin || (o.site && o.site.origin) || '')).trim().replace(/\/+$/, '');

  const allowed = new Set(EXTRA_ALLOWED_PATHS);
  if (o.extraAllowedPaths) for (const p of o.extraAllowedPaths) allowed.add(String(p));

  const generic = new Set(
    [...(o.genericAnchorText || GENERIC_ANCHOR_TEXT)].map((t) => anchorKey(t))
  );

  // redirect sources, keyed by both the authored and the normalised path
  const redirectByPath = new Map();
  if (Array.isArray(o.redirects)) {
    for (const rule of o.redirects) {
      if (!rule || typeof rule.from !== 'string') continue;
      redirectByPath.set(rule.from, rule);
      redirectByPath.set(pathOf(rule.from), rule);
    }
  }

  const pageByPath = new Map();
  for (const page of list) {
    if (page && typeof page.path === 'string') {
      const p = pathOf(page.path);
      if (!pageByPath.has(p)) pageByPath.set(p, page);
    }
  }

  const footerRoutes = [];
  for (const r of byPath.values()) if (r && r.inFooter === true) footerRoutes.push(r);

  const checkFooter = o.checkFooterCoverage !== false;
  const checkAnchors = o.checkAnchorText !== false;

  for (const page of list) {
    if (!page || typeof page.html !== 'string') continue;
    const pagePath = pathOf(typeof page.path === 'string' ? page.path : '/');

    if (!byPath.has(pagePath)) {
      add('error', pagePath, 'unknown-page', `page '${pagePath}' is not a route in the manifest`);
    }

    /* --- link targets --------------------------------------------- */
    for (const link of extractLinks(page.html)) {
      const target = pathOf(link.href);
      const fragment = fragmentOf(link.href);
      const rawPath = link.raw.split('#')[0].split('?')[0];

      const isRoute = byPath.has(target);
      const isExtra = isExtraAllowed(target, allowed);

      // trailing-slash / index.html drift: the authored path is not how we spell it
      if (rawPath !== '' && rawPath !== target && (isRoute || isExtra)) {
        add(
          'error',
          pagePath,
          'trailing-slash',
          `${link.attr}="${link.raw}" drifts from the canonical spelling '${target}'`,
          link.raw
        );
      }

      if (!isRoute && !isExtra) {
        const redirect = redirectByPath.get(link.raw) || redirectByPath.get(rawPath) || redirectByPath.get(target);
        if (redirect) {
          add(
            'error',
            pagePath,
            'redirect-target',
            `${link.attr}="${link.raw}" hits the ${redirect.status} redirect to '${redirect.to}' — link the canonical target directly`,
            link.raw
          );
        } else {
          add(
            'error',
            pagePath,
            'unknown-target',
            `${link.attr}="${link.raw}" is neither a route nor an allowed path — it would 404`,
            link.raw
          );
        }
        continue;
      }

      if (isRoute) {
        const targetRoute = byPath.get(target);
        // A page linking to itself is not an inbound link to a noindex route.
        if (targetRoute && targetRoute.inSitemapXml === false && target !== pagePath) {
          add(
            'warn',
            pagePath,
            'noindex-target',
            `${link.attr}="${link.raw}" links to non-indexable route '${target}'`,
            link.raw
          );
        }
        if (fragment) {
          const targetPage = pageByPath.get(target);
          if (targetPage && typeof targetPage.html === 'string' && !hasElementId(targetPage.html, fragment)) {
            add(
              'error',
              pagePath,
              'missing-fragment',
              `${link.attr}="${link.raw}" points at #${fragment}, which does not exist on '${target}'`,
              link.raw
            );
          }
        }
      }
    }

    /* --- absolute internal links ---------------------------------- *
     * Navigational links only. <link rel="canonical">, <link rel="alternate" hreflang>,
     * <link rel="sitemap"> and <meta content="…"> are REQUIRED to be absolute — flagging
     * them would fail every build (the export carries 53 such tags, all correct).        */
    if (origin) {
      const cleaned = stripScriptAndStyleBodies(page.html);
      TAG_RE.lastIndex = 0;
      let tm;
      while ((tm = TAG_RE.exec(cleaned)) !== null) {
        const tag = String(tm[1]).toLowerCase();
        if (tag === 'link' || tag === 'meta' || tag === 'base') continue;
        const attrs = parseAttrs(tm[2]);
        for (const attr of ['href', 'src', 'action']) {
          const value = attrs[attr];
          if (value === undefined) continue;
          const v = decodeEntities(value).trim();
          if (v !== origin && !v.startsWith(origin + '/') && !v.startsWith(origin + '?') && !v.startsWith(origin + '#')) continue;
          add(
            'error',
            pagePath,
            'absolute-internal',
            `<${tag} ${attr}="${v}"> is an internal link written as an absolute URL — use the root-relative form`,
            v
          );
        }
      }
    }

    /* --- anchor text ---------------------------------------------- */
    if (checkAnchors) {
      for (const a of extractAnchors(page.html)) {
        const href = a.attrs.href;
        if (href === undefined) continue;
        if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;

        const label = a.attrs['aria-label'] ? decodeEntities(a.attrs['aria-label']).trim() : '';
        const title = a.attrs.title ? decodeEntities(a.attrs.title).trim() : '';
        const text = a.text;
        const key = anchorKey(text);

        if (key !== '' && generic.has(key)) {
          add(
            'error',
            pagePath,
            'generic-anchor',
            `anchor text "${text}" says nothing about its destination (href="${href}") — name the destination`,
            href
          );
        }
        if (key === '' && label === '' && title === '') {
          add('error', pagePath, 'empty-anchor', `<a href="${href}"> has no visible text and no accessible name`, href);
        }
        if (key !== '' && label !== '' && !anchorKey(label).includes(key)) {
          add(
            'error',
            pagePath,
            'label-in-name',
            `aria-label="${label}" does not contain the visible text "${text}" (WCAG 2.5.3) — fix the text, not the ARIA`,
            href
          );
        }
      }
    }

    /* --- footer coverage ------------------------------------------ */
    if (checkFooter && footerRoutes.length > 0) {
      const fh = footerHtml(page.html);
      if (fh === '') {
        add('error', pagePath, 'missing-footer', 'page has no <footer> element, so it links no footer routes');
      } else {
        const linked = new Set(extractLinks(fh).map((l) => pathOf(l.href)));
        const missing = footerRoutes.map((r) => pathOf(r.path)).filter((p) => !linked.has(p));
        if (missing.length > 0) {
          add(
            'error',
            pagePath,
            'footer-coverage',
            `footer omits ${missing.length} route(s) flagged inFooter: ${missing.join(', ')}`
          );
        }
      }
    }
  }

  /* --- every route rendered? --------------------------------------- */
  for (const [path, route] of byPath) {
    if (pageByPath.has(path)) continue;
    add(
      o.expectAllRoutes === true ? 'error' : 'warn',
      path,
      'missing-page',
      `route '${route && route.id}' has no rendered page`
    );
  }

  return problems;
}

/* ------------------------------------------------------------------ *
 * findOrphans
 * ------------------------------------------------------------------ */

/**
 * Routes that no other page links to.
 *
 * A self-link does not make a page discoverable, so it does not count. The home route is
 * never an orphan (it is the entry point), and non-indexable routes (inSitemapXml === false,
 * i.e. /404/) are excluded — /404/ is expected to have no inbound links once it is dropped
 * from the HTML sitemap.
 *
 * @param {{path: string, html: string}[]} pages
 * @param {object} graph
 * @returns {string[]} route ids, in manifest order
 */
export function findOrphans(pages, graph) {
  const list = Array.isArray(pages) ? pages : [];
  const byPath = (graph && graph.byPath) || new Map();
  const byId = (graph && graph.byId) || new Map();

  const linked = new Set();
  for (const page of list) {
    if (!page || typeof page.html !== 'string') continue;
    const self = pathOf(typeof page.path === 'string' ? page.path : '/');
    for (const link of extractLinks(page.html)) {
      const target = pathOf(link.href);
      if (target === self) continue;
      linked.add(target);
    }
  }

  const orphans = [];
  for (const route of byId.values()) {
    if (!route || typeof route.path !== 'string') continue;
    const p = pathOf(route.path);
    if (p === '/') continue;
    if (route.inSitemapXml === false) continue;
    if (!byPath.has(p)) continue;
    if (!linked.has(p)) orphans.push(route.id);
  }
  return orphans;
}
