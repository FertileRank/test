#!/usr/bin/env python3
"""
Generate a Performance Max BUILD PACK for EggCelle — one campaign per location.

IMPORTANT: Google Ads Editor cannot create Performance Max campaigns from a CSV
import (asset groups, audience signals, listing groups, and image/video assets
are not part of the Editor CSV import schema). These files are therefore a
*build pack* you assemble quickly in the Google Ads UI / Editor, OR — the
reliable "straight in" path — have Claude build them natively via the SearchAtlas
ppc_pmax_* tools, which push to the account directly.

Everything here is text + settings only. Image/logo/video assets are binary and
must be supplied separately (see asset_image_specs.md).

All assets are validated against Google's Performance Max character limits.
Run:  python3 generate_pmax_files.py
"""

import csv
import os

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "performance-max")
os.makedirs(OUT, exist_ok=True)

DEFAULT_FINAL_URL = "https://www.eggcelle.com/"  # TODO: per-state application landing page
BUSINESS_NAME = "EggCelle"                        # <=25 chars
CALL_TO_ACTION = "Apply Now"

# Performance Max asset-group character limits
LIM = {
    "Headline": 30,
    "Long Headline": 90,
    "Short Description": 60,   # the single short description
    "Description": 90,
    "Business Name": 25,
    "Call To Action": 30,
    "Sitelink Text": 25,
    "Sitelink Desc": 35,
    "Callout": 25,
    "Snippet Value": 25,
}

STATES = [
    {"name": "Michigan",       "abbr": "MI", "geo_id": 21133, "budget": 100,
     "cities": ["Detroit", "Ann Arbor", "Grand Rapids", "Troy"]},
    {"name": "Ohio",           "abbr": "OH", "geo_id": 21149, "budget": 100,
     "cities": ["Columbus", "Cincinnati", "Cleveland", "Dayton"]},
    {"name": "North Carolina", "abbr": "NC", "geo_id": 21137, "budget": 150,
     "cities": ["Charlotte", "Raleigh", "Durham", "Greensboro"]},
]

def campaign_name(st):
    return f"EggCelle | PMax | Donor Recruit | {st['name']}"

def asset_group_name(st):
    return f"{st['name']} — Egg Donor Recruitment"

# --- Text assets (geo-neutral unless {state}) ----------------------------
HEADLINES = [  # up to 15, <=30
    "Become an Egg Donor", "Get Paid to Donate Eggs", "Apply to Be an Egg Donor",
    "Generous Donor Compensation", "Free Health Screening", "Egg Donor Application",
    "Help a Family Grow", "Egg Donors Wanted", "Trusted Egg Donor Program",
    "See If You Qualify", "Apply Online in Minutes", "Supportive & Confidential",
    "Start Your Donor Journey",
]
LONG_HEADLINES = [  # up to 5, <=90
    "Become an Egg Donor and Help a Family Grow With Generous Compensation",
    "Get Paid to Donate Eggs, With Free Medical Screening and Full Support",
    "Join a Trusted Egg Donor Program and Apply Online in Just a Few Minutes",
    "Compassionate, Confidential Egg Donation Guided by a Dedicated Care Team",
    "See If You Qualify to Become an Egg Donor in {state} Today",
]
SHORT_DESCRIPTION = "Get paid to donate eggs and help a family grow."  # <=60
DESCRIPTIONS = [  # up to 4, <=90
    "Generous compensation, free medical screening, and caring support every step.",
    "Apply to become an egg donor in {state} and see if you qualify in minutes.",
    "Confidential process, dedicated support, and meaningful pay for your time.",
    "Egg donors are in high demand. Start your application and make a difference.",
]

