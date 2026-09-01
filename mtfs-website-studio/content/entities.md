---
title: "ART / IVF entity definitions"
description: "Plain-language definitions for the regulatory bodies, credentials, laboratory processes and MedTech-specific terms the site names but never explains, with the page that should own each one."
status: draft
lastReviewed: 2026-08-29
---

# ART / IVF entity definitions

This file is the concrete fix for the largest content gap the audit found: **every regulatory
body and credential the site sells against is named repeatedly and defined nowhere.**

The measurement, taken over the 21 exported pages (`docs/audit/content-aiseo.md`, AISEO-05,
re-verified against the export while writing this file):

| Term | Pages naming it | Times the site expands or defines it |
| --- | --- | --- |
| FDA | 8 of 21 | 0 |
| CLIA | 9 of 21 | 0 |
| CAP | 9 of 21 | 0 |
| AABB | 9 of 21 | 0 |
| HCLD | 7 of 21 | 0 |
| TS (ABB) | 5 of 21 | 0 |
| ELD (ABB) | 1 of 21 | 0 |
| ASRM | 1 of 21 | 0 |
| American Board of Bioanalysis | 1 of 21 — buried in `/privacy-policy/` | 1 |
| vitrification, witnessing, andrology, PGT, SART, 21 CFR, HCT/P, tissue bank, New York State | 0 of 21 | 0 |
| cryopreservation | 1 of 21 — an insurance page, never a laboratory page | 0 |
| ICSI | 1 of 21 — inside an image `alt` | 0 |
| blastocyst | 1 of 21 — inside a client quote | 0 |

`/services/lab-solutions/regulatory-compliance/` repeats the undifferentiated string
"FDA, CLIA, CAP, AABB" five times and explains what none of them regulates.

## How to use this file

1. Each entry names an **owning page**. Put the definition in that page's own prose, under a
   real `<h2>`/`<h3>` — not in a keyword glossary page, and not as a tooltip. Cross-link the
   other pages that name the term at it.
2. Keep definitions to roughly 60–150 words in the page voice, and link the issuing
   authority.
3. **Every entry below is a DRAFT for MedTech's technical and regulatory review.** These are
   general descriptions of public regulatory schemes, not statements about MedTech's own
   scope, registrations, accreditations or personnel. Nothing here may be published as a
   claim about MedTech until MedTech confirms it. Regulatory scope is fact-specific — the
   client's regulatory counsel or laboratory director signs off, not the build.
4. Do not turn any entry into its own page. The site has 21 justified pages, unique titles
   and no doorway pages; one page per question or per keyword variant is exactly the
   mass-produced pattern Google's guidance warns against.

---

## Regulators and accreditation bodies

### FDA and HCT/P registration

**Expands to:** United States Food and Drug Administration; HCT/P = human cells, tissues,
and cellular and tissue-based products.

Reproductive tissue — donor sperm, oocytes and embryos — falls within the FDA's HCT/P
framework. Establishments that recover, process, store or distribute such tissue generally
have to register and list with the FDA, follow the donor-eligibility requirements
(donor screening and testing) and work under current good tissue practice for handling,
labelling, storage and records. Requirements differ sharply depending on whether gametes come
from a sexually intimate partner or from a third-party donor, which is why two IVF labs doing
similar clinical work can sit in different regulatory postures.

**Why the buyer cares:** it decides whether a practice needs an FDA establishment
registration at all, and it drives donor screening records — the paperwork an inspector asks
for first.
**Owning page:** `/services/lab-solutions/regulatory-compliance/`.
**Referenced from:** `/`, `/about/`, `/services/`, `/services/lab-solutions/`,
`/services/management-services/insurance-risk-management/`, `/our-team/`.
**Authority:** fda.gov (Tissue & Tissue Products).
**Status:** DRAFT — scope statements need MedTech's regulatory review.

### 21 CFR Part 1271

The section of the US Code of Federal Regulations that contains the HCT/P rules described
above: registration and listing, donor eligibility, and current good tissue practice. Naming
the part number once, in the compliance page's prose, is worth more than five repetitions of
the bare string "FDA" — it is the citation a laboratory director recognises and searches for.

