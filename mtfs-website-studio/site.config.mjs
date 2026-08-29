/**
 * =============================================================================
 * site.config.mjs — THE GLOBAL SYNC MASTER
 * =============================================================================
 *
 * This file is the single source of truth for the whole mtfs-website-studio
 * build. Every other artifact in the pipeline is DERIVED from it:
 *
 *   routes[]        -> <head> tags, canonical URLs, hreflang, JSON-LD WebPage +
 *                      BreadcrumbList + Service nodes, the server-rendered
 *                      <header><nav>, breadcrumb <nav>, related-links block,
 *                      the footer, sitemap.xml, llms.txt, llms-full.txt and the
 *                      lazily-fetched search index.
 *   site            -> Organization/ProfessionalService + WebSite JSON-LD,
 *                      og:… and twitter:… tags, the footer NAP block, the GTM
 *                      and Search Atlas loaders, and the analytics module's
 *                      endpoints and payload.
 *   redirects[]     -> _redirects
 *   headerRules[]   -> _headers
 *   navIcons        -> the inline SVG sprite the SSR header and panels emit.
 *
 * WHY A SINGLE MASTER: the audited export drifted precisely because the same
 * fact was hand-written in many places. Measured examples from the export:
 *   - sitemap.xml, llms.txt and llms-full.txt agreed on 20 URLs only by luck;
 *     nothing structurally guaranteed it.
 *   - 12 of 21 BreadcrumbList trails omitted the /services/ tier because each
 *     trail was hand-written instead of walked from a parent pointer.
 *   - /our-team/ shipped a breadcrumb named "Staff" against a nav label and
 *     <title> of "Our Team"; /terms-of-service/ shipped "Terms of Service"
 *     against an <h1> and <title> of "Terms of Use".
 *   - The two service hubs were the ONLY routes missing from the site-wide
 *     footer, so all ten of their children outranked their own parents.
 *   - One @id (#organization) was declared on 18 pages with FOUR different
 *     @type shapes.
 * Every one of those is a synchronisation bug, not a content bug. Deriving
 * them all from the arrays below is what makes them unrepeatable.
 *
 * HARD RULES FOR EDITORS OF THIS FILE
 *  1. `path` is ALWAYS root-relative and ALWAYS ends in '/'. Every canonical URL
 *     in the export already has that shape and it must stay true — validate.mjs
 *     fails the build otherwise.
 *  2. Never add, remove or rename a route. The inventory is fixed at 21 pages
 *     (20 indexable + /404/). No doorway pages, no per-question pages, no city
 *     pages: the site's clean 21-unique-title structure is an asset to protect.
 *  3. `title` 30-60 chars, `description` 70-160 chars. validate.mjs asserts it.
 *  4. No route may carry generic anchor text. navLabel IS the link text used by
 *     the nav, the footer, the breadcrumbs and the related-links block, so it
 *     must name the destination. "Learn More" / "Get Started" / "Click here" /
 *     "Read more" are blocked by validate.mjs::validateLinks.
 *  5. Numbers in `summary` must be facts that already appear, consistently, in
 *     the export's own copy. Do not restate a statistic that the content audit
 *     flagged as unsourced (see OPEN CONTENT ISSUES at the foot of this file).
 *
 * MEASURED BASELINE (Lighthouse 12.8.2, mobile, on the exact export; the two
 * third-party hosts were unreachable in the sandbox, so real-world is worse):
 *   Performance 99 / Accessibility 91 / Best Practices 96 / SEO 92.
 *   FCP 1.7 s, LCP 1.8 s, TBT 30 ms, CLS 0.005, TTI 3.1 s, main thread 1.2 s,
 *   903 DOM elements, max DOM depth 15.
 * Failing audits this config exists to fix: SEO link-text (0), heading-order (0),
 * label-content-name-mismatch (0), aria-allowed-attr, aria-progressbar-name,
 * errors-in-console. Do not project a post-fix score anywhere in this repo;
 * re-measure instead.
 *
 * ESM, Node >= 18, zero npm dependencies. This file imports nothing at all.
 */

/* eslint-disable max-len */

// =============================================================================
// SECTION 1 — site
// =============================================================================
// Brand-level facts. Everything here is lifted verbatim from the export unless
// a comment says otherwise, because these strings end up in structured data
// that third parties reconcile against Google Business Profile, state licence
// records and the footer NAP block. Guessing here is worse than omitting.

