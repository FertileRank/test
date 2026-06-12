# -*- coding: utf-8 -*-
import content_helpers as h

def svc(slug, name, title, desc, eyebrow, h1, sub, main, faqs, proc_desc, proc_how, verify=None):
    url = f"{h.BASE}/{slug}/"
    g = h.graph(h.proc(url, name, proc_desc, proc_how), h.faq_schema(faqs),
                h.bc_schema([("Home", h.BASE + "/"), ("Treatments", h.BASE + "/fertility-treatment/"), (name, url)]))
    full = main + h.faq_section(faqs, eyebrow=name + " FAQs", h2="Your questions, answered")
    return h.page(slug, title, desc, eyebrow, h1, sub, full,
                  h.crumbs(("Home", "index.html"), ("Treatments", "fertility-treatment.html"), (name, None)),
                  g, nav_active="treatments", verify=verify)

PAGES = []

# 1. IUI
PAGES.append(svc("iui", "Intrauterine Insemination (IUI)",
  "IUI in Ohio | Intrauterine Insemination | SpringCreek Fertility",
  "Intrauterine insemination (IUI) at SpringCreek Fertility in Dayton, Columbus &amp; Cincinnati, Ohio — an accessible first-line fertility treatment. Learn the process and what to expect.",
  "Treatments &middot; IUI", "Intrauterine Insemination (IUI)",
  "An accessible, less-involved first step toward pregnancy — timed carefully to your natural or medicated cycle.",
  h.prose('<h2>What is IUI?</h2>',
    '<p><strong>Intrauterine insemination (IUI)</strong> places specially prepared sperm directly into the uterus around the time of ovulation, shortening the distance sperm must travel and improving timing. It is often one of the first treatments a physician recommends because it is straightforward and minimally invasive.</p>',
    '<h3>Who might consider IUI?</h3>',
    '<ul><li>Mild male-factor infertility</li><li>Ovulation challenges (often paired with cycle medication)</li><li>Unexplained infertility</li><li>Use of donor sperm — for single parents by choice and LGBTQ+ families</li><li>Cervical-factor concerns</li></ul>')
  + h.steps("The process", "What an IUI cycle looks like", [
      ("Cycle planning", "Your physician designs a natural or medicated cycle suited to you."),
      ("Monitoring", "Ultrasound and bloodwork track follicle growth and pinpoint ovulation."),
      ("Sperm preparation", "A partner or donor sample is prepared (washed and concentrated) in our laboratory."),
      ("Insemination", "A quick, usually painless in-office procedure places the sperm in the uterus."),
    ], tint=True)
  + h.prose('<h2>What to expect</h2>',
    '<p>The insemination itself takes only a few minutes and most people return to normal activities the same day. A pregnancy test follows about two weeks later. If IUI is not successful after a few cycles, your physician will talk with you about next steps, which may include in vitro fertilization (IVF).</p>',
    '<p>IUI is generally low-risk. When cycle medications are used, there is a small chance of multiple pregnancy, which your physician monitors closely. We share realistic, individualized information and never promise a specific outcome.</p>'),
  [("How successful is IUI?", "Success depends on age, diagnosis, and whether medication is used. Your physician shares realistic, individualized expectations and current data rather than guarantees."),
   ("Is IUI painful?", "Most people feel little or no discomfort — it is similar to a routine gynecologic exam and takes only a few minutes."),
   ("How many IUI cycles should I try?", "Many physicians suggest reassessing after about three cycles. Your plan is individual and your physician will discuss when to consider other options."),
   ("Can I use donor sperm for IUI?", "Yes. IUI with donor sperm is a common path for single parents by choice and LGBTQ+ families. We help coordinate screened donor sperm."),
   ("Where is IUI available?", "At all three SpringCreek locations — Dayton, Columbus (Dublin), and Cincinnati (Mason) — with monitoring close to home.")],
  "Intrauterine insemination places prepared sperm into the uterus around ovulation.",
  "Cycle monitoring, sperm preparation in the laboratory, and a brief in-office insemination."))

