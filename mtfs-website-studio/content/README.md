# `content/` — the Markdown mirror of medtech4solutions.com

This directory holds a plain-text, agent-readable copy of every page on the site, plus the two
authoring aids the content audit asked for.

```
content/
  README.md                     this file
  regenerate.mjs                regenerates / verifies the mirror (zero deps, ESM, Node >= 18)
  entities.md                   definitions for the ART/IVF entities the site names but never explains
  templates/
    service-page.md             reusable structure for a service page, annotated with why
  pages/                        one .md per route, mirroring the route path
    index.md                            -> /
    about.md                            -> /about/
    our-team.md                         -> /our-team/
    contact.md                          -> /contact/
    services.md                         -> /services/
    services/lab-solutions.md           -> /services/lab-solutions/
    services/lab-solutions/gpo-purchasing.md
    services/lab-solutions/practice-development.md
    services/lab-solutions/real-time-monitoring.md
    services/lab-solutions/regulatory-compliance.md
    services/lab-solutions/staffing-solutions.md
    services/management-services.md     -> /services/management-services/
    services/management-services/accounting-finance.md
    services/management-services/call-center.md
    services/management-services/human-resources.md
    services/management-services/insurance-risk-management.md
    services/management-services/marketing.md
    privacy-policy.md                   -> /privacy-policy/
    terms-of-service.md                 -> /terms-of-service/
    sitemap.md                          -> /sitemap/
    404.md                              -> /404/
```

All 21 routes are present. The route inventory is fixed: no page here creates, renames or
removes a route, and none may be added without a route in `site.config.mjs`.

---

## Google Search does not read these files

Stated plainly, because it is the single most common misconception about this kind of
directory:

- **Google Search ignores `llms.txt`, `llms-full.txt` and these Markdown mirrors.** They have
  no effect on ranking, on indexing, or on inclusion in AI Overviews. There is no AEO/GEO
  markup, chunking convention, meta tag or machine-only content variant that changes that —
  no such mechanism exists.
- What does move a page in Google is what always has: original, useful, people-first content;
  semantic HTML; a crawlable link graph; correct structured data; and page experience. That is
  what `templates/service-page.md` is built around.

So these files exist for three concrete reasons:

1. **Third-party AI crawlers** — ClaudeBot, GPTBot, ChatGPT-User, PerplexityBot — which `robots.txt`
   allows and which can use `llms.txt` / `llms-full.txt`. Allowing them is a business decision
   about content licensing, not an SEO tactic.
2. **Content review.** A 3 KB Markdown file is reviewable by a subject-matter expert; an 88 KB
   HTML document is not. Every blocked claim in `docs/audit/content-aiseo.md` is recorded here
   against the page and the sentence it applies to.
3. **A readable form of exactly what `llms-full.txt` contains**, produced by the same function
   over the same HTML — so a drift between the corpus and the site is visible in a diff.

---

## These files are generated, not written

The body of every file in `pages/` — everything between the `BEGIN MIRROR` and `END MIRROR`
comments — is produced by **`htmlToMarkdown()` from `build/lib/artifacts.mjs`**, run over the
built page in `dist/`. That is the same function `build/sync.mjs` uses to build
`llms-full.txt`. Nothing in the mirror is typed by hand, so the mirror cannot drift from the
site: `regenerate.mjs` re-derives it and compares.

```bash
node content/regenerate.mjs                 # verify; prints ok / DRIFT per route
node content/regenerate.mjs --strict        # same, exit 1 on any drift  (CI gate)
node content/regenerate.mjs --write         # rewrite the mirror blocks in place
node content/regenerate.mjs --write --only gpo-purchasing
node content/regenerate.mjs --src DIR       # read pages from DIR instead of dist/
```

`--write` refuses to run when the Website Studio export is not on disk (checked at
`src/source-export/`, then at the scratchpad path `build/sync.mjs` uses), because the backfill
described below needs it and writing without it would silently delete five FAQ answers from
`pages/index.md`. Pass `--allow-missing-export` only if that loss is intended.

`--write` replaces **only** the block between the markers. The YAML front-matter and the
`## Content review` section at the foot of each file are editorial and are preserved verbatim.

Run `node build/sync.mjs` first: the mirror reflects the *built* pages, so it carries the
heading-order, link-text and landmark fixes, not the export's defects.

