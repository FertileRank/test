# SpringCreek Fertility — Homepage Enhancement Package

Production-ready homepage enhancement for **https://www.springcreekfertility.com/**.
Prepared for executive review and deployment to the development server.

## Contents

| File | Purpose |
|------|---------|
| `index.html` | Full enhanced homepage. Scoped, Elementor-compatible HTML + scoped CSS (`.scf-home`) + complete JSON-LD in `<head>`. **No JavaScript except the JSON-LD block.** |
| `keyword-research.md` | Primary, secondary/LSI, local/GEO, and LLM/voice keyword strategy with on-page mapping. |
| `visual-asset-recommendations.md` | 11 visual assets, each with placement, description, SEO value, alt text, and format/size. |
| `README.md` | This file: deployment guide, content audit, `// VERIFY` checklist, internal-links reference table, compliance notes. |

---

## How to deploy (WordPress + Elementor)

1. **Schema:** Copy the entire `<script type="application/ld+json">` block from `index.html` into the page `<head>` (via your SEO plugin's header insert, or an Elementor "Custom Code" entry scoped to the homepage). Resolve the `// VERIFY` items first (see checklist).
2. **Styles + markup:** Paste everything inside `<div class="scf-home"> … </div>` (including the preceding `<style>` block) into a single Elementor **HTML widget** on the homepage. All CSS is namespaced under `.scf-home`, so it will not collide with the theme or other widgets.
3. **Brand tokens:** Colors are declared as CSS custom properties on `.scf-home` and already match the SpringCreek palette. To re-theme, edit the tokens at the top of the `<style>` block only.
4. **Images:** Replace icon glyphs and add the recommended visual assets (see `visual-asset-recommendations.md`). Add an `og:image` once produced.
5. **Meta:** Apply the scrubbed `<title>` and `<meta name="description">` via your SEO plugin (values are in `index.html`).

---

## Step 1 — Content Audit (current homepage vs. enhanced)

| Dimension | Current state (live site) | Finding | Enhancement |
|-----------|---------------------------|---------|-------------|
| Readability | Mixed; some abstract hero copy ("We're determined…") | Moderate | Rewrote at a clear, ~8th-grade level; short paragraphs, bullets, defined acronyms |
| Topical depth | Service list present; thin Q&A | Gap | Added Services, Why Choose, Patient Journey, Pricing, 10-item FAQ (1,900+ words) |
| Emotional resonance | Good ("journey together" themes) | Strength kept | Reinforced compassionate, hopeful, patient-centered voice + approved vocabulary |
| Keyword/GEO coverage | Strong on IVF/Ohio; weak on metro/county/neighborhood + question intent | Gap | Added Centerville/Dublin/Mason, county/region terms, and 10 conversational FAQs |
| CTA effectiveness | CTAs present but generic | Improvement | 8 action-oriented CTAs ("Schedule a Consultation," "Start Your Fertility Journey," etc.) |
| **Metadata compliance** | Meta description reads **"Ohio's leading fertility clinic"**; H2 promises **"the best chance"**; GBP/title variant **"Ohio's Top … Experts"**; About uses **"Award-Winning"** | **CRITICAL** — superlative/outcome language conflicts with the Blocked Keywords Library | Replaced with neutral, benefit-led metadata containing **no** superlatives or outcome claims |
| Schema | Limited structured data | Gap | Added 14-node `@graph` (MedicalOrganization, 3× LocalBusiness/MedicalClinic, 2× Physician, Procedures, FAQPage, WebSite, BreadcrumbList) |

> Per task rules, the blocked terms above are quoted **only** to document existing problematic client
> content in this audit table. None are reused anywhere in the new copy, metadata, or schema.

---

## `// VERIFY` Checklist (resolve before go-live)

These items use placeholder or best-estimate values and are flagged inline in `index.html`:

- [ ] **Geo-coordinates** for all 3 locations (lat/long are best estimates — confirm in Google Maps).
- [ ] **Hours — Columbus (Dublin) & Cincinnati (Mason):** shown as "call to confirm." Dayton confirmed Mon–Fri 7:00 AM–4:00 PM. Update the visible cards and `openingHoursSpecification` once confirmed.
- [ ] **Phone/fax per location:** Dayton (937) 458-5084 / fax (937) 458-5089; Columbus (614) 401-4113; Cincinnati (513) 457-5200 — re-confirm against the live Contact page.
- [ ] **IVF "starting at" price:** confirm the current figure/range on `/fertility-cost/` before quoting a number publicly (page currently says "starts in a defined range").
- [ ] **Financing partners:** confirm the monthly-payment financing partner (Future Family), the discount program (LIVESTRONG Fertility "Sharing Hope"), and current **refund program** terms.
- [ ] **AggregateRating:** the Review/AggregateRating node is a commented-out placeholder. Populate with **real, verifiable** Google Business Profile data, or leave it out. Do **not** publish invented ratings.
- [ ] **Dr. Reynolds Marelić URL:** no `/doctor-…/` page exists yet; her `Physician` schema `url` points to `/fertility-specialists/`. Update if a dedicated bio page is published.
- [ ] **Testimonials:** replace the framework quote with approved, consent-based testimonials (FTC disclaimer already included).

---

## Internal Links Reference Table (for the review workflow)

Counted by exact double-quote match against `href="https://www.springcreekfertility.com/`.
**Total occurrences: 34** = **33 in-body anchor links** + **1 canonical** (`<link rel="canonical">`).
All 19 unique destinations were verified to return **HTTP 200** on the live site.

| # | Anchor text | Destination slug |
|---|-------------|------------------|
| 1 | Schedule a consultation (top bar) | `/appointment/` |
| 2 | Schedule a Consultation (hero) | `/appointment/` |
| 3 | Explore Treatment Options | `/fertility-treatment/` |
| 4 | Start Your Fertility Journey | `/appointment/` |
| 5 | Learn more about our practice | `/about/` |
| 6 | Meet our care team | `/fertility-specialists/` |
| 7 | Learn more (Fertility Evaluation card) | `/fertility-treatment/` |
| 8 | Learn more (IVF card) | `/fertility-treatment/` |
| 9 | Learn more (IUI card) | `/fertility-treatment/` |
| 10 | Learn more (Egg Freezing card) | `/egg-freezing/` |
| 11 | Learn more (Donor & Third-Party card) | `/fertility-treatment/` |
| 12 | Learn more (LGBTQ+ card) | `/lgbtqia-family-building/` |
| 13 | See All Treatment Options | `/fertility-treatment/` |
| 14 | Meet Dr. Groll | `/doctor-jeremy-groll/` |
| 15 | Meet the team | `/fertility-specialists/` |
| 16 | Inclusive care | `/lgbtqia-family-building/` |
| 17 | Schedule Your First Visit | `/appointment/` |
| 18 | Read more patient stories | `/testimonials/` |
| 19 | fertility treatment costs (FAQ #2) | `/fertility-cost/` |
| 20 | LGBTQ+ family building (FAQ #4) | `/lgbtqia-family-building/` |
| 21 | egg freezing (FAQ #6) | `/egg-freezing/` |
| 22 | financing options (FAQ #10) | `/financing-options/` |
| 23 | understanding your insurance benefits (FAQ #10) | `/understanding-insurance-benefits/` |
| 24 | Read more fertility FAQs | `/fertility-faqs/` |
| 25 | Explore Financing Options | `/financing-options/` |
| 26 | insurance benefits (Pricing panel) | `/understanding-insurance-benefits/` |
| 27 | Discount programs | `/discount-programs/` |
| 28 | refund program | `/refund-programs/` |
| 29 | Dayton location details | `/dayton-fertility-center/` |
| 30 | Columbus location details | `/columbus-fertility-center/` |
| 31 | Cincinnati location details | `/cincinnati-fertility-center/` |
| 32 | Contact Our Team | `/contact/` |
| 33 | Schedule a Consultation (final CTA) | `/appointment/` |
| — | Canonical (head) | `/` |

**Outbound authority links (E-E-A-T):** SART (`sart.org`), the SART clinic report
(`sartcorsonline.com/...ClinicPKID=2000067`), and ASRM (`asrm.org`) are referenced in the schema and
are intentionally **not** `nofollow`ed.

---

## Compliance summary

- **Blocked Keywords Library:** automated scan of the full library returns **0 matches** in the new copy, metadata, and schema. Blocked terms appear only inside the audit table above (documenting existing client content).
- **No superlatives / outcome promises / absolute clinical claims.**
- **No unverified in-house lab or PGT claims.** IVF, IUI, egg freezing, donor programs, and genetic testing are described as available services in patient-friendly terms, without asserting where lab work is performed.
- **Acronyms** (REI, OB/GYN, IVF, IUI, SART, PGT) are spelled out on first use.
- **Inclusive language** throughout; no gendered/exclusionary family framing.
- **HIPAA:** no patient-identifiable information. **FTC:** testimonial disclaimer included.
- **Google Spam Policies:** original, single-page enhancement — no cloaking, doorway pages, or keyword stuffing (density ~1–2%).
