# -*- coding: utf-8 -*-
import content_helpers as h

def bio_page(slug, name, role, title, desc, h1, sub, bio_paras, focus, philosophy, person_node, verify=None):
    url = f"{h.BASE}/{slug}/"
    main = (h.prose(*bio_paras)
            + h.cards_head("Areas of focus", "How " + name.split(",")[0].split()[0] + " supports patients", focus)
            + h.prose_tint('<h2>Care philosophy</h2>', f'<p>{philosophy}</p>'))
    g = h.graph(person_node, h.bc_schema([("Home", h.BASE + "/"), ("About", h.BASE + "/about/"),
                ("Our Team", h.BASE + "/fertility-specialists/"), (name, url)]))
    return h.page(slug, title, desc, "Our team &middot; " + role, h1, sub, main,
                  h.crumbs(("Home", "index.html"), ("Our Team", "fertility-specialists.html"), (name, None)),
                  g, nav_active="about",
                  cta={"h2": f"Request a consultation",
                       "p": "Meet the team that will listen, explain your options, and walk beside you on your journey.",
                       "buttons": [("Request a Consultation", "appointment.html", "scf-btn scf-btn--accent scf-btn--lg"),
                                   ("Meet the Full Team", "fertility-specialists.html", "scf-btn scf-btn--ghost scf-btn--on-navy")]},
                  verify=verify)

PAGES = []

PAGES.append(bio_page("doctor-jeremy-groll", "Jeremy Groll, MD", "Medical Director",
  "Dr. Jeremy Groll, MD | Reproductive Endocrinologist | SpringCreek Fertility",
  "Meet Dr. Jeremy Groll, MD — founder and Medical Director of SpringCreek Fertility, double board-certified in Reproductive Endocrinology &amp; Infertility and OB/GYN.",
  "Jeremy Groll, MD",
  "Founder and Medical Director of SpringCreek Fertility, double board-certified in Reproductive Endocrinology &amp; Infertility and Obstetrics &amp; Gynecology.",
  ['<h2>About Dr. Groll</h2>',
   '<p>Dr. Jeremy Groll founded SpringCreek Fertility in 2014 with a clear purpose: to offer reproductive medicine that is both clinically excellent and deeply personal. He is double board-certified in <strong>Reproductive Endocrinology and Infertility (REI)</strong> and <strong>Obstetrics and Gynecology (OB/GYN)</strong>, and leads the practice and its on-site IVF laboratory.</p>',
   '<p>Over a career spanning decades in Ohio reproductive medicine, Dr. Groll has served as a Medical Director, as Chief of Reproductive Endocrinology &amp; Infertility at Wright-Patterson Air Force Base, and as an Assistant Professor at the Wright State University Boonshoft School of Medicine. <span class="scf-rel">// VERIFY exact titles/dates against the live bio.</span></p>'],
  [("In vitro fertilization (IVF)", "Individualized IVF protocols supported by our on-site laboratory."),
   ("Complex cases", "Thoughtful evaluation for challenging or unexplained infertility."),
   ("Inclusive family building", "Affirming care for diverse family structures and paths to parenthood.")],
  "Dr. Groll believes patients deserve clear explanations, evidence-informed plans, and a team that treats them the way it would want its own family treated. He pairs clinical experience with genuine, unhurried attention.",
  {"@type": "Physician", "@id": h.BASE + "/#groll", "name": "Jeremy Groll, MD",
   "url": h.BASE + "/doctor-jeremy-groll/", "jobTitle": "Medical Director", "worksFor": {"@id": h.ORG},
   "medicalSpecialty": "Reproductive Endocrinology and Infertility",
   "identifier": {"@type": "PropertyValue", "propertyID": "NPI", "value": "1356332357"},
   "memberOf": {"@type": "MedicalOrganization", "name": "American Society for Reproductive Medicine (ASRM)", "url": "https://www.asrm.org/"}},
  verify=["Exact past titles, dates, education, and memberships"]))

PAGES.append(bio_page("dr-kasey-marelic", "Kasey Reynolds Marelić, MD", "Reproductive Endocrinologist",
  "Dr. Kasey Reynolds Marelić, MD | Reproductive Endocrinologist | SpringCreek",
  "Meet Dr. Kasey Reynolds Marelić, MD — a board-certified reproductive endocrinologist at SpringCreek Fertility, serving patients across Ohio.",
  "Kasey Reynolds Marelić, MD",
  "A board-certified reproductive endocrinologist who partners with patients through evaluation and treatment with clarity, empathy, and individualized care.",
  ['<h2>About Dr. Marelić</h2>',
   '<p>Dr. Kasey Reynolds Marelić is double board-certified in <strong>Obstetrics and Gynecology</strong> and <strong>Reproductive Endocrinology and Infertility</strong>. She previously served as Medical Director at Bethesda Fertility Center, and her patients consistently describe her as warm, thorough, and genuinely reassuring. <span class="scf-rel">// VERIFY education, certifications, and prior roles against the live bio.</span></p>',
   '<p>Dr. Marelić brings an individualized approach to every plan of care — taking time to understand each patient&rsquo;s history and goals, and explaining options in plain language so decisions are made together.</p>'],
  [("Personalized treatment", "Plans tailored to your body, history, and goals."),
   ("Evaluation &amp; diagnosis", "Clear, thorough fertility evaluation for individuals and couples."),
   ("Compassionate communication", "Patient-centered care with attentive, judgment-free support.")],
  "Dr. Marelić is guided by the belief that fertility care should be as compassionate as it is precise — and that patients deserve a physician who truly listens.",
  {"@type": "Physician", "@id": h.BASE + "/#marelic", "name": "Kasey Reynolds Marelić, MD",
   "url": h.BASE + "/dr-kasey-marelic/", "jobTitle": "Reproductive Endocrinologist", "worksFor": {"@id": h.ORG},
   "medicalSpecialty": "Reproductive Endocrinology and Infertility",
   "identifier": {"@type": "PropertyValue", "propertyID": "NPI", "value": "1538467683"}},
  verify=["Education, board certifications, prior roles"]))

