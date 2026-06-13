#!/usr/bin/env python3
"""
Generate Google Ads Editor-importable CSV files for the EggCelle account
restructure recommended in EggCelle-Google-Ads-Audit.md.

Design choices (read IMPORT_INSTRUCTIONS.md before importing):
  * Everything is generated with the campaigns set to PAUSED so that an import
    can NEVER push live spend by accident. You enable campaigns deliberately
    (ideally as Experiments) after reviewing.
  * Ad groups / keywords / ads are Enabled *within* the paused campaigns, so the
    moment you flip a campaign on it is ready to serve.
  * Conversion-tracking changes (the #1 audit finding) CANNOT be made in Google
    Ads Editor. They are documented as manual steps in IMPORT_INSTRUCTIONS.md.
  * RSA headlines are <=30 chars and descriptions <=90 chars (Google limits);
    the script asserts this so a bad edit fails loudly instead of silently.

Run:  python3 generate_editor_files.py
"""

import csv
import os

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "editor-import")
os.makedirs(OUT, exist_ok=True)

DEFAULT_FINAL_URL = "https://www.eggcelle.com/"  # TODO: swap to per-state application landing page
BID_STRATEGY = "Maximize conversions"            # start here; graduate to Target CPA after data
CAMPAIGN_TYPE = "Search"

# --- States --------------------------------------------------------------
# geo_id = Google Ads geo target constant for the state (set targeting in Editor's
# "Locations" panel after import; CSV geo import is unreliable, so it is documented
# rather than embedded).
STATES = [
    {"name": "Michigan",       "abbr": "MI", "path": "Michigan", "geo_id": 21133, "budget": 150,
     "cities": ["Detroit", "Ann Arbor", "Grand Rapids", "Troy"]},
    {"name": "Ohio",           "abbr": "OH", "path": "Ohio",     "geo_id": 21149, "budget": 150,
     "cities": ["Columbus", "Cincinnati", "Cleveland", "Dayton"]},
    {"name": "North Carolina", "abbr": "NC", "path": "NC",       "geo_id": 21137, "budget": 200,
     "cities": ["Charlotte", "Raleigh", "Durham", "Greensboro"]},
]

def campaign_name(state):
    return f"EggCelle | Donor Recruit | {state['name']}"

BRAND_CAMPAIGN = "EggCelle | Brand"

# --- Keyword templates per themed ad group -------------------------------
# {state} -> full state name, {city} -> expanded per city.
THEME_KEYWORDS = {
    "Become a Donor": [
        ("become an egg donor {state}", "Phrase"),
        ("become an egg donor {state}", "Exact"),
        ("how to become an egg donor {state}", "Phrase"),
        ("become an egg donor near me", "Phrase"),
        ("how to be an egg donor", "Phrase"),
        ("become an egg donor {city}", "Phrase"),
    ],
    "Local Egg Donation": [
        ("egg donation {state}", "Exact"),
        ("egg donation {state}", "Phrase"),
        ("egg donation near me", "Phrase"),
        ("egg donation centers {state}", "Phrase"),
        ("egg donation clinics near me", "Phrase"),
        ("egg donation {city}", "Phrase"),
    ],
    "Compensation & Pay": [
        ("egg donor compensation", "Exact"),
        ("egg donor compensation {state}", "Phrase"),
        ("egg donor pay", "Exact"),
        ("egg donor pay {state}", "Phrase"),
        ("how much do egg donors get paid", "Phrase"),
        ("how much do egg donors get paid in {state}", "Phrase"),
        ("paid egg donor {state}", "Phrase"),
    ],
    "Get Paid to Donate": [
        ("get paid to donate eggs", "Phrase"),
        ("donate eggs for money", "Exact"),
        ("donate eggs for money", "Phrase"),
        ("get paid to donate eggs {state}", "Phrase"),
        ("donate eggs for money near me", "Phrase"),
        ("sell my eggs {state}", "Phrase"),
    ],
    "Requirements & Eligibility": [
        ("egg donor requirements", "Exact"),
        ("egg donor requirements {state}", "Phrase"),
        ("egg donor qualifications {state}", "Phrase"),
        ("egg donor eligibility {state}", "Phrase"),
        ("do i qualify to donate eggs", "Phrase"),
        ("egg donor age requirements", "Phrase"),
        ("criteria to donate eggs", "Phrase"),
    ],
    "Donation Process": [  # top-funnel / informational -> lower bid, separated on purpose
        ("egg donation process {state}", "Phrase"),
        ("how does egg donation work", "Phrase"),
        ("what is egg donation", "Phrase"),
        ("egg donation process", "Phrase"),
        ("egg donation timeline", "Phrase"),
    ],
    "Agency & Program": [
        ("egg donor agency {state}", "Phrase"),
        ("egg donor program {state}", "Phrase"),
        ("egg donation program {state}", "Phrase"),
        ("egg donor agency near me", "Phrase"),
        ("egg donor program near me", "Phrase"),
    ],
}

