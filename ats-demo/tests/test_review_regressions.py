"""Regression tests for defects found by the adversarial review pass.

Each test corresponds to a confirmed finding; keep them green.
"""

import os
import sys
import unittest
from datetime import date

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ats_demo import parser, platforms, taxonomy  # noqa: E402
from ats_demo.jobspec import parse_jobspec  # noqa: E402
from ats_demo.parser import parse_resume  # noqa: E402
from ats_demo.scoring import score_resume, score_title  # noqa: E402

AS_OF = date(2026, 8, 30)


class TestParserRegressions(unittest.TestCase):
    def test_phone_without_separators(self):
        self.assertTrue(parser.PHONE_RE.search("(512)555-0100"))
        self.assertTrue(parser.PHONE_RE.search("5125550100"))
        self.assertFalse(parser.PHONE_RE.search("20265125550100123"))

    def test_titles_with_inline_dates(self):
        titles = parser.find_titles(
            "Marketing Manager | Acme Health | Jan 2019 - Present\n"
            "- Grew traffic 40%\n"
            "SEO Specialist | BrightWeb | Jun 2015 - Dec 2018")
        self.assertEqual(titles, ["Marketing Manager | Acme Health",
                                  "SEO Specialist | BrightWeb"])

    def test_numeric_mm_yyyy_dates(self):
        r = parser.find_date_ranges("05/2019 - 08/2024")
        self.assertEqual((r[0].start, r[0].end), ((2019, 5), (2024, 8)))

    def test_to_date_means_present(self):
        self.assertIsNone(parser.find_date_ranges("Jan 2015 to date")[0].end)

    def test_month_month_year_span(self):
        r = parser.find_date_ranges("Marketing Intern, May - August 2021")
        self.assertEqual((r[0].start, r[0].end), ((2021, 5), (2021, 8)))

    def test_full_range_not_double_counted_as_month_span(self):
        self.assertEqual(len(parser.find_date_ranges("Jan 2020 - Mar 2022")), 1)

    def test_future_open_range_not_negative(self):
        ranges = parser.find_date_ranges("Jan 2027 - Present")
        self.assertEqual(parser.total_years(ranges, AS_OF), 0.0)

    def test_career_objective_is_summary(self):
        self.assertEqual(parser.match_heading("CAREER OBJECTIVE")[0], "summary")
        self.assertEqual(parser.match_heading("CAREER HISTORY")[0], "experience")

    def test_heading_with_comma(self):
        self.assertEqual(parser.match_heading("Skills, Tools & Technologies")[0],
                         "skills")
        # ... but a Title Case company line is not a heading
        self.assertIsNone(parser.match_heading("Acme Education Partners")[0])

    def test_state_abbreviations_are_not_degrees(self):
        self.assertEqual(parser.find_degrees("Boston University, Boston, MA in 2019"), [])
        self.assertEqual(parser.find_degrees("Jackson, MS in 2018"), [])
        self.assertIn("master", parser.find_degrees("MA in Economics, NYU"))

    def test_associate_award_is_not_a_degree(self):
        self.assertEqual(parser.find_degrees("Named Sales Associate of the Year, 2021"), [])
        self.assertIn("associate", parser.find_degrees("Associate of Applied Science"))

    def test_corrupt_docx_is_value_error(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "fake.docx")
            with open(path, "w") as fh:
                fh.write("this is not a zip file")
            with self.assertRaises(ValueError):
                parser.extract_text(path)

    def test_textbox_content_not_duplicated(self):
        import tempfile
        import zipfile
        ns = ('xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
              'xmlns:v="urn:schemas-microsoft-com:vml"')
        xml = (f'<?xml version="1.0"?><w:document {ns}><w:body>'
               "<w:p><w:r><w:pict><v:shape><v:textbox><w:txbxContent>"
               "<w:p><w:r><w:t>Jane Doe jane@example.com</w:t></w:r></w:p>"
               "</w:txbxContent></v:textbox></v:shape></w:pict></w:r></w:p>"
               "<w:p><w:r><w:t>Experience</w:t></w:r></w:p>"
               "</w:body></w:document>")
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "r.docx")
            with zipfile.ZipFile(path, "w") as zf:
                zf.writestr("[Content_Types].xml", "<Types/>")
                zf.writestr("word/document.xml", xml)
            text, _ = parser.extract_text(path)
            self.assertEqual(text.count("Jane Doe"), 1)


class TestScoringRegressions(unittest.TestCase):
    def test_title_comma_suffix_stripped(self):
        score, _ = score_title("Digital Marketing Manager, Healthcare Division",
                               ["Digital Marketing Manager"])
        self.assertEqual(score, 100.0)

    def test_abbreviated_seniority_tokenizes(self):
        self.assertIn("sr", taxonomy.tokenize("Sr. Marketing Manager"))


