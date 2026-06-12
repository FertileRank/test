#!/usr/bin/env python3
"""
Generate EggCelle PPC landing pages, one per market (Michigan, North Carolina,
Ohio). Styling and Google Ads conversion tracking are lifted verbatim from the
approved North Carolina page (index.html) so every location stays pixel- and
tracking-identical; only the location-specific copy/schema changes.

Partner clinics are grounded in the live Google Ads account:
  - MI  -> RMA of Michigan        (the "OTTO - Ads - RMA ..." campaigns)
  - OH  -> SpringCreek Fertility  (the "OTTO - Ads - SCF / EDC SpringCreek" campaigns)
  - NC  -> Reproductive Specialists of the Carolinas (existing page)

Output: <slug>/index.html  ->  eggcelle.com/<slug>/
"""
import re, os, html

# Script lives in landing-pages/; the site root (and existing index.html) is the
# parent dir, so generated pages land at <root>/<slug>/ -> eggcelle.com/<slug>/.
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "index.html")

src = open(SRC, encoding="utf-8").read()

# Reuse the proven CSS + the bottom attribution-forwarding script verbatim.
STYLE = re.search(r"<style>.*?</style>", src, re.S).group(0)
FORWARD_SCRIPT = re.search(r"<script>\s*//\s*Forward attribution.*?</script>", src, re.S).group(0)

# Google Ads conversion tracking head block (identical across pages).
HEAD_TRACKING = """    <!-- Google Ads Conversion Tracking (placeholders - replace AW-XXXXXXXXX and conversion label) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-XXXXXXXXX');
      function reportApplicationConversion(url) {
        gtag('event', 'conversion', {
          'send_to': 'AW-XXXXXXXXX/XXXXXXXXX',
          'event_callback': function () { if (url) window.location = url; }
        });
        return false;
      }
    </script>"""

PRESCREEN = "https://eggcelle.eggdonorconnect.com/donorprescreen"

# ----------------------------------------------------------------------------
# Per-market data
# ----------------------------------------------------------------------------
LOCATIONS = [
    {
        "slug": "michigan", "state": "Michigan", "abbr": "MI",
        "partner": "RMA of Michigan",
        "clinic_city": "Troy",
        "primary": ["Detroit", "Troy", "Bloomfield Hills", "Royal Oak"],
        "all_cities": ["Detroit", "Troy", "Bloomfield Hills", "Royal Oak", "Ann Arbor",
                       "Grand Rapids", "Warren", "Sterling Heights", "Livonia", "Dearborn",
                       "Farmington Hills", "Novi"],
        "phone_display": "(248) 555-0142", "phone_tel": "+12485550142",
        "phone_placeholder": True,
        "testimonial_name": "Ashley M.", "testimonial_city": "Royal Oak, MI",
    },
    {
        "slug": "north-carolina", "state": "North Carolina", "abbr": "NC",
        "partner": "Reproductive Specialists of the Carolinas",
        "clinic_city": "Charlotte",
        "primary": ["Charlotte", "Raleigh", "Greensboro", "Winston-Salem"],
        "all_cities": ["Charlotte", "Raleigh", "Greensboro", "Winston-Salem", "Durham",
                       "Asheville", "Cary", "Concord", "Gastonia", "Huntersville",
                       "Wilmington", "High Point"],
        "phone_display": "(704) 247-2209", "phone_tel": "+17042472209",
        "phone_placeholder": False,
        "testimonial_name": "Madison R.", "testimonial_city": "Charlotte, NC",
    },
    {
        "slug": "ohio", "state": "Ohio", "abbr": "OH",
        "partner": "SpringCreek Fertility",
        "clinic_city": "Dayton",
        "primary": ["Columbus", "Cincinnati", "Dayton", "Cleveland"],
        "all_cities": ["Columbus", "Cincinnati", "Dayton", "Cleveland", "Akron", "Toledo",
                       "Canton", "Springfield", "Kettering", "Beavercreek", "Dublin",
                       "Westerville"],
        "phone_display": "(614) 555-0188", "phone_tel": "+16145550188",
        "phone_placeholder": True,
        "testimonial_name": "Brittany K.", "testimonial_city": "Dublin, OH",
    },
]


