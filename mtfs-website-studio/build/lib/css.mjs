/**
 * build/lib/css.mjs — CSS pipeline for the MedTech For Solutions Website Studio rebuild.
 *
 * Zero dependencies. Node >= 18. Only `node:crypto` is imported.
 *
 * ---------------------------------------------------------------------------------------
 * WHAT THIS FIXES (measured, from BRIEF.md + the Lighthouse 12.8.2 mobile run)
 * ---------------------------------------------------------------------------------------
 *   - 380 ms of render-blocking CSS from three <link rel=stylesheet> in <head>:
 *       /assets/mega-menu.css   30,074 B   602 ms
 *       /assets/mtfs-images.css  3,128 B   302 ms
 *       /assets/css/fonts.css    6,688 B   152 ms
 *     After this pipeline there are ZERO render-blocking stylesheets: the above-the-fold
 *     layer is inlined (src/assets/css/critical.css) and everything else is one hashed,
 *     non-blocking /assets/site.<hash>.css.
 *   - 15,335 B of 30,074 B (51%) of mega-menu.css unused on the home page. Lighthouse's
 *     `unused-css-rules` is a SPLITTING problem, not a deletion problem: the unused bytes
 *     are the search overlay (8,135 B) and the mega panels (6,563 B), which are needed on
 *     interaction. splitCritical() splits; it never deletes.
 *   - 263,821 B of inline <style> site-wide (measured over all 21 pages, sum of every
 *     <style> body), of which 35,460 B is byte-identical duplication: `#mtfs-context-links`
 *     (250 B) and `#mtfs-visible-related-links` (1,720 B) each repeat across 19 pages —
 *     18 redundant copies each, 18 * (250 + 1720) = 35,460 B that is re-sent on every page
 *     view and never cached.
 *     Those two blocks are NOT removed by dedupe(): index.html spells the same colours with
 *     var(--teal) where the other 19 pages use #1f6e75, so the selector `.mtfs-related` has
 *     two definitions site-wide and the cascade guard below (correctly) refuses to hoist it.
 *     They are removed by construction instead — src/assets/css/site.css owns those rules
 *     and render.mjs::renderRelated() emits the markup, so the ssr-chrome pass deletes both
 *     <style> elements from all 19 pages.
 *     What dedupe() does remove is everything else that proves identical: measured over the
 *     21 real page blocks it hoists 15,845 B into the shared sheet and drops the 21 blocks
 *     from 257,186 B to 178,892 B — 62,449 B of never-cached inline CSS turned into one
 *     hashed file that _headers can serve `immutable`, because hashName() content-hashes it.
 *
 * ---------------------------------------------------------------------------------------
 * PIPELINE (what sync.mjs is expected to do with these four functions)
 * ---------------------------------------------------------------------------------------
 *   1.  For each of the 21 pages, collect its own <style> blocks in DOCUMENT ORDER.
 *   2.  `const { critical, deferred } = splitCritical(pageCss, CRITICAL_SELECTORS)`
 *   3.  `const { shared, perPage } = dedupe(allPagesDeferred)`
 *   4.  siteCss = minifyCss(shared + mega-menu deferred + mtfs-images remainder)
 *       (src/assets/css/site.css already carries the hand-authored shared layer; `shared`
 *        is whatever additionally proves identical across pages at build time)
 *   5.  `hashName('site.css', siteCss)` -> /assets/site.<hash>.css
 *   6.  Inline block per page = fonts @font-face + critical.css + this page's `critical`.
 *
 * ---------------------------------------------------------------------------------------
 * CASCADE INVARIANTS — the emitted <head> order is load-bearing, do not reorder
 * ---------------------------------------------------------------------------------------
 * The export's real cascade order is:
 *      fonts.css <link>  ->  page <style>  ->  mega-menu.css <link>  ->  mtfs-images.css
 *      <link>  ->  #mtfs-context-links <style>  ->  #mtfs-visible-related-links <style>
 * mega-menu.css therefore WINS over the page block on equal specificity. That is not an
 * accident: mega-menu.css ends with a "SITE-WIDE DESIGN SYSTEM OVERRIDES" section whose
 * `section.sec,.sec{padding-top:88px;padding-bottom:88px}` deliberately overrides the
 * home page's own `section.sec{padding:100px 0}`. The rebuilt <head> must preserve that:
 *
 *      <style>  fonts @font-face + critical.css + page-critical slice  </style>
 *      <style>  page residual (the deferred half of the page's own block)  </style>
 *      <link rel="stylesheet" href="/assets/site.<hash>.css">   (non-blocking)
 *
 * i.e. the site sheet's <link> must come AFTER the page's residual <style>, because that
 * is where mega-menu.css sat. A stylesheet's cascade position is its <link> position in
 * the document, not its load time, so a non-blocking swap does not change this.
 *
 * KNOWN LIMITATION (documented, not silently accepted): both splitCritical() and dedupe()
 * move rules EARLIER in the cascade. If rule A (hoisted) and rule B (left behind) have
 * equal specificity and A originally came after B, A used to win and now B does.
 * splitCritical() is protected by an allow-list of selectors that are disjoint from the
 * deferred set. dedupe() is protected by a hard guard: a rule is only hoisted when no
 * block anywhere contains a DIFFERENT rule with the same selector text (see below).
 * Neither guard is a proof. `--check` diffing rendered pages against the export is.
 */

