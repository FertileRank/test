# -*- coding: utf-8 -*-
import content_helpers as h

PAGES = []

# Become an Egg Donor
donor_faqs = [
 ("Who can become an egg donor?", "Egg donors are generally healthy individuals within a defined age range, with regular cycles and a willingness to complete medical and psychological screening. Specific criteria apply. // VERIFY exact age range and requirements."),
 ("Is egg donation compensated?", "Qualified donors receive compensation for their time and commitment, and medical and screening costs related to the donation are covered. // VERIFY current compensation details."),
 ("Is egg donation safe?", "Egg donation is a well-established process performed under the care of board-certified physicians, with close monitoring. Your care team reviews the process and any risks with you."),
 ("How long does the process take?", "From application through screening to retrieval typically spans a few months, with the active cycle lasting about two weeks. The retrieval is a short outpatient procedure."),
 ("Will donating affect my own fertility?", "Current evidence indicates that egg donation does not reduce a donor's own future fertility. Your physician will discuss this with you in detail."),
]
PAGES.append(h.page("become-an-egg-donor",
  "Become an Egg Donor in Ohio | SpringCreek Fertility",
  "Become an egg donor with SpringCreek Fertility in Ohio — help build families with compassionate, board-certified care. Learn about eligibility and the process.",
  "Give the gift of family", "Become an Egg Donor",
  "Help build a family. Egg donors give an extraordinary gift — with the support of a caring, physician-led team.",
  h.prose('<h2>A meaningful way to help</h2>',
    '<p>For many individuals and families, an egg donor makes parenthood possible. If you are a healthy person interested in giving this gift, SpringCreek&rsquo;s compassionate, board-certified team will guide and support you through every step.</p>')
  + h.checklist("Eligibility", "You may qualify if you are", "General guidelines are below; our team confirms eligibility during screening:",
      ["Within the program&rsquo;s age range (// VERIFY exact range)", "In good general health with regular menstrual cycles",
       "A non-smoker, without recreational drug use", "Willing to complete medical and psychological screening",
       "Reliable and committed to the process"], tint=False)
  + h.steps("The process", "What to expect as a donor", [
      ("Apply", "Complete a confidential application to begin."),
      ("Screening", "Medical and psychological screening, following professional guidelines."),
      ("Cycle &amp; monitoring", "A short medication cycle with close monitoring."),
      ("Retrieval", "A brief outpatient egg-retrieval procedure."),
    ], tint=True)
  + h.prose('<h2>Ready to learn more?</h2>',
    '<p>If you are interested in becoming an egg donor, <a href="contact.html">contact our team</a> to learn about eligibility, compensation, and next steps. <span class="scf-rel">// VERIFY: link to the donor application/portal and current compensation.</span></p>'),
  h.crumbs(("Home", "index.html"), ("Become an Egg Donor", None)),
  h.graph(h.webpage(h.BASE + "/become-an-egg-donor/", "Become an Egg Donor"),
          h.faq_schema(donor_faqs),
          h.bc_schema([("Home", h.BASE + "/"), ("Become an Egg Donor", h.BASE + "/become-an-egg-donor/")])),
  cta={"h2": "Give the gift of family", "p": "Reach out to learn about becoming an egg donor with SpringCreek Fertility.",
       "buttons": [("Contact Our Team", "contact.html", "scf-btn scf-btn--accent scf-btn--lg")]},
  verify=["Donor age range/requirements", "Compensation details", "Application/portal link"]))

# Patient Testimonials
PAGES.append(h.page("testimonials",
  "Patient Testimonials | SpringCreek Fertility, Ohio",
  "Read patient experiences with SpringCreek Fertility, shared with consent. Real stories of compassionate, personalized fertility care in Ohio.",
  "Patient stories", "Patient Testimonials",
  "In our patients' words. Real stories, shared with consent — because feeling supported matters.",
  '<section class="scf-section"><div class="scf-container"><div class="scf-grid scf-grid--2">'
  + "".join('<div class="scf-quote"><blockquote>&ldquo;[Approved, consent-based patient testimonial. Use language that reflects the patient&rsquo;s genuine experience of feeling supported and informed, without describing a specific clinical outcome or implying a typical result.]&rdquo;</blockquote><div class="scf-attrib">&mdash; First name or initials, City, OH</div></div>' for _ in range(2))
  + '</div></div></section>'
  + h.prose('<p class="scf-disclaimer" style="text-align:center">Testimonials reflect individual experiences and are shared with patient consent. They are not a prediction or guarantee of any particular result; outcomes vary from person to person. No patient-identifiable health information is published without written authorization.</p>',
    '<p style="text-align:center">// VERIFY: replace the framework quotes above with approved, consent-based testimonials, and add Review schema with real data.</p>'),
  h.crumbs(("Home", "index.html"), ("Patient Testimonials", None)),
  h.graph(h.webpage(h.BASE + "/testimonials/", "Patient Testimonials"),
          h.bc_schema([("Home", h.BASE + "/"), ("Patient Testimonials", h.BASE + "/testimonials/")])),
  verify=["Replace framework quotes with consented testimonials; add Review schema with real data"]))