# Order ad groups consistently
THEME_ORDER = list(THEME_KEYWORDS.keys())

# --- RSA copy per themed ad group ----------------------------------------
# headlines: geo-neutral, <=30 chars. descriptions: <=90 chars, may use {state}.
THEME_ADS = {
    "Become a Donor": {
        "headlines": [
            "Become an Egg Donor", "Apply to Be an Egg Donor", "Egg Donor Application",
            "Help a Family Grow", "Get Paid to Donate Eggs", "Generous Donor Compensation",
            "Start Your Donor Journey", "Free Health Screening", "Confidential & Supportive",
            "Apply Online in Minutes", "Egg Donors Wanted", "Make a Real Difference",
            "Become an Egg Donor Today",
        ],
        "descriptions": [
            "Become an egg donor and help families in {state}. Apply online in minutes.",
            "Generous compensation, free medical screening, and caring support every step.",
            "Egg donors are in high demand. See if you qualify and apply today.",
            "Confidential process with a dedicated team guiding you start to finish.",
        ],
    },
    "Local Egg Donation": {
        "headlines": [
            "Egg Donation Near You", "Local Egg Donation", "Egg Donation Made Easy",
            "Donate Eggs Locally", "Trusted Egg Donor Program", "Egg Donor Program Near You",
            "Caring Egg Donation Team", "Apply to Donate Eggs", "Help Families Near You",
            "Egg Donor Application", "Get Paid to Donate Eggs", "Start Your Application",
        ],
        "descriptions": [
            "Donate eggs close to home in {state}. Local clinics and flexible scheduling.",
            "Join a trusted local egg donor program. Generous pay and full medical support.",
            "Compassionate egg donation with clinics near you. Apply online in minutes.",
            "See if you qualify to become an egg donor in your area today.",
        ],
    },
    "Compensation & Pay": {
        "headlines": [
            "Egg Donor Compensation", "Generous Egg Donor Pay", "Get Paid to Donate Eggs",
            "Egg Donation Pay Rates", "Donor Compensation Info", "Earn With Egg Donation",
            "Egg Donor Payment", "Top Donor Compensation", "Paid Egg Donor Program",
            "Compensation + Free Care", "Donate Eggs, Get Paid", "See Your Earning Potential",
        ],
        "descriptions": [
            "Egg donors receive generous compensation plus free medical screening.",
            "Earn meaningful compensation by helping a family in {state}.",
            "Get paid to donate eggs. Transparent pay and a supportive team.",
            "Discover egg donor pay rates and apply online in minutes.",
        ],
    },
    "Get Paid to Donate": {
        "headlines": [
            "Get Paid to Donate Eggs", "Donate Eggs for Money", "Paid Egg Donation",
            "Earn From Egg Donation", "Generous Donor Pay", "Donate Eggs, Get Paid",
            "Egg Donor Compensation", "Help Families & Earn", "Apply to Donate Eggs",
            "Start Earning Today", "Egg Donors Wanted", "Free Screening Included",
        ],
        "descriptions": [
            "Get paid to donate eggs and help a family grow. Apply online in minutes.",
            "Generous compensation for egg donors, plus free medical screening.",
            "Donate eggs for meaningful pay with a caring, confidential team.",
            "See if you qualify to become a paid egg donor in {state} today.",
        ],
    },
    "Requirements & Eligibility": {
        "headlines": [
            "Egg Donor Requirements", "Do You Qualify to Donate?", "Egg Donor Eligibility",
            "See If You Qualify", "Egg Donor Qualifications", "Check Your Eligibility",
            "Become an Egg Donor", "Donor Criteria Explained", "Apply & Check Eligibility",
            "Free Eligibility Check", "Find Out If You Qualify", "Quick Eligibility Quiz",
        ],
        "descriptions": [
            "Wondering if you qualify to donate eggs? Check the requirements and apply.",
            "Most healthy women can become egg donors. See the eligibility criteria today.",
            "Find out if you meet egg donor requirements in {state}.",
            "Quick, free eligibility check. Apply online in just a few minutes.",
        ],
    },
    "Donation Process": {
        "headlines": [
            "How Egg Donation Works", "The Egg Donation Process", "What Is Egg Donation?",
            "Egg Donation Explained", "Your Donor Journey", "Egg Donation Step by Step",
            "Safe, Supported Process", "Learn About Egg Donation", "Become an Egg Donor",
            "Caring, Confidential Team", "Free Health Screening", "Apply When You're Ready",
        ],
        "descriptions": [
            "Learn how egg donation works, from application to retrieval, step by step.",
            "A safe, supported egg donation process with a dedicated care team.",
            "Understand the egg donation timeline and what to expect at each stage.",
            "Curious about egg donation? Learn more and see if it's right for you.",
        ],
    },
    "Agency & Program": {
        "headlines": [
            "Trusted Egg Donor Agency", "Egg Donor Program", "Join Our Donor Program",
            "Caring Egg Donor Agency", "Egg Donation Program", "Apply to Our Program",
            "Supportive Donor Team", "Become an Egg Donor", "Generous Compensation",
            "Free Medical Screening", "Egg Donors Wanted", "Start Your Application",
        ],
        "descriptions": [
            "Join a trusted egg donor agency with generous pay and full support.",
            "Our egg donor program guides you with care from application to completion.",
            "Compassionate team, generous compensation, and free medical screening.",
            "Apply to our egg donor program in {state} and help a family grow.",
        ],
    },
}

