#!/usr/bin/env node
/**
 * build/sync.mjs — the build orchestrator.
 *
 * Zero npm dependencies. Node >= 18. ESM. Imports only `node:fs`, `node:path`
 * and `node:url`, plus the first-party modules under build/lib/.
 *
 *   node build/sync.mjs [--src DIR] [--out DIR] [--check]
 *
 * Contract order (CONTRACT.md, "build/sync.mjs"):
 *   validate manifest -> read src pages -> transform each -> render artifacts ->
 *   write dist -> validate links against the manifest -> precompress ->
 *   print a summary table.
 *
 * `--check` validates and writes NOTHING, exiting non-zero on any error-level
 * problem. Two extra flags are additive and never change the behaviour of the
 * three above: `--report` re-measures an existing dist and prints only the
 * compression table, and `--help` prints usage.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS FILE OWNS THAT NO OTHER MODULE DOES
 * ---------------------------------------------------------------------------
 * The module contract splits the work cleanly, but three seams fall between the
 * declared modules and land here. Each is implemented as a small, named,
 * documented step so it shows up in the per-page "passes" column exactly like a
 * html.mjs pass does:
 *
 *  1. `head-tags` — render.mjs::renderHeadTags() builds the whole <head>
 *     metadata block (charset, viewport, title, description, robots, canonical,
 *     hreflang, preconnect, the two font preloads, the full Open Graph and
 *     Twitter sets, and the per-page JSON-LD graph), but NO html.mjs pass
 *     installs it. This file strips the export's own metadata set out of <head>
 *     and puts the rendered one in its place, then appends the single
 *     Organization + WebSite JSON-LD block from artifacts.mjs::organizationJsonLd
 *     so the identical bytes appear on every page.
 *
 *  2. `stamp-assets` — nav.js resolves its lazily-loaded siblings from its own
 *     script tag ("Keeping the URL on nav.js's tag means sync.mjs stamps the
 *     hashed filename in one place" — src/assets/js/nav.js:324). ssr-chrome
 *     emits that tag from ctx.assets.navJsHref but writes no data-* on it, and
 *     html.mjs's lazy-modal only stamps data-modal-src. This step stamps
 *     data-search-src and data-search-index (and data-modal-src if lazy-modal
 *     could not), so no hashed filename is ever hard-coded in a .js file.
 *
 *  3. the CSS assembly. css.mjs exposes the primitives; the ORDER they are
 *     composed in is a property of the emitted document, so it lives here. The
 *     order below is load-bearing and is spelled out verbatim in the header of
 *     src/assets/css/critical.css:
 *
 *         <style>  fonts.css @font-face
 *                  + critical.css
 *                  + splitCritical(this page's own CSS).critical
 *                  + splitCritical(this page's own CSS).deferred
 *         <link>   /assets/site.<hash>.css                    (non-blocking)
 *
 *     The site sheet MUST come after the page's own rules: mega-menu.css's
 *     trailing "SITE-WIDE DESIGN SYSTEM OVERRIDES" block deliberately beats the
 *     page blocks on equal specificity (`section.sec,.sec{padding-top:88px}`
 *     over the home page's own `section.sec{padding:100px 0}` — 88px is what
 *     renders today). Reversing the two changes every section on the site.
 *
 *     css.mjs::dedupe() runs over all 21 pages' own CSS first. Its output
 *     `shared` is prepended to the site sheet (as src/assets/css/site.css's
 *     header requires) and only the residual stays inline, which is what
 *     retires the measured 43,351 B of byte-identical duplicated <style>.
 *     dedupe()'s cascade guard is what makes this safe: it refuses to hoist any
 *     selector that has two different definitions site-wide, so the il* classes
 *     that mean different things on different pages (il13, il15, il23, il25,
 *     il30, il33) can never be merged.
 *
 * ---------------------------------------------------------------------------
 * MEASUREMENT DISCIPLINE
 * ---------------------------------------------------------------------------
 * Every number this program prints is measured by this program, from bytes it
 * just produced. The only figures quoted from elsewhere are labelled as such
 * and come from BRIEF.md / lh-mobile.json (Lighthouse 12.8.2 mobile:
 * Perf 99 / A11y 91 / BP 96 / SEO 92, 903 DOM elements). Nothing is projected.
 */

import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/* ===================================================================== *
 * 0. Paths and constants
 * ===================================================================== */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/**
 * Candidate source directories, first hit wins.
 *
 * Vendor the Website Studio export at src/source-export/ and it is found with
 * no flag; keep it anywhere else and pass --src DIR. An earlier revision also
 * listed an absolute path from the machine this was developed on, which worked
 * there and nowhere else — a build that silently succeeds for one person and
 * fails for everyone else is worse than one that asks for --src.
 */
const SRC_CANDIDATES = [
  path.join(ROOT, 'src', 'source-export'),
];

const DEFAULT_OUT = path.join(ROOT, 'dist');

/** Files copied verbatim from the source export into dist. */
const PASSTHROUGH = [
  { from: 'favicon.ico', to: 'favicon.ico', kind: 'file' },
  // NOT copied: assets/404/ — the /404/ page's own legacy bundle from the
  // Website Studio builder (route.5fb2523d0a44.css, a second copy of
  // mega-menu.js and consultation-modal.js, and 15 wordmark/brand-icon
  // variants). 290,741 B across 18 files.
  //
  // It became dead weight in this build rather than being dropped on a hunch:
  // inline-critical-css removes every /assets/*.css stylesheet link, which
  // takes route.5fb2523d0a44.css off /404/, and the 15 images were only ever
  // reachable from inside that CSS. Verified before removing that /404/ still
  // renders styled — all 16 classes its <main> uses are defined in the inline
  // critical block or site.css — and the asset cross-reference pass reports
  // every one of the 18 as unreferenced.
  //
  // The one file still needed from it, the 96px brand icon the consultation
  // modal paints at 28x28, was copied into src/assets/img/ instead, so it
  // ships as a first-party hashed asset.
  //
  // If a future change genuinely references something here, the
  // unreferenced-asset check will not catch it — re-add the entry.
];

/** First-party JS shipped from src/assets/js/, in emission order. */
const JS_ASSETS = [
  { file: 'nav.js', key: 'navJsHref', required: true },
  { file: 'analytics.js', key: 'analyticsJsHref', required: true },
  { file: 'search.js', key: 'searchJsHref', required: true },
  { file: 'consult-modal.js', key: 'consultLoaderHref', required: true },
  // The heavy wizard the loader fetches on first intent. Optional: it is the
  // export's book-consultation-modal.js minus the 32,626 B base64 PNG
  // (JSCSS-01) and is not authored by this module.
  { file: 'book-consultation-modal.js', key: 'modalJsHref', required: false },
];

/** A content-hashed filename: `name.<8 hex>.ext`. Enforced under /assets/. */
/**
 * `name.<hash>.ext` — the shape that makes `immutable` caching safe.
 *
 * The hex run is 8-32 chars, not a fixed 8, because two producers write into
 * /assets/ and they disagree on length: css.mjs::hashName emits 8
 * (site.2e0bf98e.css) while the Website Studio builder emits 12
 * (wordmark-1200.9b009f7cd2e5.avif, carried over in /assets/404/). Pinning this
 * to 8 flagged all 18 of the export's own hashed assets as unhashed and failed
 * the build — a false positive that would have been "fixed" by weakening the
 * assertion, which is the one thing that must not happen: this check is the
 * only thing standing between a year of `immutable` and a stale asset nobody
 * can flush.
 */
const HASHED_RE = /\.[0-9a-f]{8,32}\.[a-z0-9]+$/i;

/** Extensions handed to compress.mjs::precompress. */
const COMPRESS_EXTS = ['.html', '.css', '.js', '.txt', '.xml', '.json'];