def list_with_and(items):
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + ", and " + items[-1]


def build_page(d):
    state, abbr, partner, clinic = d["state"], d["abbr"], d["partner"], d["clinic_city"]
    slug = d["slug"]
    primary_and = list_with_and(d["primary"])            # hero: "A, B, C, and D"
    primary_plain = ", ".join(d["primary"])              # service desc: "A, B, C, D"
    others = [c for c in d["primary"] if c != clinic]    # FAQ: cities minus the clinic city
    others_text = ", ".join(others)
    primary_amp = ", ".join(d["primary"][:-1]) + " &amp; " + d["primary"][-1]
    url = f"https://eggcelle.com/{slug}/"

    schema_cities = ",\n            ".join(
        f'{{"@type": "City", "name": "{c}"}}' for c in d["primary"])
    city_chips = "\n                ".join(
        f'<span class="city">{c}</span>' for c in d["all_cities"])
    phone_note = ("\n    <!-- NOTE: phone number is a placeholder (555-01xx reserved range) "
                  "- replace with the market's real call-tracking number. -->"
                  if d["phone_placeholder"] else "")

    head = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Primary Meta Tags -->
    <title>Become an Egg Donor in {state} | Up to $10,000 | EggCelle</title>
    <meta name="description" content="Apply to become an egg donor in {state} with EggCelle. Generous compensation up to $10,000 per cycle. {primary_amp}. Help build families today.">
    <meta name="keywords" content="become an egg donor {state.lower()}, egg donation {d['primary'][0].lower()}, egg donation {d['primary'][1].lower()}, egg donor compensation, egg donor pay, egg donation {state.lower()}, become an egg donor near me, how to become an egg donor, egg donor program {abbr.lower()}">
    <meta name="robots" content="noindex, follow">

    <!-- Open Graph / Social -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Become an Egg Donor in {state} | Up to $10,000 | EggCelle">
    <meta property="og:description" content="Apply to become an egg donor in {state}. Generous compensation, expert medical care, and a meaningful way to help others build their families.">
    <meta property="og:url" content="{url}">
    <meta property="og:site_name" content="EggCelle Donor Program">
    <meta property="og:locale" content="en_US">

    <!-- Canonical -->
    <link rel="canonical" href="{url}">{phone_note}

    <!-- Schema -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@graph": [
        {{
          "@type": "Organization",
          "@id": "https://eggcelle.com/#organization",
          "name": "EggCelle Donor Program",
          "url": "https://eggcelle.com/",
          "areaServed": [
            {{"@type": "State", "name": "{state}"}},
            {schema_cities}
          ],
          "sameAs": [
            "https://www.instagram.com/eggcelle/",
            "https://www.facebook.com/eggcelle/"
          ]
        }},
        {{
          "@type": "Service",
          "serviceType": "Egg Donation Program",
          "provider": {{"@id": "https://eggcelle.com/#organization"}},
          "areaServed": {{"@type": "State", "name": "{state}"}},
          "name": "Become an Egg Donor in {state}",
          "description": "Compensated egg donation program for women ages 21-30 in {primary_plain} and surrounding {state} cities.",
          "offers": {{
            "@type": "Offer",
            "price": "10000",
            "priceCurrency": "USD",
            "description": "Up to $10,000 compensation per completed cycle"
          }}
        }},
        {{
          "@type": "FAQPage",
          "mainEntity": [
            {{
              "@type": "Question",
              "name": "How much do egg donors get paid in {state}?",
              "acceptedAnswer": {{
                "@type": "Answer",
                "text": "Qualified egg donors with EggCelle in {state} receive up to $10,000 per completed cycle, plus all medical, travel, and screening costs covered."
              }}
            }},
            {{
              "@type": "Question",
              "name": "Who can become an egg donor in {state}?",
              "acceptedAnswer": {{
                "@type": "Answer",
                "text": "Healthy women ages 21-30 with a BMI under 28, regular menstrual cycles, no smoking or drug use, and a willingness to complete medical and psychological screening can apply."
              }}
            }},
            {{
              "@type": "Question",
              "name": "Where are EggCelle's {state} locations?",
              "acceptedAnswer": {{
                "@type": "Answer",
                "text": "EggCelle partners with {partner} in {clinic} and accepts donor applicants from across {state} including {others_text}, and surrounding areas."
              }}
            }},
            {{
              "@type": "Question",
              "name": "How long does the egg donation process take?",
              "acceptedAnswer": {{
                "@type": "Answer",
                "text": "From application to retrieval, the process typically takes 2-3 months. The active medication cycle itself lasts about 10-12 days, with the egg retrieval procedure completed in under 30 minutes."
              }}
            }}
          ]
        }}
      ]
    }}
    </script>

