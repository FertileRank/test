"""Platform profiles: how different ATS products turn a score into a
disposition.

Important reality check (see README): mainstream ATS platforms do NOT
secretly auto-reject resumes on a hidden keyword score. What they actually
automate is (a) parsing into a structured profile, (b) keyword search and
ranking for recruiters, and (c) knockout/screening questions configured per
requisition — that last one is where genuine auto-rejection happens
(work authorization, minimum years, required degree/license). These profiles
simulate each product's *style* of screening, clearly labeled as simulation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from .jobspec import JobSpec
from .parser import ParsedResume, highest_degree_level
from .scoring import ScoreCard

ADVANCE, REVIEW, REJECT = "ADVANCE", "HUMAN REVIEW", "REJECT"


@dataclass
class Decision:
    platform: str
    status: str                    # ADVANCE | HUMAN REVIEW | REJECT
    label: str = ""                # platform-flavored label, e.g. "ACE candidate"
    reasons: List[str] = field(default_factory=list)
    knockout_failures: List[str] = field(default_factory=list)
    notes: List[str] = field(default_factory=list)


@dataclass
class PlatformProfile:
    key: str
    name: str
    weights: Dict[str, float]
    accept_threshold: float
    review_threshold: float
    knockout_min_years: bool = False    # unmet minimum years auto-rejects
    knockout_education: bool = False    # missing required degree auto-rejects
    auto_reject: bool = True            # False => never auto-reject (Greenhouse)
    score_reject: bool = True           # False => a low score alone never rejects,
                                        # only knockouts do (Workday/Taleo reality)
    description: str = ""

    def knockouts(self, resume: ParsedResume, spec: JobSpec) -> List[str]:
        failures = []
        if self.knockout_min_years and spec.min_years:
            if resume.total_experience_years < spec.min_years:
                failures.append(
                    f"Screening question: '{spec.min_years}+ years of relevant "
                    f"experience?' — resume shows "
                    f"{resume.total_experience_years:g} parseable years.")
        if self.knockout_education and spec.education_required and spec.education_level:
            if highest_degree_level(resume.degrees) < spec.education_level:
                failures.append(
                    f"Screening question: '{spec.education_level_name} degree "
                    "or higher?' — no qualifying degree detected on the resume.")
        return failures

    def decide(self, resume: ParsedResume, spec: JobSpec, card: ScoreCard) -> Decision:
        d = Decision(platform=self.name, status=REVIEW)
        d.knockout_failures = self.knockouts(resume, spec)

        if d.knockout_failures and self.auto_reject:
            d.status = REJECT
            d.label = "Auto-disposition: does not meet minimum qualifications"
            d.reasons = d.knockout_failures
            return d

        score = card.composite
        if not self.auto_reject:
            # Greenhouse-style: everything goes to a human; score sets priority
            d.status = REVIEW
            if score >= self.accept_threshold:
                d.label = "High priority for recruiter review"
            elif score >= self.review_threshold:
                d.label = "Standard review queue"
            else:
                d.label = "Low priority in review queue"
            d.reasons.append(f"Composite match score {score:g}/100.")
            if d.knockout_failures:
                d.reasons += [f"Flagged (not auto-rejected): {k}" for k in d.knockout_failures]
            return d

        if score >= self.accept_threshold:
            d.status = ADVANCE
            d.label = "Shortlisted for recruiter screen"
        elif score >= self.review_threshold or not self.score_reject:
            d.status = REVIEW
            d.label = ("Queued for manual recruiter review"
                       if score >= self.review_threshold
                       else "Low match — bottom of the review queue")
        else:
            d.status = REJECT
            d.label = "Below screening threshold"
        d.reasons.append(
            f"Composite match score {score:g}/100 "
            f"(advance ≥ {self.accept_threshold:g}, review ≥ {self.review_threshold:g}).")
        if card.missing_required:
            d.reasons.append(
                f"Missing {len(card.missing_required)} of "
                f"{len(card.missing_required) + len(card.matched_required)} required skills.")
        return d


_BASE_WEIGHTS = {
    "required_skills": 0.35, "preferred_skills": 0.10, "title": 0.15,
    "experience": 0.15, "education": 0.10, "formatting": 0.15,
}

PROFILES: Dict[str, PlatformProfile] = {
    "generic": PlatformProfile(
        key="generic", name="Generic ATS (demo default)",
        weights=_BASE_WEIGHTS, accept_threshold=75, review_threshold=50,
        knockout_min_years=False, knockout_education=False,
        description="Straight weighted composite with accept/review/reject "
                    "thresholds — the model most 'resume checkers' assume.",
    ),
    "workday": PlatformProfile(
        key="workday", name="Workday-style screening (simulated)",
        weights={**_BASE_WEIGHTS, "required_skills": 0.40, "formatting": 0.10},
        accept_threshold=70, review_threshold=45,
        knockout_min_years=True, knockout_education=True, score_reject=False,
        description="Workday itself doesn't keyword-auto-reject; rejection "
                    "happens via employer-configured screening (knockout) "
                    "questions — simulated here from the JD's minimum years "
                    "and required degree.",
    ),
    "greenhouse": PlatformProfile(
        key="greenhouse", name="Greenhouse-style review (simulated)",
        weights=_BASE_WEIGHTS, accept_threshold=75, review_threshold=50,
        auto_reject=False,
        description="Greenhouse is built around structured human review — "
                    "no automatic keyword rejection. Every application lands "
                    "in a queue; the score here only sets review priority.",
    ),
    "taleo": PlatformProfile(
        key="taleo", name="Taleo-style requisition ranking (simulated)",
        weights={**_BASE_WEIGHTS, "required_skills": 0.45, "preferred_skills": 0.15,
                 "title": 0.10, "formatting": 0.05},
        accept_threshold=70, review_threshold=45,
        knockout_min_years=True, knockout_education=True, score_reject=False,
        description="Oracle Taleo lets employers configure knockout questions "
                    "and flags top matches as 'ACE' candidates when they meet "
                    "all required criteria — simulated here.",
    ),
}


def spec_is_empty(spec: JobSpec) -> bool:
    """True when nothing screenable was extracted from the JD — every
    subscore defaults to a vacuous 100 and dispositions mean nothing."""
    return (not spec.required_skills and not spec.preferred_skills
            and not spec.min_years and not spec.education_level)


def decide(platform_key: str, resume: ParsedResume, spec: JobSpec,
           card: ScoreCard) -> Decision:
    profile = PROFILES[platform_key]
    decision = profile.decide(resume, spec, card)
    if spec_is_empty(spec):
        # a contentless requisition must not auto-advance anyone
        if decision.status == ADVANCE:
            decision.status = REVIEW
            decision.label = "Queued for manual recruiter review"
        decision.reasons.append(
            "⚠️ No screenable requirements could be extracted from the job "
            "description — keyword/experience/education subscores are "
            "vacuously perfect and this disposition is not meaningful. "
            "Add a Requirements section or explicit markers (see README).")
    elif profile.key == "taleo" and decision.status == ADVANCE:
        meets_years = not spec.min_years or resume.total_experience_years >= spec.min_years
        if spec.required_skills and not card.missing_required and meets_years:
            decision.label = "ACE candidate (meets all required criteria)"
    decision.notes.append(profile.description)
    return decision
