# -*- coding: utf-8 -*-
import content_helpers as h

PAGES = []

# New Patient Resources
PAGES.append(h.page("new-patient-resources",
  "New Patient Resources | SpringCreek Fertility, Ohio",
  "New patient resources for SpringCreek Fertility — what to expect at your first visit, what to bring, insurance, and how to prepare. Dayton, Columbus &amp; Cincinnati.",
  "For patients", "New Patient Resources",
  "Everything you need to feel prepared and confident before your first visit.",
  h.prose('<h2>Welcome to SpringCreek</h2>',
    '<p>Starting fertility care is a big step, and we want your first visit to feel reassuring rather than overwhelming. Below is what to expect and how to prepare.</p>')
  + h.checklist("Before your visit", "What to bring", "A little preparation helps us make the most of your time together:",
      ["Photo ID and your insurance card", "A list of current medications and supplements",
       "Any prior fertility testing, imaging, or records", "Relevant menstrual-cycle and health history",
       "Your questions — every one is welcome"], tint=False)
  + h.steps("Your first visit", "What to expect", [
      ("A thorough review", "Your physician reviews your reproductive health, history, and goals."),
      ("Clear options", "You receive plain-language explanations — no pressure, no jargon."),
      ("A plan and next steps", "Together you decide on any testing and what comes next."),
    ], tint=True)
  + h.prose('<h2>Helpful links</h2>',
    '<p>Explore <a href="understanding-insurance-benefits.html">insurance benefits</a>, <a href="financing-options.html">cost &amp; financing</a>, our <a href="fertility-faqs.html">fertility FAQs</a>, and the <a href="fertility-library.html">fertility library</a>. When you are ready, <a href="appointment.html">request a consultation</a>.</p>'),
  h.crumbs(("Home", "index.html"), ("For Patients", None), ("New Patient Resources", None)),
  h.graph(h.webpage(h.BASE + "/new-patient-resources/", "New Patient Resources"),
          h.bc_schema([("Home", h.BASE + "/"), ("New Patient Resources", h.BASE + "/new-patient-resources/")]))))

# Referring Providers
PAGES.append(h.page("referring-providers",
  "For Referring Providers | SpringCreek Fertility, Ohio",
  "Information for OB/GYNs and primary care providers referring patients to SpringCreek Fertility in Dayton, Columbus &amp; Cincinnati, Ohio.",
  "For providers", "For Referring Providers",
  "Partnering with Ohio's OB/GYNs and primary care providers to support patients on their fertility journey.",
  h.prose('<h2>Thank you for trusting us with your patients</h2>',
    '<p>SpringCreek Fertility partners with referring physicians across Ohio to provide reproductive endocrinology care with clear communication and timely updates. Your patients benefit from board-certified specialists, an on-site IVF laboratory, and a compassionate, coordinated approach.</p>',
    '<h2>How to refer</h2>',
    '<p>Patients may self-refer, and we also welcome direct referrals. To refer a patient, contact the location nearest them — <a href="dayton-fertility-center.html">Dayton</a>, <a href="columbus-fertility-center.html">Columbus (Dublin)</a>, or <a href="cincinnati-fertility-center.html">Cincinnati (Mason)</a> — or reach our team through our <a href="contact.html">contact page</a>. <span class="scf-rel">// VERIFY referral fax/portal details.</span></p>')
  + h.cards_head("What we offer your patients", "Coordinated specialty care", [
      ("Comprehensive evaluation", "Thorough fertility evaluation for individuals and couples."),
      ("Advanced treatment", "IUI, IVF &amp; ICSI, egg freezing, donor and third-party programs."),
      ("Clear communication", "Timely updates so you stay informed about shared patients."),
    ]),
  h.crumbs(("Home", "index.html"), ("For Providers", None), ("Referring Providers", None)),
  h.graph(h.webpage(h.BASE + "/referring-providers/", "For Referring Providers"),
          h.bc_schema([("Home", h.BASE + "/"), ("Referring Providers", h.BASE + "/referring-providers/")])),
  cta={"h2": "Refer a patient or ask a question", "p": "Our team is here to support you and your patients with coordinated, compassionate fertility care.",
       "buttons": [("Contact Our Team", "contact.html", "scf-btn scf-btn--accent scf-btn--lg")]},
  verify=["Referral fax/portal process"]))

