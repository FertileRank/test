# Content Audit — medtech4solutions.com against Google's generative-AI-features guidance

**Scope:** `llms.txt`, `llms-full.txt`, and the main content of `/`, `/about/`, `/our-team/`,
`/services/lab-solutions/gpo-purchasing/`, `/services/lab-solutions/staffing-solutions/`,
`/services/management-services/marketing/`, with corroborating greps across all 21 exported pages.
**Source read:** `/tmp/claude-0/-home-user-test/da065df0-1665-52a8-b803-716d1ee66e9a/scratchpad/src/source-export/`
**Date of audit:** 2026-08-29. **Export lastmod (sitemap.xml):** 2026-08-21.

---

## 0. Ground rules — what Google actually says, stated plainly

Everything below is written against Google's *"Optimizing your website for generative AI features on
Google Search"* guidance. Four things need saying up front, because they invalidate most of what the
"AEO/GEO" cottage industry sells:

1. **Google Search ignores `llms.txt` and `llms-full.txt`.** They are not a ranking signal, not a
   discovery mechanism for Googlebot, and not read by AI Overviews or AI Mode. Google's own position is
   that its systems read your pages. Keep the two files — they are cheap, and third-party crawlers
   (Anthropic's ClaudeBot, OpenAI's GPTBot/ChatGPT-User, PerplexityBot) do fetch conventional locations —
   but label them accurately in the repo and in `robots.txt` comments as **for third-party AI crawlers
   only**. Do not put them in a deliverable as an SEO win.
2. **There is no AI-specific markup that helps Google.** No `ai-content`, no "GEO schema", no
   chunk-delimiter meta tag, no `speakable` shortcut. Structured data helps Google *understand* a page and
   is worth doing well, but it is described in Google's own guidance as **optional-but-useful**, not a
   generative-AI lever.
3. **No chunking, no rewriting for machines.** Google explicitly says you do not need to restructure
   content into "LLM-friendly" chunks, add Q&A boilerplate to every heading, or maintain a parallel
   machine copy. The parallel copy this site already maintains (`llms-full.txt`) is in fact a liability
   right now — see §2, where it has silently drifted from the HTML.
4. **The win is ordinary SEO plus genuinely useful content.** Crawlable HTML, clean semantics, unique
   people-first pages, good page experience, strong images, and — the part that actually separates this
   site from its competitors — **first-hand experience nobody else can copy.**

There is one more rule that matters here more than any technical item: Google's guidance is built on
E-E-A-T, and the first E is **Experience**. A page that asserts expertise it cannot evidence performs
worse than a shorter page that shows real work. Several pages on this site currently assert.

---

## 1. Headline judgement

The site is **not** a query-variation page farm — that is genuinely good news and means the biggest
structural mistake in this category has been avoided. 21 pages, every `<title>` unique, every route
justified by a distinct service, no doorway pages, no city-permutation directory.

The problem is different: **the site's real, unique, hard-to-fake expertise is concentrated in about
four places, and the other 90% of the copy is interchangeable B2B healthcare-consulting filler that any
competitor could publish verbatim tomorrow.** Meanwhile some of the filler makes claims — clinical
outcome claims, staffing certifications, named specialists, marketing metrics — that are internally
contradictory or unverifiable, which actively suppresses the trust signal the good content earns.

Fix ratio, roughly: **20% "write new things", 80% "make what you already did legible and provable."**

---

## 2. Commodity vs. first-hand — with the actual sentences

### 2a. Genuinely first-hand, non-commodity (protect this, build on it)

These are the passages that could only have been written by this company. They are specific, dated,
named, checkable, and in several cases self-limiting — which is exactly the tone Google's guidance
rewards.

**`/our-team/` — Dwight Ryan bio.** Verifiable career facts with dates and named institutions:

> "Mr. Ryan was formerly the VP and Chief Financial Officer from 1987–1998 of the first-of-its-kind
> infertility services company and took them public in 1991 on the NASDAQ. … He was previously the Chief
> Operating Officer of Reproductive Medicine Associates of New Jersey (RMA-NJ) and most recently at
> Reproductive Medicine Associates of New York (RMA-NY). … Mr. Ryan is currently a board member on the
> national board of RESOLVE, having served over ten years as its treasurer and executive committee
> member."

**`/our-team/` — Kathleen Miller bio.** Publication record, a named role in a named global survey, a
research agenda:

> "author of more than 100 abstracts, papers, and chapters on fertility and assisted reproduction
> technologies… well known for research advances in blastocyst culture and pre-implantation genetics…
> She has been the managing editor of the IFFS Surveillance since 2014, a triennial survey, initiated in
> 1998 by Drs. Howard Jones, Jr. and Jean Cohen, assessing assisted reproductive technology practices at
> the global level."

**`/our-team/` — the Montville/Shomento testimonial.** This is the single best piece of content on the
site: a named client, a named place, a named MedTech person, and a concrete list of what was actually
done:

> "Starting an IVF center in Montana was no small project!! … Kathy designed every aspect of our lab
> from having the air quality assessed to designing the lab space and ordering all of our microscopes,
> incubators and lab supplies. Dwight Ryan has been invaluable in educating our administrative and
> billing staff."
> — Christopher Montville, MD & Stacy Shomento, MD, Reproductive Medicine & Fertility Care, Billings, Montana

Also strong and named: Wes Edmonds (Laboratory Section Chief, University of Alabama at Birmingham) on
"implementing new technologies and culture systems… key in the development and success of our blastocyst
transfer program"; Jerald S. Goldstein, MD (Fertility Specialists of Texas); Fady I. Sharara, MD
(Virginia Center for Reproductive Medicine); Steven C. Gerson, CPA (Atlanta Center for Reproductive
Medicine).