/**
 * Query-expansion table and the six search suggestion chips, transcribed
 * VERBATIM from the export's assets/mega-menu.js (SYNONYMS at line 233,
 * SEARCH_SUGGESTIONS at line 216). They are editorial content, not derived
 * data, so they are carried over rather than invented. Everything else in the
 * search index is generated from routes[].
 */
const SEARCH_SYNONYMS = {
  monitoring: ['monitor', 'track', 'tracking', 'alert', 'dashboard', 'real-time', 'ovatools'],
  compliance: ['regulatory', 'regulation', 'fda', 'clia', 'cap', 'aabb', 'audit', 'accreditation'],
  staff: ['staffing', 'embryologist', 'hcld', 'hire', 'hiring', 'placement', 'temporary', 'ts abb'],
  gpo: ['purchasing', 'vendor', 'contract', 'savings', 'discount', 'supplies'],
  marketing: ['patient', 'acquisition', 'digital', 'seo', 'advertising', 'brand'],
  hr: ['human resources', 'recruitment', 'onboarding', 'employee'],
  finance: ['accounting', 'financial', 'budget', 'revenue', 'billing'],
  insurance: ['risk', 'liability', 'coverage', 'protection'],
  lab: ['laboratory', 'ivf', 'art', 'embryology'],
  design: ['build', 'construction', 'renovation', 'layout'],
  contact: ['schedule', 'consultation', 'phone', 'call', 'email', 'reach'],
};

const SEARCH_SUGGESTIONS = [
  { label: 'IVF lab monitoring', query: 'real-time monitoring OvaTools' },
  { label: 'GPO purchasing savings', query: 'group purchasing vendor contracts' },
  { label: 'Staffing embryologists', query: 'certified embryologist staffing' },
  { label: 'Regulatory compliance', query: 'FDA CLIA CAP compliance' },
  { label: 'Practice development', query: 'lab design practice development' },
  { label: 'Schedule consultation', query: 'schedule consultation contact' },
];

/** routes[].group -> the human label the export's SEARCH_INDEX used. */
const GROUP_SECTION = {
  main: 'Services',
  'lab-solutions': 'Lab Solutions',
  'management-services': 'Management',
  legal: 'Legal',
  system: 'Site',
};

/* ===================================================================== *
 * 1. Tiny formatting helpers — ASCII only, no ANSI colour.
 *
 * Colour codes survive a terminal but become literal escape garbage in a CI
 * log, a piped file or a GitHub Actions summary, so this program never emits
 * one. Alignment is done with spaces, which render identically everywhere.
 * ===================================================================== */

const out = [];
function say(line = '') {
  out.push(line);
  console.log(line);
}

function num(v) {
  const x = Number(v);
  if (!Number.isFinite(x)) return '—';
  return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function signed(v) {
  const x = Math.round(Number(v) || 0);
  if (x === 0) return '0';
  return (x > 0 ? '+' : '-') + num(Math.abs(x));
}

function padR(s, w) {
  const str = String(s);
  return str.length >= w ? str : str + ' '.repeat(w - str.length);
}

function padL(s, w) {
  const str = String(s);
  return str.length >= w ? str : ' '.repeat(w - str.length) + str;
}

/**
 * Render a table. `align` is a string of 'l'/'r' per column.
 * Columns are sized to their widest cell, so nothing ever wraps mid-number.
 */
function table(headers, rows, align, indent = '  ') {
  const all = [headers, ...rows].map((r) => r.map((c) => String(c === undefined || c === null ? '' : c)));
  const widths = headers.map((_, i) => Math.max(...all.map((r) => (r[i] || '').length)));
  const line = (cells) =>
    indent +
    cells
      .map((c, i) => (align[i] === 'r' ? padL(c, widths[i]) : padR(c, widths[i])))
      .join('  ')
      .replace(/\s+$/, '');
  const rule = indent + widths.map((w) => '-'.repeat(w)).join('  ');
  return [line(all[0]), rule, ...all.slice(1).map(line)].join('\n');
}

/**
 * Soft-wrap a long sentence to `width` columns, continuation lines indented.
 * Long problem messages are printed with this rather than squeezed into a table
 * cell: a single 400-character message would otherwise stretch the column rule
 * across the whole log and make every other row unreadable.
 */
function wrap(text, width, indent) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (line === '') line = w;
    else if ((line + ' ' + w).length <= width) line += ' ' + w;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.map((l, i) => (i === 0 ? l : indent + l));
}

function heading(text) {
  say('');
  say(text);
  say('='.repeat(text.length));
}

/* ===================================================================== *
 * 2. Problem collection
 *
 * Nothing in this file throws at the caller. Every failure becomes a Problem
 * with a level, a scope and a readable sentence; the process prints them all
 * and exits 1 at the end. A build that dies on its first stack trace tells you
 * about one bug; a build that reports every problem it found tells you about
 * all of them.
 * ===================================================================== */

const problems = [];

/**
 * Warnings that repeat verbatim across pages, keyed by scope+message.
 * A pass that warns identically on all 21 pages is ONE finding, not 21 lines of
 * scrollback, so they are collapsed into a single row carrying the page count
 * and a few examples.
 */
const repeated = new Map();

function repeatedWarn(scope, key, page) {
  if (!repeated.has(key)) repeated.set(key, { scope, pages: [] });
  repeated.get(key).pages.push(page);
}

/** Fold the collapsed warnings into `problems`, in first-seen order. */
function flushRepeated(totalPages) {
  for (const [key, { scope, pages }] of repeated) {
    const shown = pages.slice(0, 3).join(', ');
    const more = pages.length > 3 ? `, +${pages.length - 3} more` : '';
    warnAt(scope, `${key} — on ${pages.length}/${totalPages} pages (${shown}${more})`);
  }
  repeated.clear();
}

function problem(level, scope, message) {
  problems.push({ level, scope, message: String(message) });
}
const errorAt = (scope, message) => problem('error', scope, message);
const warnAt = (scope, message) => problem('warn', scope, message);

function errorCount() {
  return problems.filter((p) => p.level === 'error').length;
}

/** Turn any thrown value into one readable line — never a stack trace. */
function reason(err) {
  if (!err) return 'unknown error';
  if (err instanceof Error) {
    let msg = err.message || String(err);
    if (err.code === 'ENOENT' && err.path) msg = 'file not found: ' + err.path;
    else if (err.code === 'EACCES' && err.path) msg = 'permission denied: ' + err.path;
    return msg;
  }
  return String(err);
}

/* ===================================================================== *
 * 3. CLI
 * ===================================================================== */

const USAGE = `
mtfs-website-studio build

  node build/sync.mjs [--src DIR] [--out DIR] [--check] [--report] [--help]

  --src DIR    source export to read the 21 pages from
               (default: the first of ${SRC_CANDIDATES.map((p) => p.replace(ROOT + path.sep, '')).join(', ')} that exists)
  --out DIR    build output directory (default: ${path.relative(ROOT, DEFAULT_OUT)})
  --check      validate only: write nothing, exit non-zero on any error
  --report     re-measure an existing --out and print only the compression table
  --help       this text

Exit codes
  0  success
  1  one or more error-level problems (see the PROBLEMS section)
  2  the build could not start (a build/lib module is missing or does not parse)
`.trim();

function parseArgs(argv) {
  const opts = { src: null, out: DEFAULT_OUT, check: false, report: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') opts.check = true;
    else if (a === '--report') opts.report = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--src' || a === '--out') {
      const value = argv[++i];
      if (value === undefined || value.startsWith('--')) {
        errorAt('cli', `${a} needs a directory argument`);
        continue;
      }
      opts[a.slice(2)] = path.resolve(process.cwd(), value);
    } else if (a.startsWith('--src=')) opts.src = path.resolve(process.cwd(), a.slice(6));
    else if (a.startsWith('--out=')) opts.out = path.resolve(process.cwd(), a.slice(6));
    else errorAt('cli', `unknown argument '${a}' (try --help)`);
  }
  return opts;
}

