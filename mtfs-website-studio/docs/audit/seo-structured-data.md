# SEO & Structured-Data Audit — medtech4solutions.com Website Studio export

**Scope:** all 21 HTML pages of the read-only export at
`/tmp/claude-0/-home-user-test/da065df0-1665-52a8-b803-716d1ee66e9a/scratchpad/src/source-export/`,
plus `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `_redirects`, `_headers`.

**Method:** every value in this document was extracted mechanically, not by eye. The extractor
(`scratchpad/audit/extract.mjs`, zero-dependency Node ESM) parses `<head>` meta/link tags, every
`application/ld+json` block, every heading, and every `<a href>` in all 21 files and emits
`scratchpad/audit/pages.json`. Lighthouse figures are read from the measured run in
`scratchpad/lh-mobile.json` (mobile, LH 12.8.2) — no performance number in this document is estimated.

**Headline numbers**

| Metric | Value |
|---|---|
| Pages audited | 21 (20 indexable + `/404/`) |
| Pages with a self-referencing canonical | 21 / 21 ✅ |
| Pages with `og:image` | **0 / 21** |
| Pages with `twitter:image` / `twitter:title` / `twitter:description` | **0 / 21 each** |
| Pages with `og:locale` | **0 / 21** |
| Pages with **no** `robots` meta at all | **11 / 21** |
| Pages whose BreadcrumbList depth matches the URL path | **7 / 21** (only **5** are also correctly labelled) |
| Pages with a *visible* breadcrumb `<nav>` | **1 / 21** (`/sitemap/` only) |
| Pages with a `<main>` landmark | **3 / 21** (`/`, `/our-team/`, `/sitemap/`) |
| Pages with a `<header>` or primary `<nav>` in the HTML | **0 / 21** |
| Pages with a `WebSite` JSON-LD node | **0 / 21** |
| `sitemap.xml` ↔ `llms.txt` ↔ route set agreement | exact (20 = 20, both correctly omit `/404/`) ✅ |
| Measured Lighthouse SEO category | **92** (`link-text` audit scores **0**) |

---

## 1. Per-page inventory

### Table A — titles, descriptions, canonical, robots
| # | Route | Title (len) | Meta description len | Canonical | robots meta |
|---|---|---|---|---|---|
| 1 | `/` | IVF Lab Management & ART Practice Solutions \| MedTech **(53)** | 192 | self ✓ | `index, follow, max-image-preview:large` |
| 2 | `/about/` | About MedTech For Solutions \| IVF & ART Industry Specialists Since 2005 **(71)** | 214 | self ✓ | `index, follow, max-image-preview:large` |
| 3 | `/our-team/` | Our Team \| MedTech For Solutions ART Industry Experts **(53)** | 160 | self ✓ | `index, follow, max-image-preview:large` |
| 4 | `/contact/` | Contact MedTech For Solutions \| Schedule a Consultation **(55)** | 179 | self ✓ | `index, follow, max-image-preview:large` |
| 5 | `/services/` | Services for Fertility Clinics \| MedTech For Solutions **(54)** | 189 | self ✓ | `index, follow, max-image-preview:large` |
| 6 | `/services/lab-solutions/` | IVF Laboratory Solutions \| MedTech For Solutions **(48)** | 187 | self ✓ | `index, follow, max-image-preview:large` |
| 7 | `/services/lab-solutions/gpo-purchasing/` | GPO Purchasing for Fertility Clinics \| MedTech For Solutions **(60)** | 178 | self ✓ | **absent** |
| 8 | `/services/lab-solutions/practice-development/` | IVF Practice Development Services \| MedTech For Solutions **(57)** | 184 | self ✓ | **absent** |
| 9 | `/services/lab-solutions/real-time-monitoring/` | Real-Time IVF Lab Monitoring \| MedTech For Solutions **(52)** | 178 | self ✓ | **absent** |
| 10 | `/services/lab-solutions/regulatory-compliance/` | Regulatory Compliance \| MedTech For Solutions **(45)** | 161 | self ✓ | **absent** |
| 11 | `/services/lab-solutions/staffing-solutions/` | IVF & ART Laboratory Staffing Solutions \| MedTech **(49)** | 162 | self ✓ | **absent** |
| 12 | `/services/management-services/` | Management Services \| MedTech For Solutions **(43)** | 141 | self ✓ | **absent** |
| 13 | `/services/management-services/accounting-finance/` | Accounting & Finance \| MedTech For Solutions **(44)** | 145 | self ✓ | **absent** |
| 14 | `/services/management-services/call-center/` | Call Center \| MedTech For Solutions **(35)** | 160 | self ✓ | **absent** |
| 15 | `/services/management-services/human-resources/` | Human Resources \| MedTech For Solutions **(39)** | 170 | self ✓ | **absent** |
| 16 | `/services/management-services/insurance-risk-management/` | Insurance & Risk Management \| MedTech For Solutions **(51)** | 151 | self ✓ | **absent** |
| 17 | `/services/management-services/marketing/` | Marketing \| MedTech For Solutions **(33)** | 163 | self ✓ | **absent** |
| 18 | `/sitemap/` | Sitemap \| MedTech For Solutions **(31)** | 186 | self ✓ | `index, follow, max-image-preview:large` |
| 19 | `/privacy-policy/` | Privacy Policy \| MedTech For Solutions **(38)** | 211 | self ✓ | `index, follow` |
| 20 | `/terms-of-service/` | Terms of Use \| MedTech For Solutions **(36)** | 198 | self ✓ | `index, follow` |
| 21 | `/404/` | Page Not Found (404) \| MedTech For Solutions **(44)** | 143 | self ✓ | `noindex, follow` |

### Table B — social + hreflang
| # | Route | og:type | og:title | og:description | og:site_name | og:url | og:image | og:locale | tw:card | tw:title | tw:desc | tw:image | tw:url | hreflang |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/` | y | y | y | y | y | — | — | y | — | — | — | y | x-default |
| 2 | `/about/` | y | y | y | — | y | — | — | y | — | — | — | y | x-default |
| 3 | `/our-team/` | y | y | y | y | y | — | — | y | — | — | — | y | x-default |
| 4 | `/contact/` | y | y | y | — | y | — | — | — | — | — | — | y | x-default |
| 5 | `/services/` | — | — | — | — | y | — | — | — | — | — | — | y | x-default |
| 6 | `/services/lab-solutions/` | y | y | y | — | y | — | — | y | — | — | — | y | x-default |
| 7 | `/services/lab-solutions/gpo-purchasing/` | — | — | — | — | y | — | — | — | — | — | — | y | x-default |
| 8 | `/services/lab-solutions/practice-development/` | — | — | — | — | y | — | — | — | — | — | — | y | x-default |
| 9 | `/services/lab-solutions/real-time-monitoring/` | — | — | — | — | y | — | — | — | — | — | — | y | x-default |
| 10 | `/services/lab-solutions/regulatory-compliance/` | — | — | — | — | y | — | — | — | — | — | — | y | x-default |
| 11 | `/services/lab-solutions/staffing-solutions/` | — | — | — | — | y | — | — | — | — | — | — | y | x-default |
| 12 | `/services/management-services/` | — | — | — | — | y | — | — | y | — | — | — | y | x-default |
| 13 | `/services/management-services/accounting-finance/` | — | — | — | — | y | — | — | y | — | — | — | y | — |
| 14 | `/services/management-services/call-center/` | — | — | — | — | y | — | — | y | — | — | — | y | — |
| 15 | `/services/management-services/human-resources/` | — | — | — | — | y | — | — | y | — | — | — | y | — |
| 16 | `/services/management-services/insurance-risk-management/` | — | — | — | — | y | — | — | y | — | — | — | y | — |
| 17 | `/services/management-services/marketing/` | — | — | — | — | y | — | — | y | — | — | — | y | — |
| 18 | `/sitemap/` | y | y | y | y | y | — | — | y | — | — | — | — | — |
| 19 | `/privacy-policy/` | — | — | — | — | y | — | — | — | — | — | — | — | — |
| 20 | `/terms-of-service/` | — | — | — | — | y | — | — | — | — | — | — | — | — |
| 21 | `/404/` | y | y | y | y | y | — | — | y | — | — | — | — | — |

