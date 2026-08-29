# Semantic HTML & Accessibility Audit — MedTech For Solutions export

**Subject:** page **bodies** of `/tmp/claude-0/-home-user-test/da065df0-1665-52a8-b803-716d1ee66e9a/scratchpad/src/source-export/`
(21 `<dir>/index.html` pages + `/404/index.html`), plus `assets/mega-menu.js`, `assets/mega-menu.css`,
`assets/book-consultation-modal.js`.
**Evidence:** the files themselves, plus the real Lighthouse 12.8.2 mobile run at
`/tmp/claude-0/-home-user-test/da065df0-1665-52a8-b803-716d1ee66e9a/scratchpad/lh-mobile.json`.
**Measured baseline (do not invent others):** Perf 99 / **A11y 91** / BP 96 / **SEO 92**;
DOM 903 elements, max depth 15, max child elements 14 on `body.mm-injected`.
**Failing audits in scope of this document:** `aria-allowed-attr`, `aria-progressbar-name`,
`heading-order`, `label-content-name-mismatch` (A11y) and `link-text` (SEO).

Every quoted fragment below is copied verbatim from the export; `data-lps-eid` attributes are shown
where they are load-bearing for identifying the node and elided (`…`) where they are noise.

---

## 1. Landmark inventory

### 1.1 Measured, per page

Counts are of *server-rendered* elements — i.e. what a crawler or a JS-disabled browser sees.

| Page | `<header>` | `<nav>` | `<main>` | `<aside>` | `<footer>` | skip link | `<section>` total / unlabelled |
|---|---|---|---|---|---|---|---|
| `/` | 0 | 0 | **1** | 0 | 1 | yes | 10 / 0 |
| `/about/` | 0 | 0 | **0** | 0 | 1 | no | 8 / 7 |
| `/our-team/` | 0 | 0 | **1** | 0 | 1 | yes | 7 / 6 |
| `/contact/` | 0 | 0 | **0** | 0 | 1 | no | 7 / 2 |
| `/services/` | 0 | 0 | **0** | 0 | 1 | no | 7 / 5 |
| `/services/lab-solutions/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 3 |
| `/services/lab-solutions/gpo-purchasing/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 4 |
| `/services/lab-solutions/practice-development/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 4 |
| `/services/lab-solutions/real-time-monitoring/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 4 |
| `/services/lab-solutions/regulatory-compliance/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 4 |
| `/services/lab-solutions/staffing-solutions/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 4 |
| `/services/management-services/` | 0 | 0 | **0** | 0 | 1 | no | 4 / 3 |
| `/services/management-services/accounting-finance/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 4 |
| `/services/management-services/call-center/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 4 |
| `/services/management-services/human-resources/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 4 |
| `/services/management-services/insurance-risk-management/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 4 |
| `/services/management-services/marketing/` | 0 | 0 | **0** | 0 | 1 | no | 5 / 4 |
| `/sitemap/` | 0 | **1** | **1** | 0 | 1 | yes | 6 / 5 |
| `/privacy-policy/` | 0 | 0 | **0** | **1** | 1 | no | 18 / 17 |
| `/terms-of-service/` | 0 | 0 | **0** | **1** | 1 | no | 23 / 22 |
| `/404/` | 0 | 0 | **0** | 0 | 1 | no | 1 / 1 |

### 1.2 Findings

**L-1 — There is no `<header>` and no `<nav>` in 20 of 21 pages' HTML.**
The only server-rendered `<nav>` in the whole export is the sitemap breadcrumb:

```html
<nav data-lps-eid="sitemap-index-e32" aria-label="Breadcrumb" class="sm-breadcrumb">
```

The entire site header — logo, primary navigation, mega panels, phone link, search dialog,
CTA, hamburger and back-to-top button — is a JavaScript string in `assets/mega-menu.js`
injected at runtime:

```js
document.body.insertAdjacentHTML('afterbegin', HEADER_HTML);
document.documentElement.classList.add('mm-injected');
document.body.classList.add('mm-injected');
```

Lighthouse's own `dom-size` node path confirms the injected header becomes the **first node of
`<body>`**: `1,HTML,1,BODY,0,HEADER,0,DIV,1,NAV,0,UL,1,LI,1,DIV,0,DIV,0,DIV,1,UL,0,LI,0,A,0,SPAN,0,svg,0,path`
(max depth 15, `selector: "a.mm-item > span.mm-item-ico > svg > path"`).

**L-2 — `<main>` is missing on 18 of 21 pages.**
Only `/`, `/our-team/` and `/sitemap/` carry `<main data-lps-eid="…" id="main" role="main">`.
On every other page the content sections are direct children of `<body>`, e.g. `/about/`:

```html
<body data-lps-eid="about-index-e24">
<!-- Google Tag Manager (noscript) -->
<noscript …><iframe … height="0" width="0" class="il1"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<section data-lps-eid="about-index-e25" class="hero mtfs-about-hero">
```

Consequence: no `main` landmark, no bypass target, and `htmlToMarkdown()` (contract
`artifacts.mjs`) has no reliable "main content" boundary to extract from.

**L-3 — The skip link exists on 3 pages and is defeated on all 3.**
Markup (identical on `/`, `/our-team/`, `/sitemap/`):

```html
<a data-lps-eid="index-e29" href="#main" onfocus="this.style.top='0'" onblur="this.style.top='-100%'" class="il2">Skip to main content</a>
```

`.il2{position:absolute;top:-100%;left:50%;transform:translateX(-50%);background:var(--teal);color:#fff;padding:12px 24px;border-radius:0 0 8px 8px;z-index:9999;font-weight:600}`

Because `mega-menu.js` inserts the header with `insertAdjacentHTML('afterbegin', …)`, the header is
placed **before** the skip link in the DOM. The first ten tab stops are therefore the logo, four nav
items, the phone link, the search button, the CTA and the hamburger — and only then "Skip to main
content", which by that point skips nothing. Lighthouse reports `skip-link` as
`scoreDisplayMode: "notApplicable"` — axe never evaluated it on this page.

**L-4 — `role` duplication.** `role="contentinfo"` is on all 21 `<footer>` elements and `role="main"`
on all 3 `<main>` elements. Both are implicit and redundant in HTML5.

**L-5 — `<section>` used as a styling `<div>`.** 111 of 146 server-rendered `<section>` elements have
neither `aria-label` nor `aria-labelledby`, so they are not exposed as `region` landmarks and the
element buys nothing over a `<div>`. The home page is the only page that labels all of its sections
(`aria-labelledby="h1" | "about-h" | "lab-h" | "why-h" | "mg-h" | "builtfor-h" | "tst-h" | "faq-h" |
"cta-h" | "mtfs-related-home"`). `/terms-of-service/` (22 unlabelled) and `/privacy-policy/`
(17 unlabelled) are the worst.

**L-6 — Visual headings marked up as paragraphs (sitemap).**

```html
<section data-lps-eid="sitemap-index-e38" class="sm-section white" id="main-pages">
  <div class="ctr">
    <p class="sm-sec-eyebrow">Navigation</p>
    <p class="sm-sec-title">Root, About, Team &amp; Contact</p>
```