export const site = {
  // ---------------------------------------------------------------------------
  // Identity
  // ---------------------------------------------------------------------------

  /**
   * Scheme + host, no trailing slash. Every absolute URL the build emits is
   * `origin + route.path`. All 21 canonicals in the export are already
   * self-referencing and absolute against this origin; that property is
   * preserved exactly.
   * Breaks if it drifts: canonical, og:url, JSON-LD @id and sitemap.xml all
   * point at a host that is not the one being served -> duplicate-content and
   * a dangling entity graph.
   */
  origin: 'https://medtech4solutions.com',

  /** Display name. Used as og:site_name, Organization.name, footer, llms.txt. */
  name: 'MedTech For Solutions',

  /**
   * Registered entity name. The export's Organization node carried this as
   * `alternateName`; schema.org's `legalName` is the correct property and the
   * footer copyright line already reads "MedTech For Solutions Inc.".
   */
  legalName: 'MedTech For Solutions Inc.',

  /**
   * Organization.description — verbatim from the export's home-page
   * Organization/ProfessionalService node. Long-form on purpose: this is
   * structured data, not a meta description, so the 160-char rule does not
   * apply. Per-page meta descriptions live on routes[].description.
   */
  description:
    'MedTech For Solutions is a comprehensive laboratory management and practice development company specializing exclusively in the assisted reproductive technology (ART) industry. Founded in 2005 and based in White Plains, NY, MedTech supports fertility clinics, IVF laboratories, and reproductive medicine facilities nationwide.',

  /**
   * Organization.foundingDate.
   * !! OPEN ISSUE (content audit AISEO-10): the export states 2005 in six
   * places (home, /about/, /contact/, all 21 footers, llms.txt and the
   * Organization JSON-LD) and 2006 once, inside Dwight Ryan's bio on
   * /our-team/. 2005 is kept here because it is the overwhelming majority and
   * the value the existing structured data already publishes. The single 2006
   * sentence must be corrected in page copy, or this value changed — with the
   * client, not by guessing.
   */
  foundingDate: '2005',

  // ---------------------------------------------------------------------------
  // Contact — the NAP set. One definition, rendered identically in the footer,
  // on /contact/ and in the Organization JSON-LD.
  // ---------------------------------------------------------------------------

  /** E.164. Rendered as (866) 634-9144; tel: links use this raw form. */
  telephone: '+1-866-634-9144',

  /**
   * Present only on /contact/'s LocalBusiness node in the export; promoted here
   * so the single Organization node carries the complete contact set.
   */
  faxNumber: '+1-866-482-5058',

  email: 'info@medtech4solutions.com',

  /**
   * !! OPEN ISSUE (content audit AISEO-10): /contact/ renders
   * "399 Knollwood Road, Suite 303" while all 21 footers and every JSON-LD
   * PostalAddress omit the suite. NAP consistency is ordinary local-SEO
   * hygiene and is currently broken against the site's own schema. The
   * majority/structured-data form is kept; if Suite 303 is correct the client
   * must confirm it and it must be added HERE, once — never on one page.
   */
  address: {
    streetAddress: '399 Knollwood Road',
    addressLocality: 'White Plains',
    addressRegion: 'NY',
    postalCode: '10603',
    addressCountry: 'US',
  },

  /**
   * Geo + hours existed only on /contact/'s LocalBusiness node. Promoted so
   * organizationJsonLd(cfg) can emit ONE node with the full property set on all
   * 21 pages, which is what kills the four-conflicting-@type-shapes defect.
   */
  geo: { latitude: 41.0534, longitude: -73.7629 },
  openingHours: {
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:30',
    closes: '18:00',
  },

  /** Verbatim from the export's Organization node. */
  areaServed: [
    { type: 'Country', name: 'United States' },
    { type: 'AdministrativeArea', name: 'International' },
  ],

  /** Verbatim from the export's Organization node. Entity-coverage signal. */
  knowsAbout: [
    'Assisted Reproductive Technology',
    'IVF Laboratory Management',
    'Embryology Laboratory Design',
    'Fertility Clinic Consulting',
    'ART Regulatory Compliance',
    'IVF Temporary Staffing',
    'Healthcare Group Purchasing',
  ],

  /**
   * Organization.sameAs — DELIBERATELY EMPTY.
   * The SEO audit calls sameAs the single most important entity-reconciliation
   * property and it is absent from all 21 pages. It stays absent until the
   * client supplies verified URLs, because the only external social link in the
   * entire export is https://www.linkedin.com/in/kevinryanofficial/ — the web
   * designer's PERSONAL profile, repeated in 21 footers. That is not the
   * brand's social signal and must not be published as one, and inventing a
   * company LinkedIn/GBP URL would be fabricating a third-party reference.
   * organizationJsonLd() must OMIT the property entirely when this is empty
   * (an empty array in JSON-LD is a claim of "no profiles", which is false).
   * TO DO (client): company LinkedIn page, Google Business Profile, any trade
   * or association listing.
   */
  sameAs: [],

  // ---------------------------------------------------------------------------
  // Imagery
  // ---------------------------------------------------------------------------

  /**
   * Brand logo. Object, not a bare string, because two consumers need more than
   * a URL: organizationJsonLd() needs the src, and renderHeader() must emit real
   * width/height attributes (the export shipped
   * `style="height:44px;width:auto;max-width:220px;object-fit:contain"`, and the
   * contract forbids inline style=).
   *
   * !! width/height are the CSS LAYOUT BOX, not measured intrinsics.
   * mega-menu.css declares `.mm-logo img { height:44px; width:auto }` and the
   * inline style capped it at `max-width:220px` with `object-fit:contain`. The
   * CDN (media.cdn.builder.searchatlas.com) is unreachable from the build
   * sandbox — the same condition Lighthouse ran under — so the true intrinsic
   * size could not be measured and is NOT invented here. 220x44 is the exact
   * maximum box the CSS allows; combined with `object-fit:contain` (which must
   * move to a class, e.g. `.mm-logo img`) the browser reserves that box and
   * letterboxes the real asset inside it, so the aspect ratio can never be
   * distorted and no layout shift occurs. Replace with measured intrinsics if
   * the asset is ever self-hosted under /assets/img/.
   */
  logo: {
    src: 'https://media.cdn.builder.searchatlas.com/user-uploads/8938b9ec-89dc-47c4-aa9d-aabb527787a9_medtech-for-solutions-website-logo.webp',
    width: 220,
    height: 44,
    alt: 'MedTech For Solutions',
  },

  /**
   * Social-card image. Object, because the contract requires renderHeadTags to
   * emit og:image, og:image:width, og:image:height, og:image:alt and
   * twitter:image from this one value.
   *
   * MEASURED GAP: og:image, twitter:image, twitter:title, twitter:description
   * and og:locale appear on 0 of 21 pages today, while 12 pages declare
   * twitter:card=summary_large_image — a card type that requires an image.
   * Supplying a real image here is what makes summary_large_image honest; do
   * NOT emit that card type if this is ever set to null.
   *
   * The chosen asset is a real, already-shipped site image (home page, third
   * <img>), with its declared intrinsic dimensions and its existing alt text
   * copied verbatim — no new asset is invented and no alt text is rewritten.
   * FOLLOW-UP: a purpose-built 1200x630 branded card would crop better than
   * this 1600x686 (2.33:1) photograph. That is an asset-production task, not a
   * build task.
   */
  defaultOgImage: {
    src: 'https://media.cdn.builder.searchatlas.com/site-assets/e311c34b-e043-4493-8bbe-3b526ea53fd2/e1146f7d6594fbe56c52c12aabd092e4.jpg',
    width: 1600,
    height: 686,
    alt: 'Modern IVF laboratory with incubators and cryostorage equipment',
  },

  // ---------------------------------------------------------------------------
  // Localisation
  // ---------------------------------------------------------------------------

  /** og:locale. Absent from all 21 pages in the export. */
  locale: 'en_US',

  /**
   * <html lang>. Consistent on all 21 export pages — preserve it.
   * HREFLANG POLICY: the export shipped a lone self-referencing
   * `hreflang="x-default"` on 12 of 21 pages and none on the other 9. A single
   * x-default with no language alternate is a no-op. This is a single-language
   * site, so renderHeadTags must emit NO hreflang at all. One policy, applied
   * to all 20 indexable routes. Do not reproduce the half-set.
   */
  lang: 'en',

  // ---------------------------------------------------------------------------
  // Third parties (kept working, moved off the critical path)
  // ---------------------------------------------------------------------------

  /**
   * Google Tag Manager container. MUST keep working. In the export the GTM
   * snippet is the FIRST element inside <head>, synchronous, AHEAD of
   * <meta charset> — a spec violation (hoist-charset + defer-third-party fix
   * both). The noscript <iframe> stays on all 21 pages and must gain
   * title="Google Tag Manager".
   * Do not wrap this in a CSP that blocks inline script (see headerRules).
   */
  gtmId: 'GTM-MKTJCBZG',

  searchAtlas: {
    /**
     * Website Studio project UUID. Also the path segment of every
     * media.cdn.builder.searchatlas.com/site-assets/<projectId>/ asset URL, so
     * changing it invalidates the image and font hosts too.
     */
    projectId: 'e311c34b-e043-4493-8bbe-3b526ea53fd2',

    /**
     * LPS visitor-tracker shared secret. NOT a new exposure: it is already
     * inlined in clear text in every one of the 21 exported pages. It is
     * recorded here only so the analytics module can reproduce the
     * /api/track/ and /api/event/ payloads BYTE-FOR-BYTE, which is a hard
     * constraint. If the operator ever rotates it, rotate it here.
     */
    trackingSecret: '5bb69e05-f4f3-4cae-af52-9b4cef9a3c91',

    /** Search Atlas dynamic-optimization script. defer, never delete. */
    dynamicOptimizationSrc: 'https://dashboard.fertilerank.com/scripts/dynamic_optimization.js',
    dynamicOptimizationUuid: 'f2087532-0394-429e-ad53-c821afc623e5',

    /**
     * The three endpoints the inline tracker posts to. Recorded so
     * /assets/analytics.<hash>.js can be extracted from <head> without the
     * payload contract changing.
     * NOTE ON sectionEngagement: it has NEVER fired. The tracker skips every
     * candidate that lacks a `data-section-id` attribute, and that attribute
     * occurs 0 times outside <script> in all 21 pages. Keep the subsystem
     * gated behind `document.querySelector('[data-section-id]')`. If the
     * renderer ever starts emitting data-section-id, that TURNS ON an endpoint
     * that has never received a request — an analytics ADDITION, not a
     * preservation. Record it in the changelog if it is ever done.
     */
    trackEndpoint: 'https://api.builder.searchatlas.com/api/track/',
    eventEndpoint: 'https://api.builder.searchatlas.com/api/event/',
    sectionEngagementEndpoint: 'https://api.builder.searchatlas.com/api/section-engagement/',

    /** Storage keys the tracker uses for visitor_id / session_id. Preserve. */
    visitorIdKey: '_lps_vid',
    sessionIdKey: '_lps_sid',
  },

  // ---------------------------------------------------------------------------
  // Fonts — the ONLY two files the browser actually fetches
  // ---------------------------------------------------------------------------
  /**
   * assets/css/fonts.css declares 14 @font-face blocks over 4 unique woff2
   * files, but lh-mobile.json's network-requests proves the browser requested
   * exactly TWO: the `latin` subsets. The two `latin-ext` files are never
   * fetched (the only non-latin codepoint in the home page's visible text is
   * an arrow glyph that falls outside BOTH ranges), so preloading them would
   * waste two connections. Preload exactly these two, with crossorigin.
   *
   * Sora carries fetchpriority=high because the measured LCP element is
   * `section.hero > div.hero-inner > div.hero-copy > h1#h1` — a TEXT node in
   * Sora, not an image. Emit exactly ONE fetchpriority=high preload per page;
   * the home page currently ships two image preloads and neither is the LCP
   * element.
   *
   * Keep all 14 @font-face blocks when fonts.css is inlined. Do NOT collapse
   * them to 4 with `font-weight: 400 700` ranges: the same physical file backs
   * four weights, and a range would make the browser synthesise bold if the
   * file turns out to be static rather than variable.
   *
   * ACCEPTED RISK: _headers cannot govern media.cdn.builder.searchatlas.com,
   * so these four woff2 files and every CDN image sit outside our cache policy.
   * Self-hosting them under /assets/fonts/ would bring them under the
   * /assets/* immutable rule — that is a follow-up, not part of this refactor,
   * because it changes asset URLs.
   */
  fonts: {
    preconnect: ['https://media.cdn.builder.searchatlas.com'],
    preload: [
      {
        href: 'https://media.cdn.builder.searchatlas.com/site-assets/e311c34b-e043-4493-8bbe-3b526ea53fd2/811e11966d29f3a01fcb19b087b61ac0.woff2',
        family: 'Sora',
        subset: 'latin',
        type: 'font/woff2',
        fetchpriority: 'high',
      },
      {
        href: 'https://media.cdn.builder.searchatlas.com/site-assets/e311c34b-e043-4493-8bbe-3b526ea53fd2/ca72d2bcea8f4daa783dbdfa2d9b4606.woff2',
        family: 'DM Sans',
        subset: 'latin',
        type: 'font/woff2',
        fetchpriority: null,
      },
    ],
  },
};

