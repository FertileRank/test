# -*- coding: utf-8 -*-
import content_helpers as h

DISC = '<p class="scf-rel">This article is general education and is not a substitute for personalized medical advice. Please consult a SpringCreek physician about your situation.</p>'

def article(slug, title, desc, eyebrow, h1, sub, body, extra_nodes=None, verify=None):
    url = f"{h.BASE}/{slug}/"
    nodes = [{"@type": "Article", "@id": url + "#article", "headline": h1, "url": url,
              "isPartOf": {"@id": h.BASE + "/#website"}, "about": {"@id": h.ORG},
              "publisher": {"@id": h.ORG}, "inLanguage": "en-US"},
             h.bc_schema([("Home", h.BASE + "/"), ("Fertility Library", h.BASE + "/fertility-library/"), (h1, url)])]
    if extra_nodes:
        nodes = extra_nodes + nodes
    main = body + h.prose(DISC)
    return h.page(slug, title, desc, eyebrow, h1, sub, main,
                  h.crumbs(("Home", "index.html"), ("Fertility Library", "fertility-library.html"), (h1, None)),
                  h.graph(*nodes), nav_active=None,
                  cta={"h2": "Questions about your own situation?", "p": "A board-certified reproductive endocrinologist can give you answers specific to you.",
                       "buttons": [("Request a Consultation", "appointment.html", "scf-btn scf-btn--accent scf-btn--lg"), ("Back to Library", "fertility-library.html", "scf-btn scf-btn--ghost scf-btn--on-navy")]},
                  verify=verify or ["Add medical reviewer name + review date to schema/byline"])

PAGES = []

FAQS = [
 ("When should I see a fertility specialist?", "A common guideline is after 12 months of trying to conceive, or 6 months if you are 35 or older. Consider reaching out sooner with irregular cycles, known conditions, prior pregnancy loss, or to plan ahead."),
 ("What is the difference between IUI and IVF?", "Intrauterine insemination (IUI) places prepared sperm into the uterus around ovulation. In vitro fertilization (IVF) retrieves eggs and combines them with sperm in the laboratory, then transfers a resulting embryo."),
 ("Does SpringCreek have its own IVF laboratory?", "Yes. SpringCreek operates an on-site IVF laboratory led by a doctoral-level laboratory director."),
 ("Is SpringCreek LGBTQ+ inclusive?", "Yes. We provide inclusive care for diverse family structures, including LGBTQ+ individuals and couples and single parents by choice."),
 ("Do I need a referral?", "Many patients schedule directly without a referral, though some insurance plans request one. Our team can help you check."),
 ("How much does treatment cost?", "Costs depend on your plan and medications. We offer up-front, itemized pricing and a financial counselor. See our cost & financing page."),
 ("How long does an IVF cycle take?", "About four to six weeks from the start of ovarian stimulation through egg retrieval, with transfer either days later or in a later month."),
 ("Where are your locations?", "Dayton (Centerville), Columbus (Dublin), and Cincinnati (Mason), Ohio."),
 ("Is fertility treatment painful?", "Most steps are well tolerated. Injections use small needles, and the egg retrieval is a short procedure under sedation. Your team reviews comfort measures with you."),
 ("Can you help with recurrent pregnancy loss?", "Yes. We provide compassionate evaluation and care for recurrent pregnancy loss; see our recurrent miscarriage page."),
]
PAGES.append(article("fertility-faqs",
  "Fertility FAQs | Answers &amp; Support | SpringCreek Fertility",
  "Answers to the fertility questions patients ask most — about IVF, IUI, costs, timing, and care at SpringCreek Fertility in Ohio.",
  "Fertility Library", "Fertility FAQs",
  "Clear, direct answers to the questions we hear most often.",
  h.faq_section(FAQS, eyebrow="Answers", h2="Common fertility questions", soft=False),
  extra_nodes=[h.faq_schema(FAQS)]))