The three sitemap section titles ("Root, About, Team & Contact" and its siblings under
`#lab-solutions` and `#management-services`) are `<p class="sm-sec-title">`, and each card title is a
`<div class="sm-card-head">`. The sitemap page therefore has an outline of exactly `h1 → h2 → h2 → h4`
with the entire page inventory living under no heading at all.

**L-7 — Breadcrumbs are `<div>`s with literal `/` text nodes on 11 service pages.**

```html
<div data-lps-eid="services-lab-solutions-gpo-purchasing-index-e26" class="breadcrumb"><a href="/">Home</a> / <a href="/services/lab-solutions/">Lab Solutions</a> / GPO Purchasing</div>
```

(management-services children use `class="bc"`, identical shape). No `<nav>`, no `<ol>`, no
`aria-label="Breadcrumb"`, no `aria-current="page"`, and the `/` separators are read aloud. Yet
**20 of 21 pages already emit `BreadcrumbList` JSON-LD** — structured data and DOM disagree.
`aria-current="page"` appears exactly once in the whole export (sitemap breadcrumb).

**L-8 — `<aside>` used only twice, both times containing an orphan `<h4>`.**

```html
<aside data-lps-eid="privacy-policy-index-e…" class="toc">
<h4>On This Page</h4>
<ol>
<li><a href="#intro" class="toc-link">Introduction &amp; Scope</a></li>
```

`<aside class="toc">` has no accessible name, so it is an unnamed `complementary` landmark, and its
`<h4>` follows the page `<h1>` directly (see §2.3).

**L-9 — Cards are `<article>` where they should be list items.** The home page contains 16
`<article>` elements (`class="sc"`, `"ac2"`, `"dc"`, `"wc"`) inside CSS grids (`div.sg`, `div.ag`,
`div.wg`). A service teaser card is not independently syndicable content; it is one of N peers and
should be `<li>` inside a `<ul>` so AT announces "list, 5 items".

**L-10 — Testimonials are not quotes.**

```html
<article data-lps-eid="index-e256" class="wc aos il13">
<div class="il14"><svg width="16" height="16" fill="var(--teal)" … aria-hidden="true">…</svg> ×5</div>
<p class="il15">"Whenever we are looking at doing business with a new vendor, …"</p>
<div class="il16"><div class="il17">SG</div><div><strong class="il18">Steven C. Gerson, CPA, MPAcc</strong><span class="il19">Chief Financial Officer, Atlanta Center for Reproductive Medicine</span></div></div>
</article>
```

No `<blockquote>`/`<figure>`/`<figcaption>`/`<cite>`; the five-star rating is five
`aria-hidden="true"` SVGs with **no text equivalent**, so the rating is invisible to AT.

**L-11 — Runtime landmark noise from the injected header.** `mega-menu.js` adds three
`role="region"` landmarks and two `aside` (complementary) landmarks *inside* the banner:

```js
'<div class="mm-panel mm-panel-' + group + '" id="' + id + '" role="region" aria-label="' + label + ' menu">'
…
'<aside class="mm-panel-feature">'
```

A landmark-list user on the home page therefore sees banner → navigation → region ×3 →
complementary ×2 → (main) → contentinfo, with two of the complementary regions unnamed.

**L-12 — Internal-link reachability gap in static HTML.** With JS off, `/services/lab-solutions/`
and `/services/management-services/` are linked from only **10 of 21** pages (`/`, `/our-team/`,
`/privacy-policy/`, `/services/`, `/sitemap/` and their own children). They are absent from the
static footer on `/about/`, `/contact/`, `/terms-of-service/`, `/404/` and every cross-branch service
page. Every other route is linked from all 21 pages via the footer.

**L-13 — `<noscript>` GTM iframe has no `title`.** Present identically on all 21 pages:

```html
<noscript data-lps-eid="index-e406"><iframe data-lps-eid="index-e407" src="https://www.googletagmanager.com/ns.html?id=GTM-MKTJCBZG" height="0" width="0" class="il1"></iframe></noscript>
```

Lighthouse marks `frame-title` `notApplicable` because `<noscript>` content is not parsed while JS is
enabled — but it *is* parsed for the JS-disabled users this rebuild is meant to serve.

---

## 2. Heading outlines and the `heading-order` violations

### 2.1 Home page (`/index.html`) — exact server-rendered outline

| Line | Level | Text | Node |
|---|---|---|---|
| 303 | **h1** | IVF Laboratory Management & ART Practice Solutions for Fertility Clinics | `id="h1"` |
| 340 | h2 | The ART Industry's Most Trusted Partner | `id="about-h"` |
| 357 | h3 | Laboratory Solutions | |
| 358 | h3 | Staffing & Recruitment | |
| 359 | h3 | GPO Purchasing | |
| 360 | h3 | Practice Development | |
| 368 | h2 | IVF Laboratory & Clinical Services | `id="lab-h"` |
| 370 | h3 | Regulatory Compliance | |
| 371 | h3 | Staffing & Recruitment | |
| 372 | h3 | Group Purchasing (GPO) | |
| 373 | h3 | Practice Development | |
| 382 | h2 | One Partner for the Laboratory and the Business of ART | `id="why-h"` |
| 399 | h2 | Practice Management & Operations | `id="mg-h"` |
| 401–405 | h3 ×5 | Marketing / Call Center / Accounting & Finance / Human Resources / Insurance & Risk Management | |
| 412 | h2 | Built Exclusively for Reproductive Healthcare | `id="builtfor-h"` |
| 418–420 | h3 ×3 | ART/IVF Specialists / Hands-On Implementation / Proven Track Record | |
| 427 | h2 | Trusted by Fertility Clinics Nationwide | `id="tst-h"` |
| 463 | h2 | Common Questions About MedTech For Solutions | `id="faq-h"` |
| 477 | h2 | Ready to Transform Your Practice? | `id="cta-h"` |
| 487 | h2 | Explore MedTech For Solutions | `id="mtfs-related-home"` |
| **499** | **h4** | **Lab Solutions** | ← **`heading-order` FAILURE** |
| 509 | h4 | Mgmt Services | |
| 519 | h4 | Company | |

Note the six FAQ questions between lines 465–472 are **`<button>` elements, not headings**, so the
FAQ contributes nothing to the outline (see §3.5).

Lighthouse's single `heading-order` item is exactly line 499:

```json
"path": "1,HTML,1,BODY,9,FOOTER,0,DIV,0,DIV,1,DIV,0,H4",
"selector": "div.ctr > div.ftg > div.ftc > h4.il27",
"snippet": "<h4 data-lps-eid=\"index-e342\" class=\"il27\">",
"nodeLabel": "LAB SOLUTIONS",
"explanation": "Fix any of the following:\n  Heading order invalid"
```

Source markup:

```html
<div data-lps-eid="index-e341" class="ftc">
<h4 data-lps-eid="index-e342" class="il27">Lab Solutions</h4>
<ul data-lps-eid="index-e343" class="il28">
```

`.il27{font-family:sans-serif;font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;margin-bottom:20px}` —
the `h4` is chosen purely for the visual size; the level carries no structural meaning. axe only
reports the *first* heading of a skipping run, which is why the two following `h4`s
("Mgmt Services", "Company") are not listed even though they are the same defect.

