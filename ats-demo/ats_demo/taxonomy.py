"""Skills taxonomy: canonical skill names, aliases, and matching helpers.

Real ATS keyword search is mostly literal string matching (which is why
resume advice says to mirror the job description's exact wording). This
module is slightly more generous: each canonical skill carries a list of
aliases so "Google Ads" also matches "AdWords". Matching is case-insensitive
and word-boundary aware, so "SEO" does not match "paSEO".
"""

from __future__ import annotations

import re
from typing import Dict, Iterable, List, Set

# canonical name -> aliases (the canonical name itself is always matched too)
SKILL_ALIASES: Dict[str, List[str]] = {
    # --- search & digital marketing ---
    "seo": ["search engine optimization", "search engine optimisation", "organic search"],
    "local seo": ["local search", "google business profile", "gbp optimization", "google my business", "map pack"],
    "ai search optimization": ["aio", "geo", "generative engine optimization", "ai search", "llm visibility", "answer engine optimization", "aeo"],
    "ppc": ["pay-per-click", "pay per click", "paid search", "sem", "search engine marketing", "paid media"],
    "google ads": ["adwords", "google adwords", "google ad words"],
    "meta ads": ["facebook ads", "instagram ads", "meta advertising"],
    "google analytics": ["ga4", "google analytics 4", "universal analytics"],
    "google search console": ["search console", "gsc"],
    "google tag manager": ["gtm", "tag manager"],
    "looker studio": ["data studio", "google data studio"],
    "cro": ["conversion rate optimization", "conversion rate optimisation", "conversion optimization", "a/b testing", "ab testing", "landing page optimization"],
    "content marketing": ["content strategy", "content development", "editorial calendar", "content roadmap"],
    "email marketing": ["email campaigns", "email automation", "marketing automation", "drip campaigns", "klaviyo", "mailchimp", "newsletters"],
    "social media marketing": ["social media", "social channels", "organic social"],
    "keyword research": ["keyword strategy", "search intent analysis"],
    "technical seo": ["site audits", "crawl analysis", "core web vitals", "page speed optimization", "site architecture", "information architecture"],
    "structured data": ["schema.org", "schema markup", "rich snippets", "json-ld"],
    "reputation management": ["review management", "online reviews", "review strategy", "review generation"],
    "web analytics": ["attribution", "attribution modeling", "kpi dashboards", "marketing analytics", "performance reporting"],
    "copywriting": ["ad copy", "marketing copy"],
    "branding": ["brand strategy", "brand development", "brand management"],
    "market research": ["competitive analysis", "competitor analysis", "audience research"],
    "lead generation": ["demand generation", "demand gen", "lead gen", "patient acquisition", "customer acquisition", "donor recruitment"],
    "crm": ["hubspot", "salesforce", "customer relationship management", "zoho"],
    # --- web / technical ---
    "wordpress": ["wp", "elementor"],
    "cms": ["content management system", "content management systems", "webflow", "squarespace", "drupal"],
    "html": [],
    "css": [],
    "javascript": ["js"],
    "python": [],
    "sql": [],
    "excel": ["microsoft excel", "google sheets", "spreadsheets"],
    "ux": ["user experience", "usability"],
    "web design": ["website design", "website redesign", "website redesigns", "site redesign"],
    "accessibility": ["wcag", "ada compliance", "section 508"],
    # --- healthcare domain ---
    "healthcare marketing": ["healthcare digital", "medical marketing", "patient marketing", "clinic marketing", "practice marketing", "healthcare growth"],
    "hipaa": ["hipaa compliance", "hipaa-compliant", "phi"],
    "multi-location marketing": ["multi-location", "multi location", "multisite", "franchise marketing", "location pages"],
    "fertility": ["ivf", "reproductive health", "reproductive care", "rei", "embryology", "andrology", "art cycles", "fertility network"],
    "e-e-a-t": ["eeat", "e-a-t", "ymyl"],
    # --- leadership & business ---
    "team leadership": ["team management", "people management", "direct reports", "coached", "coaching", "mentoring", "led a team", "cross-functional leadership"],
    "budget management": ["budget ownership", "budgeting", "media budget", "spend reporting", "p&l"],
    "project management": ["asana", "trello", "jira", "monday.com", "roadmaps", "project coordination"],
    "vendor management": ["agency management", "vendor relations", "vendor contracts", "partner management"],
    "stakeholder management": ["executive reporting", "executive communication", "stakeholder alignment", "client management", "account management"],
    "strategic planning": ["growth strategy", "marketing strategy", "digital strategy", "go-to-market"],
}

