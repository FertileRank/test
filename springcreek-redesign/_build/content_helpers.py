# -*- coding: utf-8 -*-
"""Shared content helpers for the remaining SpringCreek pages (.scf-page system)."""
ORG = "https://www.springcreekfertility.com/#organization"
BASE = "https://www.springcreekfertility.com"

def head(eyebrow, h2, sub=None):
    s = f'<p>{sub}</p>' if sub else ''
    return f'<div class="scf-head"><span class="scf-eyebrow">{eyebrow}</span><h2>{h2}</h2>{s}</div>'

def prose(*paras):
    return '<section class="scf-section"><div class="scf-container"><div class="scf-prose">' + "".join(paras) + '</div></div></section>'

def prose_tint(*paras):
    return '<section class="scf-section scf-section--tint"><div class="scf-container"><div class="scf-prose">' + "".join(paras) + '</div></div></section>'

def cards(items, cols=3, tint=False, icons=False):
    cls = "scf-section scf-section--tint" if tint else "scf-section"
    inner = []
    for it in items:
        t, d = it[0], it[1]
        link = ''
        if len(it) > 2 and it[2]:
            link = f'<a class="scf-card__link" href="{it[2]}">Learn more &rarr;</a>'
        ic = '<div class="scf-icon">&#10003;</div>' if icons else ''
        inner.append(f'<article class="scf-card">{ic}<h3>{t}</h3><p>{d}</p>{link}</article>')
    return f'<section class="{cls}"><div class="scf-container"><div class="scf-grid scf-grid--{cols}">' + "".join(inner) + '</div></div></section>'

def cards_head(eyebrow, h2, items, cols=3, tint=True, sub=None):
    cls = "scf-section scf-section--tint" if tint else "scf-section"
    inner = []
    for it in items:
        t, d = it[0], it[1]
        link = f'<a class="scf-card__link" href="{it[2]}">Learn more &rarr;</a>' if len(it) > 2 and it[2] else ''
        inner.append(f'<article class="scf-card"><h3>{t}</h3><p>{d}</p>{link}</article>')
    return f'<section class="{cls}"><div class="scf-container">{head(eyebrow,h2,sub)}<div class="scf-grid scf-grid--{cols}">' + "".join(inner) + '</div></div></section>'

def steps(eyebrow, h2, items, sub=None, tint=False):
    cls = "scf-section scf-section--tint" if tint else "scf-section"
    s = "".join(f'<div class="scf-step"><h3>{t}</h3><p>{d}</p></div>' for t, d in items)
    return f'<section class="{cls}"><div class="scf-container">{head(eyebrow,h2,sub)}<div class="scf-steps">{s}</div></div></section>'

def faq_section(faqs, eyebrow="Questions, answered", h2="Frequently asked questions", soft=True):
    cls = "scf-section scf-section--soft" if soft else "scf-section"
    d = "".join(f'<details{" open" if i==0 else ""}><summary>{q}</summary><p>{a}</p></details>' for i,(q,a) in enumerate(faqs))
    return f'<section class="{cls}"><div class="scf-container">{head(eyebrow,h2)}<div class="scf-faq">{d}</div></div></section>'

def checklist(eyebrow, h2, lead, items, tint=False):
    cls = "scf-section scf-section--tint" if tint else "scf-section"
    li = "".join(f'<li><span class="scf-check">&#10003;</span> {x}</li>' for x in items)
    return (f'<section class="{cls}"><div class="scf-container scf-split">'
            f'<div class="scf-prose"><span class="scf-eyebrow">{eyebrow}</span><h2>{h2}</h2><p>{lead}</p></div>'
            f'<div class="scf-panel scf-panel--accent"><ul class="scf-list-check">{li}</ul></div></div></section>')

def lab_band():
    return ('<section class="scf-section scf-section--navy"><div class="scf-container scf-split">'
            '<div><span class="scf-eyebrow">On-site IVF laboratory</span><h2>Science and care, side by side</h2>'
            '<p>SpringCreek operates its own IVF laboratory, led by a doctoral-level laboratory director. Keeping embryology in-house means your physician and our embryology team coordinate every step with close communication and care.</p>'
            '<p><a href="ivf-icsi.html" style="color:#fff;text-decoration-color:#90C962">Explore IVF &amp; ICSI &rarr;</a></p></div>'
            '<div class="scf-panel" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.18)">'
            '<h3 style="color:#fff">A note on expectations</h3>'
            '<p style="color:rgba(255,255,255,.9)">We share honest, individualized information and never promise a specific outcome. Reported clinic outcomes are available through the <a href="https://www.sartcorsonline.com/CSR/PublicMultYear?ClinicPKID=2000067" style="color:#fff;text-decoration-color:#90C962">Society for Assisted Reproductive Technology (SART)</a>.</p></div></div></section>')

DEFAULT_CTA = {"h2": "Talk with a fertility specialist",
  "p": "A board-certified reproductive endocrinologist will review your history, explain your options in plain language, and answer your questions — no pressure.",
  "buttons": [("Request a Consultation", "appointment.html", "scf-btn scf-btn--accent scf-btn--lg"),
              ("Contact Us", "contact.html", "scf-btn scf-btn--ghost scf-btn--on-navy")]}

def page(slug, title, desc, eyebrow, h1, sub, main, breadcrumb, jsonld,
         nav_active=None, cta=None, hero_ctas=None, verify=None):
    return {
        "slug": slug, "url": f"{BASE}/{slug}/", "nav_active": nav_active,
        "title": title, "meta_desc": desc,
        "hero_eyebrow": eyebrow, "hero_h1": h1, "hero_sub": sub,
        "hero_ctas": hero_ctas or [("Request a Consultation", "appointment.html", "scf-btn scf-btn--on-navy scf-btn--lg")],
        "breadcrumb": breadcrumb, "main_html": main,
        "cta": cta or DEFAULT_CTA, "jsonld": jsonld, "verify": verify or [],
    }

def crumbs(*pairs):
    return list(pairs)

def bc_schema(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i+1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}

def faq_schema(faqs):
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]}

def webpage(url, name, typ="WebPage"):
    return {"@type": typ, "@id": url + "#webpage", "url": url, "name": name,
            "isPartOf": {"@id": BASE + "/#website"}, "about": {"@id": ORG}}

def proc(url, name, desc, how):
    return {"@type": "MedicalProcedure", "@id": url + "#procedure", "name": name,
            "description": desc, "procedureType": "https://schema.org/TherapeuticProcedure",
            "howPerformed": how, "provider": {"@id": ORG}}

def graph(*nodes):
    return {"@context": "https://schema.org", "@graph": list(nodes)}
