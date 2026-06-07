# RMA of Michigan — Homepage Enhancement Notes

**Prepared:** 2026-06-07 · **Scope:** Homepage (`/index.html`) of the RMA of Michigan pillar authority site.

> **Geography note (important):** The brief that requested this work referred to "RMA **Miami**" and Miami-area keywords. The domain `rmami.com` and this site are in fact **Reproductive Medicine Associates of MICHIGAN** (Troy, MI — "RMAMI" = RMA of **MI**chigan). All work was completed for the **real Michigan practice** (confirmed against the live site). No Miami/Florida data was introduced.

## What changed on the homepage
The previous homepage was a single "pillar guide" article. It was rebuilt into a conversion- and SEO-focused homepage with all standard sections, while reusing the existing design system (`assets/styles.css`, `assets/site.js`) and the site-wide mega-header/footer unchanged.

New/expanded sections (in order):
1. **Hero** — keyword-led H1, empathetic subheadline, two CTAs.
2. **Trust & Credibility Bar** — Since 2006 · 5,000+ babies · 5 board-certified REIs · SART & ASRM member.
3. **In brief (answer-first)** — direct "What is RMA of Michigan?" answer block for AI/voice (`speakable`).
4. **About / Introduction** — founders, mission, what sets the practice apart, memberships.
5. **Services Overview** — 12 service cards (IVF, IUI, egg freezing, donor egg, PGT-A, LGBTQ+, fertility preservation, male infertility, gestational carrier, testing, PCOS, all treatments).
6. **Why Choose RMA of Michigan** — 6 differentiators.
7. **Patient Journey** — 5-step process.
8. **Patient Stories** — FTC-compliant testimonial *framework* + disclaimer (placeholders only).
9. **Insurance & Financing** — transparent cost guidance, grants, medication savings.
10. **FAQ** — 7 Q&As written for LLM/voice search, mirrored in `FAQPage` schema.
11. **Location & Contact CTA** — full NAP, hours, service area.

- Body content: **1,863 words** (min 1,800). **9 CTAs.** Acronyms defined on first use (IVF, IUI, ICSI, PGT-A, AMH, PCOS, ART).
- Compliance: screened against the full Blocked Keywords Library (**0 hits**); inclusive, non-directive, no guarantees; HIPAA-safe (no patient data); FTC testimonial disclaimer included.

## Structured data (JSON-LD)
One valid `@graph` (15 nodes) in the page `<head>`: `MedicalClinic` + `MedicalOrganization` + `LocalBusiness` (combined NAP/geo/hours/areaServed), `WebSite` (SearchAction), `MedicalWebPage`, 5× `Physician`, 5× `MedicalProcedure` (Service equivalents: IVF, egg freezing, IUI, PGT-A, donor egg), `FAQPage`, `BreadcrumbList`. JSON validated — paste-ready.

## ⚠️ VERIFY before launch
- `foundingDate` 2006 and the "5,000+ babies" figure (stated on site; confirm current numbers).
- `geo` coordinates (lat 42.5598, long -83.1457).
- Office hours — confirm holiday/seasonal exceptions.
- Dr. Molly Moravek credential suffix (e.g., M.D., M.P.H.) and `alumniOf`; Dr. Annette Lee `alumniOf`/fellowship and exact years.
- Livonia location address + opening date (Corewell Health Care Center).
- X (Twitter) and Yelp profile URLs.
- **AggregateRating/Review:** an HTML-commented *template* ships in the `<head>`. Do **not** enable until populated with **real** review data (FTC + Google policy). No fabricated ratings were published.
- Add a real logo at `/wp-content/uploads/2026/06/rma-michigan-logo.png` (referenced by `logo`) or update the path.

## Service pages also enhanced
Two top commercial pages were rebuilt to the same standard (richer content, real "how it works" steps, expanded FAQ, cleaner schema, Michigan keywords; screened clean against blocked terms):

- **`/ivf/`** — 1,397-word body, 6 CTAs, 8-item FAQ; `MedicalProcedure` renamed to "In Vitro Fertilization (IVF)" with `howPerformed`; added candidacy, individualized-planning, and cost sections.
- **`/egg-freezing/`** — 1,328-word body, 6 CTAs, 7-item FAQ; `MedicalProcedure` "Egg Freezing (Oocyte Cryopreservation)" with `howPerformed`; added process, candidacy (incl. oncofertility & gender-affirming), and cost sections. The "does freezing ensure a baby" FAQ is answered honestly (no guarantees).

Both reuse the existing design system and the upgraded, entity-consistent `MedicalClinic`/`WebSite` schema nodes.

## All remaining service pages enhanced
15 additional clinical/education service pages were rebuilt to the same standard (answer-first block, "how it works" steps where relevant, candidacy cards, individualized-care depth, cost section, trust signals, related links, expanded FAQ, and a full JSON-LD `@graph`). Each was screened clean against the blocked-keywords list, defines acronyms on first use, and uses inclusive, non-directive language:

`/iui/` · `/donor-egg-ivf/` · `/pgt-a/` · `/lgbtq-fertility/` · `/male-infertility/` · `/fertility-testing/` · `/pcos-and-fertility/` · `/egg-donation/` · `/gestational-carrier/` · `/ovulation-induction/` · `/fertility-surgery/` · `/era-testing/` · `/single-parent-fertility/` · `/fertility-diet-and-nutrition/` · `/fertility-guide/`

**Totals:** 18 pages enhanced (homepage + IVF + egg freezing + the 15 above), each 800–1,900 words. Whole-site validation passed: 51 pages, **0** blocked terms, **0** invalid JSON-LD, **0** broken internal links. Schema entity types per page: `MedicalProcedure` (treatments/tests), `Service` (LGBTQ+, single-parent, egg-donor program), or `MedicalWebPage`-only (the two education pages), each with `FAQPage` + `BreadcrumbList` and the shared `MedicalClinic`/`WebSite` nodes.

Remaining pages (functional/location/team: appointments, forms, portal, billing, careers, financing, insurance, grants, location pages, doctor bios, etc.) were intentionally left as-is — they are not "service" content. Tell me if you'd like those covered too.
