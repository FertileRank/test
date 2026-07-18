FertileRank — Mini Lead-Gen Starter Site
========================================

A lean, launch-ready static site distilled from the full FertileRank website. It is
built to get a fertility-clinic marketing practice online fast and start collecting
leads on day one. Vanilla HTML5 + one CSS file + inline JS. No framework, no build
step required to serve it.

WHAT'S HERE (clean URLs, one folder per page)
  index.html                          -> /                          (Landing page — the star)
  contact/index.html                  -> /contact                   (Book a call + inquiry form)
  thank-you/index.html                -> /thank-you                 (Post-submit confirmation)
  privacy-policy/index.html           -> /privacy-policy
  terms-of-service/index.html         -> /terms-of-service
  cookie-policy/index.html            -> /cookie-policy
  accessibility-statement/index.html  -> /accessibility-statement
  404.html                            -> shown on unknown paths (host error page)
  404/index.html                      -> /404/  (folder version for CMS/clean-URL hosts;
                                          identical file, root-relative paths)
  assets/global.css                   -> the single global stylesheet
  assets/site.js                      -> all page behaviors, loaded with `defer`
  favicon.svg, og-cover.png           -> brand assets
  robots.txt, sitemap.xml, llms.txt

THE LANDING PAGE
  The homepage is a single high-converting landing page with:
    - A hero LEAD-CAPTURE FORM ("Get your free growth audit")
    - Who we help (IVF, REI, donor programs, cryobanks, OB/GYN)
    - All eight services in one pipeline
    - How we work (five-phase blueprint)
    - Details / about (why fertility-only) + brand facts
    - FAQ and multiple conversion CTAs
  Header/footer nav links jump to these on-page sections; the "Book a Strategy Call"
  button and every CTA drive to the form or the /contact page.

COLLECTING LEADS — CONNECT A FORM HANDLER (do this before go-live)
  Both the hero form (index.html) and the contact form (contact/index.html) are static.
  Out of the box, a validated submit routes the visitor to /thank-you/. To actually
  capture the lead, connect the form to a handler:
    1. Search the files for "SEARCH ATLAS — LEAD FORM" / "SEARCH ATLAS — CONTACT FORM".
    2. Point the <form action>/method at your handler (Search Atlas Forms, Formspree,
       HubSpot, etc.) or drop in the handler's embed, OR POST the fields via fetch in the
       enhancement script (marked with a TODO) before the redirect.
    3. Keep the field labels and the "no medical/health information" (no-PHI) notice.

POST-UPLOAD PLACEHOLDERS (search the files for these markers)
  - "TRACKING: HEAD"      -> paste GA4 / GTM / Search Console verification / pixels
  - "TRACKING: BODY-END"  -> paste GTM <noscript>, chat widgets, deferred scripts
  - Canonical + OG URLs use https://fertilerank.com — find-and-replace across **/*.html
    and sitemap.xml to publish on another domain.

STRICTLY RELATIVE PATHS
  Every internal link, stylesheet, and asset uses a relative path (e.g. ../assets/global.css,
  ../contact/), so the site keeps working even if extracted into a subdirectory. The 404
  page is the one intentional exception (root-relative, so it works from any path).

FONTS load from Google Fonts (absolute CDN URL). Self-host WOFF2 subsets for best
Core Web Vitals if desired.

GROWING THE SITE
  The full FertileRank build includes deeper standalone pages (per-service pages,
  Who We Serve, How We Work, About, Pricing, Resources, IVF landing). Add them back when
  ready — the header/footer nav and landing sections are structured to accept them.