# 2. Fertility Preservation
PAGES.append(svc("fertility-preservation", "Fertility Preservation",
  "Fertility Preservation in Ohio | Egg, Sperm &amp; Embryo Freezing | SpringCreek",
  "Fertility preservation at SpringCreek Fertility — egg, sperm, and embryo freezing for medical or personal planning in Dayton, Columbus &amp; Cincinnati, Ohio.",
  "Treatments &middot; Fertility Preservation", "Fertility Preservation",
  "Protect future options — whether you are planning ahead or facing a medical treatment that may affect fertility.",
  h.prose('<h2>What is fertility preservation?</h2>',
    '<p>Fertility preservation refers to options that store eggs, sperm, or embryos for future use. It can be a thoughtful choice for personal planning, or a time-sensitive step before a medical treatment — such as chemotherapy or radiation — that may affect the ovaries or testes.</p>',
    '<h3>Who considers fertility preservation?</h3>',
    '<ul><li>People newly diagnosed with cancer, before starting treatment (oncofertility)</li><li>Those with conditions or surgeries that may affect fertility</li><li>Transgender and nonbinary individuals before gender-affirming care</li><li>Anyone planning to delay parenthood who wants to preserve options</li></ul>')
  + h.cards_head("Options", "Ways to preserve fertility", [
      ("Egg Freezing", "Mature eggs are retrieved and frozen for future use.", "egg-freezing.html"),
      ("Embryo Freezing", "Eggs fertilized in the laboratory are frozen as embryos.", "ivf-icsi.html"),
      ("Sperm Freezing", "A sperm sample is collected, frozen, and stored.", None),
    ], cols=3)
  + h.prose('<h2>A time-sensitive but supported decision</h2>',
    '<p>When preservation is needed before medical treatment, timing matters — and our team works quickly and compassionately to coordinate with your other physicians. We explain each step clearly and never promise a particular outcome; preservation protects options, it does not guarantee a future pregnancy. Eligible patients facing a medical fertility risk may qualify for support programs; see our <a href="discount-programs.html">discount programs</a>.</p>'),
  [("How long can eggs, sperm, or embryos stay frozen?", "They can remain safely frozen for years. Your care team reviews storage details and options with you."),
   ("Does preservation guarantee a future baby?", "No. Preservation protects options, but it cannot guarantee a future pregnancy. We share honest, individualized information."),
   ("Can preservation be done quickly before cancer treatment?", "Often yes. We prioritize time-sensitive oncofertility cases and coordinate closely with your oncology team."),
   ("Is preservation an option during gender-affirming care?", "Yes. Egg or sperm freezing may be an option before or during gender-affirming care; a consultation provides individualized guidance.")],
  "Egg, sperm, or embryo freezing to store reproductive options for future use.",
  "Retrieval or collection followed by cryopreservation in the on-site IVF laboratory.",
  verify=["LIVESTRONG/oncofertility discount partner specifics"]))

# 3. PGT
PAGES.append(svc("pgt", "Preimplantation Genetic Testing (PGT)",
  "Preimplantation Genetic Testing (PGT) in Ohio | SpringCreek Fertility",
  "Preimplantation genetic testing (PGT) at SpringCreek Fertility — embryo genetic testing coordinated through our embryology laboratory in Ohio. Learn about PGT-A and PGT-M.",
  "Treatments &middot; PGT", "Preimplantation Genetic Testing (PGT)",
  "An optional step within IVF that screens embryos for certain genetic conditions, coordinated through our embryology laboratory.",
  h.prose('<h2>What is PGT?</h2>',
    '<p><strong>Preimplantation genetic testing (PGT)</strong> is an optional step during in vitro fertilization (IVF) in which a few cells from an embryo are tested for certain genetic features before transfer. At SpringCreek, genetic testing is coordinated through our embryology laboratory in partnership with accredited reference labs.</p>',
    '<h3>Types of PGT</h3>',
    '<ul><li><strong>PGT-A</strong> (for aneuploidy) looks at whether an embryo has the expected number of chromosomes.</li><li><strong>PGT-M</strong> (for monogenic/single-gene conditions) is used when there is a known inherited condition in the family.</li><li><strong>PGT-SR</strong> (for structural rearrangements) is used for certain chromosomal rearrangements.</li></ul>')
  + h.prose_tint('<h2>Is PGT right for me?</h2>',
    '<p>PGT is a personal decision. Your physician will discuss whether it may be helpful based on your age, history, and goals, and explain both the potential benefits and the limitations. PGT provides information to support decisions; it is not a guarantee of pregnancy or of a healthy baby, and your physician will set clear, realistic expectations with you.</p>'),
  [("Does PGT guarantee a healthy pregnancy?", "No. PGT provides additional information to inform decisions, but it cannot guarantee pregnancy or a healthy baby. Your physician explains what the results can and cannot tell you."),
   ("Who might benefit from PGT?", "It may be considered for those with a known inherited condition, prior pregnancy losses, certain chromosomal rearrangements, or who wish to learn more about their embryos. Your physician advises based on your situation."),
   ("Is the embryo harmed by testing?", "A small number of cells are sampled at a stage and in a manner designed to minimize risk. Your physician and our embryology team review the process with you."),
   ("Where is the testing performed?", "Sampling is coordinated through SpringCreek's embryology laboratory; the genetic analysis is performed by accredited reference laboratories.")],
  "Optional genetic testing of embryos during IVF, coordinated through the embryology laboratory.",
  "A small embryo biopsy coordinated through the embryology laboratory, with analysis by accredited reference labs."))

