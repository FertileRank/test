/**
 * LPS-943 — Post-SSR image optimisation for static-published sites.
 *
 * For every `<img src="https://images.unsplash.com/…">` in the SSR-rendered
 * HTML, this module:
 *
 *   • appends `&auto=format&q=75` so the Unsplash CDN can serve WebP/AVIF
 *     via content negotiation (browser `Accept` header drives the choice —
 *     no hard-coded `fm=webp` that would defeat that)
 *   • emits a width-descriptor `srcset` keeping aspect ratio constant across
 *     candidates (so the mobile-rendered hero doesn't art-direction-shift
 *     vs. the desktop crop)
 *   • emits a `sizes` attribute inferred from declared width/height +
 *     full-bleed CSS class hints
 *   • injects ONE `<link rel="preload" as="image">` for the LCP candidate
 *     with `imagesrcset`/`imagesizes` that exactly match the rendered `<img>`
 *     so the preload-scanner doesn't trigger a duplicate fetch
 *
 * Previous `<link rel="preload" as="image">` tags in `<head>` (e.g. emitted
 * by the LPS-19 `seoInjectorPlugin` in `vite.config.ts`) are REPLACED only
 * when this module successfully picks an Unsplash LCP candidate. Pages
 * where no Unsplash image qualifies (logo.dev hero, placehold.co fallback,
 * all-lazy gallery) keep the upstream preload tag intact.
 *
 * The previous `containers/vitejs-boilerplate/src/lib/PerformanceDefaults.ts`
 * client-side mutator was removed in the same change because it ran AFTER
 * the browser had already started fetching the original JPEG, triggering a
 * second HTTP request per image with `&auto=format` appended.
 *
 * Pure-function entry point: pass in HTML, get back HTML. The caller is
 * responsible for read/write/error handling.
 */

import { parse } from "node-html-parser";

const UNSPLASH_HOST = "images.unsplash.com";

// Width candidates emitted in `srcset`. Anything wider than the image's
// intrinsic width is dropped so we never tell the browser to ask Unsplash
// for an upscaled crop.
const RESPONSIVE_WIDTHS = [480, 768, 1024, 1280, 1920];

/**
 * Split an Unsplash URL into `{ base, params }` where `base` is everything
 * up to (but excluding) the first `?`, and `params` is a URLSearchParams.
 */
function parseUnsplashUrl(url) {
  const queryIdx = url.indexOf("?");
  if (queryIdx < 0) {
    return { base: url, params: new URLSearchParams() };
  }
  return {
    base: url.slice(0, queryIdx),
    params: new URLSearchParams(url.slice(queryIdx + 1)),
  };
}

/**
 * Build an Unsplash URL for one width candidate. Preserves the aspect ratio
 * derived from the source URL's `w`/`h` so every candidate crops the same
 * region — no art-direction shift across viewport sizes.
 */
function buildVariantUrl(parsed, targetWidth) {
  const baseW = parseInt(parsed.params.get("w") || "0", 10);
  const baseH = parseInt(parsed.params.get("h") || "0", 10);
  const params = new URLSearchParams(parsed.params);

  params.set("w", String(targetWidth));
  if (baseW > 0 && baseH > 0) {
    const ratio = baseH / baseW;
    params.set("h", String(Math.round(targetWidth * ratio)));
  } else {
    // No aspect known — let Unsplash choose. `fit=crop` without `h` will
    // crop to its default; safer to drop `h` than to invent one.
    params.delete("h");
  }

  // `auto=format` lets Unsplash pick AVIF/WebP/JPEG per the request's
  // `Accept` header. We deliberately do NOT hard-set `fm=webp` because
  // that disables content negotiation and prevents AVIF on supporting
  // browsers. Equally important: if the source URL already carries an
  // explicit `fm=…` (e.g. the agent or Python `_fix_unsplash_image_format`
  // chose a format), do NOT add `auto=format` on top — Imgix treats `fm`
  // and `auto=format` as conflicting hints and the result is undefined.
  if (!params.has("auto") && !params.has("fm")) {
    params.set("auto", "format");
  }
  if (!params.has("q")) params.set("q", "75");

  return `${parsed.base}?${params.toString()}`;
}