// =============================================================================
// SECTION 2 — routes
// =============================================================================
/**
 * ORDER IS MEANINGFUL. routes[] is written in the order the site presents
 * itself: top-level pages first, then each hub immediately followed by its
 * children IN MEGA-PANEL / FOOTER ORDER, then legal, then system. Routes of
 * the same `group` are CONTIGUOUS, so a generator that walks routes[] once and
 * starts a new heading whenever `group` changes emits each section exactly
 * once — llms.txt's headings and the footer's columns both rely on that.
 *
 * That panel order is a curated one, taken verbatim from the export's
 * mega-menu.js data model, and renderHeader must reproduce it exactly:
 *   Lab panel      -> Real-Time Monitoring, Regulatory Compliance,
 *                     Staffing Solutions, GPO Purchasing, Practice Development
 *   Management     -> Marketing, Call Center, Accounting & Finance,
 *                     Human Resources, Insurance & Risk Management
 *   About panel    -> About Us, Our Team
 * sitemap.xml, llms.txt and llms-full.txt inherit this order. It therefore
 * differs from the export's sitemap.xml, which listed children alphabetically.
 * That is intentional and harmless: sitemap order carries no ranking meaning,
 * and driving all three artifacts from one array is what structurally
 * guarantees the agreement they previously had only by coincidence.
 *
 * FIELD REFERENCE
 *   id            Stable kebab-case key. Never reused, never renamed — it is
 *                 the join key for parent, for pageMarkdown maps and for
 *                 changelog references. Not derived from `path` so a path can
 *                 be corrected without orphaning references.
 *   path          Root-relative, leading AND trailing slash. Canonical URL is
 *                 origin + path. Never change one: all 21 are live URLs.
 *   parent        id of the parent route, or null for a root. breadcrumbTrail()
 *                 walks this, which is what inserts the /services/ tier that
 *                 12 hand-written BreadcrumbLists omitted.
 *   title         <title> AND og:title AND twitter:title. 30-60 chars.
 *   navLabel      THE LINK TEXT. Used by the nav, the footer, the breadcrumb
 *                 <ol>, the BreadcrumbList item names and the related-links
 *                 block. Must name the destination — this single field is what
 *                 replaces all 26 "Learn More" anchors and lets their
 *                 aria-labels be deleted, clearing the SEO link-text failure
 *                 and the label-content-name-mismatch failure at once.
 *   description   meta description AND og:description AND twitter:description
 *                 AND the WebPage node's description. 70-160 chars.
 *   priority      sitemap.xml <priority>, 0.0-1.0.
 *   changefreq    sitemap.xml <changefreq>. Google has ignored both since 2023;
 *                 they are kept because the export published them and removing
 *                 them is a change with no upside. Never hand-maintained again.
 *   inNav         true if renderHeader emits a link to this route ANYWHERE in
 *                 the server-rendered header (top-level item, disclosure-panel
 *                 item, panel foot/aside link, or the header CTA). See the
 *                 HEADER COMPOSITION map below for exactly where each one goes.
 *   inFooter      true if renderFooter links it. True for all 20 indexable
 *                 routes — including BOTH service hubs, which were the only two
 *                 routes the export's footer omitted while linking all ten of
 *                 their children. False only for /404/.
 *   inSitemapXml  true -> a <url> entry. False for /404/ only.
 *   inLlms        true -> a line in llms.txt and a section in llms-full.txt.
 *                 False for /404/ only. All three artifacts read the same flags
 *                 so they cannot drift.
 *   group         'main' | 'lab-solutions' | 'management-services' | 'legal'
 *                 | 'system'. Drives footer column grouping, llms.txt headings,
 *                 the mega-panel a route belongs to, and relatedRoutes()'
 *                 group-peer fallback.
 *   icon          Key into navIcons (bottom of this file), or null. Lifted from
 *                 the export's own ICONS/LAB_SERVICES/MGMT_SERVICES/SEARCH_INDEX
 *                 mapping so the rebuilt panels show the same glyphs.
 *   summary       One plain-text sentence. Three consumers: the llms.txt
 *                 '- [Title](url): summary' line, the mega-panel item blurb and
 *                 the related-links card. Keep it short enough to render as a
 *                 two-line panel blurb.
 *   keywords      Search tokens ONLY. They are compiled into
 *                 /assets/search-index.<hash>.json, which replaces the
 *                 hand-written 24-record SEARCH_INDEX in mega-menu.js (24
 *                 records, only 20 unique hrefs, and those 20 are exactly the
 *                 canonical non-404 routes — i.e. it was always derivable).
 *                 These are NEVER emitted as <meta name="keywords">: that tag
 *                 appears on 4 export pages and Google has ignored it since
 *                 2009. renderHeadTags must not emit it.
 *
 * HEADER COMPOSITION (what inNav:true means for each route)
 *   /                      top-level nav item "Home"
 *   /services/lab-solutions/       disclosure trigger (button, aria-controls
 *                                  #mm-lab-panel) + the panel aside link
 *   ...its 5 children              items inside #mm-lab-panel
 *   /services/management-services/ disclosure trigger (#mm-mgmt-panel) + aside
 *   ...its 5 children              items inside #mm-mgmt-panel
 *   /about/, /our-team/            items inside #mm-about-panel (its trigger is
 *                                  a GROUP label, "About", not a route)
 *   /services/                     the "View all services" link in BOTH panel
 *                                  feet — addressed by id, not by iteration
 *   /contact/                      the header CTA and the mobile-only nav item.
 *                                  Emit as a plain <a href="/contact/#consult">
 *                                  with NO role="button": the export put
 *                                  role="button" on an <a href>, which
 *                                  overrides the link role and breaks
 *                                  middle-click and open-in-new-tab.
 *
 * The three disclosure trigger labels ("Lab Solutions", "Management",
 * "About") are group labels in the export, not route labels. Two of them are
 * normalised here: the trigger for /services/management-services/ renders its
 * navLabel, "Management Services", rather than the export's shortened
 * "Management", so the trigger, the panel heading, the footer column, the
 * breadcrumb and the BreadcrumbList item can never say different things. The
 * About trigger has no route and stays a literal group label in render.mjs.
 */
