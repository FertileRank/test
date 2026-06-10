# SpringCreek Fertility — Website Redesign (Core 12 + Treatments hub)

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

## Pages in this build (13)

| Page | Standalone | Live URL |
|------|-----------|----------|
| Home | `index.html` | `/` |
| Treatments overview | `fertility-treatment.html` | `/fertility-treatment/` |
| Dayton (Centerville) | `dayton-fertility-center.html` | `/dayton-fertility-center/` |
| Columbus (Dublin) | `columbus-fertility-center.html` | `/columbus-fertility-center/` |
| Cincinnati (Mason) | `cincinnati-fertility-center.html` | `/cincinnati-fertility-center/` |
| IVF & ICSI | `ivf-icsi.html` | `/ivf-icsi/` |
| Egg Freezing | `egg-freezing.html` | `/egg-freezing/` |
| LGBTQIA+ Family Building | `lgbtqia-family-building.html` | `/lgbtqia-family-building/` |
| About | `about.html` | `/about/` |
| Our Team | `fertility-specialists.html` | `/fertility-specialists/` |
| Cost & Financing | `financing-options.html` | `/financing-options/` |
| Contact | `contact.html` | `/contact/` |
| Request an Appointment | `appointment.html` | `/appointment/` |

Navigation, footer, and in-page links also point to the remaining live URLs (IUI, PGT, donor pages,
articles, etc.) so the site is fully navigable; those long-tail pages can be built next from the same
templates.

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
