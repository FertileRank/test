FertileRank — Mini Lead-Gen Starter Site
========================================

A lean, launch-ready static site distilled from the full FertileRank website. It is
built to get a fertility-clinic marketing practice online fast and start collecting
leads on day one. Vanilla HTML5 + one CSS file + inline JS. No framework, no build
step required to serve it.

WHAT'S HERE (clean URLs, one folder per page)
  index.html                          -> /                          (Landing page — the star)
  fertility-clinic-seo/index.html     -> /fertility-clinic-seo      (Service landing + lead form)
  fertility-clinic-google-ads/…       -> /fertility-clinic-google-ads (Service landing + lead form)
  egg-donor-recruitment-marketing/…   -> /egg-donor-recruitment-marketing (Service landing + lead form)
  about/index.html                    -> /about                     (Company profile)
  blog/index.html                     -> /blog                      (Blog pillar/hub)
  blog/fertility-clinic-marketing-cost/…    -> blog post (pricing guide)
  blog/how-to-get-more-ivf-patients/…       -> blog post (growth system)
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
  assets/logo-color.svg, assets/logo-white.svg -> brand logos (header / footer)
  favicon.webp, fertilerank-og-meta-image.webp -> brand assets
  robots.txt, sitemap.xml, llms.txt

SEARCH ATLAS / CMS / WORDPRESS MIGRATION
  Structure compliance:
    - EVERY page is its own folder containing exactly one index.html, so each
      serves a clean trailing-slash URL (/about/, /blog/, /fertility-clinic-seo/ …).
    - The homepage is the root index.html (Search Atlas Website Studio convention).
    - 404.html at the root is the host error page; 404/index.html is the same
      document as a routable page for CMS platforms that require folder pages.
    - Blog posts live under blog/<post-slug>/index.html, which maps 1:1 to a
      WordPress "/blog/%postname%/" permalink structure; every other folder maps
      to a WordPress page at "/%pagename%/".
  Upload: unzip and upload the CONTENTS of the top-level folder, preserving the
  folder structure. No build step, no server-side code, no external JS — one CSS
  file, one deferred JS file, self-contained SVG/WebP assets, all paths relative
  (pages keep working if extracted into a subdirectory).
  Sync-safe details: unique <title> + meta description + canonical per page;
  self-contained JSON-LD in each page head; UTF-8; lang="en"; no query-string
  URLs; no fragments in sitemap.xml (13 canonical URLs, trailing-slash form
  matching internal links).

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
  The site now includes standalone landing pages for the three flagship services,
  a company profile (/about/), and a blog hub with two posts. To add a page:
  create <slug>/index.html (copy an existing page as the template), add it to
  sitemap.xml and llms.txt, and link it from the nav/footer or a landing section.
  New blog posts go in blog/<post-slug>/index.html and get a card on /blog/.
  Remaining full-build pages (per-service pages for the other five systems,
  Who We Serve, How We Work, Pricing) can be added the same way.