/**
 * Derive a `sizes` attribute for one image. The CSS rendered width is what
 * actually determines which candidate the browser picks — we infer it from
 * the declared `width`/`height` and the className.
 */
function inferSizes(img, declaredWidth, declaredHeight) {
  const className = img.getAttribute("class") || "";

  // Full-bleed background image (ImageBackground / inline pattern in
  // image_guidance_pool.md). Spans the section width.
  const isFullBleed =
    /\babsolute\s+inset-0\b/.test(className) ||
    (declaredWidth >= 1200 && /\bobject-cover\b/.test(className));

  if (isFullBleed) return "100vw";
  if (declaredWidth >= 1600) return "100vw";

  // Square portrait (testimonials, team) — small thumbnail on mobile, fixed
  // size on desktop.
  if (
    declaredWidth > 0 &&
    declaredWidth === declaredHeight &&
    declaredWidth <= 200
  ) {
    return "(max-width: 768px) 25vw, 96px";
  }
  if (
    declaredWidth > 0 &&
    declaredWidth === declaredHeight &&
    declaredWidth <= 400
  ) {
    return "(max-width: 768px) 50vw, 200px";
  }

  // Default card / feature image — stacked full-width on mobile, ~1/3
  // viewport on desktop grids.
  return "(max-width: 768px) 100vw, 400px";
}

/**
 * Read shared LCP-relevant attributes off an `<img>`. Used by both the
 * mutation path and the "trust agent's responsive markup" path so the LCP
 * candidate selector gets a consistent metadata shape.
 *
 * React serialises `fetchPriority` as either `fetchpriority` or
 * `fetchPriority`; HTML attribute names are case-insensitive so we accept
 * both.
 *
 * Two fallbacks beyond the raw `width`/`height` attrs:
 *   1. `intrinsicWidth`/`intrinsicHeight` from the Unsplash URL's `?w=`/`?h=`
 *      params. Closes the LPS-863 `ImageBackground` gap — its inner `<img>`
 *      relies on `absolute inset-0` for sizing and never carries explicit
 *      width/height attrs. Without an intrinsicHeight fallback, those
 *      images would resolve to `declaredHeight = 0`, fail the
 *      `area > 0` eligibility check in `pickLcpCandidate`, and only
 *      survive via the `fetchpriority="high"` shortcut — fragile because
 *      the agent sometimes forgets the hint.
 *   2. `isFullBleed` className signal — recognises `<img absolute inset-0
 *      object-cover>` even when the URL didn't carry an `h=` param. The
 *      LCP ranker uses this to assign a section-sized synthetic area so
 *      the hero outranks any in-content image.
 */
function readImgMeta(img, intrinsicWidth, intrinsicHeight) {
  const declaredWidth =
    parseInt(img.getAttribute("width") || "0", 10) || intrinsicWidth;
  const declaredHeight =
    parseInt(img.getAttribute("height") || "0", 10) || intrinsicHeight;
  const fetchPriority = (
    img.getAttribute("fetchpriority") ||
    img.getAttribute("fetchPriority") ||
    ""
  ).toLowerCase();
  const loading = (img.getAttribute("loading") || "").toLowerCase();
  const className = img.getAttribute("class") || "";
  const isFullBleed =
    /\babsolute\s+inset-0\b/.test(className) &&
    /\bobject-cover\b/.test(className);
  return { declaredWidth, declaredHeight, fetchPriority, loading, isFullBleed };
}

/**
 * Mutate one `<img>` element in-place: set `src`, `srcset`, `sizes`,
 * `decoding`. Returns the metadata needed later to choose an LCP candidate.
 *
 * When the agent has already emitted a `srcset`, we trust it (no attribute
 * mutation) but still record metadata so this image stays eligible for LCP
 * candidate selection. Without that, an agent who ignored the prompt and
 * wrote responsive markup on the hero would deny the page a preload tag
 * entirely.
 */