# 4. Donor Egg
PAGES.append(svc("donor-egg", "Donor Egg Program",
  "Donor Egg Program in Ohio | SpringCreek Fertility",
  "Donor egg program at SpringCreek Fertility — a supported path to parenthood using carefully screened donor eggs, in Dayton, Columbus &amp; Cincinnati, Ohio.",
  "Treatments &middot; Donor Egg", "Donor Egg Program",
  "A hopeful path to parenthood using carefully screened donor eggs, with coordinated medical, counseling, and legal support.",
  h.prose('<h2>When donor eggs may help</h2>',
    '<p>Using donor eggs can be a meaningful option when pregnancy with your own eggs is unlikely — for example, with diminished ovarian reserve, premature ovarian insufficiency, certain genetic considerations, or after prior treatment. It is also a path for some male couples and single fathers by choice, working with a gestational carrier.</p>',
    '<h3>How the process works</h3>',
    '<p>In an egg-donation cycle, eggs from a screened donor are fertilized in our laboratory, and a resulting embryo is transferred to the intended parent or a gestational carrier. Donors are screened following professional guidelines, and our team coordinates the medical steps alongside counseling and reproductive-law resources.</p>')
  + h.steps("The journey", "What to expect", [
      ("Consultation", "Your physician reviews whether donor eggs fit your goals."),
      ("Donor selection &amp; screening", "Choose from screened donors; medical and psychological screening follow professional guidelines."),
      ("Fertilization &amp; transfer", "Donor eggs are fertilized in our laboratory and an embryo is transferred."),
      ("Support throughout", "Counseling and legal resources accompany every step."),
    ], tint=True),
  [("Are egg donors screened?", "Yes. Donors are screened following professional guidelines, including medical and psychological evaluation. Our team reviews the process with you."),
   ("Will the baby be biologically related to me?", "A child conceived with donor eggs is not genetically related to the egg recipient, but the carrying parent is connected through pregnancy and birth. Counseling helps families think through these questions."),
   ("Do you provide counseling and legal support?", "Yes. We coordinate the medical steps and connect you with mental-health and reproductive-law professionals for donor agreements."),
   ("Can male couples or single fathers use donor eggs?", "Yes — typically in combination with a gestational carrier. We guide you through the options.")],
  "Family building using carefully screened donor eggs, fertilized in the laboratory.",
  "Donor screening, laboratory fertilization, and embryo transfer to the intended parent or a gestational carrier."))

# 5. Donor Sperm
PAGES.append(svc("donor-sperm-banks", "Donor Sperm",
  "Donor Sperm &amp; Sperm Banks in Ohio | SpringCreek Fertility",
  "Using donor sperm at SpringCreek Fertility — guidance on sperm banks, screening, and treatment with IUI or IVF in Dayton, Columbus &amp; Cincinnati, Ohio.",
  "Treatments &middot; Donor Sperm", "Donor Sperm &amp; Sperm Banks",
  "Clear guidance on choosing and using screened donor sperm — for single parents by choice, LGBTQ+ families, and couples facing male-factor infertility.",
  h.prose('<h2>Who uses donor sperm?</h2>',
    '<p>Donor sperm is a path to parenthood for single parents by choice, female couples, and couples navigating severe male-factor infertility. Treatment may use intrauterine insemination (IUI) or in vitro fertilization (IVF), depending on your goals and any other factors.</p>',
    '<h3>Choosing a sperm bank</h3>',
    '<p>Donor sperm is obtained from licensed sperm banks that screen donors following professional and regulatory guidelines. Our team helps you understand the options — including known vs. anonymous donors — and coordinates shipping and storage so the clinical steps go smoothly.</p>')
  + h.cards_head("Treatment paths", "How donor sperm is used", [
      ("With IUI", "Prepared donor sperm is placed in the uterus around ovulation.", "iui.html"),
      ("With IVF", "Donor sperm is used to fertilize eggs in the laboratory.", "ivf-icsi.html"),
      ("Reciprocal IVF", "For some female couples, one partner provides eggs and the other carries.", "lgbtqia-family-building.html"),
    ]),
  [("How are sperm donors screened?", "Licensed sperm banks screen donors following professional and regulatory guidelines, including medical, genetic, and infectious-disease testing."),
   ("Can I choose a known donor?", "Yes. Both known and anonymous donor arrangements are possible. Counseling and legal guidance help you navigate known-donor agreements."),
   ("Is IUI or IVF better with donor sperm?", "It depends on your individual situation. Many begin with IUI; your physician will recommend the approach most likely to help."),
   ("Do you help coordinate the sperm bank logistics?", "Yes. We help coordinate screening records, shipping, and storage so your treatment proceeds smoothly.")],
  "Treatment using screened donor sperm via IUI or IVF.",
  "Coordination with licensed sperm banks, then insemination (IUI) or laboratory fertilization (IVF)."))

