# -*- coding: utf-8 -*-
ORG = "https://www.springcreekfertility.com/#organization"

SERVICES = [
 ("Fertility Evaluation","A thorough reproductive health review to understand what may be affecting conception.","fertility-specialists.html"),
 ("IVF &amp; ICSI","In vitro fertilization, with ICSI when helpful, supported by our on-site IVF laboratory.","ivf-icsi.html"),
 ("IUI","Intrauterine insemination — prepared sperm placed in the uterus around ovulation.","https://www.springcreekfertility.com/iui/"),
 ("Egg Freezing","Oocyte cryopreservation to preserve eggs for the future.","egg-freezing.html"),
 ("Fertility Preservation","Options to protect fertility ahead of medical treatment or for personal planning.","https://www.springcreekfertility.com/fertility-preservation/"),
 ("Preimplantation Genetic Testing (PGT)","Genetic testing of embryos, coordinated through our embryology laboratory.","https://www.springcreekfertility.com/pgt/"),
 ("Donor Egg Program","A path to parenthood using carefully screened donor eggs.","https://www.springcreekfertility.com/donor-egg/"),
 ("Donor Sperm","Guidance and coordination for treatment using donor sperm.","https://www.springcreekfertility.com/donor-sperm-banks/"),
 ("Embryo Donation","Building a family with donated embryos.","https://www.springcreekfertility.com/embryo-donation/"),
 ("Gestational Surrogacy","Coordinated medical, counseling, and legal support for gestational carrier journeys.","https://www.springcreekfertility.com/gestational-surrogacy-carrier/"),
 ("Recurrent Miscarriage","Evaluation and care for recurrent pregnancy loss.","https://www.springcreekfertility.com/recurrent-miscarriage/"),
 ("LGBTQIA+ Family Building","Inclusive, affirming care for every path to parenthood.","lgbtqia-family-building.html"),
]

def svc_cards():
    out=[]
    for t,d,h in SERVICES:
        out.append(f'<article class="scf-card"><h3>{t}</h3><p>{d}</p><a class="scf-card__link" href="{h}">Learn more &rarr;</a></article>')
    return '<div class="scf-grid scf-grid--3">' + "".join(out) + "</div>"

treatments = {
 "slug":"fertility-treatment","url":"https://www.springcreekfertility.com/fertility-treatment/","nav_active":"treatments",
 "title":"Fertility Treatment Options in Ohio | SpringCreek Fertility",
 "meta_desc":"Explore fertility treatments at SpringCreek Fertility — IVF &amp; ICSI, IUI, egg freezing, donor programs, gestational surrogacy, PGT, and LGBTQIA+ family building across Dayton, Columbus &amp; Cincinnati.",
 "hero_eyebrow":"Treatments overview",
 "hero_h1":"Learn About Your <span class=\"scf-hero__accent\">Treatment Options</span>",
 "hero_sub":"From a first evaluation to advanced treatment, SpringCreek offers a full range of fertility care — explained in plain language so you can choose the path that fits you.",
 "hero_ctas":[("Request a Consultation","appointment.html","scf-btn scf-btn--on-navy scf-btn--lg"),("Cost &amp; Financing","financing-options.html","scf-btn scf-btn--on-navy scf-btn--ghost")],
 "breadcrumb":[("Home","index.html"),("Treatments",None)],
 "cta":{"h2":"Not sure where to begin?","p":"That's exactly what a first consultation is for. A reproductive endocrinologist will help you understand your options and choose a path with confidence.","buttons":[("Request a Consultation","appointment.html","scf-btn scf-btn--accent scf-btn--lg"),("Talk to Our Team","contact.html","scf-btn scf-btn--ghost scf-btn--on-navy")]},
 "main_html": f"""
   <section class="scf-section"><div class="scf-container"><div class="scf-prose">
     <h2>Care tailored to your journey</h2>
     <p>There is no single path to building a family, so there is no one-size-fits-all treatment. At SpringCreek Fertility, your care begins with a thorough evaluation and a conversation about your goals. From there, your physician recommends the approach most likely to help — whether that is a first-line option such as <strong>intrauterine insemination (IUI)</strong> or advanced treatment such as <strong>in vitro fertilization (IVF)</strong>, supported by our on-site laboratory.</p>
     <p>Explore the options below, and reach out whenever you are ready to talk.</p>
   </div></div></section>

   <section class="scf-section scf-section--tint"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">What we offer</span><h2>Fertility services at SpringCreek</h2></div>
     {svc_cards()}
   </div></section>

   <section class="scf-section scf-section--navy"><div class="scf-container scf-split">
     <div><span class="scf-eyebrow">On-site IVF laboratory</span><h2>Advanced care, coordinated under one roof</h2>
       <p>SpringCreek operates its own IVF laboratory, led by a doctoral-level laboratory director. Keeping embryology in-house means your physician and our embryologists coordinate every step — fertilization, embryo culture, freezing, and genetic-testing logistics — with close communication and care.</p>
       <p><a href="ivf-icsi.html" style="color:#fff;text-decoration-color:#90C962">Explore IVF &amp; ICSI &rarr;</a></p></div>
     <div class="scf-panel" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.18)">
       <h3 style="color:#fff">A first step that fits you</h3>
       <p style="color:rgba(255,255,255,.9)">Many patients start with an evaluation and a less involved treatment, moving to advanced options only if needed. Your physician explains the tradeoffs so the plan matches your goals, comfort, and timeline.</p>
     </div>
   </div></section>
 """,
 "jsonld": {"@context":"https://schema.org","@graph":[
   {"@type":"MedicalWebPage","@id":"https://www.springcreekfertility.com/fertility-treatment/#webpage","url":"https://www.springcreekfertility.com/fertility-treatment/","name":"Fertility Treatment Options","isPartOf":{"@id":"https://www.springcreekfertility.com/#website"},"about":{"@id":ORG}},
   {"@type":"ItemList","name":"Fertility services","itemListElement":[{"@type":"ListItem","position":i+1,"name":t.replace("&amp;","&")} for i,(t,d,h) in enumerate(SERVICES)]},
   {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.springcreekfertility.com/"},{"@type":"ListItem","position":2,"name":"Treatments","item":"https://www.springcreekfertility.com/fertility-treatment/"}]}
 ]},
}
PAGES = [treatments]
