/**
 * build/lib/html.mjs — the HTML refactor passes.
 *
 * Zero npm dependencies. Node >= 18. ESM.
 * This module imports nothing at all: every pass is a pure string transform,
 * which is what makes each one testable in isolation against the raw export.
 *
 * Each pass is `{ name, description, run(html, ctx) }` and returns either a
 * string (the new html) or `{ html, notes }`. `transform()` runs them in the
 * contract order and reports which ones actually changed bytes.
 *
 * ctx = {
 *   route,   // the route object from site.config.mjs routes[]
 *   graph,   // buildGraph(routes) from build/lib/routes.mjs
 *   cfg,     // { site, routes, redirects, headerRules, navIcons }
 *   assets: { criticalCss, siteCssHref, navJsHref, modalJsHref, analyticsJsHref },
 *   partials: {           // built by build/sync.mjs from build/lib/render.mjs
 *     skipLink, header, breadcrumbs, related, footer
 *   }
 * }
 *
 * `ctx.partials` is how the SSR strings from render.mjs reach the ssr-chrome
 * pass. html.mjs deliberately does NOT import render.mjs — keeping this module
 * dependency-free keeps the two files from becoming circular and lets every
 * pass be exercised against the real source export with a stub ctx.
 *
 * ------------------------------------------------------------------------
 * CSS CONTRACT owed by build/lib/css.mjs (see the `strip-inline-handlers`
 * pass — these rules replace the 812 inline on* handlers measured in the
 * export, and each one pairs :hover with :focus-visible so keyboard users get
 * the state mouse users already had):
 *
 *   .mtfs-hover-teal:hover,.mtfs-hover-teal:focus-visible{color:var(--teal)}
 *   .mtfs-skip-link:focus,.mtfs-skip-link:focus-visible{top:0}
 *   .contact-cta-link:hover,.contact-cta-link:focus-visible{color:var(--w)}
 *   .btn-primary:hover,.btn-primary:focus-visible{background:var(--td);border-color:var(--td)}
 *   .btn-link:hover,.btn-link:focus-visible{border-color:#fff;background:rgba(255,255,255,.08)}
 *
 * Never key a shared-stylesheet rule on an il* class: il13, il15, il23, il25,
 * il30 and il33 each map to two different handler pairs depending on the page.
 * ------------------------------------------------------------------------
 */

/* =====================================================================
 * 0. Protected-region tokenizer
 *
 * Every attribute-level regex in this file runs over a *masked* document in
 * which <script>, <style>, <pre>, <textarea> and comments have been replaced
 * by opaque tokens. That is what makes the passes safe: a regex can never
 * reach inside the LPS tracker's JavaScript, inside a CSS block, or inside
 * preformatted text.
 *
 * Per the HTML spec a <script> element ends at the first "</script" in the
 * source, so the non-greedy match below is not a heuristic — it is the parse
 * rule the browser itself uses.
 * ===================================================================== */

const TOK_A = '\u0001';
const TOK_B = '\u0002';
const TOKEN_RE = new RegExp(TOK_A + '(\\d+)' + TOK_B, 'g');

/** Attribute-run fragment reused inside larger regex patterns. */
const A = '(?:"[^"]*"|\'[^\']*\'|[^>"\'])*';

const PROTECT_RE = new RegExp(
  [
    '<!--\\[if[\\s\\S]*?<!\\[endif\\]-->',          // downlevel-hidden conditional comment
    '<!\\[if[\\s\\S]*?<!\\[endif\\]>',              // downlevel-revealed conditional comment
    '<(script|style|pre|textarea)\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>',
    '<!--[\\s\\S]*?-->'
  ].join('|'),
  'gi'
);