# 6. Embryo Donation
PAGES.append(svc("embryo-donation", "Embryo Donation",
  "Embryo Donation in Ohio | SpringCreek Fertility",
  "Embryo donation at SpringCreek Fertility — building a family with donated embryos, with medical, counseling, and legal coordination, in Ohio.",
  "Treatments &middot; Embryo Donation", "Embryo Donation",
  "Building a family with donated embryos — a meaningful option with coordinated medical, counseling, and legal support.",
  h.prose('<h2>What is embryo donation?</h2>',
    '<p>Embryo donation allows individuals or couples who have completed their own family building, and have remaining frozen embryos, to donate those embryos to others hoping to conceive. For recipients, it can be a hopeful and often more accessible path to pregnancy.</p>',
    '<h3>How it works</h3>',
    '<p>A donated embryo is thawed and transferred to the recipient&rsquo;s uterus in a carefully timed cycle. As with all third-party reproduction, counseling and reproductive-law guidance are an important part of the process, and our team coordinates each step with care.</p>'),
  [("Who is a candidate for embryo donation?", "It may suit those for whom both egg and sperm sources are a barrier, or who prefer this path. Your physician will discuss whether it fits your goals."),
   ("Are donated embryos screened?", "Embryo donation follows professional guidelines, including appropriate screening and documentation. Our team reviews the specifics with you."),
   ("Is counseling part of the process?", "Yes. Counseling and reproductive-law guidance are important parts of embryo donation for both donors and recipients."),
   ("Does embryo donation guarantee pregnancy?", "No. It offers a hopeful path, but no treatment can guarantee pregnancy. We provide honest, individualized information.")],
  "Family building using donated frozen embryos.",
  "A donated embryo is thawed and transferred to the recipient in a timed cycle, with counseling and legal coordination."))

# 7. Gestational Surrogacy / Carrier
PAGES.append(svc("gestational-surrogacy-carrier", "Gestational Surrogacy",
  "Gestational Surrogacy &amp; Carriers in Ohio | SpringCreek Fertility",
  "Gestational surrogacy at SpringCreek Fertility — coordinated medical, counseling, and legal support for gestational carrier journeys in Ohio.",
  "Treatments &middot; Gestational Surrogacy", "Gestational Surrogacy &amp; Carriers",
  "When carrying a pregnancy isn&rsquo;t possible or advisable, a gestational carrier can help — with coordinated medical, counseling, and legal support.",
  h.prose('<h2>What is a gestational carrier?</h2>',
    '<p>A <strong>gestational carrier</strong> carries a pregnancy created through in vitro fertilization (IVF) using the intended parents&rsquo; or donors&rsquo; eggs and sperm. The carrier is not genetically related to the child. This path helps intended parents who cannot carry a pregnancy for medical reasons, as well as male couples and single fathers by choice.</p>',
    '<h3>A coordinated, multi-step journey</h3>',
    '<p>Gestational surrogacy involves medical care, mental-health counseling, and reproductive law. SpringCreek coordinates the clinical steps — embryo creation and transfer — and connects everyone with the counseling and legal professionals essential to a thoughtful, well-supported arrangement.</p>'),
  [("Who works with a gestational carrier?", "Intended parents who cannot safely carry a pregnancy, as well as male couples and single fathers by choice. Your physician will discuss whether it fits your situation."),
   ("Is the carrier related to the baby?", "No. A gestational carrier is not genetically related to the child; the embryo is created from the intended parents&rsquo; or donors&rsquo; eggs and sperm."),
   ("Does SpringCreek handle the legal side?", "We coordinate the medical steps and connect you with experienced reproductive-law and counseling professionals who handle the legal agreements."),
   ("How long does the process take?", "Timelines vary with matching, screening, and legal steps. Your care team helps set realistic expectations for your journey.")],
  "IVF with a gestational carrier who carries the pregnancy for the intended parents.",
  "Embryo creation through IVF and transfer to a screened gestational carrier, with counseling and legal coordination."))