SITELINKS = [  # (text<=25, desc1<=35, desc2<=35, path)
    ("See If You Qualify", "Quick, free eligibility check", "Apply online in minutes", "qualify"),
    ("Donor Compensation", "Generous, transparent pay", "See what you can earn", "compensation"),
    ("How It Works", "The egg donation process", "A simple step-by-step guide", "process"),
    ("Start Your Application", "Apply in a few minutes", "Confidential & supportive", "apply"),
]
CALLOUTS = [  # <=25 each
    "Generous Compensation", "Free Medical Screening", "Confidential Process",
    "Dedicated Support Team", "Apply Online in Minutes", "Local Clinics",
    "No Cost to Apply", "Help Build Families",
]
SNIPPET_HEADER = "Service catalog"
SNIPPET_VALUES = [  # <=25 each
    "Egg Donation", "Donor Compensation", "Medical Screening",
    "Eligibility Check", "Application Support",
]

def check(text, kind):
    assert len(text) <= LIM[kind], f"{kind} too long ({len(text)}): {text!r}"
    return text

def main():
    settings_rows, asset_rows = [], []
    sitelink_rows, callout_rows, snippet_rows = [], [], []

    for st in STATES:
        camp = campaign_name(st)
        ag = asset_group_name(st)

        settings_rows.append([
            camp, "Performance Max", "Paused", st["budget"], "Maximize conversions",
            "Qualified Lead / Submit Lead Form (campaign-specific goal)",
            st["geo_id"], "English", DEFAULT_FINAL_URL, "Off",
            "Apply EggCelle brand exclusion list",
        ])

        def add(asset_type, text):
            asset_rows.append([camp, ag, asset_type, text, len(text), LIM[asset_type]])

        for h in HEADLINES:
            add("Headline", check(h, "Headline"))
        for lh in LONG_HEADLINES:
            add("Long Headline", check(lh.format(state=st["name"]), "Long Headline"))
        add("Short Description", check(SHORT_DESCRIPTION, "Short Description"))
        for d in DESCRIPTIONS:
            add("Description", check(d.format(state=st["name"]), "Description"))
        add("Business Name", check(BUSINESS_NAME, "Business Name"))
        add("Call To Action", CALL_TO_ACTION)

        for text, d1, d2, path in SITELINKS:
            sitelink_rows.append([
                "Campaign", camp,
                check(text, "Sitelink Text"),
                check(d1, "Sitelink Desc"), check(d2, "Sitelink Desc"),
                f"{DEFAULT_FINAL_URL}{path}",
            ])
        for c in CALLOUTS:
            callout_rows.append(["Campaign", camp, check(c, "Callout")])
        for v in SNIPPET_VALUES:
            snippet_rows.append(["Campaign", camp, SNIPPET_HEADER, check(v, "Snippet Value")])

    def write(path, header, rows):
        with open(os.path.join(OUT, path), "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(header)
            w.writerows(rows)
        return len(rows)

    n = {}
    n["settings"] = write("pmax_campaign_settings.csv",
        ["Campaign", "Campaign Type", "Status", "Daily Budget", "Bid Strategy",
         "Conversion Goal", "Location (geo ID)", "Language", "Final URL",
         "Final URL Expansion", "Brand Exclusions"], settings_rows)
    n["text_assets"] = write("pmax_text_assets.csv",
        ["Campaign", "Asset Group", "Asset Type", "Text", "Char Count", "Limit"], asset_rows)
    n["sitelinks"] = write("pmax_sitelinks.csv",
        ["Level", "Campaign", "Sitelink Text", "Description Line 1", "Description Line 2", "Final URL"],
        sitelink_rows)
    n["callouts"] = write("pmax_callouts.csv", ["Level", "Campaign", "Callout Text"], callout_rows)
    n["snippets"] = write("pmax_structured_snippets.csv",
        ["Level", "Campaign", "Header", "Value"], snippet_rows)

    print("Generated Performance Max build pack in:", OUT)
    for k, v in n.items():
        print(f"  {k:>12}: {v} rows")
    print("\nPMax cannot be CSV-imported into Editor — build in UI or via SearchAtlas ppc_pmax_* tools.")
    print("Keep PAUSED until conversion tracking is corrected (see README_PMAX.md).")

if __name__ == "__main__":
    main()
