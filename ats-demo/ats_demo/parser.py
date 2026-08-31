"""Resume parsing: text extraction, section detection, contact info, dates,
experience math, education detection, and parseability/formatting checks.

Supports .txt / .md natively and .docx via the standard library (a .docx is
a zip of XML). PDFs are intentionally unsupported (stdlib-only demo) — the
error message tells the user to export to .docx or paste text, which is also
honest advice for real ATSs: text-based .docx and simple PDFs parse best.
"""

from __future__ import annotations

import re
import zipfile
from dataclasses import dataclass, field
from datetime import date
from typing import Dict, List, Optional, Set, Tuple
from xml.etree import ElementTree

from . import taxonomy

WORD_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


# ---------------------------------------------------------------------------
# data model
# ---------------------------------------------------------------------------

@dataclass
class Contact:
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None


@dataclass
class DateRange:
    start: Tuple[int, int]          # (year, month)
    end: Optional[Tuple[int, int]]  # None => present
    raw: str = ""


@dataclass
class FormatIssue:
    severity: str        # "critical" | "warning" | "info"
    code: str
    message: str
    recommendation: str


@dataclass
class ParsedResume:
    source: str
    raw_text: str
    lines: List[str] = field(default_factory=list)
    word_count: int = 0
    contact: Contact = field(default_factory=Contact)
    sections: Dict[str, str] = field(default_factory=dict)       # canonical -> text
    section_headings: Dict[str, str] = field(default_factory=dict)  # canonical -> heading as written
    nonstandard_headings: List[str] = field(default_factory=list)
    date_ranges: List[DateRange] = field(default_factory=list)
    total_experience_years: float = 0.0
    employment_gaps: List[str] = field(default_factory=list)
    titles: List[str] = field(default_factory=list)
    degrees: List[str] = field(default_factory=list)
    has_certifications: bool = False
    skills_found: Set[str] = field(default_factory=set)
    skills_in_experience: Set[str] = field(default_factory=set)
    format_issues: List[FormatIssue] = field(default_factory=list)

    @property
    def text_norm(self) -> str:
        return taxonomy.normalize(self.raw_text)


# ---------------------------------------------------------------------------
# text extraction
# ---------------------------------------------------------------------------

def extract_text(path: str) -> Tuple[str, List[FormatIssue]]:
    """Return (plain_text, extraction_issues) for a resume file."""
    lower = path.lower()
    if lower.endswith(".docx"):
        return _extract_docx(path)
    if lower.endswith((".txt", ".md")):
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            return fh.read(), []
    if lower.endswith(".pdf"):
        raise ValueError(
            "PDF parsing is not supported by this stdlib-only demo. "
            "Export the resume to .docx or plain text. (Tip for real ATSs: "
            "a simple text-based .docx or PDF parses far more reliably than "
            "a designed/graphical PDF.)"
        )
    raise ValueError(f"Unsupported resume format: {path} (use .txt, .md, or .docx)")


def _docx_part_text(xml_bytes: bytes) -> str:
    """Flatten one WordprocessingML part to plain text, one paragraph per line."""
    root = ElementTree.fromstring(xml_bytes)
    # paragraphs nested inside another paragraph (text boxes) are already
    # captured by their outer paragraph's iter(); visiting them again would
    # duplicate the text
    nested = set()
    for para in root.iter(f"{WORD_NS}p"):
        if id(para) in nested:
            continue
        for inner in para.iter(f"{WORD_NS}p"):
            if inner is not para:
                nested.add(id(inner))
    lines = []
    for para in root.iter(f"{WORD_NS}p"):
        if id(para) in nested:
            continue
        parts = []
        for node in para.iter():
            if node.tag == f"{WORD_NS}t":
                parts.append(node.text or "")
            elif node.tag in (f"{WORD_NS}tab",):
                parts.append("\t")
            elif node.tag in (f"{WORD_NS}br", f"{WORD_NS}cr"):
                parts.append("\n")
        # a numbered/bulleted paragraph: mark it so bullet checks work
        if para.find(f"{WORD_NS}pPr/{WORD_NS}numPr") is not None:
            lines.append("- " + "".join(parts))
        else:
            lines.append("".join(parts))
    return "\n".join(lines)


