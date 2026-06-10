# -*- coding: utf-8 -*-
"""Shared templates + build logic for the SpringCreek redesign (core 12)."""
import os, re, json

OUT = "/home/user/test/springcreek-redesign"

NAP = {
    "dayton":   ("Dayton Fertility Center", "7095 Clyo Road", "Dayton (Centerville), OH 45459", "(937) 458-5084", "+19374585084", "Mon–Fri, 7:00 AM–4:00 PM"),
    "columbus": ("Columbus Fertility Center", "6760 Avery-Muirfield Drive, Suite A", "Dublin, OH 43016", "(614) 401-4113", "+16144014113", "Mon–Fri — call to confirm"),
    "cincinnati":("Cincinnati Fertility Center", "9313 Mason Montgomery Road", "Mason, OH 45040", "(513) 457-5200", "+15134575200", "Mon–Fri — call to confirm"),
}

# (label, href) — relative for built pages, absolute live URL for not-yet-built
def L(slug_or_url, label):
    return (label, slug_or_url)

NAV = [
    ("Treatments", "fertility-treatment.html", [
        ("__hdr__", "Popular treatments"),
        ("ivf-icsi.html", "IVF &amp; ICSI"),
        ("egg-freezing.html", "Egg Freezing"),
        ("https://www.springcreekfertility.com/iui/", "IUI (Intrauterine Insemination)"),
        ("https://www.springcreekfertility.com/fertility-preservation/", "Fertility Preservation"),
        ("https://www.springcreekfertility.com/pgt/", "Preimplantation Genetic Testing (PGT)"),
        ("https://www.springcreekfertility.com/donor-egg/", "Donor Egg Program"),
        ("lgbtqia-family-building.html", "LGBTQIA+ Family Building"),
        ("https://www.springcreekfertility.com/ivf-laboratory/", "Our IVF Laboratory"),
        ("https://www.springcreekfertility.com/fertility-treatment/", "All treatment options &rarr;"),
    ]),
    ("Locations", "dayton-fertility-center.html", [
        ("dayton-fertility-center.html", "Dayton (Centerville)"),
        ("columbus-fertility-center.html", "Columbus (Dublin)"),
        ("cincinnati-fertility-center.html", "Cincinnati (Mason)"),
    ]),
    ("About", "about.html", [
        ("about.html", "About SpringCreek"),
        ("fertility-specialists.html", "Meet Our Team"),
        ("https://www.springcreekfertility.com/doctor-jeremy-groll/", "Dr. Jeremy Groll, MD"),
        ("https://www.springcreekfertility.com/dr-kasey-marelic/", "Dr. Kasey Reynolds Marelić, MD"),
        ("https://www.springcreekfertility.com/our-fertility-center/", "Our Fertility Center"),
        ("https://www.springcreekfertility.com/tour/", "Take a Tour"),
    ]),
    ("Patients", "https://www.springcreekfertility.com/new-patient-resources/", [
        ("https://www.springcreekfertility.com/new-patient-resources/", "New Patient Resources"),
        ("https://www.springcreekfertility.com/fertility-faqs/", "Fertility FAQs"),
        ("https://www.springcreekfertility.com/fertility-library/", "Fertility Library"),
        ("https://www.springcreekfertility.com/understanding-insurance-benefits/", "Insurance Benefits"),
        ("https://www.springcreekfertility.com/patient-portal/", "Patient Portal"),
    ]),
    ("Cost &amp; Financing", "financing-options.html", None),
    ("Contact", "contact.html", None),
]

SOCIAL = [
    ("https://www.facebook.com/SpringCreekFertility", "Facebook"),
    ("https://www.instagram.com/springcreek_fertility/", "Instagram"),
    ("https://www.linkedin.com/company/springcreek-fertility", "LinkedIn"),
    ("https://www.youtube.com/channel/UC9j44LjwMOgALcv6LyLtv9A", "YouTube"),
]

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
 '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
 '    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet">')