# IVF Success Rates
PAGES.append(h.page("ivf-success-rates",
  "Understanding IVF Success Rates | SpringCreek Fertility, Ohio",
  "How to understand IVF success rates — what the numbers mean, why individual factors matter, and where to find SpringCreek's reported SART data.",
  "Outcomes", "Understanding IVF Success Rates",
  "Success rates can inform your decisions — if you know how to read them. Here's an honest guide.",
  h.prose('<h2>What &ldquo;success rate&rdquo; really means</h2>',
    '<p>IVF outcomes depend heavily on individual factors — especially age and diagnosis — so a single clinic-wide number can be misleading when applied to any one person. Reported rates also vary by how they are measured (per cycle, per transfer, per patient).</p>',
    '<h2>Where to find reported data</h2>',
    '<p>SpringCreek reports outcomes to the <strong>Society for Assisted Reproductive Technology (SART)</strong>. You can review our clinic&rsquo;s reported figures directly: <a href="https://www.sartcorsonline.com/CSR/PublicMultYear?ClinicPKID=2000067" rel="noopener">SpringCreek Fertility SART report</a>. National data is also published by the <a href="https://www.cdc.gov/art/" rel="noopener">CDC&rsquo;s ART program</a>. <span class="scf-rel">// VERIFY: do not publish specific percentages here unless pulled directly from the current SART/CDC report.</span></p>',
    '<h2>What matters most for you</h2>',
    '<p>The most meaningful estimate is the one your physician can give you after reviewing your individual situation. We share honest, individualized information and current data — and we never promise a specific outcome.</p>'),
  h.crumbs(("Home", "index.html"), ("IVF Success Rates", None)),
  h.graph(h.webpage(h.BASE + "/ivf-success-rates/", "Understanding IVF Success Rates", "MedicalWebPage"),
          h.bc_schema([("Home", h.BASE + "/"), ("IVF Success Rates", h.BASE + "/ivf-success-rates/")])),
  verify=["Only publish figures pulled directly from the current SART/CDC report"]))

# Careers
PAGES.append(h.page("careers",
  "Careers at SpringCreek Fertility | Join Our Ohio Team",
  "Explore careers at SpringCreek Fertility — join a patient-centered, physician-led reproductive medicine team in Dayton, Columbus &amp; Cincinnati, Ohio.",
  "Join us", "Careers at SpringCreek",
  "Help build families. Join a team that puts patients — and each other — first.",
  h.prose('<h2>Work that matters</h2>',
    '<p>At SpringCreek Fertility, our people are the heart of our care. We look for compassionate, dedicated professionals who want to make a real difference for patients on their journey to parenthood.</p>')
  + h.cards_head("Why join us", "What we offer our team", [
      ("Meaningful work", "Help individuals and families build the families they dream of."),
      ("A supportive culture", "A collaborative, patient-first team that values each other."),
      ("Growth", "Opportunities to learn and grow within reproductive medicine."),
    ])
  + h.prose('<h2>Open positions</h2>',
    '<p>Current openings are posted as they become available. <span class="scf-rel">// VERIFY: connect to your live careers listings / applicant tracking system.</span> To express interest, <a href="contact.html">contact our team</a>.</p>'),
  h.crumbs(("Home", "index.html"), ("Careers", None)),
  h.graph(h.webpage(h.BASE + "/careers/", "Careers at SpringCreek Fertility"),
          h.bc_schema([("Home", h.BASE + "/"), ("Careers", h.BASE + "/careers/")])),
  cta={"h2": "Interested in joining us?", "p": "We'd love to hear from compassionate professionals who share our mission.",
       "buttons": [("Contact Our Team", "contact.html", "scf-btn scf-btn--accent scf-btn--lg")]},
  verify=["Connect to live careers listings"]))

# Patient Portal
PAGES.append(h.page("patient-portal",
  "Patient Portal | SpringCreek Fertility, Ohio",
  "Access the SpringCreek Fertility patient portal to manage appointments, messages, and records securely. Ohio.",
  "For patients", "Patient Portal",
  "Securely manage your care online — messages, results, and appointments in one place.",
  h.prose('<h2>Your care, at your fingertips</h2>',
    '<p>The SpringCreek patient portal lets established patients securely communicate with the care team, review information, and manage appointments. <span class="scf-rel">// VERIFY: link the button below to your live patient-portal login URL.</span></p>')
  + '<section class="scf-section"><div class="scf-container scf-center"><a class="scf-btn scf-btn--lg" href="contact.html">Patient Portal Login</a><p class="scf-rel" style="margin-top:14px">New patient? <a href="appointment.html">Request a consultation</a> to get started.</p></div></section>'
  + h.prose('<h2>Need help?</h2>',
    '<p>If you have trouble accessing the portal, <a href="contact.html">contact our team</a> and we will be glad to help.</p>'),
  h.crumbs(("Home", "index.html"), ("Patient Portal", None)),
  h.graph(h.webpage(h.BASE + "/patient-portal/", "Patient Portal"),
          h.bc_schema([("Home", h.BASE + "/"), ("Patient Portal", h.BASE + "/patient-portal/")])),
  cta={"h2": "Questions about your care?", "p": "Our team is here to help you every step of the way.",
       "buttons": [("Contact Us", "contact.html", "scf-btn scf-btn--accent scf-btn--lg")]},
  verify=["Live patient-portal login URL"]))