PAGES.append(article("acronym-abbreviation-guide",
  "Fertility Acronym &amp; Abbreviation Guide | SpringCreek Fertility",
  "A plain-language guide to common fertility acronyms — IVF, IUI, ICSI, REI, PGT, AMH, FSH, OHSS, and more — from SpringCreek Fertility.",
  "Fertility Library", "Fertility Acronym &amp; Abbreviation Guide",
  "Fertility care comes with a lot of acronyms. Here's a plain-language decoder.",
  h.prose('<h2>Treatments &amp; procedures</h2>',
    '<ul><li><strong>IVF</strong> — In Vitro Fertilization: eggs and sperm are combined in the laboratory.</li>'
    '<li><strong>IUI</strong> — Intrauterine Insemination: prepared sperm is placed in the uterus.</li>'
    '<li><strong>ICSI</strong> — Intracytoplasmic Sperm Injection: a single sperm is injected into an egg.</li>'
    '<li><strong>ET / FET</strong> — Embryo Transfer / Frozen Embryo Transfer.</li>'
    '<li><strong>PGT (PGT-A, PGT-M, PGT-SR)</strong> — Preimplantation Genetic Testing of embryos.</li>'
    '<li><strong>TESE / PESA</strong> — surgical sperm-retrieval procedures.</li></ul>',
    '<h2>People &amp; specialties</h2>',
    '<ul><li><strong>REI</strong> — Reproductive Endocrinology and Infertility (the fertility specialty).</li>'
    '<li><strong>OB/GYN</strong> — Obstetrics and Gynecology.</li>'
    '<li><strong>WHNP</strong> — Women&rsquo;s Health Nurse Practitioner.</li>'
    '<li><strong>HCLD</strong> — High-complexity Clinical Laboratory Director.</li></ul>',
    '<h2>Tests &amp; hormones</h2>',
    '<ul><li><strong>AMH</strong> — Anti-Müllerian Hormone (an ovarian-reserve marker).</li>'
    '<li><strong>FSH / LH</strong> — Follicle-Stimulating Hormone / Luteinizing Hormone.</li>'
    '<li><strong>hCG</strong> — human Chorionic Gonadotropin (the &ldquo;pregnancy hormone&rdquo;).</li>'
    '<li><strong>HSG</strong> — Hysterosalpingogram (a tubal/uterine X-ray test).</li></ul>',
    '<h2>Conditions &amp; terms</h2>',
    '<ul><li><strong>PCOS</strong> — Polycystic Ovary Syndrome.</li>'
    '<li><strong>RPL</strong> — Recurrent Pregnancy Loss.</li>'
    '<li><strong>OHSS</strong> — Ovarian Hyperstimulation Syndrome (a treatment risk we monitor).</li>'
    '<li><strong>TTC</strong> — Trying To Conceive.</li>'
    '<li><strong>SART / ASRM</strong> — professional organizations for assisted reproduction.</li></ul>')))

PAGES.append(article("infertility-defined",
  "Infertility, Defined | What It Means &amp; When to Seek Care | SpringCreek",
  "What does infertility mean? Learn the definition, how common it is, and when to see a fertility specialist — from SpringCreek Fertility in Ohio.",
  "Fertility Library", "Infertility, Defined",
  "Understanding what infertility means is the first step toward answers.",
  h.prose('<h2>What is infertility?</h2>',
    '<p><strong>Infertility</strong> is generally defined as not achieving pregnancy after 12 months of regular, unprotected intercourse — or after 6 months if the person trying to conceive is age 35 or older. It is common, and it is not anyone&rsquo;s fault.</p>',
    '<h2>How common is it?</h2>',
    '<p>Infertility affects many people of reproductive age. It can involve factors related to either partner, or both, and sometimes no single cause is found. Importantly, &ldquo;infertility&rdquo; is a starting point for evaluation — not a verdict about whether you can build a family.</p>',
    '<h2>When to seek care</h2>',
    '<p>Consider an evaluation after the timeframes above, or sooner if you have irregular cycles, known reproductive conditions, prior pregnancy loss, or are building a family as an LGBTQ+ couple or single parent by choice. A <a href="specialist.html">fertility specialist</a> can help you understand your options.</p>')))

