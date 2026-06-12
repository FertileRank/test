# -*- coding: utf-8 -*-
"""Reorganize the flat SpringCreek site into an authority pillar/cluster
architecture: topic folders, each containing a single index.html, with clean
hierarchical URLs, corrected relative internal links, hierarchical canonicals
and JSON-LD, an .htaccess 301 map, and a sitemap."""
import os, re, shutil, posixpath

SRC = "/home/user/test/springcreek-redesign"
DST = "/home/user/test/springcreek-authority"
BASE = "https://www.springcreekfertility.com"

# source file basename (flat slug)  ->  new hierarchical path ("" = root/home)
PATHMAP = {
 "index": "",
 # Treatments pillar
 "fertility-treatment": "treatments",
 "ivf-icsi": "treatments/ivf-icsi", "iui": "treatments/iui",
 "egg-freezing": "treatments/egg-freezing", "fertility-preservation": "treatments/fertility-preservation",
 "pgt": "treatments/pgt", "donor-egg": "treatments/donor-egg",
 "donor-sperm-banks": "treatments/donor-sperm", "embryo-donation": "treatments/embryo-donation",
 "gestational-surrogacy-carrier": "treatments/gestational-surrogacy",
 "third-party-reproduction": "treatments/third-party-reproduction",
 "recurrent-miscarriage": "treatments/recurrent-miscarriage",
 "lgbtqia-family-building": "treatments/lgbtqia-family-building",
 "ivf-laboratory": "treatments/ivf-laboratory",
 # Locations pillar
 "locations": "locations", "dayton-fertility-center": "locations/dayton",
 "columbus-fertility-center": "locations/columbus", "cincinnati-fertility-center": "locations/cincinnati",
 # About pillar (+ Team sub-pillar)
 "about": "about", "fertility-specialists": "about/team",
 "doctor-jeremy-groll": "about/team/jeremy-groll", "dr-kasey-marelic": "about/team/kasey-marelic",
 "jennifer-graves-herring-hcld": "about/team/jennifer-graves-herring",
 "emily-mcmillan-whnp": "about/team/emily-mcmillan",
 "julie-cuy-castellanos-whnp-bc": "about/team/julie-cuy-castellanos",
 "our-fertility-center": "about/our-fertility-center", "specialist": "about/fertility-specialist",
 "tour": "about/tour", "testimonials": "about/testimonials",
 # Cost & Financing pillar
 "financing-options": "cost-and-financing", "fertility-cost": "cost-and-financing/treatment-cost",
 "understanding-insurance-benefits": "cost-and-financing/insurance-benefits",
 "discount-programs": "cost-and-financing/discount-programs",
 "refund-programs": "cost-and-financing/refund-programs",
 # Fertility Library pillar
 "fertility-library": "fertility-library",
 "infertility-defined": "fertility-library/infertility-defined",
 "what-causes-infertility": "fertility-library/what-causes-infertility",
 "quick-facts-about-infertility": "fertility-library/quick-facts",
 "myths-about-fertility-diagnosis": "fertility-library/myths",
 "acronym-abbreviation-guide": "fertility-library/acronym-guide",
 "fertility-faqs": "fertility-library/fertility-faqs",
 "tips-for-getting-pregnant-faster": "fertility-library/getting-pregnant-faster",
 "tips-to-optimize-fertility": "fertility-library/optimize-fertility",
 "fertility-foods": "fertility-library/fertility-foods",
 "ivf-success-rates": "fertility-library/ivf-success-rates",
 # Patient Resources pillar
 "patient-resources": "patient-resources",
 "new-patient-resources": "patient-resources/new-patients",
 "referring-providers": "patient-resources/referring-providers",
 "staying-connected": "patient-resources/staying-connected",
 "fertility-resources": "patient-resources/fertility-resources",
 "blog": "patient-resources/blog", "patient-portal": "patient-resources/patient-portal",
 # Conversion + legal (root-level utility folders)
 "appointment": "appointment", "contact": "contact", "become-an-egg-donor": "become-an-egg-donor",
 "careers": "careers", "privacy-policy": "privacy-policy", "covid-19-notice": "covid-19-notice",
}

def abs_url(path):
    return BASE + "/" + (path + "/" if path else "")

def relurl(target, cur):
    rel = posixpath.relpath(target or ".", cur or ".")
    return "./" if rel == "." else rel + "/"