def nav_html(active):
    items = []
    for label, href, sub in NAV:
        cls = "scf-nav__item" + (" scf-nav__item--has" if sub else "")
        link = f'<a class="scf-nav__link" href="{href}">{label}</a>'
        menu = ""
        if sub:
            rows = []
            for h, t in sub:
                if h == "__hdr__":
                    rows.append(f"<strong>{t}</strong>")
                else:
                    rows.append(f'<a href="{h}">{t}</a>')
            menu = '<div class="scf-menu">' + "".join(rows) + "</div>"
        items.append(f'<div class="{cls}">{link}{menu}</div>')
    return "\n          ".join(items)

def header_html(active):
    return f'''<a class="scf-skip" href="#scf-main">Skip to content</a>
  <div class="scf-anns">Now welcoming new patients across Dayton, Columbus &amp; Cincinnati &middot; <a href="appointment.html">Request an appointment</a></div>
  <header class="scf-header">
    <div class="scf-header__bar">
      <a class="scf-logo" href="index.html">Spring<span>Creek</span> Fertility<small>Reproductive Medicine &middot; Ohio</small></a>
      <input class="scf-navtoggle" type="checkbox" id="scf-navtoggle" aria-hidden="true">
      <label class="scf-navtoggle-lbl" for="scf-navtoggle" aria-label="Toggle menu">&#9776;</label>
      <nav class="scf-nav" aria-label="Primary">
          {nav_html(active)}
      </nav>
      <a class="scf-header__cta" href="appointment.html">Request an Appointment</a>
    </div>
  </header>'''

def footer_html():
    soc = " ".join(f'<a href="{u}" rel="noopener">{n}</a>' for u, n in SOCIAL)
    locs = ""
    for k in ("dayton", "columbus", "cincinnati"):
        n, s1, s2, ph, tel, hrs = NAP[k]
        locs += f'<li><strong style="color:#fff">{n}</strong><br>{s1}, {s2}<br><a href="tel:{tel}">{ph}</a></li>'
    return f'''<footer class="scf-footer">
    <div class="scf-footer__top">
      <div class="scf-footer__brand">
        <a class="scf-logo" href="index.html">Spring<span>Creek</span> Fertility</a>
        <p>Independent, patient-centered fertility care for individuals and families across the Dayton, Columbus, and Cincinnati metros in Ohio. Caring for Ohio families since 2014.</p>
        <p class="scf-footer__social">{soc}</p>
      </div>
      <div>
        <h4>Treatments</h4>
        <ul>
          <li><a href="ivf-icsi.html">IVF &amp; ICSI</a></li>
          <li><a href="egg-freezing.html">Egg Freezing</a></li>
          <li><a href="https://www.springcreekfertility.com/iui/">IUI</a></li>
          <li><a href="lgbtqia-family-building.html">LGBTQIA+ Family Building</a></li>
          <li><a href="https://www.springcreekfertility.com/fertility-treatment/">All Treatments</a></li>
        </ul>
      </div>
      <div>
        <h4>Our Practice</h4>
        <ul>
          <li><a href="about.html">About SpringCreek</a></li>
          <li><a href="fertility-specialists.html">Meet Our Team</a></li>
          <li><a href="financing-options.html">Cost &amp; Financing</a></li>
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="appointment.html">Request an Appointment</a></li>
        </ul>
      </div>
      <div>
        <h4>Locations</h4>
        <ul>{locs}</ul>
      </div>
    </div>
    <div class="scf-footer__bottom">
      <div class="scf-footer__bottom-in">
        <span>&copy; 2026 SpringCreek Fertility. All rights reserved. This site is for general education and is not medical advice.</span>
        <span><a href="https://www.springcreekfertility.com/privacy-policy/">Privacy Policy</a> &middot; <a href="https://www.springcreekfertility.com/understanding-insurance-benefits/">Insurance</a> &middot; <a href="https://www.springcreekfertility.com/careers/">Careers</a></span>
      </div>
    </div>
  </footer>'''

