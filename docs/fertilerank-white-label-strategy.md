# FertileRank White-Label & Growth Strategy

## Search Atlas + GoHighLevel under one brand: setup, portal, service catalog, and AI-bot pricing

**Prepared:** July 2026
**Scope:** Part 1 — white-label setup and brand integration · Part 2 — custom client portal · Part 3 — service offerings and strategy · Part 4 — AI chatbot/voice bot pricing · plus a 90-day rollout roadmap and a consolidated vendor-confirmation checklist.

> **How facts in this document were sourced.** Vendor features and prices below were researched and adversarially fact-checked against live vendor pages and official help-center content in July 2026 (Search Atlas's pricing page was scraped live on 2026-07-19). Both vendors change pricing frequently — HighLevel restructured its AI billing in May 2026, and Search Atlas revised plan quotas within the last year. Anything marked **(confirm)** could not be fully verified and is consolidated in [Part 6](#part-6--confirm-before-you-commit). Re-verify all numbers before signing client contracts.

---

## Executive summary

The recommended architecture is a **three-layer stack under the FertileRank brand**:

1. **GoHighLevel Agency Pro ($497/mo)** as the operating system — white-labeled CRM, SaaS-mode client billing with markup, snapshots for repeatable onboarding, and AI-feature rebilling.
2. **Search Atlas Pro ($399/mo) or Agency ($999/mo)** as the SEO engine — white-label unlocks at Pro, including a custom-domain dashboard, branded Report Builder, and OTTO running under your brand.
3. **A phased portal strategy** — start with GoHighLevel itself as the client portal (Custom Menu Links + the native Search Atlas integration), then graduate to a custom Next.js portal fed by both platforms' APIs once recurring revenue justifies the build.

Three research findings that should shape every decision below:

- **HighLevel and Search Atlas are already partners.** Since March 2025, HighLevel has offered a native, first-party "SEO, powered by Search Atlas" module — $79/mo per enabled sub-account, resellable at any price you set, surfaced as an SEO tab inside each sub-account with no separate login. It is a *reduced subset* of Search Atlas Starter (4 sites, 1,000 tracked keywords, no local citations), so it works for entry-level clients while your direct Search Atlas Pro/Agency subscription powers premium clients. You do not have to build the basic integration — it exists.
- **Never plan around iframing logged-in dashboards.** Search Atlas's sanctioned embed path is Report Builder's official **"Get iFrame Code"** feature plus white-labeled public share URLs. Whether the full interactive dashboard can be iframed is undocumented and must be tested (and Safari/Firefox block third-party cookies by default, which breaks embedded logged-in sessions regardless). Build the portal on share-link embeds and API data, not screen-in-screen dashboards.
- **Price AI bots against the human alternative, not vendor rates.** Your voice-bot cost of goods is roughly $0.10–$0.16/minute; medical answering services charge clinics roughly $1.00–$2.25/minute. That gap is the margin engine for Part 4's tier design.

---

# Part 1 — White-label setup & brand integration

## 1.1 The stack at a glance

| Layer | Product | Cost (verified July 2026) | Role |
|---|---|---|---|
| CRM / operations | GoHighLevel **Agency Pro** | $497/mo (annual ≈ $4,968–4,970/yr) | SaaS mode, markup rebilling, AI rebilling, unlimited sub-accounts, API |
| SEO platform | Search Atlas **Pro** | $399/mo (5 seats, 4 OTTO projects, ~600 tracked keywords) | White-label dashboard + reports; upgrade trigger below |
| SEO platform (scale) | Search Atlas **Agency** | $999/mo (10 seats, 10 OTTO projects, "unlimited" keywords advertised) | Move here when you exceed 4 premium SEO clients |
| Per-client SEO (entry tier) | GHL "SEO powered by Search Atlas" | $79/mo per enabled sub-account | Resellable native SEO tab for starter clients |
| Mobile app (optional) | GHL Whitelabel Mobile App | $497/mo or $1,491/quarter (+ Apple $99/yr, Google $25) | Defer; free gray-label "LeadConnector" app bridges the gap |
| Compliance (when needed) | GHL HIPAA add-on | $297/mo, account-wide, **irreversible once enabled** | Required before patient PHI enters any sub-account |
| Zapier branding (optional) | Whitelabel Zap | $50/mo | Only if you expose Zapier to clients |

**Fixed platform floor: ~$896/mo** (GHL $497 + Search Atlas Pro $399) before any per-client costs. Two mid-tier SEO retainers cover it.

Both platforms offer trials (Search Atlas 7-day; annual billing ≈ 20% off **(confirm)**). Run the full white-label configuration during the trial before paying.

## 1.2 Search Atlas white-label configuration checklist

White-label is gated to **Pro ($399/mo) and above** — Starter and Growth do not include it. Configuration lives under **Agency White Label** settings; client management lives in the **Agency Hub**.

1. **Custom dashboard domain.** Map a subdomain (recommendation: `seo.fertilerank.com`) via DNS record so clients log in through your branded URL, never `searchatlas.com`. The help center confirms custom dashboard URL + logo; get the exact DNS/CNAME instructions from the current help article **(confirm exact steps)**.
2. **Brand assets.** Upload logo, favicon, login-screen imagery, and primary/secondary brand colors. Search Atlas branding is removed across dashboards, PDF reports, and client portals.
3. **Agency Hub structure.** Create team members, clients, brands, and projects; assign client access **per project** so each client sees only their own dashboards, reports, and data.
4. **Report Builder templates.** Build one master white-label report template per service tier (see §1.6). Shared report URLs display your logo and custom domain. Confirm whether scheduled report *emails* can send from a FertileRank domain (custom SMTP/DKIM is not documented) **(confirm)**.
5. **OTTO under your brand.** OTTO runs inside the white-labeled dashboard, so clients experience it as FertileRank's optimization engine. The WordPress plugin (v2.5.0, April 2026) auto-syncs white-label branding for agency users and supports SSO + automatic project linking — install it on every WordPress client site.
6. **Reseller economics.** The white-label program advertises agency-set retail pricing with Search Atlas billing you at ~70%-discounted client-activation rates, and ~$69/mo additional managed sites on Agency **(confirm mechanics with sales — get it in writing before building margin models on it)**.
7. **Known naming caveat:** whether the OTTO *product name* can be fully renamed in client-facing UI (vs. shown under your brand with "OTTO" naming intact) is unverified **(confirm)**. Decide whether you market it as "OTTO by FertileRank" or a house name like "FertileRank Autopilot" pending the answer.

## 1.3 GoHighLevel white-label configuration checklist

Requires the **$297/mo Unlimited plan minimum for white-label desktop/web; $497/mo Agency Pro for SaaS mode, markup rebilling, and AI rebilling** — go straight to $497.

1. **Domains.** Configure the whitelabel app domain (`app.fertilerank.com`), API domain (so system-generated links carry your brand), dedicated email sending domain (with SPF/DKIM), sites domain, and per-sub-account client-portal domains.
2. **Brand surface.** Agency logo (350×180px), favicon, branded login screen with FertileRank terms-of-service and privacy-policy URLs.
3. **Mobile.** Start with the free gray-label **LeadConnector** app (neutral branding, doesn't break white-label). Add the $497/mo Whitelabel Mobile App — published under your own Apple/Google developer accounts with a custom App Store listing — only when client count justifies it (~15–20+ active clients as a rule of thumb).
4. **SaaS Configurator.** Define FertileRank plans (name, monthly/annual price, 0–30-day trial, feature toggles, complimentary wallet credits). Checkout auto-creates sub-accounts from a snapshot and bills through your Stripe (custom payment providers are also now supported). Attach Custom Menu Links to plans so new subscribers automatically receive them.
5. **Rebilling.** HighLevel charges your Agency Wallet at wholesale; your Stripe charges the client at your marked-up price. Markup multipliers are set per sub-account or per SaaS plan (markup rebilling is exclusive to the $497 plan). This covers SMS, email, phone, premium workflow actions, the $79 SEO module, and AI usage.
6. **Snapshots.** Build one master "FertileRank Client" snapshot: pipelines, onboarding workflows, calendars, forms, email/SMS templates, custom fields, tags, dashboards. Snapshots copy configuration only — never contacts, conversations, or third-party integration credentials — so document per-client reconnection steps (Stripe, Google, GBP, etc.).

## 1.4 Brand consistency system

Best practices for making two platforms feel like one product:

- **One domain map, published internally.** `app.fertilerank.com` (CRM) · `seo.fertilerank.com` (SEO dashboard) · `portal.fertilerank.com` (future custom portal) · branded links/report URLs from each platform's domain settings. Clients should never see `gohighlevel.com` or `searchatlas.com` in a URL, email footer, or invoice.
- **One asset kit.** Single source of truth (logo files at each platform's required dimensions, favicon, hex codes, typography) applied to: GHL login screen, Search Atlas login screen, Report Builder templates, proposal templates, email signatures, and the NOVA widget UI (Part 3). Re-audit quarterly — platform UI updates occasionally reset or add brandable surfaces.
- **One naming architecture.** Decide once how you market each capability and use it everywhere: e.g., *FertileRank OS* (the CRM), *FertileRank SEO Engine* (Search Atlas), *FertileRank Autopilot* (OTTO), *NOVA* (AI widget/bot line). Train the team to never use vendor names on client calls, in reports, or in support tickets — the most common white-label leak is a screen-share or a support reply, not a URL.
- **One email identity.** All automated mail — CRM sequences, report deliveries, invoices — sends from `@fertilerank.com` addresses on authenticated domains. Until Search Atlas confirms custom report-email sender domains, schedule reports as branded *links* delivered by a GHL email workflow instead of relying on Search Atlas's sender **(pending §1.2.4 confirmation)**.
- **One reporting voice.** Standardized Report Builder modules per tier, an executive-summary house style (plain-language wins, next actions, no raw tool dumps), and consistent metric definitions across CRM dashboards and SEO reports so numbers never contradict each other.
- **Disclosure discipline.** "Powered by" language is your choice, not an obligation, in client contracts — but never *claim* proprietary ownership of underlying tech in writing; describe capabilities, not vendor identities.

## 1.5 Client account structure

**The core mapping: one GHL sub-account = one client = one Search Atlas project (or one enabled SEO module).**

| Client tier | CRM | SEO | Access |
|---|---|---|---|
| Entry ("Seed") | GHL sub-account from snapshot | Native SEO tab ($79/mo wholesale, rebilled) — 4 sites, 1,000 keywords | Client user logs into GHL only; SEO tab needs no second login |
| Premium ("Bloom") | GHL sub-account from snapshot | Full Search Atlas project on your Pro/Agency plan | GHL login + a Search Atlas client seat on `seo.fertilerank.com`, scoped per-project via Agency Hub |
| Clinic (HIPAA) | GHL sub-account **with HIPAA toggle enabled** | Either of the above | Same as above; PHI rules from §2.5/§4.5 apply |

Operating rules:

- **Naming convention everywhere:** `FR – {Client} – {City}` for sub-accounts, Search Atlas projects, report templates, and snapshots. At 50 clients, findability is a feature.
- **Link the systems by ID.** The Search Atlas API supports attaching an external app ID to a project — store the GHL `location.id` there when provisioning **(confirm endpoint on current docs)**, and keep a master client registry (even a sheet at first) mapping sub-account ID ↔ SA project ID ↔ billing plan.
- **Permissions.** GHL: clients get sub-account **User** role (not Admin), with "Only Assigned Data" scoping where teams share a sub-account; your staff get agency-level roles. Search Atlas: clients get per-project scoped access only — there is no formal read-only role documented, so test what a client seat can modify during the trial **(confirm)**.
- **Seat budgeting.** Search Atlas seats are finite (Pro 5, Agency 10). Reserve seats for premium clients who ask for live dashboard access; most clients are happier with the embedded report + monthly call, which costs no seat.
- **HIPAA boundary.** GHL's HIPAA add-on activates at agency level, but each sub-account must be **manually toggled** into HIPAA mode — an untoggled sub-account is *not* covered by the BAA even while you pay. Both the purchase and each toggle are irreversible. Keep clinic sub-accounts strictly separated from non-medical clients, and enable the toggle *before* the first patient contact is imported.

## 1.6 Workflows: onboarding, reporting, day-to-day

**Onboarding pipeline (run as a GHL opportunity pipeline: Won → Provisioned → Access Collected → Audit → Plan Approved → Live).**

1. **Contract signed** (GHL proposal/invoice) → automation creates the sub-account from the master snapshot, applies the SaaS plan, and attaches Custom Menu Links.
2. **Provision SEO.** Entry tier: toggle SEO Reselling for the sub-account (Agency Settings → Billing → SEO Subscription). Premium tier: create the Search Atlas project (manually, or via API using the GHL location ID as external app ID). No Search Atlas Zapier/Make app exists — automation is native toggle, REST API, or the hosted MCP server.
3. **Access collection** via a GHL form + task checklist: website/CMS, Google Business Profile, GA4, Google Search Console, ad accounts. (For clinics, add BAA execution here.)
4. **Install OTTO** — JS pixel on the client site; on GHL-built sites place the script in the global footer/body section (GHL limits `<head>` control, and the footer method is Search Atlas's documented GHL install path); WordPress sites use the plugin with branding sync.
5. **Diagnosis before execution.** Run the technical audit, keyword research, competitor baseline, and (clinics) E-E-A-T/content review — then present one consolidated 90-day plan for approval. Resist shipping fixes before the plan is approved; rushed audits are the classic agency failure mode.
6. **Report wiring.** Clone the tier's Report Builder template, connect GA4/GSC/rank tracker/GBP/heatmap modules, schedule delivery, and drop the report's iframe embed into the client's portal surface (Part 2).

**Reporting cadence.**

- **Always-on:** the embedded live Report Builder dashboard in the client's portal view.
- **Monthly:** scheduled white-label report (AI summary + your written executive notes) delivered by a GHL email workflow, followed by a 30-minute review call for premium tiers.
- **Quarterly:** strategy review against the 90-day plan; refresh keyword targets and the roadmap.
- **Internal weekly:** portfolio triage using Report Builder's portfolio-level 0–100 health dashboard and OTTO issue queues — work exceptions, not every account every week.

**Day-to-day account management.**

- Run delivery inside GHL: a "Delivery" pipeline or task board per client fed by recurring task templates from the snapshot (content calendar, link outreach, GBP posts, review responses).
- OTTO handles continuous technical/on-page fixes under quota (AI points for micro-tasks, Hyperdrive credits for off-page); your team reviews and approves OTTO suggestions rather than hand-implementing everything — that review-and-approve loop is the margin advantage of this stack.
- All client communication through GHL conversations (email/SMS) so context lives with the account, not in personal inboxes; internal notes on the contact record; escalations tagged to a manager view.
- Watch quota consumption (Search Atlas AI points/HDC and GHL wallet) weekly per client so usage-based costs never silently eat a retainer.

---

# Part 2 — Custom client portal

## 2.2 Yes — it's possible, and here is the honest constraint map

A FertileRank-branded portal that surfaces Search Atlas dashboards **can absolutely be built**, but the integration primitives determine everything:

| Primitive | Status (verified July 2026) | Portal implication |
|---|---|---|
| Report Builder **"Get iFrame Code"** | ✅ Official feature; share pages are white-labeled (your logo/domain) | The backbone: sanctioned, login-free embeds of live client dashboards |
| OTTO public share URLs | ✅ Documented capability | Embed/link optimization status without a login |
| Iframing the full logged-in dashboard | ⚠️ Undocumented either way — **must be tested**; Safari/Firefox block third-party cookies by default, breaking embedded logged-in sessions for a large share of users (especially US mobile) | Do not architect around it |
| Search Atlas REST API | ✅ Docs exist (`docs.searchatlas.com`, X-API-Key from Dashboard → API Settings; note rank-tracker endpoints live at `keyword.searchatlas.com`) — but third parties say API access is Enterprise-gated **(confirm tier)** | Custom-build data source, pending tier confirmation |
| Search Atlas hosted MCP server | ✅ Confirmed live: `mcp.searchatlas.com/mcp`, ~587 tools (rankings, audits, GSC, backlinks, Report Builder, heatmaps, LLM visibility) | Alternative programmatic path; confirm licensing for client-facing use **(confirm)** |
| Search Atlas SSO / magic links / auto-login | ❌ None documented | Portal cannot silently log clients into Search Atlas; use share links or API rendering |
| Search Atlas outbound webhooks | ❌ None documented | Custom portal must poll on a schedule |
| GHL Custom Menu Links | ✅ Iframe or new-tab modes, agency- or sub-account-level targeting, role-based visibility, attachable to SaaS plans, dynamic merge fields (`{{location.id}}`, `{{user.email}}`, `{{custom_values.x}}`) | Per-client deep links with zero code |
| GHL API v2 | ✅ OAuth 2.0 (24-hour tokens + refresh) **and** static Private Integration Tokens; granular scopes; limits 100 req/10s and 200k req/day per app per location; webhooks with signature verification | Full CRM data for a custom portal; private apps skip marketplace review |
| GHL native Client Portal product | ⚠️ Scoped to courses/communities/affiliates; iframes inside it are still a feature request; magic links currently unavailable on newly created locations | Not a general reporting portal — use sub-account logins instead |

## 2.2 Three build paths

| | Path A — GHL *is* the portal | Path B — Low-code portal | Path C — Custom portal |
|---|---|---|---|
| What it is | White-labeled GHL sub-account login + native SEO tab + Custom Menu Links embedding Report Builder iframes | Copilot / SuiteDash / Softr wrapping embeds + docs + billing | Next.js app consuming Search Atlas + GHL APIs, your own charts |
| Build time | Days | 1–3 weeks | 6–12 weeks (lean) |
| Build cost | ~$0 | $89–$400/mo platform + setup | ~$15k–$40k agency-built; ~$5k–$20k with vetted freelancers |
| Client experience | Very good; one login; "portal" = their FertileRank OS account | Good; cleaner curation | Fully bespoke; strongest moat |
| Risk | Lowest | Iframe-auth limits still apply | API tier gating **(confirm)**; polling only (no SA webhooks) |

Notes on Path B if you go there: **Copilot** (copilot.app) is the standout — its Custom Apps are iframes that receive authenticated context about the logged-in client, ideal for a thin dashboard page fed by your own API layer. **SuiteDash** offers full white-label plus a HIPAA BAA. Softr works via per-record dynamic embed codes. But given how much Path A already delivers, Path B is usually a detour; the recommended sequence is **A now → C when premium-client count justifies it**, skipping B.

## 2.3 Step-by-step: Path A (weeks 1–2)

1. Complete §1.2/§1.3 white-label configuration on both platforms.
2. Build the master client snapshot including a client-facing dashboard (GHL dashboards support Embed widgets on the $497 plan).
3. Per client, create their Report Builder report; copy its **iFrame code**.
4. Add a Custom Menu Link — "My SEO Results" — in embedded-iframe mode, targeted to that sub-account (or store per-client report URLs in a custom value and use `{{custom_values.seo_report_url}}` in one agency-level link).
5. Entry-tier clients additionally get the native SEO tab (Sites → SEO) — live keyword, audit, and backlink views with no extra login.
6. Add further menu links: "Book a Call" (GHL calendar), "Billing" (invoices), "Content Approvals" (form/pipeline view).
7. Test every embed in Chrome, Safari, and Firefox and on mobile — Custom Menu Link targets must allow framing, and Report Builder share pages are the only Search Atlas surface with *official* iframe support.
8. Publish a client "Getting around your FertileRank portal" one-pager (also the training script for onboarding calls).

## 2.4 Step-by-step: Path C (months 4–6, once justified)

1. **Confirm the two gating facts first** (in writing): Search Atlas API availability on your plan tier + rate limits, and MCP licensing for client-facing products. If API access truly requires Enterprise, price that into the decision.
2. **Stack:** Next.js/React + Supabase (Postgres + auth) on Vercel — the dominant portal stack in 2026 for good reason. For the HIPAA variant: Supabase HIPAA add-on (Team/Enterprise, ~$350/mo) + Vercel Pro HIPAA BAA add-on (~$350/mo), and choose auth from Supabase Auth or Auth0 (BAA-capable); Clerk reportedly added an Enterprise-tier BAA in 2026 **(confirm before relying on it)**.
3. **GHL side:** create a **private marketplace app** (skips review) using Private Integration Tokens or OAuth location tokens; scopes for contacts, opportunities, conversations, calendars, invoices; webhooks (signature-verified) for near-real-time CRM sync.
4. **Search Atlas side:** server-side jobs poll rankings, audits, GSC, backlinks, and report data on a schedule (no webhooks exist); cache in Postgres; render your own charts. Never call vendor APIs from the browser.
5. **Identity model:** `portal_user → { ghl_location_id, ghl_contact_id (email-matched), sa_project_id }` in your database. One FertileRank login; vendor systems stay invisible.
6. **v1 feature cut:** dashboard (rankings trend, traffic, audit health, leads/opportunities from CRM), embedded Report Builder report (reuse the sanctioned iframe), announcements, booking, invoices. Resist rebuilding the whole Search Atlas UI — curate the ~10 numbers clients actually care about.
7. **Team:** one GHL-certified specialist (directory.gohighlevel.com; Upwork GHL specialists commonly $25–$150/hr) + one general Next.js developer. Budget $15k–$40k agency-built or $5k–$20k freelancer-built for the lean v1.
8. **Defer** a public GHL marketplace app (review takes ~10 business days to 3 weeks) unless you later productize the portal itself.

## 2.5 Technical requirements & limitations summary

- **Rate limits:** GHL 100 req/10s burst, 200k req/day per app per location; Search Atlas limits undocumented **(confirm)** — design polling conservatively (e.g., hourly rankings, daily audits).
- **No Search Atlas webhooks or SSO** — poll for data; use share links for interactive surfaces.
- **Third-party-cookie reality:** Chrome kept third-party cookies (April 2025 decision), but Safari and Firefox block them by default — roughly 17–30% of global traffic and far more on US mobile. This is why logged-in-dashboard embeds are architecturally off the table.
- **Do not reverse-proxy or strip X-Frame-Options/CSP headers** to force embeds — it breaks auth flows anyway and is a likely ToS violation on both platforms.
- **HIPAA:** SEO metrics are not PHI, but the moment patient-identifiable CRM data (appointments, conversations, treatment interest) surfaces in the portal, the entire stack — hosting, database, auth, GHL — needs BAAs. Design the portal PHI-free by default; gate patient-level views behind the compliant stack variant.

---

# Part 3 — Core service offerings & strategy

## 3.1 Catalog design principles

- **Productize everything:** every à-la-carte item has a fixed deliverable list, cadence, tooling assignment, and price band — sold via GHL SaaS-configurator plans and invoices, delivered via snapshot-templated task workflows.
- **Two motions:** à la carte for land, bundles for expand. Every à-la-carte buyer gets a bundle upgrade path in the proposal.
- **Anchor tiers to the platform tiers** (§1.5): Seed (native SEO module) → Bloom (full Search Atlas) → Clinic (HIPAA + niche program).
- **Suggested price bands** below reflect verified market ranges; set final pricing after 3–4 local competitor quotes.

## 3.2 SEO services (à la carte)

| Service | Core deliverables | Tooling | Cadence | Suggested band |
|---|---|---|---|---|
| Keyword research & strategy | Prioritized keyword map (winnable-first), intent clusters, 90-day targets | SA keyword research + gap analysis | One-time + quarterly refresh | $750–$2,000 |
| On-page optimization | Title/meta/heading/internal-link fixes; OTTO-assisted deployment | OTTO + Content Genius | Monthly batch | $500–$1,500/mo |
| Technical SEO audit | Full crawl audit, prioritized fix plan, Core Web Vitals, schema | SA site audit + OTTO | One-time $1,000–$3,000; monitored monthly |
| Link building | Digital PR + outreach placements, health-domain focus | SA Digital PR tools + manual outreach | Monthly | $1,000–$4,000/mo by volume |
| Local SEO | GBP optimization, citations, review ops, heatmap tracking | SA GBP tools + Local Heatmaps | Monthly | $400–$1,200/mo per location |
| Content optimization | Refresh briefs, on-page scoring, AEO formatting | Content Genius + content grader | Monthly | $150–$400/article |
| Competitor analysis | Rankings/backlink/content gap vs. 3–5 competitors | Site Explorer + keyword gap | Quarterly | $500–$1,500 |
| Monthly performance reporting | White-label live dashboard + written executive summary + call | Report Builder | Monthly | Included in retainers; $250–$500 standalone |

## 3.3 Digital marketing services (à la carte)

| Service | Notes | Suggested band |
|---|---|---|
| PPC advertising | Google Ads via SA's PPC toolset; fertility CPCs commonly run $6–$12 (peaks to ~$45), cost per consultation $80–$250 — set expectations accordingly | 10–15% of spend, $750/mo min |
| Social media management | SA Social Hub + GHL social planner; clinic-safe content guidelines | $500–$1,500/mo |
| Email marketing | GHL workflows; patient-education nurture sequences | $400–$1,200/mo |
| CRO | Landing-page testing, form/booking-flow optimization, call tracking via GHL | $750–$2,000/mo |
| Analytics setup & tracking | GA4 + GSC + GHL attribution + call tracking, consent-mode configured | $500–$1,500 one-time |
| Influencer/outreach | Health-creator partnerships; FTC disclosure compliance built in | Custom |

**Compliance guardrails baked into every clinic engagement:** fertility is a restricted/sensitive ad category — Google and Meta prohibit personalized/remarketing audiences based on fertility interest; outcome guarantees are prohibited; FTC health-claim substantiation ("competent and reliable scientific evidence") applies to ads *and* testimonials; egg-donor compensation ads need risk disclosures (mandatory in California under AB 1317; Arizona has its own rules; ASRM ethics guidance applies everywhere).

## 3.4 FertileRank SEO — the flagship niche program

**Positioning.** The specialist fertility-marketing agency with clinical-grade E-E-A-T workflows, Spanish-language capability, HIPAA-safe operations, and AI-search (AEO/LLM) tracking. The market bears **$3,500–$10,000/mo** for specialist fertility SEO; budget agencies at $499–$999/mo cannot deliver medical review, compliance, or AEO — that's the moat. Named competitors to study: Cardinal, Sagapixel, Direction.com, Tandem, Runner Agency, PatientGain.

**Keyword strategy — attack the winnable tier first** (difficulty scores from a live Search Atlas pull, July 2026):

| Tier | Examples (KD = difficulty) | Play |
|---|---|---|
| Winnable commercial | "ivf near me" KD 20 · "low amh" KD 27 · "how much does ivf cost" KD 33 · "fertility clinic near me" KD 34 | Local landing pages + cost pages, first 90 days |
| Egg-donor cluster | "egg donor" 18,100/mo, KD 25, CPC ~$9 · "egg donation compensation" 1,300/mo, KD 38 | Dedicated donor-recruitment hub (with state-compliant disclosures) |
| Question long-tail | "how to increase sperm count" 12,100/mo · ~72% of fertility searches are question-formatted | FAQ/AEO content engine |
| Head terms | IVF KD 70 · egg freezing KD 77 · male fertility KD 78 · IUI KD 80 | Year-2 pillar targets, after authority is built |

(Validate volumes in a second tool before forecasting — the Search Atlas pull returned difficulty reliably but had volume gaps on several head terms.)

**Program pillars:**

1. **Medical E-E-A-T as table stakes.** Google's Dec 2025/Mar 2026 core updates punished unreviewed health content hard. Every clinical page gets a board-certified reproductive endocrinologist reviewer byline with a credentials block near the top, citations to CDC/NIH/ASRM/PubMed, visible review dates, physician schema, and a direct answer in the first ~120 words. Build a medical-reviewer network (per-article stipends) as a core program asset.
2. **Content architecture.** Hub-and-spoke patient-education center (Illume Fertility's Learning Center is the model), transparent per-treatment cost pages with financing tables, and success-rate pages grounded in SART/CDC data — which legally must carry no-clinic-comparison context.
3. **Spanish-language moat.** Most REI practice sites still have no professionally translated Spanish content; a properly localized Spanish hub (`clinica de fertilidad`, `costo de FIV`) is a low-competition differentiator.
4. **Health-domain link acquisition.** ASRM Find-an-Expert, SART membership, RESOLVE partnerships, hospital/.edu affiliations first (free + authoritative); expert-quote pipelines on the relaunched HARO (Featured.com), Source of Sources, and Qwoted with physician spokespeople; one annual data-study digital-PR asset built on CDC/NCHS fertility statistics. No paid guest posts or PBNs — YMYL link scrutiny makes them net-negative.
5. **Local SEO for clinics.** Fully built GBP per location, unique location×service pages, HIPAA-safe review generation (generic post-visit SMS/email asks 2–24h after the visit; never reference treatment; never confirm patient status in replies; skip lobby kiosks — an April 2026 Google policy reportedly bans on-premises solicitation **(confirm)**), review-velocity floors, weekend-hours accuracy.
6. **SERP + AI-visibility tracking.** Weekly rank tracking and local heatmaps in Search Atlas, plus its LLM-visibility toolset to track citations in AI Overviews and chatbots — AI Overviews appear in roughly half of US healthcare searches by 2026 estimates, FertilityIQ currently dominates LLM citations, and tables/direct answers get extracted at far higher rates than prose. Sell "AI visibility share" as a reported KPI competitors don't even measure.

**FertileRank SEO packages:** Foundation $3,500/mo (single location) · Growth $6,500/mo (multi-service content engine + digital PR) · Network $10,000+/mo (multi-location, Spanish hub, AI-visibility program). Setup/diagnostic: $2,500–$5,000.

## 3.5 NOVA AI Widget/Plugin expansion

Productize NOVA as a **family of embeddable, white-label AI tools** for client websites — each one both a revenue line and a lead-capture surface for FertileRank itself.

| Product | What it does | Build approach |
|---|---|---|
| **NOVA Chat** | AI chatbot: patient FAQs, insurance/cost questions, appointment routing | GHL Conversation AI under the hood initially (token-billed; rebillable with markup); custom Claude/GPT build for clinics needing BAA-covered chat |
| **NOVA Capture** | Lead widgets: quiz funnels ("Is IVF right for me?"), cost calculators, cycle-timing tools | GHL forms/surveys + custom embeds; every capture writes to the client's sub-account pipeline |
| **NOVA Personalize** | On-site personalization: returning-visitor content, service-line recommendations | Custom JS widget (vibe-coded) + GHL contact data; phase 2 |
| **NOVA Recommend** | AI-driven next-step recommendations (content, service, financing) inside portal/chat | Builds on Personalize; phase 3 |

**Expansion sequence:** ship NOVA Chat + NOVA Capture first (both deliverable on today's GHL stack with zero custom infrastructure), use per-client customization revenue to fund the custom widget platform, then graduate Personalize/Recommend into a licensable plugin (one embed script, per-domain licensing — the same distribution mechanics as the OTTO pixel). Pricing rides on Part 4's tier structure; Capture widgets also sell one-off at $1,500–$5,000 build + $99–$299/mo hosting/maintenance.

**HIPAA line:** the moment a NOVA surface collects patient-identifiable health information, it must run on the BAA-covered stack (Part 4 vendor table) and the client's GHL sub-account must have the HIPAA toggle on. Default NOVA deployments to PHI-free patterns (no symptom intake, no treatment history) unless the client buys the compliance tier.

## 3.6 Website design & development

Two productized tiers, both AI-accelerated (Claude Code / Codex in the build workflow — which also means the team dogfoods the AI fluency sold in §3.7):

- **Expedited** — $3,500–$7,500, 2–3 weeks: templated-but-custom design on GHL funnels/sites or WordPress, conversion-first patterns, OTTO pixel pre-installed, GA4/GSC wired, launch checklist including ADA/WCAG accessibility (non-negotiable for healthcare), E-E-A-T scaffolding (reviewer bios, citations blocks), schema, and HIPAA-safe forms where relevant.
- **Enterprise** — $15,000–$50,000+, 6–12 weeks: custom Next.js builds, multi-location architecture, Spanish-language variants, patient-portal integrations, custom NOVA widgets, compliance review.

Workflow (both tiers): intake form → AI-assisted brief and sitemap → design approval → AI-accelerated build → dual QA (automated + human) → SEO/analytics wiring → launch → 30-day post-launch fix window → handoff into an SEO/maintenance retainer. The pitch: AI acceleration compresses timelines ~40–60% without compressing QA — you charge for outcomes and speed, not hours.

## 3.7 Custom vibe-coded tools & AI prompt libraries

**The FertileRank Prompt Vault (1,500+ fertility-focused prompts).**

- **Structure:** organized by role (front desk, nurse coordinator, embryologist-adjacent admin, marketing, billing) × task (patient education, appointment comms, review responses, content drafts, insurance letters, donor-program comms) × compliance level (PHI-safe vs. internal-only), with model-specific variants and a "never do this" section (medical-advice boundaries, HIPAA red lines).
- **Delivery:** as a GHL membership/course product under the FertileRank domain — searchable library, update changelog, quarterly new-prompt drops. This makes the library a subscription asset with near-zero marginal cost.
- **Packaging:** Individual license $497–$997/yr · Clinic license (whole team + quarterly training webinar) $1,997–$4,997/yr · **Enterprise prompting program** (custom prompt frameworks for the organization's own SOPs, team workshops, governance guidelines, model-selection guidance) $7,500–$25,000 engagement + optional retainer.
- **Custom vibe-coded tools:** bespoke micro-apps for reproductive-health organizations — intake triage assistants, donor-matching intake forms, cycle-calendar generators, insurance-verification helpers — built AI-first at $2,500–$15,000 per tool, hosted per-domain. Prompt-library subscribers are the natural pipeline for these builds, and each tool feeds the NOVA plugin roadmap.

---

# Part 4 — Custom AI chatbots & voice bots: usage-based pricing

## 4.1 Verified cost stack (your COGS, July 2026)

| Component | Wholesale cost | Notes |
|---|---|---|
| GHL Conversation AI | Token-based since ~May 2026 (GPT-5 $1.25/$10 per 1M tokens; GPT-5 Mini $0.25/$2) — fractions of a cent per exchange | Legacy $0.02/message pricing retired |
| GHL Voice AI | $0.045/min engine + $0.015/min standard TTS (premium ElevenLabs voices cost more) + LLM tokens + telephony | Realistic all-in ~$0.08–$0.25/min |
| GHL telephony (LC Phone) | ~$0.012/min inbound (≈$0.02 forwarded), ~$0.014–$0.021/min outbound | Verify exact rates in the billing console |
| GHL AI Employee Growth | $50/mo/sub-account — 1,000 Conversation AI responses + 100 voice minutes | Good starter bundle |
| GHL AI Employee Unlimited | $97/mo/sub-account — unlimited chat + **inbound-only** unlimited voice, fair-use | Outbound voice, web voice widget, and Agent Studio stay pay-per-use; telephony always billed |
| Retell AI (off-GHL voice) | $0.07–$0.08/min engine + LLM + telephony ≈ $0.10–$0.19/min realistic | **BAA on all plans at no fee** — default PHI voice stack, paired with Twilio (BAA-capable, $0.0085/min in) |
| Chat LLM direct | GPT-4o mini / Claude Haiku 4.5 class: well under $0.001 per exchange | Model cost is <1% of retail — compete on workflow quality |

Rebilling AI with markup requires the GHL $497 plan (already assumed). For PHI use: Vapi charges ~$1,000/mo for its BAA and its HIPAA mode disables transcripts; ElevenLabs BAAs are Enterprise-only; Bland now reportedly includes BAAs on paid tiers **(confirm)**; Synthflow's BAA is undocumented. **Retell + Twilio is the clean self-serve HIPAA path.** For a BAA at the LLM layer, use Azure OpenAI under Microsoft's BAA or confirm vendor BAAs in writing.

**The anchor that sets your ceiling:** human medical answering services run ~$1.00–$2.25/min (small practices $149–$275/mo for ~50 calls; mid-size practices $400–$1,500/mo). Your AI cost per handled call is ~$0.10–$0.30. Price against the human alternative and the value of a captured consult (fertility PPC costs $80–$250 per consultation), never against API rates.

## 4.2 Tier design principles

- Included-usage buckets + explicit overage (market norm), priced **per location**, with 10–15% multi-location discounts.
- Target 3–6× COGS on bundled effective per-minute rates; overage at roughly 2–3× the bundled rate.
- Any "unlimited" tier gets a written fair-use clause (GHL's own unlimited plan is throttleable — mirror that protection).
- Setup fees at healthcare-grade levels: workflow design, escalation paths to humans for clinical questions, consent flows, and integration are where the real work is.

## 4.3 Proposed NOVA pricing (recommendation — validate against 3–4 competitor rate cards)

**NOVA Chat (AI chatbot):**

| Tier | Monthly | Included | Overage |
|---|---|---|---|
| Essentials | $197 | 2,500 AI conversations-messages, 1 website + 1 channel (SMS or webchat) | $0.05/message |
| Growth | $397 | 10,000 messages, multi-channel (web/SMS/GBP/social), booking integration | $0.04/message |
| Scale | $697 | Fair-use unlimited chat, priority tuning, quarterly prompt refresh | — |

Setup: $1,000–$2,500 (standard) — includes knowledge-base build, brand-voice tuning, escalation design.

**NOVA Voice (AI voice agent):**

| Tier | Monthly | Included minutes | Overage |
|---|---|---|---|
| Reception | $297 | 300 (after-hours or overflow) | $0.49/min |
| Front Desk | $497 | 750 (24/7 inbound) | $0.45/min |
| Practice | $997 | 2,000 + multi-line | $0.39/min |

Setup: $1,500–$3,500 (call flows, transfer/escalation, booking, voicemail deflection).

**Bundles & add-ons:** AI Front Desk (Chat Growth + Voice Front Desk) $797/mo · Practice Suite $1,497/mo · **HIPAA Compliance add-on $249/mo per client + $1,500–$2,500 compliance setup** (funds the BAA-covered stack, the GHL HIPAA allocation, consent/TCPA workflows, and audit documentation — and signals seriousness to medical buyers) · Spanish bilingual agent +$99–$199/mo · Enterprise/clinic-network: custom annual with volume rates.

**Margin check (Front Desk tier):** 750 min × ~$0.13 COGS ≈ $98 + $97 platform allocation ≈ $195 cost → ~61% gross margin at $497, before setup fees — consistent with the verified 50–83% reseller-margin norm, while charging the clinic roughly a third of what a human answering service would cost at that volume.

## 4.4 Compliance non-negotiables (voice/chat to patients)

- **TCPA:** the FCC's Feb 2024 ruling classifies AI voices as "artificial" — outbound marketing calls need **prior express written consent** (a Feb 2026 Fifth Circuit decision relaxes this only in TX/LA/MS; written consent stays the nationwide safe default); informational calls need prior express consent; penalties run $500–$1,500 per call. Inbound-only deployments dodge most of this — another reason the inbound-focused tier structure above is the default.
- Disclose AI use in-call as best practice (an FCC mandatory-disclosure rule was still only proposed as of mid-2026 — track it), honor DNC, and respect state two-party recording-consent laws.
- Every PHI-touching layer needs a BAA: telephony, STT/TTS, LLM, platform, and your own portal stack. Map it per client before launch, and remember GHL's BAA only covers sub-accounts with the HIPAA toggle enabled.

---

# Part 5 — 90-day rollout roadmap

| Phase | Window | Milestones |
|---|---|---|
| **1 — Foundation** | Weeks 1–4 | GHL Agency Pro + Search Atlas Pro trials → paid; full white-label config both platforms (§1.2–1.3); master snapshot + Report Builder templates; vendor-confirmation list (Part 6) worked through with both sales teams; Path-A portal live for 2 pilot clients (one Seed via native SEO module, one Bloom via full Search Atlas) |
| **2 — Productize** | Weeks 5–8 | SaaS-configurator plans for the catalog (§3.2–3.3); FertileRank SEO Foundation package sellable (medical-reviewer network started, E-E-A-T templates, local SEO playbook); NOVA Chat Essentials + first Capture widget live on a pilot; onboarding pipeline automated end-to-end |
| **3 — Scale & specialize** | Weeks 9–13 | NOVA Voice pilot (inbound-only) on Retell or GHL Voice AI; Prompt Vault v1 (first 500 prompts) shipped as a GHL membership; HIPAA decision point — if a clinic client signs, enable the GHL HIPAA add-on + per-sub-account toggles + BAA stack; decide Search Atlas Agency-tier upgrade (trigger: >4 premium SEO clients); scope Path-C portal only if premium-client count justifies it |

**Success metrics to watch from day one:** clients per tier, gross margin per client (wallet + quota costs tracked weekly), report-engagement (portal logins / report opens), NOVA usage vs. included buckets, and AI-visibility share for flagship clients.

---

# Part 6 — Confirm before you commit

Highest-priority items to settle with vendor sales/support (in writing), in order:

1. **Search Atlas API tier** — docs show self-serve X-API-Key from Dashboard → API Settings, but multiple 2026 reviews say API access is Enterprise-only. Also: rate limits, and whether the hosted MCP server is licensed for client-facing use. *(Gates Path C.)*
2. **Dashboard iframability** — test a white-label dashboard URL inside a GHL Custom Menu Link on a trial account (and a `curl -sI` header check for `X-Frame-Options`/`frame-ancestors`). *(Determines whether anything beyond Report Builder embeds is possible.)*
3. **Search Atlas reseller economics** — the advertised ~70%-discounted client-activation billing, ~$69/mo extra managed sites, and whether client accounts are unlimited with read-only capability at Pro vs. Agency.
4. **Report email sender domain** — can scheduled Report Builder emails send from a FertileRank domain (custom SMTP/DKIM)? If not, deliver report links via GHL email workflows.
5. **Current plan quotas on both platforms** — Search Atlas OTTO projects/keywords/seats per tier (the live pricing page contradicts several third-party writeups), and the GHL SEO module's current price/quotas ($79/mo, 4 sites, 1,000 keywords) plus whether extra-site purchase or Report Builder/citations were added to the embedded version after 2025 agency complaints.
6. **GHL HIPAA BAA scope** — confirm Conversation AI/Voice AI are covered by the BAA (AI features are sometimes carved out), and the per-sub-account toggle mechanics.
7. **BAA availability current-state** — Bland (paid tiers?), Synthflow (any?), Clerk (Enterprise?), OpenAI direct API vs. Azure OpenAI, Anthropic API — for whichever stack NOVA's HIPAA tier lands on.
8. **OTTO renaming** — can the OTTO product name itself be replaced in client-facing UI?
9. **Google review-solicitation policy** — verify the reported April 2026 ban on on-premises review kiosks against Google's official GBP policy before writing clinic review playbooks.
10. **Egg-donor advertising rules per target state** — beyond California AB 1317 and Arizona, run a healthcare-counsel review before donor-recruitment campaigns.

---

# Part 7 — Source notes

Primary sources relied on (all checked July 2026): searchatlas.com pricing and white-label pages (live-scraped 2026-07-19), Search Atlas help center and API docs (`docs.searchatlas.com`), the official Search Atlas MCP server (first-hand tool inspection), HighLevel's official pricing/AI-pricing/HIPAA/Custom-Menu-Link/snapshot help-center articles, the Search Atlas × HighLevel partnership press release (March 4, 2025), GHL marketplace API docs, FCC TCPA rulings (Feb 2024 declaratory ruling; Feb 2026 Fifth Circuit *Bradford* decision), FTC Health Products Compliance Guidance (Dec 2022), CDC/SART success-rate reporting requirements, vendor pricing pages for Retell/Vapi/Bland/ElevenLabs/Twilio/Smith.ai/Goodcall, and Whitespark local-ranking-factor summaries. Several vendor sites block automated access; where facts came from search-indexed copies of official pages rather than direct fetches, they were corroborated across multiple independent sources and flagged **(confirm)** when any conflict remained. Fertility keyword-difficulty data is a first-party Search Atlas pull (July 2026).
