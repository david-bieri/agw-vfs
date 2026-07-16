#!/usr/bin/env python3
"""
lineage_build.py — Lösch-manuscript → HET-lineage extraction (reconstructed)
═══════════════════════════════════════════════════════════════════════════
Reconstructs the deterministic extraction pipeline that fed the Stammbaum
(agw_lineage_data.js), from the LaTeX source of the Lösch correspondence
edition (loesch-briefe-metro / Bieri2026a, Band 53). The original run (June
2026) executed inline in a chat container and was never committed; this file
restores it as a durable, runnable artefact so the network is reproducible —
the same provenance discipline as agw_recover_extraction.py (ADR-020/037).

WHAT IS AND ISN'T AUTOMATED
───────────────────────────
The graph was built in four stages. Three are deterministic (recovered here);
the fourth is human + API curation and is DOCUMENTED, not regenerated — the
committed agw_lineage_data.js is its authored output, not a pure extract.

  Stage 1  NODES         deterministic  ── this script  (--extract)
  Stage 2  CORRESPONDENCE deterministic  ── this script  (--extract)
  Stage 3  LINEAGE CANDS  regex-seeded   ── this script  (--extract)
  Stage 4  CURATION+API   human + API    ── NOT automated (see docstring below)

Stage 4: candidates from stage 3 were classified (taught/examined/advised/
mentored/influenced/colleague) by an API pass and then hand-curated by DB into
the 59-figure / 79-edge dataset, each edge tagged with two-track evidence —
ev.t='ms' (manuscript, cite Bieri2026a + file location) or ev.t='ref'
(standard HET reference, to confirm). That curation is a scholarly act and is
NOT reproducible from the manuscript alone; it lives in agw_lineage_data.js.

USAGE
─────
  # Stage 1–3: extract the reproducible layers from the manuscript checkout
  python tools/lineage_build.py --extract \
      --manuscript /path/to/loesch-briefe-metro-main \
      --out-dir tools/lineage_extract/
    → lineage_nodes.csv          (persons, index frequency, bio locus)
    → lineage_correspondence.csv (dated directed letter edges + pairs)
    → lineage_candidates.csv     (regex-seeded lineage phrases for curation)

  # Close the citation loop: fold a filled worklist back into the data file
  python tools/lineage_build.py --merge-citations \
      --data agw_lineage_data.js \
      --worklist lineage_reference_edges.csv \
      --out agw_lineage_data.js
    → replaces the "std. HET reference — confirm" placeholder on each ref edge
      whose worklist row has a new_citation; leaves ms edges untouched.

The manuscript is NOT bundled (it's an unpublished edition). --extract needs a
local checkout of loesch-briefe-metro; --merge-citations needs only the repo.
"""
import sys, re, json, csv, argparse, unicodedata
from pathlib import Path
from collections import Counter, defaultdict

# ── Stage 1 — NODES from the people index ──────────────────────────────────
INDEX_RE = re.compile(r'\\index\[people\]\{([^}]*)\}')

def parse_index_entry(raw):
    """One \\index[people]{...} payload → (display_name, is_bio_locus).

    makeidx grammar used in the edition:
      sortkey@display            '@' separates sort key from printed form
      a!b                        '!' = sub-entry (rare for persons; keep leaf)
      ...|textbf / ...|textit    encapsulator: textbf = biographical locus,
                                 textit = footnote mention
    """
    encap = None
    if '|' in raw:
        raw, encap = raw.rsplit('|', 1)
    leaf = raw.split('!')[-1]                 # deepest sub-entry is the person
    display = leaf.split('@', 1)[1] if '@' in leaf else leaf
    display = display.strip()
    is_locus = (encap or '').strip().startswith('textbf')
    return display, is_locus

def norm_key(display):
    """Normalize to a 'Surname, Forename' key, umlauts preserved."""
    d = display.replace('\\', '').strip()
    d = re.sub(r'\s+', ' ', d)
    return unicodedata.normalize('NFC', d)

def stage1_nodes(ms):
    tex = list(ms.glob('letters/*.tex')) + list(ms.glob('chapters/*.tex')) + list(ms.glob('*.tex'))
    freq, locus = Counter(), {}
    for f in tex:
        blob = f.read_text(encoding='utf-8', errors='replace')
        for m in INDEX_RE.finditer(blob):
            disp, is_locus = parse_index_entry(m.group(1))
            if not disp:
                continue
            key = norm_key(disp)
            freq[key] += 1
            if is_locus and key not in locus:
                locus[key] = f.name
    rows = [{'person': k, 'index_freq': c, 'bio_locus_file': locus.get(k, '')}
            for k, c in freq.most_common()]
    return rows

# ── Stage 2 — CORRESPONDENCE from letter section headers ───────────────────
SECTION_RE = re.compile(r'\\section\*?\{([^}]*)\}')
# "Sender an Recipient. Ort, Datum"   (German 'an' = 'to')
HEADER_RE  = re.compile(r'^(.*?)\s+an\s+(.*?)\.\s*(.*)$')
YEAR_RE    = re.compile(r'\b(1[89]\d{2}|20\d{2})\b')

def stage2_correspondence(ms):
    letters, parsed, dated = [], 0, 0
    total = 0
    for f in sorted(ms.glob('letters/*.tex')):
        for line in f.read_text(encoding='utf-8', errors='replace').splitlines():
            m = SECTION_RE.search(line)
            if not m:
                continue
            total += 1
            title = m.group(1).strip()
            hm = HEADER_RE.match(title)
            if not hm:
                letters.append({'sender': '', 'recipient': '', 'place_date': title,
                                'year': '', 'file': f.name, 'parsed': 'NO'})
                continue
            parsed += 1
            sender, recip, pd = (g.strip() for g in hm.groups())
            ym = YEAR_RE.search(pd)
            if ym: dated += 1
            letters.append({'sender': sender, 'recipient': recip, 'place_date': pd,
                            'year': ym.group(1) if ym else '', 'file': f.name, 'parsed': 'YES'})
    pairs = Counter((l['sender'], l['recipient']) for l in letters if l['parsed'] == 'YES')
    stats = {'section_headers': total, 'parsed': parsed, 'dated': dated,
             'distinct_pairs': len(pairs)}
    return letters, pairs, stats