async function isDir(p) {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

async function readIfPresent(file) {
  try {
    return await readFile(file, 'utf8');
  } catch (err) {
    if (err && err.code === 'ENOENT') return null;
    throw err;
  }
}

/* ===================================================================== *
 * 4. Module loading
 *
 * Every first-party module is imported dynamically so a missing or unparsable
 * one is reported by name instead of crashing the process with a resolver
 * stack trace. The build then reports everything it still can before exiting.
 * ===================================================================== */

async function loadModule(relPath) {
  const abs = path.join(ROOT, relPath);
  try {
    return { ok: true, mod: await import(pathToFileURL(abs).href) };
  } catch (err) {
    const code = err && err.code;
    if (code === 'ERR_MODULE_NOT_FOUND' || code === 'ENOENT') {
      return { ok: false, missing: true, error: `${relPath} does not exist yet` };
    }
    return { ok: false, missing: false, error: `${relPath} failed to load: ${reason(err)}` };
  }
}

/**
 * Assert a module exports every name the contract declares. A module that
 * loads but is missing an export is a far more confusing failure than one that
 * is absent, so it is named explicitly.
 */
function requireExports(mod, relPath, names) {
  const missing = names.filter((n) => mod[n] === undefined);
  if (missing.length) {
    errorAt('modules', `${relPath} is missing contract export(s): ${missing.join(', ')}`);
  }
  return missing.length === 0;
}

/* ===================================================================== *
 * 5. HTML helpers owned by the orchestrator
 * ===================================================================== */

/** Attribute-run fragment, quote-aware. Same shape html.mjs uses. */
const ATTRS = '(?:"[^"]*"|\'[^\']*\'|[^>"\'])*';

const MASK_A = '\u0001';
const MASK_B = '\u0002';

/**
 * Replace <script>, <style> and comments with opaque tokens so an
 * attribute-level regex can never reach inside JavaScript, CSS or a comment.
 * Per the HTML spec a <script> ends at the first "</script", so the non-greedy
 * match is the parser's own rule, not a heuristic.
 */
function mask(html) {
  const chunks = [];
  const re = new RegExp(
    ['<!--[\\s\\S]*?-->', '<(script|style)\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>'].join('|'),
    'gi'
  );
  const text = html.replace(re, (raw) => {
    chunks.push(raw);
    return MASK_A + (chunks.length - 1) + MASK_B;
  });
  return { text, chunks };
}

function unmask(text, chunks) {
  return text.replace(new RegExp(MASK_A + '(\\d+)' + MASK_B, 'g'), (_, i) => chunks[Number(i)]);
}

/** Read one attribute out of an attribute run. Returns null when absent. */
function attrOf(attrs, name) {
  const re = new RegExp('\\b' + name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\'|([^\\s"\'>]+))', 'i');
  const m = re.exec(attrs);
  if (m) return m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
  return new RegExp('\\b' + name + '\\b(?!\\s*=)', 'i').test(attrs) ? '' : null;
}

function escAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Pull every <style> block's CSS out of a document.
 * Used before `transform()`, because html.mjs's inline-critical-css pass
 * DELETES those blocks — the CSS has to be captured first or the design is
 * lost. Returns the concatenated CSS and the block count.
 */
function extractStyleCss(html) {
  const re = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
  const parts = [];
  let m;
  while ((m = re.exec(html)) !== null) parts.push(m[1]);
  return { css: parts.join('\n'), count: parts.length };
}

/** <meta name="..."> values the rendered head replaces. Anything else survives. */
const REPLACED_META_NAMES = new Set([
  'description',
  'robots',
  'googlebot',
  'bingbot',
  'keywords',
  'viewport',
  'author',
  'geo.region',
  'geo.placename',
  'geo.position',
  'icbm',
]);

/** <link rel="..."> values the rendered head replaces. */
const REPLACED_LINK_RELS = new Set([
  'canonical',
  'alternate',
  'preload',
  'preconnect',
  'dns-prefetch',
  'prefetch',
  'prerender',
  'modulepreload',
]);

/**
 * Pull hand-authored JSON-LD out of a source document's <head> so `head-tags`
 * can reinstate it after wiping the rest.
 *
 * Only the @types named in `keep` are carried. Everything else is regenerated
 * from the manifest and must NOT survive, or the build would emit two of each
 * node and reintroduce exactly the @id conflicts the audit found (18 pages
 * referencing an #organization that 3 pages defined, with 2 different shapes).
 *
 * @param {string} html   the source document
 * @param {string[]} keep @type values to preserve, e.g. ['FAQPage']
 * @returns {{blocks: string[], types: string[]}}
 */
function carryForwardJsonLd(html, keep) {
  const blocks = [];
  const types = [];
  const headMatch = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html || '');
  if (!headMatch) return { blocks, types };
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(headMatch[1])) !== null) {
    let parsed;
    try {
      parsed = JSON.parse(m[1]);
    } catch {
      continue; // malformed JSON-LD in the source is not this build's to repair
    }
    const nodes = Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed];
    const hit = nodes.find((n) => {
      const t = n && n['@type'];
      const list = Array.isArray(t) ? t : [t];
      return list.some((x) => keep.indexOf(x) !== -1);
    });
    if (!hit) continue;
    // Re-serialise rather than reusing the raw source text: it strips the
    // builder's data-lps-eid attribute from the <script> tag and normalises
    // whitespace, so the output is byte-stable across builds.
    blocks.push(
      '<script type="application/ld+json">' + JSON.stringify(parsed) + '</script>'
    );
    const t = hit['@type'];
    types.push(Array.isArray(t) ? t.join('+') : String(t));
  }
  return { blocks, types };
}

/**
 * STEP `head-tags` — install the rendered <head> metadata block.
 *
 * Removes, from inside <head> only:
 *   - every <title>
 *   - <meta charset>, and <meta name> in REPLACED_META_NAMES
 *   - every <meta property="og:*|twitter:*|fb:*"> and <meta name="twitter:*|og:*">
 *   - <link rel> in REPLACED_LINK_RELS
 *   - every <script type="application/ld+json"> block
 * and prepends `headHtml`.
 *
 * Deliberately KEPT: <link rel="icon">, <link rel="manifest">,
 * <link rel="stylesheet"> (inline-critical-css owns those), <base>, every
 * http-equiv meta that is not a cache directive (strip-nocache-meta owns those
 * three), the inline GTM snippet (dedupe-gtm owns it), the inline LPS tracker
 * (defer-third-party owns it), and any meta this list does not name — so a
 * theme-color or a verification token added later is never silently dropped.
 */
