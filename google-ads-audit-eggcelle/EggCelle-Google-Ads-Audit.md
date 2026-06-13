# Google Ads Audit & Optimization — EggCelle (eggcelle.com)

**Account:** EggCelle · Google Ads CID `602-692-0997` · USD
**Prepared:** 2026-06-13 · **Performance window:** trailing 90 days (2026-03-15 → 2026-06-13)
**Account purpose:** Donor recruitment — you advertise to *recruit egg donors*, not to sell donor eggs.

> **Scope note / data gaps (stated up front).** This audit is built from the SearchAtlas PPC
> integration, which exposed campaigns, settings, bidding, budgets, locations, keywords,
> negatives, conversions, and tool-built ad creative. It did **not** expose: device & ad-schedule
> bid adjustments, ad extensions/assets (sitelinks, callouts, snippets, image, call), ad-strength
> ratings, or the live RSAs inside the *IMPORTED* campaigns (only legacy tool-built ad groups are
> visible). Those four items must be confirmed in the Google Ads UI; each is flagged below.

---

## Executive Summary

**Overall account health: 4 / 10.** The account generates real volume at surface-level CPAs of
$14–$39, but it is **mismeasured, structurally sprawling, and self-competing** — a large share of
the ~$726/day blended spend is steered by an unreliable conversion signal and split across
campaigns that bid against each other.

### Top 5 critical issues
1. **Conversion signal is unreliable (Critical).** Three *co-primary* conversion actions of
   different funnel stages and values are blended into one "Conversions" column — Submit Lead Form
   (value 1), "Prescreen Application" codeless pageview (value 20), and "Qualified Lead /
   Passed-Prescreen" offline upload (value 1). Blended CVR is **47% (2,139 conv / 4,558 clicks)** —
   implausible for lead-gen, confirming micro-conversions are counted. The account flag
   `has_active_conversions = false` despite 4 active actions suggests the offline "Qualified Lead"
   upload may be receiving ~0 data. **Smart Bidding is optimizing toward the wrong target.**
2. **Structural sprawl & duplication (Critical).** 38 campaigns (~30 paused) from 4 build sources
   (OTTO, FertileRank, "NB", manual). **Each of MI / OH / NC is targeted by 3 live campaigns at
   once**, plus a **nationwide** "RMA Generic Search" overlapping every state — they compete in the
   same auctions and inflate your own CPCs.
3. **SKAG architecture starves Smart Bidding (High→Critical).** 130+ single-keyword ad groups
   (e.g., "MI - LOCAL - egg donation troy" = 1 keyword). A deprecated tactic that fragments
   conversion signal and is unmaintainable, with mixed match types for the same concept.
4. **Two businesses / no source of truth (High).** Two PPC "businesses" (8851 active, 13914 idle)
   map to one Google Ads account; naming is inconsistent across sources.
5. **Intent & geo leakage (High).** Search-term evidence shows **buyer / intended-parent and
   competitor queries** ("egg bank near me," "donor egg prices," "egg donor clinics near me,"
   "shady grove fairfax," "fairfax egg donation") triggering **donor-recruitment** ads — and
   Fairfax/VA queries while you target MI/OH/NC. Negatives are applied per-campaign with no shared
   list.

### Top 5 quick wins (high impact, low risk)
1. **Designate ONE primary conversion** (bottom-funnel "Qualified Lead/Passed-Prescreen" if it has
   volume; otherwise "Submit Lead Form") and set the other three to **Secondary**. Cleans the
   bidding signal immediately.
2. **Create one shared negative-keyword list** (buyer-intent + competitor + irrelevant) and apply
   it to all live campaigns. *(Provided — see `editor-import/negative_keywords_shared_list.txt`.)*
3. **Collapse duplicate geo coverage** — one campaign per state, pause the rest, to stop auction
   self-competition.
4. **Resolve the nationwide overlap** — geo-restrict "RMA Generic" (41196) or formally make it the
   only national campaign and strip state terms from it.
