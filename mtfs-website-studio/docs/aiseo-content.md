# Content for AI search — what actually helps

A working guide for medtech4solutions.com, following Google's published guidance on optimizing
websites for generative AI features in Search. Every recommendation is grounded in a specific
finding from `docs/audit/content-aiseo.md`, which audited `llms.txt`, `llms-full.txt` and the main
content of `/`, `/about/`, `/our-team/`, `/services/lab-solutions/gpo-purchasing/`,
`/services/lab-solutions/staffing-solutions/` and `/services/management-services/marketing/`,
corroborated by greps across all 21 pages.

**The one-sentence version:** there is no AI-specific optimisation lever. The levers are ordinary
SEO, semantic HTML, crawlability, page experience, and content that is genuinely worth citing.
Start with the mythbusting in §6 if you are here because someone sent you an "AEO" pitch.

---

## 1. Start here: what this site already gets right

Naming this first matters, because the temptation with a list of 16 findings is to conclude the
site is broken. It is not.

- **21 pages, 21 unique titles, zero doorway pages.** No city pages, no state pages, no
  per-question pages, no keyword-variant farm. The single biggest structural mistake in this
  category has been avoided, and it must stay avoided.
- **All 50 `<img>` elements have descriptive, domain-literate alt text. Zero are missing alt.**
  That already meets what Google's high-quality-images guidance asks for. **Preserve it verbatim.**
- **Genuine, uncopyable first-hand expertise exists** — in about four places, listed in §2.
- **`llms.txt` is a clean, correct 20-link index** with `/404/` correctly excluded, and the prose
  statistics have not drifted: "300+" appears on 5 HTML pages and 5× in `llms-full.txt`; "1,800+"
  on 6 pages and 7×; "30+" on 4 pages and 5×; "125 years" on `/about/` only and 1×.

The problem is not that the site is full of errors. It is that roughly **90 % of the copy is
interchangeable B2B consulting filler** wrapped around a small amount of real expertise, and the
machine-readable mirror deletes exactly the parts that are specific.

---

## 2. What actually helps, in priority order

### 2.1 People-first, non-commodity content

Google's guidance is unchanged in substance from its long-standing helpful-content advice: create
content for people, demonstrate first-hand experience and expertise, be the source rather than the
summary. For a specialist ART consultancy that means publishing what only this company can write.

**Where the real expertise already is:**
- Dwight Ryan's and Kathleen Miller's bios on `/our-team/` — RMA-NJ, RMA-NY, a 1991 NASDAQ IPO, the
  RESOLVE national board; IFFS Surveillance managing editor since 2014, 100+ abstracts and papers.
  These are externally checkable and they are the strongest E-E-A-T signals on the site.
- The named-client testimonials: the Montville / Shomento Montana lab build, Wes Edmonds at UAB,
  Goldstein, Sharara, Gerson.
- The `/contact/` "Before You Reach Out" FAQ — seven operational answers that are the most credible
  prose on the whole site (see §2.5).
- The GPO vendor roster and the 1,800-contract dataset behind it.

**Thirteen non-commodity publishing items**, all grounded in work the site already claims:

1. The Montana lab build, as a real project story with constraints, decisions and outcomes.
2. The OVA Design air-quality standard, published: target VOC and particulate thresholds, the
   filtration stack, pressure cascade, materials and off-gassing policy, commissioning and
   validation protocol — with photographs of completed labs.
3. A real FDA / CLIA / CAP / AABB regulatory map, including the high-value distinction that **CLIA
   covers andrology and semen analysis but largely not embryology culture**, and New York State
   tissue-bank licensure — MedTech's own jurisdiction and currently unclaimed home-field expertise.
4. Honest GPO economics, naming Provista (§4.2), explaining what MedTech does versus what Provista
   does and what the member's relationship is with each.
5. An annual supply-market report built from the 1,800-contract dataset.
6. A real OvaTools product page (§5.3).
7–13. The remaining items are enumerated in `docs/audit/content-aiseo.md`.

