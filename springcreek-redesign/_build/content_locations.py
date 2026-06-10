# -*- coding: utf-8 -*-
ORG = "https://www.springcreekfertility.com/#organization"

def clinic_schema(loc_id, name, street, city, region, zipc, tel, lat, lng, areas, hours_open="07:00", hours_close="16:00", faqs=None):
    g = [
      {"@type": ["MedicalClinic","LocalBusiness"], "@id": loc_id, "name": name,
       "parentOrganization": {"@id": ORG}, "url": loc_id.replace("#location",""),
       "telephone": tel, "medicalSpecialty": "Reproductive Endocrinology and Infertility",
       "address": {"@type":"PostalAddress","streetAddress":street,"addressLocality":city,"addressRegion":region,"postalCode":zipc,"addressCountry":"US"},
       "geo": {"@type":"GeoCoordinates","latitude":lat,"longitude":lng},
       "areaServed": [{"@type":"Place","name":a} for a in areas],
       "openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":hours_open,"closes":hours_close}]},
    ]
    if faqs:
        g.append({"@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]})
    return {"@context":"https://schema.org","@graph": g}

def section_offer(items):
    cards = "".join(f'<article class="scf-card"><h3>{t}</h3><p>{d}</p></article>' for t,d in items)
    return f'<div class="scf-grid scf-grid--3">{cards}</div>'

# ---------- DAYTON ----------
dayton_faqs = [
  ("Where is SpringCreek Fertility's Dayton office located?",
   "Our Dayton fertility center is at 7095 Clyo Road, Dayton (Centerville), OH 45459, just off I-675 in the Centerville/Washington Township area. Call (937) 458-5084."),
  ("What are the Dayton office hours?",
   "The Dayton center is open Monday through Friday, 7:00 AM to 4:00 PM. Early-morning monitoring appointments help you fit cycle visits around work."),
  ("Is the IVF laboratory located in Dayton?",
   "Yes. SpringCreek's on-site IVF laboratory operates from the Dayton location, where egg retrievals, fertilization, embryo culture, and cryopreservation are performed and coordinated with your care team."),
  ("Which areas does the Dayton center serve?",
   "Patients travel to our Dayton center from Centerville, Kettering, Beavercreek, Springboro, Oakwood, Bellbrook, Miamisburg, Huber Heights, Troy, and across Montgomery County and the greater Miami Valley."),
]
dayton = {
  "slug":"dayton-fertility-center","url":"https://www.springcreekfertility.com/dayton-fertility-center/","nav_active":None,
  "title":"Dayton Fertility Clinic (Centerville) | SpringCreek Fertility",
  "meta_desc":"SpringCreek Fertility's Dayton fertility clinic in Centerville offers IVF, IUI, egg freezing, and donor programs with an on-site IVF laboratory. 7095 Clyo Road — (937) 458-5084.",
  "hero_eyebrow":"Dayton &middot; Centerville, Ohio",
  "hero_h1":"Your Fertility Clinic in <span class=\"scf-hero__accent\">Dayton</span>",
  "hero_sub":"Where SpringCreek began. Our flagship Dayton center in Centerville is home to our on-site IVF laboratory and a full range of fertility care for the Miami Valley.",
  "hero_ctas":[("Request a Consultation","appointment.html","scf-btn scf-btn--on-navy scf-btn--lg"),("Call (937) 458-5084","tel:+19374585084","scf-btn scf-btn--on-navy scf-btn--ghost")],
  "breadcrumb":[("Home","index.html"),("Locations","dayton-fertility-center.html"),("Dayton",None)],
  "verify":["Confirm exact suite/parking details","Confirm embedded Google Map URL"],
  "cta":{"h2":"Start your journey in Dayton","p":"Request a consultation at our Centerville location, or call our Dayton team with any question.","buttons":[("Request a Consultation","appointment.html","scf-btn scf-btn--accent scf-btn--lg"),("Contact Us","contact.html","scf-btn scf-btn--ghost scf-btn--on-navy")]},
  "main_html": f"""
    <section class="scf-section"><div class="scf-container scf-split">
      <div>
        <span class="scf-eyebrow">About this center</span>
        <h2>Comprehensive fertility care in the Miami Valley</h2>
        <p>SpringCreek Fertility was founded in Dayton in 2014, and our Centerville center remains the heart of the practice. Conveniently located off I-675 at 7095 Clyo Road, the Dayton center brings reproductive endocrinology, monitoring, and our on-site IVF laboratory together under one roof.</p>
        <p>From your first fertility evaluation through advanced treatment, you work closely with a board-certified reproductive endocrinologist and a care team that knows you by name. Early-morning monitoring hours make it easier to fit cycle appointments around work and family.</p>
        <p><a href="ivf-icsi.html">Explore IVF &amp; ICSI</a> &middot; <a href="egg-freezing.html">Egg freezing</a> &middot; <a href="financing-options.html">Cost &amp; financing</a></p>
      </div>
      <div class="scf-panel">
        <h3>Dayton Fertility Center</h3>
        <p class="scf-meta"><strong>Address:</strong> 7095 Clyo Road, Dayton (Centerville), OH 45459</p>
        <p class="scf-meta"><strong>Phone:</strong> <a href="tel:+19374585084">(937) 458-5084</a></p>
        <p class="scf-meta"><strong>Fax:</strong> (937) 458-5089</p>
        <p class="scf-meta"><strong>Hours:</strong> Mon–Fri, 7:00 AM–4:00 PM</p>
        <p class="scf-meta"><strong>Serves:</strong> Centerville, Kettering, Beavercreek, Springboro, Montgomery County &amp; the Miami Valley</p>
        <div class="scf-map-ph">Embed Google Map for 7095 Clyo Road here &middot; // VERIFY</div>
      </div>
    </div></section>

    <section class="scf-section scf-section--tint"><div class="scf-container">
      <div class="scf-head"><span class="scf-eyebrow">What this center offers</span><h2>Services at our Dayton location</h2></div>
      {section_offer([
        ("Fertility Evaluation","A thorough reproductive health review to understand what may be affecting conception."),
        ("IVF &amp; ICSI","In vitro fertilization with our on-site embryology laboratory and ICSI when helpful."),
        ("IUI","Intrauterine insemination, often a first-line treatment, with cycle monitoring on site."),
        ("Egg Freezing","Oocyte cryopreservation to preserve eggs for the future, performed in our Dayton lab."),
        ("Donor &amp; Third-Party","Donor egg, donor sperm, embryo donation, and gestational carrier coordination."),
        ("LGBTQIA+ Family Building","Inclusive, affirming care for every path to parenthood."),
      ])}
    </div></section>

    <section class="scf-section"><div class="scf-container">
      <div class="scf-head"><span class="scf-eyebrow">Dayton FAQs</span><h2>Visiting our Centerville center</h2></div>
      <div class="scf-faq">
        {"".join(f'<details{" open" if i==0 else ""}><summary>{q}</summary><p>{a}</p></details>' for i,(q,a) in enumerate(dayton_faqs))}
      </div>
    </div></section>
  """,
  "jsonld": clinic_schema("https://www.springcreekfertility.com/dayton-fertility-center/#location",
     "SpringCreek Fertility — Dayton (Centerville)","7095 Clyo Road","Dayton","OH","45459","+1-937-458-5084",
     "39.6219","-84.1480",["Centerville","Kettering","Beavercreek","Springboro","Montgomery County","Miami Valley"],
     faqs=dayton_faqs),
}

# ---------- COLUMBUS ----------
columbus_faqs = [
  ("Where is the Columbus fertility center located?",
   "Our Columbus-area center is at 6760 Avery-Muirfield Drive, Suite A, Dublin, OH 43016, convenient to the Dublin, Hilliard, and Powell communities. Call (614) 401-4113."),
  ("Do I have to travel to Dayton for IVF lab work?",
   "Your consultations, monitoring, and treatment planning happen in Dublin. Certain laboratory steps are coordinated with our on-site IVF laboratory; your care team will map out exactly where each visit takes place so there are no surprises."),
  ("Which Central Ohio areas does the Dublin center serve?",
   "Patients visit from Dublin, Hilliard, Powell, Worthington, Upper Arlington, Westerville, New Albany, Marysville, Delaware, and across Franklin County and Central Ohio."),
  ("What should I bring to my first visit in Dublin?",
   "Bring your insurance card, a photo ID, a list of medications, and any prior fertility testing or records. Our team can request records in advance if you let us know where you were seen."),
]
columbus = {
  "slug":"columbus-fertility-center","url":"https://www.springcreekfertility.com/columbus-fertility-center/","nav_active":None,
  "title":"Columbus Fertility Clinic (Dublin) | SpringCreek Fertility",
  "meta_desc":"SpringCreek Fertility's Columbus fertility clinic in Dublin offers IVF, IUI, egg freezing, and donor programs for Central Ohio. 6760 Avery-Muirfield Dr, Ste A — (614) 401-4113.",
  "hero_eyebrow":"Columbus &middot; Dublin, Ohio",
  "hero_h1":"Your Fertility Clinic in <span class=\"scf-hero__accent\">Columbus</span>",
  "hero_sub":"Personalized, evidence-informed fertility care for Central Ohio — conveniently located in Dublin off Avery-Muirfield Drive.",
  "hero_ctas":[("Request a Consultation","appointment.html","scf-btn scf-btn--on-navy scf-btn--lg"),("Call (614) 401-4113","tel:+16144014113","scf-btn scf-btn--on-navy scf-btn--ghost")],
  "breadcrumb":[("Home","index.html"),("Locations","columbus-fertility-center.html"),("Columbus",None)],
  "verify":["Dublin office hours","Embedded Google Map URL"],
  "cta":{"h2":"Start your journey in Columbus","p":"Request a consultation at our Dublin location, or call our Columbus team with any question.","buttons":[("Request a Consultation","appointment.html","scf-btn scf-btn--accent scf-btn--lg"),("Contact Us","contact.html","scf-btn scf-btn--ghost scf-btn--on-navy")]},
  "main_html": f"""
    <section class="scf-section"><div class="scf-container scf-split">
      <div>
        <span class="scf-eyebrow">About this center</span>
        <h2>Fertility care that fits Central Ohio life</h2>
        <p>Our Columbus-area center in Dublin brings SpringCreek's patient-centered approach to Central Ohio. Located at 6760 Avery-Muirfield Drive, Suite A, the office offers reproductive endocrinology consultations, cycle monitoring, and treatment planning close to home for families in Dublin, Hilliard, Powell, and beyond.</p>
        <p>You will see a board-certified reproductive endocrinologist who takes time to understand your history and goals, then builds a plan around them. When laboratory steps are needed, they are coordinated with our on-site IVF laboratory so your care stays connected across the practice.</p>
        <p><a href="ivf-icsi.html">Explore IVF &amp; ICSI</a> &middot; <a href="lgbtqia-family-building.html">LGBTQIA+ family building</a> &middot; <a href="financing-options.html">Cost &amp; financing</a></p>
      </div>
      <div class="scf-panel">
        <h3>Columbus Fertility Center</h3>
        <p class="scf-meta"><strong>Address:</strong> 6760 Avery-Muirfield Drive, Suite A, Dublin, OH 43016</p>
        <p class="scf-meta"><strong>Phone:</strong> <a href="tel:+16144014113">(614) 401-4113</a></p>
        <p class="scf-meta"><strong>Hours:</strong> Mon–Fri — please call to confirm <em>// VERIFY</em></p>
        <p class="scf-meta"><strong>Serves:</strong> Dublin, Hilliard, Powell, Worthington, Franklin County &amp; Central Ohio</p>
        <div class="scf-map-ph">Embed Google Map for Dublin office here &middot; // VERIFY</div>
      </div>
    </div></section>

    <section class="scf-section scf-section--tint"><div class="scf-container">
      <div class="scf-head"><span class="scf-eyebrow">What this center offers</span><h2>Services at our Dublin location</h2></div>
      {section_offer([
        ("Fertility Evaluation","A thorough reproductive health review with a Central Ohio reproductive endocrinologist."),
        ("IVF &amp; ICSI","In vitro fertilization planning and monitoring in Dublin, coordinated with our IVF laboratory."),
        ("IUI","Intrauterine insemination with convenient local monitoring."),
        ("Egg Freezing","Fertility preservation and egg freezing for those planning ahead."),
        ("Donor &amp; Third-Party","Donor egg, donor sperm, embryo donation, and gestational carrier programs."),
        ("LGBTQIA+ Family Building","Affirming guidance for LGBTQ+ families and single parents by choice."),
      ])}
    </div></section>

    <section class="scf-section"><div class="scf-container">
      <div class="scf-head"><span class="scf-eyebrow">Columbus FAQs</span><h2>Visiting our Dublin center</h2></div>
      <div class="scf-faq">
        {"".join(f'<details{" open" if i==0 else ""}><summary>{q}</summary><p>{a}</p></details>' for i,(q,a) in enumerate(columbus_faqs))}
      </div>
    </div></section>
  """,
  "jsonld": clinic_schema("https://www.springcreekfertility.com/columbus-fertility-center/#location",
     "SpringCreek Fertility — Columbus (Dublin)","6760 Avery-Muirfield Drive, Suite A","Dublin","OH","43016","+1-614-401-4113",
     "40.0962","-83.1410",["Dublin","Hilliard","Powell","Worthington","Franklin County","Central Ohio"],
     hours_open="08:00", faqs=columbus_faqs),
}

# ---------- CINCINNATI ----------
cincinnati_faqs = [
  ("Where is the Cincinnati fertility center located?",
   "Our Cincinnati-area center is at 9313 Mason Montgomery Road, Mason, OH 45040, serving Greater Cincinnati and Warren County. Call (513) 457-5200."),
  ("When did the Cincinnati location open?",
   "SpringCreek opened its Cincinnati-area center in Mason in 2022 to bring local fertility care to families in Southwest Ohio and Northern Kentucky."),
  ("Which areas does the Mason center serve?",
   "Patients visit from Mason, West Chester, Liberty Township, Loveland, Montgomery, Blue Ash, Lebanon, Springboro, and Northern Kentucky, across Warren County and Southwest Ohio."),
  ("Can I be seen in Mason and still use the on-site IVF laboratory?",
   "Yes. Your consultations and monitoring take place in Mason, and laboratory steps are coordinated with SpringCreek's on-site IVF laboratory. Your care team explains exactly where each appointment happens."),
]
cincinnati = {
  "slug":"cincinnati-fertility-center","url":"https://www.springcreekfertility.com/cincinnati-fertility-center/","nav_active":None,
  "title":"Cincinnati Fertility Clinic (Mason) | SpringCreek Fertility",
  "meta_desc":"SpringCreek Fertility's Cincinnati fertility clinic in Mason offers IVF, IUI, egg freezing, and donor programs for Southwest Ohio. 9313 Mason Montgomery Rd — (513) 457-5200.",
  "hero_eyebrow":"Cincinnati &middot; Mason, Ohio",
  "hero_h1":"Your Fertility Clinic in <span class=\"scf-hero__accent\">Cincinnati</span>",
  "hero_sub":"Local, compassionate fertility care for Greater Cincinnati and Warren County — in Mason, off Mason Montgomery Road.",
  "hero_ctas":[("Request a Consultation","appointment.html","scf-btn scf-btn--on-navy scf-btn--lg"),("Call (513) 457-5200","tel:+15134575200","scf-btn scf-btn--on-navy scf-btn--ghost")],
  "breadcrumb":[("Home","index.html"),("Locations","cincinnati-fertility-center.html"),("Cincinnati",None)],
  "verify":["Mason office hours","Embedded Google Map URL"],
  "cta":{"h2":"Start your journey in Cincinnati","p":"Request a consultation at our Mason location, or call our Cincinnati team with any question.","buttons":[("Request a Consultation","appointment.html","scf-btn scf-btn--accent scf-btn--lg"),("Contact Us","contact.html","scf-btn scf-btn--ghost scf-btn--on-navy")]},
  "main_html": f"""
    <section class="scf-section"><div class="scf-container scf-split">
      <div>
        <span class="scf-eyebrow">About this center</span>
        <h2>Fertility care close to home in Southwest Ohio</h2>
        <p>Our Cincinnati-area center opened in Mason in 2022 to bring SpringCreek's care to Greater Cincinnati. Located at 9313 Mason Montgomery Road, the office offers reproductive endocrinology consultations, cycle monitoring, and treatment planning for families across Warren County and Northern Kentucky.</p>
        <p>You will work with a board-certified reproductive endocrinologist and a warm, attentive care team. When laboratory steps are part of your plan, they are coordinated with SpringCreek's on-site IVF laboratory, so you benefit from the full resources of the practice while staying close to home.</p>
        <p><a href="ivf-icsi.html">Explore IVF &amp; ICSI</a> &middot; <a href="egg-freezing.html">Egg freezing</a> &middot; <a href="financing-options.html">Cost &amp; financing</a></p>
      </div>
      <div class="scf-panel">
        <h3>Cincinnati Fertility Center</h3>
        <p class="scf-meta"><strong>Address:</strong> 9313 Mason Montgomery Road, Mason, OH 45040</p>
        <p class="scf-meta"><strong>Phone:</strong> <a href="tel:+15134575200">(513) 457-5200</a></p>
        <p class="scf-meta"><strong>Hours:</strong> Mon–Fri — please call to confirm <em>// VERIFY</em></p>
        <p class="scf-meta"><strong>Serves:</strong> Mason, West Chester, Liberty Township, Loveland, Warren County &amp; Southwest Ohio</p>
        <div class="scf-map-ph">Embed Google Map for Mason office here &middot; // VERIFY</div>
      </div>
    </div></section>

    <section class="scf-section scf-section--tint"><div class="scf-container">
      <div class="scf-head"><span class="scf-eyebrow">What this center offers</span><h2>Services at our Mason location</h2></div>
      {section_offer([
        ("Fertility Evaluation","A thorough reproductive health review with a Southwest Ohio reproductive endocrinologist."),
        ("IVF &amp; ICSI","In vitro fertilization planning and monitoring in Mason, coordinated with our IVF laboratory."),
        ("IUI","Intrauterine insemination with convenient local cycle monitoring."),
        ("Egg Freezing","Egg freezing and fertility preservation for planning ahead."),
        ("Donor &amp; Third-Party","Donor egg, donor sperm, embryo donation, and gestational carrier coordination."),
        ("LGBTQIA+ Family Building","Inclusive, affirming care for every path to parenthood."),
      ])}
    </div></section>

    <section class="scf-section"><div class="scf-container">
      <div class="scf-head"><span class="scf-eyebrow">Cincinnati FAQs</span><h2>Visiting our Mason center</h2></div>
      <div class="scf-faq">
        {"".join(f'<details{" open" if i==0 else ""}><summary>{q}</summary><p>{a}</p></details>' for i,(q,a) in enumerate(cincinnati_faqs))}
      </div>
    </div></section>
  """,
  "jsonld": clinic_schema("https://www.springcreekfertility.com/cincinnati-fertility-center/#location",
     "SpringCreek Fertility — Cincinnati (Mason)","9313 Mason Montgomery Road","Mason","OH","45040","+1-513-457-5200",
     "39.3390","-84.3090",["Mason","West Chester","Liberty Township","Loveland","Warren County","Southwest Ohio"],
     hours_open="08:00", faqs=cincinnati_faqs),
}

PAGES = [dayton, columbus, cincinnati]
