# -*- coding: utf-8 -*-
"""Brand v2 integration: transform attached pages to the SpringCreek Global CSS
(Lora/Work Sans, navy/green via --e-global-color-*, zero teal) and emit
standalone + Elementor versions. Builds a matching Dayton page."""
import os, re, sys
sys.path.insert(0, "/tmp/scfbuild")
import common
OUT = common.OUT
U = "/root/.claude/uploads/04efc728-1fd9-5ca3-b7e8-b632ed4b3040"

# ---------- token transforms ----------
SCL_TOKENS = [
 ('var(--scf-navy,#183356)', 'var(--e-global-color-primary,#183356)'),
 ('var(--scf-navy-dark,#0f2238)', 'var(--e-global-color-bb34028,#0B1722)'),
 ('var(--scf-blue-soft,#A7D8F1)', 'var(--e-global-color-secondary,#A7D8F1)'),
 ('var(--scf-blue,#60B9E5)', 'var(--e-global-color-126eaba,#60B9E5)'),
 ('var(--scf-green,#90C962)', 'var(--e-global-color-accent,#90C962)'),
 ('var(--scf-green-pale,#E7FFB9)', 'var(--e-global-color-bb9718b,#E7FFB9)'),
 ('var(--scf-green-mint,#E9FFDB)', 'var(--e-global-color-1d0b13d,#E9FFDB)'),
 ('var(--scf-ink,#2D2D2D)', 'var(--e-global-color-text,#2D2D2D)'),
 ('var(--scf-cream,#FCF9F0)', 'var(--e-global-color-dbe2b42,#FCF9F0)'),
 ('var(--scf-gray-300,#d8dee0)', 'var(--e-global-color-b86a1f1,#E7EBED)'),
 ('var(--scf-font-display,"Playfair Display",Georgia,"Times New Roman",serif)',
  'var(--e-global-typography-primary-font-family,"Lora"),Georgia,"Times New Roman",serif'),
 ('var(--scf-font-body,"Open Sans","Poppins",system-ui,-apple-system,Segoe UI,Roboto,sans-serif)',
  'var(--e-global-typography-text-font-family,"Work Sans"),system-ui,-apple-system,Segoe UI,Roboto,sans-serif'),
 ('var(--scf-font-ui,"Poppins","Open Sans",system-ui,sans-serif)',
  'var(--e-global-typography-accent-font-family,"Work Sans"),system-ui,sans-serif'),
]
SOFTEN = [
 ("A leading Cincinnati IVF clinic experience", "An advanced Cincinnati IVF experience"),
 ("Where leading-edge science meets genuine compassion", "Where advanced science meets genuine compassion"),
 ("Leading-edge reproductive technology and embryology", "Advanced reproductive technology and embryology"),
 ("leading vitrification", "advanced vitrification"),
]

def transform_scl(html):
    for a, b in SCL_TOKENS:
        html = html.replace(a, b)
    for a, b in SOFTEN:
        html = html.replace(a, b)
    return html

HP_TOKENS = [
 ('--teal: var(--scf-teal, #007f8b);', '--brand: var(--e-global-color-primary, #183356);'),
 ('--teal-dark: var(--scf-teal-dark, #00616b);', '--brand-ink: var(--e-global-color-f33a19d, #122333);'),
 ('--teal-light: var(--scf-teal-light, #e8f6f7);', '--brand-tint: var(--e-global-color-1d0b13d, #E9FFDB);'),
 ('--blue: var(--scf-blue, #60b9e5);', '--blue: var(--e-global-color-126eaba, #60B9E5);'),
 ('--blue-soft: var(--scf-blue-soft, #a7d8f1);', '--blue-soft: var(--e-global-color-secondary, #A7D8F1);'),
 ('--navy: var(--scf-navy, #2d3436);', '--ink: var(--e-global-color-text, #2D2D2D);'),
 ('--cream: var(--scf-cream, #fcf9f0);', '--cream: var(--e-global-color-dbe2b42, #FCF9F0);'),
 ('--cream-soft: var(--scf-cream-soft, #fdfbf7);', '--cream-soft: var(--scf-cream-soft, #FDFBF7);'),
 ('--line: var(--scf-gray-300, #d8dee0);', '--line: var(--e-global-color-b86a1f1, #E7EBED);'),
 ('--font-display: var(--scf-font-display, "Playfair Display", Georgia, serif);',
  '--font-display: var(--e-global-typography-primary-font-family, "Lora"), Georgia, serif;'),
 ('--font-body: var(--scf-font-body, "Open Sans", system-ui, sans-serif);',
  '--font-body: var(--e-global-typography-text-font-family, "Work Sans"), system-ui, sans-serif;'),
 ('--font-ui: var(--scf-font-ui, "Poppins", "Open Sans", system-ui, sans-serif);',
  '--font-ui: var(--e-global-typography-accent-font-family, "Work Sans"), system-ui, sans-serif;'),
 ('color: var(--navy);', 'color: var(--ink);'),
]
HP_FONT_LINK_OLD = re.compile(r'<link\s+href="https://fonts\.googleapis\.com/css2\?family=Open\+Sans[^"]*"\s+rel="stylesheet"\s*/>', re.S)
HP_FONT_LINK_NEW = ('<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500'
                    '&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet" />')
