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
  .mtfs-option[aria-selected="true"] {
    border-color: #1F6E75; background: #E4F0EE;
    box-shadow: 0 0 0 3px rgba(31,110,117,.15);
    color: #175459;
  }
  .mtfs-option[aria-selected="true"] .mtfs-opt-ico { color: #1F6E75; }
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
      qc('.mtfs-option').forEach(function(b) { b.setAttribute('aria-selected','false'); });
      qc('.mtfs-field.mtfs-has-error').forEach(function(f) { f.classList.remove('mtfs-has-error'); });
      stepBarEl.hidden = false;
      goTo(1);
    }

    /* ---- build HTML for this instance ---- */
    function buildHTML() {
      var optCards = SERVICE_OPTIONS.map(function(opt) {
        return '<button type="button" class="mtfs-option" role="option" aria-selected="false" data-svc="' + opt.id + '">'
          + '<span class="mtfs-opt-ico" aria-hidden="true">' + SVG[opt.icon] + '</span>'
          + esc(opt.label)
          + '</button>';
      }).join('');

      var inner = ''
        + '<div class="mtfs-header">'
        +   '<div class="mtfs-header-left">'
        +     '<img src="/assets/img/brand-icon-96.f59fe7f0f8d4.webp" alt="MedTech For Solutions" width="28" height="28" loading="lazy" decoding="async" style="width:28px;height:28px;border-radius:6px;object-fit:contain;flex-shrink:0;display:block">'
        +     '<span class="mtfs-header-title" id="' + P + '-dialog-title">Find the Right Solutions for Your Practice</span>'
        +   '</div>'
        +   (isInline ? '' : '<button type="button" class="mtfs-close-btn" id="' + P + '-close-btn" aria-label="Close dialog">' + SVG.close + '</button>')
        + '</div>'
        + '<div class="mtfs-step-bar" id="' + P + '-step-bar">'
        +   '<p class="mtfs-step-label">Step <strong class="mtfs-step-num">1</strong> of 4 &middot; <span class="mtfs-step-name">Service</span></p>'
        +   '<div class="mtfs-progress-track" role="progressbar" aria-label="Consultation form progress" aria-valuemin="1" aria-valuemax="4" aria-valuenow="1">'
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
        qc('.mtfs-option').forEach(function(b) { b.setAttribute('aria-selected','false'); });
        btn.setAttribute('aria-selected','true');
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
  /* MutationObserver removed: it existed only to re-run wireTriggers() after
     mega-menu.js injected .mm-cta into <body>. The header is server-rendered
     now, so every trigger is in the DOM before this module is even fetched. */
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
  window.MtfsModal = {
    /* The shipped file wrote `{ open: function (btn) { init(); open(btn); } }`, but
       there is no `open` in this scope, so it resolved to window.open(btn) and popped
       a browser window. openPopup is the real function. */
    open: function (btn) { init(); openPopup(btn || null); },
    close: function () { closePopup(); }
  };

})();