function chunkKind(raw) {
  if (/^<!--\s*\[if/i.test(raw) || /^<!\[if/i.test(raw)) return 'cond';
  if (/^<!--/.test(raw)) return 'comment';
  const m = /^<([a-zA-Z]+)/.exec(raw);
  return m ? m[1].toLowerCase() : 'unknown';
}

function tokenFor(i) { return TOK_A + i + TOK_B; }

/** Split html into an opaque-token document + the raw chunks it stands for. */
function tokenize(html) {
  const chunks = [];
  const text = String(html).replace(PROTECT_RE, (raw) => {
    const i = chunks.length;
    chunks.push({ kind: chunkKind(raw), raw, removed: false });
    return tokenFor(i);
  });
  return { text, chunks };
}

/** Put the raw chunks back. Chunks flagged `removed` collapse to ''. */
function detokenize(text, chunks) {
  TOKEN_RE.lastIndex = 0;
  return String(text).replace(TOKEN_RE, (_, n) => {
    const c = chunks[Number(n)];
    if (!c || c.removed) return '';
    return c.raw;
  });
}

/** Run `fn(text, chunks)` over a masked document and re-assemble. */
function withProtected(html, fn) {
  const { text, chunks } = tokenize(html);
  const out = fn(text, chunks);
  return detokenize(out === undefined ? text : out, chunks);
}

/** Indexes of live chunks matching a predicate, in document order. */
function findChunks(chunks, pred) {
  const out = [];
  for (let i = 0; i < chunks.length; i++) {
    if (!chunks[i].removed && pred(chunks[i], i)) out.push(i);
  }
  return out;
}

/** Drop a chunk and the token that stands for it. */
function dropChunk(text, chunks, i) {
  chunks[i].removed = true;
  return text.split(tokenFor(i)).join('');
}

/**
 * Edit the START TAG of a protected chunk (a <script>, <style>, <pre> or
 * <textarea>). Attribute-level passes run over masked text, where such an
 * element is a single opaque token, so their regexes cannot reach its opening
 * tag; this is how a pass reaches it without ever touching the content.
 */
function editChunkOpenTag(chunk, fn) {
  const m = new RegExp('^<([a-zA-Z]+)(' + A + ')>').exec(chunk.raw);
  if (!m) return false;
  const next = fn(m[1].toLowerCase(), m[2]);
  if (next === undefined || next === null || next === m[2]) return false;
  chunk.raw = '<' + m[1] + next + '>' + chunk.raw.slice(m[0].length);
  return true;
}

/** Every chunk index referenced by a slice of masked text. */
function tokensIn(slice) {
  const out = [];
  const re = new RegExp(TOK_A + '(\\d+)' + TOK_B, 'g');
  let m;
  while ((m = re.exec(slice))) out.push(Number(m[1]));
  return out;
}

/* =====================================================================
 * 1. Small HTML utilities (all operate on masked text)
 * ===================================================================== */

/** Matches one start tag; attribute values may legally contain '>'. */
const TAG_RE = /<([a-zA-Z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^>"'])*)(\/?)>/g;

/**
 * Walk every start tag. `fn(tagName, attrs, whole, selfClose)` returns:
 *   undefined / null  -> leave untouched
 *   string            -> replace the WHOLE tag with it
 */
function editTags(text, fn) {
  TAG_RE.lastIndex = 0;
  return text.replace(TAG_RE, (whole, name, attrs, selfClose) => {
    const r = fn(name.toLowerCase(), attrs, whole, selfClose);
    return (r === undefined || r === null) ? whole : r;
  });
}

const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+)|([a-zA-Z_:][-a-zA-Z0-9_:.]*)/g;

/** Parse a start tag's attribute string into an ordered list. */
function parseAttrs(attrs) {
  const out = [];
  ATTR_RE.lastIndex = 0;
  let m;
  while ((m = ATTR_RE.exec(attrs))) {
    if (m[1]) {
      let v = m[2];
      let q = '"';
      if (v[0] === '"' || v[0] === "'") { q = v[0]; v = v.slice(1, -1); }
      out.push({ name: m[1], value: v, quote: q, bare: false });
    } else if (m[3]) {
      out.push({ name: m[3], value: null, quote: '"', bare: true });
    }
  }
  return out;
}

function serializeAttrs(list) {
  return list
    .map((a) => (a.bare ? a.name : a.name + '=' + a.quote + a.value + a.quote))
    .map((s) => ' ' + s)
    .join('');
}

function getAttr(attrs, name) {
  const lc = name.toLowerCase();
  for (const a of parseAttrs(attrs)) if (a.name.toLowerCase() === lc) return a.bare ? '' : a.value;
  return null;
}

function hasClass(attrs, cls) {
  const c = getAttr(attrs, 'class');
  return !!c && c.split(/\s+/).includes(cls);
}

function addClass(attrs, cls) {
  const list = parseAttrs(attrs);
  const i = list.findIndex((a) => a.name.toLowerCase() === 'class');
  if (i === -1) { list.push({ name: 'class', value: cls, quote: '"', bare: false }); return serializeAttrs(list); }
  const cur = list[i].value.split(/\s+/).filter(Boolean);
  if (!cur.includes(cls)) cur.push(cls);
  list[i].value = cur.join(' ');
  return serializeAttrs(list);
}

function setAttrIn(attrs, name, value) {
  const list = parseAttrs(attrs);
  const i = list.findIndex((a) => a.name.toLowerCase() === name.toLowerCase());
  if (i === -1) list.push({ name, value, quote: '"', bare: false });
  else { list[i].value = value; list[i].bare = false; }
  return serializeAttrs(list);
}

function removeAttrsIn(attrs, pred) {
  return serializeAttrs(parseAttrs(attrs).filter((a) => !pred(a.name.toLowerCase(), a.bare ? '' : a.value)));
}

/**
 * Nesting-aware element matcher. Returns { start, end, openEnd, open, inner,
 * attrs } for the first element whose start tag matches `openRe` at or after
 * `from`, or null.
 */
function findElement(text, tag, openRe, from = 0) {
  const flags = openRe.flags.includes('g') ? openRe.flags : openRe.flags + 'g';
  const re = new RegExp(openRe.source, flags);
  re.lastIndex = from;
  const m = re.exec(text);
  if (!m) return null;
  const start = m.index;
  const openEnd = start + m[0].length;
  const attrsM = /^<[a-zA-Z][^\s/>]*((?:"[^"]*"|'[^']*'|[^>"'])*)\/?>$/.exec(m[0]);
  const attrs = attrsM ? attrsM[1] : '';
  if (/\/>$/.test(m[0])) return { start, end: openEnd, openEnd, open: m[0], inner: '', attrs };
  const scan = new RegExp('<' + tag + '\\b[^>]*>|<\\/' + tag + '\\s*>', 'gi');
  scan.lastIndex = openEnd;
  let depth = 1;
  let s;
  while ((s = scan.exec(text))) {
    if (s[0][1] === '/') {
      depth--;
      if (depth === 0) {
        return { start, end: s.index + s[0].length, openEnd, open: m[0], inner: text.slice(openEnd, s.index), attrs };
      }
    } else if (!/\/>$/.test(s[0])) depth++;
  }
  return null;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function decodeEntities(s) {
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·').replace(/&hellip;/g, '…')
    .replace(/&amp;/g, '&');
}

/** Visible text of an HTML fragment, whitespace-normalised. */
function textOf(fragment) {
  return decodeEntities(String(fragment).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function routeByPath(ctx, p) {
  if (!ctx || !p) return null;
  const graph = ctx.graph;
  if (graph && graph.byPath && typeof graph.byPath.get === 'function') {
    const hit = graph.byPath.get(p);
    if (hit) return hit;
  }
  const routes = (ctx.cfg && ctx.cfg.routes) || (graph && graph.routes) || null;
  if (Array.isArray(routes)) return routes.find((r) => r.path === p) || null;
  return null;
}

function pathOfHref(href) {
  if (!href) return null;
  const clean = String(href).split('#')[0].split('?')[0];
  if (!clean.startsWith('/')) return null;
  return clean.endsWith('/') ? clean : clean + '/';
}

/* =====================================================================
 * 2. The passes
 * ===================================================================== */

/* ---------------------------------------------------------------- 1 */
const stripDevTaps = {
  name: 'strip-dev-taps',
  description:
    'BRIEF item 5: removes the two builder dev-tap module scripts ' +
    '(data-lps-tap="route-notifier" importing /src/lib/routeNotifier.ts and ' +
    '/src/lib/virtualPageObserver.ts, and data-lps-tap="inspector" importing ' +
    '/src/lib/inspector.ts) plus the whole "ws:page-observer start" ... ' +
    '"ws:page-observer end" block, which fetches /pages.manifest.json and ' +
    'postMessages PAGE_CHANGED to window.parent. Those four requests are the ' +
    '4x404-per-page behind the failing errors-in-console audit (JSCSS-12).',
  run(html) {
    const notes = [];
    let taps = 0;
    let observers = 0;
    let observerBytes = 0;
    const out = withProtected(html, (text, chunks) => {
      // (a) the [data-lps-tap] module scripts
      for (const i of findChunks(chunks, (c) => c.kind === 'script' && /\bdata-lps-tap\s*=/.test(c.raw))) {
        const which = /data-lps-tap\s*=\s*"([^"]*)"/.exec(chunks[i].raw);
        notes.push('removed dev tap script data-lps-tap="' + (which ? which[1] : '?') + '" (' + chunks[i].raw.length + ' B)');
        text = dropChunk(text, chunks, i);
        taps++;
      }
      // (b) the ws:page-observer fenced region, comments included
      for (;;) {
        const startIdx = findChunks(chunks, (c) => c.kind === 'comment' && /ws:page-observer start/i.test(c.raw))[0];
        if (startIdx === undefined) break;
        const endIdx = findChunks(chunks, (c) => c.kind === 'comment' && /ws:page-observer end/i.test(c.raw))[0];
        if (endIdx === undefined) {
          notes.push('WARNING: "ws:page-observer start" found without a matching end fence — left in place');
          break;
        }
        const a = text.indexOf(tokenFor(startIdx));
        const b = text.indexOf(tokenFor(endIdx));
        if (a === -1 || b === -1 || b < a) break;
        const stop = b + tokenFor(endIdx).length;
        for (const ci of tokensIn(text.slice(a, stop))) {
          if (!chunks[ci].removed) observerBytes += chunks[ci].raw.length;
          chunks[ci].removed = true;
        }
        text = text.slice(0, a) + text.slice(stop);
        observers++;
      }
      // /our-team/ carries a stray, unterminated "<!-- ws:page-observer begin -->"
      // fence (a builder bug — every other page uses start/end). Drop any
      // ws:page-observer marker the paired removal above could not consume.
      for (const i of findChunks(chunks, (c) => c.kind === 'comment' && /ws:page-observer/i.test(c.raw))) {
        notes.push('removed an orphaned ' + chunks[i].raw.trim() + ' fence with no matching end marker');
        text = dropChunk(text, chunks, i);
      }
      return text;
    });
    if (observers) {
      notes.push('removed ' + observers + ' ws:page-observer block(s), ' + observerBytes +
        ' B of inline JS (fetch /pages.manifest.json + PAGE_CHANGED postMessage to window.parent)');
    }
    if (!taps) notes.push('no [data-lps-tap] scripts found');
    return { html: out, notes };
  }
};

/* ---------------------------------------------------------------- 2 */
const stripNocacheMeta = {
  name: 'strip-nocache-meta',
  description:
    'BRIEF item 6: removes the three <meta http-equiv> cache directives every ' +
    'page carries — Cache-Control "no-cache, no-store, must-revalidate", ' +
    'Pragma "no-cache" and Expires "0". They override the _headers policy and ' +
    'force a full re-download on every visit.',
  run(html) {
    const notes = [];
    let n = 0;
    const out = withProtected(html, (text) =>
      text.replace(/[ \t]*<meta\b[^>]*\bhttp-equiv\s*=\s*"(Cache-Control|Pragma|Expires)"[^>]*>\r?\n?/gi, (_, k) => {
        n++;
        notes.push('removed <meta http-equiv="' + k + '">');
        return '';
      })
    );
    if (!n) notes.push('no http-equiv cache meta tags on this page');
    return { html: out, notes };
  }
};

/* ---------------------------------------------------------------- 3 */
const stripBuilderIds = {
  name: 'strip-builder-ids',
  description:
    'BRIEF item 10 / JSCSS-12: removes every data-lps-eid builder identity ' +
    'attribute (11,176 B on the home page alone) plus the stray schema.org ' +
    'microdata the builder puts on <html> (itemscope / itemtype) and the ' +
    '<meta itemprop> that duplicates the canonical. SEO-15: four pages mix ' +
    'microdata and JSON-LD at random; JSON-LD is the site vocabulary.',
  run(html) {
    const notes = [];
    let eid = 0;
    let micro = 0;
    let itemprop = 0;
    let out2 = withProtected(html, (text) =>
      editTags(text, (name, attrs) => {
        if (name === 'meta' && /\bitemprop\s*=/i.test(attrs)) { itemprop++; return ''; }
        let next = attrs;
        const before = next;
        next = removeAttrsIn(next, (an) => {
          if (an === 'data-lps-eid') { eid++; return true; }
          return false;
        });
        if (name === 'html') {
          next = removeAttrsIn(next, (an, av) => {
            if (an === 'itemscope') { micro++; return true; }
            if (an === 'itemtype' && /schema\.org/i.test(av)) { micro++; return true; }
            return false;
          });
        }
        if (next === before) return null;
        return '<' + name + next + '>';
      })
    );
    // The JSON-LD <script> tags are protected chunks, so their start tags are
    // invisible to editTags above; reach them explicitly.
    out2 = withProtected(out2, (text, chunks) => {
      for (const c of chunks) {
        if (c.removed) continue;
        if (!['script', 'style', 'pre', 'textarea'].includes(c.kind)) continue;
        editChunkOpenTag(c, (tag, attrs) => removeAttrsIn(attrs, (an) => {
          if (an === 'data-lps-eid') { eid++; return true; }
          return false;
        }));
      }
      return text;
    });
    notes.push('removed ' + eid + ' data-lps-eid attribute(s)');
    if (micro) notes.push('removed ' + micro + ' schema.org microdata attribute(s) from <html> (SEO-15)');
    if (itemprop) notes.push('removed ' + itemprop + ' <meta itemprop> tag(s) duplicating the canonical (SEO-15)');
    return { html: out2, notes };
  }
};

/* ---------------------------------------------------------------- 4 */
const GTM_NOSCRIPT_RE = /googletagmanager\.com\/ns\.html/i;

const dedupeGtm = {
  name: 'dedupe-gtm',
  description:
    'BRIEF item 7: removes the synchronous inline GTM loader that is the FIRST ' +
    'element in <head>, ahead of <meta charset> (a spec violation). The tag ' +
    'itself is re-added by defer-third-party as an idle-loaded boot, so GTM ' +
    'keeps working. Also drops the empty duplicate "Google Tag Manager" / ' +
    '"End Google Tag Manager" comment pair left inside ws:header-embeddings and ' +
    'dedupes the two GTM <noscript> iframes every page ships (body top plus ' +
    'ws:footer-embeddings), keeping one canonical copy.',
  run(html, ctx) {
    const notes = [];
    const gtmId = (ctx && ctx.cfg && ctx.cfg.site && ctx.cfg.site.gtmId) || 'GTM-MKTJCBZG';
    let removedInline = 0;
    let removedComments = 0;
    let removedNoscript = 0;

    const out = withProtected(html, (text, chunks) => {
      // (a) the synchronous inline GTM loader
      for (const i of findChunks(chunks, (c) => c.kind === 'script' && /gtm\.start/.test(c.raw))) {
        notes.push('removed the inline synchronous GTM loader (' + chunks[i].raw.length +
          ' B) — re-added deferred by defer-third-party');
        text = dropChunk(text, chunks, i);
        removedInline++;
      }

      // (b) "Google Tag Manager" comment pairs that now wrap nothing
      for (;;) {
        const opens = findChunks(chunks, (c) =>
          c.kind === 'comment' && /^<!--\s*Google Tag Manager\s*-->$/i.test(c.raw.trim()));
        let cut = false;
        for (const oi of opens) {
          const a = text.indexOf(tokenFor(oi));
          if (a === -1) continue;
          const rest = text.slice(a + tokenFor(oi).length);
          const m = new RegExp('^\\s*' + TOK_A + '(\\d+)' + TOK_B).exec(rest);
          if (!m) continue;
          const ci = Number(m[1]);
          if (!/^<!--\s*End Google Tag Manager\s*-->$/i.test(chunks[ci].raw.trim())) continue;
          const b = a + tokenFor(oi).length + m[0].length;
          chunks[oi].removed = true;
          chunks[ci].removed = true;
          text = text.slice(0, a) + text.slice(b);
          removedComments += 2;
          cut = true;
          break;
        }
        if (!cut) break;
      }

      // (c) duplicate GTM noscript iframes — keep the first, canonicalised.
      //     The inline style is Google's own boilerplate and lives inside
      //     <noscript>, which is only parsed when scripting is off; it is not
      //     subject to the render.mjs "no inline style=" rule.
      let seen = 0;
      text = text.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/gi, (blk) => {
        if (!GTM_NOSCRIPT_RE.test(blk)) return blk;
        seen++;
        if (seen === 1) {
          return '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=' + esc(gtmId) +
            '" height="0" width="0" title="Google Tag Manager" style="display:none;visibility:hidden"></iframe></noscript>';
        }
        removedNoscript++;
        return '';
      });

      // (d) comment fences whose iframe we just removed
      for (const i of findChunks(chunks, (c) => c.kind === 'comment' && /Google Tag Manager \(noscript\)/i.test(c.raw))) {
        const a = text.indexOf(tokenFor(i));
        if (a === -1) continue;
        if (GTM_NOSCRIPT_RE.test(text.slice(Math.max(0, a - 400), a + 400))) continue;
        text = dropChunk(text, chunks, i);
        removedComments++;
      }
      return text;
    });

    if (!removedInline) notes.push('no inline GTM loader on this page');
    if (removedComments) notes.push('removed ' + removedComments + ' empty/orphaned GTM comment marker(s)');
    if (removedNoscript) {
      notes.push('removed ' + removedNoscript + ' duplicate GTM <noscript> iframe(s); kept one, now with ' +
        'title="Google Tag Manager" (SA-15)');
    }
    return { html: out, notes };
  }
};

/* ---------------------------------------------------------------- 5 */
const hoistCharset = {
  name: 'hoist-charset',
  description:
    'BRIEF item 7: guarantees <meta charset> is the first child of <head>. In ' +
    'the export it sits behind the synchronous GTM script and the Search Atlas ' +
    'dynamic_optimization script, which makes the encoding declaration ' +
    'non-conforming and can push it past the 1024-byte sniff window.',
  run(html) {
    const notes = [];
    const out = withProtected(html, (text) => {
      const head = /<head\b[^>]*>/i.exec(text);
      if (!head) { notes.push('no <head> element found'); return text; }
      const headEnd = head.index + head[0].length;
      const cm = /<meta\b[^>]*\bcharset\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)[^>]*>/i.exec(text);
      if (!cm) {
        notes.push('no <meta charset> present — inserted <meta charset="utf-8"> as the first child of <head>');
        return text.slice(0, headEnd) + '<meta charset="utf-8">' + text.slice(headEnd);
      }
      const before = text.slice(headEnd, cm.index);
      if (!/\S/.test(before)) {
        notes.push('<meta charset> is already the first child of <head>');
        return text;
      }
      const tag = cm[0];
      const stripped = text.slice(0, cm.index) + text.slice(cm.index + tag.length);
      notes.push('hoisted ' + tag + ' to the first child of <head> (it was ' + before.length +
        ' B deep, behind the GTM and dynamic_optimization scripts)');
      return stripped.slice(0, headEnd) + tag + stripped.slice(headEnd);
    });
    return { html: out, notes };
  }
};

/* ---------------------------------------------------------------- 6 */
const LEGACY_BREADCRUMB_RES = [
  /<div\b[^>]*\bclass="breadcrumb"[^>]*>/i,
  /<div\b[^>]*\bclass="bc"[^>]*>/i
];

const ssrChrome = {
  name: 'ssr-chrome',
  description:
    'BRIEF item 4 / SA-01 / SA-02 / SA-03 / SEO-06: the export has 0 <header> ' +
    'and 0 <nav> in 20 of 21 pages because /assets/mega-menu.min.js builds the ' +
    'whole header at runtime with insertAdjacentHTML("afterbegin"), which also ' +
    'buries the skip link about ten tab stops deep. This pass drops that script ' +
    'and writes the SSR chrome in the mandated body order — skip link, ' +
    '<header>, <main id="main">, <footer> — wrapping the page content in <main> ' +
    'on the 18 pages that lack one and replacing the <div class="breadcrumb"> / ' +
    '<div class="bc"> literal-slash breadcrumbs with the rendered ' +
    '<nav aria-label="Breadcrumb"><ol>. Partials come from ctx.partials, built ' +
    'by build/sync.mjs from build/lib/render.mjs.',
  run(html, ctx) {
    const notes = [];
    const P = (ctx && ctx.partials) || {};
    const assets = (ctx && ctx.assets) || {};
    if (!P.header && !P.footer && !P.skipLink) {
      notes.push('SKIPPED: ctx.partials supplies no header/footer/skipLink — nothing to inject');
      return { html, notes };
    }

    const out = withProtected(html, (text, chunks) => {
      // (a) the runtime header builder is obsolete
      for (const i of findChunks(chunks, (c) => c.kind === 'script' && /mega-menu[^"']*\.js/i.test(c.raw))) {
        notes.push('removed the runtime header builder <script src=".../mega-menu*.js"> ' +
          '(29,331 B; JSCSS-02 attributes 561.6 ms of Style & Layout to the runtime header)');
        text = dropChunk(text, chunks, i);
      }

      const bodyOpen = /<body\b[^>]*>/i.exec(text);
      if (!bodyOpen) { notes.push('WARNING: no <body> element — chrome not injected'); return text; }
      const bodyStart = bodyOpen.index + bodyOpen[0].length;
      const bodyCloseIdx = text.toLowerCase().lastIndexOf('</body>');
      if (bodyCloseIdx === -1) { notes.push('WARNING: no </body> — chrome not injected'); return text; }

      let inner = text.slice(bodyStart, bodyCloseIdx);

      // (b) split off everything after the legacy </footer>: the trailing
      //     behaviour scripts and the ws:footer-embeddings fences.
      let tail = '';
      const footerEl = findElement(inner, 'footer', /<footer\b[^>]*>/i);
      if (footerEl) {
        tail = inner.slice(footerEl.end);
        inner = inner.slice(0, footerEl.start);
        notes.push('replaced the legacy <footer> (' + (footerEl.end - footerEl.start) +
          ' B; <h4> column titles, and the only two routes it omits are the two service hubs) with renderFooter() output');
      } else {
        notes.push('no legacy <footer> found — appending renderFooter() output');
      }

      // (c) lift the GTM noscript out of the content region; the skip link
      //     must be the first node of <body> (SA-03).
      const noscripts = [];
      inner = inner.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/gi, (blk) => {
        if (!GTM_NOSCRIPT_RE.test(blk)) return blk;
        noscripts.push(blk);
        return '';
      });
      // the "(noscript)" comment fences guarded an iframe that has just moved
      if (noscripts.length) {
        for (const ci of tokensIn(inner)) {
          const c = chunks[ci];
          if (c.removed || c.kind !== 'comment') continue;
          if (!/Google Tag Manager \(noscript\)/i.test(c.raw)) continue;
          inner = inner.split(tokenFor(ci)).join('');
          c.removed = true;
        }
      }

      // (d) drop the legacy skip link (injected behind the header today)
      let removedSkip = 0;
      inner = inner.replace(/<a\b[^>]*href="#main"[^>]*>[\s\S]*?<\/a\s*>/gi, (a) => {
        if (!/skip to main content/i.test(textOf(a))) return a;
        removedSkip++;
        return '';
      });
      if (removedSkip) {
        notes.push('removed ' + removedSkip + ' legacy skip link(s) — SA-03: injected behind the header, ' +
          'so it skipped nothing and Lighthouse reported the audit as notApplicable');
      }

      // (e) legacy breadcrumbs -> rendered <nav aria-label="Breadcrumb">
      let removedCrumbs = 0;
      for (const re of LEGACY_BREADCRUMB_RES) {
        const el = findElement(inner, 'div', re);
        if (!el) continue;
        inner = inner.slice(0, el.start) + inner.slice(el.end);
        removedCrumbs++;
      }
      const smb = findElement(inner, 'nav', /<nav\b[^>]*\bclass="sm-breadcrumb"[^>]*>/i);
      if (smb) { inner = inner.slice(0, smb.start) + inner.slice(smb.end); removedCrumbs++; }
      if (removedCrumbs) {
        notes.push('removed ' + removedCrumbs + ' legacy breadcrumb block(s) — SEO-02: <div> with literal "/" ' +
          'text nodes, no <ol>, no aria-current');
      }

      // (f) the content region: reuse an existing <main>, or create one
      let content;
      const mainEl = findElement(inner, 'main', /<main\b[^>]*>/i);
      if (mainEl) {
        content = mainEl.inner;
        const lead = inner.slice(0, mainEl.start);
        const trail = inner.slice(mainEl.end);
        if (textOf(lead) || textOf(trail)) {
          content = lead + content + trail;
          notes.push('content existed outside <main>; folded it into the new <main id="main">');
        }
        notes.push('reused the existing <main>, set id="main", dropped the redundant role="main"');
      } else {
        content = inner;
        notes.push('no <main> on this page (18 of 21 lack one) — wrapped the page content in <main id="main">');
      }

      // (g) related block: the export's per-page "Continue exploring" copy is
      //     real editorial content, so it is preserved. renderRelated() output
      //     is injected only where the page has none.
      let related = '';
      if (!/class="mtfs-related"/i.test(content)) {
        if (P.related) {
          related = P.related;
          notes.push('page had no related-links block — injected renderRelated() output');
        }
      } else {
        notes.push('kept the page\'s existing .mtfs-related block (hand-written per-page copy; ' +
          'no pass rewrites body copy)');
      }

      const navScript = assets.navJsHref
        ? '<script src="' + esc(assets.navJsHref) + '" defer></script>'
        : '';
      if (!assets.navJsHref) notes.push('WARNING: ctx.assets.navJsHref missing — no nav behaviour script emitted');

      const rebuilt =
        (P.skipLink || '') +
        noscripts.join('') +
        (P.header || '') +
        '<main id="main">' +
        (P.breadcrumbs || '') +
        content +
        related +
        '</main>' +
        (P.footer || '') +
        tail +
        navScript;

      if (P.breadcrumbs) notes.push('injected the rendered <nav aria-label="Breadcrumb"><ol> as the first child of <main>');
      notes.push('body order is now: skip link -> <header> -> <main id="main"> -> <footer>');

      return text.slice(0, bodyStart) + rebuilt + text.slice(bodyCloseIdx);
    });

    return { html: out, notes };
  }
};

/* ---------------------------------------------------------------- 7 */
const inlineCriticalCss = {
  name: 'inline-critical-css',
  description:
    'BRIEF items 1, 2 and 10 / JSCSS-03, JSCSS-07, JSCSS-08, JSCSS-09: removes ' +
    'the render-blocking first-party stylesheets (/assets/mega-menu.css ' +
    '30,074 B / 602 ms, /assets/mtfs-images.css 3,128 B / 302 ms, ' +
    '/assets/css/fonts.css 6,688 B / 152 ms) and the per-page <style> blocks ' +
    '(43,351 B of byte-identical duplication site-wide, never cached), ' +
    'replacing them with one inline critical block plus a hashed async site ' +
    'sheet. The critical block is inlined directly — never media=print onload, ' +
    'never rel=preload as=style — because the mega panels, burger, back-to-top ' +
    'and search overlay are hidden by CSS alone, so deferring any of it paints ' +
    'them expanded in flow.',
  run(html, ctx) {
    const notes = [];
    const assets = (ctx && ctx.assets) || {};
    const critical = assets.criticalCss;
    const siteHref = assets.siteCssHref;
    if (!critical && !siteHref) {
      notes.push('SKIPPED: ctx.assets.criticalCss and ctx.assets.siteCssHref are both absent');
      return { html, notes };
    }

    const out = withProtected(html, (text, chunks) => {
      // (a) drop first-party render-blocking stylesheets
      const dropped = [];
      text = text.replace(new RegExp('[ \\t]*<link\\b(' + A + ')>\\r?\\n?', 'gi'), (tag, attrs) => {
        if (!/^stylesheet$/i.test((getAttr(attrs, 'rel') || '').trim())) return tag;
        const href = getAttr(attrs, 'href') || '';
        if (!/^\/assets\//.test(href)) return tag;
        dropped.push(href);
        return '';
      });
      if (dropped.length) {
        notes.push('removed ' + dropped.length + ' render-blocking <link rel=stylesheet>: ' + dropped.join(', ') +
          ' — css.mjs must have folded these into the critical block and the site sheet');
      }

      // (b) collapse the page's own <style> blocks
      const styleIdx = findChunks(chunks, (c) => c.kind === 'style');
      let styleBytes = 0;
      for (const i of styleIdx) {
        styleBytes += chunks[i].raw.length;
        text = dropChunk(text, chunks, i);
      }
      if (styleIdx.length) {
        notes.push('removed ' + styleIdx.length + ' inline <style> block(s), ' + styleBytes +
          ' B (un-cacheable, re-sent on every page view)');
      }

      // (c) insert the critical block + the async site sheet
      // Insert after </title> when there is one, else after <meta charset>, so
      // charset / viewport / title stay at the top of <head>.
      const head = /<head\b[^>]*>/i.exec(text);
      const title = /<\/title\s*>/i.exec(text);
      const charset = /<meta\b[^>]*charset[^>]*>/i.exec(text);
      let at;
      if (title) at = title.index + title[0].length;
      else if (charset) at = charset.index + charset[0].length;
      else if (head) at = head.index + head[0].length;
      else { notes.push('WARNING: no <head> — critical CSS not inlined'); return text; }

      let block = '';
      if (critical) {
        block += '<style id="mtfs-critical">' + critical + '</style>';
        notes.push('inlined ' + critical.length + ' B of critical CSS as <style id="mtfs-critical">');
      }
      if (siteHref) {
        // media="print" downloads at low priority without blocking render; the
        // one-line bootstrap below flips it to all on load. No inline on*
        // attribute is used, so a strict CSP still applies.
        block +=
          '<link rel="stylesheet" href="' + esc(siteHref) + '" media="print" data-mtfs-async>' +
          '<noscript><link rel="stylesheet" href="' + esc(siteHref) + '"></noscript>' +
          '<script>(function(){var l=document.querySelector(\'link[data-mtfs-async]\');if(!l)return;' +
          'var f=function(){l.media=\'all\';l.removeAttribute(\'data-mtfs-async\')};' +
          'if(l.sheet)f();else l.addEventListener(\'load\',f,{once:true})})();</script>';
        notes.push('async site stylesheet ' + siteHref +
          ' (media=print flipped to all on load, <noscript> fallback, no inline on* attribute)');
      }
      return text.slice(0, at) + block + text.slice(at);
    });

    return { html: out, notes };
  }
};

/* ---------------------------------------------------------------- 8 */
const deferThirdParty = {
  name: 'defer-third-party',
  description:
    'BRIEF items 7 and 8 / JSCSS-04: replaces the synchronous GTM boot and the ' +
    'parser-discovered dashboard.fertilerank.com/scripts/dynamic_optimization.js ' +
    'with one idle loader (requestIdleCallback with a 4 s timeout, or first ' +
    'interaction, whichever comes first) and moves the ~7,090 B inline LPS ' +
    'visitor tracker out of every page\'s <head> into the cacheable hashed ' +
    '/assets/analytics.<hash>.js, passing project_id and tracking_secret as ' +
    'data-* so the /api/track/ and /api/event/ payloads stay byte-identical. ' +
    'Also drops the 4,708 B ws:form-submit-shim on the 20 pages that contain no ' +
    'form[action*="/api/forms/"], and gives the GTM noscript iframe the ' +
    'title="Google Tag Manager" it lacks on all 21 pages (SA-15). GTM and ' +
    'dynamic_optimization are deferred, never deleted.',
  run(html, ctx) {
    const notes = [];
    const cfg = (ctx && ctx.cfg) || {};
    const site = cfg.site || {};
    const sa = site.searchAtlas || {};
    const assets = (ctx && ctx.assets) || {};
    const gtmId = site.gtmId || 'GTM-MKTJCBZG';

    const out = withProtected(html, (text, chunks) => {
      // (a) the Search Atlas dynamic-optimization tag
      let doSrc = sa.dynamicOptimizationSrc || '';
      let doUuid = sa.dynamicOptimizationUuid || '';
      for (const i of findChunks(chunks, (c) => c.kind === 'script' && /dynamic_optimization\.js/i.test(c.raw))) {
        const m = /<script\b([\s\S]*?)>/i.exec(chunks[i].raw);
        if (m) {
          doSrc = doSrc || getAttr(m[1], 'src') || '';
          doUuid = doUuid || getAttr(m[1], 'data-uuid') || '';
        }
        text = dropChunk(text, chunks, i);
        notes.push('removed the parser-discovered <script id="sa-dynamic-optimization"> — folded into the idle loader');
      }

      // (a2) /404/ ships its own pre-bundled runtime.<hash>.js, which is a
      // second copy of the GTM boot AND the LPS visitor tracker. analytics.js
      // supersedes both, so leaving it would initialise GTM twice and run two
      // trackers on that one page. The other three /assets/404/ references
      // (route CSS, the legacy mega-menu and consultation-modal bundles) are
      // already removed by inline-critical-css and the modal passes; this is
      // the last one, and removing it makes the whole directory unreferenced.
      for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].kind !== 'script') continue;
        const m = /<script\b([\s\S]*?)>/i.exec(chunks[i].raw);
        if (!m) continue;
        const src = getAttr(m[1], 'src') || '';
        if (!/^\/assets\/404\/runtime\.[0-9a-f]+\.js$/.test(src)) continue;
        text = dropChunk(text, chunks, i);
        notes.push(
          `removed ${src} — the /404/ page's own bundled GTM boot + LPS tracker, ` +
            'superseded by the deferred analytics module (it would have run both)'
        );
      }

      // (b) the inline LPS visitor tracker -> cacheable module
      const trackerIdx = findChunks(chunks, (c) =>
        c.kind === 'script' && /api\/section-engagement\//.test(c.raw) && /_lps_vid/.test(c.raw));
      for (const i of trackerIdx) {
        const raw = chunks[i].raw;
        const pid = (/var P="([^"]+)"/.exec(raw) || [])[1] || sa.projectId || '';
        const secret = (/,S="([^"]+)"/.exec(raw) || [])[1] || sa.trackingSecret || '';
        if (assets.analyticsJsHref) {
          const tag =
            '<script src="' + esc(assets.analyticsJsHref) + '" defer' +
            (pid ? ' data-project-id="' + esc(pid) + '"' : '') +
            (secret ? ' data-tracking-secret="' + esc(secret) + '"' : '') +
            '></script>';
          chunks[i].removed = true;
          text = text.split(tokenFor(i)).join(tag);
          notes.push('moved the inline LPS visitor tracker (' + raw.length +
            ' B, un-cacheable, in <head> on every page) to ' + assets.analyticsJsHref +
            '; project_id and tracking_secret travel as data-* so base() and the ' +
            '/api/track/ and /api/event/ payloads are unchanged');
        } else {
          notes.push('WARNING: ctx.assets.analyticsJsHref missing — left the ' + raw.length +
            ' B inline LPS tracker in place rather than silently dropping analytics');
        }
      }

      // (c) the form shim is only useful where a builder form exists
      const hasForm = /<form\b[^>]*action="[^"]*\/api\/forms\/[^"]*"/i.test(text);
      if (!hasForm) {
        for (const i of findChunks(chunks, (c) => c.kind === 'script' && /__wsFormShim/.test(c.raw))) {
          notes.push('removed the ws:form-submit-shim (' + chunks[i].raw.length +
            ' B) — this page has no form[action*="/api/forms/"]');
          text = dropChunk(text, chunks, i);
        }
        for (const i of findChunks(chunks, (c) => c.kind === 'comment' && /ws:form-submit-shim/i.test(c.raw))) {
          text = dropChunk(text, chunks, i);
        }
      } else {
        notes.push('kept the ws:form-submit-shim — this page carries form[action*="/api/forms/"]');
      }

      // (d) the idle loader
      const bodyCloseIdx = text.toLowerCase().lastIndexOf('</body>');
      if (bodyCloseIdx === -1) {
        notes.push('WARNING: no </body> — idle third-party loader not injected');
      } else {
        const loader =
          '<script>(function(){var d=document,ran=0;' +
          'function boot(){if(ran)return;ran=1;' +
          'window.dataLayer=window.dataLayer||[];' +
          'window.dataLayer.push({\'gtm.start\':new Date().getTime(),event:\'gtm.js\'});' +
          'var g=d.createElement(\'script\');g.async=true;' +
          'g.src=\'https://www.googletagmanager.com/gtm.js?id=' + esc(gtmId) + '\';d.head.appendChild(g);' +
          (doSrc
            ? 'var o=d.createElement(\'script\');o.id=\'sa-dynamic-optimization\';' +
              (doUuid ? 'o.setAttribute(\'data-uuid\',\'' + esc(doUuid) + '\');' : '') +
              'o.async=true;o.src=\'' + esc(doSrc) + '\';d.head.appendChild(o);'
            : '') +
          '}' +
          'var EV=[\'pointerdown\',\'keydown\',\'touchstart\',\'scroll\'];' +
          'function once(){EV.forEach(function(e){removeEventListener(e,once,{capture:true})});boot()}' +
          'EV.forEach(function(e){addEventListener(e,once,{capture:true,passive:true,once:true})});' +
          'if(\'requestIdleCallback\'in window)requestIdleCallback(boot,{timeout:4000});' +
          'else setTimeout(boot,2500);' +
          '})();</script>';
        notes.push('injected the idle third-party loader for GTM ' + gtmId +
          (doSrc ? ' + dynamic_optimization.js' : '') +
          ' (requestIdleCallback with a 4 s timeout, or the first pointerdown/keydown/touchstart/scroll)');
        text = text.slice(0, bodyCloseIdx) + loader + text.slice(bodyCloseIdx);
      }

      // (e) accessible name on the GTM noscript iframe (SA-15)
      let titled = 0;
      text = text.replace(new RegExp('<iframe\\b(' + A + ')>', 'gi'), (whole, attrs) => {
        const src = getAttr(attrs, 'src') || '';
        if (!GTM_NOSCRIPT_RE.test(src)) return whole;
        if (getAttr(attrs, 'title')) return whole;
        titled++;
        return '<iframe' + setAttrIn(attrs, 'title', 'Google Tag Manager') + '>';
      });
      if (titled) notes.push('added title="Google Tag Manager" to ' + titled + ' noscript iframe(s) (SA-15)');

      return text;
    });

    return { html: out, notes };
  }
};

/* ---------------------------------------------------------------- 9 */
const lazyModal = {
  name: 'lazy-modal',
  description:
    'BRIEF item 12 / JSCSS-05: drops the eager ' +
    '<script src="/assets/book-consultation-modal.min.js" defer> that all 20 ' +
    'non-404 pages ship (58,472 B, of which a single 512x512 base64 PNG painted ' +
    'into a 28x28 box is 32,626 B) even though the modal only opens on user ' +
    'intent, and on the home page its popup instance is provably unreachable ' +
    'because #hero-form-card forces every trigger down the scrollIntoView ' +
    'branch. The module href is handed to nav.js as data-modal-src so the ' +
    'loader can fetch it on the three selectors the shipped code binds plus the ' +
    '#consult hash.',
  run(html, ctx) {
    const notes = [];
    const assets = (ctx && ctx.assets) || {};
    const out = withProtected(html, (text, chunks) => {
      let removed = 0;
      for (const i of findChunks(chunks, (c) => c.kind === 'script' && /(book-)?consultation-modal[^"']*\.js/i.test(c.raw))) {
        notes.push('removed the eager modal <script> tag — the module is now fetched on first intent');
        text = dropChunk(text, chunks, i);
        removed++;
      }
      if (!removed) notes.push('no eager modal <script> on this page');

      if (assets.modalJsHref) {
        let wired = 0;
        // The nav <script> ssr-chrome emitted is a protected chunk, so reach
        // its start tag directly rather than through the masked text.
        for (const i of findChunks(chunks, (c) => c.kind === 'script')) {
          const m = new RegExp('^<script\\b(' + A + ')>', 'i').exec(chunks[i].raw);
          if (!m) continue;
          if (!assets.navJsHref || (getAttr(m[1], 'src') || '') !== assets.navJsHref) continue;
          if (getAttr(m[1], 'data-modal-src') !== null) continue;
          editChunkOpenTag(chunks[i], (tag, attrs) => setAttrIn(attrs, 'data-modal-src', assets.modalJsHref));
          wired++;
        }
        if (wired) notes.push('wired data-modal-src="' + assets.modalJsHref + '" onto the nav script for the lazy loader');
        else {
          notes.push('WARNING: no nav script tag found to carry data-modal-src="' + assets.modalJsHref +
            '" (ssr-chrome emits it from ctx.assets.navJsHref)');
        }
      } else {
        notes.push('WARNING: ctx.assets.modalJsHref missing — the lazy loader has no module to fetch');
      }
      return text;
    });
    return { html: out, notes };
  }
};

/* --------------------------------------------------------------- 10 */
/**
 * Only handler pairs whose behaviour a :hover/:focus-visible rule reproduces
 * EXACTLY are stripped. The "restore" half of each pair must be a genuine
 * no-op — either '' (drop the inline style and fall back to the cascade) or
 * the literal value the element's own class already declares. Verified against
 * the export's CSS:
 *   .il32{color:rgba(255,255,255,.6)}          .il69{color:var(--lime)}
 *   footer .il21{color:rgba(255,255,255,.6)}   (inherited by .il30)
 *   .il63 == .btn-primary  background:var(--teal); border:2px solid var(--teal)
 *   .il64 == .btn-link     border-color:rgba(255,255,255,.75); background:transparent
 * Anything not in this table is LEFT IN PLACE and reported, because a stripped
 * handler that CSS does not reproduce is a silent behaviour regression.
 */
const SAFE_HANDLERS = [
  {
    id: 'hover-teal',
    on: {
      mouseover: ["this.style.color='#1F6E75'", "this.style.color='var(--teal)'"],
      mouseout: ["this.style.color=''", "this.style.color='rgba(255,255,255,.6)'"]
    },
    addClass: 'mtfs-hover-teal',
    css: '.mtfs-hover-teal:hover,.mtfs-hover-teal:focus-visible{color:var(--teal)}'
  },
  {
    id: 'skip-link',
    on: { focus: ["this.style.top='0'"], blur: ["this.style.top='-100%'"] },
    addClass: 'mtfs-skip-link',
    css: '.mtfs-skip-link:focus,.mtfs-skip-link:focus-visible{top:0}'
  },
  {
    id: 'contact-cta-link',
    on: { mouseover: ["this.style.color='var(--w)'"], mouseout: ["this.style.color='var(--lime)'"] },
    addClass: 'contact-cta-link',
    css: '.contact-cta-link:hover,.contact-cta-link:focus-visible{color:var(--w)}'
  },
  {
    id: 'btn-primary',
    on: {
      mouseover: ["this.style.background='var(--td)'; this.style.borderColor='var(--td)'"],
      mouseout: ["this.style.background='var(--teal)'; this.style.borderColor='var(--teal)'"]
    },
    requireClass: 'btn-primary',
    addClass: 'btn-primary',
    css: '.btn-primary:hover,.btn-primary:focus-visible{background:var(--td);border-color:var(--td)}'
  },
  {
    id: 'btn-link',
    on: {
      mouseover: ["this.style.borderColor='#fff'; this.style.background='rgba(255,255,255,.08)'"],
      mouseout: ["this.style.borderColor='rgba(255,255,255,.75)'; this.style.background='transparent'"]
    },
    requireClass: 'btn-link',
    addClass: 'btn-link',
    css: '.btn-link:hover,.btn-link:focus-visible{border-color:#fff;background:rgba(255,255,255,.08)}'
  }
];

function normHandler(v) {
  return decodeEntities(String(v)).replace(/\s+/g, ' ').replace(/;\s*$/, '').trim();
}

function matchBehaviour(handlers, attrs) {
  const names = Object.keys(handlers).sort().join(',');
  for (const b of SAFE_HANDLERS) {
    if (Object.keys(b.on).sort().join(',') !== names) continue;
    let ok = true;
    for (const k of Object.keys(b.on)) {
      if (!b.on[k].some((v) => normHandler(v) === handlers[k])) { ok = false; break; }
    }
    if (!ok) continue;
    if (b.requireClass && !hasClass(attrs, b.requireClass)) continue;
    return b;
  }
  return null;
}

const stripInlineHandlers = {
  name: 'strip-inline-handlers',
  description:
    'BRIEF item 9 / SA-09: the export carries 812 inline on* handlers on 406 ' +
    'elements (onmouseover 403, onmouseout 403, onfocus 3, onblur 3) that give ' +
    'mouse users a hover state and keyboard users nothing, block a strict CSP ' +
    'and cannot be minified. This pass removes ONLY the handler pairs whose ' +
    'behaviour a :hover/:focus-visible rule reproduces exactly, attaching a ' +
    'stable semantic class — never an il* name, because il13, il15, il23, il25, ' +
    'il30 and il33 each mean two different things depending on the page. Any ' +
    'handler carrying unique behaviour is left untouched and reported so a ' +
    'human can port it.',
  run(html) {
    const notes = [];
    let stripped = 0;
    let elements = 0;
    let skipped = 0;
    const cssNeeded = new Set();
    const skippedShapes = new Map();

    const out = withProtected(html, (text) =>
      editTags(text, (name, attrs) => {
        const list = parseAttrs(attrs);
        const handlers = {};
        for (const a of list) {
          if (/^on[a-z]+$/i.test(a.name)) handlers[a.name.toLowerCase().slice(2)] = normHandler(a.bare ? '' : a.value);
        }
        const keys = Object.keys(handlers);
        if (!keys.length) return null;
        elements++;
        const b = matchBehaviour(handlers, attrs);
        if (!b) {
          skipped++;
          const shape = '<' + name + ' class="' + (getAttr(attrs, 'class') || '') + '"> ' +
            keys.map((k) => 'on' + k + '="' + handlers[k] + '"').join(' ');
          skippedShapes.set(shape, (skippedShapes.get(shape) || 0) + 1);
          return null;
        }
        let next = removeAttrsIn(attrs, (an) => /^on[a-z]+$/i.test(an));
        stripped += keys.length;
        if (b.addClass) next = addClass(next, b.addClass);
        cssNeeded.add(b.css);
        return '<' + name + next + '>';
      })
    );

    if (stripped) {
      notes.push('removed ' + stripped + ' inline on* attribute(s) from ' + (elements - skipped) + ' element(s)');
      for (const c of cssNeeded) notes.push('CSS required in the shared sheet: ' + c);
    } else {
      notes.push('no strippable inline on* handlers left on this page — ssr-chrome already replaced the ' +
        'header/footer/skip-link region, which is where 38 of the 40 per-page handlers live');
    }
    if (skipped) {
      notes.push('SKIPPED ' + skipped + ' element(s) whose handler behaviour CSS does not reproduce — ' +
        'port these by hand rather than losing the behaviour:');
      for (const [shape, n] of skippedShapes) notes.push('  x' + n + ' ' + shape);
    }
    return { html: out, notes };
  }
};

/* --------------------------------------------------------------- 11 */
/** Generic anchor text -> descriptive text, sourced from routes[].navLabel. */
const GENERIC_ANCHORS = new Map([
  ['learn more', (label, route) => (route && route.id === 'contact' ? 'Contact MedTech For Solutions' : 'Explore ' + label)],
  ['get started', (label, route) => (route && route.id === 'contact' ? 'Contact MedTech For Solutions' : 'Get Started with ' + label)],
  ['click here', (label) => 'Explore ' + label],
  ['read more', (label) => 'Explore ' + label]
]);

/** The decorative stat-panel labels the content audit names (AISEO-12). */
const STAT_PANEL_LABELS = new Set([
  'gpo savings dashboard', 'staffing overview', 'marketing performance',
  'compliance scorecard', 'practice growth', 'lab performance dashboard',
  'financial health', 'call center metrics', 'workforce metrics', 'risk overview'
]);

const fixA11y = {
  name: 'fix-a11y',
  description:
    'BRIEF item 11: the failing accessibility and SEO audits that live in the ' +
    'page markup. heading-order (score 0) — demotes the decorative stat-panel ' +
    '<h3> sitting between the <h1> and the first <h2> on the service pages, ' +
    'promotes the legal "On This Page" <h4> to <h2>, lifts the /about/ mission ' +
    'pillar <h4> to <h3>, promotes the sitemap paragraph section titles, and ' +
    'repairs any <h4> left inside a <footer>. link-text (score 0) and ' +
    'label-content-name-mismatch (score 0) — rewrites the 26 "Learn More" and 6 ' +
    '"Get Started" anchors to name their destination from routes[].navLabel and ' +
    'deletes the aria-label that contradicted the visible text. SA-13 — wires ' +
    'the FAQ accordion (id, aria-controls, hidden, questions wrapped in <h3>) ' +
    'and rewrites the tail script so the FAQ toggles hidden instead of ' +
    'max-height:0 and AOS uses ONE IntersectionObserver with ' +
    'unobserve-after-first-intersection instead of 25 never-disconnected ones ' +
    '(JSCSS-11). Also drops the redundant implicit roles role="contentinfo" and ' +
    'role="main". No heading text and no body copy is changed.',
  run(html, ctx) {
    const notes = [];
    let n;

    const out = withProtected(html, (text, chunks) => {
      /* (a) redundant implicit roles ------------------------------------ */
      n = 0;
      text = editTags(text, (name, attrs) => {
        const implicit = { footer: 'contentinfo', main: 'main', nav: 'navigation', header: 'banner' }[name];
        if (!implicit) return null;
        if ((getAttr(attrs, 'role') || '').toLowerCase() !== implicit) return null;
        n++;
        return '<' + name + removeAttrsIn(attrs, (an) => an === 'role') + '>';
      });
      if (n) notes.push('removed ' + n + ' redundant implicit role attribute(s)');

      /* (b) heading order ------------------------------------------------ */
      // b1: any <h4> still inside a <footer> becomes <h2>. renderFooter()
      //     normally owns this; this is the safety net for a legacy footer.
      const footerEl = findElement(text, 'footer', /<footer\b[^>]*>/i);
      if (footerEl) {
        let fixedFooter = 0;
        const repaired = footerEl.inner.replace(new RegExp('<h4\\b(' + A + ')>([\\s\\S]*?)<\\/h4\\s*>', 'gi'),
          (w, a, inner) => { fixedFooter++; return '<h2' + a + '>' + inner + '</h2>'; });
        if (fixedFooter) {
          text = text.slice(0, footerEl.openEnd) + repaired + text.slice(footerEl.openEnd + footerEl.inner.length);
          notes.push('promoted ' + fixedFooter + ' footer <h4> column title(s) to <h2> — the exact node ' +
            'Lighthouse cites for heading-order (div.ftg > div.ftc > h4.il27, "LAB SOLUTIONS")');
        }
      }

      // b2: the legal "On This Page" <h4> inside <aside class="toc"> -> <h2>
      let toc = 0;
      text = text.replace(
        new RegExp('(<aside\\b' + A + 'class="toc"' + A + '>\\s*)<h4\\b(' + A + ')>([\\s\\S]*?)<\\/h4\\s*>', 'gi'),
        (w, open, a, inner) => {
          toc++;
          const id = 'mtfs-toc-heading';
          const openWithLabel = open.replace(/>(\s*)$/, ' aria-labelledby="' + id + '">$1');
          return openWithLabel + '<h2' + setAttrIn(a, 'id', id) + '>' + inner + '</h2>';
        });
      if (toc) {
        notes.push('promoted the legal table-of-contents <h4> to <h2> and gave <aside class="toc"> an ' +
          'aria-labelledby — closes the h1 -> h4 jump on /privacy-policy/ and /terms-of-service/');
      }

      // b3: the /about/ mission pillars <h4> -> <h3> (h2 -> h4 jump)
      const pillars = findElement(text, 'div', /<div\b[^>]*\bclass="pillars"[^>]*>/i);
      if (pillars) {
        let pn = 0;
        const fixed = pillars.inner.replace(new RegExp('<h4\\b(' + A + ')>([\\s\\S]*?)<\\/h4\\s*>', 'gi'),
          (w, a, inner) => { pn++; return '<h3' + a + '>' + inner + '</h3>'; });
        if (pn) {
          text = text.slice(0, pillars.openEnd) + fixed + text.slice(pillars.openEnd + pillars.inner.length);
          notes.push('promoted ' + pn + ' /about/ mission-pillar <h4> to <h3> (h2 -> h4 jump)');
        }
      }

      // b4: decorative stat-panel headings between the <h1> and the first <h2>
      //     become <p>, preserving class and text (AISEO-12).
      const h1 = /<h1\b[^>]*>/i.exec(text);
      if (h1) {
        const rel = text.slice(h1.index).search(/<h2\b/i);
        const zoneEnd = rel === -1 ? text.length : h1.index + rel;
        const zone = text.slice(h1.index, zoneEnd);
        let demoted = 0;
        const fixedZone = zone.replace(new RegExp('<h([34])\\b(' + A + ')>([\\s\\S]*?)<\\/h\\1\\s*>', 'gi'),
          (w, lvl, a, inner) => {
            if (!STAT_PANEL_LABELS.has(textOf(inner).toLowerCase())) return w;
            demoted++;
            return '<p' + a + '>' + inner + '</p>';
          });
        if (demoted) {
          text = text.slice(0, h1.index) + fixedZone + text.slice(zoneEnd);
          notes.push('demoted ' + demoted + ' decorative stat-panel heading(s) between <h1> and the first ' +
            '<h2> to <p> (text and class preserved) — closes the h1 -> h3 jump on the service pages');
        }
      }

      // b5: /contact/ nested location heading
      let loc = 0;
      text = text.replace(new RegExp('<h2\\b(' + A + 'id="loc-address"' + A + ')>([\\s\\S]*?)<\\/h2\\s*>', 'gi'),
        (w, a, inner) => { loc++; return '<h3' + a + '>' + inner + '</h3>'; });
      if (loc) {
        notes.push('demoted #loc-address from <h2> to <h3> — it was nested inside the section already ' +
          'labelled by #loc-h');
      }

      // b6: sitemap section titles marked up as paragraphs / divs
      let smSec = 0;
      let smCard = 0;
      text = text.replace(new RegExp('<p\\b(' + A + 'class="sm-sec-title"' + A + ')>([\\s\\S]*?)<\\/p\\s*>', 'gi'),
        (w, a, inner) => { smSec++; return '<h2' + a + '>' + inner + '</h2>'; });
      text = text.replace(new RegExp('<div\\b(' + A + 'class="sm-card-head"' + A + ')>([\\s\\S]*?)<\\/div\\s*>', 'gi'),
        (w, a, inner) => {
          if (/<div\b/i.test(inner)) return w;
          smCard++;
          return '<h3' + a + '>' + inner + '</h3>';
        });
      if (smSec || smCard) {
        notes.push('promoted ' + smSec + ' sitemap section title(s) to <h2> and ' + smCard +
          ' card title(s) to <h3> — SA-11: the sitemap outline was h1 -> h2 -> h2 -> h4');
      }

      /* (c) link text + label-content-name-mismatch ----------------------- */
      let rewritten = 0;
      let ariaDropped = 0;
      const rewrites = [];
      text = text.replace(new RegExp('<a\\b(' + A + ')>([\\s\\S]*?)<\\/a\\s*>', 'gi'), (whole, attrs, inner) => {
        const fn = GENERIC_ANCHORS.get(textOf(inner).toLowerCase());
        if (!fn) return whole;
        const href = getAttr(attrs, 'href') || '';
        const target = routeByPath(ctx, pathOfHref(href));
        const label = target ? (target.navLabel || target.title || '') : '';
        if (!label) {
          notes.push('SKIPPED generic anchor "' + textOf(inner) + '" -> ' + href +
            ': no route in the manifest, so there is no navLabel to name the destination');
          return whole;
        }
        const next = fn(label, target);
        // Replace only the leading text node; any trailing icon markup stays.
        let replaced = false;
        const newInner = inner.replace(/^(\s*)([^<]+)/, (m0, ws, txt) => {
          if (!txt.trim()) return m0;
          replaced = true;
          return ws + next.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        });
        if (!replaced) return whole;
        let nextAttrs = attrs;
        if (getAttr(attrs, 'aria-label') !== null) {
          nextAttrs = removeAttrsIn(nextAttrs, (an) => an === 'aria-label');
          ariaDropped++;
        }
        rewritten++;
        rewrites.push('"' + textOf(inner) + '" -> "' + next + '" (' + href + ')');
        return '<a' + nextAttrs + '>' + newInner + '</a>';
      });
      if (rewritten) {
        notes.push('rewrote ' + rewritten + ' generic anchor(s) to name their destination from ' +
          'routes[].navLabel, and deleted ' + ariaDropped + ' aria-label(s) that contradicted the visible text');
        for (const r of rewrites) notes.push('  ' + r);
        notes.push('  FOR REVIEW: link text is the only copy this pipeline rewrites, and only because the ' +
          'auditors require it — one edit clears both the SEO link-text failure and the a11y ' +
          'label-content-name-mismatch failure.');
      }

      /* (d) FAQ accordion ------------------------------------------------- */
      let faq = 0;
      text = text.replace(
        new RegExp('<button\\b(' + A + 'class="fq"' + A + ')>([\\s\\S]*?)<\\/button\\s*>\\s*<div\\b(' + A + 'class="fa"' + A + ')>', 'gi'),
        (whole, bAttrs, q, dAttrs) => {
          faq++;
          const aid = 'mtfs-faq-a' + faq;
          const qid = 'mtfs-faq-q' + faq;
          const expanded = (getAttr(bAttrs, 'aria-expanded') || 'false') === 'true';
          let b = setAttrIn(bAttrs, 'aria-controls', aid);
          b = setAttrIn(b, 'id', qid);
          b = setAttrIn(b, 'aria-expanded', expanded ? 'true' : 'false');
          if (getAttr(b, 'type') === null) b = setAttrIn(b, 'type', 'button');
          let d = setAttrIn(dAttrs, 'id', aid);
          d = setAttrIn(d, 'role', 'region');
          d = setAttrIn(d, 'aria-labelledby', qid);
          return '<h3 class="mtfs-faq-q"><button' + b + '>' + q + '</button></h3><div' + d +
            (expanded ? '' : ' hidden') + '>';
        }
      );
      if (faq) {
        notes.push('wired ' + faq + ' FAQ item(s): each question wrapped in <h3>, aria-controls pointing at ' +
          'the answer id, answers toggled with the hidden attribute instead of max-height:0 — SA-13: ' +
          'max-height:0 with overflow:hidden leaves every collapsed answer in the accessibility tree and ' +
          'the tab order, and the 400 px cap silently truncated the GPO answer');
      }

      /* (e) the tail behaviour script ------------------------------------ */
      const aosIdx = findChunks(chunks, (c) => c.kind === 'script' && /querySelectorAll\('\.aos'\)/.test(c.raw));
      for (const i of aosIdx) {
        const replacement =
          '<script>(function(){' +
          'var a=document.querySelectorAll(\'.aos\');' +
          'if(a.length&&\'IntersectionObserver\'in window){' +
          'var io=new IntersectionObserver(function(es){es.forEach(function(x){' +
          'if(x.isIntersecting){x.target.classList.add(\'v\');io.unobserve(x.target)}})},{threshold:.1});' +
          'a.forEach(function(el){io.observe(el)})}' +
          'else{a.forEach(function(el){el.classList.add(\'v\')})}' +
          'document.querySelectorAll(\'.fq\').forEach(function(b){b.addEventListener(\'click\',function(){' +
          'var open=b.getAttribute(\'aria-expanded\')===\'true\';' +
          'document.querySelectorAll(\'.fq\').forEach(function(x){x.setAttribute(\'aria-expanded\',\'false\');' +
          'var p=document.getElementById(x.getAttribute(\'aria-controls\'));if(p)p.hidden=true;' +
          'var it=x.closest(\'.fi\');if(it)it.classList.remove(\'op\')});' +
          'if(!open){b.setAttribute(\'aria-expanded\',\'true\');' +
          'var pa=document.getElementById(b.getAttribute(\'aria-controls\'));if(pa)pa.hidden=false;' +
          'var i2=b.closest(\'.fi\');if(i2)i2.classList.add(\'op\')}})});' +
          '})();</script>';
        chunks[i].removed = true;
        text = text.split(tokenFor(i)).join(replacement);
        notes.push('rewrote the tail behaviour script: ONE IntersectionObserver with ' +
          'unobserve-after-first-intersection replaces the per-element observers (25 never-disconnected ' +
          'observers on the home page, JSCSS-11), and the FAQ now toggles the hidden attribute and reads ' +
          'the server-rendered aria-expanded state instead of assuming a starting value');
      }
      if (!aosIdx.length) notes.push('no .aos/FAQ tail script on this page — nothing to rewrite');

      return text;
    });

    /* (f) form labels — report only, never invent a label ---------------- */
    const unlabeled = [];
    withProtected(out, (text) => {
      const labelFor = new Set();
      for (const m of text.matchAll(new RegExp('<label\\b(' + A + ')>', 'gi'))) {
        const f = getAttr(m[1], 'for');
        if (f) labelFor.add(f);
      }
      const wrapping = [];
      for (const el of text.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label\s*>/gi)) wrapping.push(el[1]);
      for (const m of text.matchAll(new RegExp('<(input|select|textarea)\\b(' + A + ')>', 'gi'))) {
        const attrs = m[2];
        const type = (getAttr(attrs, 'type') || '').toLowerCase();
        if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) continue;
        const id = getAttr(attrs, 'id');
        if (id && labelFor.has(id)) continue;
        if (getAttr(attrs, 'aria-label') || getAttr(attrs, 'aria-labelledby') || getAttr(attrs, 'title')) continue;
        if (wrapping.some((w) => w.includes(m[0]))) continue;
        unlabeled.push(m[0].slice(0, 120));
      }
      return text;
    });
    if (unlabeled.length) {
      notes.push('SKIPPED ' + unlabeled.length + ' form control(s) with no programmatic label — a label is ' +
        'copy, so a human must write it:');
      for (const u of unlabeled) notes.push('  ' + u);
    } else {
      notes.push('form labels: every control on this page already has a <label for>, a wrapping <label>, ' +
        'or an aria-label');
    }

    notes.push('NOT FIXED HERE: aria-allowed-attr (role="option" plus aria-pressed on the 8 consultation ' +
      'service buttons) and aria-progressbar-name live in the modal JavaScript, not in the page markup — ' +
      'they belong to the consult-modal module.');

    return { html: out, notes };
  }
};

/* --------------------------------------------------------------- 12 */
const preloadLcp = {
  name: 'preload-lcp',
  description:
    'Emits at most ONE <link rel=preload as=image fetchpriority=high>, chosen ' +
    'from the page\'s own above-the-fold markup. The export ships two on the ' +
    'home page and on /about/, and on /about/ the first one does not even point ' +
    'at the hero image. On the home page the measured LCP element is h1#h1 — a ' +
    'text node in Sora — and the hero has no image at all (its right column is ' +
    'the JS-built #hero-form-card), so this pass emits ZERO image preloads ' +
    'there; the high-priority font preload is renderHeadTags() work (JSCSS-08).',
  run(html) {
    const notes = [];
    const out = withProtected(html, (text) => {
      const existing = [];
      text = text.replace(new RegExp('[ \\t]*<link\\b(' + A + ')>\\r?\\n?', 'gi'), (whole, attrs) => {
        const rel = (getAttr(attrs, 'rel') || '').toLowerCase();
        const as = (getAttr(attrs, 'as') || '').toLowerCase();
        if (rel !== 'preload' || as !== 'image') return whole;
        existing.push({ href: getAttr(attrs, 'href') || '', type: getAttr(attrs, 'type') || '' });
        return '';
      });

      // the first image in the first section of the content region
      const main = findElement(text, 'main', /<main\b[^>]*>/i);
      const region = main ? main.inner : text;
      const firstSection = findElement(region, 'section', /<section\b[^>]*>/i);
      const aboveFold = firstSection ? firstSection.inner : region.slice(0, 6000);

      let chosen = null;
      const srcSetM = new RegExp('<source\\b(' + A + ')>', 'i').exec(aboveFold);
      if (srcSetM) {
        const first = (getAttr(srcSetM[1], 'srcset') || '').split(',')[0].trim().split(/\s+/)[0];
        if (first) chosen = { href: first, type: getAttr(srcSetM[1], 'type') || '' };
      }
      if (!chosen) {
        const imgM = new RegExp('<img\\b(' + A + ')>', 'i').exec(aboveFold);
        if (imgM) {
          const src = getAttr(imgM[1], 'src') || '';
          if (src && (getAttr(imgM[1], 'loading') || '').toLowerCase() !== 'lazy') chosen = { href: src, type: '' };
        }
      }

      if (!chosen) {
        notes.push('removed ' + existing.length + ' image preload(s); this page has no above-the-fold image, ' +
          'so no image preload is emitted (on / the measured LCP element is the h1 text node, so the ' +
          'high-priority preload there is the Sora latin woff2, owned by renderHeadTags)');
        return text;
      }

      const head = /<head\b[^>]*>/i.exec(text);
      if (!head) { notes.push('WARNING: no <head> — preload not emitted'); return text; }
      // insert AFTER <meta charset> so hoist-charset's guarantee survives
      const charset = /<meta\b[^>]*charset[^>]*>/i.exec(text);
      const at = charset ? charset.index + charset[0].length : head.index + head[0].length;
      const tag =
        '<link rel="preload" as="image" fetchpriority="high"' +
        (chosen.type ? ' type="' + esc(chosen.type) + '"' : '') +
        ' href="' + esc(chosen.href) + '">';
      const misaimed = existing.filter((e) => e.href !== chosen.href).length;
      notes.push('removed ' + existing.length + ' existing image preload(s) (' + misaimed +
        ' of them pointed somewhere other than the above-the-fold image) and emitted exactly one for ' + chosen.href);
      return text.slice(0, at) + tag + text.slice(at);
    });
    return { html: out, notes };
  }
};

/* =====================================================================
 * 3. The ordered pass list + transform()
 * ===================================================================== */

export const passes = [
  stripDevTaps,        //  1
  stripNocacheMeta,    //  2
  stripBuilderIds,     //  3
  dedupeGtm,           //  4
  hoistCharset,        //  5
  ssrChrome,           //  6
  inlineCriticalCss,   //  7
  deferThirdParty,     //  8
  lazyModal,           //  9
  stripInlineHandlers, // 10
  fixA11y,             // 11
  preloadLcp           // 12
];

/**
 * Run every pass in contract order.
 * -> { html, applied: [{ name, notes, bytesBefore, bytesAfter }],
 *      skipped: [{ name, notes }] }
 * `applied` holds only the passes that actually changed bytes, so
 * build/sync.mjs can report per-page work honestly; `skipped` carries the
 * notes of the ones that were a no-op on this page.
 */
export function transform(html, ctx) {
  let cur = String(html);
  const applied = [];
  const skipped = [];
  for (const pass of passes) {
    const before = cur;
    let notes = [];
    let next;
    try {
      const r = pass.run(cur, ctx || {});
      if (r && typeof r === 'object' && typeof r.html === 'string') { next = r.html; notes = r.notes || []; }
      else if (typeof r === 'string') next = r;
      else { next = before; notes = ['pass returned nothing — treated as a no-op']; }
    } catch (err) {
      next = before;
      notes = ['ERROR: ' + (err && err.message ? err.message : String(err))];
    }
    if (next !== before) {
      applied.push({
        name: pass.name,
        notes,
        bytesBefore: Buffer.byteLength(before, 'utf8'),
        bytesAfter: Buffer.byteLength(next, 'utf8')
      });
      cur = next;
    } else {
      skipped.push({ name: pass.name, notes });
    }
  }
  return { html: cur, applied, skipped };
}

/* =====================================================================
 * 4. minifyHtml — conservative and safe
 * ===================================================================== */

/**
 * Elements whose surrounding whitespace is never significant. Whitespace
 * touching one of these is dropped; anywhere else it collapses to a single
 * space, because whitespace between inline elements is rendered.
 */
const BLOCK_TAGS = new Set([
  'html', 'head', 'body', 'div', 'section', 'article', 'aside', 'nav', 'header', 'footer',
  'main', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
  'form', 'fieldset', 'legend', 'figure', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'blockquote', 'hr', 'pre', 'script', 'style', 'link', 'meta', 'title', 'base',
  'picture', 'source', 'video', 'audio', 'iframe', 'noscript', 'template',
  'option', 'optgroup', 'details', 'summary', 'address'
]);

function tagNameBefore(text, at) {
  // text[at-1] === '>' — walk back to the matching '<'
  const lt = text.lastIndexOf('<', at - 1);
  if (lt === -1) return null;
  const m = /^<\/?\s*([a-zA-Z][^\s/>]*)/.exec(text.slice(lt, at));
  return m ? m[1].toLowerCase() : null;
}

function tagNameAfter(text, at) {
  const m = /^<\/?\s*([a-zA-Z][^\s/>]*)/.exec(text.slice(at));
  return m ? m[1].toLowerCase() : null;
}

/**
 * Conservative HTML minifier.
 *  - <pre>, <textarea>, <script> and <style> content is never touched
 *  - conditional comments are never stripped (other comments are)
 *  - inter-tag whitespace collapses to '' only when a block-level element is
 *    on one side, otherwise to a single space, so spacing between inline
 *    elements survives
 *  - no attribute quotes are removed and no optional tags are omitted
 */
export function minifyHtml(html) {
  const { text, chunks } = tokenize(html);
  let out = text;

  // drop plain comments; conditional comments are a separate chunk kind
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].kind === 'comment') {
      chunks[i].removed = true;
      out = out.split(tokenFor(i)).join('');
    }
  }

  // collapse whitespace between tags
  out = out.replace(/>(\s{2,}|\s*\n\s*)</g, (m, ws, at) => {
    const idx = at + 1; // just after '>'
    const before = tagNameBefore(out, idx);
    const after = tagNameAfter(out, idx + ws.length);
    const blockish = (before && BLOCK_TAGS.has(before)) || (after && BLOCK_TAGS.has(after));
    return blockish ? '><' : '> <';
  });

  // collapse runs of whitespace inside text nodes (HTML renders them as one space)
  out = out.replace(/([^>\s])[ \t]{2,}([^<\s])/g, '$1 $2');
  out = out.replace(/\n[ \t]+/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{2,}/g, '\n');

  return detokenize(out, chunks).trim() + '\n';
}