# 8. Third-Party Reproduction
PAGES.append(svc("third-party-reproduction", "Third-Party Reproduction",
  "Third-Party Reproduction in Ohio | Donor &amp; Surrogacy | SpringCreek",
  "Third-party reproduction at SpringCreek Fertility — donor eggs, donor sperm, embryo donation, and gestational carriers, with full coordination, in Ohio.",
  "Treatments &middot; Third-Party Reproduction", "Third-Party Reproduction",
  "When building a family involves a donor or a gestational carrier, thoughtful coordination makes all the difference.",
  h.prose('<h2>What is third-party reproduction?</h2>',
    '<p>&ldquo;Third-party reproduction&rdquo; describes family building that involves someone beyond the intended parent(s) — an egg donor, sperm donor, embryo donor, or gestational carrier. These paths support many families, including those facing infertility, LGBTQ+ families, and single parents by choice.</p>')
  + h.cards_head("Paths we coordinate", "Your options", [
      ("Donor Egg", "Carefully screened donor eggs.", "donor-egg.html"),
      ("Donor Sperm", "Screened donor sperm via IUI or IVF.", "donor-sperm-banks.html"),
      ("Embryo Donation", "Building a family with donated embryos.", "embryo-donation.html"),
      ("Gestational Carrier", "A carrier carries the pregnancy via IVF.", "gestational-surrogacy-carrier.html"),
    ], cols=4)
  + h.prose('<h2>Care for the whole journey</h2>',
    '<p>Third-party reproduction blends medicine, emotional well-being, and law. SpringCreek coordinates the clinical care and connects you with a trusted network of mental-health and reproductive-law professionals, so every part of your journey is handled with the same attention and respect.</p>'),
  [("Is counseling required for third-party reproduction?", "Counseling is an important, standard part of these journeys for everyone involved, supporting informed and thoughtful decisions."),
   ("Do you provide the legal services?", "We coordinate the medical care and connect you with experienced reproductive-law professionals who handle agreements and legal steps."),
   ("Can LGBTQ+ families and single parents use these options?", "Absolutely. Third-party reproduction is a common, welcomed path for LGBTQ+ families and single parents by choice. See our <a href=\"lgbtqia-family-building.html\">LGBTQIA+ family building</a> page."),
   ("Where do I start?", "With a consultation. Your physician learns your goals and maps the options with you.")],
  "Family building involving an egg donor, sperm donor, embryo donor, or gestational carrier.",
  "Coordinated medical care with donors or a gestational carrier, supported by counseling and reproductive-law professionals."))