### The four normalisations, and why each is safe

`htmlToMarkdown()` output is passed through four deterministic steps, all implemented and
commented in `regenerate.mjs`:

1. **Drop the leading breadcrumb line** (`[Home](/) › Laboratory Solutions`). It is site
   navigation rendered by the SSR chrome, and the same trail is already in the front-matter as
   `parent`. Affects `/about/` and `/services/lab-solutions/`.
2. **Collapse an immediately repeated line.** Several stat rows and the `/about/` timeline
   print one label twice, one copy per breakpoint; both copies are the same DOM text.
3. **Backfill sections the built page hides behind `hidden`.** See below.
4. **Drop a short label line that echoes one within the previous six meaningful lines.** The
   `/about/` timeline prints each milestone's year before its heading and again after its body.
   Scoped tightly — at most 16 characters, no Markdown syntax — and measured across all 21
   pages it removes exactly three lines (`2005`, `2012`, `2020` on `/about/`) and nothing else.

### The one real divergence: collapsed FAQ answers

The `fix-a11y` pass collapses FAQ answers with the `hidden` attribute — correct, because
`max-height: 0` left six answers in the accessibility tree and their links in the tab order.
`htmlToMarkdown()` drops `hidden` subtrees — also correct, because it must not emit invisible
text. Together they delete **five of the six answers on `/` from anything derived from the
built page, `llms-full.txt` included**, while the page's `FAQPage` JSON-LD still asserts them.

`regenerate.mjs` restores them here from the pre-collapse export, matched on the exact question
text, so the mirror is complete. **`llms-full.txt` has no such backfill and is currently short
those five answers.** Fix it at the source — render the answer panels un-hidden and collapse
them with CSS that still removes them from the accessibility tree, or give `llmsFullTxt()` the
same backfill. Tracked in `pages/index.md`, under Content review.

---

## Anatomy of a page file

```markdown
---
title: "…"                  # routes[].title            — the <title> element
path: /services/…/          # routes[].path             — root-relative, trailing slash
canonical: https://…/       # site.origin + path        — self-referencing, absolute
description: "…"            # routes[].description      — the meta description, 70–160 chars
group: lab-solutions        # routes[].group
parent: /services/…/        # routes[].parent, resolved from id to path (null on /)
keywords: [ … ]             # routes[].keywords
summary: "…"                # routes[].summary          — feeds llms.txt, nav panel, related links
lastReviewed: 2026-08-29    # editorial; bump when a human reviews the copy
---

<!-- BEGIN MIRROR … -->
…the page's main content as Markdown…
<!-- END MIRROR -->

---

## Content review
…editorial notes: what the build already fixed, what is still pending, what is blocked…
```

Every front-matter value except `lastReviewed` comes from `routes[]` in `site.config.mjs`, the
build's single source of truth. Change it there, then run `--write`; never edit it here.

### The `## Content review` section

Not page content, and deliberately outside the mirror so it can never leak into
`llms-full.txt` or be mistaken for copy. Each note carries the audit ID it comes from
(`AISEO-*`, `SEO-*`, `SA-*` → `docs/audit/`) and is filed under one of:

- **Applied in this build** — already true of the mirror above.
- **Pending — copy change, no new facts needed** — a rewrite anyone with the audit can make.
- **Pending / BLOCKING — needs client input** — do not guess, do not draft around it.

Nothing was invented to fill these files. Where the audit says a claim must go, the mirror
still shows the claim exactly as the page publishes it and the review note records the
correction — because a mirror that silently disagreed with the live page would be worse than
no mirror at all.

---

## The blocked and pending items, in one list

Full detail sits in each page's Content review block; this is the index.