function optimizeImg(img) {
  const src = img.getAttribute("src");
  if (!src || !src.includes(UNSPLASH_HOST)) return null;

  const parsed = parseUnsplashUrl(src);
  const intrinsicWidth = parseInt(parsed.params.get("w") || "0", 10);
  const intrinsicHeight = parseInt(parsed.params.get("h") || "0", 10);
  const meta = readImgMeta(img, intrinsicWidth, intrinsicHeight);

  // Agent already emitted responsive markup — don't second-guess it, but
  // keep this image in the LCP candidate pool so the preload tag we emit
  // mirrors the agent's choices.
  const existingSrcset = img.getAttribute("srcset");
  if (existingSrcset) {
    let existingSizes = img.getAttribute("sizes");
    if (!existingSizes) {
      // Browser default is `100vw` when `sizes` is omitted — we set the
      // same value explicitly so the `<img>` and the preload tag agree.
      existingSizes = inferSizes(img, meta.declaredWidth, meta.declaredHeight);
      img.setAttribute("sizes", existingSizes);
    }
    return {
      ...meta,
      fallbackSrc: src,
      srcset: existingSrcset,
      sizes: existingSizes,
    };
  }

  // Cap candidates at the intrinsic width so we never upscale.
  let widths = RESPONSIVE_WIDTHS.filter(
    (w) => intrinsicWidth === 0 || w <= intrinsicWidth,
  );
  if (widths.length === 0) {
    // Source was smaller than our smallest candidate — emit one variant at
    // the intrinsic width so we still apply auto=format/q.
    widths = [intrinsicWidth || 1024];
  }

  const srcsetEntries = widths.map(
    (w) => `${buildVariantUrl(parsed, w)} ${w}w`,
  );
  const sizes = inferSizes(img, meta.declaredWidth, meta.declaredHeight);

  // Fallback `src`: pick the middle candidate so legacy browsers (no
  // srcset support) get something reasonable, AND so the preload-scanner
  // has a valid `href` that's already in our `srcset`.
  const fallbackWidth = widths[Math.floor(widths.length / 2)];
  const fallbackSrc = buildVariantUrl(parsed, fallbackWidth);

  img.setAttribute("src", fallbackSrc);
  img.setAttribute("srcset", srcsetEntries.join(", "));
  img.setAttribute("sizes", sizes);
  if (!img.getAttribute("decoding")) {
    img.setAttribute("decoding", "async");
  }

  return {
    ...meta,
    fallbackSrc,
    srcset: srcsetEntries.join(", "),
    sizes,
  };
}

/**
 * Pick the single LCP candidate from the list of optimised images.
 *
 * Heuristic, in order:
 *   1. Largest image with `fetchpriority="high"` (agent's explicit hint)
 *   2. Largest non-lazy image
 *
 * Returns null if no candidate qualifies (e.g., page has zero Unsplash
 * images, or every Unsplash image is `loading="lazy"`).
 *
 * Ranking uses an **effective area** rather than raw `width × height`:
 *
 *   • A full-bleed `<img>` (`absolute inset-0 object-cover`) that lacks
 *     `width`/`height` attrs AND whose Unsplash URL has no `h=` param is
 *     treated as section-sized. This is the LPS-863 `ImageBackground`
 *     pattern — its inner `<img>` relies on CSS sizing and never carries
 *     explicit dimensions, so `width × height` collapses to 0 in the
 *     naive area calculation. Without this fallback the hero was filtered
 *     out by the eligibility check and only survived via the
 *     `fetchpriority="high"` shortcut.
 *
 *   • The synthetic area is intentionally large (1920 × 1080) so a
 *     full-bleed hero outranks any normal in-content image, even if the
 *     in-content image happens to declare larger dimensions.
 */
