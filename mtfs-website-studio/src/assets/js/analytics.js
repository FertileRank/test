/*!
 * analytics.js — third-party loader + rewritten LPS visitor tracker.
 * Plain ES5 IIFE. No modules, no build step, no dependencies. Ship with `defer`.
 *
 * ===========================================================================
 * PART A — THIRD PARTIES OFF THE CRITICAL PATH
 * ===========================================================================
 * BRIEF item 7 — Google Tag Manager (GTM-MKTJCBZG) was the FIRST element inside
 *   <head>, synchronous, AHEAD of <meta charset> — a spec violation, since a
 *   charset declaration must appear within the first 1024 bytes and not after a
 *   script. The Search Atlas script
 *   https://dashboard.fertilerank.com/scripts/dynamic_optimization.js was
 *   `defer` but still parser-discovered early.
 * Both are now injected by this module on whichever comes FIRST of:
 *   (1) requestIdleCallback, (2) the first real user interaction
 *       (pointerdown / keydown / touchstart / scroll), (3) a 3,000 ms ceiling.
 * Neither script is deleted — BRIEF's non-negotiable constraints require both
 * to keep working. GTM's <noscript> iframe stays in the served HTML (with the
 * title="Google Tag Manager" that SA-15 asks for); it is not this file's job.
 *
 * ===========================================================================
 * PART B — LPS VISITOR TRACKER, REWRITTEN
 * ===========================================================================
 * BRIEF item 8 / JSCSS-04 — the shipped tracker was ~7,090 B of INLINE,
 * un-cacheable JavaScript in every page's <head>, re-sent on every page view.
 * Four measured defects are fixed here, and nothing else is changed:
 *
 *  1. setInterval(sendSE, 5000) DELETED. It woke the main thread 12x a minute
 *     for a subsystem that has never sent a single byte (see gate below).
 *     Flushing now happens on visibilitychange->hidden and pagehide only, plus
 *     the original 400 ms post-click debounce.
 *
 *  2. FORCED SYNCHRONOUS LAYOUT REMOVED. The shipped scroll handler read
 *     `var dh = h.scrollHeight || 1` (and pageYOffset, and innerHeight)
 *     SYNCHRONOUSLY, outside its own requestAnimationFrame — the one genuine
 *     reflow on the scroll path. Every geometry read now happens inside the
 *     rAF callback. The per-section getBoundingClientRect() sweep in
 *     recomputeSE() is gone entirely: the IntersectionObserver now consumes its
 *     OWN entries (isIntersecting + intersectionRect + boundingClientRect,
 *     all computed off the main thread) instead of discarding them and
 *     re-measuring, and a second observer with rootMargin '-50% 0px -50% 0px'
 *     identifies the section crossing the viewport midpoint with zero reads —
 *     exactly the `r.top <= mid && r.bottom >= mid` test it replaces.
 *
 *  3. LISTENERS MERGED. Two scroll listeners became one; three capture-phase
 *     click listeners became one dispatcher, so the conversion matcher ro()
 *     runs once per click instead of twice. history.pushState was patched
 *     TWICE (once for the pageview, once for section engagement) — it is now
 *     wrapped once and calls both. replaceState and popstate likewise.
 *
 *  4. topSecs() DELETED. It ran an O(n^2) containment filter
 *     `q.filter(e => !q.some(o => o !== e && o.contains(e)))` over every
 *     section/header/footer, six times per page load (0/1200/3000 ms at boot
 *     and 0/600/1800 ms on reset), only to then discard everything without a
 *     data-section-id. Replaced by querySelectorAll('[data-section-id]').
 *
 * SECTION-ENGAGEMENT GATE — the subsystem is wrapped in
 *   if (document.querySelector('[data-section-id]')) …
 * because the attribute appears ZERO times outside <script> in all 21 exported
 * pages: /api/section-engagement/ has never fired. This preserves that exactly.
 * If render.mjs ever starts emitting data-section-id on <section> elements it
 * TURNS ON an endpoint that has never received data — an analytics ADDITION,
 * not a preservation, and it must be recorded in the changelog.
 *
 * WIRE FORMAT IS PRESERVED BYTE-FOR-BYTE. Endpoints, keys and value semantics
 * are unchanged:
 *   POST /api/track/             base()
 *   POST /api/event/             base() + event_type ('CTA'|'TEL'|'FORM_SUBMIT'
 *                                |'scroll'|'interaction') [+ element_href,
 *                                element_text]
 *   POST /api/section-engagement/ project_id, tracking_secret, visitor_id,
 *                                session_id, page_url, referrer, breakpoint,
 *                                payload:{ sections:[{key,label,order,seen,
 *                                dwell_ms,clicks,cta_clicks,rage_clicks}],
 *                                max_depth, drop_key, reverse_scrolled,
 *                                ttfi_ms, ttcta_ms }
 *   base() = { project_id, tracking_secret, visitor_id, session_id, page_url,
 *              referrer }
 *   visitor_id  localStorage   "_lps_vid"
 *   session_id  sessionStorage "_lps_sid"
 * The only timing change: the pageview now fires from a deferred external
 * script rather than from an inline <head> script, so it lands a few hundred
 * milliseconds later. No field changes.
 *
 * ---------------------------------------------------------------------------
 * MEASURED SIZE  (node:zlib, gzip level 9 / brotli quality 11)
 * ---------------------------------------------------------------------------
 *   this file, as authored : 20,479 B raw · 7,109 B gzip · 6,020 B brotli
 *   comments stripped      :  11,781 B raw · 3,965 B gzip · 3,462 B brotli
 *   replaces               : ~7,090 B of inline, un-cacheable per-page JS
 *                            (~148,890 B site-wide across 21 pages) plus the
 *                            render-blocking inline GTM snippet
 */