### 2.2 Service page (`/services/lab-solutions/gpo-purchasing/index.html`) — exact outline

| Line | Level | Text |
|---|---|---|
| 232 | **h1** | IVF Group Purchasing `<span>`Organization`</span>` for Fertility Clinics |
| **243** | **h3** | **GPO Savings Dashboard** ← **h1 → h3 skip** |
| 262 | h2 | Why Join MedTech GPO? |
| | h3 ×6 | Significant Cost Savings / Vast Supplier Network / Specialized ART Contracts / Expert Contract Negotiations / Wide Range of Supplies / 10% - 50% Cost Savings |
| | h2 | Power of Leading Service Providers |
| | h2 | Unlock Savings Without Cost |
| | h2 | Related Financial and Growth Resources (`id="mtfs-related-services-lab-solutions-gpo-purchasing"`) |
| | **h4 ×3** | **Lab Solutions / Mgmt Services / Company** ← **h2 → h4 skip** |

Offending hero markup (a decorative stat card in the hero column, *not* a section heading):

```html
<div class="hero-stat-card">
<div class="il5">
<div class="il6"><svg width="24" height="24" fill="none" stroke="white" …></svg></div>
<div><h3 class="il7">GPO Savings Dashboard</h3><p class="il8">Member benefits</p></div>
</div>
```

Lighthouse did not flag this because the audited URL was the home page only; the defect is
nevertheless real and identical in shape on 10 sibling pages.

### 2.3 Site-wide heading-skip inventory (computed over all 21 pages)

| Page | Skips |
|---|---|
| `/404/` | h1→h4 "Lab Solutions" |
| `/about/` | h2→h4 "Scientific Rigor"; h2→h4 "Lab Solutions" |
| `/contact/` | h2→h4 "Lab Solutions" |
| `/` | h2→h4 "Lab Solutions" *(the audited failure)* |
| `/our-team/` | h2→h4 "Lab Solutions" |
| `/privacy-policy/` | h1→h4 "On This Page"; h2→h4 "Lab Solutions" |
| `/services/` | h2→h4 "Lab Solutions" |
| `/services/lab-solutions/` | h2→h4 "Lab Solutions" |
| `/services/lab-solutions/gpo-purchasing/` | h1→h3 "GPO Savings Dashboard"; h2→h4 "Lab Solutions" |
| `/services/lab-solutions/practice-development/` | h1→h3 "Practice Growth"; h2→h4 "Lab Solutions" |
| `/services/lab-solutions/real-time-monitoring/` | h1→h3 "Lab Performance Dashboard"; h2→h4 "Lab Solutions" |
| `/services/lab-solutions/regulatory-compliance/` | h1→h3 "Compliance Scorecard"; h2→h4 "Lab Solutions" |
| `/services/lab-solutions/staffing-solutions/` | h1→h3 "Staffing Overview"; h2→h4 "Lab Solutions" |
| `/services/management-services/` | h2→h4 "Lab Solutions" |
| `/services/management-services/accounting-finance/` | h1→h3 "Financial Health"; h2→h4 "Lab Solutions" |
| `/services/management-services/call-center/` | h1→h3 "Call Center Metrics"; h2→h4 "Lab Solutions" |
| `/services/management-services/human-resources/` | h1→h3 "Workforce Metrics"; h2→h4 "Lab Solutions" |
| `/services/management-services/insurance-risk-management/` | h1→h3 "Risk Overview"; h2→h4 "Lab Solutions" |
| `/services/management-services/marketing/` | h1→h3 "Marketing Performance"; h2→h4 "Lab Solutions" |
| `/sitemap/` | h2→h4 "Lab Solutions" |
| `/terms-of-service/` | h1→h4 "On This Page"; h2→h4 "Lab Solutions" |

**Three distinct root causes, 21/21 pages affected:**

1. **Footer column titles are `<h4>`** (63 elements: 3 per page × 21). Fixed by rendering the SSR
   footer with `<h2>` column titles (footer content sits after the last `<h2>`-level content
   section, so `h2` is the correct level) — or by demoting them to non-heading `<p>` and naming each
   column list with `aria-labelledby`.
2. **Hero stat-card titles are `<h3>` immediately after the `<h1>`** (11 service pages). These are
   decorative widget labels, not sections: demote to `<p class="hero-stat-card-title">` and keep the
   visual style.
3. **Two in-page skips**: `/about/` mission cards (`h2` "Our Mission & Collaborative Approach" →
   `h4` "Scientific Rigor" / "True Partnership" / "Outcomes Driven" / "Compliance First") and the
   legal-page ToC (`<aside class="toc"><h4>On This Page</h4>` straight after the `<h1>`).