export const routes = [
  // ---------------------------------------------------------------------------
  // MAIN
  // ---------------------------------------------------------------------------
  {
    id: 'home',
    path: '/',
    parent: null,
    title: 'IVF Lab Management & ART Practice Solutions | MedTech',
    navLabel: 'Home',
    // Rewritten from 192 chars. Dropped the redundant leading brand mention
    // (og:site_name already carries it) and kept every service noun.
    description:
      'IVF laboratory management and ART practice solutions: monitoring, compliance, staffing, GPO purchasing, and practice management. Book a consultation.',
    priority: 1.0,
    changefreq: 'weekly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'main',
    icon: 'server',
    summary:
      'End-to-end IVF laboratory management and ART practice solutions for fertility clinics — monitoring, compliance, staffing, GPO purchasing, and practice development.',
    keywords: ['home', 'medtech', 'IVF', 'ART', 'laboratory management', 'fertility clinic', 'solutions', 'overview'],
    // NOTE: home is the only route with an FAQPage node in the export (six
    // visible questions). Keep it; emit FAQPage ONLY where a visible FAQ exists.
    // /contact/ has seven visible answers and no markup — that is the one other
    // page that qualifies.
    // NOTE: breadcrumbTrail() must emit NO BreadcrumbList here. The export
    // shipped a useless 1-item [Home] stub.
  },
  {
    id: 'about',
    path: '/about/',
    parent: 'home',
    // Shortened from 71 chars ("About MedTech For Solutions | IVF & ART Industry
    // Specialists Since 2005") to 57 while keeping both verticals and the year.
    title: 'About MedTech For Solutions | ART & IVF Experts Since 2005',
    navLabel: 'About Us',
    // Rewritten from 214 chars, which truncated in SERPs at "...technology
    // (ART)." — losing exactly the geographic and audience signal. Kept.
    description:
      'Consulting firm founded in 2005, specializing exclusively in assisted reproductive technology. Based in White Plains, NY, serving fertility clinics nationwide.',
    priority: 0.8,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'main',
    icon: 'userGroup',
    summary:
      'Our mission, history, and values — a consultancy founded in 2005 and built exclusively for the assisted reproductive technology industry.',
    keywords: ['about', 'company', 'mission', 'history', 'founded 2005', 'White Plains', 'New York', 'overview', 'vision'],
  },
  {
    id: 'our-team',
    path: '/our-team/',
    parent: 'home',
    title: 'Our Team | MedTech For Solutions ART Industry Experts',
    // Was "Staff" in the export's BreadcrumbList — the ONLY place that name
    // appeared, contradicting the title, the h1 and the footer link.
    navLabel: 'Our Team',
    description:
      "Meet MedTech For Solutions' leadership team — 30+ years of combined ART expertise spanning IVF lab management, embryology, compliance, and practice development.",
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'main',
    icon: 'users',
    summary:
      'Meet the MedTech specialists — executive leadership and ART practitioners across embryology, compliance, staffing, and practice development.',
    keywords: ['team', 'staff', 'leadership', 'Dwight Ryan', 'Kathleen Miller', 'experts', 'embryology', 'specialists', 'executive'],
    // !! BLOCKING CONTENT ISSUE (AISEO-01): this page names six further
    // "specialists" with no bio, headshot, credential link or Person schema,
    // two of them carrying clinical directorship credentials — HCLD(ABB),
    // ELD(ABB) — and one holding two conflicting titles on the same page. Do
    // not ship unverified named individuals with claimed clinical credentials
    // on a healthcare-services site. Verify with the client or remove the
    // names. Dwight Ryan and Kathleen Miller have real, checkable bios and
    // should gain Person nodes with jobTitle/worksFor/sameAs.
    // !! Also: "Certifications: AABB, CLIA, ASRM" is a category error — none of
    // the three is a personal credential.
  },
  {
    id: 'contact',
    path: '/contact/',
    parent: 'home',
    title: 'Contact MedTech For Solutions | Schedule a Consultation',
    navLabel: 'Contact',
    // Rewritten from 179 chars. Address shortened to city/state; the full
    // PostalAddress is in the Organization node and on the page itself.
    description:
      "Schedule a consultation with MedTech's ART specialists. Call (866) 634-9144, email info@medtech4solutions.com, or visit us in White Plains, NY.",
    priority: 0.8,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'main',
    icon: 'phone',
    summary:
      "Schedule a consultation with MedTech's ART specialists by phone, email, or online inquiry.",
    keywords: ['contact', 'schedule', 'consultation', 'phone', 'email', 'address', 'reach', 'talk', 'appointment', '866-634-9144'],
    // This is the header CTA target. SSR it as href="/contact/#consult" so the
    // lazily-loaded consultation modal has a no-JS reachable fallback: with
    // scripting off the visitor lands on the real contact page instead of
    // clicking a button that does nothing. The #consult hash trigger does NOT
    // exist in the export — it is a deliberate addition.
    // geo.region / geo.placename meta belong on THIS page (the one with an
    // address, coordinates and opening hours), not on /, /our-team/ and
    // /sitemap/ where the export put them.
    // FAQPage: seven genuinely useful visible answers here, zero markup. This
    // is the one page that should gain FAQPage JSON-LD.
  },
  {
    id: 'services',
    path: '/services/',
    parent: 'home',
    title: 'Services for Fertility Clinics | MedTech For Solutions',
    navLabel: 'Services',
    // Rewritten from 189 chars.
    description:
      "MedTech's full service suite for fertility clinics: IVF lab management, monitoring, regulatory compliance, staffing, GPO purchasing, and practice development.",
    priority: 0.9,
    changefreq: 'weekly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'main',
    icon: 'trending',
    summary:
      'A full suite of laboratory and management services designed exclusively for fertility clinics and IVF programs.',
    keywords: ['services', 'all services', 'lab solutions', 'management', 'overview', 'what we do'],
    // Linked from BOTH mega-panel feet as "View all services". It is the
    // parent of both hubs, so breadcrumbTrail() inserts it automatically into
    // all 12 /services/** trails — the tier 12 hand-written BreadcrumbLists
    // omitted entirely.
    // 10 of the export's 26 "Learn More" anchors are on this page. navLabel of
    // the destination route replaces every one of them.
  },

  // ---------------------------------------------------------------------------
  // LAB SOLUTIONS — hub + 5 children, in mega-panel order
  // ---------------------------------------------------------------------------
  {
    id: 'lab-solutions',
    path: '/services/lab-solutions/',
    parent: 'services',
    title: 'IVF Laboratory Solutions | MedTech For Solutions',
    // The export used three different names for this one route: nav trigger
    // "Lab Solutions", panel/breadcrumb "Laboratory Solutions", footer column
    // "Lab Solutions". One label now, everywhere.
    navLabel: 'Lab Solutions',
    // Rewritten from 187 chars.
    description:
      'Complete IVF laboratory solutions: real-time monitoring, FDA/CLIA/CAP compliance, certified staffing, GPO purchasing, and practice development for ART labs.',
    priority: 0.8,
    changefreq: 'monthly',
    // inFooter was effectively FALSE in the export: this hub and its sibling
    // were the ONLY two routes the site-wide footer omitted, while all ten of
    // their children were in it — so every child had 33 inbound page-sources
    // against its own parent's 10. With the nav 100% JS-injected, that static
    // graph was the entire crawlable graph.
    inFooter: true,
    inNav: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'lab-solutions',
    icon: 'monitor',
    summary:
      'Comprehensive laboratory solutions including monitoring, compliance, staffing, GPO purchasing, and practice development for IVF facilities.',
    keywords: ['lab', 'laboratory', 'solutions', 'IVF lab', 'ART lab', 'design', 'construction'],
  },
  {
    id: 'real-time-monitoring',
    path: '/services/lab-solutions/real-time-monitoring/',
    parent: 'lab-solutions',
    title: 'Real-Time IVF Lab Monitoring | MedTech For Solutions',
    navLabel: 'Real-Time Monitoring',
    // Rewritten from 178 chars.
    description:
      "Monitor your IVF lab in real time with MedTech's OvaTools platform: incubators, cryogenic tanks, and equipment, with instant alerts and compliance reporting.",
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'lab-solutions',
    icon: 'monitor',
    summary:
      '24/7 OvaTools real-time monitoring with QC dashboards, equipment tracking, and automated alerts for IVF laboratory environments.',
    // The export's SEARCH_INDEX carried a SECOND record for this same href,
    // titled "OvaTools LMS". Its alias tokens are folded in here so dedup to 20
    // unique hrefs loses no search coverage, exactly as required.
    keywords: [
      'monitoring', 'real-time', 'OvaTools', 'LMS', 'laboratory management system',
      'QC', 'quality control', 'dashboard', '24/7', 'equipment tracking', 'temperature', 'alert',
    ],
  },
  {
    id: 'regulatory-compliance',
    path: '/services/lab-solutions/regulatory-compliance/',
    parent: 'lab-solutions',
    // Was 45 chars and brand-dominated ("Regulatory Compliance | MedTech For
    // Solutions") with 21 chars of signal and no vertical. The page's own h1
    // names the vertical; lifted into the title.
    title: 'IVF Lab Regulatory Compliance | MedTech For Solutions',
    navLabel: 'Regulatory Compliance',
    // Rewritten from 161 chars.
    description:
      'Regulatory compliance for ART and IVF laboratories: FDA, CLIA, CAP, and AABB compliance reporting and audit preparation from MedTech For Solutions.',
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'lab-solutions',
    icon: 'shield',
    summary:
      'FDA, CLIA, CAP, and AABB regulatory readiness — audit preparation, compliance programs, and ongoing quality management for ART laboratories.',
    keywords: ['compliance', 'regulatory', 'FDA', 'CLIA', 'CAP', 'AABB', 'audit', 'inspection', 'accreditation', 'standards'],
    // !! CONTENT (AISEO-02): delete "with 100% accuracy" from this page's copy.
    // !! CONTENT (AISEO-05): this page repeats the bare string "FDA, CLIA, CAP,
    // AABB" five times and expands none of them. Zero expansions exist
    // site-wide. Real definitions belong in this page's prose.
  },
  {
    id: 'staffing-solutions',
    path: '/services/lab-solutions/staffing-solutions/',
    parent: 'lab-solutions',
    title: 'IVF & ART Laboratory Staffing Solutions | MedTech',
    navLabel: 'Staffing Solutions',
    // Rewritten from 162 chars.
    description:
      'Fill critical IVF lab roles fast with certified ART staffing — TS (ABB) embryologists and HCLD off-site directors for fertility clinics nationwide.',
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'lab-solutions',
    icon: 'users',
    summary:
      'TS (ABB) certified embryologists and HCLD off-site directors — temporary staffing placement for fertility clinics and IVF labs.',
    keywords: ['staffing', 'staff', 'embryologist', 'HCLD', 'TS ABB', 'certified', 'temporary', 'recruitment', 'hire', 'placement'],
    // !! CONTENT (AISEO-10): this page's stat tile reads "50+ States Covered".
    // There are 50. Every other page says "all 50 states". Change to
    // "All 50 States".
  },
  {
    id: 'gpo-purchasing',
    path: '/services/lab-solutions/gpo-purchasing/',
    parent: 'lab-solutions',
    title: 'GPO Purchasing for Fertility Clinics | MedTech For Solutions',
    navLabel: 'GPO Purchasing',
    // Rewritten from 178 chars. Both figures kept: "1,800+" appears on 6 pages
    // and "300+" on 5, consistently, and both are countable business facts.
    description:
      "Join MedTech's GPO free of charge and access 1,800+ vendor contracts for IVF lab supplies and equipment. Pool buying power with 300+ fertility practices.",
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'lab-solutions',
    icon: 'cart',
    summary:
      'Free to join — pool buying power with 300+ IVF practices and access 1,800+ vendor contracts for lab supplies, equipment, and services.',
    // Vendor tokens are kept as SEARCH tOKENS only (they were already in the
    // export's SEARCH_INDEX) so searching "Nikon" keeps working. They are not
    // published copy. See the vendor-roster open issue below.
    keywords: [
      'GPO', 'group purchasing', 'group purchasing organization', 'vendor', 'contracts',
      'savings', 'pricing', 'supplies', 'procurement', 'buying power',
      'Staples', 'FedEx', 'Roche', 'Nikon', 'Olympus', 'GE',
    ],
    // !! CONTENT (AISEO-07): all three "Become a Member" CTAs point off-site to
    // register.provista.com, yet "Provista" appears 0 times in the copy, 0 times
    // in JSON-LD and 0 times in llms-full.txt — while a testimonial still says
    // members are "affiliated with Broadlane", a brand that has not traded under
    // that name for over a decade. Name Provista in the copy, explain the
    // aggregation relationship, add rel="noopener" to the registration links,
    // and either retire or date-stamp the Broadlane quote.
    // !! CONTENT: three vendor rosters on three pages disagree, including
    // "NexGen" vs "NextGen". Reconcile to one canonical list.
    // This page also holds the 26th "Learn More" anchor.
  },
  {
    id: 'practice-development',
    path: '/services/lab-solutions/practice-development/',
    parent: 'lab-solutions',
    title: 'IVF Practice Development Services | MedTech For Solutions',
    navLabel: 'Practice Development',
    // Rewritten from 184 chars.
    description:
      'Launch or grow your fertility practice with IVF lab design, new practice startups, growth strategy, staff training, and hands-on implementation support.',
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'lab-solutions',
    icon: 'trending',
    summary:
      'IVF lab design, construction oversight, workflow optimization, and team training for new and growing fertility practices.',
    keywords: ['practice development', 'lab design', 'construction', 'optimization', 'training', 'build', 'new lab', 'renovation', 'consulting'],
    // !! CONTENT (AISEO-02): "Our laboratories consistently achieve outcome
    // results that exceed national benchmarks" names no benchmark, cohort,
    // period or metric. It is a YMYL-adjacent clinical-outcome claim and must
    // be removed unless it can be published with its basis. The same sentence
    // appears again on /about/.
  },

  // ---------------------------------------------------------------------------
  // MANAGEMENT SERVICES — hub + 5 children, in mega-panel order
  // ---------------------------------------------------------------------------
  {
    id: 'management-services',
    path: '/services/management-services/',
    parent: 'services',
    title: 'Management Services | MedTech For Solutions',
    // The nav trigger said "Management"; the panel heading, footer column and
    // BreadcrumbList said "Management Services". Normalised to the full form so
    // the trigger, panel, footer, breadcrumb and structured data all agree.
    navLabel: 'Management Services',
    description:
      'Comprehensive fertility practice management services: marketing, call center, accounting, HR, and risk management from MedTech For Solutions.',
    priority: 0.8,
    changefreq: 'monthly',
    // Second of the two hubs the export's footer omitted. See lab-solutions.
    inFooter: true,
    inNav: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'management-services',
    icon: 'book',
    summary:
      'Five management service lines — marketing, call center, accounting, HR, and insurance — supporting the business operations of fertility practices.',
    keywords: ['management', 'services', 'operational support', 'practice management', 'business', 'marketing', 'accounting', 'HR', 'insurance'],
  },
  {
    id: 'marketing',
    path: '/services/management-services/marketing/',
    parent: 'management-services',
    // Was 33 chars with 9 of signal ("Marketing | MedTech For Solutions").
    // Vertical lifted from the page's own description.
    title: 'Fertility Clinic Marketing | MedTech For Solutions',
    navLabel: 'Marketing',
    // Rewritten from 163 chars.
    description:
      'Data-driven marketing for fertility clinics and IVF practices: digital marketing, patient acquisition, and brand development from MedTech For Solutions.',
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'management-services',
    icon: 'megaphone',
    summary:
      'Patient-acquisition campaigns, digital strategy, and brand development built specifically for fertility clinic growth.',
    keywords: ['marketing', 'patient acquisition', 'digital', 'SEO', 'advertising', 'campaigns', 'brand', 'website', 'social media', 'fertility marketing'],
    // !! CONTENT (AISEO-08): this page carries TWO mutually contradictory
    // unsourced stat panels — "3x Patient Leads / 40% Higher Conversions"
    // against "+185% Organic Traffic / 3.2x Lead Volume / 42% Conv. Rate /
    // $12 Cost/Lead" — with no client, cohort, timeframe or methodology. All
    // six figures must be deleted until real attributed numbers exist. None of
    // them is restated in `summary` above, on purpose.
    // The five home-page "Learn More" anchors that Lighthouse actually failed
    // point at this route and its four siblings; navLabel now supplies the
    // visible text and the aria-label is deleted.
  },
  {
    id: 'call-center',
    path: '/services/management-services/call-center/',
    parent: 'management-services',
    // Was 35 chars with 11 of signal. Vertical lifted from the page's own h1.
    title: 'Fertility Clinic Call Center | MedTech For Solutions',
    navLabel: 'Call Center',
    description:
      'Dedicated call center solutions for fertility clinics. Professional patient scheduling, inquiry handling, and communication management by MedTech For Solutions.',
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'management-services',
    icon: 'phone',
    summary:
      'Dedicated call center operations staffed by fertility-trained agents handling patient inquiries, scheduling, and follow-up.',
    keywords: ['call center', 'phone', 'patient inquiry', 'intake', 'scheduling', 'empathetic', 'communication', 'support'],
  },
  {
    id: 'accounting-finance',
    path: '/services/management-services/accounting-finance/',
    parent: 'management-services',
    // Was 44 chars with 20 of signal and no vertical.
    title: 'Accounting & Finance for IVF Practices | MedTech',
    navLabel: 'Accounting & Finance',
    description:
      'Accounting and financial management services for fertility practices. Budgeting, forecasting, and financial oversight from MedTech For Solutions.',
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'management-services',
    icon: 'book',
    summary:
      'Financial oversight, budgeting, revenue reporting, and forecasting tailored to fertility practice financial management.',
    keywords: ['accounting', 'finance', 'financial', 'reporting', 'budgeting', 'forecasting', 'revenue', 'billing', 'CFO', 'bookkeeping'],
  },
  {
    id: 'human-resources',
    path: '/services/management-services/human-resources/',
    parent: 'management-services',
    // Was 39 chars with 15 of signal. Vertical lifted from the page's own h1.
    title: 'HR Services for Fertility Clinics | MedTech For Solutions',
    navLabel: 'Human Resources',
    // Rewritten from 170 chars.
    description:
      'Human resources management for fertility clinics and IVF practices: recruitment, compliance, performance management, and workforce development.',
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'management-services',
    icon: 'userGroup',
    summary:
      'Recruitment, onboarding, performance management, and HR compliance for fertility clinic workforce needs.',
    keywords: ['HR', 'human resources', 'recruitment', 'hiring', 'onboarding', 'performance', 'employee', 'handbook', 'benefits'],
  },
  {
    id: 'insurance-risk-management',
    path: '/services/management-services/insurance-risk-management/',
    parent: 'management-services',
    title: 'Insurance & Risk Management | MedTech For Solutions',
    // The footer truncated this to "Risk Management". The full label is used
    // everywhere now — link text must name the destination.
    navLabel: 'Insurance & Risk Management',
    description:
      'Professional liability insurance and risk management for IVF and ART practices. Tailored coverage and compliance protection from MedTech For Solutions.',
    priority: 0.7,
    changefreq: 'monthly',
    inNav: true,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'management-services',
    icon: 'lock',
    summary:
      'Professional liability insurance and risk management programs designed specifically for ART practices and IVF laboratories.',
    keywords: ['insurance', 'risk management', 'liability', 'professional liability', 'malpractice', 'coverage', 'protection', 'ART risk'],
    // strip-builder-ids also removes the stray itemscope/itemtype="…/WebPage"
    // attribute on <html> here — one of 4 pages carrying microdata that
    // duplicates or contradicts the JSON-LD. JSON-LD is the only vocabulary.
  },

  // ---------------------------------------------------------------------------
  // LEGAL
  // ---------------------------------------------------------------------------
  {
    id: 'privacy-policy',
    path: '/privacy-policy/',
    parent: 'home',
    title: 'Privacy Policy | MedTech For Solutions',
    navLabel: 'Privacy Policy',
    // Rewritten from 211 chars.
    description:
      'How MedTech For Solutions collects, uses, and protects personal and health information across its IVF laboratory management, staffing, and GPO services.',
    priority: 0.3,
    changefreq: 'yearly',
    inNav: false,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'legal',
    icon: 'lock',
    summary:
      'How MedTech For Solutions collects, uses, and protects personal information across its website and services.',
    keywords: ['privacy', 'policy', 'data', 'personal information', 'HIPAA', 'legal'],
  },
  {
    id: 'terms-of-service',
    path: '/terms-of-service/',
    parent: 'home',
    title: 'Terms of Use | MedTech For Solutions',
    // The export's BreadcrumbList said "Terms of Service" while the <title> and
    // <h1> both say "Terms of Use". The path stays /terms-of-service/ (it is a
    // live canonical URL and must not change); only the LABEL is aligned.
    navLabel: 'Terms of Use',
    // Rewritten from 198 chars.
    description:
      "The terms governing access to medtech4solutions.com and MedTech For Solutions' IVF laboratory management, practice development, staffing, and GPO services.",
    priority: 0.3,
    changefreq: 'yearly',
    inNav: false,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'legal',
    icon: 'book',
    summary:
      'The terms and conditions governing use of the MedTech For Solutions website and services.',
    keywords: ['terms', 'terms of service', 'terms of use', 'conditions', 'agreement', 'legal', 'use'],
    // !! CONTENT (AISEO-11): the trademark clause names "OvaTools Training
    // Institute", a product that appears nowhere else on the site. Build it out
    // or remove it from this page.
  },
  // ---------------------------------------------------------------------------
  // SYSTEM — /sitemap/ is indexable; /404/ is not, and is the only route
  // excluded from the footer, sitemap.xml and llms.txt.
  // ---------------------------------------------------------------------------
  {
    id: 'sitemap',
    path: '/sitemap/',
    parent: 'home',
    title: 'Sitemap | MedTech For Solutions',
    navLabel: 'Sitemap',
    // Rewritten from 186 chars.
    description:
      'Browse every page on medtech4solutions.com: IVF laboratory management, ART practice solutions, staffing, compliance, GPO purchasing, and management services.',
    priority: 0.4,
    changefreq: 'monthly',
    inNav: false,
    inFooter: true,
    inSitemapXml: true,
    inLlms: true,
    group: 'system',
    icon: 'book',
    summary:
      'A directory of every page on the MedTech For Solutions website, organized by section.',
    keywords: ['sitemap', 'site map', 'all pages', 'index', 'directory', 'navigation'],
    // This page must STOP linking /404/ (it is that page's only inbound link,
    // and /404/ returns HTTP 200). It legitimately links /sitemap.xml with the
    // anchor text "XML sitemap" — the single internal href in the whole export
    // that is not a route, which is why validate.mjs needs EXTRA_ALLOWED_PATHS.
    // Its three <p class="sm-sec-title"> section titles must become <h2> and
    // its <div class="sm-card-head"> card titles <h3>: the page currently
    // outlines h1 -> h2 -> h2 -> h4.
  },
  {
    id: 'not-found',
    path: '/404/',
    parent: 'home',
    title: 'Page Not Found (404) | MedTech For Solutions',
    navLabel: 'Page Not Found',
    description:
      "The page you're looking for can't be found. Return home or explore MedTech For Solutions' IVF laboratory management and ART practice solutions.",
    // priority/changefreq are inert here (inSitemapXml is false) but are kept
    // non-null so the route object has a uniform shape for validate.mjs.
    priority: 0.0,
    changefreq: 'yearly',
    inNav: false,
    // The ONLY route excluded from the footer, the sitemap and llms.txt.
    // In the export it was linked from /sitemap/ and shipped a self-referencing
    // rel=canonical — a crawlable, HTTP-200 error page. Both must stop.
    inFooter: false,
    inSitemapXml: false,
    inLlms: false,
    group: 'system',
    icon: null,
    summary:
      'Error page served when a URL does not exist. Not indexed, not listed in the sitemap or in llms.txt.',
    keywords: [],
    // renderHeadTags emits 'noindex, follow' here and the uniform
    // 'index, follow, max-image-preview:large, max-snippet:-1' on the other 20.
    // No rel=canonical on this page.
    // breadcrumbTrail() emits no BreadcrumbList here.
  },
];