**Owning page:** `/services/lab-solutions/regulatory-compliance/`, inside the FDA definition.
**On the site today:** 0 occurrences across all 21 pages.
**Status:** DRAFT — confirm the parts and subparts MedTech actually works to.

### CLIA

**Expands to:** Clinical Laboratory Improvement Amendments of 1988, administered by the
Centers for Medicare & Medicaid Services with the CDC and the FDA.

CLIA governs laboratory *testing* performed on human specimens for the diagnosis, prevention
or treatment of disease. A laboratory holds a CLIA certificate matched to the complexity of
the testing it performs, and high-complexity testing carries personnel requirements for the
director, technical supervisor and testing personnel.

**The distinction worth publishing:** semen analysis and other andrology testing is clinical
laboratory testing and sits squarely inside CLIA; embryo culture is generally not treated as a
CLIA-regulated *test*, which is why an IVF programme's andrology bench and its embryology
bench can answer to different frameworks — FDA HCT/P rules, state licensure and voluntary
accreditation covering the latter. Almost nobody explains this on a services page, and every
lab director has had to work it out.

**Why the buyer cares:** it answers "is my embryology lab subject to CLIA, or only my
andrology lab?" — the first question in any compliance engagement.
**Owning page:** `/services/lab-solutions/regulatory-compliance/`.
**Authority:** cms.gov (CLIA).
**Status:** DRAFT — the andrology/embryology distinction must be confirmed by MedTech's
laboratory director before it is published in MedTech's name.

### CAP

**Expands to:** College of American Pathologists.

CAP is a voluntary laboratory accreditation organisation. Its reproductive laboratory
programme accredits embryology, andrology and endocrinology laboratories against a
discipline-specific checklist, with on-site inspection on a recurring cycle, usually peer
inspection by other laboratories. Accreditation is not a substitute for a required
certification or licence; it is the quality framework a practice chooses on top of them, and
it is frequently what a referring physician or an insurer asks about.

**Why the buyer cares:** "do I need CAP *and* AABB, or one of them?" is a question the site
currently invites and never answers.
**Owning page:** `/services/lab-solutions/regulatory-compliance/`.
**Authority:** cap.org.
**Status:** DRAFT — confirm which CAP programme and checklist MedTech supports.

### AABB

AABB (originally the American Association of Blood Banks) is a standards-setting and
accreditation organisation for blood, cellular therapy and tissue activities, including
reproductive tissue services. Its standards address donor screening, processing, storage,
distribution, labelling and traceability.

**Critical distinction — this is currently wrong on the site:** AABB accredits *facilities*.
It does not certify individuals. The personnel certifications the site refers to —
HCLD, ELD, TS — are issued by **ABB**, the American Board of Bioanalysis, a different
organisation. `/about/` says "TS (AABB)" twice where five other pages correctly say
"TS (ABB)", and `/our-team/` lists "Certifications: AABB, CLIA, ASRM" as though all three
were personal credentials. See AISEO-06.

**Owning page:** `/services/lab-solutions/regulatory-compliance/`.
**Authority:** aabb.org.
**Status:** DRAFT — confirm the AABB standards edition and programme MedTech works to.

### New York State tissue-bank licensure

New York regulates clinical laboratories and tissue banks through the State Department of
Health's Wadsworth Center, with its own permit and inspection regime that runs in addition to
federal requirements — including for reproductive tissue. Out-of-state laboratories that
handle specimens from New York patients can be caught by it too.

**Why this one matters more than the others:** MedTech is headquartered at 399 Knollwood Road,
White Plains, New York. This is home-field regulatory expertise the site does not claim once —
"New York State", "tissue bank" and "licensure" appear zero times across all 21 pages.

**Owning page:** `/services/lab-solutions/regulatory-compliance/`.
**Authority:** wadsworth.org / health.ny.gov.
**Status:** DRAFT — confirm MedTech's actual New York experience before publishing.

---

## Personnel credentials

### ABB (American Board of Bioanalysis)

The certifying board that issues the personnel credentials the ART laboratory world runs on —
HCLD, ELD and TS among them — by examination and eligibility review. ABB is affiliated with
the American Association of Bioanalysts.

Expanded exactly once on the entire site, inside `/privacy-policy/`
("…the American Board of Bioanalysis, state licensing boards…"), where no laboratory buyer
will read it. It belongs on the staffing and team pages, where the acronym is actually being
sold. **ABB is not AABB** — see the AABB entry above.

