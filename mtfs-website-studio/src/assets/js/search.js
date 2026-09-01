/**
 * src/assets/js/search.js — the Cmd/Ctrl-K search overlay, loaded ONLY on intent.
 *
 * WHY THIS IS A SEPARATE FILE
 * The payload audit (docs/audit/js-css-payload.md section 1.6) measured the shipped
 * mega-menu.min.js at 29,331 B and found the search overlay to be 3,693 B of behaviour
 * plus an 8,685 B SEARCH_INDEX plus 1,898 B of ranking engine — all of it reachable only
 * by clicking #mm-search-open or pressing Cmd/Ctrl-K. It set a hard ceiling of 3,000 B
 * minified for nav.js and stated: "A build that ships nav.js over 3,000 B minified has
 * left data or markup in the script and must be rejected."
 *
 * nav.js is what every visitor downloads. This file is what the small minority who
 * actually open search downloads, on the frame they ask for it. Splitting them is the
 * whole point; do not merge them back.
 *
 * The corpus is NOT in this file either — loadIndex() fetches /search-index.json, which
 * sync.mjs generates from routes[] in site.config.mjs. Never hand-write the index.
 *
 * LOADED BY: nav.js requestSearch(), which injects this script once and then calls
 * window.MtfsSearch.open().
 *
 * PUBLIC API (nav.js depends on exactly these three):
 *   window.MtfsSearch.open()    open the overlay, building it on first call
 *   window.MtfsSearch.close()   close it and restore focus
 *   window.MtfsSearch.isOpen()  true while open — nav.js's Escape handler checks this
 *                               before closing a mega panel or the mobile drawer
 *
 * The overlay markup is built here rather than server-rendered on purpose: SSR-ing it
 * would cost 24 elements and 1,565 B of markup on every page, and would force
 * .mm-search-overlay's hidden state (8,135 B of CSS, 27% of mega-menu.css) onto the
 * critical path for a feature behind a keystroke.
 *
 * ES5 only. No modules, no build step, no dependencies.
 */
