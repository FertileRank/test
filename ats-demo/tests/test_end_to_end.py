import io
import json
import os
import sys
import unittest
from contextlib import redirect_stdout

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ats_demo.cli import main  # noqa: E402

HERE = os.path.dirname(__file__)
SAMPLES = os.path.join(HERE, "..", "samples")
JD = os.path.join(SAMPLES, "jobs", "digital_marketing_manager_healthcare.txt")
STRONG = os.path.join(SAMPLES, "resumes", "strong_candidate.txt")
MID = os.path.join(SAMPLES, "resumes", "mid_candidate.txt")
WEAK = os.path.join(SAMPLES, "resumes", "weak_candidate.txt")


def run_cli(*argv):
    buf = io.StringIO()
    with redirect_stdout(buf):
        code = main(list(argv))
    return code, buf.getvalue()


class TestEndToEnd(unittest.TestCase):
    def test_score_markdown_report(self):
        code, out = run_cli("score", "--resume", STRONG, "--job", JD,
                            "--as-of", "2026-08-30")
        self.assertEqual(code, 0)
        self.assertIn("ATS Screening Report", out)
        self.assertIn("Jordan Alvarez", out)
        self.assertIn("Overall match score", out)
        # all four platform decisions present by default
        for label in ("Generic ATS", "Workday", "Greenhouse", "Taleo"):
            self.assertIn(label, out)

    def test_score_json_report(self):
        code, out = run_cli("score", "--resume", STRONG, "--job", JD,
                            "--format", "json", "--as-of", "2026-08-30")
        self.assertEqual(code, 0)
        payload = json.loads(out)
        self.assertGreaterEqual(payload["composite_score"], 75)
        self.assertEqual(payload["candidate"]["name"], "Jordan Alvarez")
        self.assertTrue(payload["decisions"])

    def test_strong_advances_weak_rejected(self):
        _, strong_out = run_cli("score", "--resume", STRONG, "--job", JD,
                                "--platform", "generic", "--format", "json",
                                "--as-of", "2026-08-30")
        _, weak_out = run_cli("score", "--resume", WEAK, "--job", JD,
                              "--platform", "generic", "--format", "json",
                              "--as-of", "2026-08-30")
        strong = json.loads(strong_out)
        weak = json.loads(weak_out)
        self.assertEqual(strong["decisions"][0]["status"], "ADVANCE")
        self.assertEqual(weak["decisions"][0]["status"], "REJECT")
        self.assertGreater(strong["composite_score"], weak["composite_score"])

    def test_ranking_order(self):
        code, out = run_cli("rank", "--job", JD, "--resumes",
                            WEAK, STRONG, MID, "--as-of", "2026-08-30")
        self.assertEqual(code, 0)
        jordan = out.index("Jordan Alvarez")
        priya = out.index("Priya Natarajan")
        sam = out.index("Sam Cole") if "Sam Cole" in out else out.index("SAM COLE")
        self.assertLess(jordan, priya)
        self.assertLess(priya, sam)

    def test_weak_resume_findings(self):
        code, out = run_cli("score", "--resume", WEAK, "--job", JD,
                            "--format", "json", "--as-of", "2026-08-30")
        payload = json.loads(out)
        categories = {f["category"] for f in payload["findings"]}
        self.assertIn("keywords", categories)
        self.assertIn("formatting", categories)
        codes_msgs = " ".join(f["message"] for f in payload["findings"])
        self.assertIn("empty bullet", codes_msgs.lower())

    def test_missing_file_is_clean_error(self):
        code, _ = run_cli("score", "--resume", "nope.txt", "--job", JD)
        self.assertEqual(code, 2)


if __name__ == "__main__":
    unittest.main()
