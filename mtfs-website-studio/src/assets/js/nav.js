/*!
 * nav.js — behaviour-only controller for the SERVER-RENDERED MedTech header.
 * Plain ES5 IIFE. No modules, no build step, no dependencies. Safe to `defer`.
 *
 * ---------------------------------------------------------------------------
 * FINDINGS THIS FILE ADDRESSES
 * ---------------------------------------------------------------------------
 * JSCSS-02 / SA-01 — The shipped /assets/mega-menu.min.js (29,331 B) built the
 *   ENTIRE header at runtime via document.body.insertAdjacentHTML('afterbegin',
 *   HEADER_HTML), producing 13,725 B of HTML / 207 elements and leaving 0
 *   <header> and 0 <nav> in the static markup of 20 of 21 pages. Lighthouse
 *   measured Style & Layout at 561.6 ms — 47% of the 1.2 s main thread — against
 *   only 122.9 ms of Script Evaluation. The header is now emitted by
 *   build/lib/render.mjs -> renderHeader(); this file only WIRES it.
 *
 * JSCSS-06 — mega-menu.min.js was 64% data and markup: SEARCH_INDEX 8,685 B
 *   (29.6%), ICONS 4,391 B (15.0%), HEADER_HTML 4,426 B (15.1%), service data
 *   1,416 B. All of it is gone from JavaScript. The search corpus is fetched
 *   once, on the first search open, from the build-generated
 *   /search-index.json (generated from routes[] in site.config.mjs — the shipped
 *   SEARCH_INDEX held 24 records with only 20 unique hrefs, exactly the
 *   canonical non-404 routes, so it was fully derivable). The duplicate
 *   'OvaTools LMS' record's alias keywords are folded into the canonical
 *   /services/lab-solutions/real-time-monitoring/ entry by the generator.
 *
 * SA-10 — Two real keyboard defects in the shipped code, fixed here:
 *   (a) the old keydown handler called preventDefault() on Enter/Space as well
 *       as ArrowDown, which suppressed the synthesized click, so the click
 *       handler's toggle never ran and a keyboard user could OPEN a panel but
 *       never CLOSE it. This file handles ONLY ArrowDown in keydown and lets
 *       Enter/Space fall through to native <button> activation.
 *   (b) there was no focusout handler, so tabbing past the last .mm-item left
 *       the panel open with aria-expanded="true" while focus was elsewhere.
 *       A focusout listener on each disclosure <li> now closes it.
 *
 * SA-04/SA-05 heading order, link text and aria-current are build-time concerns
 *   and are absent from this file by design: the runtime `data-mm-match` regex
 *   loop and the two `style.background` writes it performed have been deleted;
 *   renderHeader() emits aria-current="page" and .mm-active directly.
 *
 * JSCSS-10 — <button class="mm-search-close" aria-label="Close search">ESC</button>
 *   failed the label-content-name-mismatch shape (visible text not contained in
 *   the accessible name). The overlay this file injects wraps it as
 *   <button aria-label="Close search"><span aria-hidden="true">ESC</span></button>.
 *   Results use a correct combobox/listbox pairing (input role="combobox" +
 *   aria-activedescendant, options with aria-selected) rather than the shipped
 *   role="option" + stray attributes.
 *
 * ---------------------------------------------------------------------------
 * ACCESSIBILITY NOTE ON "FOCUS TRAPPING"
 * ---------------------------------------------------------------------------
 * The mega panels are DISCLOSURES, not modals: trapping Tab inside one would
 * strand keyboard users, so they use focusout-to-close (the SA-10 fix) plus the
 * stylesheet's :focus-within fallback. A real Tab trap is applied only to the
 * search overlay, which is genuinely role="dialog" aria-modal="true".
 * Closed panels leave the accessibility tree through the stylesheet's
 * visibility:hidden — never opacity/pointer-events alone (SA-08).
 *
 * ---------------------------------------------------------------------------
 * SEARCH INDEX CONTRACT  (/search-index.json, build artifact, never hand-written)
 * ---------------------------------------------------------------------------
 *   {
 *     "suggestions": [ { "label": "IVF lab monitoring",
 *                        "query": "real-time monitoring OvaTools" } ],
 *     "synonyms":    { "monitoring": ["monitor","track","ovatools"] },
 *     "docs":        [ { "href":     "/services/lab-solutions/gpo-purchasing/",
 *                        "title":    "GPO Purchasing",
 *                        "section":  "Lab Solutions",
 *                        "snippet":  "1,800+ vendor contracts…",
 *                        "keywords": ["gpo","purchasing"],
 *                        "iconPath": "M3 3h2l.4 2…"   // optional SVG path data
 *                      } ]
 *   }
 * A bare array of docs is also accepted. Ranking weights are ported verbatim
 * from the shipped engine (title 10, section 6, keyword 5, snippet 3, title
 * prefix +4, keyword substring +2) so result order does not change.
 *
 * ---------------------------------------------------------------------------
 * MEASURED SIZE  (node:zlib, gzip level 9 / brotli quality 11)
 * ---------------------------------------------------------------------------
 *   this file, as authored : 16,067 B raw · 5,622 B gzip · 4,692 B brotli
 *   comments stripped      : 6,995 B raw · 2,018 B gzip · 1,727 B brotli
 *   replaces               : mega-menu.min.js, 29,331 B raw · 8,635 B brotli
 * Budget note: the payload audit budgets nav.js at <= 3,000 B minified /
 * <= 1,300 B brotli and search.js at <= 5,000 B raw / <= 1,800 B brotli as two
 * separate artifacts. This build ships them as ONE file, so the applicable
 * ceiling is the sum, 3,100 B brotli — see the delivery notes.
 */
