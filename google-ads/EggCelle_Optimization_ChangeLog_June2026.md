# EggCelle — Google Ads Optimization & Editor Import (June 2026)

**Objective:** lower **cost per qualified lead** (Submit Lead Form) and scale the campaigns that already prove ~2× efficiency, with a near-neutral total budget.

**Built from:** the June 2026 Senior Audit + **live Search Atlas account data** (account `12070`, customer `6026920997`, window **2026-05-10 → 2026-06-09**) + Search Atlas keyword CPC/volume benchmarks.

---

## TL;DR — what's in the import

| File (in `/import`) | What it changes | Risk |
|---|---|---|
| `01_campaign_budget_changes.csv` | New daily budgets on all 7 active campaigns (reallocation, net **+$50/day**) | Low / reversible |
| `02_market_targetcpa_and_conversion_goals.csv` | Adds **Target CPA** to the 3 Market campaigns + OTTO, and switches them to the **Submit Lead Form** conversion goal | Medium (brief re-optimization) |
| `03_cross_market_negative_keywords.csv` | **60** campaign-level geo negatives so MI/NC/OH stop paying for each other's queries | Low |

Review-friendly version: **`EggCelle_GoogleAds_Editor_Import_June2026.xlsx`** (READ ME + Current-vs-Proposed + the three import sheets + keyword benchmarks).

---

## The core finding (why CPA looks "fake")

The account has **two** conversion actions feeding goals:

| Conversion action | Category | Primary? |
|---|---|---|
| Submit Lead Form | `SUBMIT_LEAD_FORM` | ✅ Primary |
| **Outbound Click** | `OUTBOUND_CLICK` | counted as a goal |

The **SKAG** campaigns are scoped to **Submit Lead Form** only — which is why their numbers are clean and their CPA is low. The **Market** campaigns and **OTTO** optimize to a custom **"Conversion Funnel"** goal that also absorbs **Outbound Click**. That is the mechanism behind the audit's "$0.60 CPA / 2,494 conversions" alarm on OTTO: bids chase cheap outbound clicks instead of real donor leads.

**Fix (file 02):** point Market + OTTO at the **Submit Lead Form** standard goal and drop the custom funnel goal, so Smart Bidding optimizes to actual leads. This is the single highest-leverage change for lowering *true* cost-per-lead.

> If the conversion-goal columns don't apply cleanly on import (Editor is occasionally strict here), set it in the UI: **Campaign → Settings → Conversion goals → "Use account-level / campaign-specific" → keep only Submit Lead Form.** Also set **Outbound Click → Secondary** at **Tools → Conversions** so it never drives bidding again.

---

## Live performance that drove the numbers (2026-05-10 → 06-09)

| Campaign | Budget/day | Real CPA (Submit Lead Form) | Conv | Notes |
|---|---:|---:|---:|---|
| NC — Market | $350 | **$43.31** | 216 | Highest market CPA; 80.9% IS (near-saturated, only 0.98% lost to budget) |
| MI — Market | $350 | $38.43 | 202 | 66.8% IS, 33% lost to rank |
| OH — Market | $250 | $30.95 | 179 | Most efficient market; 58% IS, **42% lost to rank** (room to grow) |
| OTTO RMA Max Conv | $50 | $18.33 | 24 | Goal mis-scoped (see above) |
| **NC \| SKAG** | $50 | **$20.29** | 140 | Losing **7.6% IS to budget** — proven & starved |
| **MI \| SKAG** | $50 | **$14.31** | 57 | **Best efficiency in the account** |
| OH \| SKAG | $25 | $21.09 | 2 | Underfunded; can't exit learning |
| **Total** | **$1,125** | **$32.68** blended | 820 | |

**SKAGs run at $14–20 CPA vs $31–43 for Market.** Same geographies, half the cost — so we move marginal budget into them.

---

## 1) Budget reallocation (file 01) — net +$50/day

| Campaign | Current | New | Δ | Why |
|---|---:|---:|---:|---|
| NC — Market | $350 | **$275** | −75 | Highest-CPA market & near-saturated → fund NC SKAG instead |
| MI — Market | $350 | **$300** | −50 | Trim; control with tCPA |
| OH — Market | $250 | **$240** | −10 | Most efficient + rank-limited → trim the least |
| OTTO RMA | $50 | **$35** | −15 | Pending tracking fix |
| NC \| SKAG | $50 | **$150** | +100 | $20 CPA, losing IS to budget (audit O1) |
| MI \| SKAG | $50 | **$100** | +50 | Best CPA in account |
| OH \| SKAG | $25 | **$75** | +50 | Reach data threshold (audit O2) |
| **Total** | **$1,125** | **$1,175** | **+50** | ~$33.75k → ~$35.25k/mo |