def hero_html(p):
    variant = " scf-hero--" + p["hero_variant"] if p.get("hero_variant") else ""
    crumbs = ""
    if p.get("breadcrumb"):
        parts = []
        for label, href in p["breadcrumb"]:
            parts.append(f'<a href="{href}">{label}</a>' if href else f'<span class="scf-crumb-cur">{label}</span>')
        crumbs = '<nav class="scf-breadcrumb" aria-label="Breadcrumb">' + '<span>/</span>'.join(parts) + '</nav>'
    ctas = ""
    if p.get("hero_ctas"):
        btns = "".join(f'<a class="{c}" href="{h}">{t}</a>' for t, h, c in p["hero_ctas"])
        ctas = f'<div class="scf-btn-row">{btns}</div>'
    eyebrow = f'<span class="scf-eyebrow">{p["hero_eyebrow"]}</span>' if p.get("hero_eyebrow") else ""
    return f'''<section class="scf-hero{variant}" aria-label="Page introduction">
      <div class="scf-container">
        <div class="scf-hero__inner">
          {crumbs}
          {eyebrow}
          <h1>{p["hero_h1"]}</h1>
          <p class="scf-hero__sub">{p["hero_sub"]}</p>
          {ctas}
        </div>
      </div>
    </section>'''

def cta_html(p):
    c = p.get("cta")
    if not c:
        return ""
    btns = "".join(f'<a class="{cls}" href="{h}">{t}</a>' for t, h, cls in c["buttons"])
    return f'''<section class="scf-cta" aria-label="Get started">
      <div class="scf-container">
        <h2>{c["h2"]}</h2>
        <p>{c["p"]}</p>
        <div class="scf-btn-row" style="justify-content:center">{btns}</div>
      </div>
    </section>'''

def jsonld_block(p):
    data = p["jsonld"]
    s = json.dumps(data, indent=2, ensure_ascii=False) if not isinstance(data, str) else data
    verify = ""
    if p.get("verify"):
        verify = "\n    <!-- // VERIFY before deploy:\n" + "\n".join("         - " + v for v in p["verify"]) + "\n         (JSON-LD cannot hold // comments; flags live here.) -->"
    return f'{verify}\n    <script type="application/ld+json">\n{s}\n    </script>'

def standalone(p):
    canon = p["url"]
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{p["title"]}</title>
    <meta name="description" content="{p["meta_desc"]}">
    <link rel="canonical" href="{canon}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{p["title"]}">
    <meta property="og:description" content="{p["meta_desc"]}">
    <meta property="og:url" content="{canon}">
    <meta property="og:site_name" content="SpringCreek Fertility">
    {FONTS}
    <link rel="stylesheet" href="assets/css/scf-site.css">
    <link rel="stylesheet" href="assets/css/scf-components.css">{jsonld_block(p)}
</head>
<body>
  {header_html(p.get("nav_active"))}
  <main id="scf-main" class="scf-page">
    {hero_html(p)}
    {p["main_html"]}
    {cta_html(p)}
  </main>
  {footer_html()}
</body>
</html>
'''

def elementor(p):
    note = (f"<!-- =====================================================================\n"
            f"   SpringCreek Fertility — Elementor paste block: {p['title']}\n"
            f"   URL: {p['url']}\n"
            f"   HOW TO USE:\n"
            f"   1) One-time: add elementor/_shared-scf-css.html (the scoped component\n"
            f"      CSS) once via Elementor > Site Settings > Custom CSS (or a global\n"
            f"      HTML block). Do NOT add scf-site.css (theme owns header/footer).\n"
            f"   2) Paste the JSON-LD <script> into this page's <head> (SEO plugin or\n"
            f"      Elementor Custom Code, location: <head>).\n"
            f"   3) Paste the markup below into an Elementor HTML widget.\n"
            f"   No JavaScript is used except the JSON-LD block.\n"
            f"   ===================================================================== -->")
    return f'''{note}
{jsonld_block(p).strip()}

<div class="scf-page scf-page--{p["slug"]}">
{hero_html(p)}
{p["main_html"]}
{cta_html(p)}
</div>
'''

def write(p):
    fn = "index" if p["slug"] == "home" else p["slug"]
    with open(os.path.join(OUT, fn + ".html"), "w", encoding="utf-8") as f:
        f.write(standalone(p))
    with open(os.path.join(OUT, "elementor", (fn if p["slug"]!="home" else "home") + ".html"), "w", encoding="utf-8") as f:
        f.write(elementor(p))

def wordcount(p):
    body = p["main_html"] + " " + p.get("hero_sub","") + " " + p["hero_h1"]
    body = re.sub(r"<[^>]+>", " ", body); body = re.sub(r"&[a-zA-Z0-9#]+;", " ", body)
    return len(re.findall(r"[A-Za-z0-9’'%+-]+", body))