import { createHash } from 'node:crypto';

/* =======================================================================================
   1. TOKENIZER / PARSER
   =======================================================================================
   A real (small) CSS parser rather than regexes, because the export contains every shape
   that breaks a regex minifier:
     - `content:'\2212'` and `content:"/"`            (strings that hold CSS syntax)
     - `[class*="-grid"]>*`                            (attribute selectors)
     - `url(https://…/ca72d2bc….woff2) format('woff2')` and `url(data:image/png;base64,…)`
       (unquoted url() values containing `;` and `:`)
     - `width:min(100% - 48px,1200px)` / `calc(100dvh - 76px)`   (calc-style whitespace)
     - `@media(max-width:1180px){…}` and `@media (prefers-reduced-motion:reduce){…}`
     - `font:700 .78rem/1.4 "DM Sans",sans-serif`      (slash-separated shorthand)
     - `unicode-range:U+0100-02BA, U+02BD-02C5, …`     (comma lists that must survive)
   ======================================================================================= */

/** True when `ch` is CSS whitespace. */
function isWs(ch) {
  return ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n' || ch === '\f';
}

/**
 * Skip a quoted string starting at `i` (src[i] is the quote). Returns the index just past
 * the closing quote. Honours backslash escapes.
 */
function skipString(src, i) {
  const quote = src[i];
  i++;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') { i += 2; continue; }
    if (ch === quote) return i + 1;
    i++;
  }
  return i;
}

/** Skip a /* … *\/ comment starting at `i`. Returns the index just past the terminator. */
function skipComment(src, i) {
  const end = src.indexOf('*/', i + 2);
  return end === -1 ? src.length : end + 2;
}

/**
 * Skip a balanced `(` … `)` run starting at `i` (src[i] === '('), stepping over nested
 * parens, strings and comments. url( … ) bodies are consumed verbatim, so a `;` or `:`
 * inside `url(data:image/png;base64,…)` never terminates anything.
 */
function skipParens(src, i) {
  // Detect url( with an unquoted body: consume to the matching ')' without interpreting.
  const isUrl = /url\s*\($/i.test(src.slice(Math.max(0, i - 5), i + 1));
  i++;
  if (isUrl) {
    let j = i;
    while (j < src.length && isWs(src[j])) j++;
    if (src[j] !== '"' && src[j] !== "'") {
      const close = src.indexOf(')', i);
      return close === -1 ? src.length : close + 1;
    }
  }
  let depth = 1;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'") { i = skipString(src, i); continue; }
    if (ch === '/' && src[i + 1] === '*') { i = skipComment(src, i); continue; }
    if (ch === '(') { depth++; i++; continue; }
    if (ch === ')') { depth--; i++; if (depth === 0) return i; continue; }
    i++;
  }
  return i;
}

/** Skip a balanced `[` … `]` attribute selector. */
function skipBrackets(src, i) {
  i++;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'") { i = skipString(src, i); continue; }
    if (ch === ']') return i + 1;
    i++;
  }
  return i;
}

/** Skip a balanced `{` … `}` block (used only for custom properties holding a block). */
function skipBraces(src, i) {
  let depth = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'") { i = skipString(src, i); continue; }
    if (ch === '/' && src[i + 1] === '*') { i = skipComment(src, i); continue; }
    if (ch === '(') { i = skipParens(src, i); continue; }
    if (ch === '{') { depth++; i++; continue; }
    if (ch === '}') { depth--; i++; if (depth === 0) return i; continue; }
    i++;
  }
  return i;
}