~$200/day moves out of $31–43 CPA inventory into $14–20 CPA inventory. That mix-shift is the main blended-CPA lever.

## 2) Target CPA + conversion-goal fix (file 02)

| Campaign | New bid strategy | New Target CPA | Conversion goal |
|---|---|---:|---|
| NC — Market | Maximize conversions | **$37** | → Submit Lead Form |
| MI — Market | Maximize conversions | **$35** | → Submit Lead Form |
| OH — Market | Maximize conversions | **$28** | → Submit Lead Form |
| OTTO RMA | Maximize conversions | **$18** | → Submit Lead Form |

Targets sit ~8–15% below current CPA — assertive but not so low they choke delivery.

## 3) Cross-market negatives (file 03) — 60 phrase negatives

Each state's two campaigns (Market + SKAG) exclude the **other** two states' city/state terms:

- **MI** campaigns ⊖ `north carolina, charlotte, raleigh, greensboro, winston-salem, ohio, columbus, cincinnati, dayton, cleveland`
- **NC** campaigns ⊖ `michigan, detroit, troy, bloomfield hills, royal oak, ohio, columbus, cincinnati, dayton, cleveland`
- **OH** campaigns ⊖ `michigan, detroit, troy, bloomfield hills, royal oak, north carolina, charlotte, raleigh, greensboro, winston-salem`

---

## Search Atlas keyword benchmarks (US)

| Theme | Volume | Avg CPC | Read |
|---|---:|---:|---|
| egg donor requirements | 5,400 | **$3.97** | High volume, low CPC — efficient |
| requirements to become an egg donor | 5,400 | $3.91 | Efficient long-tail |
| how much do egg donors get paid | 1,650 | **$3.75** | Cheapest strong converter |
| donate eggs for money | 3,600 | $5.61 | Core money intent |
| egg donation near me | 12,100 | **$8.68** | Head term — pushes Market CPA up |
| egg donation | 22,200 | $8.52 | Broad/expensive |
| become an egg donor | 798 | **$12.33** | Most expensive CPC — cap with tCPA |

The efficient SKAGs win on the low-CPC *requirements / compensation / money* long-tail; the costly Market campaigns lean on high-CPC head terms. Confirms the budget shift.

---

## Deliberately **NOT** in this import

- **SKAG bid strategies are unchanged.** The audit flags NC/MI SKAG as winners to **preserve** (D2). We only raise their budgets so we don't reset their learning. *Phase 2:* once stable, test Maximize Clicks → **Maximize Conversions** on NC (140 conv) and MI (57 conv) SKAGs.
- **No keyword "expansion."** The three SKAGs are already **structurally identical** (45 ad groups / 7 themes each) — OH/MI aren't missing keywords, they were starved by budget. Expansion would only create duplicates.
- **No ad-group pausing.** A few zero-conversion ad groups exist (e.g. *Egg Donor Core* MI $26.94/0; *NC – PROC – how does egg donation work* $16.85/0). Low spend; listed as **review candidates**, not auto-paused.

## Do these in the Google Ads UI (can't be done via Editor import)

1. **Conversion-tracking audit (P0):** set **Outbound Click → Secondary**; verify Submit Lead Form fires on real submissions only.
2. **Offline conversion import (P0):** feed prescreen → approval status back to Google Ads so bidding optimizes to *qualified* donors, not just form fills. Highest-leverage change available; addresses the zero-approved-donor funnel finding.
3. **Reactivate Brand Protection** ($25–50/day) — a paused campaign outside this 7-campaign export.

---

## Modeled impact

| Scenario | Monthly spend | Blended CPA | Note |
|---|---:|---:|---|
| Current (real leads) | ~$33,750 | **$32.68** | Live, Submit Lead Form |
| After this import | ~$35,250 | **~$26–28** | Mix-shift + tCPA + goal fix |
| + Offline conversions (90-day) | ~$35,250 | **lower cost per *approved* donor** | Optimizes to qualified leads |

*Estimates. Smart Bidding re-enters a short learning period after the goal/tCPA changes — expect 1–2 weeks of noise before CPA settles. Recommended order: apply file 01 + file 03 first, then file 02 once budgets settle.*