# Staying Connected
PAGES.append(h.page("staying-connected",
  "Staying Connected | SpringCreek Fertility, Ohio",
  "Stay connected with SpringCreek Fertility — follow our blog and social channels for fertility education, patient stories, and practice news.",
  "Community", "Staying Connected",
  "Education, encouragement, and community — wherever you are on your journey.",
  h.prose('<h2>Stay in touch</h2>',
    '<p>A fertility journey is easier with information and community. Follow SpringCreek for clear, compassionate fertility education, patient stories shared with consent, and updates from our practice.</p>')
  + h.cards_head("Follow along", "Where to find us", [
      ("SpringCreek Blog", "Personal stories, fertility news, and the latest from our practice.", "blog.html"),
      ("Facebook", "Community, encouragement, and updates.", "https://www.facebook.com/SpringCreekFertility"),
      ("Instagram", "Education and behind-the-scenes from our team.", "https://www.instagram.com/springcreek_fertility/"),
      ("LinkedIn", "Practice news and professional updates.", "https://www.linkedin.com/company/springcreek-fertility"),
      ("YouTube", "Videos answering common fertility questions.", "https://www.youtube.com/channel/UC9j44LjwMOgALcv6LyLtv9A"),
      ("Fertility Library", "Browse our educational articles.", "fertility-library.html"),
    ], cols=3),
  h.crumbs(("Home", "index.html"), ("Community", None), ("Staying Connected", None)),
  h.graph(h.webpage(h.BASE + "/staying-connected/", "Staying Connected"),
          h.bc_schema([("Home", h.BASE + "/"), ("Staying Connected", h.BASE + "/staying-connected/")]))))

# Fertility Library (article index)
PAGES.append(h.page("fertility-library",
  "Fertility Library | Education &amp; Articles | SpringCreek Fertility",
  "The SpringCreek Fertility Library — clear, compassionate articles on infertility, causes, myths, and tips to support your fertility journey.",
  "Learn", "Fertility Library",
  "Clear, compassionate answers to the questions patients ask most — written to inform, not to overwhelm.",
  h.cards_head("Start here", "Understanding fertility", [
      ("Infertility, Defined", "What infertility means and when to seek care.", "infertility-defined.html"),
      ("What Causes Infertility?", "Common factors that affect the ability to conceive.", "what-causes-infertility.html"),
      ("Quick Facts About Infertility", "At-a-glance facts to ground your understanding.", "quick-facts-about-infertility.html"),
      ("Myths About Fertility", "Separating common myths from the evidence.", "myths-about-fertility-diagnosis.html"),
      ("Acronym &amp; Abbreviation Guide", "Decode IVF, IUI, REI, PGT, and more.", "acronym-abbreviation-guide.html"),
      ("Fertility FAQs", "Answers to the questions we hear most.", "fertility-faqs.html"),
    ], cols=3, sub="Browse our articles below, or visit the broader fertility resources page for support organizations.")
  + h.cards_head("Tips &amp; lifestyle", "Supporting your fertility", [
      ("Tips for Getting Pregnant Faster", "Evidence-informed timing and habits.", "tips-for-getting-pregnant-faster.html"),
      ("Tips to Optimize Fertility", "Lifestyle factors that may help.", "tips-to-optimize-fertility.html"),
      ("Fertility Foods", "Nutrition and a fertility-friendly diet.", "fertility-foods.html"),
    ], cols=3, tint=False),
  h.crumbs(("Home", "index.html"), ("Learn", None), ("Fertility Library", None)),
  h.graph({"@type": "CollectionPage", "@id": h.BASE + "/fertility-library/#webpage", "url": h.BASE + "/fertility-library/",
           "name": "Fertility Library", "isPartOf": {"@id": h.BASE + "/#website"}, "about": {"@id": h.ORG}},
          h.bc_schema([("Home", h.BASE + "/"), ("Fertility Library", h.BASE + "/fertility-library/")])),
  cta={"h2": "Have a question we haven't answered?", "p": "Our team is happy to help. Request a consultation or reach out anytime.",
       "buttons": [("Request a Consultation", "appointment.html", "scf-btn scf-btn--accent scf-btn--lg"), ("Contact Us", "contact.html", "scf-btn scf-btn--ghost scf-btn--on-navy")]}))

