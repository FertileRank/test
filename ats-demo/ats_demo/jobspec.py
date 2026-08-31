"""Job description parsing: turn a JD file into a structured JobSpec.

Two modes, matching how real ATS requisitions get their criteria:

1. Explicit markers (like a recruiter configuring a requisition):
       Title: Digital Marketing Manager
       Required skills: seo, google ads, ga4
       Preferred skills: hipaa, looker studio
       Minimum years: 5
       Education: bachelor required
2. Heuristic extraction from prose — bullets under "Requirements /
   Qualifications" become required skills (taxonomy hits only), bullets
   under "Preferred / Nice to have" become preferred skills.

Explicit markers take precedence over heuristics for the fields they set.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional, Set

from . import taxonomy
from .parser import DEGREE_LEVEL_NAMES

REQUIRED_HEADINGS = re.compile(
    r"^\s*(requirements?|qualifications?|required (?:qualifications|skills|experience)|"
    r"basic qualifications|minimum (?:qualifications|requirements)|"
    r"what you(?:'|’)?ll need|what we(?:'|’)?re looking for|"
    r"what we are looking for|who you are|your (?:qualifications|background)|"
    r"must[- ]haves?)\s*:?\s*$",
    re.IGNORECASE,
)
PREFERRED_HEADINGS = re.compile(
    r"^\s*(preferred(?: qualifications| skills)?|nice[- ]to[- ]haves?|"
    r"bonus(?: points| skills)?|pluses)\s*:?\s*$",
    re.IGNORECASE,
)
OTHER_HEADINGS = re.compile(
    r"^\s*(responsibilities|about (?:us|the role|you|the team|the company)|"
    r"what you(?:'|’)?ll do|benefits|compensation|perks|the role|who we are|"
    r"duties|why (?:join|work)\b.*)\s*:?\s*$",
    re.IGNORECASE,
)

# "5+ years", "5 or more years", and ranges like "3-5 years" (the LOWER
# bound is the advertised minimum). "18 years of age" is not experience.
YEARS_RANGE_RE = re.compile(
    r"(\d{1,2})\s*(?:-|–|—|to)\s*(\d{1,2})\s*\+?\s*years?\b(?!\s+(?:of\s+age|old|or\s+older))",
    re.IGNORECASE,
)
# the \b after years? stops backtracking from matching "year" inside
# "years of age" to dodge the lookahead
YEARS_RE = re.compile(
    r"(\d{1,2})\s*\+?\s*(?:or more\s+)?years?\b(?!\s+(?:of\s+age|old|or\s+older))",
    re.IGNORECASE,
)


def _min_years_from(text: str):
    """Extract the advertised minimum years of experience from prose."""
    candidates = []
    claimed = []
    for m in YEARS_RANGE_RE.finditer(text):
        candidates.append(min(int(m.group(1)), int(m.group(2))))
        claimed.append(m.span())
    for m in YEARS_RE.finditer(text):
        if any(s <= m.start() < e for s, e in claimed):
            continue
        candidates.append(int(m.group(1)))
    return max(candidates) if candidates else None

_DEGREE_WORDS = {
    "associate": 1, "bachelor": 2, "ba": 2, "bs": 2, "master": 3, "mba": 3,
    "ms": 3, "phd": 4, "doctorate": 4, "md": 4,
}


@dataclass
class JobSpec:
    title: str = "Untitled role"
    raw_text: str = ""
    required_skills: List[str] = field(default_factory=list)   # canonical names
    preferred_skills: List[str] = field(default_factory=list)
    min_years: Optional[int] = None
    education_level: int = 0          # 0 none, 1 assoc, 2 bach, 3 masters, 4 doct
    education_required: bool = False  # True => treated as a knockout by strict platforms

    @property
    def education_level_name(self) -> str:
        return DEGREE_LEVEL_NAMES.get(self.education_level, "none detected")


def _skills_from_lines(lines: List[str]) -> Set[str]:
    """Canonical taxonomy skills mentioned anywhere in the given lines."""
    return taxonomy.find_all_skills("\n".join(lines))


def _parse_skill_list(value: str) -> List[str]:
    out = []
    for part in re.split(r"[,;]", value):
        part = part.strip()
        if part:
            out.append(taxonomy.canonicalize(part))
    return out


def _detect_education(text: str) -> tuple:
    """Return (level, required) from prose like "Bachelor's degree required"
    or "MBA preferred". Bare "BA"/"BS"/"MS" abbreviations only count when the
    word "degree" appears in the same sentence (too noisy otherwise).

    Takes RAW text (newlines intact) — each line/sentence is judged on its
    own so "healthcare preferred" in one bullet can't soften a "Bachelor's
    degree required" in another."""
    required_level, preferred_level = 0, 0
    # sentence split that survives "B.S. in Marketing": only a period after
    # 2+ letters ends a sentence
    for sentence in re.split(r"(?<=[A-Za-z]{2})\.|[\n•;]", text):
        sentence = taxonomy.normalize(sentence)
        explicit_words = re.search(
            r"\b(bachelor|master|associate|mba|phd|doctorate)\b|\bm\.d\.",
            sentence)
        abbrev_ok = "degree" in sentence
        # bare "MD" needs degree context — it's also the Maryland abbreviation
        md_ok = "m.d." in sentence or abbrev_ok
        found = [
            lvl for word, lvl in _DEGREE_WORDS.items()
            if re.search(r"\b" + word + r"\b", sentence)
            and (word in ("bachelor", "master", "associate", "mba", "phd",
                          "doctorate")
                 or (word == "md" and md_ok)
                 or abbrev_ok)
        ]
        if "m.d." in sentence:
            found.append(4)
            explicit_words = explicit_words or True
        if not found or (not explicit_words and not abbrev_ok):
            continue
        lvl = max(found)
        is_required = not re.search(
            r"\bpreferred\b|\ba plus\b|\bnice to have\b|\bor equivalent experience\b",
            sentence)
        if is_required:
            required_level = max(required_level, lvl)
        else:
            preferred_level = max(preferred_level, lvl)
    # a genuinely required degree wins for knockout purposes; a
    # preferred-only degree ("MBA a plus") is never a knockout
    if required_level:
        return required_level, True
    return preferred_level, False


