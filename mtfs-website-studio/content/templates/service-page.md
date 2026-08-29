---
title: "TEMPLATE — service page"
description: "Reusable structure for a MedTech service page: heading outline, where entity definitions go, where genuine first-hand evidence goes, the FAQ block, internal-link slots, and the schema each section must produce."
status: template
lastReviewed: 2026-08-29
---

# Template — service page

Copy this file, fill it in, and delete every `> WHY:` line before the copy goes near HTML.

It exists because the ten existing leaf service pages share one shape and one weakness: they
assert capability ("Comprehensive FDA, CLIA, CAP, and AABB compliance solutions") without ever
defining what they are asserting or showing that MedTech has done it. Google's guidance on
generative-AI features in Search is ordinary quality guidance — original, useful,
people-first content; clear structure; semantic HTML; crawlable pages; strong page
experience. There is no AEO/GEO markup, no chunking scheme and no machine-only variant that
changes anything. Every section below earns its place under that guidance, and the `> WHY:`
lines say how.

**Hard rules for any page built from this template**

1. **The route inventory is fixed at 21.** This template is for restructuring an existing
   service page, not for adding routes. No page per question, per keyword variant, per city
   or per state.
2. **No statistic without its source, period and basis.** If you cannot name the cohort and
   the window, the number does not ship.
3. **No superlatives** ("the only", "more than any company in the industry") and no absolutes
   ("100% accuracy", "zero gaps").
4. **No invented quotes, clients, logos or third-party mentions.** Only material that already
   exists and is attributable.
5. **Exactly one `<h1>`**, never inside `<header>` or `<footer>`; heading levels never skip.
6. **Descriptive link text.** "Learn more", "get started", "click here" and "read more" fail
   the build — `validateLinks()` in `build/lib/validate.mjs` carries the blocklist.

---

## 0. Front-matter

```yaml
---
title: "<50–60 chars, names the vertical, ends with the brand suffix>"
path: /services/<group>/<slug>/
canonical: https://medtech4solutions.com/services/<group>/<slug>/
description: "<70–160 chars — validateManifest() asserts this range>"
group: lab-solutions | management-services
parent: /services/<group>/
keywords: [<terms a buyer would actually type>]
summary: "<1–2 plain sentences; feeds llms.txt, the nav panel and related links>"
lastReviewed: <YYYY-MM-DD>
---
```

> WHY: every one of these fields lives in `routes[]` in `site.config.mjs` and is rendered from
> there — `<title>`, the meta description, the canonical, the breadcrumb label, the nav panel
> blurb, the sitemap entry, the `llms.txt` line and the related-links block. Writing it here
> and copying it there is how the site's 21 pages previously drifted into four different
> `robots` states and 15 over-length descriptions. One definition, many renderings.

---

## 1. `<h1>` and the opening paragraph

```markdown
<eyebrow — a short non-heading label, e.g. "Audit Ready">

# <H1: what the service is, for whom, in the buyer's words>

<50–90 words: the problem the buyer has, what MedTech does about it, and who it is for.
Name the vertical (IVF / ART / fertility practice) in the first sentence.>

[<Descriptive primary CTA>](/contact/) [<Descriptive secondary CTA>](<a real page>)
```

> WHY: the `<h1>` is the page's one strongest on-page signal and, on the home page, the measured
> LCP element — a text node, not an image. Keep the eyebrow a `<p>`, never an `<h2>`; the export
> put a decorative stat-panel label at `<h3>` between the `<h1>` and the first `<h2>` on six
> pages, which is what produced the `heading-order` failure (Lighthouse score 0) and the broken
> outline in `llms-full.txt`.
> WHY: CTAs name their destination. Two of the audits' zero-score failures — SEO `link-text`
> and a11y `label-content-name-mismatch` — came from 26 "Learn More" anchors, five of which
> carried an `aria-label` that contradicted the visible text.

## 2. Stat row (optional — and the easiest section to get wrong)

```markdown
<Label>: <Value>
<Label>: <Value>
```

> WHY: keep it as label/value text, not as headings. `htmlToMarkdown()` preserves the pairs, so
> they survive into `llms-full.txt` and into `content/pages/` — in the export they were `<h3>`
> panels whose numbers were dropped entirely from the corpus.
> WHY: every value needs a basis. "Cost to Join: $0" and "Active Contracts: 1800+" are facts.
> "Reporting Accuracy: 100%", "Compliance Gaps: 0", "Conv. Rate: 42%" and "Missed Calls: 0%"
> are not — they are the exact figures the content audit blocked. If a number is illustrative
> (an example dashboard), say so in the visible label.