**Owning page:** `/services/lab-solutions/staffing-solutions/`.
**Referenced from:** `/our-team/`, `/about/`, `/`, `/services/`, `/services/lab-solutions/`.
**Authority:** aab.org.
**Status:** DRAFT.

### HCLD (ABB): High Complexity Laboratory Director

An ABB certification for directing a laboratory that performs high-complexity testing —
doctoral-level qualification plus laboratory experience, assessed by examination. In ART, an
HCLD-certified director is what lets a practice satisfy directorship requirements without
employing a full-time doctoral director, which is precisely what MedTech's "HCLD off-site
laboratory directors" offering sells.

**The unanswered question the site should answer:** what does an off-site director actually
sign, how often are they physically present, and will an inspector accept remote oversight?
That answer is uncopyable and MedTech already knows it.

**Owning page:** `/services/lab-solutions/staffing-solutions/`.
**Referenced from:** `/`, `/services/`, `/services/lab-solutions/`, `/our-team/`, `/about/`.
**Status:** DRAFT — the off-site directorship answer needs MedTech's regulatory review.

### ELD (ABB): Embryology Laboratory Director

An ABB certification specific to directing an embryology laboratory. Named exactly once on the
site — in a `/our-team/` "Specialists" tile attached to an individual with no bio, headshot or
verification (see AISEO-01, blocking).

**Owning page:** `/services/lab-solutions/staffing-solutions/`, alongside HCLD and TS, so a
buyer can see which credential permits what.
**Status:** DRAFT.

### TS (ABB): Technical Supervisor

