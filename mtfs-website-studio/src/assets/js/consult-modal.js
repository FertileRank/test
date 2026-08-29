/*!
 * consult-modal.js — lazy loader for the book-a-consultation wizard.
 * Plain ES5 IIFE. No modules, no build step, no dependencies. Safe to `defer`.
 *
 * ---------------------------------------------------------------------------
 * FINDINGS THIS FILE ADDRESSES
 * ---------------------------------------------------------------------------
 * JSCSS-05 / BRIEF item 12 — /assets/book-consultation-modal.min.js (58,472 B)
 *   was loaded with <script defer> on ALL 20 non-404 pages even though the
 *   wizard only ever opens on user intent. Worse, on / the popup instance was
 *   provably UNREACHABLE: because #hero-form-card exists there, every trigger
 *   took the heroSlot.scrollIntoView branch, so the ~98-tag second copy of the
 *   wizard built at lines 830-832 could never be opened. This file replaces the
 *   eager <script> and pulls the bundle in only on real intent.
 *
 * SA-08 — The shipped modal root was built with the `hidden` attribute, but its
 *   own injected stylesheet declared #mtfs-modal-root{display:flex}, which beats
 *   the UA [hidden]{display:none}. A closed 4-step dialog with ~15 focusable
 *   controls therefore sat in the accessibility tree and the tab order of every
 *   page (Lighthouse recorded a non-zero boundingRect, top 163, for the
 *   "hidden" progressbar). Not constructing the modal until first intent removes
 *   those phantom tab stops, 8 aria-allowed-attr nodes and 1
 *   aria-progressbar-name node from every page. The two ARIA defects INSIDE the
 *   bundle (role="option" + aria-pressed, and the unnamed role="progressbar")
 *   still have to be fixed in the bundle itself — lazy loading does not fix
 *   them, because the eager inline hero card on / hits both.
 *
 * ---------------------------------------------------------------------------
 * TRIGGER SET  (exactly the three selectors the shipped bundle bound, plus one
 * deliberate addition)
 * ---------------------------------------------------------------------------
 *   [data-open-consult]    line 837 of book-consultation-modal.js
 *   .mm-cta                line 852  (0 static occurrences — it was injected by
 *                          mega-menu.js and also carried data-open-consult, so
 *                          the first loop always claimed it)
 *   .open-consult-modal    line 861  (dead site-wide, kept for compatibility)
 *   #consult hash          NEW. The header CTA is now server-rendered as
 *                          href="/contact/#consult" so a no-JS visitor reaches
 *                          the real contact page; with JS the hash opens the
 *                          wizard directly. Handled on load and on hashchange.
 *
 * Deleted with the eager script: the MutationObserver on document.body (it
 * existed only to race the JS-injected header, which is now server-rendered),
 * window.MtfsModal (line 887 — it resolved `open` to window.open, a broken
 * public API), and the stray buildPopupShell() '<span></span>' appended to
 * every page's body.
 *
 * ---------------------------------------------------------------------------
 * IDLE WARM-UP GATE
 * ---------------------------------------------------------------------------
 * requestIdleCallback pre-fetches the bundle only when the page HAS a trigger
 * AND LACKS #hero-form-card. On / the hero card is present, so the popup is
 * unreachable and warming it would be pure waste. Browsers without
 * requestIdleCallback fall back to a setTimeout of the same ceiling.
 *
 * ---------------------------------------------------------------------------
 * MEASURED SIZE  (node:zlib, gzip level 9 / brotli quality 11)
 * ---------------------------------------------------------------------------
 *   this file, as authored : 8,079 B raw · 3,088 B gzip · 2,531 B brotli
 *   comments stripped      : 2,483 B raw · 969 B gzip · 788 B brotli
 *   defers                 : book-consultation-modal.min.js, 58,472 B raw
 *                            (29,964 B brotli; 25,875 B / 6,637 B brotli once
 *                            the 32,626 B base64 PNG of JSCSS-01 is removed)
 */
(function () {
  'use strict';

  var D = document;
  var me = D.currentScript;

  var SRC = (me && me.getAttribute('data-modal-src')) ||
    '/assets/book-consultation-modal.js';
  var IDLE_MS = 3000;
  var TRIGGERS = '[data-open-consult], .mm-cta, .open-consult-modal';

  var state = 0;            /* 0 idle · 1 loading · 2 ready · 3 failed */
  var queue = [];           /* callbacks waiting on the bundle */

  function ready() {
    state = 2;
    var q = queue;
    queue = [];
    for (var i = 0; i < q.length; i++) q[i]();
  }

  function failed() {
    state = 3;
    var q = queue;
    queue = [];
    /* Degrade to the real page rather than swallowing the click. */
    for (var i = 0; i < q.length; i++) q[i](true);
  }

  /**
   * Inject the bundle exactly once. `cb` runs when it is ready (or, with a
   * truthy argument, when it could not be loaded).
   */
  function load(cb) {
    if (cb) {
      if (state === 2) { cb(); return; }
      if (state === 3) { cb(true); return; }
      queue.push(cb);
    }
    if (state) return;
    state = 1;
    var s = D.createElement('script');
    s.src = SRC;
    s.async = true;
    s.addEventListener('load', ready);
    s.addEventListener('error', failed);
    D.head.appendChild(s);
  }

  /**
   * Replay the user's intent once the bundle has bound its own handlers.
   * The bundle guards every element with `el.dataset.consultBound`, so a
   * synthetic click lands on exactly one handler. Our own capture listener
   * short-circuits while state === 2, so this cannot recurse.
   */
  function replay(el) {
    return function (broke) {
      if (broke) {
        var href = el && el.getAttribute && el.getAttribute('href');
        if (href) location.href = href;
        return;
      }
      if (el && el.click) el.click();
    };
  }

  /* -----------------------------------------------------------------------
     1. Delegated click — ONE capture-phase listener for all three selectors.
     ----------------------------------------------------------------------- */
  D.addEventListener('click', function (e) {
    if (state === 2) return;                 /* bundle owns the click now */
    if (e.defaultPrevented || e.button) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var t = e.target;
    if (!t || !t.closest) return;
    var el = t.closest(TRIGGERS);
    if (!el) return;
    e.preventDefault();
    load(replay(el));
  }, true);

  /* -----------------------------------------------------------------------
     2. #consult hash, on load and on hashchange.
     On / the wizard lives inline in #hero-form-card, so scroll to it instead
     of opening a popup the shipped code could never reach anyway.
     ----------------------------------------------------------------------- */
  function fromHash() {
    if (location.hash !== '#consult') return;
    var hero = D.getElementById('hero-form-card');
    if (hero) {
      var reduce = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      hero.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    var el = D.querySelector(TRIGGERS);
    load(el ? replay(el) : null);
  }

  window.addEventListener('hashchange', fromHash);
  fromHash();

  /* -----------------------------------------------------------------------
     3. Idle warm-up — only where the popup is actually reachable.
     ----------------------------------------------------------------------- */
  function warm() {
    if (state) return;
    if (D.getElementById('hero-form-card')) return;
    if (!D.querySelector(TRIGGERS)) return;
    load(null);
  }

  function scheduleWarm() {
    if (window.requestIdleCallback) window.requestIdleCallback(warm, { timeout: IDLE_MS });
    else setTimeout(warm, IDLE_MS);
  }

  if (D.readyState === 'complete') scheduleWarm();
  else window.addEventListener('load', scheduleWarm, { once: true });
})();
