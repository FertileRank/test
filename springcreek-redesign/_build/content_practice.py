# -*- coding: utf-8 -*-
ORG = "https://www.springcreekfertility.com/#organization"

# ---------------- ABOUT ----------------
about = {
 "slug":"about","url":"https://www.springcreekfertility.com/about/","nav_active":"about",
 "title":"About SpringCreek Fertility | Independent Ohio Fertility Practice",
 "meta_desc":"About SpringCreek Fertility — an independent, patient-centered reproductive medicine practice founded in 2014, with an on-site IVF laboratory and three locations across Ohio.",
 "hero_eyebrow":"About SpringCreek",
 "hero_h1":"Your family dream is our <span class=\"scf-hero__accent\">family's dream</span>",
 "hero_sub":"An independent, patient-centered fertility practice serving Ohio since 2014 — built on clinical excellence, inclusive care, and genuine human connection.",
 "hero_ctas":[("Meet Our Team","fertility-specialists.html","scf-btn scf-btn--on-navy scf-btn--lg"),("Request a Consultation","appointment.html","scf-btn scf-btn--on-navy scf-btn--ghost")],
 "breadcrumb":[("Home","index.html"),("About",None)],
 "cta":{"h2":"Care that puts you first","p":"Experience the SpringCreek difference for yourself. Request a consultation at the Ohio location nearest you.","buttons":[("Request a Consultation","appointment.html","scf-btn scf-btn--accent scf-btn--lg"),("Find a Location","contact.html","scf-btn scf-btn--ghost scf-btn--on-navy")]},
 "main_html": """
   <section class="scf-section"><div class="scf-container"><div class="scf-prose">
     <h2>Our story</h2>
     <p>SpringCreek Fertility was founded in 2014 by Dr. Jeremy Groll with a clear purpose: to offer reproductive medicine that is both clinically excellent and deeply human. We chose to remain independent so that our decisions stay centered on patients — not on outside pressures — and so that our care can feel personal at every visit.</p>
     <p>More than a decade later, we care for individuals and families across the Dayton, Columbus, and Cincinnati metros, and from neighboring communities in Indiana and Kentucky. Through every advance in our field, one thing has not changed: we treat the people in front of us the way we would want our own families treated.</p>
     <h2>What makes us different</h2>
   </div></div></section>

   <section class="scf-section scf-section--tint"><div class="scf-container">
     <div class="scf-grid scf-grid--3">
       <article class="scf-card"><div class="scf-icon">&#9877;</div><h3>Physician-led, board-certified</h3><p>You work closely with board-certified reproductive endocrinologists, led by Medical Director Dr. Jeremy Groll, who is double board-certified in REI and OB/GYN.</p></article>
       <article class="scf-card"><div class="scf-icon">&#9879;</div><h3>Our own on-site IVF laboratory</h3><p>Egg retrieval, fertilization, embryo culture, and freezing happen in our own laboratory, led by a doctoral-level laboratory director — keeping science and care side by side.</p></article>
       <article class="scf-card"><div class="scf-icon">&#9883;</div><h3>Independent &amp; inclusive</h3><p>As an independent practice, we keep care personal. We welcome diverse family structures and provide LGBTQ+ inclusive care for every path to parenthood.</p></article>
     </div>
   </div></section>

   <section class="scf-section"><div class="scf-container scf-split">
     <div class="scf-prose">
       <h2>When to seek fertility care</h2>
       <p>It can be hard to know when to ask for help. A common guideline is to seek an evaluation after 12 months of trying to conceive — or after 6 months if you are age 35 or older. Consider reaching out sooner if any of the following apply to you:</p>
     </div>
     <div class="scf-panel scf-panel--accent">
       <ul class="scf-list-check">
         <li><span class="scf-check">&#10003;</span> Irregular or absent menstrual cycles</li>
         <li><span class="scf-check">&#10003;</span> Known conditions such as endometriosis or PCOS (polycystic ovary syndrome)</li>
         <li><span class="scf-check">&#10003;</span> A history of pregnancy loss</li>
         <li><span class="scf-check">&#10003;</span> Prior cancer treatment or a wish to preserve fertility</li>
         <li><span class="scf-check">&#10003;</span> Building a family as an LGBTQ+ couple or single parent by choice</li>
       </ul>
       <p class="scf-rel">This guidance is general and is not a substitute for personalized medical advice.</p>
     </div>
   </div></section>

   <section class="scf-section scf-section--navy"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">Credibility</span><h2>Care you can feel confident in</h2></div>
     <div class="scf-stats">
       <div class="scf-stat"><span class="scf-stat__num">2014</span><span class="scf-stat__lbl">Founded in Ohio</span></div>
       <div class="scf-stat"><span class="scf-stat__num">3</span><span class="scf-stat__lbl">Locations statewide</span></div>
       <div class="scf-stat"><span class="scf-stat__num">SART</span><span class="scf-stat__lbl">Member clinic</span></div>
       <div class="scf-stat"><span class="scf-stat__num">On-site</span><span class="scf-stat__lbl">IVF laboratory</span></div>
     </div>
     <p class="scf-center" style="margin-top:24px"><a href="fertility-specialists.html" style="color:#fff;text-decoration-color:#90C962"><strong>Meet the people behind your care &rarr;</strong></a></p>
   </div></section>
 """,
 "jsonld": {"@context":"https://schema.org","@graph":[
   {"@type":"AboutPage","@id":"https://www.springcreekfertility.com/about/#webpage","url":"https://www.springcreekfertility.com/about/","name":"About SpringCreek Fertility","about":{"@id":ORG},"isPartOf":{"@id":"https://www.springcreekfertility.com/#website"}},
   {"@type":["MedicalOrganization","MedicalBusiness"],"@id":ORG,"name":"SpringCreek Fertility","url":"https://www.springcreekfertility.com/","foundingDate":"2014","founder":{"@id":"https://www.springcreekfertility.com/#groll"},"medicalSpecialty":"Reproductive Endocrinology and Infertility","memberOf":{"@type":"MedicalOrganization","name":"Society for Assisted Reproductive Technology (SART)","url":"https://www.sart.org/"}},
   {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.springcreekfertility.com/"},{"@type":"ListItem","position":2,"name":"About","item":"https://www.springcreekfertility.com/about/"}]}
 ]},
}

# ---------------- TEAM (Fertility Specialists) ----------------
def provider_card(name, role, url, blurb, npi=None):
    npi_line = f'<p class="scf-rel">NPI {npi}</p>' if npi else ""
    link = f'<a class="scf-card__link" href="{url}">Full bio &rarr;</a>' if url else ""
    return f'<article class="scf-card"><h3>{name}</h3><p style="color:#3F6B22;font-weight:600;margin-bottom:.4em">{role}</p><p>{blurb}</p>{npi_line}{link}</article>'

team = {
 "slug":"fertility-specialists","url":"https://www.springcreekfertility.com/fertility-specialists/","nav_active":"about",
 "title":"Meet Our Fertility Team | Reproductive Endocrinologists in Ohio | SpringCreek",
 "meta_desc":"Meet the SpringCreek Fertility team — board-certified reproductive endocrinologists, a doctoral-level laboratory director, and women's health nurse practitioners serving Dayton, Columbus &amp; Cincinnati.",
 "hero_eyebrow":"Our team",
 "hero_h1":"Meet the SpringCreek Team",
 "hero_sub":"Board-certified physicians, a doctoral-level laboratory director, skilled nurse practitioners, and a caring support team — all focused on you.",
 "hero_ctas":[("Request a Consultation","appointment.html","scf-btn scf-btn--on-navy scf-btn--lg")],
 "breadcrumb":[("Home","index.html"),("About","about.html"),("Our Team",None)],
 "cta":{"h2":"Care from people who know you by name","p":"Request a consultation and meet the team that will walk beside you on your journey.","buttons":[("Request a Consultation","appointment.html","scf-btn scf-btn--accent scf-btn--lg")]},
 "main_html": f"""
   <section class="scf-section"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">Physicians</span><h2>Your reproductive endocrinologists</h2>
       <p>Physicians with advanced training in Reproductive Endocrinology and Infertility (REI) lead every plan of care.</p></div>
     <div class="scf-grid scf-grid--2">
       {provider_card("Jeremy Groll, MD","Medical Director &middot; Reproductive Endocrinologist","https://www.springcreekfertility.com/doctor-jeremy-groll/","Founder of SpringCreek Fertility (2014) and double board-certified in Reproductive Endocrinology &amp; Infertility (REI) and Obstetrics &amp; Gynecology (OB/GYN). Dr. Groll leads the practice and its on-site IVF laboratory with a patient-first philosophy.","1356332357")}
       {provider_card("Kasey Reynolds Marelić, MD","Reproductive Endocrinologist","https://www.springcreekfertility.com/dr-kasey-marelic/","Board-certified reproductive endocrinologist who partners with patients through evaluation and treatment with warmth, clarity, and evidence-informed care.","1538467683")}
     </div>
   </div></section>

   <section class="scf-section scf-section--tint"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">Laboratory</span><h2>The science behind your care</h2></div>
     <div class="scf-grid scf-grid--3">
       {provider_card("Jennifer Graves-Herring, PhD, HCLD","Laboratory Director","https://www.springcreekfertility.com/jennifer-graves-herring-hcld/","A doctoral-level, High-complexity Clinical Laboratory Director (HCLD) who leads SpringCreek's on-site IVF laboratory and embryology team.")}
       {provider_card("Embryology &amp; Andrology Team","Embryologists &amp; Lab Scientists",None,"Skilled embryologists and laboratory scientists care for eggs, sperm, and embryos through every step — fertilization, culture, freezing, and genetic-testing coordination.")}
       {provider_card("Quality &amp; Compliance","Accredited Practices",None,"Our laboratory follows rigorous quality and safety standards, and SpringCreek reports outcomes to the Society for Assisted Reproductive Technology (SART).")}
     </div>
   </div></section>

   <section class="scf-section"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">Advanced practice &amp; nursing</span><h2>Clinicians who guide your day-to-day care</h2></div>
     <div class="scf-grid scf-grid--3">
       {provider_card("Emily McMillan, WHNP","Women's Health Nurse Practitioner","https://www.springcreekfertility.com/emily-mcmillan-whnp/","Provides evaluations, treatment support, and patient education with a compassionate, personalized approach.")}
       {provider_card("Julie Cuy Castellanos, WHNP-BC","Women's Health Nurse Practitioner","https://www.springcreekfertility.com/julie-cuy-castellanos-whnp-bc/","Board-certified women's health nurse practitioner supporting patients through evaluation, treatment, and every question along the way.")}
       {provider_card("Fertility Nursing &amp; Care Team","Nurses, Coordinators &amp; Counselors",None,"Fertility nurses, IVF coordinators, sonographers, and financial counselors work together so you feel supported and informed at every visit.")}
     </div>
     <p class="scf-center scf-mt-lg scf-rel">Additional providers and team members are introduced on the live site. // VERIFY full current roster against the Brand Vault.</p>
   </div></section>
 """,
 "jsonld": {"@context":"https://schema.org","@graph":[
   {"@type":"MedicalWebPage","@id":"https://www.springcreekfertility.com/fertility-specialists/#webpage","url":"https://www.springcreekfertility.com/fertility-specialists/","name":"Meet Our Fertility Team","isPartOf":{"@id":"https://www.springcreekfertility.com/#website"}},
   {"@type":"Physician","@id":"https://www.springcreekfertility.com/#groll","name":"Jeremy Groll, MD","url":"https://www.springcreekfertility.com/doctor-jeremy-groll/","jobTitle":"Medical Director","worksFor":{"@id":ORG},"medicalSpecialty":"Reproductive Endocrinology and Infertility","identifier":{"@type":"PropertyValue","propertyID":"NPI","value":"1356332357"}},
   {"@type":"Physician","@id":"https://www.springcreekfertility.com/#marelic","name":"Kasey Reynolds Marelić, MD","url":"https://www.springcreekfertility.com/dr-kasey-marelic/","jobTitle":"Reproductive Endocrinologist","worksFor":{"@id":ORG},"medicalSpecialty":"Reproductive Endocrinology and Infertility","identifier":{"@type":"PropertyValue","propertyID":"NPI","value":"1538467683"}},
   {"@type":"Person","@id":"https://www.springcreekfertility.com/#graves-herring","name":"Jennifer Graves-Herring, PhD, HCLD","url":"https://www.springcreekfertility.com/jennifer-graves-herring-hcld/","jobTitle":"Laboratory Director","worksFor":{"@id":ORG}},
   {"@type":"Person","name":"Emily McMillan, WHNP","url":"https://www.springcreekfertility.com/emily-mcmillan-whnp/","jobTitle":"Women's Health Nurse Practitioner","worksFor":{"@id":ORG}},
   {"@type":"Person","name":"Julie Cuy Castellanos, WHNP-BC","url":"https://www.springcreekfertility.com/julie-cuy-castellanos-whnp-bc/","jobTitle":"Women's Health Nurse Practitioner","worksFor":{"@id":ORG}},
   {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.springcreekfertility.com/"},{"@type":"ListItem","position":2,"name":"About","item":"https://www.springcreekfertility.com/about/"},{"@type":"ListItem","position":3,"name":"Our Team","item":"https://www.springcreekfertility.com/fertility-specialists/"}]}
 ]},
}

PAGES = [about, team]