### Table C — JSON-LD, BreadcrumbList, H1
| # | Route | JSON-LD blocks | Top-level @types | @ids declared | BreadcrumbList | Trail as shipped | Correct? | H1 |
|---|---|---|---|---|---|---|---|---|
| 1 | `/` | 4 | Organization + ProfessionalService + FAQPage + BreadcrumbList + WebPage | `/#organization`<br>`/` | y | Home | **no** — 1-item stub | IVF Laboratory Management & ART Practice Solutions for Fertility Clinics |
| 2 | `/about/` | 3 | AboutPage + BreadcrumbList + WebPage | `/#organization`<br>`/about/` | y | Home › About | yes | The ART Industry's Most Trusted Partner |
| 3 | `/our-team/` | 3 | Organization + LocalBusiness + BreadcrumbList + WebPage | `/#organization`<br>`/our-team/` | y | Home › Staff | **no** — label `Staff` ≠ page name `Our Team` | MedTech For Solutions — ART & IVF Laboratory Management Experts |
| 4 | `/contact/` | 3 | ContactPage + BreadcrumbList + WebPage | `/#organization`<br>`/contact/` | y | Home › Contact | yes | Contact MedTech For Solutions — IVF Laboratory & ART Practice Consulting |
| 5 | `/services/` | 3 | Service + BreadcrumbList + WebPage | `/#organization`<br>`/services/` | y | Home › Services | yes | IVF Laboratory and ART Practice Services |
| 6 | `/services/lab-solutions/` | 3 | Service + BreadcrumbList + WebPage | `/#organization`<br>`/services/lab-solutions/` | y | Home › Laboratory Solutions | **no** — 2 of 3 levels | IVF Laboratory Solutions for ART Practices |
| 7 | `/services/lab-solutions/gpo-purchasing/` | 3 | Service + BreadcrumbList + WebPage | `/#organization`<br>`/services/lab-solutions/gpo-purchasing/` | y | Home › Laboratory Solutions › GPO Purchasing | **no** — 3 of 4 levels | IVF Group Purchasing Organization for Fertility Clinics |
| 8 | `/services/lab-solutions/practice-development/` | 3 | Service + BreadcrumbList + WebPage | `/#organization`<br>`/services/lab-solutions/practice-development/` | y | Home › Laboratory Solutions › Practice Development | **no** — 3 of 4 levels | Fertility Practice Development & IVF Laboratory Design |
| 9 | `/services/lab-solutions/real-time-monitoring/` | 3 | Service + BreadcrumbList + WebPage | `/#organization`<br>`/services/lab-solutions/real-time-monitoring/` | y | Home › Laboratory Solutions › Real-Time Monitoring | **no** — 3 of 4 levels | Real-Time IVF Laboratory Monitoring & Equipment Tracking |
| 10 | `/services/lab-solutions/regulatory-compliance/` | 3 | Service + BreadcrumbList + WebPage | `/#organization`<br>`/services/lab-solutions/regulatory-compliance/` | y | Home › Laboratory Solutions › Regulatory Compliance | **no** — 3 of 4 levels | IVF Laboratory Regulatory Compliance — FDA, CLIA, CAP & AABB |
| 11 | `/services/lab-solutions/staffing-solutions/` | 3 | Service + BreadcrumbList + WebPage | `/#organization`<br>`/services/lab-solutions/staffing-solutions/` | y | Home › Laboratory Solutions › Staffing Solutions | **no** — 3 of 4 levels | ART & IVF Laboratory Staffing Solutions |
| 12 | `/services/management-services/` | 2 | Service + BreadcrumbList | `/#organization` | y | Home › Management Services | **no** — 2 of 3 levels | Fertility Practice Management Services for IVF Clinics |
| 13 | `/services/management-services/accounting-finance/` | 2 | Service + BreadcrumbList | `/#organization` | y | Home › Management Services › Accounting & Finance | **no** — 3 of 4 levels | Financial Oversight & Clarity |
| 14 | `/services/management-services/call-center/` | 2 | Service + BreadcrumbList | `/#organization` | y | Home › Management Services › Call Center | **no** — 3 of 4 levels | Fertility Clinic Call Center & Patient Communication Services |
| 15 | `/services/management-services/human-resources/` | 2 | Service + BreadcrumbList | `/#organization` | y | Home › Management Services › Human Resources | **no** — 3 of 4 levels | Human Resources Solutions for Fertility Clinics & IVF Practices |
| 16 | `/services/management-services/insurance-risk-management/` | 2 | Service + BreadcrumbList | `/#organization` | y | Home › Management Services › Insurance & Risk Management | **no** — 3 of 4 levels | Insurance & Risk Management |
| 17 | `/services/management-services/marketing/` | 2 | Service + BreadcrumbList | `/#organization` | y | Home › Management Services › Marketing | **no** — 3 of 4 levels | Data-Driven Marketing Strategies |
| 18 | `/sitemap/` | 2 | Organization + ProfessionalService + BreadcrumbList | `/#organization` | y | Home › Sitemap | yes | Sitemap |
| 19 | `/privacy-policy/` | 1 | BreadcrumbList | — | y | Home › Privacy Policy | yes | Privacy Policy |
| 20 | `/terms-of-service/` | 1 | BreadcrumbList | — | y | Home › Terms of Service | **no** — label ≠ title/`<h1>` *Terms of Use* | Terms of Use |
| 21 | `/404/` | 0 | **none** | — | **n** | — | n/a — `noindex`, none required | We Can't Find That Page |

Legend: `y` = present, `—` = absent. "self ✓" = canonical equals `https://medtech4solutions.com` + route.
Table C's **Correct?** column checks both trail depth against the URL path *and* label agreement with the
page's own title/nav name — 7 of 21 pass on depth, 5 of 21 pass on both.

---

## 2. Title & description length outliers

Thresholds applied: title `<30` too short / `>60` too long; description `>160` too long
(and `<70` flagged as too short — no page trips that floor).

### 2.1 Titles over 60 characters — 1 page

| Route | Len | Actual value | Note |
|---|---|---|---|
| `/about/` | **71** | `About MedTech For Solutions \| IVF & ART Industry Specialists Since 2005` | Truncates in SERP. Suggested 58-char replacement: `About MedTech For Solutions \| ART & IVF Experts Since 2005` |

`/services/lab-solutions/gpo-purchasing/` sits exactly at the 60-char ceiling
(`GPO Purchasing for Fertility Clinics | MedTech For Solutions`) — acceptable, but it is the
only other page with no headroom.

### 2.2 Titles under 30 characters — 0 pages