(function () {
  'use strict';

  var D = document;
  var W = window;
  var me = D.currentScript;

  function conf(attr, fallback) {
    var v = me && me.getAttribute(attr);
    return v == null || v === '' ? fallback : v;
  }

  /* --- configuration (mirrors site.config.mjs; overridable per page) ------ */
  var GTM_ID = conf('data-gtm-id', 'GTM-MKTJCBZG');
  var SA_SRC = conf('data-sa-src', 'https://dashboard.fertilerank.com/scripts/dynamic_optimization.js');
  var SA_UUID = conf('data-sa-uuid', 'f2087532-0394-429e-ad53-c821afc623e5');
  var P = conf('data-project-id', 'e311c34b-e043-4493-8bbe-3b526ea53fd2');
  var S = conf('data-tracking-secret', '5bb69e05-f4f3-4cae-af52-9b4cef9a3c91');
  var API = conf('data-api', 'https://api.builder.searchatlas.com/api/');
  var IDLE_MS = 3000;

  var E = API + 'track/';
  var EV = API + 'event/';
  var SE = API + 'section-engagement/';

  /* =======================================================================
     PART A — deferred third parties
     ======================================================================= */

  var tpDone = false;

  function script(attrs) {
    var s = D.createElement('script');
    s.async = true;
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) s.setAttribute(k, attrs[k]);
    }
    (D.head || D.documentElement).appendChild(s);
    return s;
  }

  function loadThirdParty() {
    if (tpDone) return;
    tpDone = true;

    /* GTM — the standard snippet, minus the synchronous parser insertion. */
    if (GTM_ID) {
      W.dataLayer = W.dataLayer || [];
      W.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      script({ src: 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID) });
    }

    /* Search Atlas dynamic optimization — same id and data-uuid the script
       reads to identify itself; only the discovery time changes. */
    if (SA_SRC) {
      script({ id: 'sa-dynamic-optimization', 'data-uuid': SA_UUID, src: SA_SRC });
    }

    for (var i = 0; i < INTENT.length; i++) {
      W.removeEventListener(INTENT[i], loadThirdParty, INTENT_OPTS);
    }
  }

  var INTENT = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  var INTENT_OPTS = { passive: true, capture: true };

  for (var ii = 0; ii < INTENT.length; ii++) {
    W.addEventListener(INTENT[ii], loadThirdParty, INTENT_OPTS);
  }
  if (W.requestIdleCallback) W.requestIdleCallback(loadThirdParty, { timeout: IDLE_MS });
  else setTimeout(loadThirdParty, IDLE_MS);

  /* =======================================================================
     PART B — LPS visitor tracker
     ======================================================================= */

  function uuid() {
    try {
      if (W.crypto && W.crypto.randomUUID) return W.crypto.randomUUID();
    } catch (e) { /* fall through */ }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function stored(store, key) {
    try {
      var v = W[store].getItem(key);
      if (v) return v;
      v = uuid();
      W[store].setItem(key, v);
      return v;
    } catch (e) {
      return uuid();
    }
  }

  var V = stored('localStorage', '_lps_vid');

  function sid() { return stored('sessionStorage', '_lps_sid'); }

  function post(url, data) {
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
        mode: 'cors',
        credentials: 'omit'
      })['catch'](function () { });
    } catch (e) { /* never let analytics throw into the page */ }
  }

  function base() {
    return {
      project_id: P,
      tracking_secret: S,
      visitor_id: V,
      session_id: sid(),
      page_url: location.href,
      referrer: D.referrer || ''
    };
  }

  /* ---- pageview ---- */
  function pageview() { post(E, base()); }
  pageview();

  /* ---- conversion matcher (unchanged selector chain and precedence) ---- */
  function ro(x) {
    if (!x || !x.closest) return null;
    var s = x.closest('[data-conversion-trigger]');
    if (s) {
      var r = (s.getAttribute('data-conversion-trigger') || '').toUpperCase();
      if (r === 'CTA' || r === 'TEL' || r === 'FORM_SUBMIT') return [r, s];
    }
    var el = x.closest('a[href^="tel:"]');
    if (el) return ['TEL', el];
    el = x.closest('button[type="submit"],form button:not([type="button"]):not([type="reset"])');
    if (el) return ['FORM_SUBMIT', el];
    el = x.closest('a[class~="bg-primary"],button[class~="bg-primary"],a[class~="btn-primary"],' +
      'button[class~="btn-primary"],a[class~="cta"],button[class~="cta"]');
    if (el) return ['CTA', el];
    return null;
  }

  function text(el) { return (el.textContent || '').trim().slice(0, 255); }

  /* ---- section-engagement state (inert unless the gate below opens) ---- */
  var GATED = !!D.querySelector('[data-section-id]');
  var SEC = {};
  var ord = 0;
  var active = null;
  var lastTs = Date.now();
  var startT = Date.now();
  var maxDepth = 0;
  var revScroll = false;
  var downMax = 0;
  var tFirst = 0;
  var tCta = 0;
  var clkT = null;
  var curUrl = location.href;
  var curPath = location.pathname;
  var vh = 0;
  var ioSeen = null;
  var ioMid = null;

  function tickSE() {
    var now = Date.now();
    if (active) active.dwell_ms += now - lastTs;
    lastTs = now;
  }

  /* IO #1 — visibility. Uses ONLY the geometry the observer already computed
     off the main thread, reproducing the shipped rule
     `vis / Math.min(height, vh) >= 0.2`. No getBoundingClientRect() call. */
  function onSeen(entries) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var s = e.target.__lps;
      if (!s || s.seen) continue;
      var box = e.boundingClientRect;
      var view = (e.rootBounds && e.rootBounds.height) || vh || W.innerHeight || 1;
      var vis = e.intersectionRect ? e.intersectionRect.height : 0;
      if (box.height > 0 && vis / Math.min(box.height, view) >= 0.2) s.seen = true;
    }
  }

  /* IO #2 — which section crosses the viewport midpoint. A -50%/-50% root
     margin collapses the root to a single horizontal line, so isIntersecting
     is precisely the shipped `r.top <= mid && r.bottom >= mid`. */
  function onMid(entries) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var s = e.target.__lps;
      if (!s) continue;
      if (e.isIntersecting) { tickSE(); active = s; }
      else if (active === s) { tickSE(); active = null; }
    }
  }

  function scanSE() {
    if (!GATED) return;
    var q = D.querySelectorAll('[data-section-id]');
    for (var i = 0; i < q.length; i++) {
      var el = q[i];
      var k = el.getAttribute('data-section-id');
      if (!k) continue;
      var h = el.querySelector('h1,h2,h3,h4,h5,h6');
      var L = ((h && h.textContent) ? h.textContent : (el.getAttribute('aria-label') || ''))
        .trim().slice(0, 200);
      var s = SEC[k];
      if (!s) {
        s = SEC[k] = {
          el: el,
          key: k,
          label: L || (el.tagName === 'FOOTER' ? 'Footer'
            : (el.tagName === 'HEADER' ? 'Header' : ('Section ' + (i + 1)))),
          order: ord++,
          seen: false,
          dwell_ms: 0,
          clicks: 0,
          cta_clicks: 0,
          rage_clicks: 0
        };
        el.__lps = s;
        observe(el);
      } else if (s.el !== el) {
        unobserve(s.el);
        s.el = el;
        el.__lps = s;
        if (L) s.label = L;
        observe(el);
      }
    }
  }

  function observe(el) {
    if (ioSeen) ioSeen.observe(el);
    if (ioMid) ioMid.observe(el);
  }

  function unobserve(el) {
    try { if (ioSeen) ioSeen.unobserve(el); } catch (e) { /* detached */ }
    try { if (ioMid) ioMid.unobserve(el); } catch (e) { /* detached */ }
  }

  function sendSE() {
    var ks = Object.keys(SEC);
    if (!ks.length) return;
    tickSE();
    var w = W.innerWidth || 1024;
    var bp = w < 768 ? 'mobile' : (w < 1024 ? 'tablet' : 'desktop');
    var arr = ks.map(function (k) { return SEC[k]; })
      .sort(function (a, b) { return a.order - b.order; });
    var drop = '';
    for (var i = 0; i < arr.length; i++) if (arr[i].seen) drop = arr[i].key;
    var body = {
      project_id: P,
      tracking_secret: S,
      visitor_id: V,
      session_id: sid(),
      page_url: curUrl,
      referrer: D.referrer || '',
      breakpoint: bp,
      payload: {
        sections: arr.map(function (s) {
          return {
            key: s.key,
            label: s.label,
            order: s.order,
            seen: s.seen,
            dwell_ms: Math.round(s.dwell_ms),
            clicks: s.clicks,
            cta_clicks: s.cta_clicks,
            rage_clicks: s.rage_clicks
          };
        }),
        max_depth: Math.min(1, maxDepth),
        drop_key: drop,
        reverse_scrolled: revScroll,
        ttfi_ms: tFirst,
        ttcta_ms: tCta
      }
    };
    try {
      var b = new Blob([JSON.stringify(body)], { type: 'application/json' });
      if (!navigator.sendBeacon || !navigator.sendBeacon(SE, b)) post(SE, body);
    } catch (e) {
      post(SE, body);
    }
  }

  function flushSE() {
    if (!GATED) return;
    scanSE();
    sendSE();
  }

  function resetSE() {
    if (ioSeen) ioSeen.disconnect();
    if (ioMid) ioMid.disconnect();
    SEC = {};
    ord = 0;
    active = null;
    lastTs = Date.now();
    startT = Date.now();
    maxDepth = 0;
    revScroll = false;
    downMax = 0;
    tFirst = 0;
    tCta = 0;
    curUrl = location.href;
    curPath = location.pathname;
    GATED = !!D.querySelector('[data-section-id]');
    scanSE();
    setTimeout(scanSE, 600);
    setTimeout(scanSE, 1800);
  }

  /* -----------------------------------------------------------------------
     ONE scroll listener. Every geometry read is inside the rAF callback —
     this is the forced-synchronous-layout fix.
     ----------------------------------------------------------------------- */
  var scrollFired = 0;
  var ticking = false;

  W.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var h = D.documentElement;
      var y = W.pageYOffset || h.scrollTop || 0;
      vh = W.innerHeight || 0;

      /* 25%-depth one-shot 'scroll' conversion event (denominator unchanged) */
      if (!scrollFired) {
        var dh1 = (h.scrollHeight - h.clientHeight) || 1;
        if (y / dh1 >= 0.25) {
          scrollFired = 1;
          var d = base();
          d.event_type = 'scroll';
          post(EV, d);
        }
      }

      if (!GATED) return;
      var dh2 = h.scrollHeight || 1;
      var depth = (y + vh) / dh2;
      if (depth > maxDepth) maxDepth = depth;
      if (y > downMax) downMax = y;
      else if (downMax - y > 200) revScroll = true;
    });
  }, { passive: true });

  /* -----------------------------------------------------------------------
     ONE capture-phase click dispatcher. ro() runs once; the conversion event,
     the first-interaction event and section accounting all read its result.
     ----------------------------------------------------------------------- */
  var interactionSent = 0;
  var lastCT = 0;
  var lastCS = null;
  var rapid = 0;

  D.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var re = ro(t);

    if (re) {
      var el = re[1];
      var href = el.tagName === 'A' ? (el.getAttribute('href') || '') : '';
      var d = base();
      d.event_type = re[0];
      d.element_href = href.slice(0, 2048);
      d.element_text = text(el);
      post(EV, d);
    } else if (!interactionSent) {
      var any = t.closest('a,button,[role=button]');
      if (any) {
        interactionSent = 1;
        var i = base();
        i.event_type = 'interaction';
        i.element_text = text(any);
        post(EV, i);
      }
    }

    if (!GATED) return;
    var now = Date.now();
    if (!tFirst) tFirst = now - startT;
    var host = t.closest('[data-section-id]');
    var s = host ? SEC[host.getAttribute('data-section-id')] : null;
    if (!s) return;
    s.clicks++;
    if (re) {
      s.cta_clicks++;
      if (!tCta) tCta = now - startT;
    }
    if (now - lastCT < 800 && lastCS === s) {
      rapid++;
      if (rapid >= 2) s.rage_clicks++;
    } else {
      rapid = 0;
    }
    lastCT = now;
    lastCS = s;
    clearTimeout(clkT);
    clkT = setTimeout(sendSE, 400);
  }, true);

  /* -----------------------------------------------------------------------
     History patched ONCE. The shipped code wrapped pushState twice.
     ----------------------------------------------------------------------- */
  function navSE() {
    if (location.pathname === curPath) return;
    sendSE();
    resetSE();
  }

  function onNavigate() {
    pageview();
    navSE();
  }

  var push = history.pushState;
  if (push) {
    history.pushState = function () {
      push.apply(this, arguments);
      onNavigate();
    };
  }
  var repl = history.replaceState;
  if (repl) {
    history.replaceState = function () {
      repl.apply(this, arguments);
      navSE();
    };
  }
  W.addEventListener('popstate', onNavigate);

  /* -----------------------------------------------------------------------
     Flush paths. No 5 s heartbeat — sendBeacon on hide and unload only.
     ----------------------------------------------------------------------- */
  D.addEventListener('visibilitychange', function () {
    if (D.visibilityState === 'hidden') flushSE();
    else lastTs = Date.now();
  });
  W.addEventListener('focus', function () { lastTs = Date.now(); });
  W.addEventListener('pagehide', flushSE);

  /* -----------------------------------------------------------------------
     Boot the section-engagement subsystem — only when the page actually
     carries [data-section-id]. No page in the 21-page export does.
     ----------------------------------------------------------------------- */
  function bootSE() {
    if (!GATED || !W.IntersectionObserver) return;
    vh = W.innerHeight || 0;
    ioSeen = new IntersectionObserver(onSeen, { threshold: [0, 0.2, 0.5, 0.75, 1] });
    ioMid = new IntersectionObserver(onMid, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    scanSE();
    setTimeout(scanSE, 1200);
    setTimeout(scanSE, 3000);
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', bootSE, { once: true });
  else bootSE();
})();
