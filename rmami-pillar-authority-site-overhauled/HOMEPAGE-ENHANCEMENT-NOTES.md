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

Other pages in this package were left as-is; this enhancement targets the homepage.
