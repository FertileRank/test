# SpringCreek Fertility — Authority Pillar Architecture

A pillar-and-cluster (hub-and-spoke) information architecture. Every node is a **folder
containing a single `index.html`**, giving clean, hierarchical, SEO-friendly URLs and a logical
crawl path (home -> pillar -> cluster, max depth 3-4).

## Why this structure
- **Topical authority:** each pillar consolidates a topic; clusters link up to the pillar and the
  pillar links down to every cluster, concentrating internal-link equity and topical relevance.
- **Clean URLs:** `/treatments/ivf-icsi/` rather than `/ivf-icsi.html` — descriptive, hierarchical,
  and human-readable.
- **Shallow crawl depth:** every page is reachable within 2-3 clicks from the homepage via the global
  nav, pillar hubs, and breadcrumbs (BreadcrumbList schema on every page).
- **Logical navigation:** users move from broad (pillar) to specific (cluster) and back via breadcrumbs.

## Site map (folders -> index.html)

```
/                                   (Home)
/treatments/                      (PILLAR: Fertility Treatments)
  /treatments/donor-egg/
  /treatments/donor-sperm/
  /treatments/egg-freezing/
  /treatments/embryo-donation/
  /treatments/fertility-preservation/
  /treatments/gestational-surrogacy/
  /treatments/iui/
  /treatments/ivf-icsi/
  /treatments/ivf-laboratory/
  /treatments/lgbtqia-family-building/
  /treatments/pgt/
  /treatments/recurrent-miscarriage/
  /treatments/third-party-reproduction/
/locations/                       (PILLAR: Locations)
  /locations/cincinnati/
  /locations/columbus/
  /locations/dayton/
/about/                           (PILLAR: About / Our Practice)
  /about/fertility-specialist/
  /about/our-fertility-center/
  /about/team/
    /about/team/emily-mcmillan/
    /about/team/jennifer-graves-herring/
    /about/team/jeremy-groll/
    /about/team/julie-cuy-castellanos/
    /about/team/kasey-marelic/
  /about/testimonials/
  /about/tour/
/cost-and-financing/              (PILLAR: Cost & Financing)
  /cost-and-financing/discount-programs/
  /cost-and-financing/insurance-benefits/
  /cost-and-financing/refund-programs/
  /cost-and-financing/treatment-cost/
/fertility-library/               (PILLAR: Fertility Library)
  /fertility-library/acronym-guide/
  /fertility-library/fertility-faqs/
  /fertility-library/fertility-foods/
  /fertility-library/getting-pregnant-faster/
  /fertility-library/infertility-defined/
  /fertility-library/ivf-success-rates/
  /fertility-library/myths/
  /fertility-library/optimize-fertility/
  /fertility-library/quick-facts/
  /fertility-library/what-causes-infertility/
/patient-resources/               (PILLAR: Patient Resources)
  /patient-resources/blog/
  /patient-resources/fertility-resources/
  /patient-resources/new-patients/
  /patient-resources/patient-portal/
  /patient-resources/referring-providers/
  /patient-resources/staying-connected/

# Root-level conversion & legal folders:
/appointment/
/become-an-egg-donor/
/careers/
/contact/
/covid-19-notice/
/privacy-policy/
```

## Internal-linking strategy (hub & spoke)
- **Pillar -> clusters:** each pillar `index.html` lists/links every cluster in its topic (cards + body).
- **Cluster -> pillar:** every cluster links up via the breadcrumb (Home / Pillar / Page) and the global nav.
- **Cluster <-> sibling:** related clusters cross-link in-body (e.g., IUI <-> IVF, Donor Egg <-> Third-Party).
- **Global nav + footer** expose all pillars and key clusters on every page.

## Deployment
- Serve so `/<folder>/` resolves to `/<folder>/index.html` (default on Apache/Nginx/most hosts).
- **301-redirect the old flat URLs** to the new hierarchical URLs — see `.htaccess` (48 rules).
- Update canonical tags (already hierarchical in each `index.html`) and resubmit `sitemap.xml`.
- Local preview: `cd springcreek-authority && python3 -m http.server` then open `http://localhost:8000/`.
  (Clean folder links need a server; `file://` will not auto-resolve directory indexes.)

## 301 Redirect map (old flat URL -> new)