def _extract_docx(path: str) -> Tuple[str, List[FormatIssue]]:
    issues: List[FormatIssue] = []
    try:
        zf_ctx = zipfile.ZipFile(path)
    except zipfile.BadZipFile as exc:
        raise ValueError(
            f"{path} is not a readable .docx (corrupt file, or another "
            f"format renamed to .docx): {exc}") from exc
    with zf_ctx as zf:
        names = zf.namelist()
        if "word/document.xml" not in names:
            raise ValueError(f"{path} is not a valid .docx (no word/document.xml)")
        body_xml = zf.read("word/document.xml")
        text = _docx_part_text(body_xml)

        if b"<w:tbl>" in body_xml:
            issues.append(FormatIssue(
                "warning", "docx-table",
                "Resume uses table layout inside the .docx.",
                "Many ATS parsers read tables out of order or drop cells. "
                "Use a single-column layout with plain paragraphs.",
            ))
        if b"<w:drawing>" in body_xml or b"<w:pict>" in body_xml:
            issues.append(FormatIssue(
                "warning", "docx-graphics",
                "Resume contains images or graphics.",
                "ATS parsers cannot read text inside images (logos, skill "
                "charts, photos). Keep all information as real text.",
            ))
        if b"txbxContent" in body_xml:
            issues.append(FormatIssue(
                "warning", "docx-textbox",
                "Resume places text inside text boxes.",
                "Text boxes are frequently skipped by ATS parsers. Move the "
                "content into the normal document body.",
            ))

        # Contact details that live only in the page header/footer are lost
        # by many parsers, so check those parts separately.
        hf_text = ""
        for name in names:
            if re.match(r"word/(header|footer)\d*\.xml$", name):
                hf_text += _docx_part_text(zf.read(name)) + "\n"
        if hf_text:
            body_contact = _find_contact_fragments(text)
            hf_contact = _find_contact_fragments(hf_text)
            only_in_hf = hf_contact - body_contact
            if only_in_hf:
                issues.append(FormatIssue(
                    "warning", "contact-in-header",
                    "Contact details appear only in the page header/footer: "
                    + ", ".join(sorted(only_in_hf)) + ".",
                    "Many ATS parsers ignore Word headers/footers. Repeat "
                    "contact info in the document body, at the top.",
                ))
            # header/footer text still gets appended so nothing is silently lost
            text = text + "\n" + hf_text
    return text, issues


EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
# separators optional so "(512)555-0100" and bare "5125550100" match; digit
# lookarounds keep it from biting a longer number
PHONE_RE = re.compile(
    r"(?<![\d.])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?![\d.])")
LINKEDIN_RE = re.compile(r"linkedin\.com/in/[A-Za-z0-9\-_%]+", re.IGNORECASE)


def _find_contact_fragments(text: str) -> Set[str]:
    found = set()
    if EMAIL_RE.search(text):
        found.add("email")
    if PHONE_RE.search(text):
        found.add("phone")
    if LINKEDIN_RE.search(text):
        found.add("linkedin")
    return found


# ---------------------------------------------------------------------------
# section detection
# ---------------------------------------------------------------------------

# Exact (standard) headings an ATS reliably recognizes.
STANDARD_HEADINGS: Dict[str, Set[str]] = {
    "summary": {"summary", "professional summary", "profile", "objective",
                "career summary", "about", "about me"},
    "experience": {"experience", "work experience", "professional experience",
                   "employment", "employment history", "work history",
                   "career history", "relevant experience"},
    "education": {"education", "education & training", "academic background",
                  "education and training"},
    "skills": {"skills", "technical skills", "core competencies", "key skills",
               "areas of expertise", "core skills", "skills & tools"},
    "certifications": {"certifications", "certificates", "licenses",
                       "licenses & certifications", "credentials"},
    "projects": {"projects", "selected projects", "key projects"},
    "awards": {"awards", "honors", "awards & honors"},
    "publications": {"publications"},
    "volunteer": {"volunteer experience", "volunteering", "community involvement"},
}

# Keyword -> section fallback for nonstandard headings ("Leadership Profile",
# "Where I've Made an Impact", ...). Order matters: first hit wins — summary
# words come first so "Career Objective" files as a summary, not experience.
_FUZZY_KEYWORDS: List[Tuple[str, str]] = [
    ("objective", "summary"),
    ("summary", "summary"),
    ("profile", "summary"),
    ("experience", "experience"),
    ("employment", "experience"),
    ("career", "experience"),
    ("education", "education"),
    ("skills", "skills"),
    ("competencies", "skills"),
    ("capabilities", "skills"),
    ("expertise", "skills"),
    ("certification", "certifications"),
    ("credentials", "certifications"),
]


