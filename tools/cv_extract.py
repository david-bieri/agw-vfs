#!/usr/bin/env python3
"""
cv_extract.py — turn an unstructured member submission into MEMBER_PUBS entries.

Replaces tools/cv_to_bio.py. Two deliberate differences:

  1. IT DOES NOT WRITE BIOGRAPHIES.
     Generating prose about a real, living, named colleague and publishing it
     under the committee's name is not a risk worth taking: a fluent, confident,
     subtly-wrong sentence about Bertram Schefold's career is both a DSGVO
     Art. 5(1)(d) accuracy problem and a collegial one, and it is exactly the
     kind of error that survives review because it *reads* correct.
     The site links to the member's own institutional page instead, and shows
     the research foci already held in MEMBERS. That decision is settled; do
     not reintroduce bio generation here.

  2. It emits the current schema (`mid` + `type`), not the pre-v53 one.

WHEN TO USE IT
──────────────
Only when a member sends something a machine cannot read: a PDF CV, a Word
file, a wall of text pasted into an email. If they send an ORCID iD or DOIs,
use tools/pubs_import.py instead — it is deterministic and needs no model.

Transcription is the real bottleneck in this workflow. This is the tool for it.

────────────────────────────────────────────────────────────────────────────
USAGE
  python3 tools/cv_extract.py submission.txt --mid horn-karen

  # PDF (poppler-utils):
  pdftotext cv.pdf - | python3 tools/cv_extract.py - --mid klausinger-hansjoerg

  # Pick a model / cap the harvest:
  python3 tools/cv_extract.py cv.txt --mid kurz-heinz-d --model gpt-4o-mini --max 20

Reads OPENAI_API_KEY / OPENAI_API_BASE from the environment. The call is made
from your machine; nothing touches the website and no key is ever published.

────────────────────────────────────────────────────────────────────────────
DATA HYGIENE — NOT OPTIONAL
A CV is personal data, and often more of it than you need (private address,
date of birth, family status). Extract the publications, paste them, then
DELETE THE FILE AND THE EMAIL. The tool reminds you at the end of every run.
Do not build an archive of member CVs; you have no basis for keeping one.
────────────────────────────────────────────────────────────────────────────
"""

import argparse
import json
import os
import re
import sys

VALID_TYPES = ["article", "book", "chapter", "edited", "wp"]

THEME_IDS = [
    "classical", "smith", "austrian", "keynesian", "monetary", "ordoliberal",
    "historical", "marxian", "cameralism", "evolutionary", "distribution",
    "public_finance", "methodology", "econ_history", "feminist", "general",
]

SYSTEM = (
    "You are a bibliographic extraction assistant for the AGW, the standing committee "
    "for the history of economic thought in the Verein fuer Socialpolitik. You extract "
    "publication records from documents. You never invent facts. If a field is not "
    "present in the source, you leave it empty rather than guessing. You do not write "
    "prose, biographies, summaries, or evaluations of any kind."
)

USER_TEMPLATE = """\
Extract publications from the document below. Return STRICT JSON only — no markdown \
fences, no commentary.

Schema:
{{
  "publications": [
    {{
      "title":   "<title, in its original language>",
      "type":    "<one of: {types}>",
      "authors": "<authors separated by ' \u00b7 '; empty string if not stated>",
      "venue":   "<journal name, or publisher for books; empty string if not stated>",
      "year":    <integer, or null>,
      "doi":     "<DOI only if it appears literally in the document, else empty string>",
      "themes":  ["<one or two of: {themes}>"]
    }}
  ]
}}

Rules:
- At most {max} publications, most significant first (books and articles over abstracts,
  book reviews, blog posts, and conference presentations).
- NEVER fabricate a DOI. Only copy one that appears literally in the text.
- NEVER fabricate an author list, venue or year. Empty string / null is correct when absent.
- "type" must be exactly one of: {types}. An edited volume is "edited", not "book".
- "themes" must come only from: {themes}. Use ["general"] if genuinely unsure.
- Do NOT produce a biography, summary, or any prose. Publications only.

DOCUMENT:
\"\"\"
{doc}
\"\"\"
"""