# 9. Recurrent Miscarriage
PAGES.append(svc("recurrent-miscarriage", "Recurrent Pregnancy Loss",
  "Recurrent Miscarriage Care in Ohio | SpringCreek Fertility",
  "Compassionate evaluation and care for recurrent miscarriage (recurrent pregnancy loss) at SpringCreek Fertility in Dayton, Columbus &amp; Cincinnati, Ohio.",
  "Treatments &middot; Recurrent Pregnancy Loss", "Recurrent Miscarriage Care",
  "Pregnancy loss is painful, and repeated loss can feel isolating. You deserve answers and compassionate, expert support.",
  h.prose('<h2>Understanding recurrent pregnancy loss</h2>',
    '<p><strong>Recurrent pregnancy loss (RPL)</strong> is generally defined as two or more pregnancy losses. For many people, a cause can be identified; for others, testing is reassuringly normal and many go on to carry a pregnancy. A thoughtful evaluation aims to understand what may be contributing and to guide next steps — without judgment and at your pace.</p>',
    '<h3>What an evaluation may look at</h3>',
    '<ul><li>Hormonal and thyroid factors</li><li>Uterine structure</li><li>Chromosomal and genetic considerations</li><li>Blood-clotting and immune factors</li><li>Other individual health factors</li></ul>',
    '<p>Not everyone needs every test. Your physician recommends a personalized evaluation and explains each step in plain language.</p>')
  + h.prose_tint('<h2>Care that holds space for grief</h2>',
    '<p>Beyond the medical evaluation, recurrent loss carries real emotional weight. Our team offers clear explanations, attentive support, and connections to counseling resources for your emotional well-being. We will never minimize what you are going through, and we will not promise outcomes we cannot guarantee — but we will walk with you and pursue the answers we can find.</p>'),
  [("What counts as recurrent miscarriage?", "It is generally defined as two or more pregnancy losses. Reach out whenever you feel ready — you do not have to wait to seek support and answers."),
   ("Can a cause always be found?", "Not always. For some, testing identifies a contributing factor; for others, results are normal, and many still go on to carry a pregnancy. Your physician explains what testing can and cannot reveal."),
   ("Will I be supported emotionally?", "Yes. We offer compassionate care and connect you with counseling resources, because emotional well-being matters as much as the medical evaluation."),
   ("What treatments might help?", "Care is individualized based on what the evaluation finds, and may range from monitoring to targeted treatment. Your physician discusses options that fit your situation.")],
  "Evaluation and compassionate care for recurrent pregnancy loss (two or more miscarriages).",
  "An individualized evaluation of possible contributing factors, with targeted care and emotional support."))

# 10. IVF Laboratory
PAGES.append(svc("ivf-laboratory", "Our IVF Laboratory",
  "Our On-Site IVF Laboratory in Ohio | SpringCreek Fertility",
  "Inside SpringCreek Fertility's on-site IVF laboratory — embryology, andrology, and cryostorage led by a doctoral-level laboratory director, serving all three Ohio locations.",
  "Our practice &middot; IVF Laboratory", "Our On-Site IVF Laboratory",
  "Where science meets care. SpringCreek operates its own IVF laboratory, keeping embryology close to your care team.",
  h.prose('<h2>Care that stays under one roof</h2>',
    '<p>SpringCreek Fertility operates its own on-site <strong>in vitro fertilization (IVF)</strong> laboratory, led by a doctoral-level laboratory director, <strong>Jennifer Graves-Herring, PhD, HCLD</strong>. Keeping embryology in-house means your physician and our laboratory scientists work side by side — coordinating egg retrievals, fertilization, embryo culture, freezing, and genetic-testing logistics with close communication at every step.</p>',
    '<h3>What our laboratory supports</h3>',
    '<ul><li>Egg retrieval handling and fertilization, including intracytoplasmic sperm injection (ICSI)</li><li>Embryo culture and assessment</li><li>Cryopreservation (vitrification) of eggs and embryos, and secure storage</li><li>Andrology services, including semen analysis and sperm preparation</li><li>Coordination of preimplantation genetic testing (PGT) with accredited reference labs</li></ul>')
  + h.cards_head("Why an on-site lab matters", "The SpringCreek difference", [
      ("Close coordination", "Your physician and embryology team communicate directly, every step of the way."),
      ("Quality &amp; safety", "Rigorous quality-management and identification practices safeguard your eggs and embryos."),
      ("Continuity", "Your eggs and embryos stay within our practice, cared for by a consistent team."),
    ])
  + h.lab_band(),
  [("Does SpringCreek have its own IVF lab?", "Yes. SpringCreek operates an on-site IVF laboratory led by a doctoral-level laboratory director, serving patients across all three Ohio locations."),
   ("Who leads the laboratory?", "Jennifer Graves-Herring, PhD, HCLD, a High-complexity Clinical Laboratory Director, leads our embryology team."),
   ("Is genetic testing done in the lab?", "Embryo biopsy for preimplantation genetic testing (PGT) is coordinated through our embryology laboratory; the genetic analysis is performed by accredited reference laboratories."),
   ("How are my eggs and embryos kept safe?", "The laboratory follows rigorous quality-management, identification, and storage practices designed to safeguard your eggs and embryos.")],
  "SpringCreek's on-site IVF laboratory provides embryology, andrology, and cryostorage services.",
  "On-site embryology including fertilization, ICSI, culture, vitrification, andrology, and PGT coordination.",
  verify=["Confirm current lab accreditations/certifications to cite"]))
