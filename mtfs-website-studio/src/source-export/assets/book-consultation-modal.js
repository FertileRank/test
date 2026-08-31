/* =============================================================================
   MedTech For Solutions — Book a Consultation Modal (4-Step Wizard)
   Self-contained: injects its own CSS + HTML. No dependencies.
   Trigger: any element with [data-open-consult] or .mm-cta / .open-consult-modal
   ============================================================================= */
(function () {
  'use strict';

  /* ---- STYLES ---- */
  var CSS = `
  /* ---- reset inside modal only ---- */
  #mtfs-modal-root * { box-sizing: border-box; }

  /* ---- overlay ---- */
  #mtfs-modal-root {
    position: fixed; inset: 0; z-index: 99999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(42,35,32,.62);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 16px;
    opacity: 0; pointer-events: none;
    transition: opacity .25s ease;
  }
  #mtfs-modal-root.mtfs-open {
    opacity: 1; pointer-events: auto;
  }

  /* ---- dialog ---- */
  .mtfs-dialog {
    position: relative;
    background: #FDFAFA;
    border-radius: 20px;
    width: 100%; max-width: 600px;
    max-height: calc(100vh - 32px);
    display: flex; flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(42,35,32,.28), 0 4px 16px rgba(42,35,32,.12);
    transform: translateY(10px) scale(.98);
    transition: transform .28s ease;
  }
  #mtfs-modal-root.mtfs-open .mtfs-dialog {
    transform: none;
  }

  /* ---- brand strip (bottom) ---- */
  .mtfs-brand-strip {
    height: 6px;
    background: linear-gradient(90deg,#1F6E75 25%,#CCDF33 25%,#CCDF33 50%,#F8793F 50%,#F8793F 75%,#C013AE 75%);
    flex-shrink: 0;
    order: 99;
  }

  /* ---- header row ---- */
  .mtfs-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px 14px;
    border-bottom: 1px solid #F1E3E4;
    flex-shrink: 0;
  }
  .mtfs-header-left { display: flex; align-items: center; gap: 12px; }
  .mtfs-header-title { font-family: 'Sora', sans-serif; font-size: 1.05rem; font-weight: 700; color: #2A2320; }
  .mtfs-close-btn {
    width: 34px; height: 34px; border-radius: 50%;
    border: 1px solid #F1E3E4; background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #6F6259; transition: background .2s, color .2s;
    flex-shrink: 0; padding: 0;
  }
  .mtfs-close-btn:hover { background: #F4F7F6; color: #2A2320; }
  .mtfs-close-btn svg { width: 16px; height: 16px; pointer-events: none; }

  /* ---- step indicator ---- */
  .mtfs-step-bar {
    padding: 14px 24px 12px;
    border-bottom: 1px solid #F1E3E4;
    flex-shrink: 0;
  }
  .mtfs-step-label {
    font-family: 'DM Sans', sans-serif;
    font-size: .8rem; font-weight: 600;
    color: #6F6259; margin-bottom: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .mtfs-step-label strong { color: #1F6E75; }
  .mtfs-progress-track {
    height: 5px; background: #F1E3E4; border-radius: 99px; overflow: hidden;
  }
  .mtfs-progress-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, #1F6E75, #C013AE);
    transition: width .35s ease;
  }

  /* ---- body / scrollable area ---- */
  .mtfs-body {
    padding: 28px 24px;
    overflow-y: auto;
    flex: 1;
    -webkit-overflow-scrolling: touch;
  }

  /* ---- step panels ---- */
  .mtfs-step { display: none; }
  .mtfs-step.mtfs-active { display: block; }

  .mtfs-step-heading {
    font-family: 'Sora', sans-serif;
    font-size: 1.2rem; font-weight: 700; color: #2A2320;
    margin-bottom: 4px;
  }
  .mtfs-step-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: .88rem; color: #6F6259;
    margin-bottom: 20px; max-width: 100%;
  }

  /* ---- service option cards ---- */
  .mtfs-options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 4px;
  }
  @media (max-width: 420px) {
    .mtfs-options-grid { grid-template-columns: 1fr; }
  }
  .mtfs-option {
    border: 1.5px solid #F1E3E4;
    border-radius: 12px;
    padding: 13px 14px;
    cursor: pointer;
    background: #FDFAFA;
    transition: border-color .2s, background .2s, box-shadow .2s;
    display: flex; align-items: center; gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: .875rem; font-weight: 600; color: #2A2320;
    text-align: left; width: 100%;
    outline: none;
  }
  .mtfs-option:hover {
    border-color: #9AADA9; background: #F4F7F6;
  }
  .mtfs-option[aria-pressed="true"] {
    border-color: #1F6E75; background: #E4F0EE;
    box-shadow: 0 0 0 3px rgba(31,110,117,.15);
    color: #175459;
  }
  .mtfs-option[aria-pressed="true"] .mtfs-opt-ico { color: #1F6E75; }
  .mtfs-opt-ico {
    width: 28px; height: 28px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: #9AADA9;
  }
  .mtfs-opt-ico svg { width: 18px; height: 18px; }

  /* ---- form fields ---- */
  .mtfs-field { margin-bottom: 18px; }
  .mtfs-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: .82rem; font-weight: 600; color: #2A2320;
    margin-bottom: 5px;
  }
  .mtfs-label .mtfs-req { color: #C013AE; margin-left: 2px; aria-hidden: "true"; }
  .mtfs-input, .mtfs-select, .mtfs-textarea {
    display: block; width: 100%;
    font-family: 'DM Sans', sans-serif; font-size: .92rem;
    color: #2A2320; background: #FDFAFA;
    border: 1.5px solid #E4EAE8;
    border-radius: 10px;
    padding: 10px 14px;
    transition: border-color .2s, box-shadow .2s;
    outline: none;
    appearance: none; -webkit-appearance: none;
  }
  .mtfs-input::placeholder, .mtfs-textarea::placeholder { color: #9AADA9; }
  .mtfs-input:focus, .mtfs-select:focus, .mtfs-textarea:focus {
    border-color: #1F6E75;
    box-shadow: 0 0 0 3px rgba(31,110,117,.15);
  }
  .mtfs-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236F6259' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
    cursor: pointer;
  }
  .mtfs-textarea { resize: vertical; min-height: 80px; }
  .mtfs-error {
    display: none;
    font-family: 'DM Sans', sans-serif;
    font-size: .78rem; color: #B91C1C;
    margin-top: 4px;
    font-weight: 500;
  }
  .mtfs-field.mtfs-has-error .mtfs-input,
  .mtfs-field.mtfs-has-error .mtfs-select,
  .mtfs-field.mtfs-has-error .mtfs-textarea {
    border-color: #B91C1C;
    box-shadow: 0 0 0 3px rgba(185,28,28,.1);
  }
  .mtfs-field.mtfs-has-error .mtfs-error { display: block; }

  /* ---- review card ---- */
  .mtfs-review-card {
    background: #FBEDEE; border-radius: 14px; padding: 20px 22px;
    margin-bottom: 18px;
  }
  .mtfs-review-row {
    display: flex; align-items: baseline;
    padding: 7px 0;
    border-bottom: 1px solid rgba(199,126,144,.18);
    font-family: 'DM Sans', sans-serif; font-size: .9rem;
  }
  .mtfs-review-row:last-child { border-bottom: none; }
  .mtfs-review-lbl { color: #6F6259; font-weight: 500; width: 90px; flex-shrink: 0; }
  .mtfs-review-val { color: #2A2320; font-weight: 700; flex: 1; word-break: break-word; }
  .mtfs-privacy-note {
    display: flex; gap: 10px; align-items: flex-start;
    background: #F4F7F6; border-radius: 10px; padding: 14px 15px;
    font-family: 'DM Sans', sans-serif; font-size: .8rem; color: #5C524B; line-height: 1.5;
  }
  .mtfs-privacy-note svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; color: #1F6E75; }

  /* ---- success screen ---- */
  .mtfs-success { text-align: center; padding: 8px 0; }
  .mtfs-check-circle {
    width: 64px; height: 64px; border-radius: 50%;
    background: #E4F0EE; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
  }
  .mtfs-check-circle svg { width: 32px; height: 32px; color: #1F6E75; }
  .mtfs-success h2 {
    font-family: 'Sora', sans-serif; font-size: 1.25rem; font-weight: 700;
    color: #2A2320; margin-bottom: 12px;
  }
  .mtfs-success p {
    font-family: 'DM Sans', sans-serif; font-size: .93rem; color: #5C524B;
    max-width: 100%; margin: 0 auto 20px; line-height: 1.6;
  }
  .mtfs-ref-pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: #FBEDEE; border-radius: 99px;
    padding: 7px 18px; font-family: 'DM Sans', sans-serif;
    font-size: .82rem; font-weight: 700; color: #6B3357;
    margin-bottom: 24px; letter-spacing: .4px;
  }

  /* ---- footer ---- */
  .mtfs-footer {
    padding: 16px 24px 22px;
    border-top: 1px solid #F1E3E4;
    display: flex; gap: 10px; justify-content: flex-end;
    flex-shrink: 0;
  }

  /* ---- buttons ---- */
  .mtfs-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: .9rem; font-weight: 600;
    padding: 11px 26px; border-radius: 999px;
    cursor: pointer; border: none; outline: none;
    transition: background .2s, transform .15s, box-shadow .2s, opacity .2s;
    display: inline-flex; align-items: center; gap: 7px;
    flex-shrink: 0;
  }
  .mtfs-btn svg { width: 15px; height: 15px; }
  .mtfs-btn-primary {
    background: #1F6E75; color: #fff;
  }
  .mtfs-btn-primary:hover:not(:disabled) {
    background: #175459; transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(31,110,117,.28);
  }
  .mtfs-btn-primary:disabled {
    opacity: .45; cursor: not-allowed; transform: none; box-shadow: none;
  }
  .mtfs-btn-secondary {
    background: transparent; color: #5C524B;
    border: 1.5px solid #E4EAE8;
  }
  .mtfs-btn-secondary:hover {
    background: #F4F7F6; color: #2A2320; border-color: #C9D4D1;
  }
  .mtfs-btn-full { width: 100%; justify-content: center; }

  /* ---- success done button ---- */
  #mtfs-done-btn { min-width: 140px; }

  /* ---- hidden-attribute guard: .mtfs-btn uses display:inline-flex which
     overrides the browser's native [hidden]{display:none}. This rule restores
     the correct behaviour so JS-toggled hidden buttons truly disappear. ---- */
  #mtfs-modal-root [hidden] { display: none !important; }

  /* ---- INLINE CARD (hero embed) ---- */
  .mtfs-inline-card * { box-sizing: border-box; }
  .mtfs-inline-card {
    position: relative;
    background: #FDFAFA;
    border-radius: 20px;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(42,35,32,.18);
    flex: 1;
  }
  /* hide the close button inside the inline card */
  .mtfs-inline-card #mtfs-inline-close-btn { display: none !important; }
  .mtfs-inline-card .mtfs-body {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  /* inline card [hidden] guard */
  .mtfs-inline-card [hidden] { display: none !important; }

  /* ---- accessibility ---- */
  @media (prefers-reduced-motion: reduce) {
    #mtfs-modal-root, .mtfs-dialog, .mtfs-progress-fill { transition: none !important; }
  }
  `;

  /* ---- SVGs used inside modal ---- */
  var SVG = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>',
    back:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>',
    next:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    lock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
    lab:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 3h6m-5 5h4m-7 2l-2 8h12l-2-8"/><path d="M7 10V3M17 10V3"/></svg>',
    shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2l7 3v6c0 5-3.5 9.3-7 11-3.5-1.7-7-6-7-11V5l7-3z"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    cart:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>',
    trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
    mon:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    mgmt:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
    help:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>'
  };

  var SERVICE_OPTIONS = [
    { id: 'lab-management',    label: 'Laboratory Management',    icon: 'lab'   },
    { id: 'reg-compliance',    label: 'Regulatory Compliance',    icon: 'shield'},
    { id: 'staffing',          label: 'Staffing & Recruitment',   icon: 'users' },
    { id: 'gpo-purchasing',    label: 'GPO Purchasing',           icon: 'cart'  },
    { id: 'practice-dev',      label: 'Practice Development',     icon: 'trend' },
    { id: 'realtime-mon',      label: 'Real-Time Monitoring',     icon: 'mon'   },
    { id: 'mgmt-services',     label: 'Management Services',      icon: 'mgmt'  },
    { id: 'not-sure',          label: 'Not sure yet',             icon: 'help'  }
  ];

  var STEP_LABELS = ['Service', 'Practice', 'Contact', 'Review'];

  /* ---- helpers ---- */
  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function genRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var r = 'MT-';
    for (var i=0;i<6;i++) r += chars[Math.floor(Math.random()*chars.length)];
    return r;
  }



  /* ---- inject CSS ---- */
  function injectCSS() {
    if (document.getElementById('mtfs-modal-css')) return;
    var style = document.createElement('style');
    style.id = 'mtfs-modal-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ======================================================
     FORM INSTANCE FACTORY
     Creates a fully self-contained form (state + DOM refs
     + event bindings) inside a given container element.
     mode: 'popup' | 'inline'
  ====================================================== */
  function createFormInstance(containerEl, mode) {
    var isInline = (mode === 'inline');

    /* unique ID prefix so popup and inline don't clash */
    var P = isInline ? 'mtfsi' : 'mtfs';

    /* ---- state ---- */
    var state = {
      step: 1,
      service: '',
      name: '', practice: '', role: '',
      email: '', phone: '', time: 'Any time', notes: '',
      ref: ''
    };

    /* ---- helpers scoped to this instance ---- */
    function qp(id) { return containerEl.querySelector('#' + P + '-' + id.replace(/^mtfs-/,'').replace(/^mtfsi-/,'')); }
    function qc(sel) { return Array.prototype.slice.call(containerEl.querySelectorAll(sel)); }
    function getField(bareId) { var el = containerEl.querySelector('#' + P + '-' + bareId); return el ? el.value.trim() : ''; }

    function setFieldError(bareFieldId, bareErrId, hasError) {
      var wrapper = containerEl.querySelector('#' + P + '-field-' + bareFieldId);
      if (wrapper) wrapper.classList.toggle('mtfs-has-error', hasError);
    }

    function validateStep(step) {
      var valid = true;
      if (step === 1) {
        valid = !!state.service;
      } else if (step === 2) {
        var name = getField('name');
        var practice = getField('practice');
        setFieldError('name', 'err-name', !name);
        setFieldError('practice', 'err-practice', !practice);
        valid = !!(name && practice);
      } else if (step === 3) {
        var email = getField('email');
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        setFieldError('email', 'err-email', !emailOk);
        valid = emailOk;
      }
      return valid;
    }

    /* ---- DOM refs (set after HTML is rendered) ---- */
    var backBtn, nextBtn, submitBtn, doneBtn;
    var stepEls, progressFill, progressBar, stepBarEl;

    function goTo(step) {
      state.step = step;
      var totalSteps = 4;
      var isSuccess = (step === 'success');

      stepEls.forEach(function(el) { el.classList.remove('mtfs-active'); });
      var targetEl = isSuccess
        ? containerEl.querySelector('.mtfs-step-success')
        : containerEl.querySelector('.mtfs-step[data-step="' + step + '"]');
      if (targetEl) {
        targetEl.classList.add('mtfs-active');
        var heading = targetEl.querySelector('[class*="step-heading"]');
        if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
      }

      if (isSuccess) {
        stepBarEl.hidden = true;
        backBtn.hidden = true; nextBtn.hidden = true; submitBtn.hidden = true; doneBtn.hidden = false;
        doneBtn.focus();
        var firstName = (state.name || '').split(' ')[0];
        var msgEl = containerEl.querySelector('.mtfs-success-msg');
        if (msgEl) msgEl.textContent = 'Thank you' + (firstName ? ', ' + firstName : '') + '. A MedTech advisor will reach out within one business day to confirm your consultation.';
        state.ref = genRef();
        var refEl = containerEl.querySelector('.mtfs-ref-code');
        if (refEl) refEl.textContent = state.ref;
        return;
      }

      var pct = (step / totalSteps) * 100;
      progressFill.style.width = pct + '%';
      progressBar.setAttribute('aria-valuenow', step);
      var snEl = containerEl.querySelector('.mtfs-step-num');
      if (snEl) snEl.textContent = step;
      var stEl = containerEl.querySelector('.mtfs-step-name');
      if (stEl) stEl.textContent = STEP_LABELS[step - 1];

      backBtn.hidden = (step === 1);
      nextBtn.hidden = (step === totalSteps);
      submitBtn.hidden = (step !== totalSteps);
      doneBtn.hidden = true;
      stepBarEl.hidden = false;

      updateNextState();

      var bodyEl = containerEl.querySelector('.mtfs-body');
      if (bodyEl) bodyEl.scrollTop = 0;
    }

    function updateNextState() {
      if (state.step === 1) {
        nextBtn.disabled = !state.service;
      } else {
        nextBtn.disabled = false;
        submitBtn.disabled = false;
      }
    }

    function populateReview() {
      var svcLabel = '';
      SERVICE_OPTIONS.forEach(function(o) { if (o.id === state.service) svcLabel = o.label; });
      function rv(cls, val) { var el = containerEl.querySelector('.' + cls); if (el) el.textContent = val || '—'; }
      rv('rv-service', svcLabel);
      rv('rv-name',    state.name);
      rv('rv-practice',state.practice);
      rv('rv-email',   state.email);
      rv('rv-phone',   state.phone);
    }

    function resetInstance() {
      state.step = 1; state.service = '';
      state.name = state.practice = state.role = '';
      state.email = state.phone = state.notes = '';
      state.time = 'Any time';
      ['name','practice','email','phone','notes'].forEach(function(bare) {
        var el = containerEl.querySelector('#' + P + '-' + bare);
        if (el) el.value = '';
      });
      var roleEl = containerEl.querySelector('#' + P + '-role');
      if (roleEl) roleEl.value = '';
      var timeEl = containerEl.querySelector('#' + P + '-time');
      if (timeEl) timeEl.value = 'Any time';
      qc('.mtfs-option').forEach(function(b) { b.setAttribute('aria-pressed','false'); });
      qc('.mtfs-field.mtfs-has-error').forEach(function(f) { f.classList.remove('mtfs-has-error'); });
      stepBarEl.hidden = false;
      goTo(1);
    }

    /* ---- build HTML for this instance ---- */
    function buildHTML() {
      var optCards = SERVICE_OPTIONS.map(function(opt) {
        return '<button type="button" class="mtfs-option" role="option" aria-pressed="false" data-svc="' + opt.id + '">'
          + '<span class="mtfs-opt-ico" aria-hidden="true">' + SVG[opt.icon] + '</span>'
          + esc(opt.label)
          + '</button>';
      }).join('');

      var inner = ''
        + '<div class="mtfs-header">'
        +   '<div class="mtfs-header-left">'
        +     '<img src="data:image/png;base64,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4EyObH5gzEZoAw7h8E/UnsygSRIAkf1in+nSGQPZmZrJzEIInhUAojaOAYajDH1jtjJ/kc2JYXgBmACI2nT+DwnefGeX20kim6HQ8CILgWv/iNo52TdO78698F03z21+aNSqecPPD5cHwgEmyJrxoBCitg0BaDwbIKjN1nW5sFuzNsA2TdS+bRoBlnmwK911eNQeLb29m367t4jEIRi4XZioTScLEAkBUNi+Kt52R+DzvInau1UbBHAR0Aj0o3gkcBmNI4BNZH9YowJARO07YQjeICYHKoDpfD2IJgBVAbDTaH/amQsea4QJj12jSLgJgKjNNeb8mKUC7G7GNQBE7V4DEFWoyCwAwOzZo96gRS3LboJoIvQWgEFyjQqA8RYAUXs3aDNRhRmmAcCcFStGrT1PmrSxucZA94pihRkCX3Ci9iQCaZz6j30UsMl8SYgmSMsWjNnzAEwsxwoA0UTpL5DnwT9E9OzmNPsLk0nqmucOE1HbMgPMMFlFZBJfDqK2n/0bGs/rnTR2X4K3CYkmTpcBYQWAaEK1ap7TR0TPDwMAERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERGNTgAwvgxEE4NAxrA9m/AVJpogfYUAaob1fCmI2pyZwAwC2TBWXyIYEuN0gWiCdBlIFLCILwXRRGnUYfTb8+JNU4ZBC4BBWAkgavPZvxkGFSIrm+2Z2Z6ofVu0WAgwyCoAWDxr1qi154E5XQYAarYhBAMABgCi9p35mzTG/HUKYB1fEqKJ0bIhY3BLb0EzY5g9nCYGEQYAoraeLyigEv6uAXhIRBudBxG1bZs27xEEjwAAli4d/QYtqLObIJoo8wWpq8BWMc8TTYgWHWCyerQ/7bx58wIAwGF5mlrgCgCi9qaNAwAeUIGs4hoAonaf/wtMxIv5RgCYPXvU2nNvbwkAEGp6v4jVVNlfELXzVEFVAJF7dHolcydEABE2aKI2bdAQgQbUZ6/JLwMAlEqjGAAag726cL8BXoTDP1HbzhVg5hwAxb26IU5uBuARAgt7RG1bABCYYN1v/+uzd28KBaNYXACAOfvdshwm60U4/hO172wBEjw8UtyltWy0zmq1BxBFCrPAl4eoTRu24sbt8FXu4pohojbtIwwWRaKVIb8q0XRAa7V164PgbnUOABgAiNqwVTeT/V+HJ+1j8CUEAJziNu4CJGrbziJEsUJF7swB6/Sxb3xjsCuJbrMo4joAonalit02Zv885t0H9BbhI8SI2jYBZLJiZrjr6H1vW6cKWJRJHxAIzwIgatcaQAjp1K6Be4eH6bEy+GDuZvMWVLgMgKjtOgqIRZFIvR7fDgBqAFbDloahwSGoxkwBRG019JtEkSJN7/ozsLLxwbEr0e9+WOXhas2WuVjUjCGAqH26Cpgq4jWrkmq2s7YUaDwOGJHpChM8JOoACNcBELULkSCqCCJ3rZ89exBjVAIY3gmw37T9NjoN12UyCoCLhonaKAKEXE6hKkvjTObuRgAoFqMf7NS5PAvcjjgGuBCQqK0aNaIYUxF+h/e+N0GxOGZ36M2gImWfDmZuyOUFwskCURvNFSTk8oo00WVH7PqXlf3W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" alt="MedTech For Solutions" width="28" height="28" style="width:28px;height:28px;border-radius:6px;object-fit:contain;flex-shrink:0;display:block">'
        +     '<span class="mtfs-header-title" id="' + P + '-dialog-title">Find the Right Solutions for Your Practice</span>'
        +   '</div>'
        +   (isInline ? '' : '<button type="button" class="mtfs-close-btn" id="' + P + '-close-btn" aria-label="Close dialog">' + SVG.close + '</button>')
        + '</div>'
        + '<div class="mtfs-step-bar" id="' + P + '-step-bar">'
        +   '<p class="mtfs-step-label">Step <strong class="mtfs-step-num">1</strong> of 4 &middot; <span class="mtfs-step-name">Service</span></p>'
        +   '<div class="mtfs-progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="1">'
        +     '<div class="mtfs-progress-fill" style="width:25%"></div>'
        +   '</div>'
        + '</div>'
        + '<div class="mtfs-body">'
        /* Step 1 */
        + '<div class="mtfs-step mtfs-active" data-step="1" role="group">'
        +   '<h2 class="mtfs-step-heading">Which service can we help with?</h2>'
        +   '<p class="mtfs-step-sub">Select the area closest to your need — we\'ll tailor the conversation.</p>'
        +   '<div class="mtfs-options-grid" role="listbox" aria-label="Services">' + optCards + '</div>'
        + '</div>'
        /* Step 2 */
        + '<div class="mtfs-step" data-step="2" role="group">'
        +   '<h2 class="mtfs-step-heading">Tell us about your practice</h2>'
        +   '<div class="mtfs-field" id="' + P + '-field-name">'
        +     '<label class="mtfs-label" for="' + P + '-name">Your full name<span class="mtfs-req" aria-hidden="true">*</span></label>'
        +     '<input class="mtfs-input" type="text" id="' + P + '-name" name="name" required autocomplete="name" placeholder="e.g. Dr. Jane Smith" />'
        +     '<p class="mtfs-error" id="' + P + '-err-name" role="alert">Please enter your full name.</p>'
        +   '</div>'
        +   '<div class="mtfs-field" id="' + P + '-field-practice">'
        +     '<label class="mtfs-label" for="' + P + '-practice">Practice / clinic name<span class="mtfs-req" aria-hidden="true">*</span></label>'
        +     '<input class="mtfs-input" type="text" id="' + P + '-practice" name="practice" required autocomplete="organization" placeholder="e.g. Sunrise Fertility Center" />'
        +     '<p class="mtfs-error" id="' + P + '-err-practice" role="alert">Please enter your practice or clinic name.</p>'
        +   '</div>'
        +   '<div class="mtfs-field" id="' + P + '-field-role">'
        +     '<label class="mtfs-label" for="' + P + '-role">Your role</label>'
        +     '<select class="mtfs-select" id="' + P + '-role" name="role">'
        +       '<option value="">Select a role…</option>'
        +       '<option value="Lab Director">Lab Director</option>'
        +       '<option value="Practice Manager">Practice Manager</option>'
        +       '<option value="Physician / Owner">Physician / Owner</option>'
        +       '<option value="Operations / Finance">Operations / Finance</option>'
        +       '<option value="Other">Other</option>'
        +     '</select>'
        +   '</div>'
        + '</div>'
        /* Step 3 */
        + '<div class="mtfs-step" data-step="3" role="group">'
        +   '<h2 class="mtfs-step-heading">How can we reach you?</h2>'
        +   '<div class="mtfs-field" id="' + P + '-field-email">'
        +     '<label class="mtfs-label" for="' + P + '-email">Work email<span class="mtfs-req" aria-hidden="true">*</span></label>'
        +     '<input class="mtfs-input" type="email" id="' + P + '-email" name="email" required autocomplete="email" placeholder="you@clinic.com" />'
        +     '<p class="mtfs-error" id="' + P + '-err-email" role="alert">Please enter a valid email address.</p>'
        +   '</div>'
        +   '<div class="mtfs-field" id="' + P + '-field-phone">'
        +     '<label class="mtfs-label" for="' + P + '-phone">Phone</label>'
        +     '<input class="mtfs-input" type="tel" id="' + P + '-phone" name="phone" autocomplete="tel" placeholder="(555) 000-0000" />'
        +   '</div>'
        +   '<div class="mtfs-field">'
        +     '<label class="mtfs-label" for="' + P + '-time">Preferred time</label>'
        +     '<select class="mtfs-select" id="' + P + '-time" name="preferredTime">'
        +       '<option value="Any time">Any time</option>'
        +       '<option value="Morning">Morning</option>'
        +       '<option value="Afternoon">Afternoon</option>'
        +       '<option value="Evening">Evening</option>'
        +     '</select>'
        +   '</div>'
        +   '<div class="mtfs-field">'
        +     '<label class="mtfs-label" for="' + P + '-notes">Anything we should know?</label>'
        +     '<textarea class="mtfs-textarea" id="' + P + '-notes" name="notes" rows="3" placeholder="Share any context that would help us prepare for the conversation…"></textarea>'
        +   '</div>'
        + '</div>'
        /* Step 4 */
        + '<div class="mtfs-step" data-step="4" role="group">'
        +   '<h2 class="mtfs-step-heading">Review &amp; confirm</h2>'
        +   '<div class="mtfs-review-card">'
        +     '<div class="mtfs-review-row"><span class="mtfs-review-lbl">Service</span><span class="mtfs-review-val rv-service">—</span></div>'
        +     '<div class="mtfs-review-row"><span class="mtfs-review-lbl">Name</span><span class="mtfs-review-val rv-name">—</span></div>'
        +     '<div class="mtfs-review-row"><span class="mtfs-review-lbl">Practice</span><span class="mtfs-review-val rv-practice">—</span></div>'
        +     '<div class="mtfs-review-row"><span class="mtfs-review-lbl">Email</span><span class="mtfs-review-val rv-email">—</span></div>'
        +     '<div class="mtfs-review-row"><span class="mtfs-review-lbl">Phone</span><span class="mtfs-review-val rv-phone">—</span></div>'
        +   '</div>'
        +   '<div class="mtfs-privacy-note">'
        +     SVG.lock
        +     '<p style="margin:0;max-width:100%">Your information is kept strictly confidential and used only to schedule your consultation. Please don\'t include protected health information (PHI).</p>'
        +   '</div>'
        + '</div>'
        /* Honeypot (anti-spam) — always present, invisible to real users */
        + '<div class="mtfs-hp" style="position:absolute;left:-5000px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none" aria-hidden="true">'
        +   '<label for="' + P + '-company_fax">Leave this field empty</label>'
        +   '<input type="text" id="' + P + '-company_fax" name="company_fax" value="" autocomplete="new-password" tabindex="-1">'
        + '</div>'
        /* Success */
        + '<div class="mtfs-step mtfs-step-success" role="group">'
        +   '<div class="mtfs-success">'
        +     '<div class="mtfs-check-circle" aria-hidden="true">' + SVG.check + '</div>'
        +     '<h2>Consultation request received</h2>'
        +     '<p class="mtfs-success-msg">Thank you. A MedTech advisor will reach out within one business day to confirm your consultation.</p>'
        +     '<div class="mtfs-ref-pill">Reference <span class="mtfs-ref-code">MT-XXXXXX</span></div>'
        +   '</div>'
        + '</div>'
        + '</div>' /* /body */
        + '<div class="mtfs-footer">'
        +   '<button type="button" class="mtfs-btn mtfs-btn-secondary mtfs-back-btn" hidden>' + SVG.back + ' Back</button>'
        +   '<button type="button" class="mtfs-btn mtfs-btn-primary mtfs-next-btn" disabled>Continue ' + SVG.next + '</button>'
        +   '<button type="button" class="mtfs-btn mtfs-btn-primary mtfs-submit-btn" hidden>Confirm request ' + SVG.next + '</button>'
        +   '<button type="button" class="mtfs-btn mtfs-btn-primary mtfs-done-btn" hidden>Done</button>'
        + '</div>'
        + '<div class="mtfs-brand-strip" aria-hidden="true"></div>';

      if (isInline) {
        return '<div class="mtfs-inline-card" id="getInTouchForm" role="complementary" aria-label="Get in Touch With Us">' + inner + '</div>';
      } else {
        return '<div id="mtfs-modal-root" role="dialog" aria-modal="true" aria-labelledby="' + P + '-dialog-title" hidden>'
          + '<div class="mtfs-dialog">' + inner + '</div>'
          + '</div>';
      }
    }

    /* ---- render ---- */
    containerEl.innerHTML = buildHTML();

    /* ---- cache refs ---- */
    backBtn      = containerEl.querySelector('.mtfs-back-btn');
    nextBtn      = containerEl.querySelector('.mtfs-next-btn');
    submitBtn    = containerEl.querySelector('.mtfs-submit-btn');
    doneBtn      = containerEl.querySelector('.mtfs-done-btn');
    progressFill = containerEl.querySelector('.mtfs-progress-fill');
    progressBar  = containerEl.querySelector('.mtfs-progress-track');
    stepBarEl    = containerEl.querySelector('.mtfs-step-bar');
    stepEls      = Array.prototype.slice.call(containerEl.querySelectorAll('.mtfs-step'));

    /* ---- bind events ---- */
    /* popup close btn */
    if (!isInline) {
      var closeBtnEl = containerEl.querySelector('.mtfs-close-btn');
      if (closeBtnEl) closeBtnEl.addEventListener('click', function() { closePopup(); });
      /* click outside (only for popup) */
      containerEl.addEventListener('click', function(e) {
        if (e.target === containerEl) closePopup();
      });
    }

    /* service options */
    qc('.mtfs-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        qc('.mtfs-option').forEach(function(b) { b.setAttribute('aria-pressed','false'); });
        btn.setAttribute('aria-pressed','true');
        state.service = btn.dataset.svc;
        nextBtn.disabled = false;
      });
    });

    /* live validation */
    ['name','practice','email'].forEach(function(bare) {
      var el = containerEl.querySelector('#' + P + '-' + bare);
      if (!el) return;
      el.addEventListener('input', function() {
        var wrapper = containerEl.querySelector('#' + P + '-field-' + bare);
        if (wrapper) wrapper.classList.remove('mtfs-has-error');
      });
    });

    backBtn.addEventListener('click', function() {
      if (state.step > 1) goTo(state.step - 1);
    });

    nextBtn.addEventListener('click', function() {
      if (state.step === 2) {
        state.name     = getField('name');
        state.practice = getField('practice');
        state.role     = (function(){ var el = containerEl.querySelector('#' + P + '-role'); return el ? el.value : ''; }());
      } else if (state.step === 3) {
        state.email = getField('email');
        state.phone = getField('phone');
        state.time  = (function(){ var el = containerEl.querySelector('#' + P + '-time'); return el ? el.value : 'Any time'; }());
        state.notes = (function(){ var el = containerEl.querySelector('#' + P + '-notes'); return el ? el.value.trim() : ''; }());
      }
      if (!validateStep(state.step)) return;
      if (state.step === 3) populateReview();
      goTo(state.step + 1);
    });

    submitBtn.addEventListener('click', function() {
      /* ---- honeypot check: silently "succeed" without submitting ---- */
      var hpEl = containerEl.querySelector('#' + P + '-company_fax');
      if (hpEl && hpEl.value.trim() !== '') {
        goTo('success');
        return;
      }

      state.name     = state.name     || getField('name');
      state.practice = state.practice || getField('practice');
      state.email    = state.email    || getField('email');
      state.phone    = state.phone    || getField('phone');

      /* ---- post to platform form-submissions handler ---- */
      var svcLabel = '';
      SERVICE_OPTIONS.forEach(function(o) { if (o.id === state.service) svcLabel = o.label; });
      var payload = {
        data: {
          form_name:      'getInTouchForm',
          service:        svcLabel || state.service,
          name:           state.name,
          practice:       state.practice,
          role:           state.role || '',
          email:          state.email,
          phone:          state.phone || '',
          preferred_time: state.time || 'Any time',
          notes:          state.notes || ''
        }
      };
      try {
        fetch('https://api.builder.searchatlas.com/api/forms/566d4fdc-f54c-42ad-a5de-1cf7617636df/submit/', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(function() { /* silent – UX proceeds regardless */ });
      } catch(e) { /* silent */ }

      goTo('success');
    });

    doneBtn.addEventListener('click', function() {
      if (isInline) {
        resetInstance();
      } else {
        closePopup();
      }
    });

    /* ---- popup open/close (only relevant for popup mode) ---- */
    var openerBtn = null;
    var _trapFn = null;

    function openPopup(opener) {
      openerBtn = opener || null;
      var rootEl = containerEl.firstElementChild;
      rootEl.removeAttribute('hidden');
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          rootEl.classList.add('mtfs-open');
          document.body.style.overflow = 'hidden';
          var cb = rootEl.querySelector('.mtfs-close-btn');
          if (cb) cb.focus();
        });
      });
      _trapFn = function(e) {
        if (!rootEl.classList.contains('mtfs-open')) return;
        var dialog = rootEl.querySelector('.mtfs-dialog');
        if (!dialog) return;
        var focusable = Array.prototype.slice.call(
          dialog.querySelectorAll('button:not([hidden]):not([disabled]),input:not([hidden]),select:not([hidden]),textarea:not([hidden]),[tabindex]:not([tabindex="-1"]):not([hidden])')
        ).filter(function(el) { return !el.closest('[hidden]') && el.offsetParent !== null; });
        if (!focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.key === 'Tab') {
          if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
          else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
        }
        if (e.key === 'Escape') { e.preventDefault(); closePopup(); }
      };
      document.addEventListener('keydown', _trapFn);
    }

    function closePopup() {
      var rootEl = containerEl.firstElementChild;
      rootEl.classList.remove('mtfs-open');
      document.body.style.overflow = '';
      setTimeout(function() {
        rootEl.setAttribute('hidden', '');
        resetInstance();
      }, 280);
      if (openerBtn) { try { openerBtn.focus(); } catch(e) {} }
      if (_trapFn) { document.removeEventListener('keydown', _trapFn); _trapFn = null; }
    }

    return { openPopup: openPopup, closePopup: closePopup, reset: resetInstance };
  }
  /* ---- end createFormInstance ---- */

  /* ---- init ---- */
  function init() {
    if (document.getElementById('mtfs-modal-root') || document.querySelector('.mtfs-inline-card')) return; // idempotent

    injectCSS();

    /* --- inline card on home page --- */
    var heroSlot = document.getElementById('hero-form-card');
    var inlineInstance = null;
    if (heroSlot) {
      inlineInstance = createFormInstance(heroSlot, 'inline');
    }

    /* --- popup modal (always present, used on other pages + header nav btn) --- */
    var popupWrapper = document.createElement('div');
    /* Build a minimal wrapper that matches what the popup CSS targets */
    var popupContainer = document.createElement('div');
    popupContainer.innerHTML = buildPopupShell();
    document.body.appendChild(popupContainer.firstChild);

    /* Actually: for the popup we just reuse createFormInstance in popup mode
       by giving it a fresh container that we append to body. */
    var popupEl = document.createElement('div');
    document.body.appendChild(popupEl);
    var popupInstance = createFormInstance(popupEl, 'popup');

    /* Wire trigger buttons */
    function wireTriggers() {
      /* data-open-consult: on home page → scroll to inline card; elsewhere → popup */
      Array.prototype.slice.call(document.querySelectorAll('[data-open-consult]')).forEach(function(el) {
        if (el.dataset.consultBound) return;
        el.dataset.consultBound = '1';
        el.addEventListener('click', function(e) {
          e.preventDefault();
          if (heroSlot && inlineInstance) {
            heroSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var firstInput = heroSlot.querySelector('button.mtfs-option, input, select');
            if (firstInput) setTimeout(function() { firstInput.focus(); }, 400);
          } else {
            popupInstance.openPopup(el);
          }
        });
      });
      /* .mm-cta → popup */
      Array.prototype.slice.call(document.querySelectorAll('.mm-cta')).forEach(function(el) {
        if (el.dataset.consultBound) return;
        el.dataset.consultBound = '1';
        el.addEventListener('click', function(e) {
          e.preventDefault();
          popupInstance.openPopup(el);
        });
      });
      /* .open-consult-modal → popup */
      Array.prototype.slice.call(document.querySelectorAll('.open-consult-modal')).forEach(function(el) {
        if (el.dataset.consultBound) return;
        el.dataset.consultBound = '1';
        el.addEventListener('click', function(e) {
          e.preventDefault();
          popupInstance.openPopup(el);
        });
      });
    }

    wireTriggers();
    var observer = new MutationObserver(function() { wireTriggers(); });
    observer.observe(document.body, { childList: true, subtree: false });
  }

  /* small stub — not used, kept for safety */
  function buildPopupShell() { return '<span></span>'; }

  /* run after DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* expose for manual open if needed */
  window.MtfsModal = { open: function(btn) { init(); open(btn); } };

})();
