"""Command-line interface.

    python -m ats_demo score --resume resume.docx --job jd.txt [options]
    python -m ats_demo rank  --job jd.txt --resumes a.txt b.docx c.md

Options for `score`:
    --platform {generic,workday,greenhouse,taleo,all}   (default: all)
    --format {md,json}                                  (default: md)
    --out FILE                                          (default: stdout)
    --as-of YYYY-MM-DD   reference date for "Present" (default: today)
"""

from __future__ import annotations

import argparse
import sys
from datetime import date, datetime

from . import feedback, platforms, report
from .jobspec import load_jobspec
from .parser import parse_resume
from .scoring import score_resume


def _parse_as_of(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def _score_one(resume_path: str, spec, platform_keys, as_of: date):
    resume = parse_resume(path=resume_path, as_of=as_of)
    # each platform can weight differently; the report's headline composite
    # uses the first requested platform's weights
    first_profile = platforms.PROFILES[platform_keys[0]]
    card = score_resume(resume, spec, first_profile.weights)
    decisions = []
    for key in platform_keys:
        profile = platforms.PROFILES[key]
        platform_card = (card if profile.weights == first_profile.weights
                         else score_resume(resume, spec, profile.weights))
        decisions.append(platforms.decide(key, resume, spec, platform_card))
    findings = feedback.build_findings(resume, spec, card)
    return resume, card, decisions, findings


def cmd_score(args) -> int:
    spec = load_jobspec(args.job)
    platform_keys = (list(platforms.PROFILES) if args.platform == "all"
                     else [args.platform])
    resume, card, decisions, findings = _score_one(
        args.resume, spec, platform_keys, args.as_of)
    if args.format == "json":
        text = report.render_json(resume, spec, card, decisions, findings)
    else:
        text = report.render_markdown(resume, spec, card, decisions, findings)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(text + "\n")
        print(f"Report written to {args.out}")
    else:
        print(text)
    return 0


def cmd_rank(args) -> int:
    spec = load_jobspec(args.job)
    profile = platforms.PROFILES[args.platform if args.platform != "all" else "generic"]
    rows = []
    for path in args.resumes:
        try:
            resume = parse_resume(path=path, as_of=args.as_of)
        except (ValueError, OSError) as exc:
            # one unreadable resume (bad format, missing file, corrupt docx)
            # must not abort the whole ranking
            print(f"skipping {path}: {exc}", file=sys.stderr)
            continue
        card = score_resume(resume, spec, profile.weights)
        decision = platforms.decide(profile.key, resume, spec, card)
        rows.append({
            "name": resume.contact.name or path,
            "source": path,
            "composite": card.composite,
            "status": decision.status,
            "missing_required": [m.display for m in card.keyword_matches
                                 if m.required and not m.found],
        })
    rows.sort(key=lambda r: r["composite"], reverse=True)
    text = report.render_ranking(spec.title, rows)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(text + "\n")
        print(f"Ranking written to {args.out}")
    else:
        print(text)
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="ats_demo",
        description="Demo ATS: parse, score, rank, and disposition resumes "
                    "against a job description.")
    sub = p.add_subparsers(dest="command", required=True)

    platform_choices = list(platforms.PROFILES) + ["all"]

    ps = sub.add_parser("score", help="score one resume against a job description")
    ps.add_argument("--resume", required=True, help=".txt, .md, or .docx resume")
    ps.add_argument("--job", required=True, help="job description text file")
    ps.add_argument("--platform", choices=platform_choices, default="all")
    ps.add_argument("--format", choices=["md", "json"], default="md")
    ps.add_argument("--out", help="write the report to this file")
    ps.add_argument("--as-of", type=_parse_as_of, default=date.today(),
                    help="reference date for 'Present' (YYYY-MM-DD)")
    ps.set_defaults(func=cmd_score)

    pr = sub.add_parser("rank", help="rank multiple resumes for one job")
    pr.add_argument("--job", required=True)
    pr.add_argument("--resumes", required=True, nargs="+")
    pr.add_argument("--platform", choices=platform_choices, default="generic")
    pr.add_argument("--out")
    pr.add_argument("--as-of", type=_parse_as_of, default=date.today())
    pr.set_defaults(func=cmd_rank)
    return p


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except (ValueError, FileNotFoundError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
