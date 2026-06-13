# EggCelle — Google Ads Audit & Optimization Package

A full audit of the **EggCelle** Google Ads account (CID `602-692-0997`, donor-recruitment) plus a
ready-to-import **Google Ads Editor** restructure implementing the recommendations.

Prepared 2026-06-13 · performance window = trailing 90 days (2026-03-15 → 2026-06-13) · data via the
SearchAtlas PPC integration.

## What's here
| Path | Purpose |
|------|---------|
| `EggCelle-Google-Ads-Audit.md` | The full written audit: executive summary, 8-area findings (current state / issues / recommendations / priority), restructuring plan, and optimized blueprint. |
| `IMPORT_INSTRUCTIONS.md` | Step-by-step Google Ads Editor import guide **+ the manual conversion-tracking fixes** Editor can't do. Read before importing. |
| `generate_editor_files.py` | Deterministic generator for every CSV below (so the build is reviewable and reproducible). |
| `editor-import/01_campaigns.csv` | 4 campaigns (MI / OH / NC donor-recruit + Brand), import **Paused**, daily budget + Maximize-conversions bidding. |
| `editor-import/02_ad_groups.csv` | 22 tightly-themed ad groups (7 per state + Brand Core). |
| `editor-import/03_keywords.csv` | 151 keywords with deliberate Exact/Phrase match types, deduped. |
| `editor-import/04_negative_keywords.csv` | Campaign-level negatives (Core + Competitor rows flagged `REVIEW`). |
| `editor-import/05_responsive_search_ads.csv` | 22 RSAs, diversified copy, headlines ≤30 / descriptions ≤90 chars (validated). |
| `editor-import/06_pause_legacy_campaigns.csv` | Pauses the 8 legacy duplicate campaigns — **run only after the new structure is proven**. |
| `editor-import/negative_keywords_shared_list.txt` | 83 unique negatives, one per line, for the recommended shared-list paste method. |

## TL;DR findings
- **Health: 4/10.** Real volume, but mismeasured, sprawling, and self-competing.
- **Fix measurement first.** 3 co-primary conversion actions of different funnel stages/values are
  blended into one column → reported CVRs of 31–64% are inflated by micro-conversions; Smart Bidding
  is chasing the wrong target. This is a **manual web-UI fix** (Editor can't touch conversions).
- **Stop self-competition.** Each of MI/OH/NC runs 3 overlapping live campaigns + a nationwide one;
  consolidate to one campaign per state.
- **Kill SKAG sprawl.** 130+ single-keyword ad groups → 7 themed ad groups per state.
- **Add a shared negative list.** Buyer/intended-parent, egg-freezing, irrelevant, and competitor
  terms are leaking spend.

## Safety model (important)
- The Editor files **only add Paused campaigns** — importing cannot push live spend.
- Enable deliberately, **pilot one state as an Experiment** (NC = biggest spender), then cut over.
- **Do the conversion fixes before enabling bidding.** See `IMPORT_INSTRUCTIONS.md`.
- Nothing here deletes existing campaigns; legacy ones are *paused* (reversible), never removed.

## Regenerate the CSVs
```bash
python3 generate_editor_files.py
```

> Generated as an advisory package from account data. Keyword lists, copy, and budgets are a strong
> starting point — prune against your own search-term and conversion data after 2–4 weeks.