def parse_jobspec(text: str) -> JobSpec:
    spec = JobSpec(raw_text=text)
    lines = text.splitlines()

    explicit = {}
    _KEYMAP = {
        "title": "title",
        "required skill": "required skills", "required skills": "required skills",
        "preferred skill": "preferred skills", "preferred skills": "preferred skills",
        "minimum years": "minimum years",
        "education": "education",
    }
    for line in lines:
        m = re.match(r"^\s*(title|required skills?|preferred skills?|minimum years|education)\s*:\s*(.+)$",
                     line, re.IGNORECASE)
        if m:
            explicit[_KEYMAP[m.group(1).lower()]] = m.group(2).strip()

    # title: explicit marker, else first non-empty line
    if "title" in explicit:
        spec.title = explicit["title"]
    else:
        for line in lines:
            if line.strip():
                spec.title = line.strip().rstrip(":").strip("# ")
                break

    # bucket prose lines by heading
    bucket = "other"
    buckets = {"required": [], "preferred": [], "other": []}
    explicit_line = re.compile(
        r"^\s*(title|required skills?|preferred skills?|minimum years|education)\s*:\s*.+$",
        re.IGNORECASE)
    unrecognized_heading = re.compile(r"^\s*[^:•\-*].{0,58}:\s*$")
    for line in lines:
        if explicit_line.match(line):
            # explicit marker lines are handled above; letting them fall into
            # a prose bucket would e.g. turn "Preferred skills: hipaa" into a
            # *required* HIPAA under a Requirements heading
            continue
        if REQUIRED_HEADINGS.match(line):
            bucket = "required"
            continue
        if PREFERRED_HEADINGS.match(line):
            bucket = "preferred"
            continue
        if OTHER_HEADINGS.match(line):
            bucket = "other"
            continue
        stripped = line.strip()
        if (unrecognized_heading.match(line)
                or (stripped and stripped.isupper() and len(stripped) <= 60)):
            # any other heading ends the current requirements/preferred
            # section — company boilerplate must not leak into criteria
            bucket = "other"
            continue
        buckets[bucket].append(line)

    if "required skills" in explicit:
        spec.required_skills = _parse_skill_list(explicit["required skills"])
    else:
        spec.required_skills = sorted(_skills_from_lines(buckets["required"]))
    if "preferred skills" in explicit:
        spec.preferred_skills = _parse_skill_list(explicit["preferred skills"])
    else:
        spec.preferred_skills = sorted(
            _skills_from_lines(buckets["preferred"]) - set(spec.required_skills)
        )
    # a skill can't be both; required wins
    spec.preferred_skills = [s for s in spec.preferred_skills
                             if s not in set(spec.required_skills)]

    if "minimum years" in explicit:
        m = re.search(r"\d{1,2}", explicit["minimum years"])
        spec.min_years = int(m.group(0)) if m else None
    else:
        spec.min_years = _min_years_from("\n".join(buckets["required"]))

    if "education" in explicit:
        # the Education: field is about degrees by definition, so bare
        # abbreviations ("MD", "BS") get the degree context they need
        level, required = _detect_education(explicit["education"] + " degree")
        spec.education_level, spec.education_required = level, required
    else:
        level, required = _detect_education("\n".join(buckets["required"]))
        if level == 0:
            # a degree mentioned only under "Preferred qualifications" is a
            # preference by construction, whatever the sentence wording
            pref_level, _ = _detect_education("\n".join(buckets["preferred"]))
            level, required = pref_level, False
        spec.education_level, spec.education_required = level, required

    return spec


def load_jobspec(path: str) -> JobSpec:
    with open(path, "r", encoding="utf-8") as fh:
        return parse_jobspec(fh.read())