# words a Title-Case section heading plausibly starts with (see match_heading)
_SECTION_LEAD_WORDS = {
    "skills", "career", "professional", "work", "education", "employment",
    "summary", "objective", "profile", "core", "key", "areas", "technical",
    "certifications", "certificates", "credentials", "capabilities",
    "expertise", "licenses", "relevant", "selected", "leadership",
}


def _clean_heading(line: str) -> str:
    """Strip markdown/bold/colon decoration from a candidate heading line."""
    s = line.strip()
    s = re.sub(r"^#+\s*", "", s)
    s = s.strip("*_ \t")
    s = s.rstrip(":").strip()
    return s


def _looks_like_heading(line: str) -> bool:
    s = _clean_heading(line)
    if not s or len(s) > 60:
        return False
    if EMAIL_RE.search(s) or PHONE_RE.search(s):
        return False
    words = s.split()
    if len(words) > 7:
        return False
    # headings don't end mid-sentence ("Skills, Tools & Technologies" is
    # fine, but a line ending in ./; is prose)
    if re.search(r"[.;]$", s):
        return False
    return True


def match_heading(line: str) -> Tuple[Optional[str], bool]:
    """Return (canonical_section, is_standard). (None, False) if not a heading."""
    if not _looks_like_heading(line):
        return None, False
    cleaned = taxonomy.normalize(_clean_heading(line)).replace(" and ", " & ")
    for section, variants in STANDARD_HEADINGS.items():
        normalized_variants = {v.replace(" and ", " & ") for v in variants}
        if cleaned in normalized_variants:
            return section, True
    # only treat as a fuzzy heading if it is visually a heading (short,
    # ALL-CAPS, markdown/bold-marked, or Title Case *starting with a section
    # word* — the lead-word gate keeps company lines like "Acme Education
    # Partners" from being misread as headings)
    raw = _clean_heading(line)
    alpha_words = [w for w in raw.split() if w[:1].isalpha()]
    lead_ok = (bool(alpha_words)
               and alpha_words[0].lower().rstrip(",:") in _SECTION_LEAD_WORDS)
    titlecased = (bool(alpha_words) and len(alpha_words) <= 6
                  and all(w[:1].isupper() for w in alpha_words) and lead_ok)
    is_shouty = (raw.isupper() or titlecased
                 or (line.strip().startswith(("#", "**")) and len(raw.split()) <= 6))
    if is_shouty:
        for keyword, section in _FUZZY_KEYWORDS:
            if re.search(r"\b" + keyword, cleaned):
                return section, False
    return None, False


def split_sections(lines: List[str]) -> Tuple[Dict[str, str], Dict[str, str], List[str]]:
    """Split resume lines into canonical sections.

    Returns (sections, headings_as_written, nonstandard_headings).
    Text before the first recognized heading goes into "_header" (name +
    contact block).
    """
    sections: Dict[str, List[str]] = {"_header": []}
    headings: Dict[str, str] = {}
    nonstandard: List[str] = []
    current = "_header"
    for line in lines:
        section, is_standard = match_heading(line)
        if section:
            heading_text = _clean_heading(line)
            if not is_standard:
                nonstandard.append(heading_text)
            # first heading for a section wins; later ones append to the same bucket
            headings.setdefault(section, heading_text)
            current = section
            sections.setdefault(current, [])
            continue
        sections.setdefault(current, []).append(line)
    return ({k: "\n".join(v).strip() for k, v in sections.items()}, headings, nonstandard)


# ---------------------------------------------------------------------------
# dates & experience math
# ---------------------------------------------------------------------------

_MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}
_MONTH_RE = r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?"
_PRESENT_RE = r"(?:present|current|now|ongoing|today|to[\s-]date|date)"
_SEP_RE = r"\s*(?:-|–|—|to|through|until)\s*"
# "Jan 2020 - Mar 2022", "2018 - Present", "05/2019 - 08/2024", "Jan 2015 to date"
RANGE_RE = re.compile(
    rf"(?:(?P<m1>{_MONTH_RE})\s+|(?P<n1>\d{{1,2}})\s*/\s*)?(?P<y1>(?:19|20)\d\d)"
    rf"{_SEP_RE}"
    rf"(?:(?:(?P<m2>{_MONTH_RE})\s+|(?P<n2>\d{{1,2}})\s*/\s*)?(?P<y2>(?:19|20)\d\d)"
    rf"|(?P<present>{_PRESENT_RE}))",
    re.IGNORECASE,
)
# internship style: "May - August 2021" (both months share one year)
MONTH_SPAN_RE = re.compile(
    rf"(?P<m1>{_MONTH_RE}){_SEP_RE}(?P<m2>{_MONTH_RE})\s+(?P<y>(?:19|20)\d\d)",
    re.IGNORECASE,
)


def _month_num(token: Optional[str], default: int) -> int:
    if not token:
        return default
    token = token.lower().rstrip(".")
    if token.isdigit():
        n = int(token)
        return n if 1 <= n <= 12 else default
    return _MONTHS.get(token[:3], default)


def find_date_ranges(text: str) -> List[DateRange]:
    ranges = []
    claimed = []
    for m in RANGE_RE.finditer(text):
        start = (int(m.group("y1")), _month_num(m.group("m1") or m.group("n1"), 1))
        if m.group("present"):
            end: Optional[Tuple[int, int]] = None
        else:
            end = (int(m.group("y2")), _month_num(m.group("m2") or m.group("n2"), 12))
        # skip garbage like "2026 - 2018" (reversed) but keep it visible
        if end is not None and end < start:
            continue
        ranges.append(DateRange(start=start, end=end, raw=m.group(0)))
        claimed.append(m.span())
    for m in MONTH_SPAN_RE.finditer(text):
        # skip text already claimed by a full range match ("Jan 2020 - Mar 2022"
        # must not also parse as a month-month span)
        if any(s <= m.start() < e or s < m.end() <= e for s, e in claimed):
            continue
        year = int(m.group("y"))
        start = (year, _month_num(m.group("m1"), 1))
        end = (year, _month_num(m.group("m2"), 12))
        if end >= start:
            ranges.append(DateRange(start=start, end=end, raw=m.group(0)))
    return ranges


def _to_months(ym: Tuple[int, int]) -> int:
    return ym[0] * 12 + (ym[1] - 1)


def merge_ranges(ranges: List[DateRange], as_of: date) -> List[Tuple[int, int]]:
    """Merge overlapping ranges into disjoint (start_month, end_month) spans."""
    now = (as_of.year, as_of.month)
    spans = sorted(
        (_to_months(r.start), _to_months(r.end if r.end is not None else now) + 1)
        for r in ranges
    )
    merged: List[Tuple[int, int]] = []
    for s, e in spans:
        if e <= s:
            # an open-ended range starting after as_of would otherwise
            # contribute negative months
            continue
        if merged and s <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    return merged


def total_years(ranges: List[DateRange], as_of: date) -> float:
    months = sum(e - s for s, e in merge_ranges(ranges, as_of))
    return round(months / 12.0, 1)


def find_gaps(ranges: List[DateRange], as_of: date, min_gap_months: int = 6) -> List[str]:
    merged = merge_ranges(ranges, as_of)
    gaps = []
    for (s1, e1), (s2, e2) in zip(merged, merged[1:]):
        gap = s2 - e1
        if gap >= min_gap_months:
            fmt = lambda m: f"{m // 12}-{m % 12 + 1:02d}"
            gaps.append(f"{gap} month gap between {fmt(e1 - 1)} and {fmt(s2)}")
    return gaps


# ---------------------------------------------------------------------------
# titles & education
# ---------------------------------------------------------------------------

TITLE_WORDS = {
    "manager", "director", "specialist", "consultant", "coordinator", "lead",
    "head", "founder", "owner", "analyst", "engineer", "developer", "designer",
    "strategist", "supervisor", "officer", "president", "vp", "principal",
    "executive", "administrator", "associate", "assistant", "intern",
    "architect", "scientist",
}


