/* =============================================================================
   MedTech For Solutions — Global Mega Menu Component
   -----------------------------------------------------------------------------
   Drop-in module: include /assets/mega-menu.css and /assets/mega-menu.js on
   any page. The script auto-injects the mega menu into <body>, removes any
   legacy <nav class="nav"> or <header role="banner"> already on the page, and
   wires up sticky/compact-on-scroll, back-to-top, active-link highlighting,
   and keyboard / touch interactions.

   No dependencies. Self-contained. Safe to load via WordPress later.
   ============================================================================= */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // ICONS — minimal inline SVGs, mirrored from the existing service pages.
  // ---------------------------------------------------------------------------
  var ICONS = {
    monitor:   '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    shield:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
    users:     '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    cart:      '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>',
    trending:  '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
    megaphone: '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>',
    phone:     '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
    dollar:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    book:      '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
    userGroup: '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
    lock:      '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
    server:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>',
    arrowR:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    arrowU:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    caret:     '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 1l5 5 5-5"/></svg>'
  };

  // ---------------------------------------------------------------------------
  // SERVICE DATA — single source of truth for the mega panel.
  // ---------------------------------------------------------------------------
  var LAB_SERVICES = [
    { href: '/lab-solutions/real-time-monitoring/',  title: 'Real-Time Monitoring',   blurb: '24/7 OvaTools tracking & QC dashboards', icon: 'monitor'  },
    { href: '/lab-solutions/regulatory-compliance/', title: 'Regulatory Compliance',  blurb: 'FDA, CLIA, CAP, AABB readiness',          icon: 'shield'   },
    { href: '/lab-solutions/staffing-solutions/',    title: 'Staffing Solutions',     blurb: 'TS (ABB) certified embryologists & directors', icon: 'users'  },
    { href: '/lab-solutions/gpo-purchasing/',        title: 'GPO Purchasing',         blurb: '1,800+ vendor contracts, free to join',   icon: 'cart'     },
    { href: '/lab-solutions/practice-development/',  title: 'Practice Development',   blurb: 'Lab design, optimization & training',     icon: 'trending' }
  ];
  var MGMT_SERVICES = [
    { href: '/management-services/marketing/',                  title: 'Marketing',                   blurb: 'Patient-acquisition campaigns',           icon: 'megaphone' },
    { href: '/management-services/call-center/',                title: 'Call Center',                 blurb: 'Empathetic patient inquiry handling',     icon: 'phone'     },
    { href: '/management-services/accounting-finance/',         title: 'Accounting & Finance',        blurb: 'Reporting, budgeting, forecasting',       icon: 'book'      },
    { href: '/management-services/human-resources/',            title: 'Human Resources',             blurb: 'Recruitment & performance management',    icon: 'userGroup' },
    { href: '/management-services/insurance-risk-management/',  title: 'Insurance & Risk Management', blurb: 'Professional liability for ART practices', icon: 'lock'      },
  ];

  function svc(item, group) {
    return ''
      + '<li><a class="mm-item" href="' + item.href + '" data-mm-section="' + group + '">'
      +   '<span class="mm-item-ico">' + ICONS[item.icon] + '</span>'
      +   '<span class="mm-item-body"><strong>' + item.title + '</strong><span>' + item.blurb + '</span></span>'
      + '</a></li>';
  }

  function panelMarkup(id, group, label, count, items, featureTitle, featureText, footText, footHref, footLabel) {
    return ''
      + '<div class="mm-panel mm-panel-' + group + '" id="' + id + '" role="region" aria-label="' + label + ' menu">'
      +   '<div class="mm-panel-grid">'
      +     '<div class="mm-col mm-col-' + group + '">'
      +       '<h4>' + label + ' <span class="mm-pill">' + count + '</span></h4>'
      +       '<ul class="mm-items">' + items.map(function (i) { return svc(i, group); }).join('') + '</ul>'
      +     '</div>'
      +     '<aside class="mm-panel-feature">'
      +       '<strong>' + featureTitle + '</strong>'
      +       '<span>' + featureText + '</span>'
      +       '<a href="' + footHref + '">' + footLabel + ' ' + ICONS.arrowR + '</a>'
      +     '</aside>'
      +   '</div>'
      +   '<div class="mm-panel-foot">'
      +     '<span>' + footText + '</span>'
      +     '<a href="/services/">View all services ' + ICONS.arrowR + '</a>'
      +   '</div>'
      + '</div>';
  }

  // ---------------------------------------------------------------------------
  // HEADER MARKUP
  // ---------------------------------------------------------------------------
  var HEADER_HTML = ''
    + '<header class="mm-header" id="mm-header" role="banner">'
    +   '<div class="mm-bar">'

    +     '<a class="mm-logo" href="/" aria-label="MedTech For Solutions Home">'
    +       '<img src="https://media.cdn.builder.searchatlas.com/user-uploads/1c7195a1-2e83-4f53-8045-f7d80893566c_MedTech-For-Solutions-Logo.png" alt="MedTech For Solutions" />'
    +     '</a>'

    +     '<nav role="navigation" aria-label="Primary">'
    +       '<ul class="mm-nav" id="mm-nav">'
    +         '<li><a href="/" data-mm-match="^/$">Home</a></li>'
    +         '<li>'
    +           '<button type="button" data-mm-trigger="lab" aria-expanded="false" aria-controls="mm-lab-panel" data-mm-match="^/lab-solutions(/|$)">'
    +             'Lab Solutions <span class="mm-caret">' + ICONS.caret + '</span>'
    +           '</button>'
    +           panelMarkup('mm-lab-panel', 'lab', 'Laboratory Solutions', 5, LAB_SERVICES, 'Built for ART labs', 'Monitoring, compliance, staffing, GPO purchasing, and practice development for fertility programs.', 'Five lab-focused service lines.', '/lab-solutions/', 'Explore lab solutions')
    +         '</li>'
    +         '<li>'
    +           '<button type="button" data-mm-trigger="mgmt" aria-expanded="false" aria-controls="mm-mgmt-panel" data-mm-match="^/management-services(/|$)">'
    +             'Management <span class="mm-caret">' + ICONS.caret + '</span>'
    +           '</button>'
    +           panelMarkup('mm-mgmt-panel', 'mgmt', 'Management Services', 5, MGMT_SERVICES, 'Operational support', 'Marketing, call center, finance, HR, and risk support for growing fertility practices.', 'Five management service lines.', '/management-services/', 'Explore management')
    +         '</li>'
    +         '<li><a href="/services/" data-mm-match="^/services(/|$)">All Services</a></li>'
    +         '<li><a href="/about/" data-mm-match="^/about(/|$)">About</a></li>'
    +         '<li class="mm-mobile-only"><a href="/contact/" data-mm-match="^/contact(/|$)">Schedule Consultation</a></li>'
    +       '</ul>'
    +     '</nav>'

    +     '<div class="mm-right">'
    +       '<a class="mm-phone" href="tel:+18666349144">' + ICONS.phone + '<span>(866) 634-9144</span></a>'
    +       '<a class="mm-cta" href="/contact/">Schedule Consultation ' + ICONS.arrowR + '</a>'
    +       '<button class="mm-burger" type="button" aria-label="Toggle menu" aria-controls="mm-nav" aria-expanded="false"><span></span><span></span><span></span></button>'
    +     '</div>'

    +   '</div>'
    + '</header>'
    + '<div class="mm-mobile-scrim" aria-hidden="true"></div>'
    + '<button class="mm-back-to-top" id="mm-back-to-top" type="button" aria-label="Back to top">' + ICONS.arrowU + '</button>';

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------
  function init() {
    if (document.getElementById('mm-header')) return; // idempotent

    // Inject mega menu at the start of <body>
    document.body.insertAdjacentHTML('afterbegin', HEADER_HTML);
    document.documentElement.classList.add('mm-injected');
    document.body.classList.add('mm-injected');

    var header = document.getElementById('mm-header');
    var btt    = document.getElementById('mm-back-to-top');
    var nav    = document.getElementById('mm-nav');
    var burger = header.querySelector('.mm-burger');
    var triggers = Array.prototype.slice.call(header.querySelectorAll('[data-mm-trigger]'));
    var panels = Array.prototype.slice.call(header.querySelectorAll('.mm-panel'));
    function setMobileOpen(open) {
      header.classList.toggle('mm-mobile-open', open);
      document.body.classList.toggle('mm-menu-lock', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      closeAll(null, true);
    }

    // ----- Sticky / compact + back-to-top visibility -----
    var rafId = null;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        header.classList.toggle('mm-scrolled', y > 50);
        btt.classList.toggle('mm-visible', y > 500);
        rafId = null;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ----- Back to top -----
    btt.addEventListener('click', function () {
      var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (smooth && 'scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    });

    // ----- Mega panels: hover (desktop) + click (touch / keyboard) -----
    var openTimer, closeTimer;
    var isTouch = window.matchMedia('(hover: none)').matches;

    function panelFor(trigger) {
      return document.getElementById(trigger.getAttribute('aria-controls'));
    }
    function closeAll(except, immediate) {
      clearTimeout(openTimer);
      var run = function () {
        panels.forEach(function (panel) {
          if (panel !== except) panel.classList.remove('mm-open');
        });
        triggers.forEach(function (trigger) {
          if (panelFor(trigger) !== except) trigger.setAttribute('aria-expanded', 'false');
        });
      };
      if (immediate) run();
      else closeTimer = setTimeout(run, 140);
    }
    function openPanel(trigger) {
      clearTimeout(closeTimer);
      var panel = panelFor(trigger);
      closeAll(panel, true);
      panel.classList.add('mm-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function closePanel(trigger, immediate) {
      clearTimeout(openTimer);
      var panel = panelFor(trigger);
      var run = function () {
        panel.classList.remove('mm-open');
        trigger.setAttribute('aria-expanded', 'false');
      };
      if (immediate) run();
      else closeTimer = setTimeout(run, 140);
    }

    if (!isTouch) {
      triggers.forEach(function (trigger) {
        var li = trigger.parentElement;
        var panel = panelFor(trigger);
        li.addEventListener('mouseenter', function () { openTimer = setTimeout(function () { openPanel(trigger); }, 60); });
        li.addEventListener('mouseleave', function () { clearTimeout(openTimer); closePanel(trigger); });
        panel.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
        panel.addEventListener('mouseleave', function () { closePanel(trigger); });
      });
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var open = panelFor(trigger).classList.contains('mm-open');
        if (open) closePanel(trigger, true);
        else openPanel(trigger);
      });

      // Keyboard: Escape closes; Arrow Down opens & focuses first item
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPanel(trigger);
          var first = panelFor(trigger).querySelector('.mm-item');
          if (first) first.focus();
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('mm-mobile-open')) {
        setMobileOpen(false);
        burger.focus();
      } else if (e.key === 'Escape' && panels.some(function (panel) { return panel.classList.contains('mm-open'); })) {
        var active = triggers.find(function (trigger) { return panelFor(trigger).classList.contains('mm-open'); });
        closeAll(null, true);
        if (active) active.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) {
        closeAll(null, true);
        if (header.classList.contains('mm-mobile-open')) setMobileOpen(false);
      }
    });

    // ----- Mobile hamburger -----
    burger.addEventListener('click', function () {
      setMobileOpen(!header.classList.contains('mm-mobile-open'));
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        setMobileOpen(false);
      });
    });

    // ----- Active link highlighting -----
    var path = (location.pathname || '/').replace(/index\.html?$/, '');
    if (path !== '/' && !/\/$/.test(path)) path += '/';
    nav.querySelectorAll('[data-mm-match]').forEach(function (el) {
      try {
        if (new RegExp(el.getAttribute('data-mm-match')).test(path)) {
          el.classList.add('mm-active');
          if (el.tagName === 'BUTTON') el.classList.add('mm-active');
        }
      } catch (err) { /* ignore bad regex */ }
    });
    // Highlight current service inside the panels
    panels.forEach(function (panel) {
      panel.querySelectorAll('.mm-item').forEach(function (a) {
      if (a.getAttribute('href') === path) {
        a.style.background = 'var(--mm-teal-l)';
        var strong = a.querySelector('strong');
        if (strong) strong.style.color = 'var(--mm-teal-d)';
      }
      });
    });
  }

  // Run as soon as <body> is ready, even before full DOM is parsed.
  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }
})();