def maplink(target, cur):
    if target.startswith(("tel:", "mailto:", "#")):
        return target
    if target.startswith("http"):
        if "springcreekfertility.com" not in target:
            return target
        m = re.match(r'https?://www\.springcreekfertility\.com/([^"#?]*)([#?].*)?$', target)
        if not m:
            return target
        slug = m.group(1).strip("/"); frag = m.group(2) or ""
        if slug == "":
            return relurl("", cur) + frag
        if slug in PATHMAP:
            return relurl(PATHMAP[slug], cur) + frag
        return target
    if target.startswith("assets/"):
        prefix = "" if cur == "" else "../" * (cur.count("/") + 1)
        return prefix + target
    m = re.match(r'([\w-]+)\.html([#?].*)?$', target)
    if m:
        slug = m.group(1); frag = m.group(2) or ""
        if slug == "index":
            return relurl("", cur) + frag
        if slug in PATHMAP:
            return relurl(PATHMAP[slug], cur) + frag
    return target

def remap_ld(s):
    def rep(m):
        slug = (m.group(1) or "").strip("/")
        if slug == "":
            return BASE + "/"
        if slug in PATHMAP:
            return abs_url(PATHMAP[slug])
        return m.group(0)
    return re.sub(r'https://www\.springcreekfertility\.com/([a-z0-9-]+/)?', rep, s)

def transform(html, cur):
    newabs = abs_url(cur)
    prot = {}
    def stash(m):
        k = f"\x00{len(prot)}\x00"; prot[k] = m.group(0); return k
    # protect JSON-LD + canonical from the href rewriter
    html = re.sub(r'<script type="application/ld\+json">.*?</script>', stash, html, flags=re.S)
    html = re.sub(r'<link rel="canonical"[^>]*>', stash, html)
    # og:url uses content= (href rewriter won't touch it)
    html = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1) + newabs + m.group(2), html)
    # rewrite every internal href/src to clean relative URLs
    html = re.sub(r'(href|src)="([^"]*)"', lambda m: f'{m.group(1)}="{maplink(m.group(2), cur)}"', html)
    # restore: canonical -> new absolute; JSON-LD -> hierarchical URLs
    for k, v in prot.items():
        if v.startswith("<link rel=\"canonical\""):
            html = html.replace(k, f'<link rel="canonical" href="{newabs}">')
        else:
            html = html.replace(k, remap_ld(v))
    return html

# ---- build ----
if os.path.isdir(DST): shutil.rmtree(DST)
os.makedirs(DST)
shutil.copytree(os.path.join(SRC, "assets"), os.path.join(DST, "assets"))

written = []
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith(".html"): continue
    key = fn[:-5]
    if key not in PATHMAP:
        print("  SKIP (no pathmap):", fn); continue
    path = PATHMAP[key]
    out_dir = os.path.join(DST, path)
    os.makedirs(out_dir, exist_ok=True)
    html = transform(open(os.path.join(SRC, fn), encoding="utf-8").read(), path)
    open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8").write(html)
    written.append((key, path))

# Elementor blocks: remap flat->hierarchical absolute URLs (URL-agnostic content blocks)
el_src = os.path.join(SRC, "elementor"); el_dst = os.path.join(DST, "_elementor")
os.makedirs(el_dst, exist_ok=True)
for fn in sorted(os.listdir(el_src)):
    s = open(os.path.join(el_src, fn), encoding="utf-8").read()
    if fn != "_shared-scf-css.html":
        s = remap_ld(s)
    open(os.path.join(el_dst, fn), "w", encoding="utf-8").write(s)

# sitemap
urls = sorted(abs_url(p) for _, p in written)
open(os.path.join(DST, "sitemap.xml"), "w", encoding="utf-8").write(
 '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
 + "\n".join(f'  <url><loc>{u}</loc><changefreq>monthly</changefreq></url>' for u in urls) + '\n</urlset>\n')

# .htaccess 301 map (old flat -> new hierarchical)
ht = ["# SpringCreek authority-architecture 301 redirects (old flat URL -> new hierarchical URL)",
      "# Enable mod_rewrite. Review before deploying.", ""]
for key, path in sorted(written):
    if key == "index": continue
    old = f"/{key}/"; new = "/" + (path + "/" if path else "")
    if old != new:
        ht.append(f"Redirect 301 {old} {new}")
open(os.path.join(DST, ".htaccess"), "w", encoding="utf-8").write("\n".join(ht) + "\n")

print(f"Wrote {len(written)} folders (each /index.html) + assets + _elementor + sitemap + .htaccess")
print("Redirect rules:", sum(1 for k,p in written if k!='index' and f'/{k}/' != '/'+(p+'/' if p else '')))