(function () {
  'use strict';

  var D = document;
  var body = D.body;
  var searchBtn = D.getElementById('mm-search-open');

  /* Same resolution order as nav.js: this script's own data-search-index attribute
     wins, then the value nav.js published, then the default. */
  var me = D.currentScript;
  var INDEX_URL = (me && me.getAttribute('data-search-index')) ||
    window.__mtfsSearchIndexUrl || '/search-index.json';

  var overlay = null;      /* .mm-search-overlay, injected on first open */
  var input = null;
  var resultsHost = null;
  var statusText = null;
  var suggestBlock = null;
  var docs = null;         /* fetched corpus */
  var synonyms = {};
  var suggestions = [];
  var indexState = 0;      /* 0 idle · 1 loading · 2 ready · 3 failed */
  var selected = -1;
  var debounce = null;
  var lastFocus = null;

  var SEARCH_ICON = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"' +
    ' fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/>' +
    '<path d="M21 21l-4.35-4.35"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function searchIsOpen() {
    return !!overlay && overlay.classList.contains('mm-search-open');
  }

  function buildOverlay() {
    overlay = D.createElement('div');
    overlay.className = 'mm-search-overlay';
    overlay.id = 'mm-search-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Site search');
    overlay.innerHTML =
      '<div class="mm-search-modal">' +
        '<div class="mm-search-input-row">' + SEARCH_ICON +
          '<input type="search" id="mm-search-input" role="combobox"' +
          ' aria-expanded="false" aria-controls="mm-search-results"' +
          ' aria-autocomplete="list" aria-label="Search services, topics, or ask a question"' +
          ' placeholder="Search services, topics, or ask a question…"' +
          ' autocomplete="off" spellcheck="false">' +
          '<button class="mm-search-close" id="mm-search-close" type="button"' +
          ' aria-label="Close search"><span aria-hidden="true">ESC</span></button>' +
        '</div>' +
        '<div class="mm-search-status" id="mm-search-status">' +
          '<span id="mm-search-status-text" role="status" aria-live="polite">' +
          'Search across all MedTech services and content</span>' +
        '</div>' +
        '<div id="mm-search-body">' +
          '<div class="mm-search-suggestions" id="mm-search-suggestions">' +
            '<p>Try searching for</p>' +
            '<div class="mm-search-suggestions-list" id="mm-search-suggestions-list"></div>' +
          '</div>' +
        '</div>' +
        '<div class="mm-search-footer">' +
          '<span class="mm-search-footer-hint"><kbd>↑↓</kbd> navigate</span>' +
          '<span class="mm-search-footer-hint"><kbd>↵</kbd> open</span>' +
          '<span class="mm-search-footer-hint"><kbd>ESC</kbd> close</span>' +
        '</div>' +
      '</div>';
    body.appendChild(overlay);

    input = D.getElementById('mm-search-input');
    resultsHost = D.getElementById('mm-search-body');
    statusText = D.getElementById('mm-search-status-text');
    suggestBlock = D.getElementById('mm-search-suggestions');

    D.getElementById('mm-search-close').addEventListener('click', closeSearch);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
    input.addEventListener('input', onInput);
    input.addEventListener('keydown', onInputKey);
    /* Real Tab trap — this one IS a modal dialog. */
    overlay.addEventListener('keydown', trapTab);
    resultsHost.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.mm-result')) closeSearch();
    });
  }

  function trapTab(e) {
    if (e.key !== 'Tab') return;
    var f = [].slice.call(overlay.querySelectorAll('input,button,a[href]'))
      .filter(function (el) { return el.offsetParent !== null || el === input; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function renderSuggestions() {
    var host = D.getElementById('mm-search-suggestions-list');
    if (!host || host.childNodes.length || !suggestions.length) return;
    suggestions.forEach(function (s) {
      var chip = D.createElement('button');
      chip.type = 'button';
      chip.className = 'mm-suggest-chip';
      chip.innerHTML = SEARCH_ICON + esc(s.label);
      chip.addEventListener('click', function () {
        input.value = s.query || s.label;
        input.focus();
        run(input.value);
      });
      host.appendChild(chip);
    });
  }

  function loadIndex() {
    if (indexState) return;
    indexState = 1;
    fetch(INDEX_URL, { credentials: 'omit' })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) {
        docs = Array.isArray(data) ? data : (data.docs || []);
        synonyms = (data && data.synonyms) || {};
        suggestions = (data && data.suggestions) || [];
        indexState = 2;
        renderSuggestions();
        if (input && input.value) run(input.value);
      })
      .catch(function () {
        indexState = 3;
        if (statusText) {
          statusText.textContent = 'Search is unavailable right now.';
        }
      });
  }

  /* ---- ranking engine (weights ported verbatim from mega-menu.js) ---- */

  function tokenize(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/).filter(Boolean);
  }

  function expand(tokens) {
    var out = tokens.slice();
    tokens.forEach(function (tok) {
      for (var key in synonyms) {
        if (!Object.prototype.hasOwnProperty.call(synonyms, key)) continue;
        if (tok === key || synonyms[key].indexOf(tok) !== -1) {
          out = out.concat([key]).concat(synonyms[key]);
        }
      }
    });
    var seen = {};
    return out.filter(function (t) { return seen[t] ? false : (seen[t] = true); });
  }

  function score(page, qt) {
    var s = 0;
    var title = tokenize(page.title);
    var snip = tokenize(page.snippet);
    var section = tokenize(page.section);
    var keys = (page.keywords || []).reduce(function (a, k) {
      return a.concat(tokenize(k));
    }, []);
    qt.forEach(function (q) {
      if (title.indexOf(q) !== -1) s += 10;
      if (section.indexOf(q) !== -1) s += 6;
      if (keys.indexOf(q) !== -1) s += 5;
      if (snip.indexOf(q) !== -1) s += 3;
      title.forEach(function (t) { if (q.length > 2 && t.indexOf(q) === 0) s += 4; });
      keys.forEach(function (k) { if (q.length > 2 && k.indexOf(q) !== -1) s += 2; });
    });
    return s;
  }

  function highlight(snippet, qt) {
    return String(snippet || '').split(/(\s+)/).map(function (word) {
      var clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      var hit = clean && qt.some(function (q) {
        return q.length > 2 && clean.indexOf(q) !== -1;
      });
      return hit ? '<mark>' + esc(word) + '</mark>' : esc(word);
    }).join('');
  }

  function scoreBar(s, max) {
    var bars = Math.min(5, Math.ceil((s / Math.max(max, 1)) * 5));
    var html = '<span class="mm-result-score-bar">';
    for (var i = 0; i < 5; i++) html += '<span' + (i < bars ? ' class="mm-score-on"' : '') + '></span>';
    return html + '</span>';
  }

  function icon(page) {
    if (!page.iconPath) return '';
    return '<span class="mm-result-ico"><svg aria-hidden="true" focusable="false"' +
      ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="' +
      esc(page.iconPath) + '"/></svg></span>';
  }

  function setSelected(idx) {
    var links = resultsHost.querySelectorAll('.mm-result');
    for (var i = 0; i < links.length; i++) {
      var on = i === idx;
      links[i].classList.toggle('mm-result-selected', on);
      links[i].setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) links[i].scrollIntoView({ block: 'nearest' });
    }
    selected = idx;
    input.setAttribute('aria-activedescendant', idx >= 0 ? 'mm-r' + idx : '');
  }

  function showSuggestions() {
    resultsHost.innerHTML = '';
    if (suggestBlock) resultsHost.appendChild(suggestBlock);
    statusText.textContent = 'Search across all MedTech services and content';
    input.setAttribute('aria-expanded', 'false');
    selected = -1;
  }

  function run(query) {
    if (indexState !== 2) { loadIndex(); return; }
    var q = String(query || '').trim();
    if (q.length < 2) { showSuggestions(); return; }

    var qt = expand(tokenize(q));
    var hits = docs.map(function (p) { return { page: p, score: score(p, qt) }; })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 8);

    if (!hits.length) {
      statusText.textContent = 'No results found';
      resultsHost.innerHTML = '<div class="mm-no-results">' + SEARCH_ICON +
        '<strong>No results for &ldquo;' + esc(q) + '&rdquo;</strong>' +
        '<span>Try different keywords, or <a href="/contact/">contact us</a> directly.</span></div>';
      input.setAttribute('aria-expanded', 'false');
      selected = -1;
      return;
    }

    var max = hits[0].score;
    statusText.textContent = hits.length + ' result' + (hits.length === 1 ? '' : 's');
    var html = '<div class="mm-search-results" id="mm-search-results" role="listbox"' +
      ' aria-label="Search results">' +
      '<div class="mm-results-group-label">Best matches</div>';
    hits.forEach(function (r, i) {
      html += '<a class="mm-result" id="mm-r' + i + '" role="option" aria-selected="false"' +
        ' href="' + esc(r.page.href) + '">' + icon(r.page) +
        '<span class="mm-result-body">' +
          '<span class="mm-result-title">' + esc(r.page.title) + '</span>' +
          '<span class="mm-result-snippet">' + highlight(r.page.snippet, qt) + '</span>' +
          '<span class="mm-result-meta">' +
            '<span class="mm-result-section">' + esc(r.page.section) + '</span>' +
            '<span class="mm-result-score">Relevance ' + scoreBar(r.score, max) + '</span>' +
          '</span>' +
        '</span></a>';
    });
    resultsHost.innerHTML = html + '</div>';
    input.setAttribute('aria-expanded', 'true');
    setSelected(-1);
  }

  function onInput() {
    clearTimeout(debounce);
    var v = input.value;
    debounce = setTimeout(function () { run(v); }, 120);
  }

  function onInputKey(e) {
    var links = resultsHost.querySelectorAll('.mm-result');
    if (e.key === 'ArrowDown' || e.key === 'Down') {
      e.preventDefault();
      setSelected(Math.min(selected + 1, links.length - 1));
    } else if (e.key === 'ArrowUp' || e.key === 'Up') {
      e.preventDefault();
      setSelected(Math.max(selected - 1, -1));
    } else if (e.key === 'Enter' && selected >= 0 && links[selected]) {
      e.preventDefault();
      links[selected].click();
    }
  }

  function openSearch() {
    if (!overlay) buildOverlay();
    lastFocus = D.activeElement;
    loadIndex();
    renderSuggestions();
    input.value = '';
    showSuggestions();
    overlay.classList.add('mm-search-open');
    body.classList.add('mm-menu-lock');
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'true');
    setTimeout(function () { input.focus(); }, 60);
  }

  function closeSearch() {
    if (!overlay) return;
    overlay.classList.remove('mm-search-open');
    body.classList.remove('mm-menu-lock');
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'false');
    var back = searchBtn || lastFocus;
    if (back && back.focus) back.focus();
  }

  window.MtfsSearch = { open: openSearch, close: closeSearch, isOpen: searchIsOpen };

  /* nav.js sets this immediately before injecting us, so the click or keystroke that
     triggered the load opens the overlay on arrival rather than being swallowed. */
  if (window.__mtfsSearchAutoOpen) {
    window.__mtfsSearchAutoOpen = false;
    openSearch();
  }
})();
