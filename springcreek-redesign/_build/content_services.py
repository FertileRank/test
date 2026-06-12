# -*- coding: utf-8 -*-
ORG = "https://www.springcreekfertility.com/#organization"

def faq_html(faqs):
    return '<div class="scf-faq">' + "".join(
        f'<details{" open" if i==0 else ""}><summary>{q}</summary><p>{a}</p></details>'
        for i,(q,a) in enumerate(faqs)) + '</div>'

def steps_html(steps):
    return '<div class="scf-steps">' + "".join(
        f'<div class="scf-step"><h3>{t}</h3><p>{d}</p></div>' for t,d in steps) + '</div>'

def proc_schema(pid, name, desc, how, faqs, crumbs):
    return {"@context":"https://schema.org","@graph":[
      {"@type":"MedicalProcedure","@id":pid,"name":name,"description":desc,
       "procedureType":"https://schema.org/TherapeuticProcedure","howPerformed":how,
       "provider":{"@id":ORG}},
      {"@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]},
      {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":i+1,"name":n,"item":u} for i,(n,u) in enumerate(crumbs)]}
    ]}

# ---------------- IVF & ICSI ----------------
ivf_faqs = [
 ("What is the difference between IVF and ICSI?","In vitro fertilization (IVF) retrieves eggs and combines them with sperm in the laboratory. Intracytoplasmic sperm injection (ICSI) is a step within IVF where a single sperm is injected directly into an egg — often used for male-factor infertility or after prior fertilization difficulty. Your physician recommends ICSI only when it is likely to help."),
 ("How long does one IVF cycle take?","A typical IVF cycle runs about 4–6 weeks from the start of ovarian stimulation through egg retrieval, with embryo transfer either a few days later (fresh) or in a later month (frozen). Preparation and testing may add time before the cycle begins."),
 ("Does SpringCreek have its own IVF laboratory?","Yes. Egg retrieval, fertilization, embryo culture, and cryopreservation are performed in SpringCreek's on-site IVF laboratory, led by a doctoral-level laboratory director and embryology team who work closely with your physician."),
 ("Is IVF painful?","Most steps are well tolerated. Injections use very small needles, and the egg retrieval is a short procedure performed under sedation. Some bloating or cramping afterward is common. Your care team reviews comfort measures with you."),
 ("What are the risks of IVF?","IVF is generally safe, but no procedure is without risk. Possibilities include ovarian hyperstimulation syndrome (OHSS), reaction to medications, risks associated with the retrieval procedure, and a higher chance of multiples if more than one embryo is transferred. Your physician discusses how your plan is designed to reduce these risks. We do not guarantee any particular outcome."),
 ("How many embryos do you transfer?","SpringCreek follows current professional guidance and often recommends single embryo transfer to lower the chance of multiples. The right number depends on your age, embryo quality, and history — your physician explains the tradeoffs so you can decide together."),
 ("Can I have genetic testing on my embryos?","Yes. Preimplantation genetic testing (PGT) can screen embryos for certain genetic conditions. At SpringCreek, genetic testing is coordinated through our embryology laboratory in partnership with accredited reference labs."),
 ("What happens to extra embryos?","Embryos not transferred can be frozen (cryopreserved) for future use. You decide what happens to stored embryos, and our team reviews your options and the associated storage details with you."),
]
ivf = {
 "slug":"ivf-icsi","url":"https://www.springcreekfertility.com/ivf-icsi/","nav_active":"treatments",
 "title":"IVF &amp; ICSI in Ohio | In Vitro Fertilization | SpringCreek Fertility",
 "meta_desc":"IVF and ICSI at SpringCreek Fertility — in vitro fertilization supported by our on-site IVF laboratory in Dayton, Columbus &amp; Cincinnati, Ohio. Learn the process, candidacy, and what to expect.",
 "hero_eyebrow":"Treatments &middot; IVF &amp; ICSI",
 "hero_h1":"In Vitro Fertilization (IVF) &amp; ICSI",
 "hero_sub":"A closely supported path to parenthood — with egg retrieval, fertilization, and embryo care handled by SpringCreek's own on-site IVF laboratory.",
 "hero_ctas":[("Request a Consultation","appointment.html","scf-btn scf-btn--on-navy scf-btn--lg"),("Cost &amp; Financing","financing-options.html","scf-btn scf-btn--on-navy scf-btn--ghost")],
 "breadcrumb":[("Home","index.html"),("Treatments","fertility-treatment.html"),("IVF &amp; ICSI",None)],
 "cta":{"h2":"Talk through IVF with a specialist","p":"A board-certified reproductive endocrinologist will review your history, explain whether IVF or ICSI may help, and answer your questions — no pressure.","buttons":[("Request a Consultation","appointment.html","scf-btn scf-btn--accent scf-btn--lg"),("Call (937) 458-5084","tel:+19374585084","scf-btn scf-btn--ghost scf-btn--on-navy")]},
 "main_html": f"""
   <section class="scf-section"><div class="scf-container"><div class="scf-prose">
     <h2>What is IVF?</h2>
     <p><strong>In vitro fertilization (IVF)</strong> is a treatment in which eggs are retrieved from the ovaries and combined with sperm in a laboratory. A resulting embryo can be transferred to the uterus or frozen for later. <strong>Intracytoplasmic sperm injection (ICSI)</strong> is a step within IVF in which a single sperm is injected directly into an egg — most often used for male-factor infertility or after earlier fertilization difficulty.</p>
     <p>IVF brings together precise hormone management, careful monitoring, and laboratory science. At SpringCreek, those laboratory steps happen in our own on-site IVF laboratory, so your physician and our embryologists coordinate your care closely from start to finish.</p>
     <h3>Who might consider IVF or ICSI?</h3>
     <ul>
       <li>Blocked or absent fallopian tubes, or prior tubal surgery</li>
       <li>Male-factor infertility (where ICSI is often helpful)</li>
       <li>Ovulation disorders or diminished ovarian reserve</li>
       <li>Endometriosis affecting fertility</li>
       <li>Unexplained infertility, or treatments such as IUI that have not led to pregnancy</li>
       <li>Use of donor eggs, donor sperm, or a gestational carrier</li>
       <li>A wish to use preimplantation genetic testing (PGT)</li>
     </ul>
     <p>Whether IVF is right for you is a personal, individualized decision your physician helps you make after a thorough evaluation.</p>
   </div></div></section>

   <section class="scf-section scf-section--tint"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">The process</span><h2>What an IVF cycle looks like</h2>
       <p>Every plan is tailored, but most cycles follow these stages over roughly four to six weeks.</p></div>
     {steps_html([
       ("Evaluation &amp; planning","A thorough review and testing help your physician design a protocol suited to you."),
       ("Ovarian stimulation","Medications encourage several eggs to mature, monitored with ultrasounds and bloodwork."),
       ("Egg retrieval","A short procedure under sedation collects the eggs — performed in our care."),
       ("Fertilization (with ICSI if needed)","Our embryology team fertilizes the eggs in the on-site IVF laboratory."),
       ("Embryo culture","Embryos are grown and assessed over several days in the laboratory."),
       ("Transfer &amp; next steps","An embryo is transferred to the uterus, or frozen for a future cycle; a pregnancy test follows."),
     ])}
   </div></section>

   <section class="scf-section scf-section--navy"><div class="scf-container scf-split">
     <div><span class="scf-eyebrow">On-site IVF laboratory</span><h2>Science and care, side by side</h2>
       <p>Keeping embryology in-house means your eggs and embryos stay within our practice, cared for by a doctoral-level laboratory director and embryology team in direct communication with your physician. It also streamlines the logistics of fertilization, embryo culture, freezing, and genetic-testing coordination.</p>
       <p>Genetic testing, including <strong>preimplantation genetic testing (PGT)</strong>, is coordinated through our embryology laboratory in partnership with accredited reference labs.</p></div>
     <div class="scf-panel" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.18)">
       <h3 style="color:#fff">A note on expectations</h3>
       <p style="color:rgba(255,255,255,.9)">IVF success depends on many personal factors, including age and diagnosis. We share honest, individualized information and current data — and we never promise a specific outcome. Reported clinic outcomes are available through the <a href="https://www.sartcorsonline.com/CSR/PublicMultYear?ClinicPKID=2000067" style="color:#fff;text-decoration-color:#90C962">Society for Assisted Reproductive Technology (SART)</a>.</p>
     </div>
   </div></section>

   <section class="scf-section"><div class="scf-container"><div class="scf-prose">
     <h2>Caring for the whole you</h2>
     <p>IVF can be an emotional experience as much as a medical one. Your care team offers clear explanations, responsive answers, and support for your emotional well-being throughout. You are never just a chart number here — you are a person we are walking beside.</p>
     <h3>Understanding the risks</h3>
     <p>IVF is generally safe, but every medical treatment carries some risk. These can include ovarian hyperstimulation syndrome (OHSS), reactions to medications, risks related to the egg-retrieval procedure, and a higher chance of a multiple pregnancy if more than one embryo is transferred. Your physician reviews how your individual plan is designed to reduce these risks and answers every question before you begin.</p>
   </div></div></section>

   <section class="scf-section scf-section--soft"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">IVF &amp; ICSI FAQs</span><h2>Your questions, answered</h2></div>
     {faq_html(ivf_faqs)}
   </div></section>
 """,
 "jsonld": proc_schema("https://www.springcreekfertility.com/ivf-icsi/#procedure","In Vitro Fertilization (IVF) and ICSI",
   "IVF retrieves eggs and combines them with sperm in SpringCreek's on-site laboratory; ICSI injects a single sperm into an egg when helpful.",
   "Ovarian stimulation, egg retrieval, laboratory fertilization (with ICSI when indicated), embryo culture, and transfer or cryopreservation.",
   ivf_faqs, [("Home","https://www.springcreekfertility.com/"),("Treatments","https://www.springcreekfertility.com/fertility-treatment/"),("IVF & ICSI","https://www.springcreekfertility.com/ivf-icsi/")]),
}

# ---------------- EGG FREEZING ----------------
ef_faqs = [
 ("What is egg freezing?","Egg freezing, or oocyte cryopreservation, retrieves mature eggs and freezes them so they can be stored for a possible future pregnancy. When you are ready, eggs can be thawed, fertilized, and transferred as part of an IVF cycle."),
 ("Who considers egg freezing?","People who want to preserve fertility for the future — for example, those focusing on education or career, awaiting the right time or partner, or facing a medical treatment (such as for cancer) that may affect fertility. Your physician helps you decide whether it fits your goals."),
 ("Is there an ideal age to freeze eggs?","Egg quality and quantity generally decline with age, so freezing earlier often yields more usable eggs. That said, the right time is individual. A fertility evaluation, including ovarian reserve testing, gives you personalized information."),
 ("How long does the egg freezing process take?","The active cycle usually takes about two weeks of monitoring and medication, ending with a short egg-retrieval procedure under sedation."),
 ("How long can eggs stay frozen?","Eggs can remain frozen for years with no clear time limit on storage. Your care team reviews storage details and options with you."),
 ("Does freezing my eggs guarantee a future pregnancy?","No. Egg freezing preserves options, but it cannot guarantee a future pregnancy. The number and quality of eggs, your age at freezing, and later steps all play a role. We share honest, individualized information."),
 ("Where is the egg freezing performed?","Egg retrieval and cryopreservation are handled by SpringCreek's on-site IVF laboratory and embryology team, coordinated with your physician."),
 ("How much does egg freezing cost?","Costs vary by plan and medications. Our financial counselor reviews pricing and any financing options with you — see our cost &amp; financing page."),
]
egg = {
 "slug":"egg-freezing","url":"https://www.springcreekfertility.com/egg-freezing/","nav_active":"treatments",
 "title":"Egg Freezing in Ohio | Oocyte Cryopreservation | SpringCreek Fertility",
 "meta_desc":"Egg freezing (oocyte cryopreservation) at SpringCreek Fertility in Dayton, Columbus &amp; Cincinnati, Ohio. Preserve fertility for the future with care from our on-site IVF laboratory.",
 "hero_eyebrow":"Treatments &middot; Egg Freezing",
 "hero_h1":"Egg Freezing &amp; Fertility Preservation",
 "hero_sub":"Preserve options for your future. Egg freezing lets you store mature eggs now — supported by SpringCreek's on-site IVF laboratory and a team that explains every step.",
 "hero_ctas":[("Request a Consultation","appointment.html","scf-btn scf-btn--on-navy scf-btn--lg"),("Cost &amp; Financing","financing-options.html","scf-btn scf-btn--on-navy scf-btn--ghost")],
 "breadcrumb":[("Home","index.html"),("Treatments","fertility-treatment.html"),("Egg Freezing",None)],
 "cta":{"h2":"Explore egg freezing with a specialist","p":"Curious whether egg freezing fits your plans? A reproductive endocrinologist will review your options and answer your questions.","buttons":[("Request a Consultation","appointment.html","scf-btn scf-btn--accent scf-btn--lg"),("Talk to Our Team","contact.html","scf-btn scf-btn--ghost scf-btn--on-navy")]},
 "main_html": f"""
   <section class="scf-section"><div class="scf-container"><div class="scf-prose">
     <h2>What is egg freezing?</h2>
     <p>Egg freezing — clinically called <strong>oocyte cryopreservation</strong> — is a way to preserve fertility. Mature eggs are retrieved from the ovaries and frozen, then stored until you are ready to use them. At that point, eggs can be thawed, fertilized in the laboratory, and transferred as part of an <strong>in vitro fertilization (IVF)</strong> cycle.</p>
     <p>Freezing eggs does not make decisions for you; it simply preserves options while you focus on what matters now.</p>
     <h3>Reasons people freeze their eggs</h3>
     <ul>
       <li>Wanting to focus on education, career, or personal goals before starting a family</li>
       <li>Not yet being ready, or waiting for the right partner or time</li>
       <li>Preserving fertility before a medical treatment (such as for cancer) that may affect the ovaries</li>
       <li>A family history or condition that may affect ovarian reserve</li>
     </ul>
   </div></div></section>

   <section class="scf-section scf-section--tint"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">The process</span><h2>What egg freezing involves</h2>
       <p>The active cycle usually takes about two weeks.</p></div>
     {steps_html([
       ("Evaluation","A consultation and ovarian reserve testing give you personalized information."),
       ("Ovarian stimulation","Medications help several eggs mature, with monitoring by ultrasound and bloodwork."),
       ("Egg retrieval","A short procedure under sedation collects the mature eggs."),
       ("Freezing &amp; storage","Eggs are frozen and stored in our on-site IVF laboratory until you are ready."),
     ])}
   </div></section>

   <section class="scf-section"><div class="scf-container"><div class="scf-prose">
     <h2>Using your frozen eggs later</h2>
     <p>When you decide to pursue pregnancy, your eggs are thawed and fertilized in the laboratory, and a resulting embryo can be transferred to the uterus. Your physician reviews what to expect at that stage based on your individual situation.</p>
     <h3>An honest word on expectations</h3>
     <p>Egg freezing preserves options, but it cannot guarantee a future pregnancy. The number and quality of eggs retrieved, your age at the time of freezing, and later steps all matter. We believe in clear, realistic, individualized information so you can plan with confidence — never promises.</p>
     <h3>Understanding the risks</h3>
     <p>The egg-freezing cycle is generally well tolerated. As with any treatment using ovarian-stimulation medication, possible risks include ovarian hyperstimulation syndrome (OHSS) and reactions to medication, plus the usual considerations of a minor procedure. Your physician reviews these with you in detail.</p>
   </div></div></section>

   <section class="scf-section scf-section--soft"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">Egg Freezing FAQs</span><h2>Your questions, answered</h2></div>
     {faq_html(ef_faqs)}
   </div></section>
 """,
 "jsonld": proc_schema("https://www.springcreekfertility.com/egg-freezing/#procedure","Egg Freezing (Oocyte Cryopreservation)",
   "Mature eggs are retrieved and frozen for storage, to be thawed and used in a future IVF cycle.",
   "Ovarian stimulation, monitoring, egg retrieval under sedation, and cryopreservation in the on-site IVF laboratory.",
   ef_faqs, [("Home","https://www.springcreekfertility.com/"),("Treatments","https://www.springcreekfertility.com/fertility-treatment/"),("Egg Freezing","https://www.springcreekfertility.com/egg-freezing/")]),
}

# ---------------- LGBTQIA+ FAMILY BUILDING ----------------
lgbt_faqs = [
 ("Is SpringCreek Fertility LGBTQ+ friendly?","Yes. SpringCreek provides inclusive, affirming care for LGBTQ+ individuals and couples and for single parents by choice. Our intake, paperwork, and care are designed to welcome diverse family structures."),
 ("What options are available for female couples?","Options often include intrauterine insemination (IUI) or in vitro fertilization (IVF) using donor sperm. Some couples choose reciprocal IVF, where one partner provides the eggs and the other carries the pregnancy. Your physician helps you choose what fits your goals."),
 ("What options are available for male couples?","Building a family typically involves donor eggs and a gestational carrier, with in vitro fertilization. SpringCreek coordinates the medical steps and connects you with counseling and reproductive-law resources."),
 ("Can transgender individuals preserve fertility?","Yes. Fertility preservation — such as egg or sperm freezing — may be an option before or during gender-affirming care. The best timing is individual; a consultation provides personalized guidance."),
 ("Do single people use these services too?","Absolutely. Single parents by choice are welcome. Depending on your goals, options may include donor sperm with IUI or IVF, or donor eggs with a gestational carrier."),
 ("Do we need a fertility diagnosis to start?","No. Many LGBTQ+ patients and single parents by choice come to us to build a family rather than to treat infertility. We start with a consultation to understand your goals and map the options."),
 ("Does SpringCreek help with donor selection and legal steps?","We guide the medical process and connect you with our network of counseling and reproductive-law professionals for donor agreements and other legal considerations."),
 ("Where do you provide LGBTQ+ family-building care?","At all three SpringCreek locations — Dayton, Columbus (Dublin), and Cincinnati (Mason) — with laboratory steps coordinated through our on-site IVF laboratory."),
]
lgbt = {
 "slug":"lgbtqia-family-building","url":"https://www.springcreekfertility.com/lgbtqia-family-building/","nav_active":"treatments",
 "title":"LGBTQIA+ Family Building in Ohio | SpringCreek Fertility",
 "meta_desc":"Inclusive LGBTQIA+ family building at SpringCreek Fertility — affirming care for LGBTQ+ couples, individuals, and single parents by choice in Dayton, Columbus &amp; Cincinnati, Ohio.",
 "hero_eyebrow":"Treatments &middot; Inclusive care",
 "hero_h1":"LGBTQIA+ Family Building",
 "hero_sub":"Your family, your way. SpringCreek offers affirming, inclusive guidance for LGBTQ+ individuals and couples and single parents by choice — at every step toward parenthood.",
 "hero_ctas":[("Request a Consultation","appointment.html","scf-btn scf-btn--on-navy scf-btn--lg"),("Explore Treatments","fertility-treatment.html","scf-btn scf-btn--on-navy scf-btn--ghost")],
 "breadcrumb":[("Home","index.html"),("Treatments","fertility-treatment.html"),("LGBTQIA+ Family Building",None)],
 "cta":{"h2":"Let's build your family together","p":"Wherever you are starting from, our team will listen and map the options with you. Inclusive care is at the heart of what we do.","buttons":[("Request a Consultation","appointment.html","scf-btn scf-btn--accent scf-btn--lg"),("Talk to Our Team","contact.html","scf-btn scf-btn--ghost scf-btn--on-navy")]},
 "main_html": f"""
   <section class="scf-section"><div class="scf-container"><div class="scf-prose">
     <h2>Inclusive care for every path to parenthood</h2>
     <p>At SpringCreek Fertility, our doors and our hearts are open to everyone who wants to build a family. We provide affirming, LGBTQ+ inclusive care for individuals and couples and for single parents by choice, and we welcome diverse family structures of all kinds. You will be met with respect, clear explanations, and compassionate support — never assumptions.</p>
     <p>Many people who come to us are not treating infertility at all; they are simply building a family. We start by listening to your goals, then walk you through the options that fit.</p>
   </div></div></section>

   <section class="scf-section scf-section--tint"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">Paths to parenthood</span><h2>Options we help you explore</h2></div>
     <div class="scf-grid scf-grid--2">
       <article class="scf-card"><h3>Female couples</h3><p>Intrauterine insemination (IUI) or in vitro fertilization (IVF) using donor sperm. Some couples choose <strong>reciprocal IVF</strong>, where one partner provides the eggs and the other carries the pregnancy — a meaningful way for both to share in the journey.</p></article>
       <article class="scf-card"><h3>Male couples</h3><p>Family building with donor eggs and a gestational carrier, using IVF. We coordinate the medical steps and connect you with counseling and reproductive-law resources for donor and carrier arrangements.</p></article>
       <article class="scf-card"><h3>Transgender &amp; nonbinary individuals</h3><p>Fertility preservation, such as egg or sperm freezing, may be an option before or during gender-affirming care. We provide individualized guidance on timing and choices.</p></article>
       <article class="scf-card"><h3>Single parents by choice</h3><p>Donor sperm with IUI or IVF, or donor eggs with a gestational carrier — tailored to your goals, with support throughout.</p></article>
     </div>
   </div></section>

   <section class="scf-section"><div class="scf-container"><div class="scf-prose">
     <h2>How SpringCreek supports you</h2>
     <p>Beyond clinical care, we connect you with a trusted network of mental-health and reproductive-law professionals, so the counseling and legal pieces of third-party reproduction are handled with the same care as the medical steps. Laboratory steps are coordinated through our on-site IVF laboratory, keeping your care connected across the practice.</p>
     <h3>Getting started</h3>
     <p>Your first visit is a conversation. A reproductive endocrinologist learns about your goals, reviews any helpful testing, and explains the options in plain language — so you can decide on next steps with confidence and support.</p>
   </div></div></section>

   <section class="scf-section scf-section--soft"><div class="scf-container">
     <div class="scf-head"><span class="scf-eyebrow">LGBTQIA+ Family Building FAQs</span><h2>Your questions, answered</h2></div>
     {faq_html(lgbt_faqs)}
   </div></section>
 """,
 "jsonld": proc_schema("https://www.springcreekfertility.com/lgbtqia-family-building/#service","LGBTQIA+ Family Building",
   "Inclusive, affirming fertility care for LGBTQ+ individuals and couples and single parents by choice, including donor and gestational-carrier paths.",
   "Individualized planning using IUI, IVF, reciprocal IVF, donor gametes, gestational carriers, and fertility preservation, with counseling and legal coordination.",
   lgbt_faqs, [("Home","https://www.springcreekfertility.com/"),("Treatments","https://www.springcreekfertility.com/fertility-treatment/"),("LGBTQIA+ Family Building","https://www.springcreekfertility.com/lgbtqia-family-building/")]),
}

PAGES = [ivf, egg, lgbt]