HP_OVERRIDE = """
  /* ---- Brand alignment: Global CSS tokens, green CTAs, accessible inline links ---- */
  .scf-home .scf-btn { background: var(--e-global-color-accent,#90C962); border-color: var(--e-global-color-accent,#90C962); color: var(--e-global-color-primary,#183356); }
  .scf-home .scf-btn:hover { background:#6fa844; border-color:#6fa844; color:#fff; }
  .scf-home .scf-btn--outline { background:transparent; color:var(--e-global-color-primary,#183356); border-color:var(--e-global-color-primary,#183356); }
  .scf-home .scf-btn--outline:hover { background:var(--brand-tint); color:var(--e-global-color-primary,#183356); }
  .scf-home .scf-btn--white { background:#fff; color:var(--e-global-color-primary,#183356); border-color:#fff; }
  .scf-home .scf-btn--ghost { background:transparent; color:#fff; border-color:rgba(255,255,255,.7); }
  .scf-home :is(p,li) a { color:var(--e-global-color-primary,#183356); text-decoration:underline; text-decoration-color:var(--e-global-color-accent,#90C962); text-decoration-thickness:2px; text-underline-offset:3px; }
"""

def transform_homepage(html):
    for a, b in HP_TOKENS:
        html = html.replace(a, b)
    # ordered usage renames
    html = html.replace('var(--teal-dark)', 'var(--brand-ink)')
    html = html.replace('var(--teal-light)', 'var(--brand-tint)')
    html = html.replace('var(--teal)', 'var(--brand)')
    html = html.replace('var(--navy)', 'var(--ink)')
    # teal-derived shadows -> navy
    html = html.replace('rgba(0, 97, 107,', 'rgba(24, 51, 86,').replace('rgba(0,97,107,', 'rgba(24,51,86,')
    # normalize root-relative links to canonical absolute (correct on live; localized for standalone)
    html = html.replace('href="/ivf"', 'href="https://www.springcreekfertility.com/ivf-icsi/"')
    html = html.replace('href="/contact"', 'href="https://www.springcreekfertility.com/contact/"')
    # fonts link
    html = HP_FONT_LINK_OLD.sub(HP_FONT_LINK_NEW, html)
    # CTA + link override
    html = html.replace('</style>', HP_OVERRIDE + '</style>', 1)
    return html

# ---------- link localization for standalone navigability ----------
REL = {'': 'index.html', 'appointment/': 'appointment.html', 'contact/': 'contact.html',
 'locations/': 'locations.html', 'dayton-fertility-center/': 'dayton-fertility-center.html',
 'columbus-fertility-center/': 'columbus-fertility-center.html',
 'cincinnati-fertility-center/': 'cincinnati-fertility-center.html',
 'fertility-treatment/': 'fertility-treatment.html', 'egg-freezing/': 'egg-freezing.html',
 'ivf-icsi/': 'ivf-icsi.html', 'lgbtqia-family-building/': 'lgbtqia-family-building.html',
 'financing-options/': 'financing-options.html', 'fertility-specialists/': 'fertility-specialists.html',
 'about/': 'about.html'}
def localize(html):
    def repl(m):
        path = m.group(1)
        return f'href="{REL[path]}"' if path in REL else m.group(0)
    return re.sub(r'href="https://www\.springcreekfertility\.com/([^"#]*)"', repl, html)