## 3. Capabilities — `<h2>` + three to six `<h3>` cards

```markdown
## <H2: what the service covers, phrased as an outcome>

<One or two sentences of orientation.>

### <Capability>
<40–70 words. One internal link, in the sentence, with descriptive anchor text.>
```

> WHY: this is the section every existing service page already has, and it is the section that
> reads as interchangeable B2B filler. It earns its place only if each card says what MedTech
> *does* rather than what the buyer *gets*.
> WHY: `<h3>` under `<h2>` with no skipped level; each `<section>` labelled with
> `aria-labelledby` pointing at its own heading id (111 of 146 sections in the export were
> unnamed).

## 4. First-hand evidence — the section the existing pages do not have

```markdown
## <H2: a specific thing MedTech has done>

<150–300 words describing real work: the situation, what MedTech did, what changed, over what
period. Name the constraints. Include a number only if you can name its basis.>

> "<A real, already-published client quote, if one exists for this work.>"
> — <Name>, <Title>, <Organisation>
```

> WHY: this is the whole point of the template. Roughly nine tenths of the site's copy is
> interchangeable consulting language; the genuinely uncopyable material sits in about four
> places — the two leadership bios, the named client testimonials (the Montana lab build, UAB,
> Goldstein, Sharara, Gerson), the `/contact/` operational answers and the GPO vendor roster.
> Google's guidance rewards demonstrated first-hand experience; nothing else on the page can
> substitute for it.
> WHY: quotes are `<blockquote>` + `<cite>` carrying name, title and organisation. Do **not**
> add `Review` or `AggregateRating` JSON-LD to MedTech's own testimonials — self-serving review
> markup for the hosting entity is disallowed by Google and ineligible for rich results.
> WHY: nothing in this section may be invented. If MedTech has not supplied the material, the
> section stays empty and the page ships without it, flagged in the page's Content review
> block.

## 5. Entity definitions — where the acronyms get explained

```markdown
## <H2: e.g. "What FDA, CLIA, CAP and AABB each actually require">

### <Entity>
<60–150 words in the page's voice, linking the issuing authority.>
```

> WHY: across the 21 exported pages, FDA is named on 9, CLIA on 9, CAP on 8, AABB on 9, HCLD
> on 7 — and expanded or defined **zero** times. `/services/lab-solutions/regulatory-compliance/`
> repeats the string "FDA, CLIA, CAP, AABB" five times without explaining any of them.
> Definitions are drafted in [`../entities.md`](../entities.md), each with the page that should
> own it. Take the definition from there, put it in the page's own prose under a real heading,
> and cross-link the other pages that name the term.
> WHY: definitions go in page prose, never on a `/glossary/` route. A term-per-page structure
> is the mass-produced query-variation pattern Google's guidance warns against, and this site
> currently avoids it — 21 pages, all titles unique, no doorway pages.

## 6. Process or approach — `<h2>` + ordered steps

```markdown
## <H2: how an engagement actually runs>

1. ### <Step>
   <What happens, who is involved, roughly how long.>
```

> WHY: a real sequence with real durations is checkable; "hands-on implementation" is not. Use
> `<ol>`, so the order is semantic rather than typographic.

## 7. FAQ — only if the answers are visible on the page

```markdown
## <H2: e.g. "Questions IVF laboratory directors ask us">

### <A question in the buyer's own words>
<A direct answer, 40–120 words. Answer first, qualify second.>
```

> WHY: the site has 13 Q&A items on 2 pages. The six with FAQPage markup are company
> orientation; the seven genuinely useful ones (`/contact/`) have no markup; all ten service
> pages answer nothing. Real buyer questions this template exists to capture: is my embryology
> lab subject to CLIA or only my andrology lab; do I need FDA HCT/P registration; do I need CAP
> and AABB or one of them; what does an off-site HCLD director sign and will an inspector
> accept remote oversight; what is your realistic time-to-fill for an embryologist; is
> OvaTools validated and will you sign a BAA; who is Provista; does joining the GPO bind me to
> minimums; how is MedTech paid.
> WHY: emit `FAQPage` JSON-LD **only** where the answers are visible on the page. Treat it as
> machine-readability, not a rich-result play — Google restricts FAQ rich results to
> authoritative government and health sites.
> WHY: the question is an `<h3>` wrapping the disclosure button; the answer panel gets an `id`,
> the button gets `aria-controls`, and collapsing uses `hidden` — never `max-height: 0`, which
> leaves the text in the accessibility tree and its links in the tab order.
> CAUTION: `hidden` panels are dropped by `htmlToMarkdown()`, so collapsed answers disappear
> from `llms-full.txt`. Either render the answers open by default or extend the backfill in
> `content/regenerate.mjs` to cover the new page.