def find_titles(experience_text: str) -> List[str]:
    """Heuristic: short experience-section lines containing a job-title word
    and no bullet marker are treated as job titles. A date range on the same
    line ("Marketing Manager | Acme | Jan 2019 - Present") is stripped, not
    disqualifying — that single-line layout is extremely common."""
    titles = []
    for line in experience_text.splitlines():
        s = _clean_heading(line)
        if not s or len(s) > 120 or line.strip().startswith(("-", "•", "*")):
            continue
        # drop any date range then trailing separators/empty segments
        s = RANGE_RE.sub("", s)
        s = MONTH_SPAN_RE.sub("", s)
        s = re.sub(r"[\s|,;–—-]+$", "", s).strip()
        if not s or len(s) > 90:
            continue
        words = set(taxonomy.tokenize(s))
        if words & TITLE_WORDS:
            titles.append(s)
    return titles


DEGREE_PATTERNS: List[Tuple[str, int]] = [
    # (regex, level) — higher level = more advanced. Bare two-letter
    # abbreviations ("BA", "MS") only count with dots or followed by
    # "in"/"degree", otherwise prose like "BA stakeholders" false-positives.
    (r"\bph\.?\s?d\b|\bdoctorate\b|\bdoctoral\b|\bm\.d\.|\bj\.d\.", 4),
    # bare "MA in ..."/"BS in ..." needs a subject word after "in" — a year
    # there means it's a state abbreviation ("Boston, MA in 2019")
    (r"\bmaster(?:'s|s)?\s+(?:of|degree|in)\b|\bmaster's\b|\bmba\b"
     r"|\bm\.s\.|\bm\.a\.|\bm\.ed\b"
     r"|\b(?:ms|ma)\s+(?:degree\b|in\s+(?!(?:19|20)\d\d)[a-z])", 3),
    (r"\bbachelor(?:'s|s)?\b|\bb\.s\.|\bb\.a\.|\bbba\b|\bbfa\b"
     r"|\b(?:bs|ba)\s+(?:degree\b|in\s+(?!(?:19|20)\d\d)[a-z])", 2),
    # "Associate of the Year" is an award, not a degree
    (r"\bassociate(?:'s|s)?\s+(?:degree\b|in\s+(?!(?:19|20)\d\d)[a-z]"
     r"|of\s+(?:applied\s+)?(?:arts|science|business|nursing))"
     r"|\ba\.a\.s?\b|\b(?:aa|aas)\s+(?:in|degree)\b", 1),
]

DEGREE_LEVEL_NAMES = {0: "none detected", 1: "associate", 2: "bachelor", 3: "master", 4: "doctorate"}


def find_degrees(text: str) -> List[str]:
    """Return degree level names found (highest first)."""
    norm = taxonomy.normalize(text)
    levels = sorted(
        {level for pattern, level in DEGREE_PATTERNS if re.search(pattern, norm)},
        reverse=True,
    )
    return [DEGREE_LEVEL_NAMES[l] for l in levels]


def highest_degree_level(degrees: List[str]) -> int:
    name_to_level = {v: k for k, v in DEGREE_LEVEL_NAMES.items()}
    return max((name_to_level.get(d, 0) for d in degrees), default=0)


# ---------------------------------------------------------------------------
# main entry point
# ---------------------------------------------------------------------------

