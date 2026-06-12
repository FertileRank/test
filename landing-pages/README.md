# EggCelle PPC Landing Pages — by location

One conversion-optimized landing page per market, matched 1:1 to the Google Ads
campaign structure (MI / NC / OH). All three are generated from the **approved
North Carolina page** so styling and Google Ads conversion tracking are identical
across locations — only the location-specific copy, cities, partner clinic, and
schema change.

## Pages & URLs

| URL | File | Market | Partner clinic | Point these campaigns here |
|---|---|---|---|---|
| `eggcelle.com/michigan/` | `michigan/index.html` | Michigan | **RMA of Michigan** (Troy) | `…EggCelle — Michigan`, `…\| NB \| MI \| SKAG` |
| `eggcelle.com/north-carolina/` | `north-carolina/index.html` | North Carolina | Reproductive Specialists of the Carolinas (Charlotte) | `…EggCelle — North Carolina`, `…\| NB \| NC \| SKAG` |
| `eggcelle.com/ohio/` | `ohio/index.html` | Ohio | **SpringCreek Fertility** (Dayton) | `…EggCelle — Ohio`, `…\| NB \| OH \| SKAG` |

Partner clinics are grounded in the live account's own campaign history — the
`OTTO - Ads - RMA …` campaigns (Michigan / RMA) and the `OTTO - Ads - SCF /
EDC SpringCreek` campaigns (Ohio / SpringCreek Fertility).

> The repo root `index.html` is the existing NC page and is left untouched. Its
> canonical already points to `/north-carolina/`, which now exists. Decide whether
> root should stay as-is, redirect to `/north-carolina/`, or become a state
> selector hub — happy to wire up whichever you prefer.

## Each page includes

- Hero with prescreen CTA card, compensation table, eligibility checklist,
  4-step process, city list, testimonial, 6-question FAQ, sticky mobile CTA.
- `Organization` + `Service` + `FAQPage` JSON-LD (location-aware).
- `noindex, follow` (correct for paid-only landing pages).
- **Conversion tracking + attribution forwarding** (identical to the NC page):
  on every "Apply" click it fires the Google Ads conversion and forwards
  `gclid` + all `utm_*` params to `eggdonorconnect.com/donorprescreen`, so the
  prescreen submission ties back to the click.

## ⚠️ Replace before launch (placeholders)

1. **Google Ads conversion ID/label** — every page has `AW-XXXXXXXXX` and
   `AW-XXXXXXXXX/XXXXXXXXX`. Swap in the real conversion ID + the **Submit Lead
   Form** conversion label (the primary goal we standardized on in the PPC import).
2. **Phone numbers** — MI `(248) 555-0142` and OH `(614) 555-0188` are
   **placeholders** (the 555-01xx range reserved for fictional use). Replace with
   each market's real call-tracking number. NC uses the existing `(704) 247-2209`.
3. **Compensation** — all pages use the approved "$8,000 base / up to $10,000 per
   cycle" framing from the NC page. Confirm it's accurate for MI and OH.

## Regenerate

```bash
python3 landing-pages/build_landing_pages.py
```

Edit the `LOCATIONS` list in `build_landing_pages.py` to change cities, partner,
phone, or testimonial; the script rewrites each `<slug>/index.html`.
