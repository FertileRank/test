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
| Pages with a BreadcrumbList whose depth matches the URL path | **8 / 21** |
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
| 3 | `/our-team/` | 3 | Organization + LocalBusiness + BreadcrumbList + WebPage | `/#organization`<br>`/our-team/` | y | Home › Staff | yes | MedTech For Solutions — ART & IVF Laboratory Management Experts |
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
| 20 | `/terms-of-service/` | 1 | BreadcrumbList | — | y | Home › Terms of Service | yes | Terms of Use |
| 21 | `/404/` | 0 | **none** | — | **n** | — | **missing** | We Can't Find That Page |