class TestJobspecRegressions(unittest.TestCase):
    def test_year_range_takes_lower_bound(self):
        spec = parse_jobspec("Role\n\nRequirements:\n- 3-5 years of SEO experience\n")
        self.assertEqual(spec.min_years, 3)

    def test_age_requirement_not_experience(self):
        spec = parse_jobspec(
            "Role\n\nRequirements:\n- Must be 18 years of age\n- 4+ years marketing\n")
        self.assertEqual(spec.min_years, 4)

    def test_basic_qualifications_heading(self):
        spec = parse_jobspec("Role\n\nBasic Qualifications:\n- SEO expertise\n")
        self.assertIn("seo", spec.required_skills)

    def test_unrecognized_heading_resets_bucket(self):
        spec = parse_jobspec(
            "Role\n\nRequirements:\n- SEO\n\nAbout Acme:\n"
            "We have used Google Ads for 10 years internally\n")
        self.assertIsNone(spec.min_years)
        self.assertNotIn("google ads", spec.required_skills)

    def test_explicit_preferred_not_leaked_into_required(self):
        spec = parse_jobspec(
            "Role\nRequirements:\n- 5+ years python\nPreferred skills: hipaa\n")
        self.assertNotIn("hipaa", spec.required_skills)
        self.assertEqual(spec.preferred_skills, ["hipaa"])

    def test_md_explicit_marker(self):
        spec = parse_jobspec("Title: Physician\nEducation: MD required\n")
        self.assertEqual(spec.education_level, 4)
        self.assertTrue(spec.education_required)

    def test_maryland_is_not_a_degree(self):
        spec = parse_jobspec(
            "Role\n\nRequirements:\n- Located in Baltimore, MD in the harbor district\n")
        self.assertEqual(spec.education_level, 0)

    def test_preferred_bucket_degree_detected(self):
        spec = parse_jobspec(
            "Role\n\nRequirements:\n- SEO\n\nPreferred qualifications:\n- MBA preferred\n")
        self.assertEqual(spec.education_level, 3)
        self.assertFalse(spec.education_required)


class TestPlatformRegressions(unittest.TestCase):
    def test_workday_low_score_without_knockout_is_review(self):
        spec = parse_jobspec("Barista\n\nRequirements:\n- Latte art mastery\n")
        resume = parse_resume(
            text=("Pat Doe\npat@example.com | (512) 555-0100\n\nExperience\n"
                  "SEO Manager\nAcme, 2020 - Present\n\nEducation\nB.S. in Art\n\n"
                  "Skills\nSEO"),
            as_of=AS_OF)
        card = score_resume(resume, spec, platforms.PROFILES["workday"].weights)
        decision = platforms.decide("workday", resume, spec, card)
        self.assertEqual(decision.status, platforms.REVIEW)

    def test_empty_jd_never_advances_or_aces(self):
        spec = parse_jobspec("Cool Job\n\nWe are cool and you are cool.\n")
        resume = parse_resume(
            text=("Pat Doe\npat@example.com | (512) 555-0100\n\nExperience\n"
                  "SEO Manager\nAcme, 2020 - Present\n\nEducation\nB.S. in Art\n\n"
                  "Skills\nSEO"),
            as_of=AS_OF)
        for key in platforms.PROFILES:
            card = score_resume(resume, spec, platforms.PROFILES[key].weights)
            decision = platforms.decide(key, resume, spec, card)
            self.assertNotEqual(decision.status, platforms.ADVANCE, key)
            self.assertNotIn("ACE", decision.label, key)
            self.assertTrue(any("No screenable requirements" in r
                                for r in decision.reasons), key)


class TestCliRegressions(unittest.TestCase):
    def test_rank_survives_missing_and_corrupt_files(self):
        import io
        import tempfile
        from contextlib import redirect_stdout, redirect_stderr
        from ats_demo.cli import main
        samples = os.path.join(os.path.dirname(__file__), "..", "samples")
        good = os.path.join(samples, "resumes", "strong_candidate.txt")
        jd = os.path.join(samples, "jobs", "seo_manager.txt")
        with tempfile.TemporaryDirectory() as tmp:
            corrupt = os.path.join(tmp, "corrupt.docx")
            with open(corrupt, "w") as fh:
                fh.write("not a zip")
            out, err = io.StringIO(), io.StringIO()
            with redirect_stdout(out), redirect_stderr(err):
                code = main(["rank", "--job", jd, "--resumes",
                             "missing.txt", corrupt, good,
                             "--as-of", "2026-08-30"])
            self.assertEqual(code, 0)
            self.assertIn("Jordan Alvarez", out.getvalue())
            self.assertEqual(err.getvalue().count("skipping"), 2)

    def test_pipe_in_name_escaped_in_ranking(self):
        import io
        import tempfile
        from contextlib import redirect_stdout
        from ats_demo.cli import main
        samples = os.path.join(os.path.dirname(__file__), "..", "samples")
        jd = os.path.join(samples, "jobs", "seo_manager.txt")
        with tempfile.TemporaryDirectory() as tmp:
            piped = os.path.join(tmp, "piped.txt")
            with open(piped, "w") as fh:
                fh.write("Jane Smith | Senior SEO Manager\njane@example.com\n\n"
                         "Experience\nSEO Manager\nAcme, 2020 - Present\n")
            out = io.StringIO()
            with redirect_stdout(out):
                main(["rank", "--job", jd, "--resumes", piped,
                      "--as-of", "2026-08-30"])
            row = [l for l in out.getvalue().splitlines()
                   if l.startswith("| 1 |")][0]
            self.assertIn("Jane Smith \\| Senior SEO Manager", row)


if __name__ == "__main__":
    unittest.main()
