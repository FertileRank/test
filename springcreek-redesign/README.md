# SpringCreek Fertility — Full Website Redesign (all 58 pages)

A unified, production-oriented redesign of **springcreekfertility.com**, delivered in **two formats**
from a single source of truth:

1. **Standalone static site** — a real, deployable multi-page website (shared CSS, global
   `<header>`/nav/`<footer>`, cross-linked pages). Open `index.html` in any browser.
2. **Elementor paste blocks** — per-page scoped `.scf-page` markup + JSON-LD to drop into the
   existing WordPress/Elementor build (in `elementor/`).

Governed by the **SpringCreek Prompt Library** (57-page spec) brand tokens and compliance rules.

---

## What's included

| Path | Purpose |
|------|---------|
| `index.html` + 12 page files | Standalone site (Home, Treatments hub, 3 Locations, IVF & ICSI, Egg Freezing, LGBTQIA+, About, Team, Financing, Contact, Appointment) |
| `assets/css/scf-components.css` | Scoped `.scf-page` design system — **used by both formats**. Bridged to the Elementor kit tokens. |
| `assets/css/scf-site.css` | Site chrome (header/nav/footer/body) — **standalone only**. CSS-only mobile menu + dropdowns (no JS). |
| `elementor/<slug>.html` | One paste block per page (hero + content + per-page JSON-LD). |
| `elementor/_shared-scf-css.html` | The scoped component CSS to add **once** in Elementor. |
| `sitemap.xml` | Canonical live URLs for the redesigned pages. |
| `_build/` | The Python generator that produces both outputs from per-page content (so the two never drift). Run `python3 _build/build.py` to rebuild. |

---

## Pages in this build — all 58

The complete site is built and cross-linked (see `sitemap.xml` for every canonical URL):

| Group | Count | Pages |
|-------|-------|-------|
| Homepage + Locations pillar | 2 | Home, Locations hub |
| Location centers | 3 | Dayton, Columbus, Cincinnati |
| Service pages | 14 | Fertility Treatment overview, IVF & ICSI, IUI, Egg Freezing, Fertility Preservation, PGT, Donor Egg, Donor Sperm, Embryo Donation, Gestational Surrogacy, Third-Party Reproduction, Recurrent Miscarriage, LGBTQIA+ Family Building, IVF Laboratory |
| Provider bios | 5 | Groll, Reynolds Marelić, Graves-Herring, McMillan, Cuy Castellanos |
| About & practice | 4 | About, Our Fertility Center, Fertility Specialist, Take a Tour |
| Resource hubs | 6 | New Patient Resources, Referring Providers, Staying Connected, Fertility Library, Fertility Resources, Blog |
| Educational articles | 9 | Fertility FAQs, Acronym Guide, Infertility Defined, What Causes Infertility, Quick Facts, Myths, Tips to Get Pregnant Faster, Tips to Optimize Fertility, Fertility Foods |
| Financial | 5 | Fertility Cost, Financing Options, Insurance Benefits, Discount Programs, Refund Programs |
| Conversion | 3 | Request an Appointment, Contact, Become an Egg Donor |
| Social proof | 2 | Testimonials, IVF Success Rates |
| Utility & legal | 4 | Careers, Patient Portal, Privacy Policy, COVID-19 Notice |
| **Team page** | 1 | Fertility Specialists (team) |