**`/contact/` — the "Before You Reach Out" FAQ.** The most useful prose on the site, and the only place
where MedTech tells a buyer something against its own commercial interest:

> "Please do not include protected health information (PHI) or any patient-identifying details in this
> form or in initial emails. Web forms and unencrypted email are not appropriate channels for PHI. Once
> we begin a formal engagement, we will set up secure, HIPAA-aligned communication channels and, where
> applicable, execute a Business Associate Agreement (BAA) before any PHI is exchanged."

> "Initial discovery calls are complimentary — typically 30 to 60 minutes… There is no obligation, no
> sales pressure, and no fee."

> "…we routinely take on adjacent projects — lab equipment validation, vendor evaluations, clinical
> workflow audits, second-opinion reviews, expert witness work… Describe what you need in your message
> and we'll let you know whether it fits our scope **or refer you elsewhere**."

**`/services/lab-solutions/gpo-purchasing/` — the named vendor roster.** Concrete and checkable:

> "Hamilton Thorne · NexGen · Vitrolife / Mckesson · Fisher Scientific / Airgas · Federal Express · GE /
> Nikon · Olympus · LabCorp / Staples · Office Depot · Steelcase / Herman Miller · Kimball"

**Image alt text, sitewide.** 50 `<img>` elements, 29 unique assets, **zero missing `alt`**, and the alt
text is domain-literate rather than keyword-stuffed:
`"Embryologist performing micromanipulation at an ICSI workstation"`,
`"Embryo incubators, cryostorage dewar, and inverted microscope in an IVF laboratory"`,
`"Embryo incubator with real-time monitoring sensors and status dashboard"`.
This is already at the standard Google's "high-quality images" point asks for. Keep it.

### 2b. Commodity — indistinguishable from any competitor

**`/services/management-services/marketing/` is the weakest page on the site.** Every capability heading
is a generic agency menu item, and the two statistics panels are unsourced, unattributed, undated, and
contradict each other:

> Panel 1: "3x Patient Leads · 40% Higher Conversions · SEO Optimized · ROI Tracked"
> Panel 2: "+185% Organic Traffic · 3.2x Lead Volume · 42% Conv. Rate · $12 Cost/Lead"