function pickLcpCandidate(optimised) {
  if (optimised.length === 0) return null;

  const FULL_BLEED_SYNTHETIC_AREA = 1920 * 1080;
  const effectiveArea = (o) => {
    const raw = o.declaredWidth * o.declaredHeight;
    if (raw > 0) return raw;
    return o.isFullBleed ? FULL_BLEED_SYNTHETIC_AREA : 0;
  };

  const priority = optimised.filter((o) => o.fetchPriority === "high");
  if (priority.length > 0) {
    return priority.reduce((best, cur) =>
      effectiveArea(cur) > effectiveArea(best) ? cur : best,
    );
  }

  const eligible = optimised.filter(
    (o) => o.loading !== "lazy" && effectiveArea(o) > 0,
  );
  if (eligible.length === 0) return null;

  return eligible.reduce((best, cur) =>
    effectiveArea(cur) > effectiveArea(best) ? cur : best,
  );
}

/**
 * Remove any existing `<link rel="preload" as="image">` tags in `<head>`.
 *
 * Called ONLY when we have a fresh LCP-candidate preload ready to inject in
 * its place. We deliberately do NOT clear preloads unconditionally:
 *
 *   • The LPS-19 `seoInjectorPlugin` (`vite.config.ts`) emits its own
 *     preload at build time, before this script runs. That tag might
 *     point at a non-Unsplash hero (logo.dev brand strip, placehold.co
 *     fallback) which this module won't replace — clearing without
 *     replacing would regress LCP for those pages.
 *   • A future maintainer (or a one-off site with a hand-edited
 *     `index.html`) might add their own preload tag. Same logic applies.
 *
 * The "we own the preload surface" claim from the file header is therefore
 * scoped: we own it only for pages where THIS module successfully picks an
 * Unsplash LCP candidate. Everything else inherits the upstream tag.
 */
function clearExistingImagePreloads(root) {
  const head = root.querySelector("head");
  if (!head) return;
  const stale = head.querySelectorAll('link[rel="preload"][as="image"]');
  for (const link of stale) {
    link.remove();
  }
}

/**
 * Inject a `<link rel="preload" as="image">` for `lcp` into `<head>`.
 */
function injectPreload(root, lcp) {
  const head = root.querySelector("head");
  if (!head) return;

  const esc = (v) =>
    String(v)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const tag =
    `<link rel="preload" as="image" ` +
    `href="${esc(lcp.fallbackSrc)}" ` +
    `imagesrcset="${esc(lcp.srcset)}" ` +
    `imagesizes="${esc(lcp.sizes)}" ` +
    `fetchpriority="high">`;

  head.insertAdjacentHTML("beforeend", tag);
}

/**
 * Main entry point. Returns optimised HTML; throws on parse error so the
 * caller's try/catch can fall back to the un-optimised input.
 *
 * @param {string} html — full document HTML
 * @returns {string} — full document HTML, mutated
 */
export function optimizeUnsplashImages(html) {
  const root = parse(html, {
    comment: true, // keep comments so we don't mangle Vite asset markers
    blockTextElements: {
      script: true,
      noscript: true,
      style: true,
      pre: true,
    },
  });

  const imgs = root.querySelectorAll("img");
  const optimised = [];
  for (const img of imgs) {
    const meta = optimizeImg(img);
    if (meta) optimised.push(meta);
  }

  // Replace any existing image-preload tags ONLY when we have a new one to
  // inject. Otherwise leave whatever upstream emitted (e.g. LPS-19
  // seoInjectorPlugin for a non-Unsplash hero) intact — see the comment on
  // clearExistingImagePreloads for the full rationale.
  const lcp = pickLcpCandidate(optimised);
  if (lcp) {
    clearExistingImagePreloads(root);
    injectPreload(root, lcp);
  }

  return root.toString();
}

/**
 * Test-only export — for unit tests over individual helpers.
 */
export const __test = {
  parseUnsplashUrl,
  buildVariantUrl,
  inferSizes,
  optimizeImg,
  pickLcpCandidate,
};