BRAND_AD = {
    "headlines": [
        "EggCelle Egg Donors", "EggCelle Donor Program", "Become an EggCelle Donor",
        "EggCelle Egg Donation", "Apply With EggCelle", "EggCelle Donor Application",
        "Generous Donor Pay", "Free Health Screening", "Help a Family With EggCelle",
        "EggCelle Egg Donor Program", "Trusted Egg Donor Agency", "Start Your Application",
    ],
    "descriptions": [
        "Apply to become an EggCelle egg donor. Generous pay and caring support.",
        "EggCelle helps you donate eggs with confidence. Apply online in minutes.",
        "Join the EggCelle donor program and help build families.",
        "Generous compensation and free medical screening with EggCelle.",
    ],
}

BRAND_KEYWORDS = [
    ("eggcelle", "Exact"), ("eggcelle", "Phrase"), ("egg celle", "Phrase"),
    ("eggcelle egg donor", "Phrase"), ("eggcelle donor", "Phrase"),
    ("eggcelle application", "Phrase"), ("eggcelle egg donation", "Phrase"),
]

# --- Negative keywords (shared) ------------------------------------------
# Applied to the 3 donor-recruitment campaigns (NOT brand). Default match Phrase.
NEGATIVES_BUYER = [  # intended-parent / buyer intent (want to GET eggs, not donate)
    "egg bank", "egg banks", "donor egg", "donor eggs", "buy donor eggs", "buy eggs",
    "where to buy eggs", "donor egg cost", "donor egg costs", "donor egg price",
    "donor egg prices", "cost of donor eggs", "price of donor eggs", "egg donor cost",
    "egg donor prices", "donor egg ivf", "ivf with donor eggs", "using donor eggs",
    "find an egg donor", "choose an egg donor", "egg donor database", "egg donor catalog",
    "intended parent", "intended parents", "frozen donor eggs",
]
NEGATIVES_FREEZING = [  # social egg freezing = different service
    "egg freezing", "freeze my eggs", "freeze eggs", "egg freezing cost", "freezing eggs",
]
NEGATIVES_IRRELEVANT = [
    "blood donation", "blood", "plasma", "plasma donation", "donate plasma", "sperm",
    "sperm donation", "sperm donor", "donate sperm", "adoption", "adopt", "foster",
    "surrogate", "surrogacy", "become a surrogate", "embryo donation", "embryo adoption",
    "organ donation", "kidney donation", "bone marrow", "hair donation", "food bank",
    "egg recipe", "egg recipes", "recipe", "chicken eggs", "bird nest", "bald eagle",
    "easter egg", "egg prices", "price of eggs", "dozen eggs", "egg shortage",
]
NEGATIVES_JOBS = ["jobs", "job", "salary", "career", "cheap", "free"]
NEGATIVES_DISQUALIFY = ["over 35", "over 40", "age limit", "menopause"]
# Competitor / brand terms -- REVIEW before applying (you may want a conquest campaign).
NEGATIVES_COMPETITORS = [
    "shady grove", "shady grove fertility", "fairfax egg bank", "fairfax eggbank",
    "cofertility", "freeze and share", "bundl fertility", "circle egg donation",
    "egg donor america", "world egg and sperm bank",
]