PAGES.append(article("what-causes-infertility",
  "What Causes Infertility? | Common Factors Explained | SpringCreek",
  "What causes infertility? An overview of common female, male, and combined factors — plus unexplained infertility — from SpringCreek Fertility, Ohio.",
  "Fertility Library", "What Causes Infertility?",
  "Infertility can have many causes — and understanding them helps guide the right care.",
  h.prose('<h2>It can involve either or both partners</h2>',
    '<p>Roughly speaking, fertility factors are distributed across female factors, male factors, a combination, and cases where no clear cause is found. A thorough evaluation looks at the whole picture.</p>',
    '<h3>Common factors that may affect the egg/ovulation side</h3>',
    '<ul><li>Ovulation disorders, including PCOS (polycystic ovary syndrome)</li><li>Diminished ovarian reserve or age-related changes</li><li>Endometriosis</li><li>Blocked or damaged fallopian tubes</li><li>Uterine factors</li></ul>',
    '<h3>Common factors that may affect the sperm side</h3>',
    '<ul><li>Low sperm count or motility</li><li>Sperm-quality or structural factors</li><li>Blockages or prior procedures</li><li>Hormonal factors</li></ul>',
    '<h3>Unexplained infertility</h3>',
    '<p>Sometimes testing is reassuringly normal and no single cause is identified. This does not mean treatment cannot help — your physician will discuss evidence-informed options.</p>',
    '<p>Only an evaluation by a physician can identify what may be contributing in your case. <a href="appointment.html">Request a consultation</a> to learn more.</p>')))

PAGES.append(article("quick-facts-about-infertility",
  "Quick Facts About Infertility | SpringCreek Fertility, Ohio",
  "At-a-glance facts about infertility — how common it is, that it affects all genders, and that help is available — from SpringCreek Fertility.",
  "Fertility Library", "Quick Facts About Infertility",
  "A few grounding facts to put infertility in perspective.",
  '<section class="scf-section"><div class="scf-container"><ul class="scf-list-check" style="max-width:760px;margin:0 auto;font-size:17px">'
  + "".join(f'<li><span class="scf-check">&#10003;</span> {x}</li>' for x in [
    "Infertility is common and affects people of all genders and backgrounds.",
    "It is generally defined as 12 months of trying (6 months if age 35+).",
    "Factors can involve either partner, both, or sometimes no clear cause.",
    "Age affects fertility, but it is only one part of the picture.",
    "Many people who seek care go on to build their families in many ways.",
    "Seeking help early can expand your options — it is never too soon to ask questions.",
    "Emotional support matters as much as medical care.",
    "You are not alone, and help is available.",
  ]) + '</ul></div></section>'
  + h.prose('<p>Facts are a starting point; your situation is unique. A <a href="specialist.html">fertility specialist</a> can give you answers specific to you.</p>')))

PAGES.append(article("myths-about-fertility-diagnosis",
  "Myths About Fertility &amp; Diagnosis | SpringCreek Fertility",
  "Common fertility myths, separated from the evidence — about age, &ldquo;just relaxing,&rdquo; male factors, and more — from SpringCreek Fertility, Ohio.",
  "Fertility Library", "Myths About Fertility &amp; Diagnosis",
  "Misinformation adds stress. Let's separate a few common myths from the evidence.",
  h.prose('<h3>Myth: &ldquo;If you just stop worrying, it will happen.&rdquo;</h3>',
    '<p>Stress is real and support matters, but infertility is a medical issue, not a matter of willpower. Telling someone to simply relax overlooks genuine, treatable factors.</p>',
    '<h3>Myth: &ldquo;Infertility is mostly a female issue.&rdquo;</h3>',
    '<p>Fertility factors are distributed across all partners; male factors are common. Evaluation usually looks at everyone involved.</p>',
    '<h3>Myth: &ldquo;If you already have a child, you can&rsquo;t be infertile.&rdquo;</h3>',
    '<p>Secondary infertility — difficulty conceiving after a previous pregnancy — is real and common.</p>',
    '<h3>Myth: &ldquo;Age only matters for women.&rdquo;</h3>',
    '<p>Age can affect fertility for all genders, though in different ways. It is one factor among many.</p>',
    '<h3>Myth: &ldquo;IVF is the only option.&rdquo;</h3>',
    '<p>Many patients are helped by less involved treatments first, such as IUI. Your physician recommends what fits your situation.</p>',
    '<p>The most reliable information comes from a physician who knows your history. <a href="appointment.html">Request a consultation</a> for guidance specific to you.</p>')))