PAGES.append(bio_page("jennifer-graves-herring-hcld", "Jennifer Graves-Herring, PhD, HCLD", "Laboratory Director",
  "Jennifer Graves-Herring, PhD, HCLD | IVF Laboratory Director | SpringCreek",
  "Meet Jennifer Graves-Herring, PhD, HCLD — Laboratory Director of SpringCreek Fertility's on-site IVF laboratory in Ohio.",
  "Jennifer Graves-Herring, PhD, HCLD",
  "Doctoral-level Laboratory Director leading SpringCreek's on-site IVF laboratory and embryology team.",
  ['<h2>About Dr. Graves-Herring</h2>',
   '<p>Jennifer Graves-Herring, PhD, is a <strong>High-complexity Clinical Laboratory Director (HCLD)</strong> who leads SpringCreek&rsquo;s on-site IVF laboratory. She oversees the embryology and andrology services at the heart of advanced fertility care — from fertilization and embryo culture to cryopreservation and quality management. <span class="scf-rel">// VERIFY detailed background and credentials against the live bio.</span></p>',
   '<p>Keeping the laboratory in-house and physician-adjacent means our scientists and clinicians coordinate directly, so your eggs and embryos receive consistent, attentive care within our practice.</p>'],
  [("Embryology", "Fertilization, ICSI, and embryo culture in our on-site laboratory."),
   ("Cryopreservation", "Vitrification and secure storage of eggs and embryos."),
   ("Quality &amp; safety", "Rigorous identification and quality-management practices.")],
  "Dr. Graves-Herring is committed to the science and the safeguards that give patients confidence — precise, careful work behind every step of treatment.",
  {"@type": "Person", "@id": h.BASE + "/#graves-herring", "name": "Jennifer Graves-Herring, PhD, HCLD",
   "url": h.BASE + "/jennifer-graves-herring-hcld/", "jobTitle": "Laboratory Director", "worksFor": {"@id": h.ORG}},
  verify=["Detailed credentials, education, certifications"]))

PAGES.append(bio_page("emily-mcmillan-whnp", "Emily McMillan, WHNP", "Women's Health Nurse Practitioner",
  "Emily McMillan, WHNP | Fertility Care Team | SpringCreek Fertility",
  "Meet Emily McMillan, WHNP — a women's health nurse practitioner at SpringCreek Fertility, supporting patients through evaluation and treatment in Ohio.",
  "Emily McMillan, WHNP",
  "A women's health nurse practitioner providing evaluations, treatment support, and patient education with a compassionate approach.",
  ['<h2>About Emily</h2>',
   '<p>Emily McMillan is a <strong>Women&rsquo;s Health Nurse Practitioner (WHNP)</strong> on the SpringCreek care team. She supports patients through evaluation, treatment, and the many questions that arise along the way — with a warm, personalized approach. <span class="scf-rel">// VERIFY background and credentials against the live bio.</span></p>'],
  [("Evaluation support", "Guiding patients through testing and next steps."),
   ("Treatment care", "Day-to-day support during treatment cycles."),
   ("Patient education", "Clear explanations so you feel informed and confident.")],
  "Emily is dedicated to making sure every patient feels heard, informed, and supported throughout their journey.",
  {"@type": "Person", "name": "Emily McMillan, WHNP", "url": h.BASE + "/emily-mcmillan-whnp/",
   "jobTitle": "Women's Health Nurse Practitioner", "worksFor": {"@id": h.ORG}},
  verify=["Background, education, certifications"]))

PAGES.append(bio_page("julie-cuy-castellanos-whnp-bc", "Julie Cuy Castellanos, WHNP-BC", "Women's Health Nurse Practitioner",
  "Julie Cuy Castellanos, WHNP-BC | Fertility Care Team | SpringCreek",
  "Meet Julie Cuy Castellanos, WHNP-BC — a board-certified women's health nurse practitioner at SpringCreek Fertility in Ohio.",
  "Julie Cuy Castellanos, WHNP-BC",
  "A board-certified women's health nurse practitioner supporting patients through evaluation, treatment, and every question along the way.",
  ['<h2>About Julie</h2>',
   '<p>Julie Cuy Castellanos is a <strong>board-certified Women&rsquo;s Health Nurse Practitioner (WHNP-BC)</strong> on the SpringCreek care team. She partners with patients through evaluation and treatment with attentiveness and compassion, helping each person feel supported at every visit. <span class="scf-rel">// VERIFY background and credentials against the live bio.</span></p>'],
  [("Evaluation support", "Helping patients understand testing and options."),
   ("Treatment care", "Attentive support throughout treatment cycles."),
   ("Compassionate guidance", "A reassuring presence through every step.")],
  "Julie believes that compassionate, clear support is just as important as clinical care — and she brings both to every patient.",
  {"@type": "Person", "name": "Julie Cuy Castellanos, WHNP-BC", "url": h.BASE + "/julie-cuy-castellanos-whnp-bc/",
   "jobTitle": "Women's Health Nurse Practitioner", "worksFor": {"@id": h.ORG}},
  verify=["Background, education, certifications"]))