def meta_from_comment(html, key):
    m = re.search(key + r':\s*(.+)', html)
    return m.group(1).strip() if m else ""

# ---------- standalone wrapper ----------
def standalone(title, desc, canonical, block):
    block = localize(block)
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{desc}">
    <link rel="canonical" href="{canonical}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{desc}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:site_name" content="SpringCreek Fertility">
    {common.FONTS}
    <link rel="stylesheet" href="assets/css/scf-site.css">
</head>
<body>
  {common.header_html(None)}
  <main id="scf-main">
{block}
  </main>
  {common.footer_html()}
</body>
</html>
'''

def elementor_wrap(title, url, block):
    note = (f"<!-- =====================================================================\n"
            f"   SpringCreek Fertility — Elementor paste block (Brand v2): {title}\n"
            f"   URL: {url}\n"
            f"   CSS bridged to the SpringCreek Global CSS (elementor-kit-7):\n"
            f"   navy #183356 / green #90C962 / blue #A7D8F1 via --e-global-color-*,\n"
            f"   Lora headings + Work Sans body; navy/green/blue only. Self-contained block.\n"
            f"   Paste into an Elementor HTML widget. JSON-LD is inside the block.\n"
            f"   ===================================================================== -->\n")
    return note + block + "\n"

def write_pair(slug, title, desc, canonical, block):
    fn = "index" if slug == "home" else slug
    open(os.path.join(OUT, fn + ".html"), "w", encoding="utf-8").write(standalone(title, desc, canonical, block))
    open(os.path.join(OUT, "elementor", ("home" if slug == "home" else slug) + ".html"), "w", encoding="utf-8").write(elementor_wrap(title, canonical, block))

# ===================== HOMEPAGE =====================
hp = open(f"{U}/bcdc2235-homepagebody.elementor.html", encoding="utf-8").read()
hp = transform_homepage(hp)
write_pair("home", "Fertility Care in Dayton, Columbus &amp; Cincinnati | SpringCreek Fertility",
           "SpringCreek Fertility offers personalized, inclusive fertility care across Dayton, Columbus &amp; Cincinnati, Ohio — IVF, IUI, egg freezing, and donor programs with an on-site IVF laboratory.",
           "https://www.springcreekfertility.com/", hp)

# ===================== LOCATIONS HUB =====================
hub = transform_scl(open(f"{U}/c01fafa7-locationshub_1.html", encoding="utf-8").read())
write_pair("locations", "Our Locations | Fertility Clinics in Dayton, Columbus &amp; Cincinnati | SpringCreek",
           "SpringCreek Fertility has fertility clinics in Dayton, Columbus (Dublin) &amp; Cincinnati (Mason), Ohio. Find IVF, IUI &amp; egg freezing near you.",
           "https://www.springcreekfertility.com/locations/", hub)

# ===================== COLUMBUS =====================
col = transform_scl(open(f"{U}/75dbf230-columbusfertilitycenter_1.html", encoding="utf-8").read())
write_pair("columbus-fertility-center", "Columbus Fertility Specialists | IVF &amp; IUI Near Columbus | SpringCreek",
           "Columbus fertility specialists in Dublin, OH. IVF, IUI &amp; egg freezing from board-certified physicians. Fertility treatment near Columbus — (614) 401-4113.",
           "https://www.springcreekfertility.com/columbus-fertility-center/", col)

# ===================== CINCINNATI =====================
cin = transform_scl(open(f"{U}/3aa2629c-cincinnatifertilitycenter_1.html", encoding="utf-8").read())
write_pair("cincinnati-fertility-center", "Cincinnati IVF Clinic | Fertility &amp; Infertility Support | SpringCreek",
           "Cincinnati IVF clinic in Mason, OH. IVF, IUI, egg freezing &amp; compassionate infertility support from board-certified physicians. (513) 457-5200.",
           "https://www.springcreekfertility.com/cincinnati-fertility-center/", cin)

print("Homepage + hub + Columbus + Cincinnati written (standalone + elementor).")
# Dayton is written by build_v2_dayton.py (imports the shared transformed .scl style)
open("/tmp/scfbuild/_columbus_transformed.html", "w", encoding="utf-8").write(col)
print("Saved transformed Columbus for Dayton style reuse.")
