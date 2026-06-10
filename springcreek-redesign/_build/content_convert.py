# -*- coding: utf-8 -*-
ORG = "https://www.springcreekfertility.com/#organization"

def faq_html(faqs):
    return '<div class="scf-faq">' + "".join(
        f'<details{" open" if i==0 else ""}><summary>{q}</summary><p>{a}</p></details>'
        for i,(q,a) in enumerate(faqs)) + '</div>'

# ---------------- FINANCING OPTIONS ----------------
fin_faqs = [
 ("Does insurance cover fertility treatment in Ohio?","Coverage varies by plan and employer. Many patients have at least some coverage for an initial consultation and testing, and SpringCreek participates with many insurance plans. Our financial counselor reviews your specific benefits with you before you begin."),
 ("How much does IVF cost at SpringCreek?","IVF cycle pricing is offered on a “starting at” basis, with medications and certain add-on services quoted separately. Because every plan is individual, we provide a personalized, itemized estimate. See our fertility treatment cost page for details. // VERIFY current figure."),
 ("Do you offer payment plans or financing?","Yes. We offer monthly payment-plan options through a financing partner so treatment costs can be spread over time. Prequalifying typically does not affect your credit score. // VERIFY current financing partner and terms."),
 ("Are there discount or grant programs?","Eligible patients may qualify for discount programs, including support for those facing a medical fertility risk such as a cancer diagnosis. Our team helps you find programs you may qualify for. // VERIFY current discount/grant partners."),
 ("Is there a refund program?","A multi-cycle refund program option may be available for eligible patients, which can provide a partial refund if treatment does not lead to a pregnancy within the program terms. Eligibility and terms apply. // VERIFY current refund program details."),
 ("Will you give me the cost before we start?","Yes. Cost transparency is part of our approach: you receive up-front, itemized pricing and a benefits review so you can plan with confidence."),
]
financing = {
 "slug":"financing-options","url":"https://www.springcreekfertility.com/financing-options/","nav_active":None,
 "title":"Fertility Financing &amp; Payment Options in Ohio | SpringCreek Fertility",
 "meta_desc":"Fertility financing at SpringCreek Fertility — up-front pricing, insurance benefit reviews, monthly payment plans, discount programs, and refund options for IVF and more in Ohio.",
 "hero_eyebrow":"Cost &amp; financing",
 "hero_h1":"Clear Pricing &amp; Financing Support",
 "hero_sub":"Cost is one of the biggest sources of stress on a fertility journey. We offer up-front, itemized pricing and a dedicated financial counselor to help you plan.",
 "hero_ctas":[("Talk to a Financial Counselor","contact.html","scf-btn scf-btn--on-navy scf-btn--lg"),("Request a Consultation","appointment.html","scf-btn scf-btn--on-navy scf-btn--ghost")],
 "breadcrumb":[("Home","index.html"),("Cost &amp; Financing",None)],
 "cta":{"h2":"Let's build a plan that works for you","p":"Our financial counselors will review your benefits and walk through your options — so you can focus on what matters most.","buttons":[("Request a Consultation","appointment.html","scf-btn scf-btn--accent scf-btn--lg"),("Contact Us","contact.html","scf-btn scf-btn--ghost scf-btn--on-navy")]},
 "main_html": f"""
   <section class="scf-section"><div class="scf-container scf-split">
     <div class="scf-prose">
       <h2>Cost transparency, from the start</h2>
       <p>At SpringCreek, you receive up-front, itemized pricing and a dedicated financial counselor who reviews your insurance benefits and walks you through your options. In vitro fertilization (IVF) cycle pricing is offered on a <strong>&ldquo;starting at&rdquo;</strong> basis, with medications and certain add-on services quoted separately. Many patients have at least some coverage for an initial consultation and testing — we help you understand exactly what your plan includes.</p>
       <p>Explore the details: <a href="https://www.springcreekfertility.com/fertility-cost/">fertility treatment cost</a>, <a href="https://www.springcreekfertility.com/understanding-insurance-benefits/">understanding insurance benefits</a>, <a href="https://www.springcreekfertility.com/discount-programs/">discount programs</a>, and <a href="https://www.springcreekfertility.com/refund-programs/">refund programs</a>.</p>
     </div>
     <div class="scf-panel scf-panel--accent">
       <h3>Ways we help with cost</h3>
       <ul class="scf-list-check">
         <li><span class="scf-check">&#10003;</span> Up-front, itemized pricing reviewed before you begin</li>
         <li><span class="scf-check">&#10003;</span> A dedicated insurance benefits review with a financial counselor</li>
         <li><span class="scf-check">&#10003;</span> Monthly payment plans through a financing partner <em>// VERIFY</em></li>
         <li><span class="scf-check">&#10003;</span> Discount programs, including support for eligible patients facing a medical fertility risk <em>// VERIFY</em></li>
         <li><span class="scf-check">&#10003;</span> A multi-cycle refund program option for eligible patients <em>// VERIFY</em></li>
       </ul>
     </div>
   </div></section>

   <section class="scf-section scf-section--tint"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">Plan your care</span><h2>Explore your financial options</h2></div>
     <div class="scf-grid scf-grid--4">
       <article class="scf-card"><h3>Treatment Cost</h3><p>Understand what is included in a cycle and how itemized pricing works.</p><a class="scf-card__link" href="https://www.springcreekfertility.com/fertility-cost/">View costs &rarr;</a></article>
       <article class="scf-card"><h3>Insurance Benefits</h3><p>Learn how to read your benefits and what questions to ask your plan.</p><a class="scf-card__link" href="https://www.springcreekfertility.com/understanding-insurance-benefits/">Insurance guide &rarr;</a></article>
       <article class="scf-card"><h3>Discount Programs</h3><p>See whether you qualify for discounts or medical-risk support programs.</p><a class="scf-card__link" href="https://www.springcreekfertility.com/discount-programs/">Discounts &rarr;</a></article>
       <article class="scf-card"><h3>Refund Programs</h3><p>Review multi-cycle refund program options and eligibility.</p><a class="scf-card__link" href="https://www.springcreekfertility.com/refund-programs/">Refund options &rarr;</a></article>
     </div>
   </div></section>

   <section class="scf-section"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">Financing FAQs</span><h2>Your questions, answered</h2></div>
     {faq_html(fin_faqs)}
   </div></section>
 """,
 "jsonld": {"@context":"https://schema.org","@graph":[
   {"@type":"WebPage","@id":"https://www.springcreekfertility.com/financing-options/#webpage","url":"https://www.springcreekfertility.com/financing-options/","name":"Fertility Financing & Payment Options","isPartOf":{"@id":"https://www.springcreekfertility.com/#website"},"about":{"@id":ORG}},
   {"@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in fin_faqs]},
   {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.springcreekfertility.com/"},{"@type":"ListItem","position":2,"name":"Cost & Financing","item":"https://www.springcreekfertility.com/financing-options/"}]}
 ]},
}

# ---------------- CONTACT ----------------
def loc_card(name, s1, s2, ph, tel, hrs, vflag=False):
    h = f'<strong>Hours:</strong> {hrs}' + (' <em>// VERIFY</em>' if vflag else '')
    return f'''<article class="scf-loc__card">
      <h3>{name}</h3>
      <p class="scf-meta"><strong>Address:</strong> {s1}, {s2}</p>
      <p class="scf-meta"><strong>Phone:</strong> <a href="tel:{tel}">{ph}</a></p>
      <p class="scf-meta">{h}</p>
      <div class="scf-map-ph">Embed Google Map here &middot; // VERIFY</div>
    </article>'''

contact = {
 "slug":"contact","url":"https://www.springcreekfertility.com/contact/","nav_active":"contact",
 "title":"Contact SpringCreek Fertility | Dayton, Columbus &amp; Cincinnati, Ohio",
 "meta_desc":"Contact SpringCreek Fertility in Dayton, Columbus, and Cincinnati, Ohio. Find addresses, phone numbers, and hours, or send us a message to start your fertility journey.",
 "hero_eyebrow":"Contact us",
 "hero_h1":"We'd love to hear from you",
 "hero_sub":"Questions about treatment, scheduling, or insurance? Reach the Ohio location nearest you, or send a message and our team will follow up.",
 "hero_ctas":[("Request an Appointment","appointment.html","scf-btn scf-btn--on-navy scf-btn--lg")],
 "breadcrumb":[("Home","index.html"),("Contact",None)],
 "main_html": f"""
   <section class="scf-section"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">Our locations</span><h2>Three Ohio centers, one caring team</h2></div>
     <div class="scf-loc">
       {loc_card("Dayton Fertility Center","7095 Clyo Road","Dayton (Centerville), OH 45459","(937) 458-5084","+19374585084","Mon–Fri, 7:00 AM–4:00 PM")}
       {loc_card("Columbus Fertility Center","6760 Avery-Muirfield Dr, Suite A","Dublin, OH 43016","(614) 401-4113","+16144014113","Mon–Fri",vflag=True)}
       {loc_card("Cincinnati Fertility Center","9313 Mason Montgomery Road","Mason, OH 45040","(513) 457-5200","+15134575200","Mon–Fri",vflag=True)}
     </div>
   </div></section>

   <section class="scf-section scf-section--tint"><div class="scf-container scf-container--narrow">
     <div class="scf-head"><span class="scf-eyebrow">Send a message</span><h2>Get in touch</h2>
       <p>Prefer to write? Use the form below and our team will respond during business hours.</p></div>
     <form class="scf-form" action="#" method="post" aria-label="Contact form">
       <div class="scf-form__row">
         <div class="scf-field"><label for="c-first">First name</label><input id="c-first" name="first" type="text" autocomplete="given-name" required></div>
         <div class="scf-field"><label for="c-last">Last name</label><input id="c-last" name="last" type="text" autocomplete="family-name" required></div>
       </div>
       <div class="scf-form__row">
         <div class="scf-field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
         <div class="scf-field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" autocomplete="tel"></div>
       </div>
       <div class="scf-field"><label for="c-loc">Preferred location</label>
         <select id="c-loc" name="location"><option>Dayton (Centerville)</option><option>Columbus (Dublin)</option><option>Cincinnati (Mason)</option><option>No preference</option></select></div>
       <div class="scf-field"><label for="c-msg">How can we help?</label><textarea id="c-msg" name="message" rows="5" placeholder="Please don't include sensitive medical details in this message."></textarea></div>
       <div><button class="scf-btn" type="submit">Send Message</button></div>
       <p class="scf-rel">For your privacy, please do not include protected health information in this form. // VERIFY: connect to a secure, HIPAA-appropriate form handler before launch.</p>
     </form>
   </div></section>
 """,
 "jsonld": {"@context":"https://schema.org","@graph":[
   {"@type":"ContactPage","@id":"https://www.springcreekfertility.com/contact/#webpage","url":"https://www.springcreekfertility.com/contact/","name":"Contact SpringCreek Fertility","isPartOf":{"@id":"https://www.springcreekfertility.com/#website"},"about":{"@id":ORG}},
   {"@type":["MedicalOrganization","MedicalBusiness"],"@id":ORG,"name":"SpringCreek Fertility","url":"https://www.springcreekfertility.com/","contactPoint":[
     {"@type":"ContactPoint","telephone":"+1-937-458-5084","contactType":"Dayton (Centerville) office","areaServed":"US"},
     {"@type":"ContactPoint","telephone":"+1-614-401-4113","contactType":"Columbus (Dublin) office","areaServed":"US"},
     {"@type":"ContactPoint","telephone":"+1-513-457-5200","contactType":"Cincinnati (Mason) office","areaServed":"US"}]},
   {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.springcreekfertility.com/"},{"@type":"ListItem","position":2,"name":"Contact","item":"https://www.springcreekfertility.com/contact/"}]}
 ]},
}

# ---------------- APPOINTMENT ----------------
appt = {
 "slug":"appointment","url":"https://www.springcreekfertility.com/appointment/","nav_active":None,
 "title":"Request a Fertility Appointment | SpringCreek Fertility, Ohio",
 "meta_desc":"Request a fertility consultation at SpringCreek Fertility in Dayton, Columbus, or Cincinnati, Ohio. Tell us a little about you and our team will reach out to schedule your first visit.",
 "hero_eyebrow":"Request an appointment",
 "hero_h1":"Start Your Fertility Journey",
 "hero_sub":"Taking the first step is often the hardest part. Tell us a little about you, and our team will reach out to schedule your consultation — with care and no pressure.",
 "hero_ctas":[("Call Dayton: (937) 458-5084","tel:+19374585084","scf-btn scf-btn--on-navy scf-btn--ghost")],
 "breadcrumb":[("Home","index.html"),("Request an Appointment",None)],
 "main_html": f"""
   <section class="scf-section"><div class="scf-container scf-split">
     <div>
       <span class="scf-eyebrow">What to expect</span>
       <h2>Your first visit, made simple</h2>
       <p>Your first appointment is a conversation. A board-certified reproductive endocrinologist reviews your reproductive health and goals, answers your questions, and explains your options in plain language — so you leave with clarity and a sense of what comes next.</p>
       <h3 style="margin-top:1em">What to bring</h3>
       <ul class="scf-list-check">
         <li><span class="scf-check">&#10003;</span> Photo ID and your insurance card</li>
         <li><span class="scf-check">&#10003;</span> A list of current medications</li>
         <li><span class="scf-check">&#10003;</span> Any prior fertility testing or records, if available</li>
         <li><span class="scf-check">&#10003;</span> Your questions — every one is welcome</li>
       </ul>
       <p class="scf-rel">Many patients schedule without a referral, though some plans request one. We can help you check.</p>
     </div>
     <div class="scf-panel">
       <h3>Request your consultation</h3>
       <form class="scf-form" action="#" method="post" aria-label="Appointment request form">
         <div class="scf-form__row">
           <div class="scf-field"><label for="a-first">First name</label><input id="a-first" name="first" type="text" autocomplete="given-name" required></div>
           <div class="scf-field"><label for="a-last">Last name</label><input id="a-last" name="last" type="text" autocomplete="family-name" required></div>
         </div>
         <div class="scf-form__row">
           <div class="scf-field"><label for="a-email">Email</label><input id="a-email" name="email" type="email" autocomplete="email" required></div>
           <div class="scf-field"><label for="a-phone">Phone</label><input id="a-phone" name="phone" type="tel" autocomplete="tel" required></div>
         </div>
         <div class="scf-field"><label for="a-loc">Preferred location</label>
           <select id="a-loc" name="location"><option>Dayton (Centerville)</option><option>Columbus (Dublin)</option><option>Cincinnati (Mason)</option><option>No preference</option></select></div>
         <div class="scf-field"><label for="a-reason">Reason for your visit (optional)</label><textarea id="a-reason" name="reason" rows="3" placeholder="A brief note helps us prepare. Please avoid sensitive medical details here."></textarea></div>
         <div><button class="scf-btn scf-btn--accent" type="submit" style="color:#0B1722">Request My Consultation</button></div>
         <p class="scf-rel">Please do not include protected health information. // VERIFY: connect to a secure scheduling/form handler.</p>
       </form>
     </div>
   </div></section>

   <section class="scf-section scf-section--soft"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">Prefer to call?</span><h2>Reach the location nearest you</h2></div>
     <div class="scf-loc">
       <article class="scf-loc__card"><h3>Dayton</h3><p class="scf-meta">Centerville</p><p><a class="scf-btn scf-btn--ghost" href="tel:+19374585084">(937) 458-5084</a></p></article>
       <article class="scf-loc__card"><h3>Columbus</h3><p class="scf-meta">Dublin</p><p><a class="scf-btn scf-btn--ghost" href="tel:+16144014113">(614) 401-4113</a></p></article>
       <article class="scf-loc__card"><h3>Cincinnati</h3><p class="scf-meta">Mason</p><p><a class="scf-btn scf-btn--ghost" href="tel:+15134575200">(513) 457-5200</a></p></article>
     </div>
   </div></section>
 """,
 "jsonld": {"@context":"https://schema.org","@graph":[
   {"@type":"WebPage","@id":"https://www.springcreekfertility.com/appointment/#webpage","url":"https://www.springcreekfertility.com/appointment/","name":"Request a Fertility Appointment","isPartOf":{"@id":"https://www.springcreekfertility.com/#website"},"about":{"@id":ORG},"potentialAction":{"@type":"ReserveAction","target":"https://www.springcreekfertility.com/appointment/","name":"Request an appointment"}},
   {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.springcreekfertility.com/"},{"@type":"ListItem","position":2,"name":"Request an Appointment","item":"https://www.springcreekfertility.com/appointment/"}]}
 ]},
}

PAGES = [financing, contact, appt]