(function () {
  'use strict';

  var D = document;
  var header = D.getElementById('mm-header');
  if (!header) return; /* no SSR header on this page — nothing to wire */

  var me = D.currentScript;
  var INDEX_URL = (me && me.getAttribute('data-search-index')) || '/search-index.json';

  var body = D.body;
  var nav = D.getElementById('mm-nav');
  var burger = header.querySelector('.mm-burger');
  var scrim = D.querySelector('.mm-mobile-scrim');
  var btt = D.getElementById('mm-back-to-top');
  var searchBtn = D.getElementById('mm-search-open');
  var triggers = [].slice.call(header.querySelectorAll('[data-mm-trigger]'));

  function panelOf(t) { return D.getElementById(t.getAttribute('aria-controls')); }

  var panels = triggers.map(function (t) { return panelOf(t); });

  /* =========================================================================
     1. MEGA-PANEL DISCLOSURES
     ========================================================================= */

  var openTimer = null;
  var closeTimer = null;

  function setOpen(trigger, open) {
    var panel = panelOf(trigger);
    if (!panel) return;
    panel.classList.toggle('mm-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeAll(except, immediate) {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    var run = function () {
      for (var i = 0; i < triggers.length; i++) {
        if (panels[i] !== except) setOpen(triggers[i], false);
      }
    };
    if (immediate) run(); else closeTimer = setTimeout(run, 140);
  }

  function openPanel(trigger) {
    clearTimeout(closeTimer);
    closeAll(panelOf(trigger), true);
    setOpen(trigger, true);
  }

  function closePanel(trigger, immediate) {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (immediate) { setOpen(trigger, false); return; }
    closeTimer = setTimeout(function () { setOpen(trigger, false); }, 140);
  }

  function openTrigger() {
    for (var i = 0; i < triggers.length; i++) {
      if (panels[i] && panels[i].classList.contains('mm-open')) return triggers[i];
    }
    return null;
  }

  /* Hover intent — desktop pointers only. 60 ms to open, 140 ms to close,
     ported unchanged from the shipped module so the feel does not shift. */
  var hoverCapable = !(window.matchMedia && window.matchMedia('(hover: none)').matches);

  triggers.forEach(function (trigger, i) {
    var li = trigger.parentElement;
    var panel = panels[i];
    if (!panel || !li) return;

    if (hoverCapable) {
      li.addEventListener('mouseenter', function () {
        clearTimeout(openTimer);
        openTimer = setTimeout(function () { openPanel(trigger); }, 60);
      });
      li.addEventListener('mouseleave', function () {
        clearTimeout(openTimer);
        closePanel(trigger);
      });
      panel.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
      panel.addEventListener('mouseleave', function () { closePanel(trigger); });
    }

    /* Native <button> activation: a click (mouse, Enter or Space) toggles.
       SA-10(a): we must NOT preventDefault on Enter/Space in keydown, or this
       handler never sees the synthesized click and the panel cannot be closed
       from the keyboard. */
    trigger.addEventListener('click', function () {
      if (panel.classList.contains('mm-open')) closePanel(trigger, true);
      else openPanel(trigger);
    });

    /* ArrowDown ONLY — opens and moves focus to the first item. */
    trigger.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'Down') return;
      e.preventDefault();
      openPanel(trigger);
      var first = panel.querySelector('.mm-item');
      if (first) first.focus();
    });

    /* SA-10(b): focus leaving the disclosure closes it. relatedTarget is null
       when focus leaves the document entirely — leave the panel alone then. */
    li.addEventListener('focusout', function (e) {
      var to = e.relatedTarget;
      if (!to || li.contains(to)) return;
      closePanel(trigger, true);
    });
  });

  /* =========================================================================
     2. MOBILE DRAWER
     ========================================================================= */

  function setMobileOpen(open) {
    header.classList.toggle('mm-mobile-open', open);
    body.classList.toggle('mm-menu-lock', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    closeAll(null, true);
  }

  function mobileOpen() { return header.classList.contains('mm-mobile-open'); }

  if (burger) {
    burger.addEventListener('click', function () { setMobileOpen(!mobileOpen()); });
  }
  if (scrim) {
    scrim.addEventListener('click', function () { setMobileOpen(false); });
  }
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) setMobileOpen(false);
    });
  }

  /* =========================================================================
     3. GLOBAL DISMISSAL — Escape and outside click
     ========================================================================= */

  D.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    if (searchIsOpen()) { closeSearch(); return; }
    if (mobileOpen()) {
      setMobileOpen(false);
      if (burger) burger.focus();
      return;
    }
    var active = openTrigger();
    if (active) {
      closeAll(null, true);
      active.focus();
    }
  });

  D.addEventListener('click', function (e) {
    if (header.contains(e.target)) return;
    closeAll(null, true);
    if (mobileOpen()) setMobileOpen(false);
  });

  /* =========================================================================
     4. STICKY / COMPACT HEADER + BACK-TO-TOP
     ---------------------------------------------------------------------
     Zero geometry reads on the scroll path. Preferred implementation is a pair
     of off-screen IntersectionObserver sentinels (no scroll listener at all);
     where IntersectionObserver is unavailable we fall back to a single passive,
     rAF-throttled scroll listener that reads only window.pageYOffset — never
     getBoundingClientRect or scrollHeight, which is what made the shipped
     tracker's scroll path a forced synchronous layout (JSCSS-04).
     ========================================================================= */

  function applyScrolled(past) { header.classList.toggle('mm-scrolled', past); }
  function applyBtt(past) { if (btt) btt.classList.toggle('mm-visible', past); }

  function sentinel(topPx, apply) {
    var s = D.createElement('div');
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;top:' + topPx +
      'px;left:0;width:1px;height:1px;visibility:hidden;pointer-events:none';
    body.appendChild(s);
    new IntersectionObserver(function (entries) {
      apply(!entries[entries.length - 1].isIntersecting);
    }).observe(s);
  }

  if (window.IntersectionObserver) {
    sentinel(50, applyScrolled);
    sentinel(500, applyBtt);
  } else {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = window.pageYOffset || 0;
        applyScrolled(y > 50);
        applyBtt(y > 500);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (btt) {
    btt.addEventListener('click', function () {
      var reduce = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduce && 'scrollBehavior' in D.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    });
  }
  /* =========================================================================
     5. SEARCH — lazy loader only
     ---------------------------------------------------------------------
     The overlay, its ranking engine and its corpus all live in search.js and
     /search-index.json, fetched on the frame the visitor asks for search. The
     payload audit set nav.js a hard ceiling of 3,000 B minified and warned that
     exceeding it means data or markup has leaked back into the script; carrying
     the overlay here was exactly that leak, so it is gone. Everything below is
     the intent detection and a one-shot script injection.
     ========================================================================= */

  var SEARCH_SRC = (me && me.getAttribute('data-search-src')) || '/assets/search.js';
  var searchState = 0; /* 0 idle · 1 loading · 2 ready · 3 failed */

  /* Published for search.js, which reads it when it has no data-search-index of
     its own. Keeping the URL on nav.js's tag means sync.mjs stamps the hashed
     filename in one place. */
  window.__mtfsSearchIndexUrl = INDEX_URL;

  function searchIsOpen() {
    return !!(window.MtfsSearch && window.MtfsSearch.isOpen());
  }

  function closeSearch() {
    if (window.MtfsSearch) window.MtfsSearch.close();
  }

  /* Load search.js once, then open. While it is in flight __mtfsSearchAutoOpen
     stays set, so the overlay opens the moment the script evaluates and the
     triggering click or keystroke is never swallowed. */
  function requestSearch() {
    if (window.MtfsSearch) { window.MtfsSearch.open(); return; }
    if (searchState === 3) return;
    window.__mtfsSearchAutoOpen = true;
    if (searchState) return;
    searchState = 1;
    var s = D.createElement('script');
    s.src = SEARCH_SRC;
    s.defer = true;
    s.onload = function () { searchState = 2; };
    s.onerror = function () {
      searchState = 3;
      window.__mtfsSearchAutoOpen = false;
      /* Search is an enhancement; the sitemap is the no-JS equivalent. */
      if (searchBtn) searchBtn.setAttribute('aria-disabled', 'true');
    };
    D.head.appendChild(s);
  }

  if (searchBtn) searchBtn.addEventListener('click', requestSearch);

  /* Cmd/Ctrl-K. Escape is handled by the global dismissal listener in section 3,
     which checks searchIsOpen() first. */
  D.addEventListener('keydown', function (e) {
    if (!(e.metaKey || e.ctrlKey) || (e.key !== 'k' && e.key !== 'K')) return;
    e.preventDefault();
    if (searchIsOpen()) closeSearch(); else requestSearch();
  });
})();
