import os
import sys
import unittest
import zipfile
from datetime import date

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ats_demo import parser  # noqa: E402

AS_OF = date(2026, 8, 30)


class TestDates(unittest.TestCase):
    def test_year_range(self):
        ranges = parser.find_date_ranges("Acme Corp 2018 - 2021")
        self.assertEqual(len(ranges), 1)
        self.assertEqual(ranges[0].start, (2018, 1))
        self.assertEqual(ranges[0].end, (2021, 12))

    def test_month_range_and_present(self):
        ranges = parser.find_date_ranges("Jan 2020 – Mar 2022\nJun 2023 to Present")
        self.assertEqual(ranges[0].start, (2020, 1))
        self.assertEqual(ranges[0].end, (2022, 3))
        self.assertIsNone(ranges[1].end)

    def test_reversed_range_skipped(self):
        self.assertEqual(parser.find_date_ranges("2024 - 2019"), [])

    def test_prose_dash_not_a_range(self):
        # "2016 - Led a team" must not parse as a date range
        self.assertEqual(parser.find_date_ranges("Supervisor | 2016 - Led a team"), [])

    def test_overlap_merge(self):
        text = "2018 - Present\n2021 - Present\n2018 - 2023"
        ranges = parser.find_date_ranges(text)
        years = parser.total_years(ranges, AS_OF)
        # one merged span: Jan 2018 .. Aug 2026 = 104 months ≈ 8.7 years
        self.assertAlmostEqual(years, 8.7, places=1)

    def test_gap_detection(self):
        ranges = parser.find_date_ranges("Jan 2018 - Dec 2019\nJan 2021 - Present")
        gaps = parser.find_gaps(ranges, AS_OF)
        self.assertEqual(len(gaps), 1)
        self.assertIn("12 month gap", gaps[0])

    def test_no_gap_when_contiguous(self):
        ranges = parser.find_date_ranges("Jan 2018 - Mar 2020\nApr 2020 - Present")
        self.assertEqual(parser.find_gaps(ranges, AS_OF), [])


class TestSections(unittest.TestCase):
    def test_standard_headings(self):
        text = "Jane Doe\n\nWork Experience\nAcme\n\nEducation\nB.S. Biology\n\nSkills\nSQL"
        r = parser.parse_resume(text=text, as_of=AS_OF)
        for section in ("experience", "education", "skills"):
            self.assertIn(section, r.sections)
        self.assertEqual(r.nonstandard_headings, [])

    def test_nonstandard_heading_fuzzy_match(self):
        text = "Jane Doe\n\nLEADERSHIP PROFILE\nSeasoned leader.\n\nPROFESSIONAL EXPERIENCE\nAcme 2020 - Present"
        r = parser.parse_resume(text=text, as_of=AS_OF)
        self.assertIn("summary", r.sections)
        self.assertIn("LEADERSHIP PROFILE", r.nonstandard_headings)
        # PROFESSIONAL EXPERIENCE is standard
        self.assertNotIn("PROFESSIONAL EXPERIENCE", r.nonstandard_headings)

    def test_prose_line_not_heading(self):
        section, _ = parser.match_heading(
            "I have experience across many industries, mostly retail.")
        self.assertIsNone(section)


class TestContactAndDegrees(unittest.TestCase):
    def test_contact_extraction(self):
        text = ("Jane Doe\nAustin TX | (512) 555-0100 | jane@example.com | "
                "linkedin.com/in/janedoe\n\nExperience\nAcme 2020 - Present")
        r = parser.parse_resume(text=text, as_of=AS_OF)
        self.assertEqual(r.contact.name, "Jane Doe")
        self.assertEqual(r.contact.email, "jane@example.com")
        self.assertIsNotNone(r.contact.phone)
        self.assertIsNotNone(r.contact.linkedin)

    def test_degree_detection(self):
        self.assertIn("bachelor", parser.find_degrees("B.S. in Marketing, UIUC, 2016"))
        self.assertIn("master", parser.find_degrees("MBA, Wharton"))
        self.assertEqual(parser.find_degrees("Managed BA stakeholders daily"), [])

    def test_missing_education_flagged(self):
        text = "Jane Doe\njane@example.com | (512) 555-0100\n\nExperience\nAcme 2020 - Present\n\nSkills\nSQL"
        r = parser.parse_resume(text=text, as_of=AS_OF)
        codes = {i.code for i in r.format_issues}
        self.assertIn("missing-education", codes)


class TestDocx(unittest.TestCase):
    def _make_docx(self, path, body_xml, extra_parts=None):
        content_types = (
            '<?xml version="1.0"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
            "</Types>")
        with zipfile.ZipFile(path, "w") as zf:
            zf.writestr("[Content_Types].xml", content_types)
            zf.writestr("word/document.xml", body_xml)
            for name, data in (extra_parts or {}).items():
                zf.writestr(name, data)

    @staticmethod
    def _wrap(paragraphs):
        ns = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
        body = "".join(f"<w:p><w:r><w:t>{p}</w:t></w:r></w:p>" for p in paragraphs)
        return f'<?xml version="1.0"?><w:document {ns}><w:body>{body}</w:body></w:document>'

    def test_docx_extraction(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "r.docx")
            self._make_docx(path, self._wrap(["Jane Doe", "jane@example.com",
                                              "Experience", "Acme 2020 - Present"]))
            text, issues = parser.extract_text(path)
            self.assertIn("Jane Doe", text)
            self.assertIn("Acme 2020 - Present", text)
            self.assertEqual(issues, [])

    def test_contact_only_in_footer_flagged(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "r.docx")
            footer = self._wrap(["jane@example.com | (512) 555-0100"])
            self._make_docx(path, self._wrap(["Jane Doe", "Experience",
                                              "Acme 2020 - Present"]),
                            {"word/footer1.xml": footer})
            text, issues = parser.extract_text(path)
            self.assertTrue(any(i.code == "contact-in-header" for i in issues))
            # footer text still lands in the extracted text
            self.assertIn("jane@example.com", text)

    def test_table_flagged(self):
        import tempfile
        ns = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
        xml = (f'<?xml version="1.0"?><w:document {ns}><w:body>'
               "<w:tbl><w:tr><w:tc><w:p><w:r><w:t>cell</w:t></w:r></w:p></w:tc></w:tr></w:tbl>"
               "</w:body></w:document>")
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "r.docx")
            self._make_docx(path, xml)
            _, issues = parser.extract_text(path)
            self.assertTrue(any(i.code == "docx-table" for i in issues))

    def test_pdf_rejected(self):
        with self.assertRaises(ValueError):
            parser.extract_text("resume.pdf")


if __name__ == "__main__":
    unittest.main()