An ABB certification for technical supervision of high-complexity testing. This is the
credential MedTech attaches to its temporary staff on five pages ("All MedTech temporary
laboratory staff are TS (ABB) certified"), so it is the site's single most load-bearing
credential claim — and it is never explained, and is mis-spelled as "TS (AABB)" twice on
`/about/`.

**Owning page:** `/services/lab-solutions/staffing-solutions/`.
**Status:** DRAFT.

### ASRM

The American Society for Reproductive Medicine: a professional membership society that
publishes practice guidance and committee opinions for reproductive medicine. **It is a
society, not a certifying body** — membership is not a personal credential and ASRM issues no
laboratory certification, which is why "Certifications: AABB, CLIA, ASRM" on `/our-team/` is a
category error.

**Owning page:** `/our-team/`, if the corrected credential line references it at all.
**Authority:** asrm.org.
**Status:** DRAFT.

### SART

The Society for Assisted Reproductive Technology. Member clinics report cycle data to SART's
registry, and clinic-level outcome reporting also exists at national level under federal ART
surveillance. Relevant here for one reason: **SART and the national ART surveillance data are
what "national benchmarks" would have to mean.** Two pages currently claim outcomes that
"consistently exceed national benchmarks" while naming no benchmark, cohort, period or metric
(AISEO-02, blocking). Either the claim cites a defined dataset or it comes down.

**Owning page:** wherever an outcomes claim is finally made — today, nowhere.
**Authority:** sart.org.
**Status:** DRAFT.

### RESOLVE

The National Infertility Association, a patient-advocacy non-profit. Dwight Ryan's bio on
`/our-team/` states he sits on its national board, having served over ten years as treasurer
and executive committee member. That is a real, externally checkable affiliation and a
candidate `memberOf` value on his `Person` node (AISEO-14).

**Owning page:** `/our-team/`.
**Status:** traceable to the export; the schema addition needs the client's confirmation.

### IFFS Surveillance

The International Federation of Fertility Societies' triennial global survey of ART practice,
initiated in 1998. Kathleen Miller's bio states she has been its managing editor since 2014 —
again a checkable credential that deserves a `Person` node and a `sameAs`, and one of the
strongest expertise signals on the site.

**Owning page:** `/our-team/`.
**Status:** traceable to the export.

---

## Laboratory processes and clinical terms

### ART (assisted reproductive technology)

The set of fertility treatments in which eggs or embryos are handled outside the body — IVF
and its variants. The site's whole positioning rests on the term and uses it 21 pages deep,
so one clean sentence of definition on `/about/` costs nothing and anchors the entity for
every reader and parser that follows.

**Owning page:** `/about/`.
**Status:** DRAFT.

### Embryology

The laboratory discipline that handles oocytes, sperm and embryos: fertilisation (including
ICSI), culture, assessment, biopsy for genetic testing, cryopreservation and thaw. It is the
work that most of MedTech's laboratory pages describe without naming as a discipline.

**Owning page:** `/services/lab-solutions/` (as the pillar definition).
**On the site today:** "embryology" appears in staff and division names; "ICSI" appears once,
inside an image `alt`; "blastocyst" appears once, inside a client testimonial.
**Status:** DRAFT.

### Andrology

The laboratory discipline covering semen analysis, sperm preparation and sperm cryopreservation.
Worth naming explicitly because of the CLIA distinction above: andrology testing is where CLIA
bites hardest in a fertility practice. The word "andrology" appears zero times on the site;
"andrologists" appears twice, both on `/about/`.

**Owning page:** `/services/lab-solutions/regulatory-compliance/`, next to CLIA.
**Status:** DRAFT.

### Vitrification

Ultra-rapid cooling that takes a cell to a glass-like solid state without forming damaging ice
crystals — now the standard technique for freezing oocytes and embryos. It is the process
behind every cryostorage sentence on the site, and it is named zero times.

**Owning page:** `/services/lab-solutions/practice-development/` (lab design and equipment) or
`/services/lab-solutions/real-time-monitoring/` (storage monitoring).
**Status:** DRAFT.

### Cryopreservation

The freezing and long-term storage of gametes and embryos, and the tank monitoring, alarming
and inventory control that surround it. On the site today the word appears exactly once — as
"Cryopreservation — Covered" on the insurance page. Specimen loss is the defining liability
exposure of an ART practice, so this term should be defined on a laboratory page first and
referenced from the insurance page second, not the other way round.

**Owning page:** `/services/lab-solutions/real-time-monitoring/`.
**Referenced from:** `/services/management-services/insurance-risk-management/`.
**Status:** DRAFT.

### Witnessing

The verification step that confirms the identity of gametes and embryos at every point where
they are handled or moved — performed by a second person, or by an electronic system using
barcodes or RFID. It is the control that prevents specimen mix-ups, and it is the first thing
an inspector probes. Zero occurrences on the site.

**Owning page:** `/services/lab-solutions/real-time-monitoring/` or
`/services/lab-solutions/regulatory-compliance/`.
**Status:** DRAFT.

### Chain of custody

The documented, unbroken record of who held a specimen, when, and what was done to it, from
collection through storage, transfer and use. The site lists it twice as an undefined bullet
("Full audit trail and chain of custody"). One paragraph turns a bullet into a capability.

**Owning page:** `/services/lab-solutions/real-time-monitoring/`.
**Status:** DRAFT.

### PGT (preimplantation genetic testing)

Genetic testing of embryo biopsies before transfer — for aneuploidy (PGT-A), monogenic
conditions (PGT-M), or structural rearrangements (PGT-SR). Named zero times on the site,
although `/our-team/` describes research advances in "pre-implantation genetics" in Kathleen
Miller's bio. If MedTech supports PGT workflow design, this is a service-relevant entity; if
not, leave it out rather than name-dropping it.

**Owning page:** `/services/lab-solutions/` only if MedTech confirms the capability.
**Status:** DRAFT — confirm scope before publishing.

---

## Commercial and product terms

### GPO (group purchasing organization)

An organisation that aggregates the purchasing volume of many practices and negotiates
contracts with vendors on their behalf; members buy on those contracts. In US healthcare a GPO
is typically funded by administrative fees paid by contracted vendors rather than by member
dues, which is how "free to join" is possible — and there is a federal statutory safe harbour
that permits such fees provided the arrangement is disclosed in writing to the member.

**Why this belongs on the page:** it answers the three questions the GPO page invites and
never addresses — how is MedTech paid, does joining bind me to minimums, and is there a
conflict when MedTech recommends a vendor it holds a contract with. Answering them honestly
is a differentiator, not a risk; every sophisticated buyer already assumes an answer.

**Owning page:** `/services/lab-solutions/gpo-purchasing/`.
**Referenced from:** `/`, `/about/`, `/services/`, `/services/lab-solutions/`,
`/services/management-services/accounting-finance/`.
**Status:** DRAFT — the fee-disclosure description is general US healthcare-GPO background.
MedTech's own economics and disclosure practice must be described by MedTech and reviewed by
counsel before publication.

### Provista

The destination of all three GPO registration calls to action on
`/services/lab-solutions/gpo-purchasing/` — "Become a Member", "Join GPO Today — It's Free"
and "Become a GPO Member" all point to `register.provista.com` with a MedTech partner
identifier in the query string.

**This is all the export supports.** "Provista" appears zero times in visible copy, zero times
in any JSON-LD and zero times in `llms-full.txt`; the nature of the relationship is not stated
anywhere on the site, so it cannot be written here. MedTech must supply it: what MedTech does,
what Provista does, and what the member's relationship is with each. Meanwhile a member-facing
testimonial on `/` and `/our-team/` still describes membership as "affiliated with Broadlane",
a GPO brand that has not traded under that name for well over a decade.

**Owning page:** `/services/lab-solutions/gpo-purchasing/`.
**Also needed:** `rel="noopener"` and an explicit off-site indication on the three
registration links, and the relationship expressed in the `Organization` / `Service` JSON-LD.
**Status:** BLOCKED on client input.

### OvaTools

MedTech's laboratory management platform, named on 8 of 21 pages and claimed as a trademark in
`/terms-of-service/`. The site describes it only in marketing sentences ("implements real-time
laboratory management software that transforms how your ART/IVF center operates"). There is no
product page, no screenshot, no specification, no validation statement, no hosting or security
posture, and no `SoftwareApplication` JSON-LD.

To become a real entity it needs: monitored parameters and equipment classes, alarm thresholds
and escalation paths, notification channels, audit-trail schema, validation status, hosting and
security posture, integration points, and screenshots.

**Owning page:** `/services/lab-solutions/real-time-monitoring/`.
**Status:** BLOCKED on client input — everything above is product fact MedTech holds.

### OVA Design

MedTech's ART laboratory design practice, named on 5 pages and claimed as a trademark, defined
only as "modular designs to premium air filtration systems".

Publishing the actual standard — target VOC and particulate thresholds, filtration stack,
pressure cascade, materials and off-gassing policy, commissioning and validation protocol,
with photographs of completed laboratories — would be the strongest non-commodity asset on the
site. The raw material already exists in a client testimonial on `/our-team/`: the Montana
build, where MedTech "designed every aspect of our lab from having the air quality assessed to
designing the lab space and ordering all of our microscopes, incubators and lab supplies".

**Owning page:** `/services/lab-solutions/practice-development/`.
**Status:** BLOCKED on client input.

### BAA (business associate agreement, HIPAA)

The written contract required between a covered entity — a fertility practice — and a vendor
that creates, receives, maintains or transmits protected health information on its behalf. It
sets out permitted uses, safeguards, subcontractor flow-down and breach notification.

`/contact/` already handles this better than most healthcare sites: "we will set up secure,
HIPAA-aligned communication channels and, where applicable, execute a Business Associate
Agreement (BAA) before any PHI is exchanged." That sentence is a model; the same clarity should
appear wherever software or staffing touches patient data.

**Owning page:** `/contact/` (already present, verbatim in the export).
**Referenced from:** `/services/lab-solutions/real-time-monitoring/`,
`/services/management-services/human-resources/`.
**Status:** traceable to the export; extension to other pages needs MedTech's confirmation.

---

## What this file deliberately is not

- **Not a glossary page.** Nothing here becomes `/glossary/` or one page per term. The route
  inventory is fixed at 21 and every definition lands inside an existing page's prose.
- **Not AEO/GEO markup.** There is no machine-only content variant, chunk delimiter or
  AI-optimisation meta tag here, because no such mechanism exists for Google Search. The
  levers are ordinary SEO, semantic HTML, crawlability, page experience and genuinely useful
  content.
- **Not a source of claims about MedTech.** Every entry describes a public framework, a
  credential or a term. Anything that would become a MedTech claim — scope, registration,
  accreditation, personnel, economics — is marked DRAFT or BLOCKED and belongs to the client.
