import os
import sys
import unittest
from datetime import date

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ats_demo import platforms, taxonomy  # noqa: E402
from ats_demo.jobspec import parse_jobspec  # noqa: E402
from ats_demo.parser import parse_resume  # noqa: E402
from ats_demo.scoring import score_resume, score_title  # noqa: E402

AS_OF = date(2026, 8, 30)

JD = """Digital Marketing Manager

Requirements:
- 5+ years of digital marketing experience
- Deep SEO expertise
- Google Ads campaign management
- GA4 / Google Analytics fluency
- Bachelor's degree required

Preferred qualifications:
- Looker Studio reporting
- HIPAA awareness
"""

RESUME_FULL = """Jane Doe
jane@example.com | (512) 555-0100 | linkedin.com/in/janedoe

Professional Experience

Digital Marketing Manager
Acme Health, 2019 - Present
- Led SEO strategy and Google Ads campaigns
- Built GA4 dashboards in Looker Studio

Education
B.S. in Marketing, UT Austin, 2015

Skills
SEO, Google Ads, GA4, Looker Studio
"""

RESUME_NO_DEGREE = RESUME_FULL.replace(
    "Education\nB.S. in Marketing, UT Austin, 2015\n\n", "")


class TestTaxonomy(unittest.TestCase):
    def test_alias_matching(self):
        self.assertIn("google ads", taxonomy.find_all_skills("Managed AdWords daily"))
        self.assertIn("google analytics", taxonomy.find_all_skills("expert in GA4"))
        self.assertIn("ppc", taxonomy.find_all_skills("ran pay per click programs"))

    def test_word_boundaries(self):
        self.assertNotIn("seo", taxonomy.find_all_skills("Jose Osei paseo"))
        self.assertIn("seo", taxonomy.find_all_skills("technical SEO audits"))

    def test_canonicalize(self):
        self.assertEqual(taxonomy.canonicalize("AdWords"), "google ads")
        self.assertEqual(taxonomy.canonicalize("Underwater Basketweaving"),
                         "underwater basketweaving")


class TestJobSpec(unittest.TestCase):
    def test_prose_parsing(self):
        spec = parse_jobspec(JD)
        self.assertEqual(spec.title, "Digital Marketing Manager")
        self.assertIn("seo", spec.required_skills)
        self.assertIn("google ads", spec.required_skills)
        self.assertIn("looker studio", spec.preferred_skills)
        self.assertNotIn("looker studio", spec.required_skills)
        self.assertEqual(spec.min_years, 5)
        self.assertEqual(spec.education_level, 2)
        self.assertTrue(spec.education_required)

    def test_explicit_markers_take_precedence(self):
        spec = parse_jobspec(
            "Title: SEO Lead\nRequired skills: seo, python\n"
            "Preferred skills: sql\nMinimum years: 3\nEducation: none\n")
        self.assertEqual(spec.title, "SEO Lead")
        self.assertEqual(spec.required_skills, ["seo", "python"])
        self.assertEqual(spec.preferred_skills, ["sql"])
        self.assertEqual(spec.min_years, 3)
        self.assertEqual(spec.education_level, 0)

    def test_education_preferred_not_required(self):
        spec = parse_jobspec("Role\n\nRequirements:\n- MBA preferred\n")
        self.assertEqual(spec.education_level, 3)
        self.assertFalse(spec.education_required)

    def test_education_required_survives_other_preferred_bullets(self):
        # regression: "healthcare preferred" in another bullet must not
        # soften "Bachelor's degree required"
        spec = parse_jobspec(
            "Role\n\nRequirements:\n"
            "- 5+ years experience, healthcare preferred\n"
            "- Bachelor's degree in Marketing or a related field\n")
        self.assertEqual(spec.education_level, 2)
        self.assertTrue(spec.education_required)

    def test_required_bachelor_wins_over_preferred_mba(self):
        spec = parse_jobspec(
            "Role\n\nRequirements:\n- Bachelor's degree required; MBA preferred\n")
        self.assertEqual(spec.education_level, 2)
        self.assertTrue(spec.education_required)

    def test_equivalent_experience_not_a_knockout(self):
        spec = parse_jobspec(
            "Role\n\nRequirements:\n- Bachelor's degree or equivalent experience\n")
        self.assertFalse(spec.education_required)


class TestScoring(unittest.TestCase):
    def setUp(self):
        self.spec = parse_jobspec(JD)
        self.weights = platforms.PROFILES["generic"].weights

    def test_full_match_scores_high(self):
        resume = parse_resume(text=RESUME_FULL, as_of=AS_OF)
        card = score_resume(resume, self.spec, self.weights)
        self.assertEqual(card.subscores["required_skills"], 100.0)
        self.assertEqual(card.subscores["education"], 100.0)
        self.assertEqual(card.subscores["experience"], 100.0)
        self.assertEqual(card.missing_required, [])
        self.assertGreaterEqual(card.composite, 85)

    def test_missing_degree_lowers_education(self):
        resume = parse_resume(text=RESUME_NO_DEGREE, as_of=AS_OF)
        card = score_resume(resume, self.spec, self.weights)
        self.assertEqual(card.subscores["education"], 0.0)

    def test_title_scoring(self):
        score, best = score_title("Digital Marketing Manager",
                                  ["Digital Marketing Manager", "Barista"])
        self.assertEqual(score, 100.0)
        self.assertEqual(best, "Digital Marketing Manager")
        score2, _ = score_title("Digital Marketing Manager", ["Barista"])
        self.assertEqual(score2, 0.0)

    def test_deterministic(self):
        resume = parse_resume(text=RESUME_FULL, as_of=AS_OF)
        c1 = score_resume(resume, self.spec, self.weights)
        c2 = score_resume(resume, self.spec, self.weights)
        self.assertEqual(c1.composite, c2.composite)
        self.assertEqual(c1.subscores, c2.subscores)


class TestPlatforms(unittest.TestCase):
    def setUp(self):
        self.spec = parse_jobspec(JD)

    def _decide(self, key, resume_text):
        resume = parse_resume(text=resume_text, as_of=AS_OF)
        card = score_resume(resume, self.spec, platforms.PROFILES[key].weights)
        return platforms.decide(key, resume, self.spec, card)

    def test_workday_knockout_on_missing_degree(self):
        d = self._decide("workday", RESUME_NO_DEGREE)
        self.assertEqual(d.status, platforms.REJECT)
        self.assertTrue(d.knockout_failures)

    def test_generic_does_not_knock_out(self):
        d = self._decide("generic", RESUME_NO_DEGREE)
        self.assertNotEqual(d.status, platforms.REJECT)

    def test_greenhouse_never_rejects(self):
        d = self._decide("greenhouse", "Sam Cole\nI like marketing.")
        self.assertEqual(d.status, platforms.REVIEW)

    def test_taleo_ace_flag(self):
        d = self._decide("taleo", RESUME_FULL)
        self.assertEqual(d.status, platforms.ADVANCE)
        self.assertIn("ACE", d.label)


if __name__ == "__main__":
    unittest.main()
