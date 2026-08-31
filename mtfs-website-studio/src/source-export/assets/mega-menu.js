/* =============================================================================
   MedTech For Solutions — Global Mega Menu Component
   -----------------------------------------------------------------------------
   Drop-in module: include /assets/mega-menu.css and /assets/mega-menu.js on
   any page. The script auto-injects the mega menu into <body> and
   wires up sticky/compact-on-scroll, back-to-top, active-link highlighting,
   and keyboard / touch interactions.

   No dependencies. Self-contained. Safe to load via WordPress later.
   ============================================================================= */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // ICONS — minimal inline SVGs, mirrored from the existing service pages.
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // SEARCH INDEX — all site pages with titles, sections, and keywords
  // ---------------------------------------------------------------------------
  var SEARCH_INDEX = [
    {
      href: '/',
      title: 'Home — MedTech For Solutions',
      section: 'Home',
      icon: 'server',
      keywords: ['home', 'medtech', 'IVF', 'ART', 'laboratory management', 'fertility clinic', 'solutions', 'overview'],
      snippet: 'End-to-end IVF laboratory management, ART practice development, staffing, regulatory compliance, and GPO purchasing for 300+ fertility clinics nationwide.'
    },
    {
      href: '/about/',
      title: 'About Us',
      section: 'About',
      icon: 'userGroup',
      keywords: ['about', 'company', 'mission', 'history', 'founded 2005', 'White Plains', 'New York', 'overview', 'vision'],
      snippet: 'Founded in 2005 and headquartered in White Plains, NY — MedTech For Solutions brings 100+ years of combined ART industry expertise to every fertility practice we serve.'
    },
    {
      href: '/our-team/',
      title: 'Our Team',
      section: 'Team',
      icon: 'users',
      keywords: ['team', 'staff', 'leadership', 'Dwight Ryan', 'Kathleen Miller', 'experts', 'embryology', 'specialists', 'executive'],
      snippet: 'Meet our executive leadership and ART specialists — Dwight P. Ryan (President & CEO) and Kathleen Miller D.H.Sc. bring decades of fertility industry experience.'
    },
    {
      href: '/services/',
      title: 'All Services',
      section: 'Services',
      icon: 'trending',
      keywords: ['services', 'all services', 'lab solutions', 'management', 'overview', 'what we do'],
      snippet: 'A full suite of laboratory and management services designed exclusively for fertility clinics and IVF programs.'
    },
    {
      href: '/services/lab-solutions/',
      title: 'Lab Solutions',
      section: 'Lab Solutions',
      icon: 'monitor',
      keywords: ['lab', 'laboratory', 'solutions', 'IVF lab', 'ART lab', 'design', 'construction'],
      snippet: 'Comprehensive laboratory solutions including monitoring, compliance, staffing, GPO purchasing, and practice development for IVF facilities.'
    },
    {
      href: '/services/lab-solutions/real-time-monitoring/',
      title: 'Real-Time Monitoring',
      section: 'Lab Solutions',
      icon: 'monitor',
      keywords: ['monitoring', 'real-time', 'OvaTools', 'QC', 'quality control', 'dashboard', '24/7', 'equipment tracking', 'temperature', 'alert'],
      snippet: '24/7 OvaTools real-time monitoring with QC dashboards, equipment tracking, and automated alerts for IVF laboratory environments.'
    },
    {
      href: '/services/lab-solutions/regulatory-compliance/',
      title: 'Regulatory Compliance',
      section: 'Lab Solutions',
      icon: 'shield',
      keywords: ['compliance', 'regulatory', 'FDA', 'CLIA', 'CAP', 'AABB', 'audit', 'inspection', 'accreditation', 'standards'],
      snippet: 'FDA, CLIA, CAP, and AABB regulatory readiness — audit preparation, compliance programs, and ongoing quality management for ART laboratories.'
    },
    {
      href: '/services/lab-solutions/staffing-solutions/',
      title: 'Staffing Solutions',
      section: 'Lab Solutions',
      icon: 'users',
      keywords: ['staffing', 'staff', 'embryologist', 'HCLD', 'TS ABB', 'certified', 'temporary', 'recruitment', 'hire', 'placement'],
      snippet: 'TS (ABB) certified embryologists and HCLD off-site directors — temporary staffing placement for fertility clinics and IVF labs.'
    },
    {
      href: '/services/lab-solutions/gpo-purchasing/',
      title: 'GPO Purchasing',
      section: 'Lab Solutions',
      icon: 'cart',
      keywords: ['GPO', 'group purchasing', 'vendor', 'contracts', 'savings', 'pricing', 'supplies', 'Staples', 'FedEx', 'Roche', 'Nikon', 'Olympus', 'GE', 'buying power'],
      snippet: 'Free to join — pool buying power with 300+ IVF practices and access 1,800+ vendor contracts including Staples, FedEx, Roche, Nikon, Olympus, and GE.'
    },
    {
      href: '/services/lab-solutions/practice-development/',
      title: 'Practice Development',
      section: 'Lab Solutions',
      icon: 'trending',
      keywords: ['practice development', 'lab design', 'construction', 'optimization', 'training', 'build', 'new lab', 'renovation', 'consulting'],
      snippet: 'IVF lab design, construction oversight, workflow optimization, and team training — MedTech has designed 30+ ART laboratories nationally.'
    },
    {
      href: '/services/management-services/',
      title: 'Management Services',
      section: 'Management',
      icon: 'book',
      keywords: ['management', 'services', 'operational support', 'practice management', 'business'],
      snippet: 'Five management service lines — marketing, call center, accounting, HR, and insurance — to support the business operations of fertility practices.'
    },
    {
      href: '/services/management-services/marketing/',
      title: 'Marketing',
      section: 'Management',
      icon: 'megaphone',
      keywords: ['marketing', 'patient acquisition', 'digital', 'SEO', 'advertising', 'campaigns', 'brand', 'website', 'social media', 'fertility marketing'],
      snippet: 'Data-driven patient acquisition campaigns, digital strategy, and marketing programs built specifically for fertility clinic growth.'
    },
    {
      href: '/services/management-services/call-center/',
      title: 'Call Center',
      section: 'Management',
      icon: 'phone',
      keywords: ['call center', 'phone', 'patient inquiry', 'intake', 'scheduling', 'empathetic', 'communication', 'support'],
      snippet: 'Dedicated call center operations staffed by fertility-trained agents who handle patient inquiries, scheduling, and follow-up with care and empathy.'
    },
    {
      href: '/services/management-services/accounting-finance/',
      title: 'Accounting & Finance',
      section: 'Management',
      icon: 'book',
      keywords: ['accounting', 'finance', 'financial', 'reporting', 'budgeting', 'forecasting', 'revenue', 'billing', 'CFO', 'bookkeeping'],
      snippet: 'Financial oversight, budgeting, revenue reporting, and forecasting services tailored for fertility practice financial management.'
    },
    {
      href: '/services/management-services/human-resources/',
      title: 'Human Resources',
      section: 'Management',
      icon: 'userGroup',
      keywords: ['HR', 'human resources', 'recruitment', 'hiring', 'onboarding', 'performance', 'employee', 'handbook', 'benefits'],
      snippet: 'Recruitment, onboarding, performance management, and HR compliance services to support fertility clinic workforce needs.'
    },
    {
      href: '/services/management-services/insurance-risk-management/',
      title: 'Insurance & Risk Management',
      section: 'Management',
      icon: 'lock',
      keywords: ['insurance', 'risk management', 'liability', 'professional liability', 'malpractice', 'coverage', 'protection', 'ART risk'],
      snippet: 'Professional liability insurance and risk management programs designed specifically for ART practices and IVF laboratories.'
    },
    {
      href: '/contact/',
      title: 'Contact & Schedule Consultation',
      section: 'Contact',
      icon: 'phone',
      keywords: ['contact', 'schedule', 'consultation', 'phone', 'email', 'address', 'reach', 'talk', 'appointment', '866-634-9144'],
      snippet: 'Schedule a consultation with our ART specialists. Call (866) 634-9144, email info@medtech4solutions.com, or submit an inquiry online.'
    },
    {
      href: '/privacy-policy/',
      title: 'Privacy Policy',
      section: 'Legal',
      icon: 'lock',
      keywords: ['privacy', 'policy', 'data', 'personal information', 'HIPAA', 'legal'],
      snippet: 'How MedTech For Solutions collects, uses, and protects personal information across its website and services.'
    },
    {
      href: '/terms-of-service/',
      title: 'Terms of Service',
      section: 'Legal',
      icon: 'book',
      keywords: ['terms', 'terms of service', 'conditions', 'agreement', 'legal', 'use'],
      snippet: 'The terms and conditions governing use of the MedTech For Solutions website and services.'
    }
    ,
    {
      href: '/sitemap/',
      title: 'Sitemap',
      section: 'Site',
      icon: 'book',
      keywords: ['sitemap', 'site map', 'all pages', 'index', 'directory', 'navigation'],
      snippet: 'A directory of every page on the MedTech For Solutions website, organized by section.'
    },
    {
      href: '/services/management-services/call-center/',
      title: 'Call Center',
      section: 'Management',
      icon: 'phone',
      keywords: ['call center', 'phone', 'patient inquiry', 'intake', 'scheduling', 'empathetic', 'communication', 'support'],
      snippet: 'Dedicated call center operations staffed by fertility-trained agents who handle patient inquiries, scheduling, and follow-up with care and empathy.'
    },
    {
      href: '/services/management-services/',
      title: 'Management Services',
      section: 'Management',
      icon: 'book',
      keywords: ['management', 'services', 'operational support', 'practice management', 'business', 'marketing', 'accounting', 'HR', 'insurance'],
      snippet: 'Five management service lines — marketing, call center, accounting, HR, and insurance — to support the business operations of fertility practices.'
    },
    {
      href: '/services/lab-solutions/practice-development/',
      title: 'Practice Development',
      section: 'Lab Solutions',
      icon: 'trending',
      keywords: ['practice development', 'lab design', 'construction', 'optimization', 'training', 'build', 'new lab', 'renovation', 'consulting'],
      snippet: 'IVF lab design, construction oversight, workflow optimization, and team training — MedTech has designed 30+ ART laboratories nationally.'
    },
    {
      href: '/services/lab-solutions/real-time-monitoring/',
      title: 'OvaTools LMS',
      section: 'Lab Solutions',
      icon: 'monitor',
      keywords: ['ovatools', 'LMS', 'laboratory management system', 'real-time', 'monitoring', 'IVF', 'ART', 'dashboard', 'quality control', 'tracking'],
      snippet: 'OvaTools Laboratory Management System — real-time IVF lab monitoring, QC dashboards, equipment tracking, and automated alerts for fertility clinics.'
    },
  ];

  var SEARCH_SUGGESTIONS = [
    { label: 'IVF lab monitoring', query: 'real-time monitoring OvaTools' },
    { label: 'GPO purchasing savings', query: 'group purchasing vendor contracts' },
    { label: 'Staffing embryologists', query: 'certified embryologist staffing' },
    { label: 'Regulatory compliance', query: 'FDA CLIA CAP compliance' },
    { label: 'Practice development', query: 'lab design practice development' },
    { label: 'Schedule consultation', query: 'schedule consultation contact' }
  ];

  // ---------------------------------------------------------------------------
  // AI-STYLE SEARCH ENGINE — natural language query understanding + relevance
  // ---------------------------------------------------------------------------
  function tokenize(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  }

  // Synonym / concept expansion for natural language understanding
  var SYNONYMS = {
    'monitoring': ['monitor', 'track', 'tracking', 'alert', 'dashboard', 'real-time', 'ovatools'],
    'compliance': ['regulatory', 'regulation', 'fda', 'clia', 'cap', 'aabb', 'audit', 'accreditation'],
    'staff': ['staffing', 'embryologist', 'hcld', 'hire', 'hiring', 'placement', 'temporary', 'ts abb'],
    'gpo': ['purchasing', 'vendor', 'contract', 'savings', 'discount', 'supplies'],
    'marketing': ['patient', 'acquisition', 'digital', 'seo', 'advertising', 'brand'],
    'hr': ['human resources', 'recruitment', 'onboarding', 'employee'],
    'finance': ['accounting', 'financial', 'budget', 'revenue', 'billing'],
    'insurance': ['risk', 'liability', 'coverage', 'protection'],
    'lab': ['laboratory', 'ivf', 'art', 'embryology'],
    'design': ['build', 'construction', 'renovation', 'layout'],
    'contact': ['schedule', 'consultation', 'phone', 'call', 'email', 'reach']
  };

  function expandQuery(tokens) {
    var expanded = tokens.slice();
    tokens.forEach(function (tok) {
      Object.keys(SYNONYMS).forEach(function (key) {
        if (tok === key || SYNONYMS[key].indexOf(tok) !== -1) {
          expanded = expanded.concat([key]).concat(SYNONYMS[key]);
        }
      });
    });
    // Deduplicate
    var seen = {};
    return expanded.filter(function (t) { return seen[t] ? false : (seen[t] = true); });
  }

  function scoreResult(page, queryTokens) {
    var score = 0;
    var titleTokens = tokenize(page.title);
    var snippetTokens = tokenize(page.snippet);
    var keywordTokens = page.keywords.reduce(function (acc, k) { return acc.concat(tokenize(k)); }, []);
    var sectionTokens = tokenize(page.section);

    queryTokens.forEach(function (qt) {
      // Exact title match — highest weight
      if (titleTokens.indexOf(qt) !== -1) score += 10;
      // Section match
      if (sectionTokens.indexOf(qt) !== -1) score += 6;
      // Keyword match
      if (keywordTokens.indexOf(qt) !== -1) score += 5;
      // Snippet match
      if (snippetTokens.indexOf(qt) !== -1) score += 3;
      // Partial / prefix match on title
      titleTokens.forEach(function (tt) { if (tt.indexOf(qt) === 0 && qt.length > 2) score += 4; });
      // Partial match on keywords
      keywordTokens.forEach(function (kt) { if (kt.indexOf(qt) !== -1 && qt.length > 2) score += 2; });
    });

    return score;
  }

  function highlightSnippet(snippet, queryTokens) {
    var words = snippet.split(/(\s+)/);
    return words.map(function (word) {
      var clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean && queryTokens.some(function (qt) { return clean.indexOf(qt) !== -1 && qt.length > 2; })) {
        return '<mark>' + word + '</mark>';
      }
      return word;
    }).join('');
  }

  function runSearch(rawQuery) {
    if (!rawQuery || rawQuery.trim().length < 2) return [];
    var tokens = tokenize(rawQuery);
    var expanded = expandQuery(tokens);

    var scored = SEARCH_INDEX.map(function (page) {
      return { page: page, score: scoreResult(page, expanded) };
    }).filter(function (r) { return r.score > 0; });

    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 8);
  }

  // ---------------------------------------------------------------------------
  // ICONS — minimal inline SVGs
  // ---------------------------------------------------------------------------
  var ICONS = {
    monitor:   '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    shield:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
    users:     '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    cart:      '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>',
    trending:  '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
    megaphone: '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>',
    phone:     '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
    book:      '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
    userGroup: '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
    lock:      '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
    server:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>',
    arrowR:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    arrowU:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    caret:     '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 1l5 5 5-5"/></svg>',
    search:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
    sparks:    '<svg width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>'
  };

  // ---------------------------------------------------------------------------
  // SERVICE DATA — single source of truth for the mega panel.
  // ---------------------------------------------------------------------------
  var LAB_SERVICES = [
    { href: '/services/lab-solutions/real-time-monitoring/',  title: 'Real-Time Monitoring',   blurb: '24/7 OvaTools tracking & QC dashboards', icon: 'monitor'  },
    { href: '/services/lab-solutions/regulatory-compliance/', title: 'Regulatory Compliance',  blurb: 'FDA, CLIA, CAP, AABB readiness',          icon: 'shield'   },
    { href: '/services/lab-solutions/staffing-solutions/',    title: 'Staffing Solutions',     blurb: 'TS (ABB) certified embryologists & directors', icon: 'users'  },
    { href: '/services/lab-solutions/gpo-purchasing/',        title: 'GPO Purchasing',         blurb: '1,800+ vendor contracts, free to join',   icon: 'cart'     },
    { href: '/services/lab-solutions/practice-development/',   title: 'Practice Development',    blurb: 'Lab design, optimization & training',     icon: 'trending' }
  ];
  var MGMT_SERVICES = [
    { href: '/services/management-services/marketing/',                  title: 'Marketing',                   blurb: 'Patient-acquisition campaigns',           icon: 'megaphone' },
    { href: '/services/management-services/call-center/',                 title: 'Call Center',                  blurb: 'Dedicated fertility patient call center',  icon: 'phone'     },
    { href: '/services/management-services/accounting-finance/',         title: 'Accounting & Finance',        blurb: 'Reporting, budgeting, forecasting',       icon: 'book'      },
    { href: '/services/management-services/human-resources/',            title: 'Human Resources',             blurb: 'Recruitment & performance management',    icon: 'userGroup' },
    { href: '/services/management-services/insurance-risk-management/',  title: 'Insurance & Risk Management', blurb: 'Professional liability for ART practices', icon: 'lock'      },
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
    +       '<img src="https://media.cdn.builder.searchatlas.com/user-uploads/8938b9ec-89dc-47c4-aa9d-aabb527787a9_medtech-for-solutions-website-logo.webp" alt="MedTech For Solutions" style="height:44px;width:auto;max-width:220px;display:block;object-fit:contain;" />'
    +     '</a>'

    +     '<nav role="navigation" aria-label="Primary">'
    +       '<ul class="mm-nav" id="mm-nav">'
    +         '<li><a href="/" data-mm-match="^/$">Home</a></li>'
    +         '<li>'
    +           '<button type="button" data-mm-trigger="lab" aria-expanded="false" aria-controls="mm-lab-panel" data-mm-match="^/services/lab-solutions(/|$)">'
    +             'Lab Solutions <span class="mm-caret">' + ICONS.caret + '</span>'
    +           '</button>'
    +           panelMarkup('mm-lab-panel', 'lab', 'Laboratory Solutions', 5, LAB_SERVICES, 'Built for ART labs', 'Monitoring, compliance, staffing, GPO purchasing, and practice development for fertility programs.', 'Five lab-focused service lines.', '/services/lab-solutions/', 'Explore lab solutions')
    +         '</li>'
    +         '<li>'
    +           '<button type="button" data-mm-trigger="mgmt" aria-expanded="false" aria-controls="mm-mgmt-panel" data-mm-match="^/services/management-services(/|$)">'
    +             'Management <span class="mm-caret">' + ICONS.caret + '</span>'
    +           '</button>'
    +           panelMarkup('mm-mgmt-panel', 'mgmt', 'Management Services', 5, MGMT_SERVICES, 'Operational support', 'Marketing, call center, finance, HR, and risk support for growing fertility practices.', 'Five management service lines.', '/services/management-services/', 'Explore management')
    +         '</li>'
    +         '<li>'
    +           '<button type="button" data-mm-trigger="about" aria-expanded="false" aria-controls="mm-about-panel" data-mm-match="^/(about|staff)(/|$)">'
    +             'About <span class="mm-caret">' + ICONS.caret + '</span>'
    +           '</button>'
    +           '<div class="mm-panel mm-panel-about" id="mm-about-panel" role="region" aria-label="About menu">'
    +             '<div class="mm-panel-grid">'
    +               '<div class="mm-col mm-col-about">'
    +                 '<ul class="mm-items">'
    +                   '<li><a class="mm-item" href="/about/" data-mm-section="about">'
    +                     '<span class="mm-item-ico">' + ICONS.userGroup + '</span>'
    +                     '<span class="mm-item-body"><strong>About Us</strong><span>Our mission, history, and values</span></span>'
    +                   '</a></li>'
    +                   '<li><a class="mm-item" href="/our-team/" data-mm-section="about">'
    +                     '<span class="mm-item-ico">' + ICONS.users + '</span>'
    +                     '<span class="mm-item-body"><strong>Our Team</strong><span>Meet the MedTech specialists</span></span>'
    +                   '</a></li>'
    +                 '</ul>'
    +               '</div>'
    +             '</div>'
    +           '</div>'
    +         '</li>'
    +         '<li class="mm-mobile-only"><a href="/contact/" data-mm-match="^/contact(/|$)" data-open-consult role="button">Book a Consultation</a></li>'
    +       '</ul>'
    +     '</nav>'

    +     '<div class="mm-right">'
    +       '<a class="mm-phone" href="tel:+18666349144">' + ICONS.phone + '<span>(866) 634-9144</span></a>'
    +       '<button class="mm-search-btn" type="button" id="mm-search-open" aria-label="Open AI search" aria-haspopup="dialog">'
    +         ICONS.search + '<span>Search</span>'
    +         '<span class="mm-search-kbhint"><kbd>⌘</kbd><kbd>K</kbd></span>'
    +       '</button>'
    +       '<a class="mm-cta" href="/contact/" data-open-consult role="button">Book a Consultation ' + ICONS.arrowR + '</a>'
    +       '<button class="mm-burger" type="button" aria-label="Toggle menu" aria-controls="mm-nav" aria-expanded="false"><span></span><span></span><span></span></button>'
    +     '</div>'

    +   '</div>'
    + '</header>'
    + '<div class="mm-mobile-scrim" aria-hidden="true"></div>'
    + '<button class="mm-back-to-top" id="mm-back-to-top" type="button" aria-label="Back to top">' + ICONS.arrowU + '</button>'
    + '<div class="mm-search-overlay" id="mm-search-overlay" role="dialog" aria-modal="true" aria-label="AI-powered site search">'
    +   '<div class="mm-search-modal">'
    +     '<div class="mm-search-input-row">'
    +       ICONS.search
    +       '<input type="search" id="mm-search-input" aria-label="Search services, topics, or ask a question" placeholder="Search services, topics, or ask a question…" autocomplete="off" spellcheck="false" />'
    +       '<button class="mm-search-close" id="mm-search-close" type="button" aria-label="Close search">ESC</button>'
    +     '</div>'
    +     '<div class="mm-search-status" id="mm-search-status">'
    +       '<span class="mm-ai-badge">' + ICONS.sparks + ' AI Search</span>'
    +       '<span id="mm-search-status-text">Natural language search across all MedTech services &amp; content</span>'
    +     '</div>'
    +     '<div id="mm-search-body">'
    +       '<div class="mm-search-suggestions" id="mm-search-suggestions">'
    +         '<p>Try searching for</p>'
    +         '<div class="mm-search-suggestions-list" id="mm-search-suggestions-list"></div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="mm-search-footer">'
    +       '<span class="mm-search-footer-hint"><kbd>↑↓</kbd> navigate</span>'
    +       '<span class="mm-search-footer-hint"><kbd>↵</kbd> open</span>'
    +       '<span class="mm-search-footer-hint"><kbd>ESC</kbd> close</span>'
    +     '</div>'
    +   '</div>'
    + '</div>';

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

    // ---------------------------------------------------------------------------
    // AI SEARCH LOGIC
    // ---------------------------------------------------------------------------
    var searchOverlay = document.getElementById('mm-search-overlay');
    var searchInput   = document.getElementById('mm-search-input');
    var searchOpenBtn = document.getElementById('mm-search-open');
    var searchCloseBtn = document.getElementById('mm-search-close');
    var searchBody    = document.getElementById('mm-search-body');
    var searchSuggestions = document.getElementById('mm-search-suggestions');
    var searchSuggestionsList = document.getElementById('mm-search-suggestions-list');
    var searchStatusText = document.getElementById('mm-search-status-text');
    var searchDebounce = null;
    var selectedIdx = -1;

    // Render suggestion chips
    SEARCH_SUGGESTIONS.forEach(function (s) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'mm-suggest-chip';
      chip.innerHTML = ICONS.search + s.label;
      chip.addEventListener('click', function () {
        searchInput.value = s.query;
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
      });
      searchSuggestionsList.appendChild(chip);
    });

    function scoreBarHTML(score, max) {
      var bars = Math.min(5, Math.ceil((score / Math.max(max, 1)) * 5));
      var html = '<span class="mm-result-score-bar">';
      for (var i = 0; i < 5; i++) {
        html += '<span' + (i < bars ? ' class="mm-score-on"' : '') + '></span>';
      }
      html += '</span>';
      return html;
    }

    function renderResults(results, query) {
      searchBody.innerHTML = '';
      if (!query || query.trim().length < 2) {
        searchBody.appendChild(searchSuggestions);
        searchStatusText.textContent = 'Natural language search across all MedTech services & content';
        selectedIdx = -1;
        return;
      }
      if (results.length === 0) {
        searchStatusText.textContent = 'No results found';
        searchBody.innerHTML = ''
          + '<div class="mm-no-results">'
          + ICONS.search
          + '<strong>No results for &ldquo;' + query.replace(/</g,'&lt;') + '&rdquo;</strong>'
          + '<span>Try different keywords, or <a href="/contact/" style="color:var(--mm-teal)">contact us</a> directly.</span>'
          + '</div>';
        return;
      }

      var maxScore = results[0].score;
      searchStatusText.textContent = results.length + ' result' + (results.length === 1 ? '' : 's') + ' — ranked by AI relevance';

      var qTokens = expandQuery(tokenize(query));
      var list = document.createElement('div');
      list.className = 'mm-search-results';
      list.setAttribute('role', 'listbox');
      list.setAttribute('aria-label', 'Search results');

      var label = document.createElement('div');
      label.className = 'mm-results-group-label';
      label.textContent = 'Best matches';
      list.appendChild(label);

      results.forEach(function (r, idx) {
        var a = document.createElement('a');
        a.className = 'mm-result';
        a.href = r.page.href;
        a.setAttribute('role', 'option');
        a.dataset.idx = idx;
        a.innerHTML = ''
          + '<span class="mm-result-ico">' + ICONS[r.page.icon] + '</span>'
          + '<span class="mm-result-body">'
          + '<span class="mm-result-title">' + r.page.title + '</span>'
          + '<span class="mm-result-snippet">' + highlightSnippet(r.page.snippet, qTokens) + '</span>'
          + '<span class="mm-result-meta">'
          + '<span class="mm-result-section">' + r.page.section + '</span>'
          + '<span class="mm-result-score">Relevance ' + scoreBarHTML(r.score, maxScore) + '</span>'
          + '</span>'
          + '</span>';
        a.addEventListener('click', function () { closeSearch(); });
        list.appendChild(a);
      });

      searchBody.appendChild(list);
      selectedIdx = -1;
    }

    function getResultLinks() {
      return Array.prototype.slice.call(searchBody.querySelectorAll('.mm-result'));
    }

    function setSelectedIdx(idx) {
      var links = getResultLinks();
      links.forEach(function (l, i) {
        l.classList.toggle('mm-result-selected', i === idx);
        if (i === idx) { l.style.background = 'var(--mm-g50)'; l.scrollIntoView({ block: 'nearest' }); }
        else { l.style.background = ''; }
      });
      selectedIdx = idx;
    }

    function openSearch() {
      searchOverlay.classList.add('mm-search-open');
      document.body.classList.add('mm-menu-lock');
      // Reset
      searchInput.value = '';
      searchBody.innerHTML = '';
      searchBody.appendChild(searchSuggestions);
      searchStatusText.textContent = 'Natural language search across all MedTech services & content';
      selectedIdx = -1;
      setTimeout(function () { searchInput.focus(); }, 60);
    }

    function closeSearch() {
      searchOverlay.classList.remove('mm-search-open');
      document.body.classList.remove('mm-menu-lock');
      searchOpenBtn.focus();
    }

    searchOpenBtn.addEventListener('click', openSearch);
    searchCloseBtn.addEventListener('click', closeSearch);

    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) closeSearch();
    });

    searchInput.addEventListener('input', function () {
      clearTimeout(searchDebounce);
      var q = searchInput.value;
      searchDebounce = setTimeout(function () {
        var results = runSearch(q);
        renderResults(results, q);
      }, 120);
    });

    searchInput.addEventListener('keydown', function (e) {
      var links = getResultLinks();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(Math.min(selectedIdx + 1, links.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(Math.max(selectedIdx - 1, -1));
        if (selectedIdx === -1) searchInput.focus();
      } else if (e.key === 'Enter' && selectedIdx >= 0 && links[selectedIdx]) {
        e.preventDefault();
        links[selectedIdx].click();
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });

    // Keyboard shortcut: Cmd+K / Ctrl+K
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchOverlay.classList.contains('mm-search-open')) closeSearch();
        else openSearch();
      }
      if (e.key === 'Escape' && searchOverlay.classList.contains('mm-search-open')) {
        closeSearch();
      }
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