| Old URL | New URL |
|---------|---------|
| `/acronym-abbreviation-guide/` | `/fertility-library/acronym-guide/` |
| `/blog/` | `/patient-resources/blog/` |
| `/cincinnati-fertility-center/` | `/locations/cincinnati/` |
| `/columbus-fertility-center/` | `/locations/columbus/` |
| `/dayton-fertility-center/` | `/locations/dayton/` |
| `/discount-programs/` | `/cost-and-financing/discount-programs/` |
| `/doctor-jeremy-groll/` | `/about/team/jeremy-groll/` |
| `/donor-egg/` | `/treatments/donor-egg/` |
| `/donor-sperm-banks/` | `/treatments/donor-sperm/` |
| `/dr-kasey-marelic/` | `/about/team/kasey-marelic/` |
| `/egg-freezing/` | `/treatments/egg-freezing/` |
| `/embryo-donation/` | `/treatments/embryo-donation/` |
| `/emily-mcmillan-whnp/` | `/about/team/emily-mcmillan/` |
| `/fertility-cost/` | `/cost-and-financing/treatment-cost/` |
| `/fertility-faqs/` | `/fertility-library/fertility-faqs/` |
| `/fertility-foods/` | `/fertility-library/fertility-foods/` |
| `/fertility-preservation/` | `/treatments/fertility-preservation/` |
| `/fertility-resources/` | `/patient-resources/fertility-resources/` |
| `/fertility-specialists/` | `/about/team/` |
| `/fertility-treatment/` | `/treatments/` |
| `/financing-options/` | `/cost-and-financing/` |
| `/gestational-surrogacy-carrier/` | `/treatments/gestational-surrogacy/` |
| `/infertility-defined/` | `/fertility-library/infertility-defined/` |
| `/iui/` | `/treatments/iui/` |
| `/ivf-icsi/` | `/treatments/ivf-icsi/` |
| `/ivf-laboratory/` | `/treatments/ivf-laboratory/` |
| `/ivf-success-rates/` | `/fertility-library/ivf-success-rates/` |
| `/jennifer-graves-herring-hcld/` | `/about/team/jennifer-graves-herring/` |
| `/julie-cuy-castellanos-whnp-bc/` | `/about/team/julie-cuy-castellanos/` |
| `/lgbtqia-family-building/` | `/treatments/lgbtqia-family-building/` |
| `/myths-about-fertility-diagnosis/` | `/fertility-library/myths/` |
| `/new-patient-resources/` | `/patient-resources/new-patients/` |
| `/our-fertility-center/` | `/about/our-fertility-center/` |
| `/patient-portal/` | `/patient-resources/patient-portal/` |
| `/pgt/` | `/treatments/pgt/` |
| `/quick-facts-about-infertility/` | `/fertility-library/quick-facts/` |
| `/recurrent-miscarriage/` | `/treatments/recurrent-miscarriage/` |
| `/referring-providers/` | `/patient-resources/referring-providers/` |
| `/refund-programs/` | `/cost-and-financing/refund-programs/` |
| `/specialist/` | `/about/fertility-specialist/` |
| `/staying-connected/` | `/patient-resources/staying-connected/` |
| `/testimonials/` | `/about/testimonials/` |
| `/third-party-reproduction/` | `/treatments/third-party-reproduction/` |
| `/tips-for-getting-pregnant-faster/` | `/fertility-library/getting-pregnant-faster/` |
| `/tips-to-optimize-fertility/` | `/fertility-library/optimize-fertility/` |
| `/tour/` | `/about/tour/` |
| `/understanding-insurance-benefits/` | `/cost-and-financing/insurance-benefits/` |
| `/what-causes-infertility/` | `/fertility-library/what-causes-infertility/` |

## Notes
- `_elementor/` holds the per-page Elementor blocks with internal/JSON-LD URLs updated to the new
  hierarchy (paste-ready; URL-agnostic content otherwise).
- The homepage references a placeholder image `/images/placeholder-resource.webp` (root-relative, depth-
  independent) — add the asset. The homepage also keeps the client's optional lucide icon script.
- Verified: 59 folders each with one `index.html` - no legacy-palette colors - 0 blocked keywords - all JSON-LD valid -
  all relative links resolve - hierarchical canonicals on every page.