// =============================================================================
// SECTION 3 — redirects
// =============================================================================
/**
 * Every legacy path 301 from the export's _redirects, reproduced 1:1 — both the
 * bare and the trailing-slash form of each source, exactly as the export listed
 * them. The comment in the original file claimed sources "match with or without
 * trailing slash", but both forms were written out anyway; keeping both means
 * the rules still work on a host that does not normalise.
 *
 * WHAT CHANGED, AND WHY
 *  1. TARGET NORMALISATION. The export mixed two conventions: 8 of 22 rules
 *     (/who-we-are, /gpo, /gpo-registration, /recruitment and their slashed
 *     twins) pointed at slash-LESS URLs, while /practice, /temp-staff,
 *     /laboratory-solutions and /policy pointed at the canonical trailing-slash
 *     form. /gpo and /practice — five lines apart, into the same subtree —
 *     disagreed. Since every canonical route ends in '/', a slash-less target
 *     resolves as 301 -> 301 (or 301 -> 404 on a host that does not normalise),
 *     burning a hop on the highest-value legacy paths. Every `to` below is now
 *     an existing route path ending in '/', or a '/#fragment'. validate.mjs
 *     must assert exactly that.
 *  2. /untitled IS NOW 404, NOT 301. It used to 301 to /404/, which returns
 *     HTTP 200 — a soft 404 that reports "permanently moved to a valid page" to
 *     Google. status 404 makes the platform serve the /404/ body with a 404
 *     status. (Deleting the rule and letting default 404 handling take it is
 *     equally correct; this form keeps the branded error page.)
 *
 * /testimonials -> '/#testimonials' is a fragment, not a route. The id
 * `testimonials` does exist on the home page (verified in the export), and
 * validate.mjs must check exactly that before allowing a '/#…' target.
 */