# Fertility Resources (external support)
PAGES.append(h.page("fertility-resources",
  "Fertility Resources &amp; Support | SpringCreek Fertility, Ohio",
  "Trusted fertility resources and support organizations — RESOLVE, ASRM, SART, and CDC — plus financial and emotional support, curated by SpringCreek Fertility.",
  "Support", "Fertility Resources &amp; Support",
  "Helpful organizations and tools to support you — beyond the walls of our clinic.",
  h.prose('<h2>You are not alone</h2>',
    '<p>A fertility journey can touch every part of life. Alongside our own <a href="fertility-library.html">fertility library</a>, these trusted national organizations offer education, community, and support. (Links open external sites we don&rsquo;t control.)</p>')
  + h.cards_head("Trusted organizations", "Education &amp; community", [
      ("RESOLVE", "The National Infertility Association — support groups and advocacy.", "https://resolve.org/"),
      ("ASRM", "American Society for Reproductive Medicine — patient education.", "https://www.reproductivefacts.org/"),
      ("SART", "Society for Assisted Reproductive Technology — clinic data.", "https://www.sart.org/"),
      ("CDC ART", "U.S. assisted reproductive technology data and reports.", "https://www.cdc.gov/art/"),
      ("LIVESTRONG Fertility", "Support for fertility preservation after a cancer diagnosis.", "https://www.livestrong.org/we-can-help/livestrong-fertility"),
      ("SpringCreek Financing", "Our own cost, financing, and discount resources.", "financing-options.html"),
    ], cols=3)
  + h.prose('<h2>Emotional well-being matters</h2>',
    '<p>Fertility challenges can be emotionally demanding. We can connect you with counseling resources as part of your care. Please <a href="contact.html">reach out</a> — supporting your emotional well-being is part of how we care for you.</p>'),
  h.crumbs(("Home", "index.html"), ("Support", None), ("Fertility Resources", None)),
  h.graph(h.webpage(h.BASE + "/fertility-resources/", "Fertility Resources & Support"),
          h.bc_schema([("Home", h.BASE + "/"), ("Fertility Resources", h.BASE + "/fertility-resources/")]))))

# Blog index
PAGES.append(h.page("blog",
  "Blog | SpringCreek Fertility, Ohio",
  "The SpringCreek Fertility blog — fertility education, patient stories shared with consent, and news from our Dayton, Columbus &amp; Cincinnati practice.",
  "Blog", "The SpringCreek Fertility Blog",
  "Personal stories, fertility education, and the latest from our practice.",
  h.prose('<h2>Stories and education, from our team to you</h2>',
    '<p>Our blog shares clear fertility education, patient stories shared with consent, and updates from across our Ohio practice. New posts are published regularly. <span class="scf-rel">// VERIFY: connect this index to your live blog feed/CMS.</span></p>')
  + h.cards_head("Recent topics", "From the blog", [
      ("LGBTQIA+ Family Building Options", "Inclusive paths to parenthood.", "lgbtqia-family-building.html"),
      ("Understanding Your Fertility Treatment Options", "From evaluation to advanced care.", "fertility-treatment.html"),
      ("Egg Freezing: Planning Ahead", "What preservation involves and who considers it.", "egg-freezing.html"),
      ("What to Expect at Your First Visit", "Preparing for your consultation.", "new-patient-resources.html"),
      ("Fertility Foods &amp; Lifestyle", "Nutrition that supports fertility.", "fertility-foods.html"),
      ("Myths About Fertility", "Separating myth from evidence.", "myths-about-fertility-diagnosis.html"),
    ], cols=3),
  h.crumbs(("Home", "index.html"), ("Blog", None)),
  h.graph({"@type": "Blog", "@id": h.BASE + "/blog/#blog", "url": h.BASE + "/blog/", "name": "SpringCreek Fertility Blog", "publisher": {"@id": h.ORG}},
          h.bc_schema([("Home", h.BASE + "/"), ("Blog", h.BASE + "/blog/")])),
  verify=["Connect to live blog feed/CMS"]))
