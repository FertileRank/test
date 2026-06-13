# Performance Max build pack — EggCelle (one campaign per location)

Three PMax campaigns — **Michigan, Ohio, North Carolina** — as a ready-to-assemble build pack.

## ⚠️ Read this first

**1. Google Ads Editor cannot create Performance Max from a CSV import.** Editor can *edit*
existing PMax campaigns, but asset groups, audience signals, listing groups, and image/video assets
are **not** part of its CSV import schema (that schema is for Search/Display/Shopping
campaigns–ad groups–keywords–ads). A hand-built "PMax CSV" will not import. So these files are a
**build pack**, not a one-click import. Two reliable ways to build them:
   - **Native via SearchAtlas (recommended, truly "straight in"):** the `ppc_pmax_*` tools create
     the campaigns, asset groups, text assets, themes, and audience signals directly in the account.
     Ask Claude to build them (they'll be created **Paused** for your review).
   - **Manual in the Google Ads UI:** create each PMax campaign, paste the text from
     `pmax_text_assets.csv`, add sitelinks/callouts/snippets from the other CSVs, upload the
     images/logos/video (see `asset_image_specs.md`), and set the audience signal below. ~15 min each.

**2. Do NOT enable PMax until the conversion-tracking fix is done.** PMax optimizes *hard* toward
your conversion goal. With the current blended/inflated signal (3 co-primary actions — see the main
audit §8), PMax would chase low-value micro-conversions even more aggressively than Search does.
Fix measurement first, then launch. Everything in this pack is set to **Paused**.

## Files
| File | What it holds |
|------|---------------|
| `pmax_campaign_settings.csv` | Per-campaign: type, **Paused**, daily budget, bid strategy, conversion goal, geo ID, language, final URL, URL expansion (Off), brand exclusions. |
| `pmax_text_assets.csv` | All asset-group text (13 headlines, 5 long headlines, 1 short + 4 descriptions, business name, CTA) per location, with char counts vs limits. |
| `pmax_sitelinks.csv` | 4 sitelinks/campaign (text ≤25, two desc lines ≤35, final URL). |
| `pmax_callouts.csv` | 8 callouts/campaign (≤25). |
| `pmax_structured_snippets.csv` | "Service catalog" snippet values (≤25). |
| `asset_image_specs.md` | The image/logo/video specs you must supply (binary — can't be generated as text). |

> Sitelinks, callouts, and structured snippets **are** importable into Google Ads Editor as shared
> assets and can be linked to both your Search and PMax campaigns — handy regardless of how you build
> the PMax shells.

## Recommended settings (already encoded in the CSV)
- **Type:** Performance Max · **Status:** Paused
- **Budget/day:** MI $100 · OH $100 · NC $150 *(start ~= the state's current blended spend; PMax likes ≥ ~3× target CPA to exit learning — adjust to your real qualified-lead CPA)*
- **Bidding:** Maximize conversions to start → **Target CPA** once the corrected goal has data → Max conversion **value** / tROAS only if lead values are trustworthy
- **Conversion goal:** set a **campaign-specific** goal = your single corrected primary (Qualified Lead, else Submit Lead Form). Do **not** leave it on the account-default goal set (that's how the inflated Outbound-Click/pageview conversions leak in)
- **Geo:** MI 21133 · OH 21149 · NC 21137 · Language English · "Presence: people in your targeted locations"
- **Final URL expansion:** **Off** for lead-gen (keep traffic on your application page)
- **Brand exclusions:** apply an EggCelle brand list so PMax doesn't cannibalize the Brand search campaign

## Audience signal (set per location — guides PMax, doesn't restrict it)
Build one **custom segment** per campaign from these "people who searched for" terms, plus the
state name:
`become an egg donor`, `egg donor compensation`, `get paid to donate eggs`, `egg donor requirements`,
`donate eggs for money`, `egg donation {state}`, `how to become an egg donor`.
Layer in **your data** if available (site visitors, prior applicants via Customer Match) and relevant
demographics (women 21–34, where permitted).

> **Compliance flag:** egg donation / fertility falls under Google's restricted personalized-
> advertising / sensitive categories. **Customer Match and some interest/in-market signals may be
> limited or disallowed** — confirm before using first-party or demographic signals.

## After launch — watch for
- **Lead quality / spam:** lead-gen PMax can pull low-quality form fills. Feed back *qualified*
  leads (offline import) so it learns true quality, and review the search-term *insights*.
- **Search cannibalization:** with brand exclusions on, PMax should fill gaps rather than steal
  branded/high-intent Search clicks.
- **Channel mix:** check the asset-group and placement insights weekly for the first month.

Regenerate everything: `python3 ../generate_pmax_files.py`