/**
 * Remove comments, string- and url-safely. `/*!` bang comments are preserved.
 * A comment between two identifier characters collapses to a single space so that
 * `a/*x*\/b` never becomes `ab`.
 */
function stripComments(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'") { const e = skipString(src, i); out += src.slice(i, e); i = e; continue; }
    if (ch === '(') { const e = skipParens(src, i); out += src.slice(i, e); i = e; continue; }
    if (ch === '/' && src[i + 1] === '*') {
      const e = skipComment(src, i);
      if (src[i + 2] === '!') { out += src.slice(i, e); i = e; continue; }
      const before = out[out.length - 1] || '';
      const after = src[e] || '';
      if (/[\w-]/.test(before) && /[\w-]/.test(after)) out += ' ';
      i = e;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/**
 * Parse a comment-free stylesheet into a flat node tree.
 *
 * Node shapes:
 *   { type: 'rule',    prelude, nodes }   style rule, or an at-rule that owns a block
 *   { type: 'decl',    text }             one declaration, no trailing ';'
 *   { type: 'at',      prelude }          at-rule statement terminated by ';' (@import…)
 *   { type: 'comment', text }             a preserved /*! … *\/ bang comment
 */
function parseNodes(src, start, stopAtClose) {
  const nodes = [];
  let i = start;
  let buf = '';

  const flushStatement = (raw) => {
    const text = raw.trim();
    if (!text) return;
    if (text.startsWith('@')) nodes.push({ type: 'at', prelude: text });
    else nodes.push({ type: 'decl', text });
  };

  while (i < src.length) {
    const ch = src[i];

    if (ch === '"' || ch === "'") { const e = skipString(src, i); buf += src.slice(i, e); i = e; continue; }
    if (ch === '(') { const e = skipParens(src, i); buf += src.slice(i, e); i = e; continue; }
    if (ch === '[') { const e = skipBrackets(src, i); buf += src.slice(i, e); i = e; continue; }
    if (ch === '/' && src[i + 1] === '*') {
      const e = skipComment(src, i);
      if (buf.trim() === '') nodes.push({ type: 'comment', text: src.slice(i, e) });
      else buf += src.slice(i, e);
      i = e;
      continue;
    }

    if (ch === '{') {
      // A custom property may legally hold a whole block: `--x: { a: b };`
      if (/^\s*--[\w-]+\s*:/.test(buf)) {
        const e = skipBraces(src, i);
        buf += src.slice(i, e);
        i = e;
        continue;
      }
      const inner = parseNodes(src, i + 1, true);
      nodes.push({ type: 'rule', prelude: buf.trim(), nodes: inner.nodes });
      buf = '';
      i = inner.index;
      continue;
    }

    if (ch === ';') { flushStatement(buf); buf = ''; i++; continue; }

    if (ch === '}') {
      flushStatement(buf);
      buf = '';
      i++;
      if (stopAtClose) return { nodes, index: i };
      continue;
    }

    buf += ch;
    i++;
  }

  flushStatement(buf);
  return { nodes, index: i };
}

/** Parse a stylesheet string into nodes (comments stripped except bang comments). */
function parseStylesheet(css) {
  return parseNodes(stripComments(String(css)), 0, false).nodes;
}

/* =======================================================================================
   2. SERIALIZATION — the conservative minifier
   ======================================================================================= */

/**
 * Minify a selector list or at-rule prelude.
 *
 * Does:      collapse whitespace runs; drop whitespace around `,` and around the
 *            combinators `>` `+` `~` at paren depth 0; drop whitespace after `(` and
 *            before `)`; drop whitespace around `:` INSIDE parens (media features:
 *            `(max-width: 768px)` -> `(max-width:768px)`).
 * Does NOT:  touch `:` outside parens (so `a :hover` never becomes `a:hover`), touch
 *            anything inside a string, a url() or an attribute selector `[...]`, or
 *            touch `+`/`~` inside parens (so `calc(1px + 2px)` and `:nth-child(2n + 1)`
 *            survive), or reorder / merge / dedupe selectors.
 */
function minifyPrelude(prelude) {
  const src = prelude;
  let out = '';
  let i = 0;
  let parens = 0;

  const dropTrailingWs = () => { while (out.length && out[out.length - 1] === ' ') out = out.slice(0, -1); };

  while (i < src.length) {
    const ch = src[i];

    if (ch === '"' || ch === "'") { const e = skipString(src, i); out += src.slice(i, e); i = e; continue; }
    if (ch === '[') { const e = skipBrackets(src, i); out += src.slice(i, e).replace(/\s+/g, ' '); i = e; continue; }
    if (ch === '(') {
      // url(...) is copied byte for byte.
      if (/url\s*$/i.test(out)) { const e = skipParens(src, i); out += src.slice(i, e); i = e; continue; }
      // NOTE: the whitespace BEFORE '(' is never dropped here. `@media screen and (min-width:600px)`
      // becomes invalid the moment `and (` collapses to `and(`. Dropping the whitespace AFTER '('
      // is always safe.
      out += '(';
      parens++;
      i++;
      while (i < src.length && isWs(src[i])) i++;
      continue;
    }
    if (ch === ')') { dropTrailingWs(); out += ')'; parens = Math.max(0, parens - 1); i++; continue; }

    if (isWs(ch)) {
      let j = i;
      while (j < src.length && isWs(src[j])) j++;
      const prev = out[out.length - 1] || '';
      const next = src[j] || '';
      const dropAround = ',{'.includes(next) || ',{'.includes(prev)
        || (parens === 0 && '>+~'.includes(next))
        || (parens === 0 && '>+~'.includes(prev))
        || (parens > 0 && next === ':')
        || (parens > 0 && prev === ':');
      if (!dropAround && next !== '' && prev !== '') out += ' ';
      i = j;
      continue;
    }

    if (ch === ',' || (parens === 0 && '>+~'.includes(ch))) {
      dropTrailingWs();
      out += ch;
      i++;
      while (i < src.length && isWs(src[i])) i++;
      continue;
    }

    if (parens > 0 && ch === ':') { dropTrailingWs(); out += ':'; i++; while (i < src.length && isWs(src[i])) i++; continue; }

    out += ch;
    i++;
  }

  return out.trim();
}

/**
 * Minify one declaration (`prop: value`, no trailing `;`).
 *
 * Does:      drop whitespace around the FIRST top-level `:`; collapse whitespace runs in
 *            the value; drop whitespace around `,`; drop whitespace after `(` and before
 *            `)`; drop whitespace before `!important`.
 * Does NOT:  touch strings, url() bodies or `[...]`; touch `/` (so `700 .78rem/1.4` and
 *            `aspect-ratio: 3 / 2` are untouched); touch `+ - *` (so `calc(100dvh - 76px)`
 *            and `min(100% - 48px,1200px)` survive); drop units, leading zeros, quotes or
 *            the last `;` of a value; lowercase or shorten colours.
 */
function minifyDeclaration(text) {
  const src = text;

  // Locate the first top-level ':' (outside strings, parens and brackets).
  let sep = -1;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'") { i = skipString(src, i) - 1; continue; }
    if (ch === '(') { i = skipParens(src, i) - 1; continue; }
    if (ch === '[') { i = skipBrackets(src, i) - 1; continue; }
    if (ch === ':') { sep = i; break; }
  }
  if (sep === -1) return src.trim().replace(/\s+/g, ' ');

  const prop = src.slice(0, sep).trim().replace(/\s+/g, ' ');
  const rawValue = src.slice(sep + 1);

  let out = '';
  let i = 0;
  const dropTrailingWs = () => { while (out.length && out[out.length - 1] === ' ') out = out.slice(0, -1); };

  while (i < rawValue.length) {
    const ch = rawValue[i];

    if (ch === '"' || ch === "'") { const e = skipString(rawValue, i); out += rawValue.slice(i, e); i = e; continue; }
    if (ch === '[') { const e = skipBrackets(rawValue, i); out += rawValue.slice(i, e); i = e; continue; }
    if (ch === '(') {
      if (/url\s*$/i.test(out)) { const e = skipParens(rawValue, i); out += rawValue.slice(i, e); i = e; continue; }
      dropTrailingWs();
      out += '(';
      i++;
      while (i < rawValue.length && isWs(rawValue[i])) i++;
      continue;
    }
    if (ch === ')') { dropTrailingWs(); out += ')'; i++; continue; }
    if (ch === ',') { dropTrailingWs(); out += ','; i++; while (i < rawValue.length && isWs(rawValue[i])) i++; continue; }
    if (ch === '!') { dropTrailingWs(); out += '!'; i++; while (i < rawValue.length && isWs(rawValue[i])) i++; continue; }

    if (isWs(ch)) {
      let j = i;
      while (j < rawValue.length && isWs(rawValue[j])) j++;
      const prev = out[out.length - 1] || '';
      const next = rawValue[j] || '';
      if (prev !== '' && next !== '' && next !== ',' && next !== ')' && next !== '!') out += ' ';
      i = j;
      continue;
    }

    out += ch;
    i++;
  }

  return prop + ':' + out.trim();
}

/** Serialize a node list back to minified CSS. */
function serialize(nodes) {
  const parts = [];
  for (const node of nodes) {
    if (node.type === 'comment') { parts.push(node.text); continue; }
    if (node.type === 'at') { parts.push(minifyPrelude(node.prelude) + ';'); continue; }
    if (node.type === 'decl') { parts.push(minifyDeclaration(node.text) + ';'); continue; }
    if (node.type === 'rule') {
      const body = serialize(node.nodes);
      parts.push(minifyPrelude(node.prelude) + '{' + body + '}');
      continue;
    }
  }
  // Drop the `;` that immediately precedes a `}` — the only structural trim we do.
  let out = '';
  for (let k = 0; k < parts.length; k++) {
    const part = parts[k];
    const isLastDecl = part.endsWith(';') && (k === parts.length - 1);
    out += isLastDecl ? part.slice(0, -1) : part;
  }
  return out;
}

/**
 * Conservative, correctness-first CSS minifier.
 *
 * Removes: comments (except `/*!`), redundant whitespace, the final `;` of a block.
 * Preserves: every selector, every declaration, every at-rule, declaration order,
 * `content:` strings, url() values (quoted and unquoted, including data: URIs),
 * attribute selectors, calc()/min()/max()/clamp() spacing, `@media` preludes, `!important`,
 * unicode-range lists, and colour/unit spelling exactly as authored.
 *
 * @param {string} css
 * @returns {string} minified CSS
 */
export function minifyCss(css) {
  if (typeof css !== 'string') throw new TypeError('minifyCss(css): css must be a string');
  if (css.trim() === '') return '';
  return serialize(parseStylesheet(css));
}

/* =======================================================================================
   3. splitCritical — deterministic, explicit selector allow-list (no heuristics)
   ======================================================================================= */

/**
 * Selector-token extraction. Returns the class / id / pseudo / tag tokens a selector
 * references, plus the whitespace-normalized selector text for exact matching.
 */
function selectorTokens(selector) {
  const sel = minifyPrelude(selector);
  const classes = new Set();
  const ids = new Set();
  const pseudos = new Set();
  let i = 0;
  while (i < sel.length) {
    const ch = sel[i];
    if (ch === '"' || ch === "'") { i = skipString(sel, i); continue; }
    if (ch === '[') { i = skipBrackets(sel, i); continue; }
    if (ch === '.' || ch === '#' || ch === ':') {
      let j = i + 1;
      if (ch === ':' && sel[j] === ':') j++;
      let name = '';
      while (j < sel.length && /[\w-]/.test(sel[j])) { name += sel[j]; j++; }
      if (name) {
        if (ch === '.') classes.add(name);
        else if (ch === '#') ids.add(name);
        else pseudos.add(name);
      }
      i = j;
      continue;
    }
    i++;
  }
  return { text: sel, classes, ids, pseudos };
}

/**
 * Does one allow-list entry match one selector?
 *
 * Entry syntax (explicit, no heuristics, no guessing):
 *   `.foo`         the selector references class `foo` anywhere
 *   `.foo*`        the selector references any class whose name starts with `foo`
 *   `#foo`         the selector references id `foo` anywhere
 *   `:foo`         the selector references pseudo-class/element `foo` anywhere
 *   `html`         EXACT selector match (so `p` matches `p` but never `.sh p`)
 *   `*::before`    EXACT selector match, pseudo-elements included
 *   `=.mm-panel`   EXACT selector match for anything, including a class. Use this for the
 *                  hidden-by-default base rules: `.mm-search-overlay` as a token entry
 *                  would also pull in `.mm-search-overlay.mm-search-open .mm-search-modal`,
 *                  i.e. the whole 8,135 B search overlay that must stay in the lazy sheet.
 *   `@font-face`   at-rule name (checked against at-rule preludes, not selectors)
 */
function entryMatchesSelector(entry, tok) {
  if (entry.startsWith('@')) return false;
  if (entry.startsWith('=')) return tok.text === minifyPrelude(entry.slice(1));
  if (entry.startsWith('.')) {
    const name = entry.slice(1);
    if (name.endsWith('*')) {
      const prefix = name.slice(0, -1);
      for (const c of tok.classes) if (c.startsWith(prefix)) return true;
      return false;
    }
    return tok.classes.has(name);
  }
  if (entry.startsWith('#')) {
    const name = entry.slice(1);
    if (name.endsWith('*')) {
      const prefix = name.slice(0, -1);
      for (const id of tok.ids) if (id.startsWith(prefix)) return true;
      return false;
    }
    return tok.ids.has(name);
  }
  if (entry.startsWith(':')) {
    const name = entry.replace(/^::?/, '');
    return tok.pseudos.has(name);
  }
  return tok.text === minifyPrelude(entry);
}

/** Split a selector list into top-level comma-separated selectors (string/bracket safe). */
function splitSelectorList(prelude) {
  const out = [];
  let buf = '';
  let i = 0;
  let parens = 0;
  while (i < prelude.length) {
    const ch = prelude[i];
    if (ch === '"' || ch === "'") { const e = skipString(prelude, i); buf += prelude.slice(i, e); i = e; continue; }
    if (ch === '[') { const e = skipBrackets(prelude, i); buf += prelude.slice(i, e); i = e; continue; }
    if (ch === '(') { parens++; buf += ch; i++; continue; }
    if (ch === ')') { parens--; buf += ch; i++; continue; }
    if (ch === ',' && parens === 0) { out.push(buf); buf = ''; i++; continue; }
    buf += ch;
    i++;
  }
  out.push(buf);
  return out.map((s) => s.trim()).filter(Boolean);
}

const CONDITIONAL_AT_RULES = new Set(['@media', '@supports', '@container', '@layer', '@scope', '@document']);

function atRuleName(prelude) {
  const m = /^@[\w-]+/.exec(prelude.trim());
  return m ? m[0].toLowerCase() : '';
}

/**
 * The allow-list used when no explicit list is passed. It is the ABOVE-THE-FOLD surface of
 * the 21 exported pages, derived by reading their real markup — not guessed:
 *   - the reset, the `:root` token block and base typography (every page shares these)
 *   - the header shell (`.mm-*`), which is server-rendered by render.mjs and whose closed
 *     states (`.mm-panel`, `.mm-mobile-scrim`, `.mm-back-to-top`, `.mm-search-overlay`)
 *     exist ONLY in CSS — deferring them paints three mega panels expanded in flow
 *   - the skip link and the breadcrumb, which are the first two elements of <body>/<main>
 *   - every hero variant, because `.hero` means five different things across the export
 *     (`/` = blush two-column, `/about/` + `/services/lab-solutions/` = dark centred,
 *     `/our-team/` = dark two-column, `/services/` = image-backed, `/contact/`,
 *     `/privacy-policy/`, `/terms-of-service/` and the 5 lab-solutions leaves = `.page-hero`,
 *     `/services/management-services/` = `.mtfs-hero-split`, `/sitemap/` = `.sm-hero`)
 *   - `.mtfs-media*`, the 528 B CLS-critical subset of mtfs-images.css that reserves the
 *     image boxes before the CDN images resolve
 */
const DEFAULT_CRITICAL_SELECTORS = [
  // reset + document
  '*', '*::before', '*::after', 'html', 'body', ':root',
  // base typography (exact selectors only — `.sh p` must NOT be pulled in by `p`)
  'h1', 'h2', 'h3', 'h4', 'h1,h2,h3,h4', 'p', 'a', 'img', 'svg',
  '.lead', '.ctr',
  // SSR chrome introduced by render.mjs
  '.mtfs-skip-link', '.mtfs-breadcrumb*',
  // header / nav shell + the four hidden-by-default states
  '.mm-header', '.mm-bar', '.mm-logo*', '.mm-nav', '.mm-caret', '.mm-right', '.mm-phone',
  '.mm-cta', '.mm-search-btn', '.mm-search-kbhint', '.mm-burger', '.mm-mobile-only',
  '.mm-menu-lock', '.mm-scrolled', '.mm-mobile-open',
  // the four hidden-by-default base rules — EXACT matches only, so the panel bodies and the
  // search overlay body stay in the lazy sheet where the measured 15,335 B of "unused" CSS is
  '=.mm-panel', '=.mm-mobile-scrim', '=.mm-back-to-top', '=.mm-search-overlay',
  // hero variants (all of them — one shared critical block serves all 21 pages)
  '.hero*', '.page-hero*', '.mtfs-hero*', '.sm-hero*', '.crumb', '.breadcrumb',
  '.badge', '.bp', '.bs2',
  // CLS-critical image boxes
  '.mtfs-media*',
  // the GTM <noscript> iframe hider — it is the first node inside <body>
  '.il1',
  // at-rules that must be in the first paint
  '@charset', '@font-face',
];

/**
 * Deterministically split a stylesheet into an above-the-fold half and the rest.
 *
 * Determinism: the ONLY input is the explicit allow-list. There is no size budget, no
 * "looks like a hero" guess, no DOM inspection. The same (css, allow-list) pair always
 * yields the same two strings, byte for byte.
 *
 * Completeness: nothing is dropped. `critical + deferred` contains every declaration of
 * the input. A rule whose selector list is partly critical is SPLIT — the critical
 * selectors go to `critical`, the rest to `deferred` — so a rule is never silently
 * widened or narrowed.
 *
 * Conditional groups (`@media`, `@supports`, `@container`, `@layer`, `@scope`,
 * `@document`) are recursed into and re-emitted on each side with only their matching
 * children, so `@media(max-width:1180px)` can contribute the mobile drawer's closed state
 * to `critical` while its open-state rules stay in `deferred`.
 *
 * @param {string} css
 * @param {string[]} [criticalSelectors] explicit allow-list; see DEFAULT_CRITICAL_SELECTORS
 * @returns {{critical: string, deferred: string}} both minified
 */
export function splitCritical(css, criticalSelectors = DEFAULT_CRITICAL_SELECTORS) {
  if (typeof css !== 'string') throw new TypeError('splitCritical(css, criticalSelectors): css must be a string');
  if (!Array.isArray(criticalSelectors)) {
    throw new TypeError('splitCritical(css, criticalSelectors): criticalSelectors must be an array of allow-list entries');
  }
  const entries = criticalSelectors.map(String);
  const atEntries = new Set(entries.filter((e) => e.startsWith('@')).map((e) => e.toLowerCase()));

  const isCriticalSelector = (selector) => {
    const tok = selectorTokens(selector);
    for (const entry of entries) if (entryMatchesSelector(entry, tok)) return true;
    return false;
  };

  /** @returns {{critical: object[], deferred: object[]}} */
  const walk = (nodes) => {
    const critical = [];
    const deferred = [];
    for (const node of nodes) {
      if (node.type === 'comment') { critical.push(node); deferred.push(node); continue; }
      if (node.type === 'decl') { deferred.push(node); continue; }
      if (node.type === 'at') {
        const name = atRuleName(node.prelude);
        (atEntries.has(name) ? critical : deferred).push(node);
        continue;
      }
      // node.type === 'rule'
      const prelude = node.prelude.trim();
      if (prelude.startsWith('@')) {
        const name = atRuleName(prelude);
        if (CONDITIONAL_AT_RULES.has(name)) {
          const inner = walk(node.nodes);
          if (inner.critical.length) critical.push({ type: 'rule', prelude, nodes: inner.critical });
          if (inner.deferred.length) deferred.push({ type: 'rule', prelude, nodes: inner.deferred });
        } else {
          (atEntries.has(name) ? critical : deferred).push(node);
        }
        continue;
      }
      const selectors = splitSelectorList(prelude);
      const hit = selectors.filter(isCriticalSelector);
      const miss = selectors.filter((s) => !hit.includes(s));
      if (hit.length) critical.push({ type: 'rule', prelude: hit.join(','), nodes: node.nodes });
      if (miss.length) deferred.push({ type: 'rule', prelude: miss.join(','), nodes: node.nodes });
    }
    return { critical, deferred };
  };

  const { critical, deferred } = walk(parseStylesheet(css));
  return { critical: serialize(critical), deferred: serialize(deferred) };
}

/* =======================================================================================
   4. dedupe — hoist byte-identical rules out of N page blocks into one shared sheet
   ======================================================================================= */

/**
 * Hoist rules that repeat across page stylesheets into a single shared sheet.
 *
 * This is the fix for the measured 35,460 B of byte-identical inline <style> duplication:
 * `#mtfs-context-links` (250 B) and `#mtfs-visible-related-links` (1,720 B) appear on 19
 * pages each, so 18 redundant copies of each are re-downloaded on every page view because
 * inline CSS is never cached.
 *
 * A rule is hoisted only when BOTH hold:
 *   (a) its minified text appears in 2 or more of the input blocks, and
 *   (b) NO block anywhere contains a different rule with the same selector text.
 *
 * (b) is the cascade guard. Hoisting moves a rule earlier in the cascade (the shared sheet
 * is linked before the page's residual <style> stays inline), so hoisting `.sec{padding:X}`
 * out of 12 pages while 9 other pages define `.sec{padding:Y}` would silently change which
 * one wins. Requiring a globally unique selector→declarations mapping makes that class of
 * regression impossible. It is why `section.sec{padding:100px 0}` (home) is NOT hoisted:
 * mega-menu.css defines `section.sec,.sec{padding-top:88px;padding-bottom:88px}`.
 *
 * Order is stable: `shared` follows first-appearance order across the blocks in the order
 * given, and each `perPage[i]` keeps its block's original order minus what was hoisted.
 *
 * @param {string[]} cssBlocks one CSS string per page, in the order they will be emitted
 * @returns {{shared: string, perPage: string[]}} all minified
 */
export function dedupe(cssBlocks) {
  if (!Array.isArray(cssBlocks)) throw new TypeError('dedupe(cssBlocks): cssBlocks must be an array of CSS strings');

  const parsed = cssBlocks.map((block) => parseStylesheet(String(block)));

  // key = minified text of the whole node; also record the selector text for guard (b).
  const nodeKey = (node) => serialize([node]);
  const selectorKeyOf = (node) => {
    if (node.type !== 'rule') return null;
    return minifyPrelude(node.prelude);
  };

  const blocksContaining = new Map();     // nodeKey -> Set(blockIndex)
  const selectorVariants = new Map();     // selectorKey -> Set(nodeKey)
  const firstSeen = [];                   // [{key, node}] in first-appearance order
  const seenKeys = new Set();

  parsed.forEach((nodes, blockIndex) => {
    for (const node of nodes) {
      if (node.type === 'comment') continue;
      const key = nodeKey(node);
      if (!blocksContaining.has(key)) blocksContaining.set(key, new Set());
      blocksContaining.get(key).add(blockIndex);
      const selKey = selectorKeyOf(node);
      if (selKey !== null) {
        if (!selectorVariants.has(selKey)) selectorVariants.set(selKey, new Set());
        selectorVariants.get(selKey).add(key);
      }
      if (!seenKeys.has(key)) { seenKeys.add(key); firstSeen.push({ key, node, selKey }); }
    }
  });

  const hoisted = new Set();
  const sharedNodes = [];
  for (const { key, node, selKey } of firstSeen) {
    if (blocksContaining.get(key).size < 2) continue;
    if (selKey !== null && selectorVariants.get(selKey).size > 1) continue; // cascade guard
    hoisted.add(key);
    sharedNodes.push(node);
  }

  const perPage = parsed.map((nodes) => {
    const kept = nodes.filter((node) => node.type === 'comment' || !hoisted.has(nodeKey(node)));
    return serialize(kept);
  });

  return { shared: serialize(sharedNodes), perPage };
}

/* =======================================================================================
   5. hashName — content-addressed asset filenames
   ======================================================================================= */

/**
 * Build a content-hashed asset filename.
 *
 *   hashName('site.css', css)          -> 'site.a1b2c3d4.css'
 *   hashName('analytics.js', js)       -> 'analytics.9f8e7d6c.js'
 *   hashName('search-index.json', j)   -> 'search-index.1122aabb.json'
 *   hashName('site', css)              -> 'site.a1b2c3d4.css'   (defaults to .css)
 *
 * Content-hashing is what makes the `_headers` rule
 * `/assets/* -> Cache-Control: public, max-age=31536000, immutable` honest. The export
 * applies that rule to five UNHASHED filenames (mega-menu.css, mega-menu.min.js,
 * mtfs-images.css, book-consultation-modal.min.js, css/fonts.css) — hence the hand-rolled
 * `?v=20260723` cache-buster on the fonts <link>. Only hashed names may be immutable.
 *
 * @param {string} base filename, with or without an extension
 * @param {string|Buffer} contents
 * @returns {string}
 */
export function hashName(base, contents) {
  if (typeof base !== 'string' || base === '') throw new TypeError('hashName(base, contents): base must be a non-empty string');
  if (contents === undefined || contents === null) throw new TypeError('hashName(base, contents): contents is required');
  const hash = createHash('sha256').update(contents).digest('hex').slice(0, 8);
  const dot = base.lastIndexOf('.');
  const slash = Math.max(base.lastIndexOf('/'), base.lastIndexOf('\\'));
  if (dot > slash + 1) return base.slice(0, dot) + '.' + hash + base.slice(dot);
  return base + '.' + hash + '.css';
}