function applyHeadTags(html, headHtml) {
  const notes = [];
  const openM = /<head\b[^>]*>/i.exec(html);
  if (!openM) return { html, notes: ['WARNING: no <head> — rendered head tags not installed'] };
  const start = openM.index + openM[0].length;
  const closeIdx = html.toLowerCase().indexOf('</head', start);
  if (closeIdx === -1) return { html, notes: ['WARNING: unterminated <head> — head tags not installed'] };

  let head = html.slice(start, closeIdx);

  // (a) JSON-LD first, while <script> bodies are still visible.
  let jsonLd = 0;
  head = head.replace(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script\s*>/gi,
    () => {
      jsonLd++;
      return '';
    }
  );

  // (b) everything else runs over a masked head, so no regex can enter a
  //     <script> or <style> body.
  const masked = mask(head);
  let text = masked.text;
  let titles = 0;
  let metas = 0;
  let links = 0;

  text = text.replace(/<title\b[^>]*>[\s\S]*?<\/title\s*>/gi, () => {
    titles++;
    return '';
  });

  text = text.replace(new RegExp('<meta\\b(' + ATTRS + ')>', 'gi'), (tag, attrs) => {
    if (attrOf(attrs, 'charset') !== null) {
      metas++;
      return '';
    }
    const property = (attrOf(attrs, 'property') || '').trim().toLowerCase();
    const name = (attrOf(attrs, 'name') || '').trim().toLowerCase();
    const social = (v) => v.startsWith('og:') || v.startsWith('twitter:') || v.startsWith('fb:');
    if (social(property) || social(name) || REPLACED_META_NAMES.has(name)) {
      metas++;
      return '';
    }
    return tag;
  });

  text = text.replace(new RegExp('<link\\b(' + ATTRS + ')>', 'gi'), (tag, attrs) => {
    const rels = (attrOf(attrs, 'rel') || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (rels.some((r) => REPLACED_LINK_RELS.has(r))) {
      links++;
      return '';
    }
    return tag;
  });

  head = unmask(text, masked.chunks).replace(/^[ \t]*\r?\n/gm, '');

  notes.push(
    `replaced the export's own head metadata (${titles} <title>, ${metas} <meta>, ` +
      `${links} <link>, ${jsonLd} JSON-LD block(s)) with renderHeadTags() output`
  );
  return { html: html.slice(0, start) + headHtml + head + html.slice(closeIdx), notes };
}

/**
 * STEP `stamp-assets` — put the hashed sibling URLs on the nav <script> tag.
 *
 * nav.js and search.js both resolve their corpus and each other from
 * `data-search-index` / `data-search-src`, falling back to the unhashed
 * defaults `/search-index.json` and `/assets/search.js`. Those defaults must
 * never be what ships: everything under /assets/ is served
 * `Cache-Control: immutable` for a year, which is only honest for
 * content-hashed names. Stamping them here keeps every hashed filename in one
 * place and out of the .js sources.
 */
function stampAssets(html, assets) {
  const notes = [];
  if (!assets.navJsHref) return { html, notes };

  const wanted = [
    ['data-search-src', assets.searchJsHref],
    ['data-search-index', assets.searchIndexHref],
    ['data-modal-src', assets.modalJsHref],
  ].filter(([, v]) => Boolean(v));

  let stamped = 0;
  let navTagEnd = -1;
  const re = new RegExp('<script\\b(' + ATTRS + ')>', 'gi');
  let result = '';
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    if ((attrOf(m[1], 'src') || '') !== assets.navJsHref) continue;
    let add = '';
    for (const [name, value] of wanted) {
      if (attrOf(m[1], name) === null) add += ` ${name}="${escAttr(value)}"`;
    }
    if (add) stamped++;
    result += html.slice(last, m.index) + '<script' + m[1] + add + '>';
    last = m.index + m[0].length;
    navTagEnd = result.length;
  }
  result += html.slice(last);

  if (stamped) notes.push(`stamped ${wanted.map(([n]) => n).join(', ')} onto the nav <script>`);
  else if (navTagEnd === -1) notes.push(`WARNING: no <script src="${assets.navJsHref}"> to stamp asset URLs onto`);

  /* ------------------------------------------------------------------
   * The consultation-modal INTENT LOADER.
   *
   * src/assets/js/consult-modal.js is a ~9 KB loader that watches for the
   * three selectors the shipped code binds ('[data-open-consult], .mm-cta,
   * .open-consult-modal'), the #consult hash, and an idle warm-up, then fetches
   * the real wizard from its own `data-modal-src`. Nothing else in the pipeline
   * emits a tag for it: html.mjs's lazy-modal stamps data-modal-src onto the
   * NAV script, and nav.js does not read that attribute. Without the tag below
   * the loader is dead weight and every "Book a Consultation" CTA does nothing.
   *
   * It is emitted here, next to the nav script, with `defer` and its own
   * data-modal-src — and only when the document does not already carry it, so
   * if a pass starts emitting the tag this step becomes a no-op instead of a
   * duplicate.
   * ------------------------------------------------------------------ */
  if (assets.consultLoaderHref && result.indexOf(assets.consultLoaderHref) === -1) {
    const tag =
      '<script src="' + escAttr(assets.consultLoaderHref) + '" defer' +
      (assets.modalJsHref ? ' data-modal-src="' + escAttr(assets.modalJsHref) + '"' : '') +
      '></script>';
    // Place it after the nav <script> element when there is one, else at the
    // end of <body>, so it never blocks the parser.
    let at = -1;
    if (navTagEnd !== -1) {
      const close = result.toLowerCase().indexOf('</script>', navTagEnd);
      if (close !== -1) at = close + '</script>'.length;
    }
    if (at === -1) {
      const bodyClose = result.toLowerCase().lastIndexOf('</body>');
      at = bodyClose === -1 ? result.length : bodyClose;
    }
    result = result.slice(0, at) + tag + result.slice(at);
    notes.push('emitted the consultation-modal intent loader ' + assets.consultLoaderHref);
  }

  return { html: result, notes };
}

/* ===================================================================== *
 * 6. Filesystem helpers
 * ===================================================================== */

async function writeOut(outDir, relPath, contents) {
  const file = path.join(outDir, relPath);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents);
  return Buffer.isBuffer(contents) ? contents.length : Buffer.byteLength(contents, 'utf8');
}

/** Recursive copy. Implemented here rather than with fs.cp, which is still
 *  flagged experimental on some Node 18/20 releases and prints a warning. */
async function copyTree(from, to) {
  let entries;
  try {
    entries = await readdir(from, { withFileTypes: true });
  } catch (err) {
    if (err && err.code === 'ENOENT') return 0;
    throw err;
  }
  entries.sort((a, b) => (a.name < b.name ? -1 : 1));
  let n = 0;
  await mkdir(to, { recursive: true });
  for (const e of entries) {
    const src = path.join(from, e.name);
    const dst = path.join(to, e.name);
    if (e.isDirectory()) n += await copyTree(src, dst);
    else if (e.isFile()) {
      await writeFile(dst, await readFile(src));
      n++;
    }
  }
  return n;
}

async function listFiles(dir, base = dir, acc = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err && err.code === 'ENOENT') return acc;
    throw err;
  }
  entries.sort((a, b) => (a.name < b.name ? -1 : 1));
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await listFiles(full, base, acc);
    else if (e.isFile()) acc.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return acc;
}

/* ===================================================================== *
 * 7. Search index — generated from routes[], never hand-written
 * ===================================================================== */

/** First `<path d="…">` in an inline SVG string; search.js renders only that. */
function firstPathData(svg) {
  if (typeof svg !== 'string') return '';
  const m = /<path\b[^>]*\bd\s*=\s*"([^"]*)"/i.exec(svg);
  return m ? m[1] : '';
}

/**
 * Build /assets/search-index.<hash>.json from the manifest.
 *
 * The shipped SEARCH_INDEX held 24 records with only 20 unique hrefs — the
 * duplicates being an "OvaTools LMS" alias for real-time-monitoring plus three
 * others. Deriving it from routes[] makes the duplication structurally
 * impossible; the alias keywords survive because they belong in that route's
 * `keywords` array in site.config.mjs.
 */
function buildSearchIndex(routes, navIcons) {
  const docs = routes
    .filter((r) => r && r.inSitemapXml !== false)
    .map((r) => ({
      href: r.path,
      title: r.navLabel || r.title || r.path,
      section: GROUP_SECTION[r.group] || 'Site',
      iconPath: firstPathData(navIcons && r.icon ? navIcons[r.icon] : ''),
      keywords: Array.isArray(r.keywords) ? r.keywords : [],
      snippet: r.summary || r.description || '',
    }));
  return JSON.stringify({ docs, synonyms: SEARCH_SYNONYMS, suggestions: SEARCH_SUGGESTIONS });
}

/* ===================================================================== *
 * 8. --report: measure an existing dist and print only the table
 * ===================================================================== */

async function runReport(opts, compress) {
  if (!(await isDir(opts.out))) {
    errorAt('report', `--report needs an existing output directory; ${opts.out} is not one. Run the build first.`);
    return;
  }
  heading('COMPRESSION REPORT');
  say(`  measuring ${opts.out}`);
  say('');
  const rows = await compress.precompress(opts.out, COMPRESS_EXTS);
  say(compress.report(rows));
}