5. **Switch the 3 SKAG campaigns from Maximize Clicks → Maximize Conversions** (after #1) so budget
   chases applications, not raw traffic.

### Live campaign snapshot (trailing 90 days)

| Campaign | Bidding | Budget/day | Cost | Clicks | "Conv" | CPA | Reported CVR | Impr. Share | Rank-lost IS |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|
| EggCelle — North Carolina | Max Conv | $350 | $14,511 | 1,013 | 420 | $34.55 | 41% | 79.7% | 19.2% |
| EggCelle — Michigan | Max Conv | $400 | $9,775 | 589 | 250 | $39.10 | 42% | 67.1% | 32.9% |
| EggCelle — Ohio | Max Conv | $250 | $8,894 | 755 | 314 | $28.33 | 42% | 64.2% | 35.0% |
| OTTO RMA Generic Search | Max Conv (tCPA $40) | $75 | $8,677 | 359 | 229 | $37.89 | 64% | 61.1% | 25.1% (+13.8% budget) |
| EggCelle \| NB \| NC \| SKAG | Max Clicks | $50 | $3,228 | 408 | 165 | $19.57 | 40% | 76.0% | 17.1% |
| OTTO RMA Max Conversion | Max Conv (tCPA $18) | $50 | $2,351 | 199 | 111 | $21.18 | 56% | 81.5% | 18.5% |
| EggCelle \| NB \| MI \| SKAG | Max Clicks | $100 | $985 | 224 | 70 | $14.08 | 31% | 55.1% | 44.9% |
| EggCelle \| NB \| OH \| SKAG | Max Clicks | $75 | $59 | 17 | 6 | $9.83 | 35% | 65.5% | 34.5% |

*All 8 live campaigns report `primary_status = LIMITED`. Reported CVRs of 31–64% confirm
micro-conversion inflation; treat the CPAs above as **optimistic** until measurement is fixed.*

---

## Detailed Audit Findings

### 1. Campaign Structure — Priority: Critical
**Current state.** 38 campaigns; ~8 enabled, ~30 paused. Four naming/build lineages coexist
(`OTTO - Ads - …`, `FertileRank - Ads - …`, `EggCelle | NB | … | SKAG`, `EggCelle — <State>`, plus
dozens of unpublished themed SEARCH shells like "Reproductive Health Screening Portal").

**Issues.** (a) **Triple geo coverage** — MI is live in 275812 + 294133 + 41203; OH in 275332 +
294134; NC in 275331 + 294135 → self-competition. (b) **41196 has empty location targeting =
nationwide**, overlapping all geo campaigns. (c) Duplicate campaign *names* ("EggCelle — Michigan"
×2, "OTTO RMA Generic Search" ×2). (d) ~30 paused/never-published shells clutter the account.
(e) Two businesses (8851 live, 13914 idle `products_ready`).

**Recommendations.** Consolidate to **one campaign per state** (+ optional one national
"Donor Recruit – National" if donors genuinely travel) + a lean **Brand** campaign. Pause/archive
the 30 legacy shells. Retire idle business 13914. Adopt one naming convention (see Blueprint).

### 2. Settings Review — Priority: High
**Current state.** All campaigns Search-type, English, USD; geo at state/metro level except 41196
(none). All 8 live campaigns show `primary_status = LIMITED`, with **rank-lost impression share of
19–45%** (MI-SKAG 44.9%, OH 35.0%, MI 32.9%); RMA Generic also loses **13.8% IS to budget**.

**Issues.** (a) High **rank-lost IS** = Ad Rank / Quality constraints (consistent with the low
keyword relevancy scores in §4), not just budget. (b) Nationwide 41196 contradicts the
geo-segmented design. (c) **Device & ad-schedule bid adjustments not retrievable via API** —
unaudited. (d) Search Partners / Display-expansion can't be confirmed via API — **verify no Display
leakage in UI.**

**Recommendations.** Fix Quality via tighter ad-group themes + ad relevance (§3, §6) rather than
just raising bids; decide 41196's role; **audit device/schedule/network in the UI** and apply
data-driven device modifiers.

### 3. Ad Groups — Priority: High
**Current state.** SKAG model — one keyword per ad group; ad-group names already encode themes
(`BECOME / LOCAL / COMP / MONEY / REQS / PROC / AGCY`). ~45 ad groups in MI-SKAG alone; 130+ across
MI/OH/NC SKAGs.

**Issues.** Over-fragmentation starves Smart Bidding of per-ad-group signal; unmaintainable;
inconsistent match types for the same concept across groups.

**Recommendations.** **Collapse SKAGs into ~7 thematic ad groups per state using the existing
taxonomy**, 5–15 keywords each, one strong RSA minimum. *(Implemented in the provided Editor
files.)*

### 4. Keyword Targeting — Priority: High
**Current state.** Hundreds of exact/phrase/broad keywords; SearchAtlas **relevancy scores mostly
0.20–0.50** (low). High-CPC/low-value examples: "sell eggs michigan" $54.19 CPC, "sell eggs ohio"
$35.27. Heavy informational intent ("what is egg donation," "how does egg donation work,"
"egg donation timeline").

**Issues.** (a) **Cross-campaign cannibalization** — non-geo terms ("egg donor compensation,"
"egg donor requirements," "how much do egg donors get paid") sit in BOTH MI and OH SKAGs *and* the
geo + national campaigns. (b) Informational keywords recruit poorly but absorb clicks. (c) Match
types inconsistent. (d) **Intent leakage** (buyer/competitor queries in the search-term list).

**Recommendations.** De-duplicate to one owner per term; isolate informational terms into a
lower-bid "Donation Process" ad group; lead with Exact (proven) + Phrase (mid), one Broad per theme
*only* under Smart Bidding + robust negatives; pause or cap very-high-CPC low-intent terms.

### 5. Bidding Strategies — Priority: Critical (sequenced after §8)
**Current state.** Geo + RMA campaigns = **Maximize Conversions** (RMA Generic tCPA $40, RMA
Max-Conv tCPA $18); the 3 SKAGs = **Maximize Clicks (Target Spend)**.

**Issues.** (a) Smart Bidding is fed the **blended/inflated conversion signal** (§8) — surface CPAs
overstate efficiency. (b) **Maximize Clicks** on SKAGs buys cheap, low-intent traffic (their
absolute-top IS is only 20–33%). (c) tCPA $18 vs $40 across near-identical audiences is arbitrary
given the shared signal.

**Recommendations.** **Fix conversions first (§8)**, then move SKAGs to Maximize Conversions; once
the corrected primary action has ~30 conv/campaign/month, graduate to **Target CPA** at the *true*
qualified-lead CPA; test **tROAS** only if lead values are trustworthy. **Use Experiments** for each
shift.

### 6. Ad Copy & Creative — Priority: High (verify in UI first)
**Current state (tool-built ad groups).** RSAs are well-stocked — **13–15 headlines and 4
descriptions** each (near Google max). Good quantity.

**Issues.** (a) **Low headline diversity** — many near-duplicates ("Egg Donor Support Services /
Find Egg Donor Support / Egg Donor Support Svcs"), reducing combinations and Ad Strength.
(b) Some ad groups mix **donor-recruitment** and **intended-parent / "support families"**
messaging. (c) **Live IMPORTED-campaign RSAs, Ad Strength, and disapprovals not visible via API** —
check UI. (d) **Extensions/assets not retrievable** — a Lead Form asset is likely present (lead-form
conversion exists), but sitelinks/callouts/snippets/image/call must be verified.

**Recommendations.** Rewrite for diversity (distinct value props: compensation, time commitment,
free screening, supportive process, local clinics); pin one brand + one CTA slot; keep donor vs
intended-parent messaging in separate campaigns; **add the full asset set**; target Good/Excellent
Ad Strength. *(Fresh, deduplicated RSAs are provided in the Editor files.)*

### 7. Audience & Targeting — Priority: Medium (compliance check first)
**Current state.** No audience layers retrievable via API.

**Compliance flag.** Egg donation / fertility falls under Google's **restricted personalized-
advertising / sensitive categories** — remarketing and in-market targeting may be **limited or
disallowed**. Confirm what's permitted before building audiences.

**Recommendations.** Where allowed, add **Observation** audiences (not Targeting) to gather data
before bidding on them.

### 8. Conversion Tracking & Measurement — Priority: Critical (do this before any bid changes)
**Current state.** Tracking enabled; 4 active actions — **Submit Lead Form** (value 1, primary),
**Prescreen Application** codeless pageview (value 20, primary), **Passed-Prescreen / "Qualified
Lead"** upload (value 1, primary), **Website Outbound Click** (value 5, secondary). Account flag
`has_active_conversions = false`.

**Issues.** (a) **Three co-primary actions of different funnel depth/value** → noisy bidding target
and inflated counts. (b) A **codeless pageview** ("Prescreen Application," value 20) as primary
likely inflates volume. (c) The true bottom-funnel signal ("Qualified Lead" via offline upload)
**may have ~0 volume** (consistent with the false flag) — so bidding may effectively chase
pageviews. (d) Value $20 vs $1 vs $1 distorts any value-based logic.

**Recommendations.** Pick **one** primary (Qualified Lead if the upload is live; else Submit Lead
Form), demote the rest to Secondary; **verify each action fires and the offline upload is actually
receiving data**; enable **Enhanced Conversions for leads**; standardize values; then re-baseline
CPAs against the true qualified-lead. *(Not possible in Google Ads Editor — manual UI steps in
`IMPORT_INSTRUCTIONS.md`.)*

---

## Restructuring Plan (sequenced to protect live performance)

- **Phase 0 — Measurement (first; no bid changes):** consolidate to one primary conversion; verify
  firing + offline-upload volume; enable Enhanced Conversions; re-baseline CPAs.
- **Phase 1 — Stop the bleeding (week 1):** build & attach the shared negative list; resolve the
  nationwide 41196 overlap; rename duplicates.
- **Phase 2 — Restructure (pilot one state first, e.g., NC — biggest spender):** import the new
  consolidated campaigns (paused); run as an **Experiment** vs the current setup before cutover.
- **Phase 3 — Bidding:** new/SKAG campaigns → Maximize Conversions; graduate winners to Target CPA
  at the true qualified-lead CPA; test tROAS only if values are trusted.
- **Phase 4 — Creative & assets:** ship the new RSAs, separate donor vs intended-parent messaging,
  add the full asset set; fix any disapprovals.
- **Phase 5 — Hygiene:** pause legacy duplicates (`06_pause_legacy_campaigns.csv`) once the new
  campaigns are proven, archive the ~30 shells, retire idle business 13914, enforce the naming
  convention, schedule weekly search-term mining.

---

## Optimized Campaign Blueprint

**Naming convention:** `EggCelle | <Funnel> | <Geo> | <Theme/Match>` →
e.g., `EggCelle | Donor Recruit | North Carolina`.

**Target architecture (donor recruitment):**
- `EggCelle | Donor Recruit | Michigan` · `| Ohio` · `| North Carolina` (Search, Max Conv → tCPA)
- *(optional)* `EggCelle | Donor Recruit | National` — only if donors genuinely travel to clinics
- `EggCelle | Brand` — protect "eggcelle" + variants

**Ad groups per geo campaign (consolidated from the existing taxonomy):**
Become a Donor · Local Egg Donation (city terms) · Compensation & Pay · Get Paid to Donate ·
Requirements & Eligibility · Donation Process (lower bid, top-funnel) · Agency & Program.

**Match types:** Exact for proven converters; Phrase for mid-intent; one Broad per theme **only**
with Smart Bidding + strong negatives. 5–15 keywords/ad group (never 1).

**Shared negative list (starter, 83 terms provided):** buyer/IP intent (egg bank, donor egg
cost/price, buy donor eggs, find/choose an egg donor, intended parents), social egg freezing
(egg freezing, freeze my eggs), unrelated (blood/plasma/sperm, adoption, surrogate, embryo,
recipes, bird nest, bald eagle), job/price seekers (jobs, salary, egg prices), disqualifiers
(over 35/40, menopause), and competitors (review before applying).

**Bidding:** Max Conversions to learn on the corrected primary → Target CPA → optional tROAS, always
via **Experiments** on the big spenders.

**Measurement:** one primary action, Enhanced Conversions, offline import for the qualified-lead so
Smart Bidding optimizes to *true* application quality.

---

## Risk flags & what still needs confirming
- **Highest-risk changes** (bidding strategy, structure) should run as **Experiments**, one state as
  a pilot — don't cut over all at once on a live ~$65k/90-day account.
- **Confirm in the UI** (not API-accessible): device & ad-schedule bid adjustments; Search Partners
  / Display setting; extensions/assets inventory; Ad Strength & any disapprovals; and **whether the
  "Passed-Prescreen / Qualified Lead" offline upload is actually receiving data** (this determines
  which conversion becomes primary).
- **Do not** delete legacy campaigns until the new structure has proven out — pause first
  (reversible), measure, then archive.
