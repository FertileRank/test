"""Scoring engine: sub-scores per commonly used ATS/recruiting criteria and a
weighted composite match score (0–100).

Sub-scores:
  required_skills — % of the JD's required skills found in the resume
  preferred_skills — % of preferred skills found
  title           — alignment between the JD title and the candidate's titles
  experience      — total years vs. the JD minimum
  education       — degree level vs. the JD requirement
  formatting      — parseability (100 minus deductions per issue)

The composite is a weighted average; each platform profile supplies its own
weights, thresholds, and knockout rules (see platforms.py).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Set

from . import taxonomy
from .jobspec import JobSpec
from .parser import ParsedResume, highest_degree_level

SUBSCORE_NAMES = ["required_skills", "preferred_skills", "title",
                  "experience", "education", "formatting"]

_ISSUE_DEDUCTIONS = {"critical": 25, "warning": 10, "info": 3}

# generic seniority ladder for title-level comparison
_SENIORITY = {
    "intern": 0, "junior": 1, "jr": 1, "associate": 1, "coordinator": 1,
    "assistant": 1, "specialist": 2, "analyst": 2, "senior": 3, "sr": 3,
    "lead": 3, "principal": 4, "manager": 4, "head": 5, "director": 5,
    "vp": 6, "president": 6, "chief": 6, "founder": 5, "owner": 5,
}


@dataclass
class KeywordMatch:
    skill: str            # canonical name
    required: bool
    found: bool
    in_experience: bool = False   # found inside the experience section

    @property
    def display(self) -> str:
        return taxonomy.display_name(self.skill)


@dataclass
class ScoreCard:
    subscores: Dict[str, float] = field(default_factory=dict)
    weights: Dict[str, float] = field(default_factory=dict)
    composite: float = 0.0
    keyword_matches: List[KeywordMatch] = field(default_factory=list)
    matched_required: List[str] = field(default_factory=list)
    missing_required: List[str] = field(default_factory=list)
    matched_preferred: List[str] = field(default_factory=list)
    missing_preferred: List[str] = field(default_factory=list)
    best_title: str = ""
    notes: List[str] = field(default_factory=list)


def _skill_hits(skills: List[str], resume: ParsedResume) -> List[KeywordMatch]:
    text_norm = resume.text_norm
    exp_norm = taxonomy.normalize(resume.sections.get("experience", ""))
    hits = []
    for skill in skills:
        found = taxonomy.skill_found_in(skill, text_norm)
        in_exp = bool(exp_norm) and taxonomy.skill_found_in(skill, exp_norm)
        hits.append(KeywordMatch(skill=skill, required=True, found=found,
                                 in_experience=in_exp))
    return hits


def score_title(job_title: str, candidate_titles: List[str]) -> tuple:
    """Return (score 0–100, best matching candidate title). Only the role
    name matters: a suffix after an em-dash/pipe ("… — Multi-Location
    Healthcare Group") is department flavor, not the title."""
    import re
    job_title = re.split(r"\s*[—–|,(]\s*|\s+-\s+", job_title)[0]
    jd_tokens = set(taxonomy.tokenize(job_title))
    jd_core = {t for t in jd_tokens if t not in _SENIORITY}
    if not jd_core:
        jd_core = jd_tokens
    best_score, best_title = 0.0, ""
    for title in candidate_titles:
        cand_tokens = set(taxonomy.tokenize(title))
        cand_core = {t for t in cand_tokens if t not in _SENIORITY}
        overlap = len(jd_core & cand_core) / len(jd_core) if jd_core else 0.0
        score = overlap * 100
        # small penalty when the JD asks for a much more senior level
        jd_level = max((_SENIORITY.get(t, 0) for t in jd_tokens), default=0)
        cand_level = max((_SENIORITY.get(t, 0) for t in cand_tokens), default=0)
        if jd_level - cand_level >= 2:
            score *= 0.8
        if score > best_score:
            best_score, best_title = score, title
    return round(best_score, 1), best_title


def score_resume(resume: ParsedResume, spec: JobSpec,
                 weights: Dict[str, float]) -> ScoreCard:
    card = ScoreCard(weights=dict(weights))

    # --- keyword sub-scores ---
    req_hits = _skill_hits(spec.required_skills, resume)
    pref_hits = _skill_hits(spec.preferred_skills, resume)
    for h in pref_hits:
        h.required = False
    card.keyword_matches = req_hits + pref_hits
    card.matched_required = [h.skill for h in req_hits if h.found]
    card.missing_required = [h.skill for h in req_hits if not h.found]
    card.matched_preferred = [h.skill for h in pref_hits if h.found]
    card.missing_preferred = [h.skill for h in pref_hits if not h.found]

    card.subscores["required_skills"] = round(
        100.0 * len(card.matched_required) / len(req_hits) if req_hits else 100.0, 1)
    card.subscores["preferred_skills"] = round(
        100.0 * len(card.matched_preferred) / len(pref_hits) if pref_hits else 100.0, 1)

    # --- title ---
    title_score, best_title = score_title(spec.title, resume.titles)
    card.subscores["title"] = title_score
    card.best_title = best_title
    if not resume.titles:
        card.notes.append("No job titles could be identified in the resume — "
                          "title alignment scored 0.")

    # --- experience ---
    if spec.min_years:
        ratio = min(resume.total_experience_years / spec.min_years, 1.0)
        card.subscores["experience"] = round(100.0 * ratio, 1)
    else:
        card.subscores["experience"] = 100.0

    # --- education ---
    cand_level = highest_degree_level(resume.degrees)
    if spec.education_level == 0:
        card.subscores["education"] = 100.0
    elif cand_level >= spec.education_level:
        card.subscores["education"] = 100.0
    elif cand_level > 0:
        card.subscores["education"] = 50.0
    else:
        card.subscores["education"] = 0.0

    # --- formatting / parseability ---
    deduction = sum(_ISSUE_DEDUCTIONS.get(i.severity, 0) for i in resume.format_issues)
    card.subscores["formatting"] = float(max(0, 100 - deduction))

    # --- composite ---
    total_w = sum(weights.get(k, 0.0) for k in SUBSCORE_NAMES) or 1.0
    card.composite = round(
        sum(card.subscores[k] * weights.get(k, 0.0) for k in SUBSCORE_NAMES) / total_w, 1)
    return card
