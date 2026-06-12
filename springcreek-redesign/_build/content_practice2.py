# -*- coding: utf-8 -*-
import content_helpers as h

PAGES = []

# Our Fertility Center
PAGES.append(h.page("our-fertility-center",
  "Our Fertility Center | SpringCreek Fertility, Ohio",
  "Explore SpringCreek Fertility's centers across Dayton, Columbus &amp; Cincinnati, Ohio — with an on-site IVF laboratory and a patient-centered, inclusive approach to care.",
  "Our practice", "Our Fertility Center",
  "Modern, welcoming spaces and an on-site IVF laboratory — designed around the people we care for.",
  h.prose('<h2>Care designed around you</h2>',
    '<p>SpringCreek Fertility brings reproductive endocrinology, cycle monitoring, and our own on-site IVF laboratory together so your care stays connected and personal. Our centers in Dayton, Columbus (Dublin), and Cincinnati (Mason) are designed to feel calm and welcoming — because a fertility journey is personal, and your surroundings should feel supportive.</p>')
  + h.cards_head("What defines our center", "The SpringCreek difference", [
      ("On-site IVF laboratory", "Embryology kept in-house, led by a doctoral-level laboratory director.", "ivf-laboratory.html"),
      ("Physician-led care", "Board-certified reproductive endocrinologists who know you by name.", "fertility-specialists.html"),
      ("Three Ohio locations", "Convenient care across the Dayton, Columbus, and Cincinnati metros.", "locations.html"),
      ("Inclusive by design", "Affirming care for diverse family structures.", "lgbtqia-family-building.html"),
      ("Transparent costs", "Up-front pricing and a dedicated financial counselor.", "financing-options.html"),
      ("Compassionate support", "Attentive care for your emotional well-being throughout.", "appointment.html"),
    ], cols=3)
  + h.prose('<h2>Come see for yourself</h2>',
    '<p>The best way to understand SpringCreek is to experience it. <a href="https://www.springcreekfertility.com/tour/">Take a tour</a>, <a href="fertility-specialists.html">meet our team</a>, or <a href="appointment.html">request a consultation</a> at the location nearest you.</p>'),
  h.crumbs(("Home", "index.html"), ("About", "about.html"), ("Our Fertility Center", None)),
  h.graph(h.webpage(h.BASE + "/our-fertility-center/", "Our Fertility Center", "MedicalWebPage"),
          h.bc_schema([("Home", h.BASE + "/"), ("About", h.BASE + "/about/"), ("Our Fertility Center", h.BASE + "/our-fertility-center/")])),
  nav_active="about"))

# Fertility Specialist (singular SEO landing)
PAGES.append(h.page("specialist",
  "Fertility Specialist (Reproductive Endocrinologist) in Ohio | SpringCreek",
  "Looking for a fertility specialist in Ohio? SpringCreek's board-certified reproductive endocrinologists serve Dayton, Columbus &amp; Cincinnati. Learn when to see one.",
  "Our practice", "Find a Fertility Specialist in Ohio",
  "A reproductive endocrinologist is a physician with advanced training in fertility. Here's what that means — and when to see one.",
  h.prose('<h2>What is a fertility specialist?</h2>',
    '<p>A <strong>fertility specialist</strong>, or <strong>reproductive endocrinologist (REI)</strong>, is a physician who completed OB/GYN training plus additional fellowship training focused on the hormones and conditions that affect the ability to conceive. They evaluate and treat infertility and guide assisted-reproduction options such as IUI and IVF.</p>',
    '<h2>When should you see one?</h2>',
    '<p>Consider an evaluation after 12 months of trying to conceive — or 6 months if you are age 35 or older. Reach out sooner if you have irregular cycles, known conditions such as PCOS or endometriosis, prior pregnancy loss, or if you are building a family as an LGBTQ+ couple or single parent by choice.</p>')
  + h.cards_head("Our specialists", "Board-certified reproductive endocrinologists", [
      ("Jeremy Groll, MD", "Founder &amp; Medical Director; double board-certified in REI and OB/GYN.", "doctor-jeremy-groll.html"),
      ("Kasey Reynolds Marelić, MD", "Board-certified reproductive endocrinologist.", "dr-kasey-marelic.html"),
      ("Meet the full team", "Nurse practitioners, embryology, and a caring support team.", "fertility-specialists.html"),
    ])
  + h.prose('<h2>See a specialist near you</h2>',
    '<p>SpringCreek&rsquo;s fertility specialists see patients in <a href="dayton-fertility-center.html">Dayton</a>, <a href="columbus-fertility-center.html">Columbus (Dublin)</a>, and <a href="cincinnati-fertility-center.html">Cincinnati (Mason)</a>. Many patients schedule without a referral. <a href="appointment.html">Request a consultation</a> to get started.</p>'),
  h.crumbs(("Home", "index.html"), ("About", "about.html"), ("Fertility Specialist", None)),
  h.graph(h.webpage(h.BASE + "/specialist/", "Find a Fertility Specialist in Ohio", "MedicalWebPage"),
          h.faq_schema([("What is a reproductive endocrinologist?", "A reproductive endocrinologist (REI) is a physician with OB/GYN training plus fellowship training in fertility, who evaluates and treats infertility and guides options such as IUI and IVF."),
                        ("Do I need a referral to see a fertility specialist?", "Many patients schedule directly without a referral, though some insurance plans request one. SpringCreek's team can help you check your plan's requirements.")]),
          h.bc_schema([("Home", h.BASE + "/"), ("About", h.BASE + "/about/"), ("Fertility Specialist", h.BASE + "/specialist/")])),
  nav_active="about"))

# Take a Tour
PAGES.append(h.page("tour",
  "Take a Tour | SpringCreek Fertility, Ohio",
  "Take a tour of SpringCreek Fertility — see our welcoming Ohio centers and on-site IVF laboratory, and learn what to expect at your first visit.",
  "Our practice", "Take a Tour of SpringCreek",
  "Get a feel for our space before you visit. A welcoming environment can make a meaningful difference.",
  h.prose('<h2>A calm, welcoming environment</h2>',
    '<p>We know that walking into a fertility center for the first time can stir up many emotions. Our spaces are designed to feel calm, private, and welcoming — from the waiting areas to the consultation rooms to our on-site IVF laboratory.</p>')
  + '<section class="scf-section"><div class="scf-container"><div class="scf-map-ph">Embed a virtual tour video or photo gallery here &middot; // VERIFY asset</div></div></section>'
  + h.cards_head("What you'll find", "Designed with patients in mind", [
      ("Private consultation rooms", "Unhurried, confidential conversations with your physician."),
      ("Comfortable monitoring", "Efficient, caring cycle-monitoring visits, often early morning."),
      ("On-site IVF laboratory", "Advanced embryology, kept close to your care team."),
    ])
  + h.prose('<h2>The best tour is in person</h2>',
    '<p>Ready to see SpringCreek for yourself? <a href="appointment.html">Request a consultation</a>, or <a href="contact.html">contact us</a> with any questions. We would be honored to welcome you.</p>'),
  h.crumbs(("Home", "index.html"), ("About", "about.html"), ("Take a Tour", None)),
  h.graph(h.webpage(h.BASE + "/tour/", "Take a Tour of SpringCreek Fertility"),
          h.bc_schema([("Home", h.BASE + "/"), ("About", h.BASE + "/about/"), ("Take a Tour", h.BASE + "/tour/")])),
  nav_active="about", verify=["Virtual tour / gallery asset"]))