The common shape: each is something a competitor cannot write by paraphrasing this site.

### 2.2 Clear structure and semantic HTML

Google's guidance calls out semantic HTML for machine readability. The export was, measurably,
almost structureless in its served markup:

- **18 of 21 pages had no `<main>`.** Only `/`, `/our-team/` and `/sitemap/` had one.
- **0 `<header>` and 0 `<nav>` in 20 of 21 pages** — the entire header was injected at runtime by
  `/assets/mega-menu.min.js`. With JS off there was no navigational path to either service hub.
- **Every service page emitted h1 → h3 → h2**, because a decorative stat-panel label ("GPO Savings
  Dashboard", "Staffing Overview", "Marketing Performance", "Compliance Scorecard", "Practice
  Growth", "Lab Performance Dashboard") was marked `<h3>` and sat between the `<h1>` and the first
  `<h2>`. That single defect produced the broken document outline, the Lighthouse `heading-order`
  failure, **and** the `### → ##### → ####` heading skew in `llms-full.txt`.
- **111 of 146 `<section>` elements were unnamed.** `/terms-of-service/` had 22 of 23 unnamed.

All of this is fixed structurally by the build (`ssr-chrome` and `fix-a11y` passes), not page by
page. Verified in the output: `<header>`, `<nav>` and `<main id="main">` on all 21 pages. Keep it
that way — the rule is that **every page's primary content is inside `<main id="main">`, every
section is named by `aria-labelledby` pointing at its own heading, and no decorative label is a
heading.**

### 2.3 Crawlability

If a crawler cannot fetch and parse it, nothing else in this document matters.

- The nav is now server-rendered, so the static link graph **is** the crawlable graph.
- `/services/lab-solutions/` and `/services/management-services/` were the only two routes missing
  from the site-wide footer while all ten of their children were in it — so every child outranked
  its own parent (`/services/lab-solutions/staffing-solutions/` had 33 page-sources against its
  parent's 10). Both hubs are now `inFooter: true`, and `validateLinks` fails the build if footer
  coverage regresses.
- Visible breadcrumbs on all 19 non-home indexable pages, generated from the same
  `breadcrumbTrail()` call that feeds the `BreadcrumbList` JSON-LD.
- `robots.txt` no longer carries Next.js `/_next/` boilerplate for a site that is not Next.js.

### 2.4 Page experience

Ordinary Core Web Vitals work. `docs/performance-refactor.md` covers it: 3 render-blocking
stylesheets → 0, 87,803 B of pre-interaction JS → 37,058 B, 4 × 404 per page → 0, and everything
pre-compressed. There is no AI-specific page-experience metric; this is the same work that helps
ordinary Search.

### 2.5 Q&A that answers real buyer questions

**Measured:** 13 Q&A items exist on 2 pages. The six carrying FAQPage markup (on `/`) are company
orientation — *"What is MedTech For Solutions?"*, *"Where is MedTech For Solutions located?"* The
seven genuinely excellent answers on `/contact/` have **no markup at all**:

> "Please do not include protected health information (PHI)… we will set up secure, HIPAA-aligned
> communication channels and, where applicable, execute a Business Associate Agreement (BAA) before
> any PHI is exchanged."

> "Initial discovery calls are complimentary — typically 30 to 60 minutes… There is no obligation,
> no sales pressure, and no fee."

**All ten service pages answer nothing.** Questions a lab director, CFO or physician-owner would
actually ask, and which the site is uniquely placed to answer:

- Is my embryology lab subject to CLIA, or only my andrology lab?
- Do I need FDA HCT/P registration? Do I need CAP *and* AABB, or one of them?
- What does an off-site HCLD director actually sign, and will an inspector accept remote oversight?
- What is your realistic time-to-fill for an embryologist?
- Is OvaTools a validated system, and will you sign a BAA?
- Who is Provista? Does joining the GPO bind me to minimums?
- How is MedTech paid, and is there a conflict when you recommend a vendor you hold a contract with?

**How to do it:** answer them **inside the relevant service page**, in that page's own prose, under
real `<h2>`/`<h3>` headings that state the question. Add `FAQPage` JSON-LD only where a visible FAQ
exists — today that means `/` (already present) and `/contact/` (seven answers present, markup
missing). Treat FAQ markup as machine-readability, not a rich-result play: Google restricts FAQ rich
results to authoritative government and health sites.

**Do not create one page per question.** That is the mass-produced query-variation pattern Google's
guidance warns against, and this site currently avoids it.

### 2.6 Define your entities

**Measured across all 21 pages:** FDA appears in 9 files, CLIA 9, CAP 9, AABB 9, HCLD 7,
"TS (ABB)" 5, ELD(ABB) 1, ASRM 1. Full expansions have **zero** occurrences sitewide —
"Food and Drug Administration" 0, "Clinical Laboratory Improvement" 0, "College of American
Pathologists" 0, "High Complexity Laboratory Director" 0, "Technical Supervisor" 0, "Embryology
Laboratory Director" 0. The only expansion of ABB anywhere is buried in `/privacy-policy/`.
`/services/lab-solutions/regulatory-compliance/` repeats the undifferentiated string
"FDA, CLIA, CAP, AABB" **five times** without explaining what any of them regulates.

Absent entirely (0 occurrences): vitrification, witnessing, andrology, PGT/preimplantation, SART,
21 CFR, HCT/P, tissue bank, New York State, ISO, USP 797, Joint Commission. "cryopreservation"
appears once — on an *insurance* page, never on a laboratory page. "ICSI" appears once, inside an
image alt. "blastocyst" appears once, inside a client testimonial.

**Fix:** write real 60–150 word definitions, linked to the issuing authority, for FDA HCT/P
registration and 21 CFR Part 1271; CLIA (with the andrology/embryology distinction); CAP's
Reproductive Laboratory Accreditation Program; AABB reproductive tissue standards; New York State
tissue-bank licensure; and HCLD / ELD / TS as "(ABB)" credentials, with what each permits the holder
to do. Put them in page prose under real headings — **not** a keyword glossary page — and cross-link
from the service pages that currently only assert the acronyms.

### 2.7 Images and video

Images are already a strength: 50 `<img>`, all with descriptive alt, none missing. **Preserve the
alt text verbatim** — it is domain-literate in a way generic alt text is not.

**There is no video anywhere on the site.** All 21 `<iframe>` elements are GTM noscript tags.
Google's guidance explicitly values high-quality video. A completed-lab walkthrough or a two-minute
OvaTools alert demo would be the cheapest new-format win available.

Replace the emoji used as section iconography on `/about/` (🔬 🤝 📊 🛡️) and `/our-team/`
(🧬 ✓ 🏗 👥 💡 🤝) with real inline SVG. In a YMYL-adjacent medical-services context emoji read as
template output; this is one of the cheapest credibility upgrades available.

### 2.8 Business profile and entity reconciliation

`sameAs` is absent from all 21 pages, and `"@type":"Person"` has **zero** occurrences. The only
non-MedTech external link on the entire site — apart from the Provista registration link and two
`maps.google.com` links — is `https://www.linkedin.com/in/kevinryanofficial/`, the **web
designer's personal profile**, repeated in 21 footers. There is no link to MedTech's own company
LinkedIn, nor to Dwight Ryan's or Kathleen Miller's profiles.

**Do:** add `sameAs` to the Organization node pointing at the company LinkedIn, the Google Business
Profile and any trade or association listings. Add `logo`, `image` and `founder`. Add `Person` nodes
for Dwight Ryan and Kathleen Miller with `jobTitle`, `worksFor`, `memberOf` (RESOLVE national board)
and `sameAs` (LinkedIn; ORCID/PubMed for Miller). Claim and complete the Google Business Profile —
NAP consistency is ordinary local SEO and is currently broken against the site's own schema
(`/contact/` says "Suite 303"; the footer and the JSON-LD `streetAddress` do not).

**Do not** add `Review` or `AggregateRating` markup to MedTech's own testimonials. Self-serving
review markup for the hosting entity is disallowed by Google and ineligible for rich results. Keep
them as attributed `<blockquote>` + `<cite>`.

### 2.9 Measure it in Search Console

Search Console's Performance report includes AI-surface traffic, and the **Generative AI**
performance report is where to look for it. That is the measurement surface. There is no separate
"AI ranking" dashboard, no AI-specific submission, and no way to opt a page into AI Overviews
beyond ordinary indexing.

---

## 3. Blocking issues — fix before publishing anything new

These are trust and legal risks, not optimisation opportunities.

### 3.1 Six named "specialists" with no bio, headshot, credential link or Person schema

`/our-team/` names Dr. Sarah Chen HCLD(ABB), Michael Rodriguez ELD(ABB), Jennifer Walsh, David Park,
Robert Martinez, Lisa Thompson, Dr. Kevin O'Brien and Margaret Evans. The page has only **four**
`<img>` elements — a hero, headshots of Ryan and Miller, and the logo — so none of them has a
photograph. Zero Person JSON-LD exists on any page. Eight paragraphs after being listed as
"Dr. Sarah Chen, HCLD(ABB)" — an embryology directorship credential — the culture quote is signed
"— Sarah Chen, Director of Laboratory Solutions". **Two conflicting titles on one page.**

**Verify each name against payroll/contractor records before any content ships.** If real: add a
bio, headshot, credential verification and a Person node each, and reconcile Chen's title. If
illustrative: **remove the names entirely** and describe the capability without personnel
attribution. Do not ship an unverified named individual carrying a claimed clinical certification on
a healthcare-services site — it destroys exactly the E-E-A-T that the Ryan and Miller bios earn.

### 3.2 Unsourced clinical-outcome and absolute claims

- *"Our laboratories consistently achieve outcome results that exceed national benchmarks."*
  (`/services/lab-solutions/practice-development/`, and again on `/about/`.) No benchmark named
  (CDC ART Success Rates? SART?), no cohort, no period, no definition of "outcome".
- *"…with 100% accuracy"* (`/services/lab-solutions/regulatory-compliance/`).
- *"MedTech has built or retrofitted more IVF practices and laboratories than any company in the
  industry."* (`/our-team/`)
- *"…the only consulting firm built exclusively for the ART industry."* (`/about/`)
- *"reduces preparation time by up to 60%"*, restated as flat fact elsewhere as *"Reduces audit prep
  time by 60%"*.

**Remove both benchmark sentences** unless MedTech can publish cohort, source, period and metric.
**Delete "with 100% accuracy" outright.** Replace the two superlatives with a countable, checkable
fact — e.g. a stated number of labs designed over a stated date range. State the 60 % claim once
with its basis, or drop it. These are YMYL-adjacent assertions and the highest legal and trust risk
on the site.

### 3.3 The marketing page's two contradictory stat panels

`/services/management-services/marketing/` carries, one above the other:

> Panel 1: 3x Patient Leads · 40% Higher Conversions · SEO Optimized · ROI Tracked
> Panel 2: +185% Organic Traffic · 3.2x Lead Volume · 42% Conv. Rate · $12 Cost/Lead

"40% Higher Conversions" and "42% Conv. Rate" are different metrics one line apart with near-identical
labels; so are "3x Patient Leads" and "3.2x Lead Volume". No client, timeframe, denominator, cohort
or methodology for any of the six figures. The page's own differentiation sentence — *"We don't do
generic healthcare marketing"* — is immediately followed by six generic agency headings.

**Delete both panels** until real, client-attributed, dated numbers with a stated basis exist.
Rewrite around fertility-specific practice: patient-journey sensitivities, what fertility PPC and
ad-platform compliance actually requires, referral-network mechanics with named referral source
types. This page is the clearest example on the site of assertion substituting for experience.

### 3.4 Entity errors

- `/about/` says **"TS (AABB)"** twice; five other pages say **"TS (ABB)"**. These are different
  organisations: **ABB** (American Board of Bioanalysis) issues the TS, ELD and HCLD *personnel*
  certifications; **AABB** is a *facility* accreditation body. Fix both instances on `/about/`.
- `/our-team/` lists *"Certifications: AABB, CLIA, ASRM"* — none of the three is a personal
  credential. AABB is facility accreditation, CLIA is a federal laboratory certification programme,
  ASRM is a professional society that issues no personnel certification. Replace with the actual
  credentials the named staff hold and move facility accreditations to a separate, correctly
  labelled line.

### 3.5 Eight internal contradictions

| Fact | Conflicting values |
| --- | --- |
| Founding year | 2005 on `/`, `/about/`, `/contact/`, all 21 footers, `llms.txt` and the Organization JSON-LD; **2006** in Dwight Ryan's bio on `/our-team/` |
| Experience | "over 30 years of combined"; "30+ years serving the ART industry"; "over 125 years of collective multidisciplinary"; "two decades of hands-on ART expertise"; "30+ years of hands-on leadership" — a company founded in 2005 cannot have 30+ years of its own history |
| Service count | "10 Service Areas" and "one service or all ten" on `/`; **"Our 12 service areas"** on `/contact/`; the route inventory has **10** leaf services |
| State coverage | "50+ States Covered" on `/services/lab-solutions/staffing-solutions/` — there are 50, and every other page says "all 50 states" |
| Address | `/contact/` says "399 Knollwood Road, **Suite 303**"; all 21 footers and the JSON-LD `streetAddress` omit the suite |

Pick one founding year **with the client** and propagate it from `site.config.mjs`. Label the
experience figure precisely — company years and collective staff-years are different claims.
Standardise the service count against the route inventory. Change "50+ States Covered" to
"All 50 States". Decide whether Suite 303 is part of the address and make all three agree.

---

## 4. `llms.txt` and `llms-full.txt`

### 4.1 What they are and are not

**Google Search ignores both files.** They have no effect on Google ranking, indexing, or AI
Overview inclusion. Keep them, but label them accurately — in code comments, in the README and in
`robots.txt` — as serving **third-party AI crawlers only** (ClaudeBot, GPTBot, ChatGPT-User,
PerplexityBot). Note also that `Google-Extended` governs Gemini/Vertex grounding only, **not**
Google Search ranking or AI Overview sourcing, so allowing it is a separate decision from SEO.

### 4.2 `llms-full.txt` was not an accurate mirror

This was the most consequential content finding, because a partial mirror is worse than none — a
crawler reads its silence as absence.

**Measured deletions from the export's `llms-full.txt`:**

- **Every numeric stat tile.** All six marketing figures (+185%, 3.2x, 42%, $12, 3x, 40%) have
  **0 occurrences**. The GPO page's dashboard — "$0 Cost to Join / 300+ IVF Practices / 1800+ Active
  Contracts / 10%–50% Cost Savings" — collapses at lines 722–724 to `##### GPO Savings Dashboard`
  followed by `Member benefits`. The erroneous "50+ States Covered" tile is dropped too, hiding the
  error rather than fixing it.
- **All six `/about/` timeline years** (2005, 2008, 2012, 2016, 2020, Today), leaving undated
  headings — a model cannot tell when the GPO launched.
- **The homepage testimonial attributions.** The same quotes on `/our-team/` keep theirs.
- **Every internal link target.** `grep '](http'` returns **0**: every "Continue exploring" block
  degrades to ungrammatical plain bullets.

**Fix, implemented in the build:** `llms-full.txt` is generated by `htmlToMarkdown()` running over
the **rendered output**, not the source, and preserves stat-tile label+value pairs, timeline year
labels, testimonial attribution as `— Name, Title, Organisation`, and anchors as Markdown inline
links with absolute canonical URLs. The build asserts that every year label in `/about/` and every
`cite` in `/` round-trips — **or the file is not generated at all.**

**`llms.txt`** now emits each route's `summary` after its link, in the convention's supported form:
`- [Title](url): summary`.

### 4.3 The GPO's actual partner is undeclared

All three "Become a Member" CTAs on `/services/lab-solutions/gpo-purchasing/` point off-site to
`register.provista.com`. **"Provista" appears 0 times** in visible copy, 0 times in any JSON-LD,
0 times in `llms-full.txt`. Meanwhile the testimonial on `/` and `/our-team/` still reads
*"we are a MedTech GPO member affiliated with Broadlane"* — a GPO brand that has not traded under
that name for well over a decade. The links carry no `rel="noopener"` and no indication the user is
leaving the site.

Three vendor rosters also disagree: `/services/` says "Staples, McKesson, GE, Nikon, Olympus,
NextspringHealth"; `/services/lab-solutions/` says "Hamilton Thorne, Vitrolife, Cooper-Surgical,
Nikon, Olympus, and GE"; the GPO page says "Roche, NextspringHealth, NextGen, Fisher Scientific,
McKesson, and FedEx" while its own Featured Partners grid spells it **"NexGen"** and omits Roche.

**Fix:** name Provista in the copy and in the JSON-LD, explain the aggregation relationship, either
retire or date-stamp the Broadlane sentence, reconcile the three rosters to one canonical list with
consistent spelling, and add `rel="noopener"` plus an explicit off-site indication.

---

## 5. Structured data — optional, useful, and currently broken

Structured data is **not required** for AI features. It helps machines reconcile entities, and it is
worth doing correctly, but no amount of it substitutes for content.

What the SEO audit measured and what the build now enforces:

- **No `WebSite` node existed anywhere**, so `WebPage.isPartOf` on all 8 WebPage-bearing pages
  pointed at the **Organization** — a mistyped dangling edge. There is now a `WebSite` node at
  `{origin}/#website` with `publisher → #organization`, and every `WebPage.isPartOf` points at it.
- **13 pages had no `WebPage` node at all.** All 20 indexable routes now emit one at
  `{canonical}#webpage`, with `url`, `name`, `description`, `inLanguage`, `isPartOf → #website` and
  `breadcrumb →` the page's `BreadcrumbList`. The self-referential `mainEntityOfPage` is dropped.
- **One `@id` (`#organization`) carried four different `@type` shapes across 18 pages**, with no
  `logo`, `image` or `sameAs` anywhere. It is now built **once** in
  `artifacts.mjs::organizationJsonLd(cfg)` and the identical bytes are injected on every page.
- **All 13 Service pages re-inlined the provider** as a 3-property subset of a globally-identified
  node — which is what produced the type conflict. They now reference it purely:
  `"provider": {"@id": "{origin}/#organization"}`. Each Service gets its own `@id`
  (`{canonical}#service`) so hub `OfferCatalog` entries can point at child services.
- **12 of 21 `BreadcrumbList` trails omitted the `/services/` tier.** All trails are now generated
  from `breadcrumbTrail()` — the same call that renders the visible breadcrumb — so markup and
  structured data cannot diverge.
- **Stray `itemscope itemtype="https://schema.org/WebPage"` on `<html>`** on 4 pages, duplicating or
  contradicting the JSON-LD. Stripped: JSON-LD is the only vocabulary.

**`FAQPage`** only where a visible FAQ exists. **No `Review`/`AggregateRating`** on own testimonials.
`SoftwareApplication` becomes appropriate for OvaTools once it has a real product page (§5.3).

### 5.3 Products asserted but never defined

**OvaTools** is named across 8 files and trademarked in `/terms-of-service/`, but there is no
`/ovatools/` route, no screenshot, no specification, no validation statement, no hosting or security
detail and no schema. **OVA Design** is named on 5 pages and defined only as marketing prose.
**"OvaTools Training Institute"** appears exactly once sitewide — in the Terms of Service trademark
clause — and nowhere else.

Give OvaTools a real page: monitored parameters and equipment classes, alarm thresholds and
escalation paths, notification channels, audit-trail schema, validation status, hosting and security
posture, integration points, screenshots. Then add `SoftwareApplication` JSON-LD. Publish the OVA
Design standard (§2.1, item 2). Either build out the Training Institute or remove it from the Terms.

---

## 6. Mythbusting

Each of these is a thing people are actively told to do. None of them works.

| Claim | Reality |
| --- | --- |
| **"`llms.txt` helps you rank / get cited in AI Overviews."** | Google Search ignores `llms.txt` and `llms-full.txt` entirely. They affect Google ranking, indexing and AI Overview inclusion **not at all**. Keep them for third-party AI crawlers, and label them as such. Never state or imply otherwise anywhere in this repo. |
| **"Chunk your content with delimiters so models can parse it."** | No such mechanism exists. There are no chunk delimiters, no machine-only content variants, no AEO/GEO markup, no AI-specific meta tags. Do not add any. |
| **"Write a separate AI-optimised version of each page."** | Cloaking-adjacent and pointless. One page, written for people, is the whole strategy. |
| **"Make one page per question / keyword variant / city / state."** | This is the mass-produced query-variation pattern Google's guidance explicitly warns against. This site has 21 justified pages with unique titles and no doorway pages — **preserve that**. The route inventory is fixed. |
| **"Buy mentions on forums and listicles so AI sees you cited."** | Inauthentic mentions are link-scheme behaviour with a new label. Do not manufacture mentions, citations, third-party references or testimonial content. Every quote on this site must be a real, attributed quote that already exists. |
| **"Add Review markup to your testimonials for stars in AI answers."** | Self-serving review markup for the hosting entity is disallowed and ineligible for rich results. Use `<blockquote>` + `<cite>`. |
| **"Structured data is required for AI features."** | It is optional. It helps machines reconcile entities and it is worth doing correctly (§5), but it does not substitute for content and its absence does not exclude you. |
| **"FAQ schema gets you rich results."** | Google restricts FAQ rich results to authoritative government and health sites. Add `FAQPage` for machine-readability where a visible FAQ exists, and expect no rich result. |
| **"There's an AI-specific ranking factor to optimise."** | There is not. The levers are ordinary SEO, semantic HTML, crawlability, page experience and genuinely useful content — the same list as for ordinary Search. |

---

## 7. Checklist for anyone adding content here

- [ ] Would a competitor be able to write this by paraphrasing our site? If yes, do not publish it.
- [ ] Does every statistic carry a source, a period and a basis? If not, cut it.
- [ ] Is every named individual verified, with a bio, a headshot and a Person node?
- [ ] Are entities expanded on first use and linked to the issuing authority?
- [ ] Is the content inside `<main id="main">`, under a correct heading order, with exactly one `<h1>`?
- [ ] Is every section named by `aria-labelledby` pointing at its own heading?
- [ ] Is every link's visible text descriptive of its destination? (`learn more`, `get started`,
      `click here`, `read more` **fail the build**.)
- [ ] Does it contradict any other page on founding year, experience, service count, coverage or address?
- [ ] Does new imagery have descriptive, domain-literate alt text?
- [ ] Does `llms-full.txt` still round-trip every stat tile, year label, citation and link?
- [ ] Have you added a new route? If so, is it a genuine page's worth of distinct content — not a
      keyword variant? (See `docs/global-sync.md` §7.)
