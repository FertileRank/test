/**
 * build/lib/compress.mjs — pre-compression of the emitted static site.
 *
 * Zero npm dependencies. Node >= 18. ESM. Imports only `node:fs` and `node:path`
 * (plus `node:zlib`), per the module contract.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * BRIEF item 3, measured on the Lighthouse 12.8.2 mobile run of the export:
 * "No text compression — est. 140 KiB savings. Nothing is pre-compressed and
 * `_headers` sets no Content-Encoding." The named wasted-byte figures are:
 *
 *     document                          64,304 B
 *     book-consultation-modal.min.js    25,882 B
 *     mega-menu.css                     23,785 B
 *     mega-menu.min.js                  20,798 B
 *     fonts.css                          6,108 B
 *     mtfs-images.css                    2,179 B
 *
 * Those six numbers are Lighthouse's ESTIMATE for the export. This module does
 * not restate them as a result: it writes real `.gz` and `.br` siblings and
 * `report()` prints the real, per-file before/after that this build measured.
 * Nothing in the printed table is projected, extrapolated or copied from the
 * audit — every byte count in it comes from `Buffer.byteLength` on output this
 * process produced.
 *
 * WHY BOTH ENCODINGS
 * ------------------
 * A Netlify-style static host negotiates a pre-written sibling automatically:
 * given `/about/index.html`, `/about/index.html.br` is served to a client that
 * sends `Accept-Encoding: br` and `/about/index.html.gz` to one that only
 * offers gzip. Because both siblings exist on disk, `_headers` deliberately
 * sets NO `Content-Encoding` header by hand — doing so would mislabel the
 * uncompressed variant for a client that sends neither.
 *
 * Levels are the maximum for both codecs, which is the right trade for a
 * build-time, write-once/serve-many artifact:
 *   - gzip   `level: 9`
 *   - brotli `BROTLI_PARAM_QUALITY: 11` with `BROTLI_PARAM_SIZE_HINT` set to
 *     the exact uncompressed byte length. The size hint lets the encoder pick
 *     its window and block split from the real input size instead of guessing;
 *     it costs nothing and is the documented way to compress a known-length
 *     buffer.
 *
 * `llms-full.txt` (112,391 B in the export) matched no `_headers` rule at all
 * and was served raw. It is a plain `.txt`, so the default extension set covers
 * it and it is compressed like everything else.
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';

/**
 * Extensions compressed by default. Exactly the six text types the SEO audit
 * requires: `.html`, `.css`, `.js`, `.txt`, `.xml`, `.json`.
 *
 * Binary types are deliberately absent. A `.webp`, `.avif`, `.png` or `.woff2`
 * is already entropy-coded; re-compressing it burns build time to produce a
 * sibling that is usually LARGER than the original.
 */
const DEFAULT_EXTS = ['.html', '.css', '.js', '.txt', '.xml', '.json'];

/** Siblings this module writes. Never walked into, never re-compressed. */
const COMPRESSED_SUFFIXES = ['.gz', '.br'];

/** Directory names never descended into. */
const SKIP_DIRS = new Set(['.git', 'node_modules']);

/* ===================================================================== *
 * Internals
 * ===================================================================== */

/** Normalise an extension list: 'html', '.html', 'HTML' all become '.html'. */
function normalizeExts(exts) {
  const list = exts === undefined || exts === null ? DEFAULT_EXTS : exts;
  const iterable = Array.isArray(list) || list instanceof Set ? list : [list];
  const out = new Set();
  for (const raw of iterable) {
    const e = String(raw).trim().toLowerCase();
    if (e === '') continue;
    out.add(e.startsWith('.') ? e : '.' + e);
  }
  return out;
}

/** Promise wrapper around zlib.gzip — the callback API, so the loop stays async. */
function gzipBuffer(buf) {
  return new Promise((resolve, reject) => {
    zlib.gzip(buf, { level: 9 }, (err, out) => (err ? reject(err) : resolve(out)));
  });
}

/**
 * Promise wrapper around zlib.brotliCompress at maximum quality.
 * BROTLI_PARAM_SIZE_HINT is set to the exact input length, as the contract
 * requires: the encoder then sizes its window and block split from the real
 * input rather than from a default guess.
 */
function brotliBuffer(buf) {
  return new Promise((resolve, reject) => {
    zlib.brotliCompress(
      buf,
      {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY, // 11
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
        },
      },
      (err, out) => (err ? reject(err) : resolve(out))
    );
  });
}

/**
 * Recursively list files under `dir`, deterministically (directory entries are
 * sorted, so two runs over the same tree produce identical row order and the
 * printed report diffs to nothing).
 */
async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err && err.code === 'ENOENT') return out;
    throw err;
  }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

/* ===================================================================== *
 * precompress
 * ===================================================================== */

/**
 * Write `.gz` (gzip level 9) and `.br` (brotli quality 11, with the size hint)
 * beside every file under `dir` whose extension is in `exts`.
 *
 * Both siblings are always written, even in the rare case where a very small
 * file compresses to more bytes than it started with — the row in the report
 * shows that honestly rather than the function silently doing nothing. A host
 * that finds a larger sibling simply costs the visitor a few bytes; a host that
 * finds a MISSING sibling silently loses the encoding for the whole deploy,
 * which is the failure this module exists to prevent.
 *
 * Files that already end in `.gz` or `.br` are skipped, so re-running the build
 * over an existing `dist/` never produces `index.html.br.br`.
 *
 * @param {string} dir  directory to walk (usually the build output dir)
 * @param {string[]|Set<string>} [exts]  extensions to compress; defaults to
 *        DEFAULT_EXTS. Entries may be written with or without a leading dot.
 * @returns {Promise<{file: string, raw: number, gz: number, br: number}[]>}
 *          one row per compressed file, `file` relative to `dir`, sizes in
 *          bytes. Rows are sorted by path.
 */