**Two design systems, one brand:** the **Home + 5 location pages** use the client's Brand v2 `.scl` /
`.scf-home` blocks (rewired to the Global CSS). The **other 52 pages** use the `.scf-page` component
system. Both bridge to the same Elementor kit tokens (navy `#183356` / green `#90C962`, Lora / Work
Sans), so the site is visually cohesive. Standalone links are relative; Elementor blocks use absolute
live URLs. Verified: **no legacy-palette colors · 0 blocked keywords · all JSON-LD valid · all internal links resolve · no
JS except JSON-LD** (the client's homepage keeps its optional lucide icon script).

---

## Brand & design system (from the Prompt Library)

- **Colors:** Navy `#183356` (primary), soft blue `#A7D8F1` / `#60B9E5` (secondary), green `#90C962`
  (accent), text `#2D2D2D`, cream `#FCF9F0`. Every color **bridges** to the live Elementor kit
  (`--e-global-color-*`) with a hardcoded fallback. Two documented accessibility derivations exist
  accessibility: `#3F6B22` (dark green for green text/links) and `#55606b` (muted body text).
- **Type:** **Lora** headings, **Work Sans** body — bridged to `--e-global-typography-*` and loaded via a
  `<head>` font link (optional in Elementor, which already enqueues them).
- **Hero:** white text on a navy overlay, per the brand rule.
- **Links:** inline links use **navy text with a green underline** (the brand green fails WCAG AA as
  text on white, so it is never used for link text itself).
- **No JavaScript** anywhere except the JSON-LD `<script>` blocks. The mobile menu and dropdowns use a
  CSS-only checkbox/`:focus-within` pattern; FAQs use native `<details>`.

### Deploy the Elementor blocks
1. **Once:** paste `elementor/_shared-scf-css.html` into *Elementor → Site Settings → Custom CSS* (do
   **not** add `scf-site.css` — the theme owns the header/footer).
2. **Per page:** paste that page's JSON-LD `<script>` into the page `<head>`, then paste the markup
   into an Elementor **HTML widget**.

---

## Compliance

- **Blocked Keywords scan: 0 matches** across all pages (with the client-specific override applied).
- **Client overrides honored (per the Prompt Library):** in-house IVF **laboratory** language is
  permitted and used accurately (no outcome guarantees). PGT is phrased as *"genetic testing
  coordinated through our embryology laboratory"* — never "we perform PGT in-house."
- **No superlatives, outcome promises, or absolute clinical claims.** Acronyms (IVF, ICSI, IUI, REI,
  OB/GYN, PGT, OHSS, SART, HCLD, WHNP) are spelled out on first use.
- **Inclusive** language throughout; diverse family structures; LGBTQ+ affirming.
- **HIPAA:** no patient-identifiable data; forms warn against sending PHI. **FTC:** testimonial
  disclaimer included. **WCAG:** color/contrast choices documented above; skip-link, focus styles, and
  semantic landmarks present.
- **Providers** are verified from the Brand Vault/Prompt Library: Jeremy Groll, MD (NPI 1356332357);
  Kasey Reynolds Marelić, MD (NPI 1538467683); Jennifer Graves-Herring, PhD, HCLD; Emily McMillan,
  WHNP; Julie Cuy Castellanos, WHNP-BC.

### `// VERIFY` before go-live
Columbus & Cincinnati office hours · embedded Google Maps per location · IVF "starting at" figure on
`/fertility-cost/` · financing/discount/refund partners and terms · wire the contact & appointment
forms to a secure, HIPAA-appropriate handler · populate or omit AggregateRating with real review data ·
confirm the full current team roster.

---

## Rebuild / extend

```bash
python3 _build/build.py     # regenerates all standalone pages + Elementor blocks
```
To add a long-tail page, copy a page dict in the matching `_build/content_*.py`, edit its content and
JSON-LD, add it to the module's `PAGES`, and rebuild. The header/nav/footer and CSS are shared, so new
pages inherit the design system automatically.

---

## Brand v2 update — client-supplied location pages + homepage (CSS rewired to Global CSS)

The following pages were replaced/added using the client's attached Brand v2 HTML, with their
CSS **rewired to the SpringCreek Global CSS** (no legacy palette):

| Page | Source | Notes |
|------|--------|-------|
| Homepage (`index.html`) | attached `homepagebody.elementor.html` | legacy palette tokens → navy/green via `--e-global-color-*`; Playfair/Open Sans/Poppins → **Lora/Work Sans**; green CTAs + navy-with-green-underline links added. |
| Locations pillar (`locations.html`) | attached `locationshub` | New hub page; nav "Locations" now points here. |
| Dayton (`dayton-fertility-center.html`) | **built to match** | No Dayton file was provided, so it was authored in the identical `.scl` Brand v2 style (founding center + on-site IVF lab focus). |
| Columbus (`columbus-fertility-center.html`) | attached | Verbatim, CSS rewired. |
| Cincinnati (`cincinnati-fertility-center.html`) | attached | Verbatim, CSS rewired. (Two identical Cincinnati files were supplied; one was used.) |

**CSS rewiring (all five):** the `.scl`/`.scf-home` scoped tokens now bridge to `--e-global-color-primary`
(navy `#183356`), `--e-global-color-accent` (green `#90C962`), `--e-global-color-secondary` (blue `#A7D8F1`),
`--e-global-color-126eaba` (blue `#60B9E5`), `--e-global-color-dbe2b42` (cream), `--e-global-color-1d0b13d`
(mint), `--e-global-color-text`, `--e-global-color-b86a1f1` (border); fonts bridge to
`--e-global-typography-primary-font-family` (Lora) / `-text-` / `-accent-` (Work Sans). **Zero legacy-palette colors**, verified.

**Compliance edits applied to the supplied copy** (superlatives the Blocked Keywords Library prohibits):
"leading Cincinnati IVF clinic experience" → "an advanced Cincinnati IVF experience"; "leading-edge science"
→ "advanced science"; "Leading-edge reproductive technology" → "Advanced reproductive technology";
"leading vitrification" → "advanced vitrification".

**Notes / `// VERIFY`:**
- The homepage uses **lucide** icons via CDN (`data-lucide` + one `<script>`). This is the client's file; icons are decorative (`aria-hidden`). Say the word and I'll swap them for inline SVG to keep the page fully JS-free (matching the location pages).
- `aggregateRating` on the location pages uses the client's real Google data (Dayton 4.5/177, Columbus 4.4/63, Cincinnati 4.2/21) — refresh periodically.
- Confirm Columbus hours (supplied as Mon–Fri 7:30 AM–3:30 PM) and the Cincinnati suite (225).
- The supplied pages describe the practice as "physician-owned" — confirm against current ownership before publish.