# ── Stage 3 — LINEAGE CANDIDATES from fixed phrasings ──────────────────────
# The bios/footnotes state lineage in stock formulas; these seed the API pass.
PHRASES = [
    r'Promotion bei', r'promovierte bei', r'Habilitation bei', r'habilitierte(?:\s+sich)? bei',
    r'Studium (?:der [^.]*?)?bei', r'studierte bei', r'Assistent(?:in)? bei',
    r'Sch[üu]ler(?:in)? von', r'Erstgutachter', r'Zweitgutachter', r'Gutachter',
    r'Vertrauensdozent', r'Doktorvater', r'Lehrer von', r'unter [A-ZÄÖÜ][a-zäöü]+ (?:promoviert|habilitiert)',
]
PHRASE_RE = re.compile('(' + '|'.join(PHRASES) + r')(.{0,80})', re.S)

def stage3_candidates(ms):
    files = (list(ms.glob('*.tex')) + list(ms.glob('chapters/*.tex')) +
             list(ms.glob('letters/*.tex')))
    out = []
    for f in files:
        blob = f.read_text(encoding='utf-8', errors='replace')
        for m in PHRASE_RE.finditer(blob):
            ctx = re.sub(r'\s+', ' ', (m.group(1) + m.group(2))).strip()
            out.append({'trigger': m.group(1), 'context': ctx, 'file': f.name})
    return out

def write_csv(path, rows, cols):
    with open(path, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=cols); w.writeheader(); w.writerows(rows)

def cmd_extract(args):
    ms = args.manuscript
    if not ms or not ms.exists():
        sys.exit("ERROR: --manuscript must point at a loesch-briefe-metro checkout")
    out = args.out_dir; out.mkdir(parents=True, exist_ok=True)

    nodes = stage1_nodes(ms)
    write_csv(out / 'lineage_nodes.csv', nodes, ['person', 'index_freq', 'bio_locus_file'])

    letters, pairs, stats = stage2_correspondence(ms)
    write_csv(out / 'lineage_correspondence.csv', letters,
              ['sender', 'recipient', 'place_date', 'year', 'file', 'parsed'])
    prows = [{'sender': s, 'recipient': r, 'n_letters': c} for (s, r), c in pairs.most_common()]
    write_csv(out / 'lineage_correspondence_pairs.csv', prows, ['sender', 'recipient', 'n_letters'])

    cands = stage3_candidates(ms)
    write_csv(out / 'lineage_candidates.csv', cands, ['trigger', 'context', 'file'])

    print(f"Stage 1 — nodes:          {len(nodes)} persons  → lineage_nodes.csv")
    print(f"Stage 2 — correspondence: {stats['section_headers']} headers, "
          f"{stats['parsed']} parsed, {stats['dated']} dated, "
          f"{stats['distinct_pairs']} pairs  → lineage_correspondence*.csv")
    print(f"Stage 3 — candidates:     {len(cands)} lineage phrases  → lineage_candidates.csv")
    print("\nStage 4 (curation + API → agw_lineage_data.js) is NOT run here — see module docstring.")

# ── citation loop: fold a filled worklist back into the data file ──────────
def load_lineage(js_path):
    src = js_path.read_text(encoding='utf-8')
    i = src.index('AGW.LINEAGE'); j = src.index('{', i); depth = 0
    for k in range(j, len(src)):
        if src[k] == '{': depth += 1
        elif src[k] == '}':
            depth -= 1
            if depth == 0: end = k + 1; break
    return src, j, end, json.loads(src[j:end])

def cmd_merge_citations(args):
    src, j, end, L = load_lineage(args.data)
    fills = {}
    with open(args.worklist, encoding='utf-8') as fh:
        for row in csv.DictReader(fh):
            cite = (row.get('new_citation') or '').strip()
            if cite:
                fills[(row['src_id'], row['tgt_id'])] = cite
    changed = 0
    for e in L['edges']:
        ev0 = (e.get('ev') or [{}])[0]
        if ev0.get('t') == 'ref' and (e['s'], e['t']) in fills:
            ev0['cite'] = fills[(e['s'], e['t'])]; changed += 1
    body = json.dumps(L, ensure_ascii=False, indent=1)
    out = src[:j] + body + src[end:]
    args.out.write_text(out, encoding='utf-8')
    print(f"merged {changed} citation(s) into {args.out.name}; "
          f"{len(fills)-changed} worklist fill(s) had no matching ref edge")

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument('--extract', action='store_true', help='Stage 1–3 manuscript extraction')
    mode.add_argument('--merge-citations', action='store_true', dest='merge', help='fold worklist citations into the data file')
    ap.add_argument('--manuscript', type=Path, help='loesch-briefe-metro checkout (for --extract)')
    ap.add_argument('--out-dir', type=Path, default=Path('tools/lineage_extract'))
    ap.add_argument('--data', type=Path, default=Path('agw_lineage_data.js'))
    ap.add_argument('--worklist', type=Path, default=Path('lineage_reference_edges.csv'))
    ap.add_argument('--out', type=Path, default=Path('agw_lineage_data.js'))
    args = ap.parse_args()
    cmd_extract(args) if args.extract else cmd_merge_citations(args)

if __name__ == '__main__':
    main()
