# How to import the EggCelle restructure into Google Ads Editor

These CSVs encode the **new, consolidated structure** recommended in
`EggCelle-Google-Ads-Audit.md`. Read this whole page before importing.

## ⚠️ Read first — safety model
- **Every new campaign imports as `Paused`.** Nothing can serve until *you* enable it. Importing is
  therefore non-destructive — it only *adds* paused entities.
- **Enable deliberately, ideally as an Experiment.** Don't flip all three states live at once on a
  ~$65k/90-day account. Pilot one state (North Carolina is the biggest spender) against the current
  setup, then roll out.
- **Conversion fixes are NOT in these files.** Google Ads Editor cannot edit conversion actions.
  The #1 audit finding (measurement) is a manual UI task — see the last section.
- **Geo targeting is documented, not embedded.** CSV location import is unreliable, so set each
  campaign's location in Editor's **Locations** panel after import (IDs below).

## Files (import in this order)
| # | File | What it adds | Editor panel |
|---|------|--------------|--------------|
| 1 | `editor-import/01_campaigns.csv` | 4 campaigns (3 geo + Brand), **Paused**, daily budget, Maximize conversions | Campaigns |
| 2 | `editor-import/02_ad_groups.csv` | 22 themed ad groups | Ad groups |
| 3 | `editor-import/03_keywords.csv` | 151 keywords w/ match types | Keywords |
| 4 | `editor-import/05_responsive_search_ads.csv` | 22 RSAs (≤30-char headlines, ≤90-char descriptions) | Ads |
| 5 | `editor-import/04_negative_keywords.csv` | campaign-level negatives (Core + Competitor-REVIEW) | Negative keywords |
| 6 | `editor-import/06_pause_legacy_campaigns.csv` | pauses 8 legacy duplicates — **run only after cutover** | Campaigns |

Plus `editor-import/negative_keywords_shared_list.txt` — 83 unique terms, one per line, for the
**recommended** shared-list method (below).

## Step-by-step
1. **Download the account.** Open Google Ads Editor → add/refresh the EggCelle account
   (CID 602-692-0997) → *Get recent changes* (full download). Work on a fresh copy.
2. **Import the build.** `Account ▸ Import ▸ From file…` → select `01_campaigns.csv`. Review the
   proposed changes in the preview, confirm column mapping, then **Finish and review** (changes are
   staged locally — not yet posted). Repeat for `02_ad_groups.csv`, `03_keywords.csv`, then
   `05_responsive_search_ads.csv` (ad groups, keywords, ads).
3. **Add the negatives** (pick ONE method):
   - **Recommended — shared list:** in the Google Ads *web UI* → *Tools ▸ Shared library ▸ Negative
     keyword lists* → New list "EggCelle – Master Negatives" → paste
     `negative_keywords_shared_list.txt` → apply the list to all donor-recruitment campaigns. One
     list to maintain, applied everywhere.
   - **Or Editor CSV:** import `04_negative_keywords.csv` into the Negative keywords view. The
     `Category` column tags `Competitor (REVIEW)` rows — delete those before posting if you intend
     to run brand-conquest campaigns instead.
4. **Set geo + language per campaign** (Editor *Locations* / *Languages* panels):
   - Michigan → geo ID **21133**; Ohio → **21149**; North Carolina → **21137**; Brand → the 3 states
     (or US **2840**). Language: **English**. *(Tip: set "Location options" to "Presence: people in
     your targeted locations," not "presence or interest," for local recruiting.)*
   - Replicate the old metro-level targeting later if you want tighter control; whole-state is the
     simpler, recommended start.
5. **Confirm Final URLs.** All ads default to `https://www.eggcelle.com/`. Swap to your application /
   prescreen landing page (e.g., a state-specific LP) before posting — better Quality Score and
   conversion rate. Update `Path 2` if you change the display path.
6. **Post.** `Post` the staged changes. Campaigns go live **Paused**. Verify in the web UI.
7. **Launch as an Experiment.** For the pilot state, create a Campaign Experiment splitting traffic
   between the legacy campaign and the new consolidated one; let it run to significance before
   shifting budget.
8. **Cut over.** Once the new structure wins, import `06_pause_legacy_campaigns.csv` to pause the 8
   legacy duplicates (reversible). Archive the ~30 unused shells afterwards.

## Manual conversion-tracking fixes (do BEFORE enabling bidding) — web UI only
These cannot be done in Editor and are the highest-impact change in the whole audit:
1. *Goals ▸ Conversions ▸ Summary.* Choose **one** primary action for bidding:
   - Use **"Qualified Lead" (Passed-Prescreen, upload)** *if* it is actually receiving offline
     uploads. Check its "All conv." count over the last 30 days — if ~0, it is not wired up.
   - If the upload is empty, set **"Submit Lead Form"** as the single primary instead.
2. Set the other actions (**Prescreen Application** pageview, **Website Outbound Click**) to
   **Secondary** so they report but don't drive bidding.
3. Turn on **Enhanced Conversions for leads** (via Google Tag / GTM) to recover match rate.
4. Standardize conversion **values** (the current 20 / 1 / 1 / 5 mix distorts value-based bidding).
5. Re-baseline your CPAs ~1–2 weeks after the change — expect reported conversions to drop and the
   *true* cost-per-qualified-lead to be higher than today's headline $14–$39.

## Caveats
- Keyword/ad **counts and copy are a strong starting point**, not gospel — prune against your own
  search-term and conversion data after 2–4 weeks.
- The `sell my eggs {state}` keywords are included but historically low-quality/high-CPC; watch them.
- Competitor negatives are **off by default for review** — decide brand-conquest vs. exclusion.
- Re-running `generate_editor_files.py` regenerates every CSV deterministically.