None. The shortest is `/sitemap/` at 31 (`Sitemap | MedTech For Solutions`). However, five titles
are **brand-dominated**: the descriptive half is shorter than the boilerplate suffix
`| MedTech For Solutions` (23 chars):

| Route | Len | Descriptive part | Chars of real signal |
|---|---|---|---|
| `/services/management-services/marketing/` | 33 | `Marketing` | 9 |
| `/services/management-services/call-center/` | 35 | `Call Center` | 11 |
| `/services/management-services/human-resources/` | 39 | `Human Resources` | 15 |
| `/services/management-services/accounting-finance/` | 44 | `Accounting & Finance` | 20 |
| `/services/lab-solutions/regulatory-compliance/` | 45 | `Regulatory Compliance` | 21 |

These carry no vertical qualifier at all — nothing says *fertility clinic* / *IVF* / *ART*, while
their sibling pages (`/services/lab-solutions/staffing-solutions/`, `/services/lab-solutions/real-time-monitoring/`)
do. Their own `<h1>`s already contain the qualifier (e.g. `/services/management-services/call-center/`
h1 = *"Fertility Clinic Call Center & Patient Communication Services"*), so the titles are strictly
weaker than the page's own on-page heading. Treat as short-title outliers by *information* content
even though they clear the 30-char floor.

### 2.3 Descriptions over 160 characters — 15 of 21 pages

| Route | Len | Overflow |
|---|---|---|
| `/about/` | **214** | +54 |
| `/privacy-policy/` | **211** | +51 |
| `/terms-of-service/` | **198** | +38 |
| `/` | **192** | +32 |
| `/services/` | **189** | +29 |
| `/services/lab-solutions/` | **187** | +27 |
| `/sitemap/` | **186** | +26 |
| `/services/lab-solutions/practice-development/` | **184** | +24 |
| `/contact/` | **179** | +19 |
| `/services/lab-solutions/gpo-purchasing/` | **178** | +18 |
| `/services/lab-solutions/real-time-monitoring/` | **178** | +18 |
| `/services/management-services/human-resources/` | **170** | +10 |
| `/services/management-services/marketing/` | **163** | +3 |
| `/services/lab-solutions/staffing-solutions/` | **162** | +2 |
| `/services/lab-solutions/regulatory-compliance/` | **161** | +1 |