## 8. Closing CTA

```markdown
## <H2: a question or an invitation, not "Get Started">

<One or two sentences.>

[<Descriptive CTA>](/contact/) [Call (866) 634-9144](tel:+18666349144)
```

> WHY: the header CTA is `href="/contact/#consult"`, so the consultation modal has a no-JS
> reachable fallback. Never `role="button"` on an `<a href>` — it overrides the link role and
> breaks middle-click and open-in-new-tab.

## 9. Related links

```markdown
## <H2: e.g. "Build a stronger laboratory program">

<One sentence of orientation.>

- [<Destination name> — <what the reader gets>](<route>)
```

> WHY: rendered by `renderRelated()` from `relatedRoutes()` — siblings, then children, then
> group peers — so the anchor text comes from `navLabel` and the blurb from `summary`, and
> cannot drift from `routes[]`. Three links, all root-relative, all with a trailing slash.

---

## 10. Structured data this page must produce

Emitted by `renderHeadTags()` in `build/lib/render.mjs`, from `routes[]` — never hand-written
into a page.

| Node | Requirement |
| --- | --- |
| `Service` | own `@id` = `{canonical}#service`; `name`, `description`, `serviceType`, `areaServed` — consistent across all 13 service pages |
| `Service.provider` | a pure reference: `{"@id": "https://medtech4solutions.com/#organization"}`. Never re-inline `name`/`url`/`telephone` into a node that already has a global `@id` — that is what produced four conflicting `@type` shapes on one `@id` across 18 pages |
| `WebPage` | `@id` = `{canonical}#webpage`, plus `url`, `name`, `description`, `inLanguage`, `isPartOf` → `#website`, `breadcrumb` → this page's `BreadcrumbList`. No self-referential `mainEntityOfPage` |
| `BreadcrumbList` | generated by `breadcrumbTrail(route, graph)` from `routes[].parent`, so the `/services/` tier is always present and the visible `<nav aria-label="Breadcrumb"><ol>` renders from the same output |
| `Organization` | injected identically on every page from `organizationJsonLd(cfg)`. Do not redeclare it here |
| `FAQPage` | only if §7 rendered visible answers |
| Parent hub `OfferCatalog` | should reference this page's `Service` `@id`, so add the entry when the page is created |

## 11. Head tags this page must produce

`og:type`, `og:title`, `og:description`, `og:site_name`, `og:url`, `og:locale=en_US`,
`og:image` + `og:image:width` / `:height` / `:alt`, `twitter:card`, `twitter:title`,
`twitter:description`, `twitter:image`; one self-referencing absolute `rel=canonical`;
`robots` = `index, follow, max-image-preview:large, max-snippet:-1`. No `twitter:url` (not a
documented card property), no `meta keywords`, one viewport spelling, and never
`twitter:card=summary_large_image` without an image to fill it.

## 12. Before it ships — checklist

- [ ] Exactly one `<h1>`; no skipped heading levels (`node build/sync.mjs --check`).
- [ ] `<main id="main">` present; skip link is the first focusable element.
- [ ] Every `<section>` labelled by its heading, or demoted to `<div>`.
- [ ] No generic anchor text; every internal href root-relative with a trailing slash.
- [ ] Every image keeps descriptive `alt` (all 50 images in the export have it — do not
      regress that), and exactly one `fetchpriority=high` preload per page.
- [ ] No inline `on*` handlers and no inline `style=`; hover states paired with
      `:focus-visible`.
- [ ] Every statistic carries a source, period and basis — or is gone.
- [ ] Every named individual with a claimed credential has a bio, a headshot and a verified
      `Person` node — or the name is not on the page.
- [ ] Entity definitions taken from [`../entities.md`](../entities.md), reviewed by MedTech's
      laboratory director or regulatory counsel.
- [ ] `node content/regenerate.mjs --strict` passes, so the Markdown mirror matches the page.

---

## A note on llms.txt and llms-full.txt

Both are generated from `routes[]` and from the built pages, and both are for third-party AI
crawlers — ClaudeBot, GPTBot, ChatGPT-User, PerplexityBot. **Google Search ignores them.** They
have no effect on Google ranking, indexing or AI Overview inclusion, and nothing in this
template should be written "for" them. What helps a page in Google is what has always helped:
useful content, semantic HTML, crawlability and page experience. A new service page enters both
files automatically via `inLlms`, with its `summary` as the annotation — nothing to do by hand.