export const redirects = [
  { from: '/home', to: '/', status: 301 },
  { from: '/home/', to: '/', status: 301 },

  // was -> /about  (no trailing slash)
  { from: '/who-we-are', to: '/about/', status: 301 },
  { from: '/who-we-are/', to: '/about/', status: 301 },

  { from: '/testimonials', to: '/#testimonials', status: 301 },
  { from: '/testimonials/', to: '/#testimonials', status: 301 },

  // was -> /services/lab-solutions/gpo-purchasing  (no trailing slash)
  { from: '/gpo', to: '/services/lab-solutions/gpo-purchasing/', status: 301 },
  { from: '/gpo/', to: '/services/lab-solutions/gpo-purchasing/', status: 301 },

  // was -> /services/lab-solutions/gpo-purchasing  (no trailing slash)
  { from: '/gpo-registration', to: '/services/lab-solutions/gpo-purchasing/', status: 301 },
  { from: '/gpo-registration/', to: '/services/lab-solutions/gpo-purchasing/', status: 301 },

  // was -> /services/lab-solutions/staffing-solutions  (no trailing slash);
  // /temp-staff below already used the canonical form for the same destination.
  { from: '/recruitment', to: '/services/lab-solutions/staffing-solutions/', status: 301 },
  { from: '/recruitment/', to: '/services/lab-solutions/staffing-solutions/', status: 301 },

  { from: '/practice', to: '/services/lab-solutions/practice-development/', status: 301 },
  { from: '/practice/', to: '/services/lab-solutions/practice-development/', status: 301 },

  { from: '/laboratory-solutions', to: '/services/lab-solutions/', status: 301 },
  { from: '/laboratory-solutions/', to: '/services/lab-solutions/', status: 301 },

  { from: '/temp-staff', to: '/services/lab-solutions/staffing-solutions/', status: 301 },
  { from: '/temp-staff/', to: '/services/lab-solutions/staffing-solutions/', status: 301 },

  { from: '/policy', to: '/privacy-policy/', status: 301 },
  { from: '/policy/', to: '/privacy-policy/', status: 301 },

  // was 301 -> soft 404. Now serves the /404/ body with a real 404 status.
  { from: '/untitled', to: '/404/', status: 404 },
  { from: '/untitled/', to: '/404/', status: 404 },
];