| Page | ID | Item | State |
| --- | --- | --- | --- |
| `/our-team/` | AISEO-01 | Eight named "specialists" with no bio, headshot, credential check or `Person` schema — two carrying clinical directorship credentials, one with two conflicting titles | **BLOCKING** |
| `/services/management-services/marketing/` | AISEO-08 | Six unsourced figures in two mutually contradictory panels (+185%, 3.2x, 42%, $12, 3x, 40%) | **BLOCKING** |
| `/about/`, `/services/`, `/services/lab-solutions/practice-development/` | AISEO-02 | "outcomes that consistently exceed national benchmarks" — no benchmark, cohort, period or metric | **BLOCKING** |
| `/services/lab-solutions/regulatory-compliance/` | AISEO-02 | "with 100% accuracy", "Reporting Accuracy: 100%", "Compliance Gaps: 0" | **BLOCKING** |
| `/about/`, `/our-team/` | AISEO-02 | Two market-leadership superlatives ("the only consulting firm…", "more … than any company in the industry") | **BLOCKING** |
| `/about/` | AISEO-06 | "TS (AABB)" ×2 must read "TS (ABB)" — different organisations | pending copy |
| `/our-team/` | AISEO-06 | "Certifications: AABB, CLIA, ASRM" — none is a personal credential | pending copy |
| `/services/lab-solutions/staffing-solutions/` | AISEO-10 | "50+ States Covered" → "All 50 States" | pending copy |
| `/contact/` | AISEO-10 | "Our 12 service areas" → 10 leaf services | pending copy |
| `/our-team/` | AISEO-10 | Founding year 2006 in Dwight Ryan's bio vs 2005 everywhere else | client |
| `/contact/` | AISEO-10 | "Suite 303" here vs no suite in the footer and every `PostalAddress` | client |
| `/`, `/services/`, `/our-team/`, `/about/` | AISEO-10 | "two decades" / "30+ years" / "125 years" — label company years vs collective staff-years | pending copy |
| `/services/lab-solutions/gpo-purchasing/` | AISEO-07 | Provista undeclared; three CTAs point off-site with no explanation and no `rel="noopener"` | client |
| `/`, `/our-team/` | AISEO-07 | "affiliated with Broadlane" in a real client quote — retire or date-stamp | client |
| `/services/`, `/services/lab-solutions/`, `/services/lab-solutions/gpo-purchasing/` | AISEO-07 | Three disagreeing vendor rosters; "NexGen" vs "NextGen" | client |
| `/services/lab-solutions/real-time-monitoring/` | AISEO-11 | OvaTools asserted on 8 pages, specified nowhere | client |
| `/services/lab-solutions/practice-development/` | AISEO-11 | OVA Design named on 5 pages, defined in one clause | client |
| `/terms-of-service/` | AISEO-11 | "OvaTools Training Institute" claimed as a mark; appears nowhere else on the site | client |
| all service pages | AISEO-05 | FDA / CLIA / CAP / AABB / HCLD / TS(ABB) named 5–9 pages each, defined zero times — drafts in `entities.md` | pending copy |
| `/contact/` | AISEO-09 | Seven visible, high-quality answers with no `FAQPage` markup | pending build |
| `/sitemap/` | SEO-09 | Still links `/404/`, the error page's only inbound link | pending copy |
| `/` | — | Five FAQ answers dropped from `llms-full.txt` by the `hidden` collapse | pending build |
| several | AISEO-02 | Unsourced dashboard figures on call-center, HR, accounting, monitoring, lab-solutions | pending copy |
| `/about/`, `/our-team/` | AISEO-16 | Emoji standing in for iconography on a YMYL-adjacent site | pending copy |

---

## What this directory must never become

- **A page farm.** No file per question, per keyword variant, per city or per state. The site
  has 21 justified pages with unique titles and no doorway pages; that is a strength to
  protect.
- **A place claims get invented.** Every sentence in every mirror is traceable to the built
  page. Definitions in `entities.md` describe public regulatory frameworks and are marked
  DRAFT or BLOCKED; none of them is a claim about MedTech until MedTech confirms it.
- **A second source of truth.** Titles, descriptions, summaries, keywords and link labels live
  in `site.config.mjs`. This directory renders them; it does not define them.
- **An SEO channel.** See the first section. If someone proposes "optimising" these files for
  Google, the answer is that Google does not read them.

## Related

- `docs/audit/content-aiseo.md` — the content and AI-search audit these notes come from
- `docs/audit/seo-structured-data.md` — canonicals, breadcrumbs, schema graph, artefacts
- `docs/audit/semantics-accessibility.md` — landmarks, headings, ARIA, inline handlers
- `site.config.mjs` — `routes[]`, the source of every front-matter value here
- `build/lib/artifacts.mjs` — `htmlToMarkdown()`, `llmsTxt()`, `llmsFullTxt()`