export async function precompress(dir, exts) {
  if (typeof dir !== 'string' || dir === '') {
    throw new TypeError('precompress(dir, exts): dir must be a non-empty string');
  }

  let info;
  try {
    info = await stat(dir);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      throw new Error('precompress: directory does not exist: ' + dir);
    }
    throw err;
  }
  if (!info.isDirectory()) throw new Error('precompress: not a directory: ' + dir);

  const wanted = normalizeExts(exts);
  const files = await walk(dir);
  const rows = [];

  for (const file of files) {
    const lower = file.toLowerCase();
    if (COMPRESSED_SUFFIXES.some((s) => lower.endsWith(s))) continue;
    if (!wanted.has(path.extname(lower))) continue;

    const buf = await readFile(file);
    const [gz, br] = await Promise.all([gzipBuffer(buf), brotliBuffer(buf)]);
    await writeFile(file + '.gz', gz);
    await writeFile(file + '.br', br);

    rows.push({
      file: path.relative(dir, file).split(path.sep).join('/'),
      raw: buf.length,
      gz: gz.length,
      br: br.length,
    });
  }

  rows.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0));
  return rows;
}

/* ===================================================================== *
 * report
 * ===================================================================== */

/** Thousands-separated integer, e.g. 112391 -> '112,391'. */
function n(value) {
  return String(Math.round(Number(value) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** '87.5%' — one decimal, never NaN. */
function pct(part, whole) {
  if (!whole) return '—';
  return (100 - (part / whole) * 100).toFixed(1) + '%';
}

/** KiB, one decimal. Used only for the totals line. */
function kib(bytes) {
  return (bytes / 1024).toFixed(1) + ' KiB';
}

function padRight(s, w) {
  const str = String(s);
  return str.length >= w ? str : str + ' '.repeat(w - str.length);
}

function padLeft(s, w) {
  const str = String(s);
  return str.length >= w ? str : ' '.repeat(w - str.length) + str;
}

/**
 * Render `precompress()` rows as a plain-text table.
 *
 * ASCII only, no ANSI colour: CI logs, `npm run build > build.log` and a
 * terminal all get the same bytes, and nothing here can emit an escape
 * sequence that a log viewer renders as garbage.
 *
 * The table shows raw -> gzip -> brotli per file with the brotli saving as a
 * percentage, then a TOTAL line. Every number is measured by this build.
 *
 * @param {{file: string, raw: number, gz: number, br: number}[]} rows
 * @returns {string} printable table (no trailing newline)
 */
export function report(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) {
    return 'PRE-COMPRESSION\n  nothing matched — no .gz/.br siblings were written.';
  }

  const totals = list.reduce(
    (acc, r) => {
      acc.raw += r.raw || 0;
      acc.gz += r.gz || 0;
      acc.br += r.br || 0;
      return acc;
    },
    { raw: 0, gz: 0, br: 0 }
  );

  const H = ['file', 'raw', 'gzip -9', 'brotli -11', 'br saves'];
  const body = list.map((r) => [r.file, n(r.raw), n(r.gz), n(r.br), pct(r.br, r.raw)]);
  const total = ['TOTAL (' + list.length + ' files)', n(totals.raw), n(totals.gz), n(totals.br), pct(totals.br, totals.raw)];

  const widths = H.map((h, i) =>
    Math.max(h.length, total[i].length, ...body.map((row) => row[i].length))
  );

  const line = (cells, fill) =>
    '  ' +
    cells
      .map((c, i) => (i === 0 ? padRight(c, widths[i]) : padLeft(c, widths[i])))
      .join(fill === undefined ? '  ' : fill);

  const rule = '  ' + widths.map((w) => '-'.repeat(w)).join('  ');

  const out = [];
  out.push('PRE-COMPRESSION  (gzip level 9 · brotli quality 11 with BROTLI_PARAM_SIZE_HINT)');
  out.push('');
  out.push(line(H));
  out.push(rule);
  for (const row of body) out.push(line(row));
  out.push(rule);
  out.push(line(total));
  out.push('');
  out.push(
    '  measured this build: ' +
      n(totals.raw) +
      ' B raw -> ' +
      n(totals.br) +
      ' B brotli, ' +
      n(totals.raw - totals.br) +
      ' B saved (' +
      kib(totals.raw - totals.br) +
      ')'
  );
  out.push(
    '  gzip fallback:       ' +
      n(totals.raw) +
      ' B raw -> ' +
      n(totals.gz) +
      ' B gzip,   ' +
      n(totals.raw - totals.gz) +
      ' B saved (' +
      kib(totals.raw - totals.gz) +
      ')'
  );
  out.push(
    '  context: the Lighthouse 12.8.2 mobile run of the ORIGINAL export reported ' +
      '"est. 140 KiB" of'
  );
  out.push(
    '  text-compression savings because nothing was pre-compressed and _headers set no'
  );
  out.push(
    '  Content-Encoding. The two lines above are this build\'s own measurement, not that estimate.'
  );

  return out.join('\n');
}