// =============================================================================
// SECTION 4 — headerRules
// =============================================================================
/**
 * Netlify-style _headers. Rules are emitted in array order; on a Netlify-style
 * host every matching rule applies and the MORE SPECIFIC path wins for a given
 * header name, so the catch-all '/*' is written LAST and its Cache-Control is
 * overridden by the /assets/* rule for assets.
 *
 * WHAT THE EXPORT GOT WRONG (both measured):
 *  1. '/*.html' matched NONE of the 20 pretty-URL documents. The site publishes
 *     /about/ , not /about.html, so 19 of 21 documents matched no rule at all
 *     and fell back to browser heuristic caching. Only '/' was covered. The
 *     fix is a '/*' catch-all beneath the asset rules.
 *  2. 'immutable' for a year was applied to FIVE unhashed filenames —
 *     /assets/mega-menu.css, /assets/mega-menu.min.js, /assets/mtfs-images.css,
 *     /assets/book-consultation-modal.min.js and /assets/css/fonts.css. The
 *     hand-rolled '?v=20260723' cache-buster already on the fonts.css <link>
 *     was the symptom. The export's root-level '/*.css', '/*.js', '/*.png' …
 *     rules are therefore NOT reproduced: they exist only to catch unhashed
 *     assets, which must never be immutable.
 *
 * INVARIANT THIS FILE DEPENDS ON: every asset the build emits under /assets/
 * is content-hashed by css.mjs::hashName (site.<hash>.css, nav.<hash>.js,
 * analytics.<hash>.js, consult-modal.<hash>.js, search-index.<hash>.json, and
 * hashed images under /assets/img/). 'immutable' is safe ONLY because of that.
 * If an unhashed file is ever written into /assets/, this rule will pin a stale
 * copy in every visitor's browser for a year. sync.mjs must assert the
 * invariant, not assume it.
 *
 * COMPRESSION: compress.mjs pre-writes .gz and .br beside every .html/.css/.js/
 * .txt/.xml/.json (llms-full.txt at 112,391 B included — it matched no rule at
 * all before). Netlify-style hosts negotiate those automatically, so NO
 * Content-Encoding header is set here: setting one by hand would mislabel the
 * uncompressed variant for clients that do not send Accept-Encoding.
 *
 * The export set no security headers of any kind. The five below are added.
 */