_STOPWORDS: Set[str] = {
    "a", "an", "the", "and", "or", "of", "in", "on", "for", "to", "with",
    "at", "by", "as", "is", "are", "be", "we", "our", "your", "you",
}


def normalize(text: str) -> str:
    """Lowercase and collapse whitespace/punctuation noise for matching."""
    text = text.lower()
    text = text.replace("’", "'").replace("–", "-").replace("—", "-")
    return re.sub(r"\s+", " ", text).strip()


def _term_pattern(term: str) -> re.Pattern:
    """Compile a word-boundary regex for a term (term may contain spaces,
    dots, slashes, ampersands, hyphens). Whitespace/hyphen variations match
    each other: "pay per click" ~ "pay-per-click"."""
    parts = re.split(r"[\s\-]+", normalize(term))
    joined = r"[\s\-]+".join(re.escape(p) for p in parts if p)
    return re.compile(r"(?<![a-z0-9])" + joined + r"(?![a-z0-9])")


_PATTERN_CACHE: Dict[str, re.Pattern] = {}


def term_matches(term: str, text_norm: str) -> bool:
    """True if `term` (or nothing else — aliases are the caller's job)
    appears in already-normalized text."""
    pat = _PATTERN_CACHE.get(term)
    if pat is None:
        pat = _term_pattern(term)
        _PATTERN_CACHE[term] = pat
    return bool(pat.search(text_norm))


def canonicalize(term: str) -> str:
    """Map a free-text skill term to its canonical name if it is a known
    canonical or alias; otherwise return the normalized term itself."""
    t = normalize(term)
    if t in SKILL_ALIASES:
        return t
    for canonical, aliases in SKILL_ALIASES.items():
        if t == canonical or any(t == normalize(a) for a in aliases):
            return canonical
    return t


def skill_found_in(skill: str, text_norm: str) -> bool:
    """True if canonical `skill` or any of its aliases appears in normalized
    text. Unknown skills are matched literally."""
    canonical = canonicalize(skill)
    terms = [canonical] + SKILL_ALIASES.get(canonical, [])
    return any(term_matches(t, text_norm) for t in terms)


def find_all_skills(text: str) -> Set[str]:
    """Return every canonical skill from the taxonomy present in `text`."""
    text_norm = normalize(text)
    found = set()
    for canonical in SKILL_ALIASES:
        if skill_found_in(canonical, text_norm):
            found.add(canonical)
    return found


def tokenize(text: str) -> List[str]:
    """Simple word tokenizer with stopwords removed (used for title matching).
    Trailing punctuation is stripped so "Sr." tokenizes to "sr"."""
    words = re.findall(r"[a-z0-9][a-z0-9&+/.'-]*", normalize(text))
    return [w.rstrip(".'-") or w for w in words if w not in _STOPWORDS]


def display_name(skill: str) -> str:
    """Human-friendly casing for a canonical skill name."""
    special = {
        "seo": "SEO", "ppc": "PPC", "cro": "CRO", "crm": "CRM", "cms": "CMS",
        "ux": "UX", "html": "HTML", "css": "CSS", "sql": "SQL",
        "hipaa": "HIPAA", "e-e-a-t": "E-E-A-T",
        "local seo": "Local SEO", "technical seo": "Technical SEO",
        "ai search optimization": "AI Search Optimization (AIO/GEO)",
    }
    return special.get(skill, skill.title())