{HEAD_TRACKING}

{STYLE}
</head>"""

    body = f"""<body>
    <div class="top-bar">
        Now accepting applicants from {primary_amp} &middot; <a href="tel:{d['phone_tel']}">Call {d['phone_display']}</a>
    </div>

    <header>
        <div class="container header-inner">
            <a href="#top" class="logo">Egg<span>Celle</span></a>
            <a href="{PRESCREEN}" class="header-cta js-prescreen">Apply Now</a>
        </div>
    </header>

    <section class="hero" id="top">
        <div class="container hero-grid">
            <div>
                <span class="hero-eyebrow">{state} Egg Donor Program</span>
                <h1>Become an Egg Donor in <strong>{state}</strong> &mdash; Earn Up to <strong>$10,000</strong> Per Cycle</h1>
                <p class="lead">EggCelle connects qualified donors in {primary_and} with intended parents who need help building their families. Generous compensation. Expert medical care. Real impact.</p>

                <div class="hero-stats">
                    <div class="hero-stat">
                        <span class="num">Up to $10K</span>
                        <span class="lbl">Per completed cycle</span>
                    </div>
                    <div class="hero-stat">
                        <span class="num">21&ndash;30</span>
                        <span class="lbl">Donor age range</span>
                    </div>
                    <div class="hero-stat">
                        <span class="num">2&ndash;3 mo.</span>
                        <span class="lbl">From apply to retrieval</span>
                    </div>
                </div>

                <a href="{PRESCREEN}" class="btn-primary js-prescreen">Start My Application &rarr;</a>
                <a href="#process" class="btn-secondary">How It Works</a>

                <div class="trust-row">
                    <span><span class="check">&check;</span> 100% confidential</span>
                    <span><span class="check">&check;</span> All medical costs covered</span>
                    <span><span class="check">&check;</span> Travel reimbursed</span>
                    <span><span class="check">&check;</span> Partner: {partner}</span>
                </div>
            </div>

            <div class="cta-card" id="apply">
                <span class="cta-eyebrow">Donor Prescreen Application</span>
                <h2>See if you qualify in 5 minutes.</h2>
                <p class="cta-sub">Complete EggCelle&rsquo;s secure donor prescreen application to find out if you&rsquo;re a match for our {state} program.</p>
                <ul class="cta-benefits">
                    <li><span class="check">&check;</span> Quick &mdash; about 5 minutes to complete</li>
                    <li><span class="check">&check;</span> 100% confidential and HIPAA-secure</li>
                    <li><span class="check">&check;</span> Get a response within 1&ndash;2 business days</li>
                    <li><span class="check">&check;</span> No cost or obligation to apply</li>
                </ul>
                <a href="{PRESCREEN}" class="btn-primary js-prescreen">Start Prescreen Application &rarr;</a>
                <p class="cta-disclaimer">You&rsquo;ll be redirected to EggCelle&rsquo;s secure donor portal at <strong>eggdonorconnect.com</strong>.</p>
            </div>
        </div>
    </section>

    <section class="block">
        <div class="container">
            <div class="section-head">
                <h2>Why Donors Choose EggCelle</h2>
                <p>Generous compensation is just the start. Our {state} donors get a guided, compassionate experience from day one.</p>
            </div>
            <div class="grid-3">
                <div class="card">
                    <div class="icon">$</div>
                    <h3>Up to $10,000 per cycle</h3>
                    <p>Among the highest egg donor compensation packages in {state}, paid promptly after retrieval.</p>
                </div>
                <div class="card">
                    <div class="icon">+</div>
                    <h3>Top-tier medical care</h3>
                    <p>You&rsquo;ll be cared for by board-certified reproductive endocrinologists at {partner}.</p>
                </div>
                <div class="card">
                    <div class="icon">&hearts;</div>
                    <h3>A meaningful impact</h3>
                    <p>Help intended parents who&rsquo;ve struggled with infertility experience the joy of building a family.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="block alt" id="compensation">
        <div class="container comp-grid">
            <div class="comp-text">
                <h2>How Much Do Egg Donors Get Paid in {state}?</h2>
                <p>EggCelle donors receive transparent, generous compensation. Every penny of your medical care, screening, medications, and travel is covered &mdash; on top of your cycle payment.</p>
                <a href="{PRESCREEN}" class="btn-primary js-prescreen">See If I Qualify</a>
            </div>
            <div class="comp-table" aria-label="Compensation breakdown">
                <div class="comp-row"><span>Base compensation (first cycle)</span><span class="v">$8,000</span></div>
                <div class="comp-row"><span>Repeat-donor bonus</span><span class="v">+ $1,000&ndash;$2,000</span></div>
                <div class="comp-row"><span>Medical screening &amp; medications</span><span class="v">100% covered</span></div>
                <div class="comp-row"><span>Travel &amp; lodging</span><span class="v">Reimbursed</span></div>
                <div class="comp-row"><span>Total potential per cycle</span><span class="v">Up to $10,000</span></div>
            </div>
        </div>
    </section>

    <section class="block" id="eligibility">
        <div class="container">
            <div class="section-head">
                <h2>Who Can Become an Egg Donor?</h2>
                <p>If you&rsquo;re a healthy woman in {state} between 21 and 30, you may already qualify.</p>
            </div>
            <ul class="checklist">
                <li><span class="badge">&check;</span> Age 21&ndash;30 with regular menstrual cycles</li>
                <li><span class="badge">&check;</span> BMI under 28</li>
                <li><span class="badge">&check;</span> Non-smoker, no recreational drug use</li>
                <li><span class="badge">&check;</span> No reproductive disorders or genetic conditions</li>
                <li><span class="badge">&check;</span> Willing to complete medical &amp; psychological screening</li>
                <li><span class="badge">&check;</span> Able to attend appointments in or near {clinic}, {abbr}</li>
                <li><span class="badge">&check;</span> Reliable, on-time, and committed to the process</li>
                <li><span class="badge">&check;</span> U.S. citizen or permanent resident</li>
            </ul>
            <div style="text-align:center; margin-top: 36px;">
                <a href="{PRESCREEN}" class="btn-primary js-prescreen">I Meet the Requirements &mdash; Apply Now</a>
            </div>
        </div>
    </section>

    <section class="block alt" id="process">
        <div class="container">
            <div class="section-head">
                <h2>How the Egg Donation Process Works</h2>
                <p>From application to retrieval typically takes 2&ndash;3 months. Here&rsquo;s what you can expect.</p>
            </div>
            <div class="steps">
                <div class="step">
                    <h4>Apply Online</h4>
                    <p>Complete the short form. We&rsquo;ll follow up within 24 hours to schedule your initial consult.</p>
                </div>
                <div class="step">
                    <h4>Medical Screening</h4>
                    <p>Comprehensive health, genetic, and psychological evaluation &mdash; fully paid for by EggCelle.</p>
                </div>
                <div class="step">
                    <h4>Cycle &amp; Monitoring</h4>
                    <p>Follow your personalized medication protocol with regular monitoring at our {clinic} clinic.</p>
                </div>
                <div class="step">
                    <h4>Retrieval &amp; Payment</h4>
                    <p>Egg retrieval is a 20-minute outpatient procedure. Compensation is paid promptly after.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="block">
        <div class="container">
            <div class="section-head">
                <h2>Now Recruiting Donors Across {state}</h2>
                <p>Our {clinic} clinic partners with donors from across the state. Travel to appointments is fully reimbursed.</p>
            </div>
            <div class="cities">
                {city_chips}
            </div>
            <p class="cities-note">Don&rsquo;t see your city? We accept donor applications from anywhere in {state}.</p>
        </div>
    </section>

    <section class="block alt">
        <div class="container">
            <div class="testimonial">
                <blockquote>
                    &ldquo;The team at EggCelle made me feel supported every step of the way. Knowing I helped a family in {state} is something I&rsquo;ll carry with me forever &mdash; and the compensation made a real difference for me, too.&rdquo;
                </blockquote>
                <div class="who">
                    {d['testimonial_name']}
                    <span>EggCelle Donor &middot; {d['testimonial_city']}</span>
                </div>
            </div>
        </div>
    </section>

    <section class="block" id="faq">
        <div class="container">
            <div class="section-head">
                <h2>Frequently Asked Questions</h2>
                <p>Quick answers to the questions women in {state} ask us most.</p>
            </div>
            <div class="faq">
                <details open>
                    <summary>How much do egg donors get paid in {state}?</summary>
                    <p>Qualified EggCelle donors in {abbr} earn up to <strong>$10,000 per completed cycle</strong>, including a base payment of $8,000 and bonuses for repeat donations. All medical screening, medications, and travel are covered separately.</p>
                </details>
                <details>
                    <summary>How long does the egg donation process take?</summary>
                    <p>From application to retrieval, the full process takes about <strong>2&ndash;3 months</strong>. The active medication portion lasts 10&ndash;12 days, and the retrieval procedure itself is completed in under 30 minutes.</p>
                </details>
                <details>
                    <summary>Is egg donation safe?</summary>
                    <p>Yes. Egg donation is a well-established medical procedure. Our partner clinic, {partner}, is led by board-certified reproductive endocrinologists who follow ASRM safety guidelines. You&rsquo;ll be monitored closely throughout your cycle.</p>
                </details>
                <details>
                    <summary>Will my egg donation be confidential?</summary>
                    <p>Absolutely. Your identity is protected throughout the process, and donor information is shared only as agreed upon in your contract. Most donations are anonymous.</p>
                </details>
                <details>
                    <summary>Where are the appointments held?</summary>
                    <p>All medical appointments take place at our partner clinic in {clinic}, {abbr}. We reimburse travel from anywhere in {state}, and lodging is provided when needed.</p>
                </details>
                <details>
                    <summary>Will donating affect my future fertility?</summary>
                    <p>No. Research shows that egg donation does not reduce a donor&rsquo;s natural egg supply or future fertility. Each month your body naturally selects multiple eggs &mdash; donation simply rescues eggs that would otherwise be reabsorbed.</p>
                </details>
            </div>
        </div>
    </section>

    <section class="final-cta">
        <div class="container">
            <h2>Ready to Help Build a Family in {state}?</h2>
            <p>Applications take less than 2 minutes. Our team will be in touch within 24 hours to walk you through next steps.</p>
            <a href="{PRESCREEN}" class="btn-primary js-prescreen">Apply Now &rarr;</a>
        </div>
    </section>

    <footer>
        <div class="container footer-inner">
            <div>&copy; 2026 EggCelle Donor Program. {state} program in partnership with {partner}.</div>
            <div class="footer-links">
                <a href="/privacy">Privacy</a>
                <a href="/terms">Terms</a>
                <a href="tel:{d['phone_tel']}">{d['phone_display']}</a>
            </div>
        </div>
    </footer>

    <div class="mobile-cta">
        <a href="{PRESCREEN}" class="btn-primary js-prescreen">Apply Now &mdash; Up to $10K</a>
    </div>

    {FORWARD_SCRIPT}
</body>
</html>
"""
    return head + "\n" + body


for d in LOCATIONS:
    out_dir = os.path.join(BASE, d["slug"])
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(build_page(d))
    print(f"wrote {d['slug']}/index.html  ({d['state']} - {d['partner']})")

print("done")