The worst offender, `/about/` (214 chars), is cut mid-clause: everything after
*"…specializing exclusively in assisted reproductive technology (ART)."* is lost, which is precisely
the geographic and audience signal (*"Headquartered in White Plains, NY, supporting fertility clinics
nationwide."*). Six pages are already compliant: `/404/` (143), `/services/management-services/` (141),
`/services/management-services/accounting-finance/` (145), `/services/management-services/insurance-risk-management/` (151),
`/services/management-services/call-center/` (160), `/our-team/` (160).

---

## 3. BreadcrumbList — coverage and correctness

20 of 21 pages ship a `BreadcrumbList`. Only **7** have a trail whose depth matches the URL path, and
2 of those 7 carry a label that contradicts the page — so **5 of 21 are fully correct as shipped**
(`/about/`, `/contact/`, `/privacy-policy/`, `/services/`, `/sitemap/`).

### 3.1 Pages missing BreadcrumbList entirely

| Route | Situation | Correct trail |
|---|---|---|
| `/404/` | **Zero JSON-LD blocks of any kind.** No BreadcrumbList, no Organization, no WebPage. | **None.** `/404/` is `noindex, follow`; a breadcrumb on a soft error page is noise. Do not add one — instead fix its HTTP status (see §7.3). |

### 3.2 Pages whose BreadcrumbList is wrong

**(a) `/` ships a one-item stub.** The home page emits
`BreadcrumbList → [ListItem 1 "Home" → https://medtech4solutions.com/]`. A single-item breadcrumb
describes no path, is ignored by Google, and contradicts the module contract
(`renderBreadcrumbs` "omit on home"). **Correct trail: none — remove the block.**

**(b) 12 pages skip the `/services/` tier.** Every page under `/services/` builds its trail from the
*visual* menu grouping rather than the URL path, so the `Services` hub never appears. The URL is
three segments deep but the trail is three items (Home + 2), and the hub pages are two segments deep
with two items.

| Route | Trail as shipped | **Correct trail** |
|---|---|---|
| `/services/lab-solutions/` | Home › Laboratory Solutions | **Home › Services › Lab Solutions** |
| `/services/lab-solutions/gpo-purchasing/` | Home › Laboratory Solutions › GPO Purchasing | **Home › Services › Lab Solutions › GPO Purchasing** |
| `/services/lab-solutions/practice-development/` | Home › Laboratory Solutions › Practice Development | **Home › Services › Lab Solutions › Practice Development** |
| `/services/lab-solutions/real-time-monitoring/` | Home › Laboratory Solutions › Real-Time Monitoring | **Home › Services › Lab Solutions › Real-Time Monitoring** |
| `/services/lab-solutions/regulatory-compliance/` | Home › Laboratory Solutions › Regulatory Compliance | **Home › Services › Lab Solutions › Regulatory Compliance** |
| `/services/lab-solutions/staffing-solutions/` | Home › Laboratory Solutions › Staffing Solutions | **Home › Services › Lab Solutions › Staffing Solutions** |
| `/services/management-services/` | Home › Management Services | **Home › Services › Management Services** |
| `/services/management-services/accounting-finance/` | Home › Management Services › Accounting & Finance | **Home › Services › Management Services › Accounting & Finance** |
| `/services/management-services/call-center/` | Home › Management Services › Call Center | **Home › Services › Management Services › Call Center** |
| `/services/management-services/human-resources/` | Home › Management Services › Human Resources | **Home › Services › Management Services › Human Resources** |
| `/services/management-services/insurance-risk-management/` | Home › Management Services › Insurance & Risk Management | **Home › Services › Management Services › Insurance & Risk Management** |
| `/services/management-services/marketing/` | Home › Management Services › Marketing | **Home › Services › Management Services › Marketing** |

This is not cosmetic: the missing tier is the same `/services/` hub that Google would otherwise
receive 12 extra internal-link signals for, and the skipped hubs are already the two weakest nodes
in the internal graph (§6).

**(c) Two breadcrumb labels contradict the page they name.**

| Route | Breadcrumb name | Page `<title>` / `<h1>` | Correct |
|---|---|---|---|
| `/our-team/` | **`Staff`** | title *"Our Team \| …"*, nav label *Our Team*, llms.txt *Our Team* | **`Our Team`** |
| `/terms-of-service/` | **`Terms of Service`** | title *"Terms of Use \| …"*, `<h1>` *"Terms of Use"* | Pick one and use it everywhere — recommend **`Terms of Use`** in the breadcrumb and nav, keeping the `/terms-of-service/` URL unchanged |

**(d) Correct as shipped — 5 pages:** `/about/`, `/contact/`, `/services/`, `/sitemap/`,
`/privacy-policy/`. `/our-team/` and `/terms-of-service/` are structurally right but mislabelled
(see (c)), which is why 7 pages pass the depth check but only 5 pass outright. `/` needs removal
(see (a)); `/404/` is correctly absent.

**(e) No page except `/sitemap/` renders a visible breadcrumb.** `/sitemap/` is the only file
containing `<nav aria-label="Breadcrumb">` — indeed the only file containing any `<nav>` element at
all. The other 20 pages assert a breadcrumb trail in JSON-LD that has no visible counterpart. Google's
structured-data policy asks markup to represent visible page content; more practically, a rendered
breadcrumb is the cheapest fix for the hub-underlinking problem in §6.

---

## 4. Schema coverage, gaps and `@id` graph consistency

### 4.1 Coverage matrix

| Type | Pages carrying it | Gap |
|---|---|---|
| `Organization` | `/` (as `["Organization","ProfessionalService"]`), `/sitemap/` (same pair), `/our-team/` (as `["Organization","LocalBusiness"]`), `/about/` (nested in `AboutPage.mainEntity`), and as an inline `provider` stub on all 13 `Service` pages | Never a single canonical node; four different `@type` shapes for one `@id`, declared on 18 pages |
| `ProfessionalService` | `/`, `/sitemap/` only | — |
| `LocalBusiness` | `/contact/` (as `ContactPage.mainEntity`), `/our-team/` | **Missing on `/`**, the page that carries `geo.region`/`geo.placename` meta |
| `WebPage` | 8 pages: `/`, `/about/`, `/our-team/`, `/contact/`, `/services/`, `/services/lab-solutions/` + its 5 children | **Absent on all 6 `/services/management-services/*` pages, `/sitemap/`, `/privacy-policy/`, `/terms-of-service/`, `/404/`** |
| `FAQPage` | `/` only (6 `Question`/`Answer` pairs) | No FAQ block on any service page, though `/services/lab-solutions/gpo-purchasing/` answers three of the home page's six questions in its own body copy |
| `Service` | 13 pages: `/services/`, both hubs, all 10 leaves | Complete ✅ |
| `BreadcrumbList` | 20 pages | `/404/` — correctly absent |
| `WebSite` | **0 pages** | No `WebSite` node exists anywhere on the site |
| `Person` | **0 pages** | `/our-team/` is a leadership page with no `Person` markup and no `employee`/`member` property on its Organization node |
| `OfferCatalog` | `/services/` (2 items), `/services/lab-solutions/` (5), `/services/management-services/` (5) | Complete for hubs ✅ |

### 4.2 `@id` graph — one identifier, four conflicting type declarations across 18 pages

`https://medtech4solutions.com/#organization` is the only shared node identifier on the site. It is
declared on **18 of 21 pages** (absent only from `/privacy-policy/`, `/terms-of-service/` and `/404/`)
and is re-declared with a **different `@type` and a different property set depending on the page**:

| Page | `@type` for `#organization` | Properties carried |
|---|---|---|
| `/` | `["Organization","ProfessionalService"]` | name, alternateName, url, description, foundingDate, telephone, email, address, areaServed, knowsAbout |
| `/sitemap/` | `["Organization","ProfessionalService"]` | same as `/` |
| `/our-team/` | `["Organization","LocalBusiness"]` | — |
| `/contact/` | `LocalBusiness` | + faxNumber `+1-866-482-5058`, geo `41.0534,-73.7629`, openingHoursSpecification Mo–Fr 08:30–18:00 |
| all 13 `Service` pages, and `/about/` (as `AboutPage.mainEntity`) | `Organization` | name, url, telephone **only** |

A consumer merging by `@id` sees `Organization` ∪ `ProfessionalService` ∪ `LocalBusiness` with
`telephone` restated on all 18 pages and `faxNumber`/`geo`/`openingHoursSpecification` reachable only
from `/contact/` — the one page whose typing (`LocalBusiness` alone) drops `ProfessionalService`.
Additional defects on the same node:

- **No `logo`.** `Organization.logo` is required for Google's organization/knowledge-panel handling and is absent everywhere.
- **No `image`.**
- **No `sameAs`.** The site links `https://www.linkedin.com/in/kevinryanofficial/` from the footer of all 21 pages, but that profile is never claimed in `sameAs` — the one social signal the site has is invisible to the graph. (Note it is a *personal* profile, not a company page; the company page should be the `sameAs` target.)
- **`priceRange` absent** on the `LocalBusiness` typing.

### 4.3 `WebPage` node defects (on the 8 pages that have one)

Every `WebPage` node is identical in shape, e.g. `/services/lab-solutions/gpo-purchasing/`:

```json
{"@type":"WebPage","@id":"…/gpo-purchasing/","url":"…/gpo-purchasing/",
 "name":"GPO Purchasing for Fertility Clinics | MedTech For Solutions",
 "mainEntityOfPage":"…/gpo-purchasing/",
 "isPartOf":{"@id":"https://medtech4solutions.com/#organization"}}
```

- **`isPartOf` points at the Organization.** `WebPage.isPartOf` expects a `WebSite` (or `CreativeWork`), not an `Organization`. Because no `WebSite` node exists, this is a dangling, mistyped edge on all 8 pages.
- **`mainEntityOfPage` is self-referential.** A `WebPage` whose `mainEntityOfPage` is its own URL is circular. The correct direction is `WebPage.mainEntity` → the `Service`/`Organization` node, or `Service.mainEntityOfPage` → the page.
- **No `breadcrumb` property.** The `BreadcrumbList` sits in a separate top-level block and is never wired to the `WebPage` via `WebPage.breadcrumb`.
- **No `inLanguage`, no `description`, no `datePublished`/`dateModified`.**

### 4.4 Should `Service` pages carry `Service` + a `provider` `@id` reference? — Yes, and they *partly* do

All 13 `Service` pages already reference the provider by `@id`. The problem is that they **re-inline
the node instead of referencing it**:

```json
"provider":{"@type":"Organization","@id":"https://medtech4solutions.com/#organization",
            "name":"MedTech For Solutions","url":"https://medtech4solutions.com/",
            "telephone":"+1-866-634-9144"}
```

A pure reference is `"provider":{"@id":"https://medtech4solutions.com/#organization"}`. The current
form redefines a globally-identified node with a 3-property subset on 13 pages — the exact pattern
that produced the type conflict in §4.2, and 13 × ~150 bytes of duplicated payload.

Further `Service`-node gaps:

- **No `Service` node has its own `@id`.** There is no `…/gpo-purchasing/#service` handle, so nothing can reference a service from elsewhere, and the hub `OfferCatalog` entries cannot point at the child service nodes.
- **`areaServed` is inconsistent**: present on `/services/`, both hubs and `/services/lab-solutions/gpo-purchasing/` (`Country: United States`), absent on the other 9 leaves. `/` claims `United States` **and** `AdministrativeArea: International`; the services claim US only.
- **Only `/services/lab-solutions/gpo-purchasing/` carries an `Offer`** (`price 0 / USD`, "Free to join"). The other 12 have none — defensible, but it means the one service with pricing data is the only one eligible for offer-related enrichment.
- **`Service` pages under `/services/management-services/` have only 2 JSON-LD blocks** (`Service` + `BreadcrumbList`) versus 3 under `/services/lab-solutions/` (which add `WebPage`) — a build inconsistency, not a design decision.

### 4.5 Stray microdata

Four pages carry `itemscope itemtype="https://schema.org/WebPage"` on `<html>` while 17 do not:
`/`, `/our-team/`, `/sitemap/`, `/services/management-services/insurance-risk-management/`.
(`/` and `/our-team/` also have a JSON-LD `WebPage`; `/services/management-services/insurance-risk-management/`
has the microdata but **no** JSON-LD `WebPage`, and `/sitemap/` likewise.) Two vocabularies describing
the same page, applied at random. Pick one — JSON-LD — and drop the `itemscope`/`itemtype` attributes.

---

## 5. `og:` / `twitter:` completeness

### 5.1 `og:image` is the headline gap — 0 of 21 pages

**Not one page in the export declares `og:image`, `twitter:image`, or `og:locale`.** Verified by
`grep -rlo 'og:image' --include=*.html` returning nothing across all 21 files. Every share of any
MedTech URL on LinkedIn (the company's only linked social channel), Facebook, Slack, iMessage or X
renders with no thumbnail. Compounding it, 12 of 21 pages declare `twitter:card = summary_large_image`
— a card type that *requires* an image — so those pages actively request a large-image card and supply
no image.

### 5.2 Completeness by page

| Tier | Pages | `og:` state |
|---|---|---|
| **Complete-ish** (type + title + description + url; still no image/locale) | `/`, `/404/`, `/our-team/`, `/sitemap/` — plus `og:site_name` | 4 pages |
| **Partial** (type + title + description + url, no `site_name`) | `/about/`, `/contact/`, `/services/lab-solutions/` | 3 pages |
| **`og:url` only** | `/services/`, `/services/lab-solutions/gpo-purchasing/`, `/services/lab-solutions/practice-development/`, `/services/lab-solutions/real-time-monitoring/`, `/services/lab-solutions/regulatory-compliance/`, `/services/lab-solutions/staffing-solutions/`, `/services/management-services/` + all 5 of its children, `/privacy-policy/`, `/terms-of-service/` | **14 pages** |

So two-thirds of the site — including **every single leaf service page**, the pages most likely to be
shared into a clinic administrator's inbox — has a bare `og:url` and nothing else. Scrapers fall back
to the `<title>` and `<h1>`, which on `/services/management-services/marketing/` yields the
9-character *"Marketing"*.

`og:site_name` appears on only 4 of 21 pages; `og:type` on 7 of 21.

### 5.3 `twitter:` completeness

`twitter:title`, `twitter:description`, `twitter:image` and `twitter:site` are **absent on all 21
pages**. Only two keys ever appear:

- `twitter:card` — 12 pages, always `summary_large_image`, never with an image (see §5.1).
- `twitter:url` — 17 pages; missing on `/404/`, `/privacy-policy/`, `/sitemap/`, `/terms-of-service/`.
  `twitter:url` is not a documented X/Twitter card property in the first place — `og:url` already
  serves that role — so 17 pages carry a no-op tag while the four properties that matter are absent.

Where `twitter:url` and `og:url` do both appear they agree with the canonical on every page; there
are **no** canonical/`og:url` mismatches anywhere.

### 5.4 Other head-tag inconsistencies found by the sweep

- **`hreflang`:** 12 pages carry exactly one `<link rel="alternate" hreflang="x-default">` pointing at themselves; 9 pages carry none (`/404/`, `/privacy-policy/`, `/sitemap/`, `/terms-of-service/`, and all 5 `/services/management-services/*` leaf pages). A lone `x-default` with no language alternate and no self-referencing `hreflang="en"` is a no-op — an `hreflang` set needs at least two members to mean anything. The site is monolingual; either emit a consistent `en` + `x-default` pair on all 20 indexable pages, or drop `hreflang` entirely.
- **`robots` meta:** four different states across 21 pages — `index, follow, max-image-preview:large` (7), `index, follow` (2), `noindex, follow` (1), **absent (11)**. Absence defaults to `index, follow`, so nothing is de-indexed, but 11 pages silently forgo `max-image-preview:large`.
- **`viewport`:** three different spellings — `width=device-width, initial-scale=1.0` (14), `width=device-width,initial-scale=1.0` (6), `width=device-width,initial-scale=1` (1).
- **`meta keywords`:** present on exactly 4 pages (`gpo-purchasing`, `practice-development`, `real-time-monitoring`, `staffing-solutions`). Ignored by Google since 2009; remove.
- **`geo.region` / `geo.placename`:** on 3 pages (`/`, `/our-team/`, `/sitemap/`) — but **not on `/contact/`**, the one page with an address, geo-coordinates and opening hours. Backwards.
- **No `<meta name="author">`, no `theme-color`, no `<link rel="me">` anywhere.**
- **`<html lang="en">` is correct and consistent on all 21 pages** ✅.
- Every page's canonical is self-referencing and absolute ✅; exactly one `rel="canonical"` per page ✅.

---

## 6. Internal-linking graph

Because the primary navigation is 100 % client-side injected (BRIEF §4: 0 `<header>` and 0 `<nav>`
in 20 of 21 pages; `/assets/mega-menu.min.js` builds the header at runtime), the *static* link graph
below is what a non-rendering crawler, an AI crawler, or a Googlebot render-budget miss actually sees.
Counts are distinct linking pages, split into footer links (site-wide) and body links (editorial).

| Route | Body linkers | Footer linkers |
|---|---|---|
| `/contact/` | 20 | 20 |
| `/` | 18 | 20 |
| `/services/lab-solutions/staffing-solutions/` | 13 | 20 |
| `/services/lab-solutions/practice-development/` | 12 | 20 |
| `/services/lab-solutions/regulatory-compliance/` | 12 | 20 |
| **`/services/lab-solutions/`** | **10** | **0** |
| **`/services/management-services/`** | **10** | **0** |
| `/services/lab-solutions/gpo-purchasing/` | 10 | 20 |
| `/services/management-services/accounting-finance/` | 10 | 20 |
| `/services/management-services/human-resources/` | 10 | 20 |
| `/services/lab-solutions/real-time-monitoring/` | 8 | 20 |
| `/services/management-services/insurance-risk-management/` | 8 | 20 |
| `/services/` | 7 | 20 |
| `/services/management-services/call-center/` | 7 | 20 |
| `/services/management-services/marketing/` | 7 | 20 |
| `/our-team/` | 6 | 20 |
| `/about/` | 5 | 20 |
| `/privacy-policy/` | 3 | 20 |
| `/sitemap/` | 3 | 20 |
| `/terms-of-service/` | 3 | 20 |
| **`/404/`** | **1** | **0** |

### 6.1 Orphans

**No true orphans.** Every one of the 21 routes has at least one inbound internal link in the static
HTML. Three near-orphan conditions matter:

1. **`/404/` is linked from exactly one page** (`/sitemap/`). That is the correct amount of linking for an error page — but it means `/404/` is a live, `200 OK`, crawlable URL that is deliberately advertised in the site's HTML sitemap. See §7.3.
2. **`/services/lab-solutions/` and `/services/management-services/` are the only two routes absent from the site-wide footer.** The footer of all 21 pages links 18 of the 21 routes — including all 10 of their *children* — but skips both parents (and `/404/`), plus a `/#testimonials` fragment link. Their entire inbound profile is 10 editorial body links each.
3. **Inverted hierarchy.** Every child outranks its parent in inbound links: `staffing-solutions` has 33 linking pages (13 body + 20 footer) against its parent `lab-solutions`' 10. A crawler's importance model reads the leaves as more central than the hubs. With JS disabled the hubs are reachable only via body prose — no navigational path exists to them at all.

### 6.2 Anchor-text quality

| Problem | Count | Detail |
|---|---|---|
| `"Learn More"` | **26 site-wide** | The only anchor text pointing at all 10 leaf service pages from their hubs, plus `/contact/` |
| `"Get Started"` | **6** | All → `/contact/` |
| Empty link text | **21** (1 per page) | The footer logo link → `/`. Has `aria-label="MedTech For Solutions Home"`, so it passes `link-name`, but contributes zero anchor text to the site's most-linked URL |

This is **measured, not inferred**: the Lighthouse run scores the SEO `link-text` audit **0**, listing
five `"Learn More"` links (to `marketing`, `call-center`, `accounting-finance`, `human-resources`,
`insurance-risk-management`) on the home page alone.

The same links also fail the accessibility audit `label-content-name-mismatch` (score **0**): the
markup is `<a href="/services/management-services/marketing/" class="lk" aria-label="Marketing">Learn More</a>`
— the accessible name (*"Marketing"*) does not contain the visible text (*"Learn More"*), which breaks
voice-control users and is a WCAG 2.5.3 failure. Fixing the anchor text fixes both audits at once:
make the visible text *"Explore Marketing for fertility clinics"* and drop the `aria-label`.

### 6.3 Other graph observations

- **One broken internal href:** `/sitemap/` links to `/sitemap.xml` with the anchor text *"XML sitemap"*. The file exists at the site root, so it resolves — but it is the only `<a href>` in the export whose target is not a route, and any link validator that only knows the route manifest will flag it. It must be added to `EXTRA_ALLOWED_PATHS` in `build/lib/validate.mjs`.
- **Zero absolute-internal links.** No page links to `https://medtech4solutions.com/...`; all internal hrefs are root-relative with a trailing slash ✅.
- **External link inventory:** `www.linkedin.com` ×21 (footer, personal profile), `register.provista.com?cpId=…` ×3 (GPO registration, off-site), `maps.google.com` ×2, `edpb.europa.eu` ×1 and `ico.org.uk` ×1 (privacy policy). None carry `rel` attributes.
- **`/#testimonials` is linked from every footer** and the fragment target genuinely exists (`<section id="testimonials">` on `/`), so the `_redirects` entry pointing at it is valid.
- **Heading order is broken on all 21 pages.** Every page jumps `h2 → h4` in the footer (the footer column headings are `<h4>`), and 13 pages jump straight from `<h1>` to `<h3>` or `<h4>` in the first content block: `h1→h4` on `/404/`, `/privacy-policy/`, `/terms-of-service/`; `h1→h3` on all 10 leaf service pages. Lighthouse confirms: `heading-order` scores **0**, citing `footer > div.ftg > div.ftc > h4.il27` ("LAB SOLUTIONS"). Exactly one `<h1>` per page ✅ on all 21.
- **18 of 21 pages have no `<main>` landmark**; only `/`, `/our-team/` and `/sitemap/` have one. There is no skip link anywhere.

---

## 7. `sitemap.xml` / `llms.txt` / `_redirects` / `robots.txt` vs the real route set

### 7.1 What is already consistent ✅

- `sitemap.xml` contains **20 `<loc>` entries**; `llms.txt` links **20 URLs**; both sets are *identical*, in *identical order*, and both correctly omit `/404/`. Every entry resolves to a real exported page.
- `llms-full.txt` (112,391 B) covers the same 20 URLs, one `Source:` line per page — no drift.
- Every `<loc>` uses the canonical trailing-slash form and matches the page's own `rel=canonical`.
- `robots.txt` declares `Sitemap: https://medtech4solutions.com/sitemap.xml` ✅ and Lighthouse's `robots-txt` audit passes.

### 7.2 `_redirects` — trailing-slash disagreement (the `/gpo` vs `/practice` case)

The file mixes two conventions for its 301 targets. Eight rules redirect to a **slash-less** URL,
which the host must then 301 a second time to the canonical trailing-slash form — a two-hop chain on
every legacy inbound link, or a `301 → 404` if the host does not normalise:

| Rule | Target as written | Canonical target | Verdict |
|---|---|---|---|
| `/who-we-are`, `/who-we-are/` | `/about` | `/about/` | ❌ missing slash |
| `/gpo`, `/gpo/` | `/services/lab-solutions/gpo-purchasing` | `/services/lab-solutions/gpo-purchasing/` | ❌ missing slash |
| `/gpo-registration`, `/gpo-registration/` | `/services/lab-solutions/gpo-purchasing` | …`/gpo-purchasing/` | ❌ missing slash |
| `/recruitment`, `/recruitment/` | `/services/lab-solutions/staffing-solutions` | …`/staffing-solutions/` | ❌ missing slash |
| `/practice`, `/practice/` | `/services/lab-solutions/practice-development/` | same | ✅ |
| `/laboratory-solutions`, `/laboratory-solutions/` | `/services/lab-solutions/` | same | ✅ |
| `/temp-staff`, `/temp-staff/` | `/services/lab-solutions/staffing-solutions/` | same | ✅ |
| `/policy`, `/policy/` | `/privacy-policy/` | same | ✅ |
| `/home`, `/home/` | `/` | same | ✅ |
| `/testimonials`, `/testimonials/` | `/#testimonials` | fragment exists on `/` | ✅ |
| `/untitled`, `/untitled/` | `/404/` **status 301** | — | ❌ see §7.3 |

So `/gpo` and `/practice` — two rules five lines apart, both pointing into the same
`/services/lab-solutions/` subtree — disagree on trailing slash. **8 of the file's 22 rules (36 %) are affected**,
and they are the highest-value legacy paths (`/gpo`, `/gpo-registration`, `/recruitment`, `/who-we-are`).

Two further redundancies: `/gpo-registration` and `/gpo` resolve to the identical target, as do
`/recruitment` and `/temp-staff` — but at *different* slash conventions, so the same destination is
reached by two different chains.

### 7.3 `_redirects` — `/untitled → /404/  301` is wrong and risky

`/untitled  /404/  301` issues a **permanent redirect to a page that returns `200 OK`**. Google
records `/untitled` as permanently moved to a valid page whose content says *"We Can't Find That
Page"* — a textbook soft-404, and it makes `/404/` an indexable destination reachable by 301. The
`/404/` page is `noindex, follow`, which mitigates but does not remove the problem: the redirect
still consumes crawl budget and reports success.

**Correct form:** `/untitled  /404/  404` (Netlify serves the body of `/404/` with an HTTP 404
status). Better still, delete the rule and let the platform's own 404 handling take it.

Related: `/404/` is a **crawlable `200 OK` URL in its own right**, listed in the HTML sitemap at
`/sitemap/` and carrying a self-referencing `rel=canonical`. A `noindex` page should not advertise a
canonical to itself and should not be linked from a navigational page.

### 7.4 `robots.txt` — wrong and risky items

1. **`Allow: /_next/static/` and `Allow: /_next/image/`.** These are Next.js internals. This site is a static Search Atlas Website Studio export — there is no `/_next/` directory in the build and never will be. Copy-pasted boilerplate; harmless but misleading, and it signals the file was never written for this site.
2. **`Disallow: /api/` and `Disallow: /admin/`.** Neither path exists in the export. Disallowing non-existent paths advertises directory names that a scanner will then probe.
3. **Per-crawler groups silently drop the `Disallow` rules.** `robots.txt` group matching is *most-specific-wins, not additive*: `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` and `Applebot-Extended` each get a group containing only `Allow: /`, so for those six agents the `Disallow: /api/` and `Disallow: /admin/` from the `*` group **do not apply**. If those disallows ever protect anything real, six named crawlers bypass them.
4. **No `llms.txt` discovery directive.** The file is referenced only inside a `#` comment — invisible to any parser. (Correctly so: there is no standard robots directive for it. Note per BRIEF that `llms.txt` is for third-party AI crawlers only and has no effect on Google Search — the file's own header should say so.)
5. **No `Crawl-delay`, no `Disallow` on the `/404/` page** — the latter is a genuine (small) omission given §7.3.

### 7.5 `sitemap.xml` — content issues

1. **All 20 URLs share the identical hard-coded `<lastmod>2026-08-21</lastmod>`.** A sitemap where every page changed on the same day carries no freshness signal; Google discounts uniform `lastmod`. It must be generated per-page at build time.
2. **`<changefreq>` and `<priority>` are present on every URL.** Google has publicly ignored both since 2023. Harmless, but they should be driven from `routes[].changefreq` / `routes[].priority` in `site.config.mjs` rather than hand-maintained, or dropped.
3. **No `<image:image>` entries** — consistent with the total absence of `og:image`.
4. `/404/` correctly excluded ✅.

### 7.6 `_headers` — two real bugs

1. **The HTML cache rule never matches any page except `/`.** The file declares `/*.html` → `max-age=0, must-revalidate` and `/` → the same. But the site publishes pretty URLs: the document for `/about/` is served at the path `/about/`, which ends in a slash, not in `.html`. **19 of 21 documents match no rule at all** and are served with no `Cache-Control`, falling back to browser heuristic caching. The rule needs to be `/*` (with the asset rules above it winning by specificity) or an explicit per-route list.
2. **One-year `immutable` caching on unhashed filenames.** `/assets/*`, `/*.css` and `/*.js` all get `max-age=31536000, immutable`, but the real asset names are *not* content-hashed: `/assets/mega-menu.css`, `/assets/mega-menu.min.js`, `/assets/mtfs-images.css`, `/assets/book-consultation-modal.min.js`, `/assets/css/fonts.css`. Any future edit to those files can never reach a returning visitor — the browser is instructed never to revalidate. (Only the `/assets/404/*` bundle is hashed, e.g. `route.5fb2523d0a44.css`; that subtree is safe.) `fonts.css` is already being cache-busted by hand with `?v=20260723` on the `<link>`, which is the symptom of exactly this problem.
3. No `Content-Encoding` and no pre-compressed artefacts (BRIEF §3: est. **140 KiB** of text-compression savings measured, document 64,304 B / mega-menu.css 23,785 B / mega-menu.min.js 20,798 B / fonts.css 6,108 B / mtfs-images.css 2,179 B, plus `book-consultation-modal.min.js` 25,882 B). `llms-full.txt` (112,391 B) is likewise uncompressed and matches no `_headers` rule.
4. No security headers of any kind (`X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`).
5. All of the above is in any case defeated by the three `http-equiv` cache meta tags in every page (BRIEF §6), which force a full re-download on every visit.

---

## 8. Numbered remediation list

Ordered by impact-per-unit-effort. Each item names the contract module that owns the fix.

**Tier 1 — structural correctness (do these first; they gate everything else)**

1. **Emit a single canonical `Organization`/`ProfessionalService` node from one place.** Build it once in `artifacts.mjs → organizationJsonLd(cfg)` from `site.config.mjs` (name, legalName, url, description, foundingDate 2005, telephone `+1-866-634-9144`, faxNumber `+1-866-482-5058`, email, full PostalAddress, geo `41.0534,-73.7629`, openingHoursSpecification Mo–Fr 08:30–18:00, areaServed, knowsAbout) and inject the *same bytes* on every page. Add the missing `logo`, `image` and `sameAs`. Kills the four-way `@type` conflict on `#organization` described in §4.2. — `artifacts.mjs`, `render.mjs → renderHeadTags`
2. **Add the missing `WebSite` node** at `@id = {origin}/#website` with `publisher: {"@id": "…/#organization"}` and `inLanguage: "en-US"`, and repoint every `WebPage.isPartOf` at it. Fixes the mistyped dangling edge on all 8 `WebPage` nodes. — `artifacts.mjs`, `render.mjs`
3. **Give every page a `WebPage` node.** 13 pages have none today (all 6 `/services/management-services/*`, `/sitemap/`, `/privacy-policy/`, `/terms-of-service/`, `/404/`). Generate `@id = {canonical}#webpage` (distinct from the page URL), `url`, `name`, `description`, `inLanguage`, `isPartOf → #website`, `breadcrumb → #breadcrumb`, and `primaryImageOfPage`. Drop the self-referential `mainEntityOfPage`. — `render.mjs → renderHeadTags`
4. **Rebuild every `BreadcrumbList` from `breadcrumbTrail(route, graph)`** so the trail is derived from `routes[].parent`, never hand-written. This automatically inserts the missing `Services` tier on all 12 `/services/**` pages (§3.2b), fixes `Staff` → `Our Team` on `/our-team/`, aligns `/terms-of-service/` with its `Terms of Use` title, and drops the 1-item stub on `/`. — `routes.mjs → breadcrumbTrail`, `breadcrumbJsonLd`; `render.mjs → renderBreadcrumbs`
5. **Render a *visible* breadcrumb `<nav aria-label="Breadcrumb">` on all 19 non-home indexable pages** (today only `/sitemap/` has one), wired to the same `breadcrumbTrail` output as the JSON-LD so markup and visible content can never diverge. This is also remediation item 12's cheapest half. — `render.mjs → renderBreadcrumbs`
6. **Convert every `provider` from an inlined node to a pure `@id` reference** — `"provider":{"@id":"https://medtech4solutions.com/#organization"}` — on all 13 `Service` pages, and give each `Service` its own `@id` (`{canonical}#service`) so hub `OfferCatalog` entries can reference their children instead of restating them. Normalise `areaServed` across all 13 (present on 4 today). — `render.mjs → renderHeadTags`

**Tier 2 — the measurable SEO/social gaps**

7. **Ship `og:image`.** Add `defaultOgImage` to `site.config.mjs` and emit `og:image`, `og:image:width`, `og:image:height`, `og:image:alt` and `twitter:image` on all 21 pages — currently **0 of 21**. Until an image exists, downgrade the 12 pages declaring `twitter:card=summary_large_image` to `summary`, so no page requests a card type it cannot fill. — `render.mjs → renderHeadTags`
8. **Complete the OG/Twitter set on the 14 `og:url`-only pages** (§5.2), and add `og:locale=en_US` and `og:site_name` everywhere (4 of 21 today). Replace the 17 no-op `twitter:url` tags with the real `twitter:title` / `twitter:description` (0 of 21 today), defaulting to the page's own `title` / `description` from the route manifest. — `render.mjs → renderHeadTags`
9. **Fix the two length outliers with actual replacement copy.** `/about/` title 71 → `About MedTech For Solutions | ART & IVF Experts Since 2005` (58 chars); rewrite all 15 descriptions over 160 chars (§2.3), worst first: `/about/` 214, `/privacy-policy/` 211, `/terms-of-service/` 198, `/` 192, `/services/` 189. Add a length assertion to `validate.mjs → validateManifest` so the manifest cannot regress. — `site.config.mjs`, `validate.mjs`
10. **Add the vertical qualifier to the five brand-dominated titles** (§2.2) — `Marketing` (33), `Call Center` (35), `Human Resources` (39), `Accounting & Finance` (44), `Regulatory Compliance` (45). Each page's own `<h1>` already contains the right phrasing; lift it. — `site.config.mjs`
11. **Normalise `robots` and `hreflang`.** Emit `index, follow, max-image-preview:large, max-snippet:-1` on all 20 indexable routes (11 have no `robots` meta at all today) and `noindex, follow` on `/404/`. For `hreflang`: the site is monolingual, so emit a consistent `en` + `x-default` self-pair on all 20 indexable pages or drop it entirely — the current lone `x-default` on 12 of 21 pages is a no-op. Also normalise the three `viewport` spellings to one, delete `meta keywords` from the 4 pages that carry it, and move `geo.region`/`geo.placename` off `/sitemap/` and onto `/contact/`. — `render.mjs → renderHeadTags`

**Tier 3 — the internal-link graph**

12. **Put `/services/lab-solutions/` and `/services/management-services/` into the site-wide footer.** They are the only two routes the footer omits, while all 10 of their children are in it — every child currently outranks its own parent (§6.1). Drive the footer from `routes[].inFooter` so the omission cannot recur. — `site.config.mjs`, `render.mjs → renderFooter`
13. **Server-render the primary navigation.** The nav is 100 % JS-injected today (BRIEF §4: 0 `<header>`, 0 `<nav>` in 20 of 21 pages), so the static graph in §6 *is* the crawlable graph. `renderHeader` must emit a real `<header><nav aria-label="Primary">` with descriptive link text and `aria-current="page"`. This is the single largest crawlability change in the rebuild. — `render.mjs → renderHeader`, `html.mjs → ssr-chrome`
14. **Replace all 26 `"Learn More"` and 6 `"Get Started"` anchors with descriptive text.** Lighthouse scores the SEO `link-text` audit **0** on exactly these links. Writing the real destination into the visible text also clears the `label-content-name-mismatch` accessibility failure (score **0**), because the `aria-label="Marketing"` / visible `"Learn More"` mismatch disappears when the `aria-label` is deleted. Add a generic-anchor blocklist to `validate.mjs → validateLinks`. — `html.mjs → fix-a11y`, `validate.mjs`
15. **Fix heading order on all 21 pages.** Demote the footer column `<h4>`s (the `h2 → h4` jump Lighthouse cites at `footer > div.ftg > div.ftc > h4.il27`) and close the `h1 → h3` jump on all 10 leaf service pages and the `h1 → h4` jump on `/404/`, `/privacy-policy/` and `/terms-of-service/` (13 pages in total). — `html.mjs → fix-a11y`
16. **Add `<main id="main">` and a skip link to all 21 pages** — only 3 have a `<main>` today, none has a skip link. — `render.mjs → renderSkipLink`, `html.mjs → ssr-chrome`
17. **Register `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/favicon.ico` and `/assets/*` in `EXTRA_ALLOWED_PATHS`** so the one legitimate non-route link (`/sitemap/` → `/sitemap.xml`, anchor *"XML sitemap"*) does not fail link validation. — `validate.mjs`

**Tier 4 — artefact files**

18. **Normalise every `_redirects` target to the canonical trailing-slash form.** Fix the 8 slash-less rules — `/who-we-are`, `/who-we-are/`, `/gpo`, `/gpo/`, `/gpo-registration`, `/gpo-registration/`, `/recruitment`, `/recruitment/` — which today force a second 301 hop that `/practice`, `/temp-staff`, `/laboratory-solutions` and `/policy` avoid. Generate the file from `redirects[]` in `site.config.mjs` via `artifacts.mjs → redirectsFile(cfg)` and assert in `validate.mjs` that every `to` is an existing route path ending in `/` (or a `/#fragment` whose id exists). — `site.config.mjs`, `artifacts.mjs`, `validate.mjs`
19. **Change `/untitled  /404/  301` to a `404` status rule, or delete it.** A 301 to a `200 OK` "not found" page is a soft-404 that reports success to Google. Also stop linking `/404/` from `/sitemap/` and drop its self-referencing canonical. — `site.config.mjs`, `artifacts.mjs`
20. **Generate per-page `<lastmod>` in `sitemap.xml`.** All 20 URLs currently share the hard-coded date `2026-08-21`, which carries no freshness signal. Drive it from the source page's mtime or the build timestamp via `artifacts.mjs → sitemapXml(routes, graph, cfg, lastmod)`, and drive `changefreq`/`priority` from `routes[]` rather than by hand. — `artifacts.mjs`
21. **Clean `robots.txt`.** Delete the Next.js `Allow: /_next/static/` and `Allow: /_next/image/` lines (no such directory exists in a Website Studio export) and the `Disallow: /api/` / `Disallow: /admin/` lines for non-existent paths. If any disallow is kept, repeat it inside each named AI-crawler group — robots.txt groups are most-specific-wins, not additive, so the six named agents currently bypass the `*` group's rules entirely. — `artifacts.mjs → robotsTxt(cfg)`
22. **Fix the `_headers` HTML rule.** `/*.html` matches none of the 20 pretty-URL documents (`/about/` does not end in `.html`); only `/` gets a `Cache-Control` today. Emit `/*` → `public, max-age=0, must-revalidate` beneath the asset rules. — `artifacts.mjs → headersFile(cfg)`
23. **Stop serving unhashed assets as `immutable`.** `/assets/mega-menu.css`, `/assets/mega-menu.min.js`, `/assets/mtfs-images.css`, `/assets/book-consultation-modal.min.js` and `/assets/css/fonts.css` all receive `max-age=31536000, immutable` under unhashed names — a returning visitor can never receive an update (the hand-rolled `?v=20260723` on `fonts.css` is the existing workaround). Content-hash every emitted asset via `css.mjs → hashName(base, contents)` and keep `immutable` only for hashed names. — `css.mjs`, `artifacts.mjs`
24. **Pre-compress and declare it.** Nothing in the export is pre-compressed and `_headers` sets no `Content-Encoding`; the measured saving is **140 KiB** (BRIEF §3). Run `compress.mjs → precompress(dir, exts)` over `.html/.css/.js/.txt/.xml/.json` — including `llms-full.txt` (112,391 B), which matches no current `_headers` rule. — `compress.mjs`, `artifacts.mjs`
25. **Label `llms.txt` accurately.** Per BRIEF, keep the file but state in its header that it exists for third-party AI crawlers and has no effect on Google Search ranking. `sitemap.xml`, `llms.txt` and `llms-full.txt` already agree exactly on all 20 URLs — regenerate all three from the same `routes[]` array (`inSitemapXml` / `inLlms` flags) so they cannot drift. — `artifacts.mjs → llmsTxt`, `llmsFullTxt`
26. **Drop the stray microdata.** Four pages carry `itemscope itemtype="https://schema.org/WebPage"` on `<html>` and 17 do not; on `/sitemap/` and `/services/management-services/insurance-risk-management/` it is the *only* WebPage typing. Standardise on JSON-LD and strip the attributes. — `html.mjs → strip-builder-ids` (extend) or a dedicated pass

**Tier 5 — additive, once the above is stable**

27. **Add `Person` markup to `/our-team/`** and an `employee` / `member` edge from the Organization node — the page is a leadership page with zero person-level structured data today.
28. **Add a page-level `FAQPage`** to `/services/lab-solutions/gpo-purchasing/`, which already answers three of the home page's six FAQ questions in its body copy; `FAQPage` currently exists only on `/`.
29. **Claim the LinkedIn profile in `sameAs`** (and prefer a company page over the personal profile `linkedin.com/in/kevinryanofficial/` that all 21 footers currently link).
30. **Add security headers** to `_headers` (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`) — none are present today.