**Related, non-`heading-order` outline defect:** `/contact/` nests an `<h2>` under an `<h2>` —
`<h2 id="loc-h">Our Headquarters</h2>` labels the section, and inside the same section
`<h2 id="loc-address">Our Office Address</h2>` is a subordinate heading. It must become `<h3>`.
`/about/` also duplicates its `<h1>` text in the following `<h2>` ("The ART Industry's Most Trusted
Partner").

---

## 3. Exact source of each failing audit

### 3.1 `aria-allowed-attr` — score 0, 16 failing elements

**Source:** `assets/book-consultation-modal.js`, line 521, in `buildHTML()`:

```js
var optCards = SERVICE_OPTIONS.map(function(opt) {
  return '<button type="button" class="mtfs-option" role="option" aria-pressed="false" data-svc="' + opt.id + '">'
    + '<span class="mtfs-opt-ico" aria-hidden="true">' + SVG[opt.icon] + '</span>'
    + esc(opt.label)
    + '</button>';
}).join('');
```

Rendered node, quoted from the Lighthouse report:

```html
<button type="button" class="mtfs-option" role="option" aria-pressed="false" data-svc="lab-management">
```

> `"explanation": "Fix all of the following:\n  ARIA attribute is not allowed: aria-pressed=\"false\""`

`role="option"` overrides the native `button` role; `aria-pressed` is not in the `option` role's
allowed-attribute set (`option` uses `aria-selected`). The pattern repeats for all 8
`SERVICE_OPTIONS` (`lab-management`, `reg-compliance`, `staffing`, `gpo-purchasing`, `practice-dev`,
`realtime-mon`, `mgmt-services`, `not-sure`), and the modal script builds **two** instances per page
(see §3.3), giving 16 failing nodes:

* inline instance — `1,HTML,1,BODY,8,MAIN,0,SECTION,0,DIV,3,DIV,0,DIV,2,DIV,0,DIV,2,DIV,{0..7},BUTTON`
* popup instance — `1,HTML,1,BODY,23,DIV,0,DIV,0,DIV,2,DIV,0,DIV,2,DIV,{0..7},BUTTON`

The state is also driven through `aria-pressed` at runtime, so the fix is not just attribute removal:

```js
qc('.mtfs-option').forEach(function(b) { b.setAttribute('aria-pressed','false'); });
btn.setAttribute('aria-pressed','true');
```

**Remediation:** drop the fake listbox. Keep `<div class="mtfs-options-grid" role="listbox"
aria-label="Services">` only if the children become `role="option" aria-selected`; the simpler and
better option is a real radio group — `<fieldset><legend>Which service can we help with?</legend>`
with `<input type="radio" name="service">` + `<label>` per option — which needs no ARIA at all and
gives arrow-key navigation for free. If the button visual must be preserved, use plain
`<button type="button" aria-pressed="…">` with **no** `role` override.

### 3.2 `aria-progressbar-name` — score 0, 2 failing elements

**Source:** `assets/book-consultation-modal.js`, lines 535–539:

```js
+ '<div class="mtfs-step-bar" id="' + P + '-step-bar">'
+   '<p class="mtfs-step-label">Step <strong class="mtfs-step-num">1</strong> of 4 &middot; <span class="mtfs-step-name">Service</span></p>'
+   '<div class="mtfs-progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="1">'
+     '<div class="mtfs-progress-fill" style="width:25%"></div>'
+   '</div>'
+ '</div>'
```

Rendered node:

```html
<div class="mtfs-progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="1">
```

> `"explanation": "Fix any of the following:\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n  Element has no title attribute"`

Failing selectors from Lighthouse:

* `div#hero-form-card > div#getInTouchForm > div#mtfsi-step-bar > div.mtfs-progress-track`
* `div#mtfs-modal-root > div.mtfs-dialog > div#mtfs-step-bar > div.mtfs-progress-track`

There is a perfectly good visible label one node above (`<p class="mtfs-step-label">Step 1 of 4 ·
Service</p>`); it simply is not wired up.

**Remediation:** give the `<p class="mtfs-step-label">` an `id` (`mtfsi-step-label` /
`mtfs-step-label`) and add `aria-labelledby` pointing at it; or, better, drop
`role="progressbar"` entirely — the track is a decorative bar duplicating text that is already
announced — and mark it `aria-hidden="true"`, keeping the `<p>` as the single announced source of
truth updated via `aria-live="polite"`.

### 3.3 Root cause behind the doubled counts: the modal's `hidden` attribute is defeated by its own CSS

`assets/book-consultation-modal.js` builds the popup root as hidden:

```js
return '<div id="mtfs-modal-root" role="dialog" aria-modal="true" aria-labelledby="' + P + '-dialog-title" hidden>'
```

…and then injects a stylesheet whose very first overlay rule reintroduces a `display` value:

```css
#mtfs-modal-root {
  position: fixed; inset: 0; z-index: 99999;
  display: flex; align-items: center; justify-content: center;
  …
  opacity: 0; pointer-events: none;
  transition: opacity .25s ease;
}
```

An author-origin `display:flex` beats the UA `[hidden]{display:none}` rule, so `hidden` is inert on
the root. (The script author knew about the class of bug — line 294 patches the *descendants*:
`#mtfs-modal-root [hidden] { display: none !important; }` — but never the root.)

Lighthouse proves the modal is laid out and in the accessibility tree on the home page: the second
progressbar has `"boundingRect": { "top": 163, "bottom": 168, "left": 43, "right": 369, "width": 325,
"height": 5 }`. `opacity:0` and `pointer-events:none` do not remove content from the accessibility
tree or the tab order, so **on every page a closed 4-step dialog with ~15 focusable controls sits in
the keyboard tab order**, duplicating every heading and every service option.

`init()` also unconditionally appends a dead node:

```js
var popupContainer = document.createElement('div');
popupContainer.innerHTML = buildPopupShell();   // returns '<span></span>'
document.body.appendChild(popupContainer.firstChild);
```

and installs a permanent `MutationObserver(document.body, { childList: true, subtree: false })`.

**Remediation:** the rebuilt modal must be `display:none` when closed (use `[hidden]` correctly or
`.mtfs-modal[hidden]{display:none !important}` *before* the `display:flex` rule), must not be
constructed until first user intent (contract pass 9, `lazy-modal`), and must not be built twice on
the home page.

### 3.4 `label-content-name-mismatch` (A11y) and `link-text` (SEO) — one shared root cause

Both audits point at the same five links in the "Practice Management & Operations" grid on the home
page. Verbatim source, `/index.html` lines 401–405:

```html
<a data-lps-eid="index-e180" href="/services/management-services/marketing/" class="lk" aria-label="Marketing">Learn More <svg data-lps-eid="index-e181" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path data-lps-eid="index-e182" d="M5 12h14M12 5l7 7-7 7"/></svg></a>
<a data-lps-eid="index-e189" href="/services/management-services/call-center/" class="lk" aria-label="Call Center">Learn More …</a>
<a data-lps-eid="index-e198" href="/services/management-services/accounting-finance/" class="lk" aria-label="Accounting &amp; Finance">Learn More …</a>
<a data-lps-eid="index-e207" href="/services/management-services/human-resources/" class="lk" aria-label="Human Resources">Learn More …</a>
<a data-lps-eid="index-e216" href="/services/management-services/insurance-risk-management/" class="lk" aria-label="Insurance &amp; Risk Management">Learn More …</a>
```

**`label-content-name-mismatch`** (5 items, impact "serious", WCAG 2.1 AA 2.5.3 Label in Name):

> `"nodeLabel": "Learn More"`, `"explanation": "Fix any of the following:\n  Text inside the element is not included in the accessible name"`

The visible text is "Learn More"; the accessible name is "Marketing". A speech-input user who says
"click Learn More" cannot activate the control, and a screen-reader user hears a name that does not
match what is on screen.

**`link-text`** (SEO, displayValue `5 links found`) flags the same five hrefs with
`"text": "Learn More"` — generic anchor text carries no ranking or comprehension signal.

The correct fix satisfies **both** audits at once: put the destination in the visible text and delete
the `aria-label`. The same page already does this correctly four rows above:

```html
<a data-lps-eid="index-e115" href="/services/lab-solutions/regulatory-compliance/" class="lk">Explore Compliance <svg …/></a>
<a data-lps-eid="index-e124" href="/services/lab-solutions/staffing-solutions/" class="lk">Explore Staffing <svg …/></a>
<a data-lps-eid="index-e133" href="/services/lab-solutions/gpo-purchasing/" class="lk">Explore GPO <svg …/></a>
<a data-lps-eid="index-e142" href="/services/lab-solutions/practice-development/" class="lk">Explore Development <svg …/></a>
```

**Scope beyond the audited page.** "Learn More" is used **26 times** site-wide, on 5 pages:

| Page | Count | Class | Has mismatching `aria-label`? |
|---|---|---|---|
| `/index.html` | 5 | `lk` | **yes** — the 5 audited failures |
| `/services/index.html` | 10 (lines 298, 306, 314, 322, 330, 364, 372, 380, 388, 396) | `link` | no |
| `/services/lab-solutions/index.html` | 5 (lines 196, 203, 210, 217, 224) | `link` | no |
| `/services/management-services/index.html` | 5 (lines 174, 179, 184, 189, 194) | `lnk` | no |
| `/services/lab-solutions/gpo-purchasing/index.html` | 1 (line 236, `href="/contact/"`, `class="btn-secondary"`) | — | no |

Only `/index.html` was audited, so only 5 were reported; the remaining 21 would fail `link-text` the
moment those pages are scanned. The `fix-a11y` pass must rewrite **all 26**, deriving the text from
`routes[].navLabel` for the destination (e.g. "Explore Marketing", "Explore Call Center").

### 3.5 Adjacent disclosure defects the audits do not catch

The home-page FAQ is a hand-rolled accordion:

```html
<div data-lps-eid="index-e299" class="fi op"><button data-lps-eid="index-e300" class="fq" aria-expanded="true">What is MedTech For Solutions?</button><div data-lps-eid="index-e301" class="fa"><p data-lps-eid="index-e302">MedTech For Solutions is a healthcare consulting company founded in 2005, …</p></div></div>
```

```css
.fa{max-height:0;overflow:hidden;transition:max-height .4s ease,padding .3s}
.fi.op .fa{max-height:400px;padding:0 24px 22px}
```

Three defects: (a) the button has `aria-expanded` but no `aria-controls`, and the panel has no `id`;
(b) `max-height:0;overflow:hidden` does **not** remove the panel from the accessibility tree, so all
six answers are announced and any links inside remain focusable regardless of state;
(c) `max-height:400px` silently truncates any answer taller than 400px (the GPO answer is three
paragraphs). The question text is also not a heading, so the FAQ is unnavigable by heading.

The contact form is well built (every control has a `<label for>`, `autocomplete` is set, `optgroup`
is used, and the honeypot is `aria-hidden` + `tabindex="-1"`), with one nit: the required marker is
announced —

```html
<label class="form-label" for="fname">First Name<span class="req">*</span></label>
```

`<span class="req">` needs `aria-hidden="true"`; the `required` attribute already conveys the state.

---

## 4. Inline `on*` handlers and their CSS replacements

**Measured:** 406 elements carry an inline handler, 812 handler attributes total, across all 21
pages (38 per page except `/index.html` and `/sitemap/` at 40 and `/our-team/` at 48). Attribute
frequency site-wide: `onmouseover` 403, `onmouseout` 403, `onfocus` 3, `onblur` 3. **Every one of
these 406 elements already carries a `class`**, and there are only **30 distinct
(tag, class, handler) shapes** — so the substitution is mechanical and total.

Handler-value frequency:

| Count | Handler value |
|---|---|
| 380 | `onmouseover="this.style.color='#1F6E75'"` |
| 315 | `onmouseout="this.style.color=''"` |
| 84 | `onmouseout="this.style.color='rgba(255,255,255,.6)'"` |
| 19 | `onmouseover="this.style.color='var(--teal)'"` |
| 3 | `onfocus="this.style.top='0'"` |
| 3 | `onblur="this.style.top='-100%'"` |
| 2 | `onmouseover="this.style.color='var(--w)';"` |
| 2 | `onmouseout="this.style.color='var(--lime)';"` |
| 1 | `onmouseover="this.style.borderColor='#fff'; this.style.background='rgba(255,255,255,.08)';"` |
| 1 | `onmouseover="this.style.background='var(--td)'; this.style.borderColor='var(--td)';"` |
| 1 | `onmouseout="this.style.borderColor='rgba(255,255,255,.75)'; this.style.background='transparent';"` |
| 1 | `onmouseout="this.style.background='var(--teal)'; this.style.borderColor='var(--teal)';"` |

### 4.1 The four behaviours and the exact CSS that replaces them

**B-1 — Footer / body text link, hover → teal (398 elements, 29 of the 30 shapes).**

```html
<li data-lps-eid="index-e344" class="il29"><a data-lps-eid="index-e345" href="/services/lab-solutions/real-time-monitoring/" onmouseover="this.style.color='var(--teal)'" onmouseout="this.style.color=''" class="il30">Real-Time Monitoring</a></li>
```

Base styles already present: `.il30{font-size:.88rem;transition:color .3s}`, colour inherited from
`footer[role="contentinfo"]{background:#1e293b;color:rgba(255,255,255,.6);…}`. Two hard-coded
variants of the same intent exist — `#1F6E75` (380×) and `var(--teal)` (19×) — and two
"reset" variants — `''` (315×, reverts to the cascade) and the literal
`'rgba(255,255,255,.6)'` (84×, hard-codes the footer's inherited colour).

Replacement (one rule, no per-element state, keyboard users covered for the first time):

```css
.mtfs-footer a:hover,
.mtfs-footer a:focus-visible { color: var(--teal); }
```

**B-2 — Skip link reveal on focus (3 elements — `/`, `/our-team/`, `/sitemap/`).**

```html
<a data-lps-eid="index-e29" href="#main" onfocus="this.style.top='0'" onblur="this.style.top='-100%'" class="il2">Skip to main content</a>
```

Replacement:

```css
.mtfs-skip-link { position: absolute; top: -100%; left: 50%; transform: translateX(-50%);
  background: var(--teal); color: #fff; padding: 12px 24px; border-radius: 0 0 8px 8px;
  z-index: 9999; font-weight: 600; }
.mtfs-skip-link:focus,
.mtfs-skip-link:focus-visible { top: 0; }
```

**B-3 — Lime contact links on the dark our-team CTA band (2 elements, `/our-team/`).**

```html
<a href="mailto:info@medtech4solutions.com" onmouseover="this.style.color='var(--w)';" onmouseout="this.style.color='var(--lime)';" class="il69">info@medtech4solutions.com</a>
<a href="tel:+18666349144" onmouseover="this.style.color='var(--w)';" onmouseout="this.style.color='var(--lime)';" class="il69">(866) 634-9144</a>
```

Base: `.il69{color: var(--lime); text-decoration: none; transition: color 0.3s}`. Replacement:

```css
.contact-cta a:hover,
.contact-cta a:focus-visible { color: var(--w); }
```

**B-4 — The two CTA buttons on the dark our-team band (2 elements, `/our-team/`).**

```html
<a href="/contact/" data-nav-synced="true" onmouseover="this.style.background='var(--td)'; this.style.borderColor='var(--td)';" onmouseout="this.style.background='var(--teal)'; this.style.borderColor='var(--teal)';" class="btn-primary il63">Schedule a Consultation</a>
<a href="tel:+18666349144" onmouseover="this.style.borderColor='#fff'; this.style.background='rgba(255,255,255,.08)';" onmouseout="this.style.borderColor='rgba(255,255,255,.75)'; this.style.background='transparent';" class="btn-link il64">Call (866) 634-9144</a>
```

Replacement:

```css
.btn-primary:hover, .btn-primary:focus-visible { background: var(--td); border-color: var(--td); }
.btn-link:hover,    .btn-link:focus-visible    { border-color: #fff; background: rgba(255,255,255,.08); }
```

### 4.2 Why this is a bug fix, not just a CSP/size cleanup

* **Keyboard users get nothing today.** `onmouseover`/`onmouseout` fire only for pointers. The
  export has exactly one focus rule for links —
  `a:focus-visible,button:focus-visible,[tabindex]:focus-visible,.bp:focus-visible,.bs2:focus-visible,.cbp:focus-visible,.cbb:focus-visible,.fq:focus-visible{outline:3px solid var(--lime);outline-offset:3px;border-radius:4px}` —
  so a keyboard user tabbing the footer sees an outline but never the colour change a mouse user
  sees. Adding `:focus-visible` to each rule above closes a real WCAG 2.4.7 / 1.4.1 gap.
* **`this.style.…` writes win over any later stylesheet** (inline style beats author rules), so the
  hover state cannot be themed, dark-mode-adjusted, or overridden.
* **Do not key the new rules on the `il*` class names.** They are per-page generated and *collide
  across pages*: `il13`, `il15`, `il23`, `il25`, `il30` and `il33` each map to two different
  handler pairs depending on the file. The `strip-inline-handlers` pass must remove the `on*`
  attribute and attach a **stable semantic class** (`.mtfs-footer`, `.mtfs-skip-link`,
  `.contact-cta`, `.btn-primary`, `.btn-link`), never emit `.il30:hover` into a shared stylesheet.

---

## 5. What the SSR header/footer must produce

All of the following is read out of `assets/mega-menu.js` (`HEADER_HTML`, `panelMarkup()`, `svc()`,
`LAB_SERVICES`, `MGMT_SERVICES`, `ICONS`) and must be reproduced as static markup by
`build/lib/render.mjs :: renderHeader()` / `renderFooter()`.

### 5.1 Top-level primary navigation (exact order, hrefs, labels)

| # | Type | Label | href / control | `data-mm-match` (drives active state) |
|---|---|---|---|---|
| 1 | link | `Home` | `/` | `^/$` |
| 2 | **disclosure button** | `Lab Solutions` + caret | controls `#mm-lab-panel` | `^/services/lab-solutions(/|$)` |
| 3 | **disclosure button** | `Management` + caret | controls `#mm-mgmt-panel` | `^/services/management-services(/|$)` |
| 4 | **disclosure button** | `About` + caret | controls `#mm-about-panel` | `^/(about|staff)(/|$)` |
| 5 | link (mobile only, `li.mm-mobile-only`) | `Book a Consultation` | `/contact/` + `data-open-consult role="button"` | `^/contact(/|$)` |

Utility rail (`div.mm-right`), in order:

| Element | Markup facts |
|---|---|
| Phone | `<a class="mm-phone" href="tel:+18666349144">` + phone icon + `<span>(866) 634-9144</span>` |
| Search | `<button class="mm-search-btn" type="button" id="mm-search-open" aria-label="Open AI search" aria-haspopup="dialog">` + `<span>Search</span>` + `<span class="mm-search-kbhint"><kbd>⌘</kbd><kbd>K</kbd></span>` |
| CTA | `<a class="mm-cta" href="/contact/" data-open-consult role="button">Book a Consultation ›</a>` |
| Burger | `<button class="mm-burger" type="button" aria-label="Toggle menu" aria-controls="mm-nav" aria-expanded="false"><span></span><span></span><span></span></button>` |

Logo (first child of `div.mm-bar`):

```html
<a class="mm-logo" href="/" aria-label="MedTech For Solutions Home">
  <img src="https://media.cdn.builder.searchatlas.com/user-uploads/8938b9ec-89dc-47c4-aa9d-aabb527787a9_medtech-for-solutions-website-logo.webp"
       alt="MedTech For Solutions"
       style="height:44px;width:auto;max-width:220px;display:block;object-fit:contain;" />
</a>
```

Also injected outside the header, and part of the same contract:
`<div class="mm-mobile-scrim" aria-hidden="true"></div>`,
`<button class="mm-back-to-top" id="mm-back-to-top" type="button" aria-label="Back to top">…</button>`,
and `<div class="mm-search-overlay" id="mm-search-overlay" role="dialog" aria-modal="true" aria-label="AI-powered site search">…</div>`.

### 5.2 Panel 1 — `#mm-lab-panel`, label `Laboratory Solutions`, pill count `5`

From `LAB_SERVICES`, rendered by `svc()` as `<li><a class="mm-item" href="…" data-mm-section="lab">`
with `<strong>title</strong><span>blurb</span>`:

| href | title (`<strong>`) | blurb (`<span>`) | icon |
|---|---|---|---|
| `/services/lab-solutions/real-time-monitoring/` | Real-Time Monitoring | 24/7 OvaTools tracking & QC dashboards | `monitor` |
| `/services/lab-solutions/regulatory-compliance/` | Regulatory Compliance | FDA, CLIA, CAP, AABB readiness | `shield` |
| `/services/lab-solutions/staffing-solutions/` | Staffing Solutions | TS (ABB) certified embryologists & directors | `users` |
| `/services/lab-solutions/gpo-purchasing/` | GPO Purchasing | 1,800+ vendor contracts, free to join | `cart` |
| `/services/lab-solutions/practice-development/` | Practice Development | Lab design, optimization & training | `trending` |

Feature `<aside class="mm-panel-feature">`: `<strong>Built for ART labs</strong>`,
`<span>Monitoring, compliance, staffing, GPO purchasing, and practice development for fertility
programs.</span>`, `<a href="/services/lab-solutions/">Explore lab solutions ›</a>`.
Foot `<div class="mm-panel-foot">`: `<span>Five lab-focused service lines.</span>` +
`<a href="/services/">View all services ›</a>`.

### 5.3 Panel 2 — `#mm-mgmt-panel`, label `Management Services`, pill count `5`

From `MGMT_SERVICES`, `data-mm-section="mgmt"`:

| href | title | blurb | icon |
|---|---|---|---|
| `/services/management-services/marketing/` | Marketing | Patient-acquisition campaigns | `megaphone` |
| `/services/management-services/call-center/` | Call Center | Dedicated fertility patient call center | `phone` |
| `/services/management-services/accounting-finance/` | Accounting & Finance | Reporting, budgeting, forecasting | `book` |
| `/services/management-services/human-resources/` | Human Resources | Recruitment & performance management | `userGroup` |
| `/services/management-services/insurance-risk-management/` | Insurance & Risk Management | Professional liability for ART practices | `lock` |

Feature aside: `<strong>Operational support</strong>`, `<span>Marketing, call center, finance, HR,
and risk support for growing fertility practices.</span>`,
`<a href="/services/management-services/">Explore management ›</a>`.
Foot: `<span>Five management service lines.</span>` + `<a href="/services/">View all services ›</a>`.

### 5.4 Panel 3 — `#mm-about-panel`, `aria-label="About menu"`

Hand-written (no `panelMarkup()` call): no `<h4>`, no feature aside, no foot. Two items,
`data-mm-section="about"`:

| href | title | blurb | icon |
|---|---|---|---|
| `/about/` | About Us | Our mission, history, and values | `userGroup` |
| `/our-team/` | Our Team | Meet the MedTech specialists | `users` |

### 5.5 Disclosure and keyboard behaviour that must be preserved (and what must be fixed)

Preserve:

1. **Button-based disclosure with `aria-expanded` + `aria-controls`** — already correct:
   `<button type="button" data-mm-trigger="lab" aria-expanded="false" aria-controls="mm-lab-panel" …>`,
   toggled in `openPanel()` / `closePanel()` / `closeAll()`.
2. **Hover-open on desktop with intent delays**, gated on `window.matchMedia('(hover: none)')`:
   `mouseenter` on the `<li>` opens after `60 ms`; `mouseleave` closes after `140 ms`; `mouseenter`
   on the panel cancels the pending close.
3. **Click toggles** the panel (`e.preventDefault()`, open → close, closed → open).
4. **`ArrowDown` opens the panel and moves focus to the first `.mm-item`.**
5. **`Escape`** closes the mobile drawer and returns focus to the burger, or closes any open panel
   and returns focus to its trigger.
6. **Outside click** closes all panels and the mobile drawer.
7. **Mobile drawer**: burger toggles `.mm-mobile-open` on the header, `body.mm-menu-lock`, and
   `aria-expanded`; every nav `<a>` closes the drawer on click. Closed state is
   `visibility:hidden` on `.mm-nav` (desktop panels likewise `visibility:hidden`), so closed content
   is correctly out of the accessibility tree — **this must be preserved by any CSS rewrite**; do
   not swap it for `opacity:0` alone.
8. **Sticky/compact + back-to-top**: one rAF-throttled passive scroll listener toggling
   `.mm-scrolled` at `y > 50` and `.mm-visible` at `y > 500`; back-to-top honours
   `prefers-reduced-motion`.
9. **Active-link marking** from `data-mm-match` regexes against a normalised
   `location.pathname` — in SSR this becomes a build-time `aria-current="page"` (and
   `aria-current="true"` on the ancestor disclosure button), which is strictly better.
10. **Search dialog affordances**: `⌘K` / `Ctrl K` toggle, `Escape` close, `ArrowUp`/`ArrowDown`
    through results, `Enter` to open, focus returned to `#mm-search-open` on close.

Fix while porting:

* **F-1 — Header must precede nothing.** SSR order inside `<body>` must be:
  skip link → `<header>` → `<main id="main">` → `<footer>`. The current `afterbegin` injection puts
  the header ahead of the skip link (§L-3).
* **F-2 — `Enter`/`Space` cannot close a panel.** The keydown handler intercepts all three keys and
  always opens:
  ```js
  trigger.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPanel(trigger);
      var first = panelFor(trigger).querySelector('.mm-item');
      if (first) first.focus();
    }
  });
  ```
  `preventDefault()` on `Enter`/`Space` suppresses the synthesized `click`, so the toggle in the
  click handler never runs. Handle only `ArrowDown` in `keydown`; let `Enter`/`Space` fall through
  to the native button activation.
* **F-3 — No focus-out close.** Tabbing past the last `.mm-item` leaves the panel open with
  `aria-expanded="true"` while focus is elsewhere. Add a `focusout` handler on the `<li>` that
  closes when `relatedTarget` is outside it, plus `:focus-within` as the CSS-only fallback.
* **F-4 — Links wearing `role="button"`.** `<a class="mm-cta" href="/contact/" data-open-consult
  role="button">` and the mobile `<li class="mm-mobile-only"><a … role="button">` announce as
  buttons but do not respond to `Space`, and they `preventDefault()` the navigation. Either make
  them real `<button>`s that open the modal (with `/contact/` still reachable as a link), or drop
  `role="button"` and let them navigate.
* **F-5 — Landmark noise.** Drop `role="region"` from the three panels and the two
  `<aside class="mm-panel-feature">` elements; a disclosure panel inside `nav` should be a plain
  `<div>` (see §L-11).
* **F-6 — Panel `<h4>` before the page `<h1>`.** `panelMarkup()` emits
  `'<h4>' + label + ' <span class="mm-pill">' + count + '</span></h4>'`, so the first heading in the
  DOM is an `h4`. In SSR the panel title should be a non-heading element (`<p class="mm-panel-title"
  id="mm-lab-panel-title">`) with the panel referenced via `aria-labelledby`, keeping the document
  outline `h1`-first.
* **F-7 — Search dialog has no focus trap** and is always in the DOM. It is safe today only because
  `.mm-search-overlay{visibility:hidden}` when closed. Keep the `visibility` rule and add a trap
  (`Tab` cycling within `.mm-search-modal`) plus `inert`/`hidden` when closed.
* **F-8 — Nav "AI Search"** must not be presented as a Google-ranking feature; it is a local
  client-side index over `SEARCH_INDEX` (21 entries, with `/services/management-services/call-center/`,
  `/services/management-services/`, `/services/lab-solutions/practice-development/` and
  `/services/lab-solutions/real-time-monitoring/` duplicated — the last under the alternate title
  "OvaTools LMS"). De-duplicate against `site.config.mjs :: routes` and generate it at build time.

### 5.6 Footer the SSR must produce

The static footer already exists on all 21 pages and is the site's only crawlable link surface. Keep
its content, fix its semantics:

```html
<footer data-lps-eid="index-e330" role="contentinfo" class="il21">
<div class="ctr"><div class="ftg il22">
  <div class="ftb">…logo, blurb, tel/mailto, postal address…</div>
  <div class="ftc"><h4 class="il27">Lab Solutions</h4><ul class="il28">…5 links…</ul></div>
  <div class="ftc"><h4 class="il27">Mgmt Services</h4><ul class="il28">…5 links…</ul></div>
  <div class="ftc"><h4 class="il27">Company</h4><ul class="il28">…5 links…</ul></div>
</div>
<div class="fbot il31">
  <span>&copy; 2026 MedTech For Solutions Inc. All rights reserved.</span>
  <span><a href="/privacy-policy/">Privacy Policy</a> &middot; <a href="/terms-of-service/">Terms of Service</a> &middot; <a href="/sitemap/">Sitemap</a> &middot; <a href="https://www.linkedin.com/in/kevinryanofficial/" target="_blank" rel="noopener noreferrer nofollow">Design by Kevin Ryan</a></span>
</div>
</div>
</footer>
```

Required changes: `<h4>` → `<h2>` (§2.3), `role="contentinfo"` removed, all 19 `onmouseover`/
`onmouseout` pairs removed (§4), a `<nav aria-label="Footer">` wrapper (or `aria-labelledby` on each
`<ul>` pointing at its column heading), the postal address wrapped in `<address>`, and — new — the
two hub links `/services/lab-solutions/` and `/services/management-services/` added so all 21 pages
link to every route (§L-12). The `Company` column's `/#testimonials` entry must stay an absolute
root-relative link so it works from sub-pages.

---

## 6. Numbered remediation list

Ordered for execution; the parenthesised name is the `build/lib/html.mjs` pass (contract §`passes`)
or `build/lib/render.mjs` export that owns the change.

1. **Emit a real `<header>` on all 21 pages** (`ssr-chrome` / `renderHeader`). Static markup for the
   logo, `<nav aria-label="Primary">`, the three disclosure buttons with `aria-expanded="false"` +
   `aria-controls`, the three panels, the utility rail, the burger. Content exactly as inventoried in
   §5.1–§5.4. Delete `/assets/mega-menu.min.js`'s header-building responsibility; keep only the
   ~2 KB behaviour module (§5.5 items 1–8, with fixes F-2, F-3, F-7).
2. **Emit `<main id="main">` on all 21 pages** (`ssr-chrome`). Wrap everything between the header
   and the footer. Drop the redundant `role="main"`. This is the skip target and the boundary
   `artifacts.mjs :: htmlToMarkdown()` extracts from.
3. **Emit the skip link as the first node in `<body>`** (`renderSkipLink`), above the header, with
   `class="mtfs-skip-link"` and the CSS of §4.1/B-2 — no `onfocus`/`onblur`.
4. **Emit `<nav aria-label="Breadcrumb"><ol>` on every non-home page** (`renderBreadcrumbs`), with
   `aria-current="page"` on the last crumb and CSS-generated separators
   (`li + li::before{content:"/"}`), replacing the 11 `<div class="breadcrumb">` / `<div class="bc">`
   blocks and their literal `/` text nodes. Source the trail from
   `routes.mjs :: breadcrumbTrail()` so it matches the existing `BreadcrumbList` JSON-LD exactly.
5. **Rebuild the footer** (`renderFooter`): column titles `<h4>` → `<h2>`; `role="contentinfo"`
   removed; `<nav aria-label="Footer">` around the link columns; `<address>` around the postal
   address; add `/services/lab-solutions/` and `/services/management-services/` (§L-12); all
   `on*` handlers stripped.
6. **Fix `heading-order` — footer** (`fix-a11y`). 63 `<h4>` → `<h2>` across 21 pages. Clears the one
   Lighthouse `heading-order` item and the same defect on the other 20 pages.
7. **Fix `heading-order` — hero stat cards** (`fix-a11y`). Demote the 11 `<h3 class="il7">`-style
   hero widget titles ("GPO Savings Dashboard", "Practice Growth", "Lab Performance Dashboard",
   "Compliance Scorecard", "Staffing Overview", "Financial Health", "Call Center Metrics",
   "Workforce Metrics", "Risk Overview", "Marketing Performance") to `<p>`, preserving the class.
8. **Fix `heading-order` — remaining in-page skips** (`fix-a11y`). `/about/` mission cards `h4` →
   `h3` (Scientific Rigor / True Partnership / Outcomes Driven / Compliance First); legal-page
   `<aside class="toc"><h4>On This Page</h4>` → `<h2>` with
   `<aside aria-labelledby="toc-h">`; `/contact/` `<h2 id="loc-address">` → `<h3>`.
9. **Fix `label-content-name-mismatch` + `link-text`** (`fix-a11y`). On `/index.html` lines 401–405,
   delete `aria-label` and replace the visible "Learn More" with the destination
   ("Explore Marketing", "Explore Call Center", "Explore Accounting & Finance",
   "Explore Human Resources", "Explore Insurance & Risk Management"). Apply the same rewrite to the
   other **21** "Learn More" links on `/services/`, `/services/lab-solutions/`,
   `/services/management-services/` and `/services/lab-solutions/gpo-purchasing/`; derive the label
   from `routes[].navLabel`.
10. **Fix `aria-allowed-attr`** (rebuild of the consultation form). Remove `role="option"` +
    `aria-pressed` from the 8 `.mtfs-option` buttons. Preferred shape: a
    `<fieldset><legend>Which service can we help with?</legend>` radio group
    (`lab-management`, `reg-compliance`, `staffing`, `gpo-purchasing`, `practice-dev`,
    `realtime-mon`, `mgmt-services`, `not-sure`); fallback: keep `<button aria-pressed>` with no
    `role` override and drop `role="listbox"` from the wrapper.
11. **Fix `aria-progressbar-name`** (same rebuild). Either give
    `<p class="mtfs-step-label">Step 1 of 4 · Service</p>` an `id` and add `aria-labelledby` to the
    track, or delete `role="progressbar"` and mark the track `aria-hidden="true"` while making the
    `<p>` an `aria-live="polite"` region.
12. **Stop shipping two live form instances per page** (`lazy-modal`). Never build the popup until
    first user intent; when it is built, ensure the closed state is genuinely `display:none` (the
    author `#mtfs-modal-root{display:flex}` currently defeats `hidden`, §3.3). This alone removes 8
    `aria-allowed-attr` nodes, 1 `aria-progressbar-name` node, ~15 phantom tab stops per page, the
    dead `<span>` stub, and the permanent `MutationObserver`.
13. **Strip all 812 inline `on*` attributes** (`strip-inline-handlers`) and ship the four CSS rules
    of §4.1 keyed on **stable semantic classes** (`.mtfs-footer`, `.mtfs-skip-link`, `.contact-cta`,
    `.btn-primary`, `.btn-link`) — never on `il*`, which collide across pages. Every rule must pair
    `:hover` with `:focus-visible`.
14. **Rebuild the FAQ accordion as a correct disclosure** (`fix-a11y`). Give each `.fa` panel an
    `id`, point `aria-controls` at it from `.fq`, toggle the `hidden` attribute (not `max-height`)
    so collapsed answers leave the accessibility tree, remove the `max-height:400px` truncation, and
    wrap each question button in an `<h3>` so the FAQ is heading-navigable.
15. **Give every `<section>` an accessible name or demote it to `<div>`** (`ssr-chrome` /
    `fix-a11y`). 111 unlabelled sections today; the home page's `aria-labelledby="<heading id>"`
    convention is the template. Priority: `/terms-of-service/` (22), `/privacy-policy/` (17),
    `/about/` (7), `/our-team/` (6), `/sitemap/` (5).
16. **Promote the sitemap's fake headings** (`fix-a11y`). `<p class="sm-sec-title">` → `<h2>`,
    `<div class="sm-card-head">` → `<h3>`, so `/sitemap/` gains a real outline.
17. **Convert card grids from `<article>` to `<ul>/<li>`** (`ssr-chrome`). 16 `<article>` on the home
    page and the equivalents on `/about/`, `/services/`, `/our-team/` and the service pages. Reserve
    `<article>` for the testimonials, which should become
    `<figure><blockquote>…</blockquote><figcaption><cite>…</cite></figcaption></figure>` with the
    star rating given a text equivalent (e.g. `<span class="sr-only">Rated 5 out of 5</span>`).
18. **Add `title="Google Tag Manager"` to the 21 `<noscript>` GTM iframes** (`defer-third-party`).
19. **Add `aria-hidden="true"` to the contact form's `<span class="req">*</span>` markers**
    (`fix-a11y`); `required` already conveys the state.
20. **Delete redundant implicit roles** (`fix-a11y`): `role="contentinfo"` ×21, `role="main"` ×3.
21. **Re-run Lighthouse after passes 6–13** and confirm A11y > 91 and SEO > 92 against the measured
    baseline. Do not report any number that has not been measured on the rebuilt output.

---

## 7. Hard constraints for the build agents

* The SSR header, breadcrumbs, related-links block and footer are **generated from
  `site.config.mjs :: routes`** — never hand-copied. Nav labels come from `navLabel`, panel blurbs
  from `summary`, icons from `navIcons`.
* `render.mjs` output must contain **zero** inline `on*` attributes and **zero** `style=` attributes
  (contract §`render.mjs` Rules). The one `style=` currently in `HEADER_HTML` (the logo `<img>`)
  becomes a `.mm-logo img` rule.
* Exactly **one `<h1>` per page**, never inside `<header>` or `<footer>`.
* Every route keeps its existing canonical URL and trailing slash; the nav/footer/breadcrumb hrefs
  above are the authority for what must still resolve.
* Closed disclosure content must be removed from the accessibility tree with `hidden` /
  `visibility:hidden` / `display:none` — never `opacity:0` or `max-height:0` alone.