No client, no timeframe, no denominator, no methodology, no "results vary" note. "40% Higher
Conversions" and "42% Conv. Rate" are different metrics one line apart with near-identical labels. A
$12 cost-per-lead in fertility is far enough from category norms that it reads as illustrative rather
than measured. The page's own differentiation sentence — *"We don't do generic healthcare marketing"* —
is immediately followed by six headings that are generic healthcare marketing ("Digital Marketing &
SEO", "Brand Development", "Analytics & Reporting", "Content & Email Marketing").

**`/services/lab-solutions/regulatory-compliance/` names the regulators and explains none of them.**
"FDA, CLIA, CAP, AABB" appears five times on the page as an undifferentiated string. Nowhere does the
page say what each body actually regulates in an ART lab (see §3). It also carries two claims that
should not survive legal review:

> "Automated compliance reports generated in real-time, covering FDA, CLIA, CAP, AABB, and
> state-specific regulatory requirements **with 100% accuracy**."

> "Streamlined audit preparation guidance that **reduces preparation time by up to 60%**…"

**`/services/lab-solutions/staffing-solutions/` describes a staffing service without staffing
specifics.** No time-to-fill, no credential-verification steps, no on-boarding protocol, no rate
structure, no coverage-area detail. Its stat tile also contains an outright error:

> "Temporary · 100% TS (ABB) Certified · 30+ Years Experience · **50+ States Covered**"

There are 50 states. Every other page says "all 50 states."

**`/about/` "What Sets MedTech Apart" and `/` "Why Choose Us" are the same three tiles**, and neither
version contains a fact:

> "ART/IVF Specialists · Hands-On Implementation · Proven Track Record"
> "We don't just advise. Hands-on management support from laboratory design through operational
> optimization delivers measurable results."

"Measurable results" that are never measured. `/` and `/about/` also share near-duplicate body copy for
the company description (four paragraphs, re-worded but the same substance) — not thin-content
duplication, but a wasted page: `/about/` should be earning trust with history, not restating the
homepage.

**Emoji as iconography.** `/about/` uses 🔬 🤝 📊 🛡️ and `/our-team/` uses 🧬 ✓ 🏗 👥 💡 🤝 as section
icons. This is a small thing, but in a YMYL-adjacent medical-services context it reads as template
output rather than considered design, and it is one of the cheapest credibility upgrades available.

---

## 3. `llms.txt` / `llms-full.txt` — accuracy and drift

**First, the framing, because it changes what "fix" means:** neither file affects Google. `llms.txt`
(1,964 B) is a clean, correct index — 20 links, matching the 20 indexable routes, 404 correctly
excluded. `llms-full.txt` (112,391 B) covers the same 20 pages with `Source:` URLs. Structurally sound.

**But `llms-full.txt` is not an accurate mirror of the HTML.** It is generated by a pass that walks
headings and paragraphs and drops several element types wholesale. The result is that the file omits
precisely the facts an AI system would want to cite, while faithfully reproducing the site's
contradictions. Specifics:

### 3a. Every numeric stat tile is silently deleted

The `/services/management-services/marketing/` page's six headline numbers exist in the HTML and are
**completely absent from `llms-full.txt`**:

| Value | in marketing HTML | in `llms-full.txt` |
|---|---|---|
| `+185%` | 1 | **0** |
| `3.2x` | 1 | **0** |
| `42%` | 1 | **0** |
| `$12` | 1 | **0** |
| `3x` | 1 | **0** |
| `40%` | 1 | **0** |

Same failure on `/services/lab-solutions/gpo-purchasing/`. The HTML renders a "GPO Savings Dashboard"
containing `$0 Cost to Join / 300+ IVF Practices / 1800+ Active Contracts / 10% - 50% Cost Savings`.
`llms-full.txt` line 722–724 renders that entire block as:

```
##### GPO Savings Dashboard

Member benefits
```

The four numbers are gone. The second GPO panel (`$0 / No / No / No / Yes`) is dropped the same way. So
is the homepage trust bar (`Serving fertility clinics since 2005 · Exclusive ART & IVF specialization ·
Nationwide coverage across all 50 states · Free-to-join GPO · 300+ member practices`) and the homepage
stat row (`2005 Founded · 10 Service Areas · U.S. Nationwide Coverage`).

### 3b. Every date on the `/about/` timeline is deleted

`/about/` renders a six-milestone company timeline with year labels **2005, 2008, 2012, 2016, 2020,
Today**. In `llms-full.txt` (lines 214–241) all six years are stripped, leaving six undated headings:
"Founded in White Plains, NY", "GPO Program Launched", "Regulatory Compliance Practice Expanded",
"Staffing & Recruitment Division", "Management Services Suite", "Fertility Practices Nationwide. All 50
States." A model reading this file cannot tell when the GPO launched. This is the single worst drift on
the site.

### 3c. Homepage testimonial attributions are deleted

On `/` the two testimonials carry attributions in the HTML — *Steven C. Gerson, CPA, MPAcc, Chief
Financial Officer, Atlanta Center for Reproductive Medicine* and *Executive Director, Westchester County
Medical Society*. In `llms-full.txt` (lines 116–120) both quotes appear with **no attribution at all**.
Inconsistently, the same testimonials on `/our-team/` *do* keep their attributions (lines ~420–470).
Unattributed quotes are worse than no quotes for grounding.

### 3d. Internal links lose their targets

`llms-full.txt` contains **zero** Markdown inline links (`](http` count: 0). Every "Continue exploring"
block degrades from real `<a href>` elements to plain bullets:

```
- Accounting & Finance Turn purchasing data and operating costs into clearer financial decisions.
```

The corpus therefore encodes no internal link graph, and the run-on "label + description" bullets are
ungrammatical.

### 3e. Heading levels mirror the HTML's broken order

The generator demotes each page's `<h1>` to `###`, `<h2>` to `####`, `<h3>` to `#####`. Because the
three service pages audited all emit `h1 → h3 → h2` in the HTML, the Markdown emits `### → ##### → ####`
— a level-5 heading before its own level-4 parent. On `/` the FAQ questions render as `######` directly
under a `####`, skipping level 5. (This is the same defect as the Lighthouse `heading-order` a11y
failure recorded in the brief; the Markdown drift is a symptom, not a separate bug.)

### 3f. Where the counts *do* agree

Credit where due — the specific figures asked about are reproduced faithfully where the generator picks
up prose rather than tiles:

| Claim | HTML pages stating it | `llms.txt` | `llms-full.txt` |
|---|---|---|---|
| **"300+" IVF practices / member practices** | `/`, `/services/`, `/services/lab-solutions/`, `/services/lab-solutions/gpo-purchasing/`, `/services/lab-solutions/real-time-monitoring/` | not stated (index only — correct) | 3 occurrences (lines 604, 648, 692) + 2 as "over 300" (728, 767) — **agrees with the prose, but the `300+ IVF Practices` stat tile on the GPO page is missing** |
| **"1,800+" vendor contracts** | `/contact/`, `/our-team/`, `/privacy-policy/`, `/services/`, `/services/lab-solutions/`, `/services/lab-solutions/gpo-purchasing/` | not stated | 7 occurrences — agrees; **but the GPO page's `1800+ Active Contracts` tile is missing** |
| **"30+" laboratories / years** | `/our-team/`, `/services/`, `/services/lab-solutions/practice-development/`, `/services/lab-solutions/staffing-solutions/` | not stated | 5 occurrences — agrees |
| **"over 125 years of collective experience"** | `/about/` only | not stated | 1 occurrence (line 240) — agrees |
| **"50+ States Covered"** | `/services/lab-solutions/staffing-solutions/` only | — | **0** — the erroneous tile is dropped, which accidentally hides the error rather than fixing it |

**Conclusion:** the numbers themselves have not drifted; the *containers* holding them have been dropped.
`llms-full.txt` should either be regenerated from the same DOM pass that produces the visible page —
including tile values, dates, attributions, and links — or it should not exist. A partial mirror is
worse than none, because a third-party crawler will treat its silence as absence.

### 3g. `llms.txt` — two small, cheap improvements

- Entries are bare `[Title](url)` with no one-line description. The `llms.txt` convention supports
  `- [Title](url): summary`, and the build already has a `summary` field per route in
  `site.config.mjs`. Emit it.
- The `Summary:` line is accurate and well-scoped. Leave it alone.

### 3h. `robots.txt` cruft

`robots.txt` carries `Allow: /_next/static/` and `Allow: /_next/image/` on a site that is not Next.js,
plus `Disallow: /api/` and `Disallow: /admin/` for paths that do not exist. Harmless, but it is
boilerplate from another stack and should be dropped. The AI-crawler `Allow:` blocks (GPTBot,
ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended) are correct and should be
kept — note that `Google-Extended` governs Gemini/Vertex grounding, **not** Google Search ranking or AI
Overviews sourcing, so allowing it is a separate decision from SEO and should be documented as such.

---

## 4. Entity coverage for the ART/IVF domain

AI systems ground on entities that are *named, defined, and linked*. This site is at step one for almost
every entity in its own domain. Counts are file-hit counts across all 21 HTML pages.

### 4a. Named repeatedly, never defined, never linked

| Entity | HTML files | Expanded anywhere? | Linked to authority? |
|---|---|---|---|
| **FDA** | 9 | ❌ "Food and Drug Administration": **0 occurrences sitewide** | ❌ |
| **CLIA** | 9 | ❌ "Clinical Laboratory Improvement Amendments": **0** | ❌ |
| **CAP** | 9 | ❌ "College of American Pathologists": **0** | ❌ |
| **AABB** | 9 | ❌ full name: **0** | ❌ |
| **HCLD** | 7 | ❌ "High Complexity Laboratory Director": **0** | ❌ |
| **TS (ABB)** | 5 | ❌ "Technical Supervisor" / "American Board of Bioanalysis": **0** in service copy | ❌ |
| **ELD(ABB)** | 1 | ❌ "Embryology Laboratory Director": **0** | ❌ |
| **ASRM** | 1 | ❌ | ❌ |
| **GPO** | expanded ✅ ("Group Purchasing Organization (GPO)", 6 files) | ✅ | ❌ no link, no aggregator named |
| **ART** | expanded ✅ ("assisted reproductive technology (ART)", 5 files) | ✅ | ❌ |
| **OvaTools** | 8 | ❌ described only in marketing sentences; no product page, no screenshot, no spec, no route | ❌ |
| **OVA Design** | 5 | ❌ never defined; trademarked in ToS | ❌ |
| **OvaTools Training Institute** | 1 (Terms of Service only) | ❌ appears nowhere else on the site | ❌ |

The only place any of these is spelled out is buried in the privacy policy:
> "…professional credentials or background information shared by staffing platforms, **the American
> Board of Bioanalysis**, state licensing boards, or similar entities in a recruitment context."
> — `/privacy-policy/`

That single sentence is the only expansion of ABB on the entire site, and it is on the one page nobody
reads.

### 4b. Domain entities that are absent entirely (0 occurrences sitewide)

`vitrification` · `witnessing` (electronic or double-witnessing) · `andrology` · `PGT` / `PGT-A` /
`preimplantation genetic testing` · `SART` · `CDC ART Success Rates` · `21 CFR Part 1271` · `HCT/P` ·
`tissue bank licensure` · `New York State Department of Health` · `ISO` · `Joint Commission` ·
`USP <797>` · `reciprocal IVF`.

`cryopreservation` appears **once**, and only on `/services/management-services/insurance-risk-management/`
as an insurance coverage line — never on any laboratory page. `chain of custody` appears twice, as a
bullet, undefined. `ICSI` appears once — **inside an image `alt` attribute**. `blastocyst` appears once,
inside a client testimonial. In other words: the words an embryologist actually uses appear on this site
almost exclusively in places the copy didn't write.

### 4c. Entities asserted incorrectly

1. **ABB vs. AABB conflation.** `/about/` says *"TS (AABB)-certified temporary ART professional
   placement services"* and *"TS (AABB)-certified recruiters"*. Every other page says *"TS (ABB)"*.
   These are different organisations — **ABB** (American Board of Bioanalysis) issues the TS, ELD and
   HCLD personnel certifications; **AABB** is an accreditation body for cellular therapy and reproductive
   tissue facilities. The `/about/` page is wrong, and it is wrong in the two places that describe the
   staffing division's core credential.
2. **"Certifications: AABB, CLIA, ASRM"** (`/our-team/`, Embryology tile) is a category error. AABB is a
   facility accreditation, CLIA is a federal laboratory certification programme, and ASRM is a
   professional society that issues no personnel certification at all. None of the three is a personal
   credential.
3. **The GPO's actual aggregation relationship is undeclared.** All three "Become a Member" / "Join GPO
   Today — It's Free" / "Become a GPO Member" CTAs on `/services/lab-solutions/gpo-purchasing/` point
   off-site to `https://register.provista.com?cpId=CD3DFC2A-…`. **"Provista" appears zero times in the
   visible copy, zero times in JSON-LD, and zero times in `llms-full.txt`.** Meanwhile the homepage and
   `/our-team/` testimonials say members are *"a MedTech GPO member affiliated with **Broadlane**"* —
   a GPO brand that has not operated under that name for well over a decade. A buyer clicking the primary
   CTA lands on an unexplained third-party domain, and every AI system reading the page is left with a
   stale affiliate name and no current one. This is simultaneously the site's biggest conversion leak and
   its biggest entity gap.

### 4d. The definitions that should exist

Each of these belongs as a real, linked, 60–150-word definition in page copy (and ideally in a single
`/services/lab-solutions/regulatory-compliance/` glossary section that other pages link to). Not a
keyword page — a definition a lab director would nod at:

- **FDA in an ART lab** — reproductive HCT/P registration and 21 CFR Part 1271 donor-eligibility,
  screening and testing requirements; which practices are in scope and which are not.
- **CLIA** — what it actually covers in a fertility centre (andrology/semen analysis and other clinical
  testing) and, critically, **what it does not** (embryology culture is largely outside CLIA's scope) —
  the most commonly misunderstood fact in the field and an instant credibility signal.
- **CAP** — the Reproductive Laboratory Accreditation Program, checklist cycle, inspection cadence.
- **AABB** — reproductive tissue standards, what accreditation covers, when a fertility centre needs it.
- **New York State tissue-bank licensure (NYSDOH)** — MedTech is headquartered in White Plains, NY, and
  NY is one of the strictest jurisdictions in the country. This is home-field expertise going unclaimed.
- **HCLD, ELD, TS — all "(ABB)"** — what each certification permits the holder to do, what the ABB
  requires to obtain it, and what an "off-site HCLD director" is legally responsible for. The staffing
  page's entire value proposition rests on a credential it never explains.
- **Group Purchasing Organization** — how aggregation actually works, what a GPO can and cannot commit a
  member to, and **who MedTech aggregates through** (see 4c.3).
- **OvaTools** — what it monitors (which parameters, which equipment classes), how alerts are delivered,
  what its audit trail records, whether it is a validated system, hosting/security posture. Give it a
  page, screenshots, and an `@type: SoftwareApplication` node.
- **OVA Design** — what the service comprises: air-quality/VOC targets, HEPA/carbon filtration,
  positive-pressure design, materials selection, commissioning and validation.
- **Witnessing / chain of custody** — manual double-witnessing vs. electronic witnessing (RFID/barcode),
  and what MedTech implements. Currently two undefined bullet mentions.
- **Cryopreservation & cryostorage** — vitrification workflow, tank monitoring, alarm thresholds,
  inventory reconciliation. Currently referenced once, on an insurance page.

---

## 5. Internal contradictions and unsupported claims (the trust ledger)

Every one of these is a self-inflicted trust wound. Google's guidance does not need to mention them
individually — inconsistency is exactly what "people-first, trustworthy content" is measured against.

| # | Contradiction | Where |
|---|---|---|
| 1 | **Founding year: 2005 vs 2006.** `/`, `/about/`, `/contact/`, every footer, `llms.txt` and the Organization JSON-LD (`"foundingDate":"2005"`) all say 2005. Dwight Ryan's own bio says *"Mr. Ryan founded MedTech For Solutions, Inc **in 2006**"*. | `/our-team/` vs everything else |
| 2 | **Experience total: "30+ years" vs "125 years" vs "two decades".** `/our-team/` H1 intro: *"over 30 years of combined experience"*; `/our-team/` culture tile: *"30+ years serving the ART industry"*; `/about/`: *"over 125 years of collective multidisciplinary experience"*; `/`: *"two decades of hands-on ART expertise"*; `/services/`: *"30+ years of hands-on leadership experience"*. A company founded in 2005 cannot have 30+ years of its own history. | 4 pages |
| 3 | **Service count: 10 vs 12 vs "ten".** `/` stat tile: *"10 Service Areas"*; `/` CTA: *"whether you need one service or all ten"*; `/contact/`: *"Our **12** service areas cover the most-requested needs"*. The route inventory has 10 leaf services. | `/`, `/contact/` |
| 4 | **"50+ States Covered"** — there are 50. Every other page says "all 50 states". | `/services/lab-solutions/staffing-solutions/` |
| 5 | **`TS (AABB)` vs `TS (ABB)`** — see §4c.1. | `/about/` vs 4 other pages |
| 6 | **Address: with vs without Suite 303.** `/contact/`: *"399 Knollwood Road, **Suite 303**, White Plains, NY 10603"*. Every footer and the Organization JSON-LD `streetAddress`: *"399 Knollwood Road"*. NAP consistency is ordinary local-SEO hygiene and it is currently broken against the site's own schema. | `/contact/` vs JSON-LD + 21 footers |
| 7 | **Vendor lists disagree across three pages.** `/services/`: *"Staples, McKesson, GE, Nikon, Olympus, **NextspringHealth**"*. `/services/lab-solutions/`: *"Hamilton Thorne, Vitrolife, **Cooper-Surgical**, Nikon, Olympus, and GE"*. `/services/lab-solutions/gpo-purchasing/` "Specialized ART Contracts": *"**Roche**, NextspringHealth, **NextGen**, Fisher Scientific, McKesson, and FedEx"* — while the same page's Featured Partners grid says *"**NexGen**"* (different spelling) and omits Roche entirely. | 3 pages |
| 8 | **"Sarah Chen" holds two different jobs.** `/our-team/` Embryology tile: *"Specialists: **Dr. Sarah Chen, HCLD(ABB)**"*. Eight paragraphs later, the culture quote: *"— **Sarah Chen, Director of Laboratory Solutions**"*. | `/our-team/` |

### Unsupported claims that need a source, a qualifier, or removal

| Claim | Page | Problem |
|---|---|---|
| *"Our laboratories consistently achieve outcome results that **exceed national benchmarks**."* | `/services/lab-solutions/practice-development/` | A clinical-outcomes claim with no data, no definition of "outcome", no benchmark named (CDC ART Success Rates? SART?), no cohort, no period. This is the highest-risk sentence on the site — YMYL-adjacent, and the kind of assertion that both Google's quality guidance and healthcare advertising rules treat harshly. |
| *"…outcomes that consistently exceed national benchmarks."* | `/about/` | Same claim, restated. |
| *"MedTech has built or retrofitted **more IVF practices and laboratories than any company in the industry**."* | `/our-team/` | Unqualifiable market-leadership superlative. |
| *"remains the **only** consulting firm built exclusively for the ART industry"* | `/about/` | Absolute exclusivity claim; trivially falsifiable. |
| *"…compliance reports … **with 100% accuracy**"* | `/services/lab-solutions/regulatory-compliance/` | No software is 100% accurate. Indefensible and unnecessary. |
| *"reduces preparation time by **up to 60%**"* / *"Reduces audit prep time by **60%**"* | `/services/lab-solutions/regulatory-compliance/`, `/services/lab-solutions/` | Same claim stated once as a ceiling and once as a fact. No basis given. |
| *"10% - 50% Cost Savings"* | `/services/lab-solutions/gpo-purchasing/` | Plausible for a GPO, but needs a category breakdown or a "typical range across categories; varies by spend profile" qualifier to be credible. |
| The six marketing metrics | `/services/management-services/marketing/` | See §2b. |

### The specialist roster problem — the most serious item in this audit

`/our-team/` lists six named "Specialists" under the Core Expertise tiles:

> Dr. Sarah Chen, HCLD(ABB) · Michael Rodriguez, ELD(ABB) · Jennifer Walsh, Compliance Director ·
> David Park, QA Manager · Robert Martinez, Lab Design Engineer · Lisa Thompson, Staffing Director ·
> Dr. Kevin O'Brien, VP Practice Development · Margaret Evans, GPO Director

None of them has a bio, a photograph, a credential link, a LinkedIn profile, or a `Person` schema node —
in stark contrast to Dwight Ryan and Kathleen Miller, who have all of those. The page carries only four
`<img>` elements: a hero, two real headshots (Ryan, Miller), and the logo. One of the eight names is
given two conflicting titles (§5, row 8). The remaining "specialists" are listed as "The Design Team",
"Recruitment Team", "Consulting Team", "Procurement Team".

**This must be verified before the rebuild ships.** If these are real employees, they need real bios,
headshots, credentials and `Person` markup — they would be a major E-E-A-T asset. If they are
illustrative placeholders, they are fabricated personnel on a healthcare-services site, and that is the
fastest way to destroy the trust the Ryan and Miller bios earn. There is no middle option: an unverified
named individual with a claimed clinical certification cannot ship.

---

## 6. What MedTech could publish that is genuinely non-commodity

Ground rule: **no generic "start a blog" advice, no keyword-variation pages, no AI-written filler.** Each
item below is derived from something the site *already claims to have done*, so the raw material exists
inside the company. If an item cannot be sourced from real engagements, it should not be published.

### Tier 1 — highest value, lowest invention required

1. **"Starting an IVF center in Montana" — the full build story.**
   The site already has the client's own testimonial naming the work: air-quality assessment, lab space
   design, microscope/incubator/supply procurement, admin and billing staff training. Turn that into one
   long-form case study with the client's permission: timeline, floorplan constraints, air-handling
   spec, equipment list, what went wrong, what it cost in weeks. One page like this outranks and
   out-cites twenty service pages, and no competitor can copy it.

2. **The OVA Design lab-build reference page.** The site claims *"30+ labs and practices designed
   nationally, from modular designs to premium air filtration systems."* Publish the actual design
   standard: target VOC and particulate thresholds, filtration stack, pressure cascade, materials and
   off-gassing policy, bench and workstation layout, commissioning and validation protocol, common
   retrofit constraints in existing medical office buildings. Add photographs of real completed labs.
   This is the single most searched, least well-served topic in the category.

3. **A real regulatory map: "Who regulates your IVF lab, and for what."**
   FDA (HCT/P registration, 21 CFR Part 1271) vs CLIA (andrology, not embryology culture) vs CAP
   (Reproductive Laboratory Accreditation Program) vs AABB (reproductive tissue standards) vs state
   licensure — with New York's tissue-bank regime called out, since that is MedTech's own back yard.
   Written by, and bylined to, whoever on the team has actually sat through those inspections. This
   replaces the current commodity compliance page rather than sitting beside it.

4. **An honest GPO economics page.** Explain how the aggregation actually works, **name Provista** and
   explain the relationship, retire the stale "Broadlane" reference in the Gerson testimonial (or
   date-stamp the quote), and replace "10%–50%" with a category-by-category savings table — reagents,
   consumables, capital equipment, office, shipping — with the basis stated. Add the membership
   agreement's actual terms: no minimums, no obligations, cancellation, what data MedTech sees.

5. **Real bios and `Person` schema for everyone named on the site.** Ryan and Miller already have the
   content; it just needs `Person` nodes, `sameAs` links to LinkedIn/ORCID/PubMed, and — for Miller —
   a linked publication list. Every other named person either gets the same treatment or comes off the
   page (§5).

### Tier 2 — strong, requires modest new work

6. **"What an off-site HCLD director actually does."** Legal responsibilities, review cadence, what the
   director signs, how remote oversight satisfies inspectors, when it is and isn't appropriate. The
   staffing page sells this service in one sentence and explains none of it.

7. **A staffing-coverage playbook.** Typical time-to-fill for an embryologist by region, the
   credential-verification steps MedTech runs, what a per-diem engagement covers, how a temp is
   on-boarded into an existing witnessing and QC system in under a week. Concrete operational detail
   only a firm that does this can write.

8. **An OvaTools product page with evidence.** Monitored parameters and equipment classes, alarm
   thresholds and escalation paths, notification channels, audit-trail schema, validation status,
   hosting and security posture, integration points, screenshots. Currently the platform is named a
   dozen times, trademarked in the Terms of Service, and never shown.

9. **A pre-inspection readiness checklist** as a genuinely useful downloadable — derived from the
   engagements behind the "reduces audit prep time" claim. Publishing the checklist both substantiates
   the claim and is the kind of asset that gets cited and linked.

10. **Annual "State of the ART Lab Supply Market."** MedTech sits on 1,800+ vendor contracts across 300+
    practices. That is a proprietary dataset. An aggregated, anonymised annual price-movement report on
    reagents, consumables and capital equipment would be the only such publication in the sector, would
    earn citations from trade press, and is the strongest possible substitute for the unsourced
    percentages currently on the site.

### Tier 3 — worth doing, lower priority

11. **Kathleen Miller's IFFS Surveillance connection.** She is its managing editor since 2014. A short
    commentary on each edition's findings, published on-site and linked to the source, is unique
    authority nobody else in the vendor category has access to.
12. **Rewrite `/services/management-services/marketing/` around fertility-specific practice, not agency
    capabilities** — patient-journey sensitivities, what fertility PPC compliance actually requires,
    referral-network mechanics — and delete both metric panels until real, client-attributed, dated
    numbers exist to replace them.
13. **Move the `/contact/` FAQ's best answers up into the service pages** (see §7) rather than leaving
    the site's most credible prose on its lowest-authority page.

---

## 7. Q&A / FAQ coverage

### What the site answers today

**`/` — six FAQs**, with matching `FAQPage` JSON-LD (the only `FAQPage` on the site). They are entirely
company-orientation questions: *What is MedTech For Solutions? · What services does MedTech provide for
IVF laboratories? · How does MedTech's Group Purchasing Organization work? · Does MedTech provide
temporary IVF laboratory staffing? · What management services does MedTech offer? · Where is MedTech For
Solutions located?*

**`/contact/` — seven excellent operational FAQs** (§2a) — and **no `FAQPage` markup at all**.

**Every other page — zero Q&A.** Verified: `FAQPage` appears in exactly one file
(`index.html`), and a visible FAQ heading appears in exactly one file (`index.html`).

So: **13 questions total, all on two pages, and the six that carry structured data are the six least
useful ones.** The five lab-solutions pages and five management-services pages — the pages a buyer
actually evaluates — answer nothing.

### What a fertility-practice buyer actually asks

Grouped by who is asking. None of these is currently answered anywhere on the site.

**A lab director / HCLD evaluating MedTech:**
- Is my embryology lab subject to CLIA, or only my andrology lab?
- Do I need to register with the FDA as an HCT/P establishment, and what does 21 CFR Part 1271 require of me?
- What's the difference between CAP Reproductive Laboratory accreditation and AABB accreditation — do I need both?
- What does New York State require that federal regulation doesn't?
- What does an off-site HCLD director sign, and will an inspector accept remote oversight?
- Can you cover a two-week embryologist absence starting Monday? What's your realistic time-to-fill?
- Are your temps TS(ABB), ELD(ABB), or HCLD(ABB) — and how do you verify it?
- Will a temp be able to run our witnessing and QC system, and who trains them?
- Do you monitor incubator CO₂/O₂/temperature *and* cryotank levels? What are the alarm thresholds and who gets paged at 3 a.m.?
- Is OvaTools a validated system? Where is the data hosted? Will you sign a BAA?

**A practice administrator / CFO:**
- What does a lab build actually cost, and how long from contract to first cycle?
- What's the realistic saving on our specific spend profile — reagents vs. capital vs. office?
- Does joining the GPO restrict who we can buy from, or bind us to minimums?
- Who is Provista, and what is my relationship with them versus with MedTech?
- How is MedTech paid — retainer, project fee, GPO rebate, or all three? Is there a conflict when you recommend a vendor you have a contract with?
- Can we engage you for one service, or is it a bundle?
- Can you work alongside our existing lab director / our existing marketing agency?
- What happens when the engagement ends — do we keep the documentation and the systems?

**A physician-owner considering a new centre:**
- What does it take to open a new IVF centre, start to finish, and in what order?
- How do you assess whether my market can support a lab?
- What's the minimum viable lab footprint and equipment list?
- Do you help arrange financing, and what do lenders want to see?
- How do you handle the transition from a satellite/send-out model to an in-house lab?

**Everyone:**
- Who exactly will be working on my account?
- Can I talk to a reference in a practice of my size?
- What have you *not* been able to fix?

### How to answer them — and how not to

**Do:** answer these inside the relevant service page, in the page's own prose, under a real `<h2>`/`<h3>`
that states the question. Add `FAQPage` JSON-LD **only where a visible FAQ exists on that page** — start
with `/contact/`, whose seven answers already qualify and are the best on the site. Note that Google
restricts FAQ rich results to authoritative government and health sites, so treat this markup as
machine-readability, not as a rich-result play, and do not let anyone justify it on rich-snippet grounds.

**Do not:** create one page per question. That is precisely the mass-produced query-variation pattern
Google's guidance warns against, and it would take a site that currently avoids that mistake and push it
into the failure mode. Ten well-answered questions inside `/services/lab-solutions/regulatory-compliance/`
beat ten thin pages every time.

---

## 8. Semantic HTML, crawlability and structured data (content-side view)

The performance work is scoped elsewhere, but three items are content/readability problems and belong in
this audit:

1. **18 of 21 pages have no `<main>` element.** Only `/`, `/our-team/` and `/sitemap/` have one. Combined
   with the brief's finding that there is no `<header>` and no `<nav>` in *any* page's HTML (the entire
   navigation is injected at runtime by `/assets/mega-menu.min.js`), the served document has almost no
   document structure for a parser to use. Google's guidance calls out semantic HTML for readability;
   this is the largest single gap. It also explains why only 3 pages contain a "Skip to main content"
   link — there is no `main` to skip to.
2. **Heading order breaks on every service page.** All three audited service pages emit `h1 → h3 → h2`:
   the decorative stat panel ("GPO Savings Dashboard", "Staffing Overview", "Marketing Performance",
   "Compliance Scorecard", "Practice Growth", "Lab Performance Dashboard") is marked as `<h3>` and sits
   between the `<h1>` and the first `<h2>`. Demote those panel labels to a non-heading element, or
   promote them into the real outline. This fixes the Lighthouse `heading-order` failure, the
   `llms-full.txt` heading skew (§3e), and the document outline, in one change.
3. **26 "Learn More" links carry mismatched accessible names.** On `/`, five service cards use visible
   text `Learn More` with `aria-label="Marketing"`, `aria-label="Call Center"`, etc. That is
   simultaneously the SEO `link-text` failure and the a11y `label-content-name-mismatch` failure recorded
   in the brief. **Fix it in the content, not with ARIA:** make the visible text the descriptive text
   ("Explore fertility marketing services") and delete the `aria-label`. One content change, two audit
   failures cleared. (Sitewide anchor text is otherwise good — "Explore Compliance", "Explore GPO",
   "Request Staffing" — this is a contained problem.)

**Structured data — optional but useful, and currently under-built.** Present: `Organization` +
`ProfessionalService` (home), `WebPage`, `BreadcrumbList` on every page, `Service` + `Offer` +
`OfferCatalog` on service pages, `AboutPage`, one `FAQPage`. That is a reasonable base. Missing:

- **`sameAs` — zero occurrences sitewide.** This is the most important entity-reconciliation property
  and it is absent from the Organization node. It needs the company LinkedIn page, Google Business
  Profile, and any trade/association listings. Note that the **only** external social link anywhere on
  the site is `https://www.linkedin.com/in/kevinryanofficial/` — the web designer's personal profile —
  repeated in all 21 footers. There is no link to MedTech's own company profile.
- **`Person` — zero occurrences.** Ryan and Miller both warrant full nodes with `jobTitle`,
  `worksFor`, `alumniOf`/`memberOf` (RESOLVE board), and `sameAs`.
- **`logo` / `image` / `founder` / `numberOfEmployees`** on the Organization node.
- **`SoftwareApplication`** for OvaTools, once it has a real page.
- **`FAQPage` on `/contact/`.**

**Do not add** `Review` or `AggregateRating` markup to the on-site testimonials. Google does not permit
self-serving review markup for the entity that hosts it, and it would be ineligible for rich results.
Keep the testimonials as well-attributed HTML `<blockquote>` + `<cite>`; that is what makes them useful
to both readers and models.

**No video or embedded media exists anywhere on the site** (the only `<iframe>` elements are the 21 GTM
`noscript` tags). Google's guidance explicitly values high-quality video. A single walkthrough of a
completed OVA Design lab, or a two-minute OvaTools alert demo, would be the highest-yield media addition.

---

## 9. Priority order for the rebuild

**Blocking — resolve before content ships:**
1. Verify or remove the six unbioed named "specialists" on `/our-team/` (§5).
2. Remove or substantiate the two "exceed national benchmarks" clinical-outcome claims, the "100%
   accuracy" claim, and the two market-leadership superlatives (§5).
3. Pick one founding year and propagate it everywhere including JSON-LD (§5, row 1).
4. Fix `TS (AABB)` → `TS (ABB)` on `/about/`, and fix "Certifications: AABB, CLIA, ASRM" (§4c).

**High — do in the first content pass:**
5. Regenerate `llms-full.txt` from a pass that preserves stat tiles, timeline dates, testimonial
   attributions and internal links — or drop the file (§3).
6. Name Provista, explain the GPO relationship, retire or date-stamp the "Broadlane" reference (§4c.3).
7. Add `<main>` to all 21 pages and SSR the header/nav (§8).
8. Fix the `h1 → h3 → h2` order on all six service pages with stat panels (§8).
9. Replace the 26 "Learn More" anchors with descriptive text and delete the `aria-label`s (§8).
10. Add definitions for FDA / CLIA / CAP / AABB / HCLD / TS(ABB) / GPO / OvaTools / OVA Design (§4d).
11. Reconcile the numeric contradictions: 10 vs 12 services, 50+ vs 50 states, 30 vs 125 years, suite
    number in the address, the three vendor lists (§5).

**Medium — the content programme:**
12. Publish Tier 1 items 1–5 from §6.
13. Add `sameAs`, `Person`, `logo`, and `FAQPage` on `/contact/` (§8).
14. Add per-link summaries to `llms.txt` from the `summary` field in `site.config.mjs` (§3g).
15. Clean the Next.js cruft out of `robots.txt` (§3h).

---

## 10. Explicitly do not do

- Do not claim `llms.txt` or `llms-full.txt` improves Google rankings, indexing, or AI Overview
  inclusion. They do not. Google Search ignores them.
- Do not add "AEO", "GEO", or "AI-optimisation" markup, meta tags, or chunk delimiters. No such thing
  exists for Google.
- Do not chunk, split, or duplicate content for machine consumption.
- Do not create one page per question, per keyword variant, per city, or per "IVF lab management in
  {state}". The site currently avoids this; keep it that way.
- Do not add `Review`/`AggregateRating` markup to your own testimonials.
- Do not manufacture mentions, citations, or third-party references.
- Do not let a named individual with a claimed clinical credential appear on the site unverified.
- Do not publish a statistic without its source, period, and basis — the site already has six such
  numbers on one page and they cost more trust than they buy.
