# -*- coding: utf-8 -*-
import sys, os, re
sys.path.insert(0, "/tmp/scfbuild")
import common
import content_home, content_locations, content_services, content_practice, content_convert, content_hub

PAGES = (content_home.PAGES + content_locations.PAGES + content_services.PAGES
         + content_practice.PAGES + content_convert.PAGES + content_hub.PAGES)

for p in PAGES:
    common.write(p)

# Shared Elementor component CSS (add once site-wide)
comp = open(os.path.join(common.OUT, "assets/css/scf-components.css"), encoding="utf-8").read()
with open(os.path.join(common.OUT, "elementor", "_shared-scf-css.html"), "w", encoding="utf-8") as f:
    f.write("<!-- SpringCreek shared scoped component CSS. Add ONCE via Elementor > Site Settings >\n"
            "     Custom CSS (or a global HTML block). Required by every page paste block. -->\n<style>\n"
            + comp + "\n</style>\n")

print(f"Built {len(PAGES)} pages (standalone + elementor) + shared CSS.\n")
print(f"{'slug':28} {'words':>6}  {'int-links':>9}")
for p in PAGES:
    fn = "index" if p["slug"]=="home" else p["slug"]
    html = open(os.path.join(common.OUT, fn+".html"), encoding="utf-8").read()
    links = html.count('href="') - html.count('href="http')  # rough internal (relative) count
    print(f"{p['slug']:28} {common.wordcount(p):>6}  {links:>9}")
