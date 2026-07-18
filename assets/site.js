/* FertileRank — site behaviors. Loaded with `defer` so it never blocks render.
   Everything is feature-detected, so the one file works on every page. */
(function () {
  'use strict';

  // Mobile navigation toggle
  var toggle = document.getElementById('fr-nav-toggle');
  var menu = document.getElementById('fr-mobilenav');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  // Back-to-top
  var top = document.getElementById('fr-totop');
  if (top) {
    top.addEventListener('click', function () {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  // Mobile sticky CTA — appears after 600px scroll, dismissible per session
  var bar = document.getElementById('fr-sticky');
  if (bar) {
    var hiddenPaths = ['/contact', '/thank-you', '/privacy-policy', '/terms-of-service', '/cookie-policy', '/accessibility-statement'];
    var path = location.pathname.replace(/\/+$/, '') || '/';
    if (hiddenPaths.indexOf(path) === -1 && !sessionStorage.getItem('frStickyDismissed')) {
      bar.hidden = false;
      var onScroll = function () { bar.classList.toggle('is-visible', window.scrollY > 600); };
      window.addEventListener('scroll', onScroll, { passive: true });
      var closeBtn = document.getElementById('fr-sticky-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          bar.classList.remove('is-visible');
          window.removeEventListener('scroll', onScroll);
          try { sessionStorage.setItem('frStickyDismissed', '1'); } catch (e) {}
        });
      }
    }
  }

  // Lead forms — validate, then route to the thank-you page.
  // SEARCH ATLAS — LEAD FORM: POST the collected fields to your handler
  // (Search Atlas Forms / Formspree / HubSpot) here before redirecting.
  var forms = document.querySelectorAll('form[data-redirect]');
  Array.prototype.forEach.call(forms, function (form) {
    var started = false;
    form.addEventListener('focusin', function () {
      if (started) return;
      started = true;
      if (window.dataLayer) window.dataLayer.push({ event: 'form_start', form_type: form.getAttribute('data-form-type') || 'lead' });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) { form.reportValidity(); return; }
      if (window.dataLayer) window.dataLayer.push({ event: 'form_submit', form_type: form.getAttribute('data-form-type') || 'lead' });
      var to = form.getAttribute('data-redirect');
      if (to) window.location.assign(to);
    });
  });
})();
