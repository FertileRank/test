# -*- coding: utf-8 -*-
import sys, os, re
sys.path.insert(0, "/tmp/scfbuild")
import common
import content_services, content_practice, content_convert, content_hub
import content_services2, content_bios, content_practice2, content_resources, content_education, content_financial2, content_misc

# Home + the 3 location pages are produced by the Brand v2 builders (build_v2*.py),
# so they are intentionally excluded here.
PAGES = (content_practice.PAGES + content_services.PAGES + content_convert.PAGES + content_hub.PAGES
         + content_services2.PAGES + content_bios.PAGES + content_practice2.PAGES
         + content_resources.PAGES + content_education.PAGES + content_financial2.PAGES + content_misc.PAGES)

for p in PAGES:
    common.write(p)

comp = open(os.path.join(common.OUT, "assets/css/scf-components.css"), encoding="utf-8").read()
with open(os.path.join(common.OUT, "elementor", "_shared-scf-css.html"), "w", encoding="utf-8") as f:
    f.write("<!-- SpringCreek shared scoped component CSS. Add ONCE via Elementor > Site Settings >\n"
            "     Custom CSS (or a global HTML block). Required by every .scf-page paste block. -->\n<style>\n"
            + comp + "\n</style>\n")

print(f"Built {len(PAGES)} .scf pages (standalone + elementor).")