# -------------------------------------------------------------------------
def expand(template, state):
    """Expand a keyword template into one or more concrete keywords."""
    out = []
    if "{city}" in template:
        for city in state["cities"]:
            out.append(template.format(state=state["name"], city=city))
    else:
        out.append(template.format(state=state["name"]))
    return out


def validate_ad(headlines, descriptions, label):
    assert len(headlines) >= 3, f"{label}: need >=3 headlines"
    assert len(descriptions) >= 2, f"{label}: need >=2 descriptions"
    for h in headlines:
        assert len(h) <= 30, f"{label}: headline too long ({len(h)}): {h!r}"
    for d in descriptions:
        assert len(d) <= 90, f"{label}: description too long ({len(d)}): {d!r}"


def write_csv(path, header, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    return len(rows)


def main():
    campaign_rows, adgroup_rows, keyword_rows, ad_rows = [], [], [], []
    negative_rows, plaintext_negs = [], []

    HEAD_COLS = [f"Headline {i}" for i in range(1, 16)]
    DESC_COLS = [f"Description {i}" for i in range(1, 5)]
    AD_HEADER = (["Campaign", "Ad Group", "Ad type"] + HEAD_COLS + DESC_COLS +
                 ["Path 1", "Path 2", "Final URL", "Status"])

    def ad_row(camp, ag, headlines, descriptions, path2, label):
        validate_ad(headlines, descriptions, label)
        hs = (headlines + [""] * 15)[:15]
        ds = (descriptions + [""] * 4)[:4]
        return [camp, ag, "Responsive search ad"] + hs + ds + ["Egg-Donor", path2, DEFAULT_FINAL_URL, "Enabled"]

    # ---- Geo donor-recruitment campaigns ----
    for st in STATES:
        camp = campaign_name(st)
        campaign_rows.append([camp, CAMPAIGN_TYPE, "Paused", st["budget"], BID_STRATEGY])
        for theme in THEME_ORDER:
            adgroup_rows.append([camp, theme, "Enabled", "3.00"])
            seen = set()
            for tmpl, match in THEME_KEYWORDS[theme]:
                for kw in expand(tmpl, st):
                    key = (kw, match)
                    if key in seen:
                        continue
                    seen.add(key)
                    keyword_rows.append([camp, theme, kw, match, "Enabled"])
            ads = THEME_ADS[theme]
            descs = [d.format(state=st["name"]) for d in ads["descriptions"]]
            ad_rows.append(ad_row(camp, theme, ads["headlines"], descs, st["path"],
                                  f"{st['abbr']}/{theme}"))

        # campaign-level negatives for this geo campaign
        for term in (NEGATIVES_BUYER + NEGATIVES_FREEZING + NEGATIVES_IRRELEVANT +
                     NEGATIVES_JOBS + NEGATIVES_DISQUALIFY):
            negative_rows.append([camp, term, "Phrase", "Core"])
        for term in NEGATIVES_COMPETITORS:
            negative_rows.append([camp, term, "Phrase", "Competitor (REVIEW)"])

    # ---- Brand campaign ----
    campaign_rows.append([BRAND_CAMPAIGN, CAMPAIGN_TYPE, "Paused", 30, BID_STRATEGY])
    adgroup_rows.append([BRAND_CAMPAIGN, "Brand Core", "Enabled", "3.00"])
    for kw, match in BRAND_KEYWORDS:
        keyword_rows.append([BRAND_CAMPAIGN, "Brand Core", kw, match, "Enabled"])
    ad_rows.append(ad_row(BRAND_CAMPAIGN, "Brand Core", BRAND_AD["headlines"],
                          BRAND_AD["descriptions"], "Apply", "Brand"))

    # ---- Plaintext shared negative list (dedup, for paste into Shared library) ----
    for term in (NEGATIVES_BUYER + NEGATIVES_FREEZING + NEGATIVES_IRRELEVANT +
                 NEGATIVES_JOBS + NEGATIVES_DISQUALIFY + NEGATIVES_COMPETITORS):
        if term not in plaintext_negs:
            plaintext_negs.append(term)

    # ---- Legacy campaigns to pause AFTER the new ones are live (staged cutover) ----
    legacy = [
        "EggCelle — Michigan", "EggCelle — Ohio", "EggCelle — North Carolina",
        "EggCelle | NB | MI | SKAG", "EggCelle | NB | OH | SKAG", "EggCelle | NB | NC | SKAG",
        "OTTO - Ads - RMA Generic Search", "OTTO - Ads - RMA Max Conversion",
    ]
    pause_rows = [[name, "Paused"] for name in legacy]

    # ---- Write files ----
    n = {}
    n["campaigns"] = write_csv(os.path.join(OUT, "01_campaigns.csv"),
        ["Campaign", "Campaign Type", "Status", "Budget", "Bid Strategy Type"], campaign_rows)
    n["ad_groups"] = write_csv(os.path.join(OUT, "02_ad_groups.csv"),
        ["Campaign", "Ad Group", "Status", "Max CPC"], adgroup_rows)
    n["keywords"] = write_csv(os.path.join(OUT, "03_keywords.csv"),
        ["Campaign", "Ad Group", "Keyword", "Match Type", "Status"], keyword_rows)
    n["negatives"] = write_csv(os.path.join(OUT, "04_negative_keywords.csv"),
        ["Campaign", "Keyword", "Match Type", "Category"], negative_rows)
    n["ads"] = write_csv(os.path.join(OUT, "05_responsive_search_ads.csv"), AD_HEADER, ad_rows)
    n["pause_legacy"] = write_csv(os.path.join(OUT, "06_pause_legacy_campaigns.csv"),
        ["Campaign", "Status"], pause_rows)

    with open(os.path.join(OUT, "negative_keywords_shared_list.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(plaintext_negs) + "\n")
    n["shared_neg_terms"] = len(plaintext_negs)

    print("Generated Google Ads Editor import files in:", OUT)
    for k, v in n.items():
        print(f"  {k:>16}: {v}")
    print("\nReminder: campaigns import as PAUSED. Conversion fixes are manual (see IMPORT_INSTRUCTIONS.md).")


if __name__ == "__main__":
    main()