/* ===================================================================== *
 * 9. main
 * ===================================================================== */

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    console.log(USAGE);
    return 0;
  }

  /* ---- 9.1 load every module up front ---------------------------------- */
  const specs = [
    ['site.config.mjs', ['site', 'routes', 'redirects', 'headerRules', 'navIcons']],
    ['build/lib/routes.mjs', ['buildGraph', 'canonicalUrl', 'breadcrumbTrail', 'breadcrumbJsonLd', 'siblings', 'relatedRoutes', 'normalizePath', 'outputFileFor']],
    ['build/lib/validate.mjs', ['validateManifest', 'extractLinks', 'validateLinks', 'findOrphans', 'EXTRA_ALLOWED_PATHS']],
    ['build/lib/render.mjs', ['renderSkipLink', 'renderHeader', 'renderFooter', 'renderBreadcrumbs', 'renderRelated', 'renderHeadTags']],
    ['build/lib/css.mjs', ['minifyCss', 'splitCritical', 'dedupe', 'hashName']],
    ['build/lib/html.mjs', ['passes', 'transform', 'minifyHtml']],
    ['build/lib/artifacts.mjs', ['sitemapXml', 'robotsTxt', 'llmsTxt', 'llmsFullTxt', 'headersFile', 'redirectsFile', 'organizationJsonLd', 'htmlToMarkdown']],
    ['build/lib/compress.mjs', ['precompress', 'report']],
  ];

  const mods = {};
  const fatal = [];
  for (const [rel, names] of specs) {
    const r = await loadModule(rel);
    if (!r.ok) {
      fatal.push(r.error);
      continue;
    }
    mods[rel] = r.mod;
    requireExports(r.mod, rel, names);
  }

  if (fatal.length) {
    console.error('BUILD CANNOT START');
    console.error('==================');
    for (const f of fatal) console.error('  [error] ' + f);
    console.error('');
    console.error('  Every module named in CONTRACT.md must exist before the build can run.');
    return 2;
  }
  if (errorCount()) {
    console.error('BUILD CANNOT START');
    console.error('==================');
    for (const p of problems) console.error(`  [${p.level}] ${p.scope}: ${p.message}`);
    return 2;
  }

  const config = mods['site.config.mjs'];
  const R = mods['build/lib/routes.mjs'];
  const V = mods['build/lib/validate.mjs'];
  const RENDER = mods['build/lib/render.mjs'];
  const CSS = mods['build/lib/css.mjs'];
  const HTML = mods['build/lib/html.mjs'];
  const ART = mods['build/lib/artifacts.mjs'];
  const COMPRESS = mods['build/lib/compress.mjs'];

  if (opts.report) {
    await runReport(opts, COMPRESS);
    return errorCount() ? 1 : 0;
  }

  const cfg = {
    site: config.site,
    routes: config.routes,
    redirects: config.redirects,
    headerRules: config.headerRules,
    navIcons: config.navIcons,
  };
  const routes = Array.isArray(config.routes) ? config.routes : [];

  /* ---- 9.2 resolve src ------------------------------------------------- */
  let src = opts.src;
  if (!src) {
    for (const c of SRC_CANDIDATES) {
      if (await isDir(c)) {
        src = c;
        break;
      }
    }
  }
  if (!src || !(await isDir(src))) {
    errorAt(
      'src',
      `source directory not found${opts.src ? `: ${opts.src}` : ` (looked in ${SRC_CANDIDATES.join(', ')})`}. ` +
        'Pass --src DIR pointing at the Website Studio export (the directory containing index.html and about/index.html).'
    );
    src = null; // nothing downstream can run without the 21 source pages
  }

  if (!src) return finish(opts, 1);

  heading(opts.check ? 'MTFS WEBSITE STUDIO — CHECK' : 'MTFS WEBSITE STUDIO — BUILD');
  say(`  src    ${src}`);
  say(`  out    ${opts.check ? '(nothing is written in --check mode)' : opts.out}`);
  say(`  node   ${process.version}`);
  say(`  routes ${routes.length}`);

  /* ---- 9.3 STEP 1: validate the manifest FIRST -------------------------- */
  heading('1. MANIFEST');
  const manifestProblems = V.validateManifest(routes, {
    redirects: config.redirects,
    strictLengths: opts.check,
  });
  const manifestErrors = manifestProblems.filter((p) => p.startsWith('[error]'));
  for (const p of manifestProblems) {
    problem(p.startsWith('[error]') ? 'error' : 'warn', 'manifest', p.replace(/^\[(error|warn)\]\s*/, ''));
  }
  say(
    `  validateManifest: ${routes.length} routes, ` +
      `${manifestErrors.length} error(s), ${manifestProblems.length - manifestErrors.length} warning(s)`
  );
  for (const p of manifestProblems.slice(0, 40)) say('    ' + p);
  if (manifestProblems.length > 40) say(`    … ${manifestProblems.length - 40} more (all listed under PROBLEMS)`);

  if (manifestErrors.length) {
    say('');
    say('  The manifest is the single source of truth for every page, artifact and');
    say('  link check that follows. Refusing to build on a broken manifest.');
    return finish(opts, 1);
  }
  const graph = R.buildGraph(routes);

  /* ---- 9.4 STEP 2: read every source page ------------------------------ */
  heading('2. SOURCE PAGES');
  const pages = [];
  for (const route of routes) {
    const rel = R.outputFileFor(route);
    const file = path.join(src, rel);
    let html;
    try {
      html = await readFile(file, 'utf8');
    } catch (err) {
      errorAt('src', `route '${route.id}' (${route.path}): ${reason(err)}`);
      continue;
    }
    pages.push({ route, rel, srcFile: file, srcHtml: html, inBytes: Buffer.byteLength(html, 'utf8') });
  }
  say(`  read ${pages.length} of ${routes.length} page(s) from ${src}`);
  if (pages.length !== routes.length) {
    say(`  ${routes.length - pages.length} route(s) had no source file — listed under PROBLEMS`);
  }

  /* ---- 9.5 STEP 3: CSS assembly ---------------------------------------- */
  heading('3. CSS');
  const criticalSrc = await readIfPresent(path.join(ROOT, 'src/assets/css/critical.css'));
  const siteSrc = await readIfPresent(path.join(ROOT, 'src/assets/css/site.css'));
  const fontsSrc = await readIfPresent(path.join(src, 'assets/css/fonts.css'));

  if (criticalSrc === null) errorAt('css', 'src/assets/css/critical.css is missing — nothing to inline in <head>');
  if (siteSrc === null) errorAt('css', 'src/assets/css/site.css is missing — no async site sheet to emit');
  if (fontsSrc === null) {
    warnAt('css', `${path.join(src, 'assets/css/fonts.css')} is missing — the 14 @font-face blocks will not be inlined`);
  }

  const safeMin = (css, label) => {
    if (!css) return '';
    try {
      return CSS.minifyCss(css);
    } catch (err) {
      errorAt('css', `minifyCss(${label}) failed: ${reason(err)}`);
      return css;
    }
  };

  const fontsMin = safeMin(fontsSrc, 'fonts.css');
  const criticalMin = safeMin(criticalSrc, 'critical.css');

  // dedupe() over all 21 pages' own CSS. `shared` is prepended to the site
  // sheet; only the residual stays inline. This is what retires the measured
  // 43,351 B of byte-identical duplicated <style> site-wide.
  const pageCss = pages.map((p) => {
    const { css, count } = extractStyleCss(p.srcHtml);
    p.styleBlocks = count;
    p.styleBytes = Buffer.byteLength(css, 'utf8');
    return css;
  });

  let shared = '';
  let perPage = pageCss.map((c) => safeMin(c, 'page css'));
  try {
    const d = CSS.dedupe(pageCss);
    shared = d.shared || '';
    perPage = Array.isArray(d.perPage) ? d.perPage : perPage;
  } catch (err) {
    errorAt('css', `dedupe() failed, falling back to per-page CSS with nothing hoisted: ${reason(err)}`);
  }

  const siteSheet = shared + safeMin(siteSrc, 'site.css');
  const siteCssName = CSS.hashName('site.css', siteSheet);
  const siteCssHref = '/assets/' + siteCssName;

  let criticalTotal = 0;
  pages.forEach((p, i) => {
    let pc = perPage[i] || '';
    let pd = '';
    try {
      const split = CSS.splitCritical(pc);
      pc = split.critical || '';
      pd = split.deferred || '';
    } catch (err) {
      errorAt('css', `splitCritical() failed on ${p.route.path}: ${reason(err)}`);
    }
    // fonts @font-face -> shared critical -> this page's critical -> this
    // page's residual. The site sheet's <link> lands after all of it.
    p.criticalCss = fontsMin + criticalMin + pc + pd;
    criticalTotal += Buffer.byteLength(p.criticalCss, 'utf8');
  });

  say(
    `  page <style> harvested: ${num(pageCss.reduce((a, c) => a + Buffer.byteLength(c, 'utf8'), 0))} B ` +
      `across ${pages.reduce((a, p) => a + (p.styleBlocks || 0), 0)} block(s) in ${pages.length} page(s)`
  );
  say(`  dedupe() hoisted:       ${num(Buffer.byteLength(shared, 'utf8'))} B into the shared site sheet`);
  say(`  site sheet:             ${siteCssHref}  (${num(Buffer.byteLength(siteSheet, 'utf8'))} B minified)`);
  say(`  inline critical:        ${num(fontsMin.length)} B fonts + ${num(criticalMin.length)} B shared + per-page slice`);
  say(`                          = ${num(criticalTotal)} B total across ${pages.length} pages, avg ${num(criticalTotal / Math.max(pages.length, 1))} B`);

  /* ---- 9.6 STEP 4: JS + search index ----------------------------------- */
  heading('4. SCRIPTS');
  const assets = { criticalCss: '', siteCssHref };
  const assetFiles = []; // { rel, bytes, contents }

  assetFiles.push({ rel: 'assets/' + siteCssName, contents: siteSheet });

  for (const spec of JS_ASSETS) {
    const source = await readIfPresent(path.join(ROOT, 'src/assets/js/', spec.file));
    if (source === null) {
      if (spec.required) errorAt('js', `src/assets/js/${spec.file} is missing`);
      else warnAt('js', `src/assets/js/${spec.file} is absent — ctx.assets.${spec.key} will be unset, so html.mjs's lazy-modal will report the module missing and the consultation modal will not load`);
      continue;
    }
    const name = CSS.hashName(spec.file, source);
    assets[spec.key] = '/assets/' + name;
    assetFiles.push({ rel: 'assets/' + name, contents: source });
  }

  const searchIndex = buildSearchIndex(routes, config.navIcons);
  const searchIndexName = CSS.hashName('search-index.json', searchIndex);
  assets.searchIndexHref = '/assets/' + searchIndexName;
  assetFiles.push({ rel: 'assets/' + searchIndexName, contents: searchIndex });

  say(table(
    ['asset', 'bytes', 'note'],
    assetFiles.map((a) => [
      '/' + a.rel,
      num(Buffer.byteLength(a.contents, 'utf8')),
      a.rel.endsWith('.json') ? 'generated from routes[]' : a.rel.includes('site.') ? 'async, non-blocking' : 'defer',
    ]),
    ['l', 'r', 'l']
  ));
  if (!assets.modalJsHref) {
    say('');
    say('  note: no modal bundle in src/assets/js/ — consult-modal.js is the intent LOADER,');
    say('        not the wizard it fetches. See PROBLEMS.');
  }

  /* ---- 9.7 STEP 5: Organization + WebSite JSON-LD ---------------------- */
  let orgJsonLd = '';
  try {
    const node = ART.organizationJsonLd(cfg);
    if (node) {
      orgJsonLd = '<script type="application/ld+json">' + JSON.stringify(node) + '</script>';
    } else {
      warnAt('jsonld', 'organizationJsonLd(cfg) returned nothing — no Organization/WebSite node will be emitted');
    }
  } catch (err) {
    errorAt('jsonld', `organizationJsonLd(cfg) threw: ${reason(err)}`);
  }

  /* ---- 9.8 STEP 6: render + transform every page ----------------------- */
  heading('5. PAGES');
  for (const p of pages) {
    const route = p.route;
    const notes = [];
    const steps = [];

    // (a) SSR partials from render.mjs
    let partials = {};
    try {
      partials = {
        skipLink: RENDER.renderSkipLink(),
        header: RENDER.renderHeader(route, graph, cfg),
        breadcrumbs: RENDER.renderBreadcrumbs(route, graph),
        related: RENDER.renderRelated(route, graph),
        footer: RENDER.renderFooter(route, graph, cfg),
      };
    } catch (err) {
      errorAt('render', `${route.path}: render.mjs threw: ${reason(err)}`);
    }

    // (b) head-tags (orchestrator-owned; see the file header)
    let html = p.srcHtml;
    try {
      // head-tags removes every application/ld+json block in the source head
      // before installing the rendered one. Most of those are regenerated from
      // the manifest — but FAQPage is not: it is hand-authored page content
      // (six Question/Answer pairs on the home page) that no manifest field
      // describes. Dropping it silently deleted the site's only FAQPage while
      // the visible FAQ copy stayed on the page.
      //
      // Carry it forward verbatim rather than trying to regenerate it: the
      // answers are editorial prose and this build does not author copy.
      const carried = carryForwardJsonLd(p.srcHtml, ['FAQPage']);
      if (carried.blocks.length) {
        notes.push(
          `carried ${carried.blocks.length} hand-authored JSON-LD block(s) ` +
            `forward from the source head: ${carried.types.join(', ')}`
        );
      }
      const headHtml =
        RENDER.renderHeadTags(route, graph, cfg) + orgJsonLd + carried.blocks.join('');
      const applied = applyHeadTags(html, headHtml);
      html = applied.html;
      notes.push(...applied.notes);
      steps.push('head-tags');
    } catch (err) {
      errorAt('render', `${route.path}: renderHeadTags() threw: ${reason(err)}`);
    }

    // (c) the twelve contract passes
    const ctx = {
      route,
      graph,
      cfg,
      assets: { ...assets, criticalCss: p.criticalCss },
      partials,
    };
    let result;
    try {
      result = HTML.transform(html, ctx);
      html = result.html;
      steps.push(...result.applied.map((a) => a.name));
      for (const group of [result.applied, result.skipped]) {
        for (const entry of group || []) {
          for (const n of entry.notes || []) {
            if (/^WARNING|^ERROR/.test(n)) repeatedWarn('passes', `[${entry.name}] ${n}`, route.path);
          }
        }
      }
    } catch (err) {
      errorAt('passes', `${route.path}: transform() threw: ${reason(err)}`);
      result = { applied: [], skipped: [] };
    }

    // (d) stamp-assets (orchestrator-owned; see the file header)
    const stamped = stampAssets(html, assets);
    if (stamped.html !== html) steps.push('stamp-assets');
    html = stamped.html;
    for (const n of stamped.notes) if (/^WARNING/.test(n)) repeatedWarn('assets', n, route.path);

    // (e) conservative minify. Never allowed to lose a page: on failure the
    //     un-minified document ships and the reason is reported.
    try {
      const min = HTML.minifyHtml(html);
      if (typeof min === 'string' && min.length) {
        html = min;
        steps.push('minify-html');
      }
    } catch (err) {
      warnAt('minify', `${route.path}: minifyHtml() failed, shipping un-minified: ${reason(err)}`);
    }

    p.outHtml = html;
    p.outBytes = Buffer.byteLength(html, 'utf8');
    p.steps = steps;
    p.passCount = steps.length;
  }

  const pageRows = pages.map((p) => [
    p.route.path,
    num(p.inBytes),
    num(p.outBytes),
    signed(p.outBytes - p.inBytes),
    p.inBytes ? (((p.outBytes - p.inBytes) / p.inBytes) * 100).toFixed(1) + '%' : '—',
    String(p.passCount),
  ]);
  say('  steps = html.mjs passes that changed bytes, plus the three orchestrator-owned steps');
  say('          (head-tags, stamp-assets, minify-html). A pass that was a no-op is not counted.');
  say('');
  say(table(
    ['route', 'in B', 'out B', 'delta', 'delta %', 'steps'],
    pageRows,
    ['l', 'r', 'r', 'r', 'r', 'r']
  ));

  const totalIn = pages.reduce((a, p) => a + p.inBytes, 0);
  const totalOut = pages.reduce((a, p) => a + (p.outBytes || 0), 0);
  say('');
  say(table(
    ['', 'in B', 'out B', 'delta', 'delta %'],
    [[
      `TOTAL (${pages.length} pages)`,
      num(totalIn),
      num(totalOut),
      signed(totalOut - totalIn),
      totalIn ? (((totalOut - totalIn) / totalIn) * 100).toFixed(1) + '%' : '—',
    ]],
    ['l', 'r', 'r', 'r', 'r']
  ));

  // Which passes fired, and where. A pass that fires on 0 pages is either
  // unnecessary or broken; either way the build should say so.
  const passTally = new Map();
  for (const name of HTML.passes.map((x) => x.name)) passTally.set(name, 0);
  for (const extra of ['head-tags', 'stamp-assets', 'minify-html']) passTally.set(extra, 0);
  for (const p of pages) for (const s of p.steps || []) passTally.set(s, (passTally.get(s) || 0) + 1);
  say('');
  say(table(
    ['pass', 'pages changed'],
    [...passTally.entries()].map(([k, v]) => [k, `${v} / ${pages.length}`]),
    ['l', 'r']
  ));
  flushRepeated(pages.length);
  for (const [name, count] of passTally) {
    if (count !== 0) continue;
    if (name === 'hoist-charset') {
      // Expected: the head-tags step above already emits <meta charset="UTF-8">
      // as the first node of <head>, so pass 5 has nothing left to hoist. It is
      // kept in the chain as the guarantee that it stays that way.
      say('');
      say("  note: 'hoist-charset' is a no-op on every page because the head-tags step already emits");
      say('        <meta charset> as the first child of <head>. The pass remains the standing guarantee.');
      continue;
    }
    warnAt('passes', `pass '${name}' changed nothing on any of the ${pages.length} pages`);
  }

  /* ---- 9.9 STEP 7: derived artifacts ----------------------------------- */
  heading('6. ARTIFACTS');
  const artifacts = [];
  const lastmod = new Date().toISOString().slice(0, 10);

  const tryArtifact = (name, fn) => {
    try {
      const value = fn();
      if (typeof value !== 'string') {
        errorAt('artifacts', `${name} did not return a string`);
        return;
      }
      artifacts.push({ name, contents: value });
    } catch (err) {
      errorAt('artifacts', `${name} threw: ${reason(err)}`);
    }
  };

  // llms-full.txt needs the MAIN content of every rendered page as Markdown.
  // It is extracted from the OUTPUT, not the input, so what the file mirrors
  // is what actually ships.
  const pageMarkdown = new Map();
  for (const p of pages) {
    if (p.route.inLlms === false || !p.outHtml) continue;
    try {
      // The { origin } option is not optional here. llms-full.txt is fetched by
      // third-party crawlers and read away from the origin, so a link that
      // reads "](/services/)" cannot be resolved by its entire audience.
      // Omitting it shipped 263 root-relative links and 0 absolute ones, while
      // llms.txt — built through a different path — was absolutising correctly
      // the whole time, so the two artifacts disagreed.
      pageMarkdown.set(
        p.route.id,
        ART.htmlToMarkdown(p.outHtml, { origin: cfg.site.origin })
      );
    } catch (err) {
      errorAt('artifacts', `htmlToMarkdown(${p.route.path}) threw: ${reason(err)}`);
    }
  }

  tryArtifact('sitemap.xml', () => ART.sitemapXml(routes, graph, cfg, lastmod));
  tryArtifact('robots.txt', () => ART.robotsTxt(cfg));
  tryArtifact('llms.txt', () => ART.llmsTxt(routes, graph, cfg));
  tryArtifact('llms-full.txt', () => ART.llmsFullTxt(routes, graph, cfg, pageMarkdown));
  tryArtifact('_headers', () => ART.headersFile(cfg));
  tryArtifact('_redirects', () => ART.redirectsFile(cfg));

  say(table(
    ['artifact', 'bytes'],
    artifacts.map((a) => [a.name, num(Buffer.byteLength(a.contents, 'utf8'))]),
    ['l', 'r']
  ));

  /* ---- 9.10 STEP 8: write dist ----------------------------------------- */
  if (!opts.check) {
    heading('7. WRITE');

    // The write step starts by deleting --out, so refuse the handful of targets
    // where a typo would be unrecoverable: the filesystem root, the repo root
    // itself, and any ancestor of the repo.
    const target = path.resolve(opts.out);
    const unsafe =
      target === path.parse(target).root ||
      target === ROOT ||
      ROOT.startsWith(target + path.sep) ||
      target === path.resolve(src);
    if (unsafe) {
      errorAt('out', `refusing to erase ${target} — --out must be a dedicated build directory, not the repo root, an ancestor of it, or the source export`);
      return finish(opts, 1);
    }

    await rm(target, { recursive: true, force: true });
    await mkdir(target, { recursive: true });

    let written = 0;
    let bytes = 0;
    for (const p of pages) {
      if (!p.outHtml) continue;
      bytes += await writeOut(opts.out, p.rel, p.outHtml);
      written++;
    }
    for (const a of assetFiles) {
      bytes += await writeOut(opts.out, a.rel, a.contents);
      written++;
    }
    for (const a of artifacts) {
      bytes += await writeOut(opts.out, a.name, a.contents);
      written++;
    }
    let copied = 0;
    for (const item of PASSTHROUGH) {
      const from = path.join(src, item.from);
      const to = path.join(opts.out, item.to);
      if (item.kind === 'dir') copied += await copyTree(from, to);
      else {
        const buf = await readFile(from).catch(() => null);
        if (buf === null) warnAt('passthrough', `${item.from} not found in the source export — not copied`);
        else {
          await mkdir(path.dirname(to), { recursive: true });
          await writeFile(to, buf);
          copied++;
        }
      }
    }
    say(`  wrote ${written} generated file(s), ${num(bytes)} B, plus ${copied} copied file(s) into ${opts.out}`);

    // The /assets/* immutable-for-a-year rule in headerRules is only honest if
    // every file under it is content-hashed. site.config.mjs says so in
    // writing: "sync.mjs must assert the invariant, not assume it."
    const emitted = await listFiles(path.join(opts.out, 'assets'));
    const unhashed = emitted.filter((f) => !HASHED_RE.test(f));
    if (unhashed.length) {
      errorAt(
        'assets',
        `${unhashed.length} file(s) under /assets/ are NOT content-hashed, but headerRules serves that ` +
          `prefix "public, max-age=31536000, immutable" — a stale copy would be pinned in every visitor's ` +
          `browser for a year: ${unhashed.join(', ')}`
      );
    } else {
      say(`  /assets/ invariant OK: all ${emitted.length} file(s) are content-hashed`);
    }
  }

  /* ---- 9.11 STEP 9: validate the OUTPUT, not the input ----------------- */
  heading('8. LINK VALIDATION');
  const verifyPages = [];
  if (opts.check) {
    for (const p of pages) if (p.outHtml) verifyPages.push({ path: p.route.path, html: p.outHtml });
    say('  --check: validating the in-memory transformed pages (nothing was written)');
  } else {
    // Re-read from disk. A build that validates its own in-memory strings can
    // pass while writing something else; this checks what actually landed.
    for (const p of pages) {
      const file = path.join(opts.out, p.rel);
      const html = await readIfPresent(file);
      if (html === null) {
        errorAt('write', `${p.route.path}: expected output ${file} is missing after the write step`);
        continue;
      }
      verifyPages.push({ path: p.route.path, html });
    }
    say(`  re-read ${verifyPages.length} page(s) from ${opts.out} and validated the written bytes`);
  }

  let linkProblems = [];
  try {
    linkProblems = V.validateLinks(verifyPages, graph, {
      site: cfg.site,
      origin: cfg.site && cfg.site.origin,
      redirects: cfg.redirects,
      checkFooterCoverage: true,
      checkAnchorText: true,
      expectAllRoutes: true,
    });
  } catch (err) {
    errorAt('links', `validateLinks() threw: ${reason(err)}`);
  }

  const linkErrors = linkProblems.filter((p) => p.level === 'error');
  const linkWarns = linkProblems.filter((p) => p.level !== 'error');
  for (const lp of linkProblems) {
    problem(lp.level === 'error' ? 'error' : 'warn', 'links', `${lp.page}: ${lp.message}${lp.rule ? ` (${lp.rule})` : ''}`);
  }

  let orphans = [];
  try {
    orphans = V.findOrphans(verifyPages, graph);
  } catch (err) {
    errorAt('links', `findOrphans() threw: ${reason(err)}`);
  }
  for (const id of orphans) {
    errorAt('links', `route '${id}' has no inbound internal link from any other page (orphan)`);
  }

  say('');
  say(
    `  validateLinks: ${linkErrors.length} error(s), ${linkWarns.length} warning(s) over ${verifyPages.length} page(s)`
  );
  say(`  findOrphans:   ${orphans.length === 0 ? 'none — every route is reachable' : orphans.join(', ')}`);
  const sample = linkProblems.slice(0, 25);
  if (sample.length) {
    say('');
    say(table(
      ['level', 'page', 'rule', 'message'],
      sample.map((p) => [p.level, p.page, p.rule || '', p.message.length > 110 ? p.message.slice(0, 107) + '…' : p.message]),
      ['l', 'l', 'l', 'l']
    ));
    if (linkProblems.length > sample.length) {
      say(`  … ${linkProblems.length - sample.length} more link problem(s); all are listed under PROBLEMS`);
    }
  }

  /* ---- 9.12 STEP 10: asset cross-reference ----------------------------- */
  // Every /assets/ URL the written pages point at must exist, and every file
  // under /assets/ should be pointed at by something. The second half is what
  // catches dead weight copied out of the export: /assets/404/route.<hash>.css
  // and its images stop being referenced the moment inline-critical-css drops
  // the /404/ page's own <link rel=stylesheet>.
  heading('9. ASSET REFERENCES');
  const referenced = new Set();
  for (const p of verifyPages) {
    let links = [];
    try {
      links = V.extractLinks(p.html);
    } catch (err) {
      warnAt('assets', `extractLinks(${p.path}) threw: ${reason(err)}`);
    }
    for (const l of links) {
      const raw = String(l.raw).split('?')[0].split('#')[0];
      if (raw.startsWith('/assets/')) referenced.add(raw);
    }
  }
  // Fetched at runtime through data-* attributes rather than href/src, so
  // extractLinks cannot see them. consult-modal.js is NOT seeded: stamp-assets
  // emits a real <script src> for it, so if it ever shows up as unreferenced
  // that step has stopped working and the report should say so.
  for (const key of ['searchJsHref', 'searchIndexHref', 'modalJsHref']) {
    if (assets[key]) referenced.add(assets[key]);
  }

  let emittedAssets;
  if (opts.check) {
    emittedAssets = assetFiles.map((a) => '/' + a.rel);
    // --check writes nothing, so it has to MODEL what a build would emit. Derive
    // the passthrough contribution from PASSTHROUGH rather than naming a
    // directory here: an earlier revision hardcoded assets/404, and when that
    // entry was dropped from PASSTHROUGH this line kept reporting 18 dead files
    // that a real build no longer emits — a false warning in the very check
    // whose job is to catch dead weight.
    for (const item of PASSTHROUGH) {
      if (item.kind !== 'dir' || !item.to.startsWith('assets/')) continue;
      for (const f of await listFiles(path.join(src, item.from))) {
        emittedAssets.push('/' + item.to + '/' + f);
      }
    }
  } else {
    emittedAssets = (await listFiles(path.join(opts.out, 'assets'))).map((f) => '/assets/' + f);
  }
  const emittedSet = new Set(emittedAssets);

  const missingAssets = [...referenced].filter((h) => !emittedSet.has(h)).sort();
  const unusedAssets = emittedAssets.filter((h) => !referenced.has(h)).sort();

  for (const h of missingAssets) {
    errorAt('assets', `${h} is referenced by a built page but no such file is emitted — a guaranteed 404`);
  }
  // Group by directory so one dead bundle is one finding, not seventeen lines.
  const unusedByDir = new Map();
  for (const h of unusedAssets) {
    const dir = h.slice(0, h.lastIndexOf('/') + 1);
    if (!unusedByDir.has(dir)) unusedByDir.set(dir, []);
    unusedByDir.get(dir).push(h.slice(dir.length));
  }
  for (const [dir, names] of unusedByDir) {
    if (names.length === 1) {
      warnAt('assets', `${dir}${names[0]} is emitted but nothing references it — dead weight in the deploy`);
    } else {
      warnAt(
        'assets',
        `${names.length} file(s) under ${dir} are emitted but nothing references them — dead weight in ` +
          `the deploy: ${names.join(', ')}`
      );
    }
  }
  say(
    `  ${referenced.size} referenced · ${emittedAssets.length} emitted · ` +
      `${missingAssets.length} missing · ${unusedAssets.length} unreferenced`
  );
  if (unusedAssets.length) {
    say('');
    say(table(['unreferenced asset'], unusedAssets.map((h) => [h]), ['l']));
  }

  /* ---- 9.13 STEP 11: precompress --------------------------------------- */
  if (!opts.check) {
    heading('10. PRE-COMPRESSION');
    try {
      const rows = await COMPRESS.precompress(opts.out, COMPRESS_EXTS);
      say(COMPRESS.report(rows));
    } catch (err) {
      errorAt('compress', `precompress() failed: ${reason(err)}`);
    }
  }

  return finish(opts, errorCount() ? 1 : 0);
}

