# Spring Creek Fertility — Homepage Body

Production-ready **main body** for the Spring Creek Fertility homepage
(`springcreekfertility.com`). Hero is **suggested only**, not built (see below).

Built to the brand design system in `springcreekglobal.css` and grounded in the
SEMrush SEO audit (`springcreekfertilityauditrewrite20260607.md`) plus live
Brand Vault data (Search Atlas MCP).

## Files

| File | What it is | Use it when |
|---|---|---|
| `HomepageBody.tsx` | **Primary** — React + TypeScript + Tailwind component, `lucide-react` icons | React / Next.js / headless builds |
| `tailwind.config.js` | Maps Tailwind utilities (`bg-scf-teal`, `font-display`, …) onto the `springcreekglobal.css` tokens | Required by the `.tsx` |
| `homepage-body.elementor.html` | **Secondary** — self-contained semantic HTML + scoped `<style>` + full JSON-LD | WordPress + Elementor code module / any CMS block |

## Sections (in order)

1. Why Choose Spring Creek Fertility (trust signals + grounded stats)
2. Our Fertility Services (IVF/ICSI, IUI, Egg Freezing, Fertility Testing, Donor, PGT)
3. Your Fertility Journey (5-step timeline)
4. Patient Success Stories (placeholder testimonials)
5. Fertility Education & Resources (placeholder article cards)
6. Insurance & Financing
7. FAQ (accessible accordion + `FAQPage` schema)
8. Final CTA / Appointment Booking

## How to use

### React (primary)
1. Ensure `springcreekglobal.css` is imported globally (it defines the brand
   `--scf-*` tokens and the Playfair Display / Open Sans / Poppins fonts).
2. Merge `theme.extend` from `tailwind.config.js` into your Tailwind config.
3. `npm i lucide-react`, then `import HomepageBody from "./HomepageBody";`
4. Render it below your hero.

### Elementor (secondary)
Paste `homepage-body.elementor.html` into an Elementor **HTML** widget / code
module. It is self-contained (scoped under `.scf-home`) and falls back to brand
values if `springcreekglobal.css` isn't loaded. The JSON-LD `<script>` can stay
inline or move to the page `<head>`.

> Note: the brand name appears as "Spring Creek Fertility" (two words) to match
> the live site; Brand Vault lists "SpringCreek". **VERIFY** the canonical spelling.

## Data grounding & sources

Every factual claim traces to a source — nothing is invented.

| Claim | Source |
|---|---|
| Services list (IVF/ICSI, IUI, egg freezing, preservation, PGT, donor, gestational carrier) | Brand Vault `bv_get_business_info` |
| 3 locations + **geo-coordinates** | Brand Vault `bv_get_details(locations)` |
| Dr. Jeremy Groll credentials (double board-certified REI + OB/GYN; Notre Dame → Wayne State → UNC fellowship; 20+ yrs; 6,500+ families) | Brand Vault `bv_ask` |
| Care team (Groll, Marelić, Cuy Castellanos WHNP-BC, McMillan WHNP) | Brand Vault `bv_ask` |
| Differentiators / UVP / tone (independent, advanced IVF lab, transparent reporting, inclusive, financial support) | Brand Vault `bv_get_business_info` |
| Keyword targets, page strategy, approved FAQ/service copy | SEMrush audit `.md` |
| Colors, type, spacing, components | `springcreekglobal.css` |

## ⚠️ VERIFY before publishing (placeholders)

Sensitive YMYL / FTC / ASRM-SART items are intentionally left as marked
placeholders — confirm with the client / Brand Vault first:

- [ ] **Specific success-rate figures** — omitted until SART/CDC-sourced (cite year + methodology). Do not add guaranteed-outcome language.
- [ ] **Testimonials** — replace the 3 examples with real, **written-consent** patient stories.
- [ ] **Blog/resource cards** — replace titles, `href`s, and images with real published articles.
- [ ] **Per-location phone numbers** — Dayton `(937) 458-5084` is grounded; verify Columbus `(614) 401-4113` and Cincinnati `(513) 457-5200`.
- [ ] **Opening hours** for all three locations (not in Brand Vault).
- [ ] **Dr. Kasey Marelić** board certifications / training detail.
- [ ] **Medical-review date** on the "Medically reviewed by" bar.
- [ ] **Organization `sameAs`** social/GBP profile URLs (`VERIFY_*` tokens in JSON-LD).
- [ ] **Service "Learn more" links** — repoint from `/contact` to dedicated pages (`/ivf`, `/iui`, …).
- [ ] **CTA targets** — `/contact` is a placeholder; wire to the booking flow + live-chat widget.
- [ ] **Replace** `/images/placeholder-resource.webp` with real, optimized WebP images.

## Compliance notes

- No invented statistics, success rates, or credentials.
- No guaranteed-outcome language; testimonials flagged as individual results.
- Medical content attributed to a named, credentialed reviewer (Jeremy Groll, MD).
- `Review` / `aggregateRating` schema deliberately **omitted** — add only with real, verifiable reviews (FTC).

## Accessibility & performance

- Semantic HTML5 landmarks, logical `h2 → h3` hierarchy, `aria-label`/`aria-controls` on the accordion.
- WCAG 2.1 AA intent: focus-visible rings, `prefers-reduced-motion` support, alt text, `role="img"` star ratings.
- `loading="lazy"` + `decoding="async"` + intrinsic `width`/`height` on images.
- Responsive at 375 / 768 / 1280px (mobile-first grids).

---

## Hero section — SUGGESTIONS ONLY (not built)

| # | Headline | Subheadline |
|---|---|---|
| 1 | Your Path to Parenthood Starts Here | Compassionate, expert fertility care in Dayton, Columbus & Cincinnati — with the science, support, and clarity you deserve at every step. |
| 2 | Hope, Backed by Science | Advanced reproductive medicine and a state-of-the-art IVF lab, delivered with genuine warmth across three Ohio centers. |
| 3 | Fertility Care in Ohio, Centered Around You | From your first questions to your next steps, our specialists guide your family-building journey with clarity and kindness. |
| 4 | Every Family Begins With a Conversation | Personalized IVF, IUI, egg freezing, and family-building support for individuals, couples, and the LGBTQIA+ community. |
| 5 | You Don't Have to Navigate This Alone | Trusted Ohio fertility specialists offering expert care, transparent answers, and steady support — close to home. |

### AI hero image prompt
> A warm, hopeful, photorealistic image of a diverse couple sitting together in a
> bright, modern fertility clinic consultation room, softly lit by natural window
> light, looking calm and reassured. Muted teal and cream color palette, shallow
> depth of field, gentle and authentic (not staged), no text. Editorial healthcare
> photography style, soft-focus background suggesting a welcoming medical
> environment. 16:9, high resolution — export as WebP, ~1600×900, under 180 KB
> (use as the LCP image; preload + responsive `srcset`).

## QA checklist

- [x] All 8 sections present and in order
- [x] Compassionate, inclusive, medically-compliant tone
- [x] No unsubstantiated claims / guaranteed outcomes
- [x] Responsive 375 / 768 / 1280px
- [x] Semantic HTML + heading hierarchy
- [x] Icons from `lucide-react` (React) / lucide (HTML)
- [x] Placeholders clearly marked
- [x] Schema.org JSON-LD in the HTML version (valid)
- [x] Both React/Tailwind and Elementor HTML versions provided
