"""Feedback generation: turn parse + score results into concrete, prioritized
findings and recommendations (the "why was I accepted/rejected" report)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from . import taxonomy
from .jobspec import JobSpec
from .parser import ParsedResume, highest_degree_level
from .scoring import ScoreCard

_SEVERITY_ORDER = {"critical": 0, "warning": 1, "info": 2}


@dataclass
class Finding:
    severity: str      # critical | warning | info
    category: str      # keywords | experience | education | formatting | title
    message: str
    recommendation: str


def build_findings(resume: ParsedResume, spec: JobSpec, card: ScoreCard) -> List[Finding]:
    findings: List[Finding] = []

    # --- keywords ---
    if card.missing_required:
        names = ", ".join(taxonomy.display_name(s) for s in card.missing_required)
        findings.append(Finding(
            "critical", "keywords",
            f"Missing required keywords: {names}.",
            "Every required skill you genuinely have should appear verbatim in "
            "the resume — ideally inside an experience bullet showing how you "
            "used it, plus the skills list. If you lack the skill, address it "
            "in the cover letter or close the gap before applying.",
        ))
    if card.missing_preferred:
        names = ", ".join(taxonomy.display_name(s) for s in card.missing_preferred)
        findings.append(Finding(
            "info", "keywords",
            f"Missing preferred (nice-to-have) keywords: {names}.",
            "Preferred skills break ties between otherwise similar candidates. "
            "Add any you can honestly claim.",
        ))
    only_listed = [m.skill for m in card.keyword_matches
                   if m.found and not m.in_experience]
    if only_listed and resume.sections.get("experience"):
        names = ", ".join(taxonomy.display_name(s) for s in only_listed)
        findings.append(Finding(
            "warning", "keywords",
            f"Skills matched only outside the experience section: {names}.",
            "Recruiters (and some ranking algorithms) weight skills that appear "
            "in the context of actual work. Back each key skill with an "
            "experience bullet, not just a list entry.",
        ))

    # --- title ---
    if card.subscores.get("title", 100) < 60:
        target = spec.title
        best = f' (closest: "{card.best_title}")' if card.best_title else ""
        findings.append(Finding(
            "warning", "title",
            f'Job titles on the resume align weakly with the target role '
            f'"{target}"{best}.',
            "Where truthful, mirror the target title's wording in your "
            "headline or most recent role (e.g. add a clarifier like "
            f'"— {target}" after an internal title). Recruiters search by title.',
        ))

    # --- experience ---
    if spec.min_years and resume.total_experience_years < spec.min_years:
        findings.append(Finding(
            "critical", "experience",
            f"Parseable experience ({resume.total_experience_years:g} years) is "
            f"below the required minimum ({spec.min_years} years).",
            "Make every role's dates machine-readable (\"Jan 2020 – Present\"). "
            "If your real experience meets the bar, this is a parsing problem, "
            "not an experience problem — fix the formatting.",
        ))
    for gap in resume.employment_gaps:
        findings.append(Finding(
            "info", "experience", f"Employment gap detected: {gap}.",
            "Gaps aren't disqualifying, but be ready to explain them; a short "
            "line in the resume (sabbatical, caregiving, education) prevents "
            "wrong assumptions.",
        ))

    # --- education ---
    cand_level = highest_degree_level(resume.degrees)
    if spec.education_level and cand_level < spec.education_level:
        sev = "critical" if spec.education_required else "warning"
        have = resume.degrees[0] if resume.degrees else "no degree detected"
        findings.append(Finding(
            sev, "education",
            f"Role asks for a {spec.education_level_name} degree "
            f"({'required' if spec.education_required else 'preferred'}); "
            f"resume shows: {have}.",
            "If you hold a qualifying degree, add an Education section listing "
            "it — screening questions about degrees are a common auto-reject. "
            "If not, target postings that say \"or equivalent experience\" and "
            "lead with certifications and outcomes.",
        ))

    # --- formatting / parseability ---
    for issue in resume.format_issues:
        findings.append(Finding(issue.severity, "formatting",
                                issue.message, issue.recommendation))

    findings.sort(key=lambda f: _SEVERITY_ORDER.get(f.severity, 3))
    return findings