def parse_resume(path: Optional[str] = None, text: Optional[str] = None,
                 as_of: Optional[date] = None) -> ParsedResume:
    """Parse a resume from a file path or a raw text string."""
    if (path is None) == (text is None):
        raise ValueError("Provide exactly one of `path` or `text`.")
    issues: List[FormatIssue] = []
    if path is not None:
        text, issues = extract_text(path)
        source = path
    else:
        source = "<text>"
    assert text is not None
    as_of = as_of or date.today()

    lines = text.splitlines()
    parsed = ParsedResume(source=source, raw_text=text, lines=lines,
                          word_count=len(text.split()), format_issues=issues)

    # contact
    m = EMAIL_RE.search(text)
    parsed.contact.email = m.group(0) if m else None
    m = PHONE_RE.search(text)
    parsed.contact.phone = m.group(0) if m else None
    m = LINKEDIN_RE.search(text)
    parsed.contact.linkedin = m.group(0) if m else None
    for line in lines:
        s = _clean_heading(line)
        if s:
            # first non-empty line is almost always the candidate's name
            parsed.contact.name = s if len(s) <= 60 else None
            break

    # sections
    parsed.sections, parsed.section_headings, parsed.nonstandard_headings = split_sections(lines)

    # experience math — restrict to experience-ish sections when available so
    # certification years ("17 certifications (2025-2026)") don't count as jobs
    exp_text = parsed.sections.get("experience", "")
    date_source = exp_text if exp_text else text
    parsed.date_ranges = find_date_ranges(date_source)
    parsed.total_experience_years = total_years(parsed.date_ranges, as_of)
    parsed.employment_gaps = find_gaps(parsed.date_ranges, as_of)
    parsed.titles = find_titles(exp_text) if exp_text else find_titles(text)

    # education & certifications
    edu_text = parsed.sections.get("education", "")
    parsed.degrees = find_degrees(edu_text if edu_text else text)
    cert_text = parsed.sections.get("certifications", "") or text
    parsed.has_certifications = bool(re.search(r"\bcertif|credential", taxonomy.normalize(cert_text)))

    # skills
    parsed.skills_found = taxonomy.find_all_skills(text)
    if exp_text:
        parsed.skills_in_experience = taxonomy.find_all_skills(exp_text)

    _check_formatting(parsed)
    return parsed


def _check_formatting(parsed: ParsedResume) -> None:
    """Populate parseability/formatting findings on the parsed resume."""
    issues = parsed.format_issues

    contact = parsed.contact
    missing_contact = [label for label, value in
                       [("email", contact.email), ("phone", contact.phone)] if not value]
    if missing_contact:
        issues.append(FormatIssue(
            "critical", "missing-contact",
            "No " + " or ".join(missing_contact) + " detected in the resume text.",
            "Put an email address and phone number in plain text near the top "
            "of the document body (not in an image or Word header).",
        ))
    if not contact.linkedin:
        issues.append(FormatIssue(
            "info", "no-linkedin",
            "No LinkedIn URL detected.",
            "Recruiters routinely cross-check LinkedIn; include the full URL.",
        ))

    for section in ("experience", "education", "skills"):
        if section not in parsed.sections or not parsed.sections.get(section):
            sev = "critical" if section in ("experience", "education") else "warning"
            issues.append(FormatIssue(
                sev, f"missing-{section}",
                f"No {section} section was detected.",
                f"Add a clearly labeled \"{section.title()}\" section — ATS "
                "parsers map content into fields by these standard headings.",
            ))

    if parsed.nonstandard_headings:
        issues.append(FormatIssue(
            "warning", "nonstandard-headings",
            "Nonstandard section headings: "
            + "; ".join(f'"{h}"' for h in parsed.nonstandard_headings) + ".",
            'Use conventional headings ("Professional Experience", "Skills", '
            '"Education", "Certifications"). Parsers key on the standard names; '
            "creative headings risk content being dropped or mis-filed.",
        ))

    empty_bullets = sum(1 for line in parsed.lines if line.strip() in {"-", "•", "*", "·"})
    if empty_bullets:
        issues.append(FormatIssue(
            "warning", "empty-bullets",
            f"{empty_bullets} empty bullet point(s) found.",
            "Delete stray empty bullets — they read as unfinished editing to "
            "both parsers and humans.",
        ))

    if parsed.sections.get("experience") and not parsed.date_ranges:
        issues.append(FormatIssue(
            "critical", "no-dates",
            "No parseable employment dates found in the experience section.",
            'Use a standard date format next to each role, e.g. '
            '"Jan 2020 – Mar 2023" or "2020 – Present".',
        ))

    if parsed.word_count > 1600:
        issues.append(FormatIssue(
            "info", "length",
            f"Resume is long ({parsed.word_count} words, likely 3+ pages).",
            "Aim for 1–2 pages (roughly 400–800 words per page); keep the "
            "last 10–15 years of relevant experience.",
        ))

    bullets = [l for l in parsed.lines if l.strip().startswith(("-", "•", "*"))]
    if bullets:
        quantified = sum(1 for b in bullets if re.search(r"\d", b))
        if quantified / len(bullets) < 0.25:
            issues.append(FormatIssue(
                "info", "few-metrics",
                f"Only {quantified} of {len(bullets)} bullet points contain a "
                "number.",
                "Quantify impact (%, $, counts, time saved) — ranked shortlists "
                "and recruiters favor measurable results.",
            ))
