# SpringCreek Fertility — Location Pages (Elementor-ready)

Four copy-paste blocks for SpringCreek Fertility's location SEO, built from **live,
Google-verified business data** (pulled via the Search Atlas Google Business Profile API)
and the practice's public clinical information.

| File | Permalink | Purpose |
|---|---|---|
| `locations-hub.html` | `/locations/` | **Pillar / hub** — "Our Locations" overview that links to all 3 clinics |
| `dayton-fertility-center.html` | `/dayton-fertility-center/` | Dayton (main center) |
| `columbus-fertility-center.html` | `/columbus-fertility-center/` | Columbus (Dublin) |
| `cincinnati-fertility-center.html` | `/cincinnati-fertility-center/` | Cincinnati (Mason) |

## How to use in Elementor

1. Edit the target page → add an **HTML** widget (Elementor Free) or a **Code/HTML** widget.
2. Open the matching `.html` file, **copy the entire contents**, and paste into the widget.
   Each block is fully self-contained: scoped CSS (`.scl` namespace) + markup + JSON-LD.
   It will **not** collide with your theme, Elementor global styles, or the global
   `.scf-*` utility classes.
3. In the page's **SEO settings** (RankMath/Yoast) or **Elementor → Page Settings**, set the
   SEO Title, Meta Description, and Canonical URL listed in the comment block at the top of each
   file. (Meta tags can't live inside an HTML widget, so they must be set at the page level.)
4. Publish. Validate the structured data at <https://search.google.com/test/rich-results>.

> Tip: build one page, then **save it as an Elementor Template** so the styling stays identical
> across all four. Swap the in-page CSS for a single global CSS snippet later if you prefer.

## Brand (Global CSS v2 — Navy / Blue / Green)

These blocks are styled for the refreshed SpringCreek kit and **inherit your global tokens**
(`--scf-navy`, `--scf-green`, `--scf-blue-soft`, `--scf-cream`, `--scf-font-display`,
`--scf-fs-*`, navy-tinted shadows…) via `var(--token, fallback)`. Update a color or font once
in Site Settings / Additional CSS and these pages follow automatically. Fonts are Playfair
Display (headings), Open Sans (body), and Poppins (UI) — reused from the site kit, with
system-font fallbacks if loaded standalone. Heroes use the navy ground / white type per spec;
primary buttons are green with navy text.

## Verified NAP (source: Google Business Profiles, June 2026)

| Clinic | Address | Phone | Hours |
|---|---|---|---|
| Dayton | 7095 Clyo Road, Dayton, OH 45459 | (937) 458-5084 | Mon–Fri 7:00 AM–4:00 PM |
| Columbus | 6760 Avery-Muirfield Dr, Suite A, Dublin, OH 43016 | (614) 401-4113 | Mon–Fri 7:30 AM–3:30 PM |
| Cincinnati | 9313 Mason Montgomery Rd, Suite 225, Mason, OH 45040 | (513) 457-5200 | Mon–Fri 7:00 AM–4:00 PM |

All three are verified Google Business Profiles. **Keep on-page NAP identical to your GBP
listings** — consistency is the single biggest local-ranking factor.

## What's optimized

- **Local SEO** — Target keywords in H1/H2/title/FAQ (e.g. "fertility clinic Dayton", "IVF in
  Dayton, Ohio", "Columbus fertility specialists", "fertility treatment near Columbus",
  "Cincinnati IVF clinic", "infertility support Cincinnati"). Consistent NAP, service-area
  city lists, Google Maps embed, directions + review links, and `MedicalClinic` schema with
  `address`, `openingHoursSpecification`, `areaServed`, and `aggregateRating`.
- **AIO / GEO / LLM** — A "Key Facts" summary box and a schema-backed FAQ give answer engines
  clean, extractable facts; entity-rich copy (cities, services, physicians) and `@graph`
  structured data strengthen entity associations.
- **YMYL / E-E-A-T** — Named, credentialed reproductive endocrinologists (`Physician` schema),
  physician-owned positioning, a medical disclaimer, and factual, non-promissory language.
- **Performance (Core Web Vitals)** — No external libraries, **no JavaScript** (native
  `<details>` accordions), **no `@import` / no extra font requests** (brand fonts are reused
  from your site kit, with system-font fallbacks), lazy-loaded map iframe, lean scoped CSS.
- **UX & CTR** — Sticky-clear CTAs, click-to-call `tel:` links, breadcrumbs, accessible focus
  states, `prefers-reduced-motion` support, and a fully responsive layout.

## Before you publish — quick checklist

- [ ] Replace the placeholder `image` URLs in each JSON-LD block with real clinic/team photos.
- [ ] Confirm the physician roster per location (pages present the REI team as practice-wide).
- [ ] Refresh `aggregateRating` values periodically to match live Google reviews.
- [ ] Add internal links **to** these pages from your homepage, service pages, and footer.
- [ ] Service-area city chips are easily editable — the Dayton page is framed around
      "Greater Dayton" and lists "Fairborn"; adjust the city list to match your target areas.

_Source data retrieved via Search Atlas (Google Business Profile + Local Search) on 2026-06-10._
