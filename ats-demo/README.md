# ats-demo — a demo Applicant Tracking System

A self-contained, stdlib-only Python demo that simulates how resumes are
processed in real-world hiring workflows:

1. **Parse** — extracts contact info, sections, job titles, employment dates,
   degrees, certifications, and skills from `.txt`, `.md`, or `.docx` resumes
   (a `.docx` is unzipped and read as XML — no dependencies needed).
2. **Score** — compares the resume to a job description across the criteria
   ATS-era screening actually uses: required/preferred keyword coverage,
   job-title alignment, years of experience, education, and parseability.
3. **Disposition** — applies accept / review / reject thresholds and knockout
   rules per platform profile (Workday-, Greenhouse-, and Taleo-style, plus a
   generic default), mirroring each platform's real screening *style*.
4. **Explain** — produces a full report: overall match score, sub-scores,
   keyword-by-keyword table, what the parser extracted, flagged issues with
   severity, and a prioritized fix list.

## Quick start

```bash
cd ats-demo

# score one resume against a job description (all platform profiles)
python3 -m ats_demo score \
  --resume samples/resumes/strong_candidate.txt \
  --job samples/jobs/digital_marketing_manager_healthcare.txt

# machine-readable output, one platform only
python3 -m ats_demo score --resume samples/resumes/weak_candidate.txt \
  --job samples/jobs/seo_manager.txt --platform workday --format json

# rank a stack of resumes for one requisition
python3 -m ats_demo rank \
  --job samples/jobs/digital_marketing_manager_healthcare.txt \
  --resumes samples/resumes/*.txt

# run the tests (stdlib unittest, no dependencies)
python3 -m unittest discover -s tests -v
```

Useful flags: `--out report.md` writes the report to a file; `--as-of
2026-08-30` pins the reference date used for "Present" so runs are
reproducible.

## Writing job descriptions

Plain text. The parser understands ordinary prose postings — bullets under a
`Requirements:`/`Qualifications:` heading become **required** skills (matched
against the taxonomy in `ats_demo/taxonomy.py`), bullets under
`Preferred:`/`Nice to have:` become **preferred**, `N+ years` sets the
experience bar, and `Bachelor's degree required` sets an education knockout.
You can also pin any field explicitly:

```
Title: Digital Marketing Manager
Required skills: seo, google ads, ga4, cro
Preferred skills: hipaa, looker studio
Minimum years: 5
Education: bachelor required
```

## Platform profiles (and what real ATSs actually do)

A widely repeated myth says "75% of resumes are auto-rejected by ATS
keyword filters before a human sees them." That is not how mainstream
platforms work, and this demo is honest about it:

| Profile | Simulates | Auto-reject behavior |
|---|---|---|
| `generic` | The straight keyword-score screener most "resume checkers" assume | Reject below 50, advance at 75+ |
| `workday` | Workday-style screening | **Only knockout questions reject** (min years, required degree), as employers configure in real Workday; a low keyword score just sinks you to the bottom of the review queue |
| `greenhouse` | Greenhouse-style structured review | **Never auto-rejects** — every application is queued for human review; the score only sets priority |
| `taleo` | Oracle Taleo requisition ranking | Knockout questions reject; low scores only rank you lower; candidates meeting all required criteria get the **ACE** flag |

What all real platforms *do* automate: parsing your resume into a structured
profile, keyword search, and ranking. If the parser can't read your dates,
titles, or skills — because of tables, graphics, text boxes, headers/footers,
or creative section names — you effectively disappear from recruiter
searches even though nobody "rejected" you. That's why this demo scores
**parseability** alongside keywords.

## Report contents

- Overall match score (0–100) and per-platform disposition with reasons
- Sub-score table with the active weights
- Keyword table: every required/preferred skill, whether it was found, and
  whether it appears in the experience section (context matters to
  recruiters) — matching is alias-aware ("Google Ads" ≈ "AdWords") and
  word-boundary safe ("SEO" ≠ "paseo")
- A "what the parser extracted" snapshot — the single most useful debugging
  view, because it shows your resume the way the machine sees it
- Findings by severity (🔴 critical / 🟠 warning / 🔵 info) with a concrete
  fix for each, and a prioritized action list

## Layout

```
ats_demo/
  parser.py     text extraction (.txt/.md/.docx), sections, dates, contact,
                degrees, formatting checks
  taxonomy.py   canonical skills + aliases, word-boundary matching
  jobspec.py    job description -> structured JobSpec
  scoring.py    sub-scores + weighted composite
  platforms.py  platform profiles, thresholds, knockouts, dispositions
  feedback.py   findings & recommendations
  report.py     Markdown / JSON rendering
  cli.py        `score` and `rank` commands
samples/        three job descriptions, three resumes (strong/mid/weak)
tests/          unittest suite (parser, scoring, platforms, end-to-end)
```

## Limitations

- PDF parsing is deliberately unsupported (stdlib-only); export to `.docx`
  or text. Real-world tip: simple text-based files parse best everywhere.
- The skills taxonomy is a demo-sized dictionary (~60 canonical skills,
  digital-marketing-heavy). Real platforms license far larger ontologies.
- Semantic matching is intentionally shallow (aliases, not embeddings) —
  which mirrors the literal keyword behavior candidates actually face.
- This is an educational simulation, not hiring software. Do not use it to
  make real employment decisions.