def read_doc(path):
    if path == "-":
        return sys.stdin.read()
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def call_llm(doc, model, max_items):
    try:
        from openai import OpenAI
    except ImportError:
        sys.exit("Install the client first:  pip3 install openai")

    client = OpenAI()  # reads OPENAI_API_KEY / OPENAI_API_BASE from the environment
    prompt = USER_TEMPLATE.format(
        doc=doc[:24000], types=", ".join(VALID_TYPES),
        themes=", ".join(THEME_IDS), max=max_items)
    messages = [{"role": "system", "content": SYSTEM},
                {"role": "user", "content": prompt}]

    def content_of(resp):
        if not resp or not getattr(resp, "choices", None):
            return None
        return getattr(resp.choices[0].message, "content", None)

    try:
        c = content_of(client.chat.completions.create(
            model=model, messages=messages, response_format={"type": "json_object"}))
        if c:
            return c
    except Exception:
        pass  # backend may reject response_format; fall through

    c = content_of(client.chat.completions.create(model=model, messages=messages))
    if not c:
        sys.exit("The model returned no content. Try a different --model.")
    return c


def parse_json(raw):
    s = raw.strip()
    if s.startswith("```"):
        s = re.sub(r"^```[a-zA-Z]*\n?|\n?```$", "", s).strip()
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", s, re.S)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                pass
    print("\u26a0 The model did not return valid JSON. Raw output:\n", file=sys.stderr)
    print(raw)
    sys.exit(1)


def js_str(s):
    s = str(s or "").replace("\n", " ").strip()
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def to_entry(p, mid):
    title = (p.get("title") or "").strip()
    if not title:
        return None

    ptype = p.get("type")
    themes = [t for t in (p.get("themes") or []) if t in THEME_IDS][:2] or ["general"]
    year = p.get("year") if isinstance(p.get("year"), int) else None
    doi = (p.get("doi") or "").strip()
    authors = (p.get("authors") or "").strip()
    venue = (p.get("venue") or "").strip()

    warn = ["EXTRACTED BY MODEL \u2014 verify"]
    if ptype not in VALID_TYPES:
        warn.append("type unclear, defaulted to 'article'")
        ptype = "article"
    if not year:
        warn.append("no year")
    if not authors:
        warn.append("no authors")
    if not venue:
        warn.append("no venue")

    lines = [
        "    { mid:%s, themes:[%s],   // %s" % (
            js_str(mid), ", ".join(js_str(t) for t in themes), "; ".join(warn)),
        "      title:%s, type:%s," % (js_str(title), js_str(ptype)),
        "      authors:%s, venue:%s, year:%s%s" % (
            js_str(authors), js_str(venue), year if year else "null",
            "," if doi else " },"),
    ]
    if doi:
        lines.append("      doi:%s }," % js_str(doi))
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("doc", help="path to a plain-text submission, or '-' for stdin")
    ap.add_argument("--mid", required=True,
                    help="member id slug from MEMBERS in agw_data.js (e.g. horn-karen)")
    ap.add_argument("--model", default=os.environ.get("AGW_CV_MODEL", "gpt-4o-mini"),
                    help="chat model (default: gpt-4o-mini)")
    ap.add_argument("--max", type=int, default=15, help="max publications to extract (default 15)")
    ap.add_argument("--out", help="optional path to write the raw JSON")
    a = ap.parse_args()

    doc = read_doc(a.doc)
    if not doc.strip():
        sys.exit("The document is empty.")

    data = parse_json(call_llm(doc, a.model, a.max))
    if a.out:
        with open(a.out, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    entries = [e for e in (to_entry(p, a.mid) for p in data.get("publications", [])) if e]
    if not entries:
        sys.exit("No publications extracted.")

    print("\n    // \u2500\u2500 %s \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" % a.mid)
    for e in entries:
        print(e)

    print("\n" + "\u2500" * 74, file=sys.stderr)
    print("%d entries extracted BY A LANGUAGE MODEL. Every one is a claim, not a fact:\n"
          "  \u2022 check each title, year, venue and DOI against the source\n"
          "  \u2022 a plausible-looking DOI that was not in the document is a hallucination\n"
          "  \u2022 themes are guesses \u2014 they are your scholarly judgement, not the model's\n"
          "Then paste into MEMBER_PUBS and run:  python3 tools/pubs_import.py --lint"
          % len(entries), file=sys.stderr)
    print("\n\u26a0 NOW DELETE THE SOURCE FILE AND THE EMAIL. A member's CV is personal data;\n"
          "  you have a basis to extract from it, not to keep it.", file=sys.stderr)
    print("\u2500" * 74, file=sys.stderr)


if __name__ == "__main__":
    main()