# Privacy Policy
PAGES.append(h.page("privacy-policy",
  "Privacy Policy | SpringCreek Fertility, Ohio",
  "SpringCreek Fertility's website privacy policy — how we handle information collected through this site. Ohio.",
  "Legal", "Privacy Policy",
  "Your privacy matters. This policy explains how information is handled on this website.",
  h.prose('<p class="scf-rel"><strong>Template notice — // VERIFY:</strong> This is a starting template. Replace it with your organization&rsquo;s attorney-reviewed Privacy Policy and Notice of Privacy Practices before publishing. Last updated: // VERIFY date.</p>',
    '<h2>Information we collect</h2>',
    '<p>This website may collect information you provide directly (for example, through contact or appointment-request forms) and standard technical information (such as IP address and browser type) through cookies and analytics.</p>',
    '<h2>How information is used</h2>',
    '<p>Information submitted through this site is used to respond to your inquiry, schedule care, and improve our services. We ask that you not include sensitive medical details in website forms.</p>',
    '<h2>Protected health information (HIPAA)</h2>',
    '<p>Protected health information you share as a patient is governed by our Notice of Privacy Practices and applicable law, not by this website policy. // VERIFY link to the Notice of Privacy Practices.</p>',
    '<h2>Cookies &amp; analytics</h2>',
    '<p>This site may use cookies and analytics tools to understand site usage. You can control cookies through your browser settings.</p>',
    '<h2>Third-party links</h2>',
    '<p>Our site links to external organizations we do not control; their privacy practices are their own.</p>',
    '<h2>Contact</h2>',
    '<p>Questions about this policy? <a href="contact.html">Contact us</a>.</p>'),
  h.crumbs(("Home", "index.html"), ("Privacy Policy", None)),
  h.graph(h.webpage(h.BASE + "/privacy-policy/", "Privacy Policy"),
          h.bc_schema([("Home", h.BASE + "/"), ("Privacy Policy", h.BASE + "/privacy-policy/")])),
  cta={"h2": "Questions?", "p": "We're happy to help with any questions about your privacy or care.",
       "buttons": [("Contact Us", "contact.html", "scf-btn scf-btn--accent scf-btn--lg")]},
  verify=["Replace with attorney-reviewed policy + Notice of Privacy Practices link + last-updated date"]))

# COVID-19 Notice
PAGES.append(h.page("covid-19-notice",
  "COVID-19 Notice &amp; Safety | SpringCreek Fertility, Ohio",
  "SpringCreek Fertility's current COVID-19 and clinic-safety information for patients and visitors across our Ohio locations.",
  "Patient safety", "COVID-19 &amp; Clinic Safety Notice",
  "Your safety and your care are both priorities. Here's our current guidance.",
  h.prose('<p class="scf-rel"><strong>// VERIFY:</strong> Confirm and update this notice to reflect SpringCreek&rsquo;s current policy before publishing. Last updated: // VERIFY date.</p>',
    '<h2>Caring for you safely</h2>',
    '<p>SpringCreek Fertility follows current public-health guidance to help keep patients, visitors, and staff safe across our Dayton, Columbus, and Cincinnati locations. Our care teams continue to provide attentive, compassionate fertility care.</p>',
    '<h2>If you are feeling unwell</h2>',
    '<p>If you have symptoms of illness before an appointment, please call the location nearest you so we can advise you and, if needed, adjust your visit:</p>',
    '<ul><li><a href="dayton-fertility-center.html">Dayton</a> — (937) 458-5084</li>'
    '<li><a href="columbus-fertility-center.html">Columbus (Dublin)</a> — (614) 401-4113</li>'
    '<li><a href="cincinnati-fertility-center.html">Cincinnati (Mason)</a> — (513) 457-5200</li></ul>',
    '<h2>Questions</h2>',
    '<p>For current visitor guidance, please <a href="contact.html">contact us</a> — guidance may change over time.</p>'),
  h.crumbs(("Home", "index.html"), ("COVID-19 Notice", None)),
  h.graph(h.webpage(h.BASE + "/covid-19-notice/", "COVID-19 & Clinic Safety Notice"),
          h.bc_schema([("Home", h.BASE + "/"), ("COVID-19 Notice", h.BASE + "/covid-19-notice/")])),
  cta={"h2": "Questions about your visit?", "p": "Reach the location nearest you and our team will help.",
       "buttons": [("Contact Us", "contact.html", "scf-btn scf-btn--accent scf-btn--lg")]},
  verify=["Confirm current COVID-19 / visitor policy and date"]))