PAGES.append(article("tips-for-getting-pregnant-faster",
  "Tips for Getting Pregnant Faster | SpringCreek Fertility, Ohio",
  "Evidence-informed tips that may help you conceive sooner — understanding your cycle, timing, and when to seek help — from SpringCreek Fertility.",
  "Fertility Library", "Tips for Getting Pregnant Faster",
  "A few evidence-informed habits may improve your timing — and knowing when to seek help matters too.",
  h.prose('<h2>Understand your fertile window</h2>',
    '<p>Conception is most likely in the days leading up to and including ovulation. Tracking your cycle — with calendar tracking, ovulation predictor kits, or other methods — can help you time intercourse during this window.</p>',
    '<h2>Aim for regular, well-timed intimacy</h2>',
    '<p>Having intercourse every 1&ndash;2 days during the fertile window is a commonly suggested approach. The goal is consistency, not pressure.</p>',
    '<h2>Support your overall health</h2>',
    '<p>General wellness may support fertility: a balanced diet, regular activity, healthy sleep, limiting alcohol, and not smoking. Discuss any supplements (such as prenatal vitamins with folic acid) with your physician.</p>',
    '<h2>Know when to ask for help</h2>',
    '<p>If you have been trying for 12 months — or 6 months at age 35+, or you have irregular cycles or known conditions — consider an evaluation. Seeking help is a strength, not a setback.</p>')))

PAGES.append(article("tips-to-optimize-fertility",
  "Tips to Optimize Fertility | Lifestyle &amp; Habits | SpringCreek",
  "Lifestyle factors that may support fertility for all partners — nutrition, activity, sleep, stress, and habits to discuss with your physician.",
  "Fertility Library", "Tips to Optimize Fertility",
  "Small, sustainable habits may support fertility — for every partner.",
  h.prose('<h2>For everyone trying to conceive</h2>',
    '<ul><li><strong>Nutrition:</strong> a balanced, whole-food diet (see our <a href="fertility-foods.html">fertility foods</a> guide).</li>'
    '<li><strong>Activity:</strong> regular, moderate exercise.</li>'
    '<li><strong>Sleep:</strong> consistent, restorative sleep.</li>'
    '<li><strong>Healthy weight:</strong> a weight range that supports your health, as discussed with your physician.</li>'
    '<li><strong>Limit alcohol and avoid smoking and recreational drugs.</strong></li>'
    '<li><strong>Manage stress</strong> with support that works for you — counseling, community, and rest.</li></ul>',
    '<h2>A note for all partners</h2>',
    '<p>Sperm health can also be supported by similar healthy habits, plus avoiding excessive heat exposure and certain toxins. These factors are worth attention for everyone involved.</p>',
    '<h2>Personalized guidance</h2>',
    '<p>Lifestyle is one piece of a larger picture. For guidance specific to you, talk with a <a href="specialist.html">fertility specialist</a>.</p>')))

PAGES.append(article("fertility-foods",
  "Fertility Foods | Nutrition for Fertility | SpringCreek Fertility",
  "A practical guide to fertility-friendly nutrition — foods and dietary patterns that may support fertility — from SpringCreek Fertility, Ohio.",
  "Fertility Library", "Fertility Foods",
  "Nutrition is one supportive piece of the fertility picture. Here's a practical, no-pressure guide.",
  h.prose('<h2>A fertility-friendly pattern</h2>',
    '<p>Research tends to favor overall dietary <em>patterns</em> over any single &ldquo;miracle&rdquo; food. A Mediterranean-style approach — rich in vegetables, fruits, whole grains, legumes, healthy fats, and lean proteins — is commonly associated with supportive nutrition.</p>',
    '<h2>Foods to emphasize</h2>',
    '<ul><li>Colorful vegetables and fruits (antioxidants)</li><li>Whole grains and legumes (fiber, plant protein)</li><li>Healthy fats such as olive oil, nuts, and seeds</li><li>Fish and lean proteins; plant proteins</li><li>Folate-rich foods (leafy greens) and a prenatal vitamin as advised</li></ul>',
    '<h2>Worth limiting</h2>',
    '<ul><li>Heavily processed foods and added sugars</li><li>Excess alcohol and caffeine</li><li>Trans fats</li></ul>',
    '<h2>Keep it kind and sustainable</h2>',
    '<p>Nutrition should reduce stress, not add to it. There is no perfect &ldquo;fertility diet,&rdquo; and food is only one factor. For individualized advice — especially with conditions like PCOS — talk with your physician or a registered dietitian.</p>')))
