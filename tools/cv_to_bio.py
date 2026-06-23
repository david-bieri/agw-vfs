#!/usr/bin/env python3
"""
cv_to_bio.py — Turn a member CV into (a) a standardized bilingual bio and
(b) a list of extracted publications ready for agw_member_pubs.js.

This is a *maintainer* tool, run by the host (David Bieri) on a CV that a
member has emailed in. It does NOT run on the website and does NOT expose any
API key publicly — the AI call happens locally using the sandbox's
OPENAI_API_KEY / OPENAI_API_BASE environment variables.

Design notes (per project guidance):
  • Platform-independent: uses an OpenAI-compatible endpoint. Point OPENAI_API_BASE
    at Manus / OpenAI / Azure / a local model — no code change needed.
  • Human-in-the-loop: output is a DRAFT. The host reviews, edits, and pastes.
  • Publications are emitted in the exact MEMBER_PUBS object shape; DOIs found in
    the CV are kept so you can later enrich them with tools/doi_expand.py.

────────────────────────────────────────────────────────────────────────────
USAGE
  # Plain-text CV:
  python3 tools/cv_to_bio.py path/to/cv.txt --member "Jane Doe"

  # PDF CV (needs `pdftotext`, part of poppler-utils — preinstalled):
  pdftotext path/to/cv.pdf - | python3 tools/cv_to_bio.py - --member "Jane Doe"

  # Choose a model and write JSON to a file:
  python3 tools/cv_to_bio.py cv.txt --member "Jane Doe" --model gpt-4o-mini --out jane.json
────────────────────────────────────────────────────────────────────────────
"""

import argparse
import json
import os
import re
import sys

THEME_IDS = [
    "classical", "smith", "austrian", "keynesian", "monetary", "ordoliberal",
    "historical", "marxian", "cameralism", "evolutionary", "distribution",
    "public_finance", "methodology", "econ_history", "feminist", "general",
]

SYSTEM = (
    "You are an editorial assistant for an academic society (the AGW, the German "
    "committee for the history of economic thought). You convert a scholar's CV "
    "into a clean, factual, standardized profile. Never invent facts. If a field "
    "is unknown, leave it empty. Write in a neutral, scholarly register."
)

USER_TEMPLATE = """\
Below is the CV of an AGW member named "{member}".

Produce STRICT JSON (no markdown, no commentary) with this exact schema:
{{
  "bio_de": "<3-4 sentence biography in German>",
  "bio_en": "<3-4 sentence biography in English>",
  "affiliation": "<current institution>",
  "publications": [
    {{
      "title": "<publication title>",
      "authors": "<authors separated by ' · '>",
      "venue": "<journal or publisher>",
      "year": <integer or null>,
      "doi": "<doi if present in CV, else empty string>",
      "themes": ["<one or more of: {themes}>"]
    }}
  ]
}}

Rules:
- Extract at most the 15 most significant publications (books, articles, edited volumes).
- Choose theme ids ONLY from this list: {themes}. Use "general" if unsure.
- Keep titles in their original language.
- Do not fabricate DOIs; only include DOIs literally present in the CV.

CV TEXT:
\"\"\"
{cv}
\"\"\"
"""


def read_cv(path):
    if path == "-":
        return sys.stdin.read()
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def call_llm(cv_text, member, model):
    try:
        from openai import OpenAI
    except ImportError:
        sys.exit("Please install the OpenAI client:  pip3 install openai")

    # API key + base URL are pre-configured in the sandbox environment.
    client = OpenAI()
    prompt = USER_TEMPLATE.format(member=member, cv=cv_text[:24000], themes=", ".join(THEME_IDS))
    messages = [{"role": "system", "content": SYSTEM},
                {"role": "user", "content": prompt}]

    def _extract(resp):
        if not resp or not getattr(resp, "choices", None):
            return None
        msg = resp.choices[0].message
        return getattr(msg, "content", None)

    # First try with JSON mode (supported by most OpenAI-compatible backends).
    try:
        resp = client.chat.completions.create(
            model=model, messages=messages,
            response_format={"type": "json_object"},
        )
        content = _extract(resp)
        if content:
            return content
    except Exception:
        pass

    # Fallback: plain call without response_format (some models reject it or
    # return content in a different field).
    resp = client.chat.completions.create(model=model, messages=messages)
    content = _extract(resp)
    if not content:
        raise RuntimeError(
            "The model returned no text content. Try a different --model "
            "(e.g. gpt-5, claude-sonnet-4-6).")
    return content


def to_member_pubs_js(member, data):
    """Render the publications array as paste-ready JS objects."""
    out = []
    for p in data.get("publications", []):
        themes = ", ".join("'%s'" % t for t in (p.get("themes") or ["general"]))
        title = (p.get("title") or "").replace("'", "\\'")
        authors = (p.get("authors") or member).replace("'", "\\'")
        venue = (p.get("venue") or "").replace("'", "\\'")
        year = p.get("year")
        doi = (p.get("doi") or "").strip()
        line = "  { member:'%s', themes:[%s],\n    title:'%s',\n    authors:'%s',\n" % (
            member.replace("'", "\\'"), themes, title, authors)
        tail = "    venue:'%s'%s" % (venue, (", year:%d" % year) if isinstance(year, int) else "")
        if doi:
            line += tail + ",\n    doi:'%s' }," % doi.replace("'", "\\'")
        else:
            line += tail + " },"
        out.append(line)
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description="Convert a CV into a standardized bio + publications.")
    ap.add_argument("cv", help="Path to a plain-text CV, or '-' to read stdin")
    ap.add_argument("--member", required=True, help="Member full name")
    ap.add_argument("--model", default=os.environ.get("AGW_CV_MODEL", "gpt-5-mini"),
                    help="Chat model name (default: gpt-5-mini; e.g. gpt-5, claude-sonnet-4-6)")
    ap.add_argument("--out", help="Optional path to write the raw JSON")
    args = ap.parse_args()

    cv_text = read_cv(args.cv)
    if not cv_text.strip():
        sys.exit("CV text is empty.")

    raw = call_llm(cv_text, args.member, args.model)
    # Tolerate models that wrap JSON in ```json fences or add stray prose.
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\n?|\n?```$", "", cleaned).strip()
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", cleaned, re.S)
        if m:
            try:
                data = json.loads(m.group(0))
            except json.JSONDecodeError:
                data = None
        else:
            data = None
        if data is None:
            print("⚠ Model did not return valid JSON. Raw output:\n")
            print(raw)
            sys.exit(1)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    print("=" * 76)
    print("STANDARDIZED BIO (review before publishing)")
    print("=" * 76)
    print("Affiliation:", data.get("affiliation", ""))
    print("\n[DE]\n" + data.get("bio_de", ""))
    print("\n[EN]\n" + data.get("bio_en", ""))
    print("\n" + "=" * 76)
    print("PUBLICATIONS — paste into MEMBER_PUBS in agw_member_pubs.js")
    print("(tip: enrich DOIs afterwards with tools/doi_expand.py)")
    print("=" * 76)
    print(to_member_pubs_js(args.member, data))


if __name__ == "__main__":
    main()