export const headerRules = [
  {
    // Every emitted build asset. Content-hashed => safe to freeze for a year.
    pattern: '/assets/*',
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  {
    // Unhashed, but stable and cheap: a week is a reasonable compromise, and it
    // is explicitly NOT immutable so a rebrand can land without a URL change.
    pattern: '/favicon.ico',
    headers: {
      'Cache-Control': 'public, max-age=604800',
    },
  },
  {
    // Crawler-facing artifacts. Short TTL: they must reflect a new deploy
    // quickly, but they are also fetched often enough to be worth an hour.
    pattern: '/sitemap.xml',
    headers: { 'Cache-Control': 'public, max-age=3600' },
  },
  {
    pattern: '/robots.txt',
    headers: { 'Cache-Control': 'public, max-age=3600' },
  },
  {
    pattern: '/llms.txt',
    headers: { 'Cache-Control': 'public, max-age=3600' },
  },
  {
    pattern: '/llms-full.txt',
    headers: { 'Cache-Control': 'public, max-age=3600' },
  },
  {
    // CATCH-ALL — must stay last. Covers all 20 pretty-URL documents plus
    // anything not matched above, and carries the security headers.
    pattern: '/*',
    headers: {
      // Documents revalidate on every request so content edits go live at once.
      // This replaces the export's per-page
      // <meta http-equiv="Cache-Control" content="no-cache, no-store,
      // must-revalidate"> + Pragma + Expires trio, which defeated the whole
      // _headers policy and forced a full re-download every visit. Those three
      // meta tags are removed by the strip-nocache-meta pass.
      'Cache-Control': 'public, max-age=0, must-revalidate',

      // Stops content-type sniffing from turning a mislabelled asset into an
      // executable response.
      'X-Content-Type-Options': 'nosniff',

      // Send the full URL same-origin, origin-only cross-origin, nothing on a
      // downgrade. Keeps referral attribution while leaking no path data to
      // third parties.
      'Referrer-Policy': 'strict-origin-when-cross-origin',

      // 2 years, subdomains included, preload-eligible. Only safe because the
      // site is HTTPS-only on every host and subdomain.
      // !! Submitting to the HSTS preload list is IRREVERSIBLE in practice
      // (removal takes months). Confirm with the operator before the first
      // deploy that no subdomain will ever need plain HTTP.
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

      // The site uses none of these. Denying them shrinks the attack surface of
      // any third-party script (GTM can inject arbitrary tags by design).
      'Permissions-Policy':
        'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), usb=()',

      // Legacy clickjacking control. CSP frame-ancestors supersedes it, but the
      // report-only CSP below is not enforcing, so this is the live protection.
      // SAMEORIGIN, not DENY: the GTM noscript <iframe> and any future preview
      // must still work.
      'X-Frame-Options': 'SAMEORIGIN',
    },
  },

  // ---------------------------------------------------------------------------
  // OPT-IN: report-only Content Security Policy (COMMENTED OUT ON PURPOSE)
  // ---------------------------------------------------------------------------
  // A CSP is NOT enabled by default because Google Tag Manager's entire value
  // proposition is injecting arbitrary tags at runtime: any policy tight enough
  // to be useful will break a tag the marketing team adds later, silently, in
  // production. The safe sequence is: enable REPORT-ONLY, collect violations at
  // a real report endpoint for a full release cycle, then promote to enforcing.
  //
  // To opt in: set report-uri/report-to to a real collector, uncomment the
  // object below, and place it BEFORE the '/*' catch-all above (a
  // Content-Security-Policy-Report-Only header on '/*' is fine; it is listed
  // separately only so it can be toggled in one edit).
  //
  // Notes on the source list, all of which are load-bearing for THIS site:
  //   'unsafe-inline' in script-src   — GTM's bootstrap snippet is inline, and
  //                                     GTM injects further inline tags. A
  //                                     nonce cannot cover tags GTM writes.
  //   *.googletagmanager.com, *.google-analytics.com, *.analytics.google.com
  //                                   — GTM container + the GA4 tags it loads.
  //   dashboard.fertilerank.com       — the Search Atlas dynamic-optimization
  //                                     script, which must keep working.
  //   api.builder.searchatlas.com     — connect-src for the LPS tracker's
  //                                     /api/track/ and /api/event/ beacons.
  //   media.cdn.builder.searchatlas.com — every image and all four woff2 fonts.
  //   'unsafe-inline' in style-src    — the critical CSS is inlined in <head>
  //                                     by design (it is what prevents the
  //                                     multi-thousand-pixel first-paint jump).
  //
  // {
  //   pattern: '/*',
  //   headers: {
  //     'Content-Security-Policy-Report-Only': [
  //       "default-src 'self'",
  //       "base-uri 'self'",
  //       "object-src 'none'",
  //       "frame-ancestors 'self'",
  //       "form-action 'self'",
  //       "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://dashboard.fertilerank.com",
  //       "style-src 'self' 'unsafe-inline'",
  //       "img-src 'self' data: https://media.cdn.builder.searchatlas.com https://www.googletagmanager.com https://www.google-analytics.com",
  //       "font-src 'self' https://media.cdn.builder.searchatlas.com",
  //       "connect-src 'self' https://api.builder.searchatlas.com https://www.google-analytics.com https://analytics.google.com https://dashboard.fertilerank.com",
  //       "frame-src https://www.googletagmanager.com",
  //       'report-uri https://REPLACE-ME.example/csp-reports',
  //     ].join('; '),
  //   },
  // },
];

// =============================================================================
// SECTION 5 — navIcons
// =============================================================================
/**
 * The inline SVG sprite, lifted verbatim from the export's assets/mega-menu.js
 * ICONS object — same paths, same viewBoxes, same stroke widths, so the rebuilt
 * panels render pixel-identically.
 *
 * TWO NORMALISATIONS, both required by the contract:
 *   1. width="24" height="24" removed from every <svg> root. They were always
 *      dead weight: mega-menu.css already sizes every icon at its use site
 *      (.mm-item-ico svg 18px, .mm-phone svg 16px, .mm-cta svg 14px,
 *      .mm-panel-feature svg 14px, .mm-panel-foot svg 14px, .mm-back-to-top svg
 *      20px, .mm-search-btn svg 16px, .mm-result-ico svg 18px, .mm-suggest-chip
 *      svg 13px, .mm-no-results svg 40px), so the attributes were overridden
 *      everywhere. Removing them is visually a no-op and stops a hard-coded
 *      24px from ever leaking into a new use site.
 *   2. stroke="currentColor" is kept (it was already correct) so an icon
 *      inherits its container's colour — which is what lets the hover and
 *      focus-visible rules that replace the stripped inline on* handlers
 *      recolour the icon and its label together, with one declaration.
 *
 * Each string also carries aria-hidden="true" focusable="false": these are
 * decorative glyphs that always sit beside real text, so they must stay out of
 * the accessibility tree and out of the tab order (focusable="false" is the
 * legacy-IE/Edge guard and is harmless elsewhere). Never add a <title> to one
 * of these — that would give it an accessible name and double-announce the
 * label next to it.
 *
 * WARNING: these strings are injected into HTML unescaped by render.mjs. They
 * are trusted build-time constants, not user input. Keep them free of single
 * quotes so they stay embeddable in single-quoted JS, and never interpolate a
 * runtime value into one.
 */
export const navIcons = {
  // Bar-chart glyph. Routes: lab-solutions (hub), real-time-monitoring.
  monitor:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
  // Shield + check. Route: regulatory-compliance.
  shield:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
  // Group of three. Routes: staffing-solutions, our-team.
  users:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  // Shopping cart. Route: gpo-purchasing.
  cart:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>',
  // Rising arrow. Routes: services, practice-development.
  trending:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
  // Megaphone. Route: marketing.
  megaphone:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>',
  // Handset. Routes: call-center, contact — and the header phone link.
  phone:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
  // Open book. Routes: management-services (hub), accounting-finance, terms-of-service, sitemap.
  book:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
  // Single person + shoulders. Routes: about, human-resources.
  userGroup:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
  // Shield/lock. Routes: insurance-risk-management, privacy-policy.
  lock:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
  // Stacked server. Route: home.
  server:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>',
  // Right arrow. Decorative affordance inside panel aside/foot links and the header CTA. Not a route icon.
  arrowR:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  // Up arrow. The back-to-top button. Not a route icon.
  arrowU:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  // Chevron. The disclosure-trigger indicator. NOTE: viewBox is "0 0 12 8", not 24x24 — do not assume a square box when sizing it.
  caret:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 1l5 5 5-5"/></svg>',
  // Magnifier. The header search button, and the search overlay input row (which ships with the lazily-loaded search.js).
  search:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
  // Four-point star. The "AI Search" badge inside the lazily-loaded search overlay. Not a route icon.
  sparks:
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>',
};

// =============================================================================
// APPENDIX — OPEN ISSUES THIS FILE DELIBERATELY DOES NOT DECIDE
// =============================================================================
/**
 * Each of these is a fact the build cannot resolve on its own, because the
 * export contradicts itself and choosing a side would be guessing. They are
 * recorded here, next to the data they affect, so nobody "fixes" them silently.
 *
 *  1. FOUNDING YEAR — 2005 (six places, incl. the Organization node) vs 2006
 *     (Dwight Ryan's bio on /our-team/). site.foundingDate is 2005. Resolve
 *     with the client, then correct the outlier in page copy.
 *  2. STREET ADDRESS — "399 Knollwood Road" (21 footers + every JSON-LD)
 *     vs "399 Knollwood Road, Suite 303" (/contact/ only). site.address omits
 *     the suite. If the suite is real, add it HERE.
 *  3. EXPERIENCE FIGURE — "over 30 years of combined experience" (/our-team/),
 *     "30+ years serving the ART industry" (/our-team/), "over 125 years of
 *     collective multidisciplinary experience" (/about/), "two decades of
 *     hands-on ART expertise" (/), "30+ years of hands-on leadership
 *     experience" (/services/). A company founded in 2005 cannot have 30+ years
 *     of its own history, so at least some of these are collective staff-years.
 *     Pick one figure per meaning and label which it is. No `summary` in this
 *     file restates any of them.
 *  4. SERVICE COUNT — "10 Service Areas" (/ stat tile), "one service or all
 *     ten" (/ CTA), "Our 12 service areas" (/contact/). The route inventory has
 *     exactly 10 leaf services (5 lab + 5 management). Reconcile the copy
 *     against that.
 *  5. SIX UNVERIFIED NAMED SPECIALISTS on /our-team/ — see the note on that
 *     route. This is a ship blocker, not a nice-to-have.
 *  6. UNSOURCED CLAIMS — two "exceed national benchmarks" clinical-outcome
 *     sentences, "with 100% accuracy", two market-leadership superlatives, and
 *     all six /services/management-services/marketing/ panel figures. Remove
 *     until substantiated with cohort, period and basis.
 *  7. GPO AGGREGATOR — Provista is the actual registration destination and is
 *     named nowhere; a testimonial still cites "Broadlane". Three vendor
 *     rosters disagree ("NexGen" vs "NextGen"; Roche in one list only).
 *  8. sameAs — empty until the client supplies verified company profile URLs.
 *  9. TS (ABB) vs TS (AABB) — /about/ says AABB twice; five other pages say
 *     ABB. Different organisations: ABB (American Board of Bioanalysis) issues
 *     the TS/ELD/HCLD personnel certifications, AABB is a facility
 *     accreditation body. /about/ is wrong.
 * 10. LOGO INTRINSIC DIMENSIONS — unmeasurable from the build sandbox (the CDN
 *     is unreachable). site.logo carries the CSS layout box instead; see the
 *     comment there.
 *
 * WHAT THIS FILE MUST NEVER BE USED FOR
 *  - llms.txt / llms-full.txt do NOT affect Google Search ranking, indexing or
 *    AI Overview inclusion. Google Search ignores both files. They are emitted
 *    for third-party AI crawlers (ClaudeBot, GPTBot, ChatGPT-User,
 *    PerplexityBot) and must be labelled that way in robots.txt, the README and
 *    the files' own headers. Do not document them otherwise anywhere in this
 *    repository.
 *  - There is no AEO/GEO markup, chunk delimiter, or machine-only content
 *    variant that helps with Google. No such mechanism exists. The levers are
 *    ordinary SEO, semantic HTML, crawlability, page experience and genuinely
 *    useful content — which is what every field above is in service of.
 *  - No Review or AggregateRating JSON-LD on MedTech's own testimonials.
 *    Self-serving review markup for the hosting entity is disallowed by Google
 *    and ineligible for rich results. Render them as <blockquote> + <cite>.
 *  - No new routes. Not per question, not per keyword variant, not per city.
 */