/* ===================================================================== *
 * 10. Verdict
 * ===================================================================== */

function finish(opts, code) {
  const errs = problems.filter((p) => p.level === 'error');
  const warns = problems.filter((p) => p.level === 'warn');

  heading('PROBLEMS');
  if (!problems.length) {
    say('  none.');
  } else {
    const width = String(problems.length).length;
    problems.forEach((p, i) => {
      const tag = `  ${padL(i + 1, width)}. [${padR(p.level, 5)}] ${padR(p.scope, 12)} `;
      const cont = ' '.repeat(tag.length);
      const lines = wrap(p.message, 100, cont);
      say(tag + lines[0]);
      for (const l of lines.slice(1)) say(l);
    });
  }

  heading('VERDICT');
  say(`  mode      ${opts.check ? '--check (nothing written)' : 'build'}`);
  say(`  errors    ${errs.length}`);
  say(`  warnings  ${warns.length}`);
  const failed = code !== 0 || errs.length > 0;
  say(`  result    ${failed ? 'FAIL' : 'PASS'}`);
  if (failed) {
    say('');
    say('  Fix the error-level problems above. Warnings do not fail the build, but each one');
    say('  is a real divergence from the audit findings and should be read.');
  }
  return failed ? Math.max(code, 1) : 0;
}

/* ===================================================================== *
 * 11. Entry point
 * ===================================================================== */

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    console.error('');
    console.error('BUILD ABORTED — unexpected failure');
    console.error('==================================');
    console.error('  ' + reason(err));
    console.error('');
    console.error('  This is a bug in the build, not in the site. Re-run with --check to isolate it.');
    process.exitCode = 2;
  });
