# -*- coding: utf-8 -*-
import content_helpers as h

def fin(slug, title, desc, eyebrow, h1, sub, body, faqs=None, verify=None):
    url = f"{h.BASE}/{slug}/"
    nodes = [h.webpage(url, h1)]
    if faqs:
        nodes.append(h.faq_schema(faqs))
    nodes.append(h.bc_schema([("Home", h.BASE + "/"), ("Cost & Financing", h.BASE + "/financing-options/"), (h1, url)]))
    main = body + (h.faq_section(faqs, eyebrow="Cost questions", h2="Frequently asked questions") if faqs else "")
    return h.page(slug, title, desc, eyebrow, h1, sub, main,
                  h.crumbs(("Home", "index.html"), ("Cost & Financing", "financing-options.html"), (h1, None)),
                  h.graph(*nodes), nav_active=None,
                  cta={"h2": "Plan your care with confidence", "p": "Our financial counselors review your benefits and walk through your options — so you can focus on what matters most.",
                       "buttons": [("Request a Consultation", "appointment.html", "scf-btn scf-btn--accent scf-btn--lg"), ("Explore Financing", "financing-options.html", "scf-btn scf-btn--ghost scf-btn--on-navy")]},
                  verify=verify)

PAGES = []

PAGES.append(fin("fertility-cost",
  "Fertility Treatment Cost in Ohio | SpringCreek Fertility",
  "Understand fertility treatment costs at SpringCreek Fertility — what an IVF cycle includes, why medications are separate, and how itemized pricing works in Ohio.",
  "Cost &amp; financing", "Fertility Treatment Cost",
  "Cost is one of the biggest sources of stress on a fertility journey. We believe in clarity from the start.",
  h.prose('<h2>What you can expect</h2>',
    '<p>SpringCreek provides up-front, itemized pricing reviewed with you before you begin, plus a dedicated financial counselor. In vitro fertilization (IVF) cycle pricing is offered on a <strong>&ldquo;starting at&rdquo;</strong> basis, with medications and certain add-on services quoted separately. <span class="scf-rel">// VERIFY current &ldquo;starting at&rdquo; figure before publishing a number.</span></p>',
    '<h3>What an IVF cycle typically includes</h3>',
    '<ul><li>Cycle monitoring (ultrasounds and bloodwork)</li><li>Egg retrieval</li><li>Laboratory fertilization and embryo culture</li><li>Embryo transfer</li></ul>',
    '<h3>Usually billed separately</h3>',
    '<ul><li>Medications (cost varies by protocol and pharmacy)</li><li>Add-on services such as ICSI, PGT coordination, and embryo storage</li><li>Donor or gestational-carrier program fees, when applicable</li></ul>'),
  faqs=[("Why are medications billed separately?", "Medication needs vary widely by individual and protocol, and are often filled through a specialty pharmacy, so they are quoted separately to keep your estimate accurate."),
        ("Will I know the cost before starting?", "Yes. You receive up-front, itemized pricing and a benefits review so there are no surprises."),
        ("Are payment plans available?", "Yes — see our financing options page for monthly payment plans and other programs.")],
  verify=["Current IVF 'starting at' figure"]))

PAGES.append(fin("understanding-insurance-benefits",
  "Understanding Your Fertility Insurance Benefits | SpringCreek",
  "A plain-language guide to understanding fertility insurance benefits — key terms, questions to ask your plan, and how SpringCreek helps verify coverage in Ohio.",
  "Cost &amp; financing", "Understanding Your Insurance Benefits",
  "Insurance for fertility care can be confusing. Here's how to read your benefits — and how we help.",
  h.prose('<h2>How we help</h2>',
    '<p>Coverage for fertility services varies widely by plan and employer. Many patients have at least some coverage for an initial consultation and testing. SpringCreek participates with many insurance plans, and our financial counselors verify your specific benefits with you before treatment.</p>',
    '<h2>Terms worth knowing</h2>',
    '<ul><li><strong>Deductible:</strong> what you pay before coverage begins.</li>'
    '<li><strong>Copay / coinsurance:</strong> your share of a covered service.</li>'
    '<li><strong>Prior authorization:</strong> approval some plans require before treatment.</li>'
    '<li><strong>Lifetime maximum:</strong> a cap some plans place on fertility benefits.</li>'
    '<li><strong>In-network vs. out-of-network:</strong> affects your cost and coverage.</li></ul>',
    '<h2>Questions to ask your plan</h2>',
    '<ul><li>Do I have coverage for fertility diagnosis? For treatment (IUI, IVF)?</li><li>Is there a lifetime maximum or visit limit?</li><li>Is prior authorization required?</li><li>Are medications covered, and through which pharmacy?</li></ul>',
    '<p>Bring your insurance card to your visit, and our team will help you understand exactly what your plan includes.</p>')))

PAGES.append(fin("discount-programs",
  "Fertility Discount Programs in Ohio | SpringCreek Fertility",
  "Fertility discount and support programs at SpringCreek Fertility — including support for patients facing a medical fertility risk. Learn who may qualify.",
  "Cost &amp; financing", "Discount Programs",
  "Cost should not be the only thing standing between you and a family. Here are programs that may help.",
  h.prose('<h2>Programs that may help</h2>',
    '<p>SpringCreek participates in programs designed to make care more manageable for eligible patients. Our financial counselors help you find the programs you may qualify for.</p>',
    '<ul><li><strong>Medical-risk fertility preservation support:</strong> eligible patients facing a medical treatment that may affect fertility (such as a cancer diagnosis) may qualify for discounted services and medication support. <span class="scf-rel">// VERIFY current partner (e.g., LIVESTRONG Fertility &ldquo;Sharing Hope&rdquo;) and eligibility.</span></li>'
    '<li><strong>Treatment discounts:</strong> a discount may apply to certain services not already covered by insurance or included in a package. <span class="scf-rel">// VERIFY current discount terms.</span></li>'
    '<li><strong>Medication savings:</strong> pharmacy discount programs may reduce medication costs. <span class="scf-rel">// VERIFY.</span></li></ul>',
    '<p>Explore <a href="financing-options.html">financing options</a> and <a href="refund-programs.html">refund programs</a> as well, or ask our team what you may qualify for.</p>'),
  verify=["Current discount/grant partners and eligibility terms"]))

PAGES.append(fin("refund-programs",
  "Fertility Refund Programs in Ohio | SpringCreek Fertility",
  "Multi-cycle fertility refund program options at SpringCreek Fertility — how they work, who may be eligible, and what to ask. Ohio.",
  "Cost &amp; financing", "Refund Programs",
  "For eligible patients, a multi-cycle refund program can offer added peace of mind.",
  h.prose('<h2>How multi-cycle refund programs work</h2>',
    '<p>Some patients choose a multi-cycle program that bundles several treatment cycles and includes a partial refund if treatment does not result in a pregnancy within the program&rsquo;s terms. These programs can offer financial predictability and peace of mind, but eligibility and terms apply. <span class="scf-rel">// VERIFY current refund program structure, eligibility, and refund percentage before publishing specifics.</span></p>',
    '<h2>Is it right for you?</h2>',
    '<p>Whether a refund program makes sense depends on your individual situation, including your diagnosis and prognosis. Our financial counselors and your physician can help you weigh the options honestly — we will never promise a particular outcome.</p>',
    '<p>Compare with <a href="financing-options.html">financing</a> and <a href="discount-programs.html">discount programs</a>, and ask our team what fits your plan.</p>'),
  verify=["Current refund program terms, eligibility, refund percentage"]))
